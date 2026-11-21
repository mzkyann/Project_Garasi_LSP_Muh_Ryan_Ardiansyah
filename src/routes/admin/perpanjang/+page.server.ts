// src/routes/admin/perpanjang/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, syncGarageStatuses } from '#lib/server/db/index.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/auth/login');
	}

	const today = new Date().toISOString().split('T')[0];
	syncGarageStatuses(today);

	// 1. DAFTAR GARASI YANG SEDANG DISEWA PADA HARI ITU (Spesifikasi FR.IA.04A)
	const activeRentedGarages = db.prepare(`
		SELECT 
			r.id as rental_id,
			r.garage_id,
			r.start_date,
			r.end_date,
			r.vehicle_brand_model,
			r.license_plate,
			r.vehicle_type,
			r.rental_type,
			r.total_cost,
			g.code as garage_code,
			g.type as garage_type,
			g.daily_price as garage_daily_price,
			u.name as tenant_name,
			u.phone as tenant_phone,
			u.nik as tenant_nik,
			u.email as tenant_email
		FROM rentals r
		JOIN garages g ON r.garage_id = g.id
		JOIN users u ON r.user_id = u.id
		WHERE r.status = 'active'
		  AND r.start_date <= ?
		  AND r.end_date > ?
		ORDER BY r.end_date ASC
	`).all(today, today) as any[];

	// Deteksi apakah pada slot tersebut sudah ada jadwal booking berikutnya
	for (const rent of activeRentedGarages) {
		const nextBooking = db.prepare(`
			SELECT 
				r.id, 
				r.start_date, 
				r.end_date, 
				u.name as booked_by_name, 
				r.vehicle_brand_model 
			FROM rentals r
			JOIN users u ON r.user_id = u.id
			WHERE r.garage_id = ?
			  AND r.id != ?
			  AND r.status IN ('pending', 'active')
			  AND r.start_date >= ?
			ORDER BY r.start_date ASC
			LIMIT 1
		`).get(rent.garage_id, rent.rental_id, rent.end_date) as any;

		rent.next_booking = nextBooking || null;
	}

	// 2. Permohonan perpanjangan sewa yang diajukan oleh penyewa (status = 'pending')
	const rawPendingExtensions = db.prepare(`
		SELECT 
			e.*,
			r.garage_id,
			r.vehicle_brand_model,
			r.license_plate,
			r.vehicle_type,
			r.rental_type,
			r.start_date as rental_start_date,
			u.name as tenant_name,
			u.nik as tenant_nik,
			u.phone as tenant_phone,
			u.email as tenant_email,
			g.code as garage_code,
			g.type as garage_type,
			g.daily_price as garage_daily_price
		FROM rental_extensions e
		JOIN rentals r ON e.rental_id = r.id
		JOIN users u ON r.user_id = u.id
		JOIN garages g ON r.garage_id = g.id
		WHERE e.status = 'pending'
		ORDER BY e.id DESC
	`).all() as any[];

	// Deteksi collision untuk request penyewa
	const pendingExtensions = rawPendingExtensions.map((ext) => {
		const collision = db.prepare(`
			SELECT 
				r.id, 
				r.start_date, 
				r.end_date, 
				r.vehicle_brand_model, 
				r.license_plate, 
				u.name as booked_by_name
			FROM rentals r
			JOIN users u ON r.user_id = u.id
			WHERE r.garage_id = ?
			  AND r.id != ?
			  AND r.status IN ('pending', 'active')
			  AND NOT (r.end_date <= ? OR r.start_date >= ?)
			LIMIT 1
		`).get(ext.garage_id, ext.rental_id, ext.old_end_date, ext.new_end_date) as any;

		return {
			...ext,
			hasCollision: Boolean(collision),
			collisionDetails: collision || null
		};
	});

	// 3. Riwayat perpanjangan yang sudah diproses (approved / rejected)
	const extensionHistory = db.prepare(`
		SELECT 
			e.*,
			r.garage_id,
			r.vehicle_brand_model,
			r.license_plate,
			u.name as tenant_name,
			g.code as garage_code
		FROM rental_extensions e
		JOIN rentals r ON e.rental_id = r.id
		JOIN users u ON r.user_id = u.id
		JOIN garages g ON r.garage_id = g.id
		WHERE e.status IN ('approved', 'rejected')
		ORDER BY e.id DESC
		LIMIT 25
	`).all() as any[];

	return {
		activeRentedGarages,
		pendingExtensions,
		extensionHistory,
		today
	};
};

export const actions: Actions = {
	// FITUR ADMIN: Perpanjang Status Sewa Garasi Langsung (Sesuai Soal Uji LSP FR.IA.04A)
	// - Menampilkan daftar garasi yang sedang disewa pada hari itu
	// - Admin memilih salah satu garasi
	// - Admin mengubah tanggal Selesai Sewa
	// - Aplikasi menghitung sisa biaya yang harus dibayarkan
	// - Admin mengunggah bukti bayar
	adminDirectExtend: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak memperpanjang status sewa' });
		}

		const data = await request.formData();
		const rentalId = parseInt(data.get('rentalId')?.toString() || '0', 10);
		const newEndDate = data.get('newEndDate')?.toString()?.trim();
		const proofFile = data.get('paymentProof') as File;

		if (!rentalId || !newEndDate) {
			return fail(400, { error: 'ID sewa dan tanggal selesai baru wajib diisi' });
		}

		const rental = db.prepare(`
			SELECT r.*, g.code as garage_code, g.daily_price as garage_daily_price
			FROM rentals r
			JOIN garages g ON r.garage_id = g.id
			WHERE r.id = ?
		`).get(rentalId) as any;

		if (!rental) {
			return fail(404, { error: 'Data kontrak sewa tidak ditemukan' });
		}

		if (newEndDate <= rental.end_date) {
			return fail(400, {
				error: `Tanggal selesai baru (${newEndDate}) harus lebih lama dari tanggal selesai saat ini (${rental.end_date})`
			});
		}

		// Hitung selisih hari & biaya tambahan
		const d1 = new Date(rental.end_date);
		const d2 = new Date(newEndDate);
		const diffTime = d2.getTime() - d1.getTime();
		const additionalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		const additionalCost = additionalDays * (rental.garage_daily_price || 0);

		// Proteksi Tabrakan Jadwal Booking (Sesuai Aturan Sistem)
		const collision = db.prepare(`
			SELECT 
				r.id, 
				r.start_date, 
				r.end_date, 
				u.name as booked_by_name, 
				r.vehicle_brand_model 
			FROM rentals r
			JOIN users u ON r.user_id = u.id
			WHERE r.garage_id = ?
			  AND r.id != ?
			  AND r.status IN ('pending', 'active')
			  AND NOT (r.end_date <= ? OR r.start_date >= ?)
			LIMIT 1
		`).get(rental.garage_id, rental.id, rental.end_date, newEndDate) as any;

		if (collision) {
			return fail(400, {
				error: `Perpanjangan TIDAK DAPAT DILAKUKAN! Slot garasi ${rental.garage_code} telah dibooking oleh ${collision.booked_by_name} (${collision.vehicle_brand_model}) pada periode ${collision.start_date} s/d ${collision.end_date}.`
			});
		}

		// Proses bukti pembayaran yang diunggah admin
		let paymentProofDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><rect width="240" height="120" fill="%2371856A"/><text x="15" y="65" fill="white" font-weight="bold" font-family="sans-serif" font-size="14">BUKTI BAYAR PERPANJANGAN</text></svg>';

		if (proofFile && proofFile.size > 0) {
			const buffer = await proofFile.arrayBuffer();
			const base64 = Buffer.from(buffer).toString('base64');
			paymentProofDataUrl = `data:${proofFile.type};base64,${base64}`;
		}

		const today = new Date().toISOString().split('T')[0];

		// Catat ke riwayat perpanjangan sewa (rental_extensions)
		db.prepare(`
			INSERT INTO rental_extensions (
				rental_id, old_end_date, new_end_date, additional_days, additional_cost, payment_proof, status, created_at
			) VALUES (?, ?, ?, ?, ?, ?, 'approved', ?)
		`).run(
			rental.id,
			rental.end_date,
			newEndDate,
			additionalDays,
			additionalCost,
			paymentProofDataUrl,
			new Date().toISOString()
		);

		// Perbarui tanggal selesai dan akumulasi total biaya pada tabel rentals
		db.prepare(`
			UPDATE rentals 
			SET end_date = ?, total_cost = total_cost + ?
			WHERE id = ?
		`).run(newEndDate, additionalCost, rental.id);

		// Sinkronkan status garasi
		syncGarageStatuses(today);

		return {
			success: true,
			message: `Berhasil memperpanjang status sewa slot ${rental.garage_code} (${rental.vehicle_brand_model}) sampai ${newEndDate} (+${additionalDays} hari). Sisa biaya tambahan Rp ${additionalCost.toLocaleString('id-ID')} telah tercatat lunas.`
		};
	},

	// Admin MENYETUJUI (ACC) perpanjangan sewa dari permohonan customer
	approveExtension: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak: Hanya admin yang berhak menyetujui perpanjangan sewa' });
		}

		const data = await request.formData();
		const extensionId = parseInt(data.get('extensionId')?.toString() || '0', 10);

		if (!extensionId) {
			return fail(400, { error: 'ID perpanjangan tidak valid' });
		}

		const ext = db.prepare('SELECT * FROM rental_extensions WHERE id = ?').get(extensionId) as any;
		if (!ext) {
			return fail(404, { error: 'Data permohonan perpanjangan tidak ditemukan' });
		}

		if (ext.status !== 'pending') {
			return fail(400, { error: `Permohonan ini sudah diproses sebelumnya dengan status: ${ext.status}` });
		}

		const rental = db.prepare(`
			SELECT r.*, g.code as garage_code
			FROM rentals r
			JOIN garages g ON r.garage_id = g.id
			WHERE r.id = ?
		`).get(ext.rental_id) as any;

		if (!rental) {
			return fail(404, { error: 'Kontrak sewa terkait tidak ditemukan di sistem' });
		}

		// Validasi tabrakan jadwal booking
		const collision = db.prepare(`
			SELECT 
				r.id, 
				r.start_date, 
				r.end_date, 
				u.name as booked_by_name, 
				r.vehicle_brand_model 
			FROM rentals r
			JOIN users u ON r.user_id = u.id
			WHERE r.garage_id = ?
			  AND r.id != ?
			  AND r.status IN ('pending', 'active')
			  AND NOT (r.end_date <= ? OR r.start_date >= ?)
			LIMIT 1
		`).get(rental.garage_id, rental.id, ext.old_end_date, ext.new_end_date) as any;

		if (collision) {
			return fail(400, {
				error: `Perpanjangan TIDAK DAPAT DISETUJUI! Slot garasi ${rental.garage_code} telah dibooking oleh ${collision.booked_by_name} (${collision.vehicle_brand_model}) pada periode ${collision.start_date} s/d ${collision.end_date}.`
			});
		}

		const today = new Date().toISOString().split('T')[0];

		// 1. Update status permohonan perpanjangan menjadi 'approved'
		db.prepare("UPDATE rental_extensions SET status = 'approved' WHERE id = ?").run(extensionId);

		// 2. Perbarui tanggal selesai kontrak sewa dan total biaya pada tabel rentals
		db.prepare(`
			UPDATE rentals 
			SET end_date = ?, total_cost = total_cost + ?
			WHERE id = ?
		`).run(ext.new_end_date, ext.additional_cost, rental.id);

		// 3. Sinkronkan status garasi
		syncGarageStatuses(today);

		return {
			success: true,
			message: `Permohonan perpanjangan sewa slot ${rental.garage_code} berhasil di-ACC (Disetujui). Tanggal selesai baru kini menjadi ${ext.new_end_date} (+${ext.additional_days} hari).`
		};
	},

	// Admin MENOLAK perpanjangan sewa dari customer
	rejectExtension: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak: Hanya admin yang berhak menolak perpanjangan sewa' });
		}

		const data = await request.formData();
		const extensionId = parseInt(data.get('extensionId')?.toString() || '0', 10);

		if (!extensionId) {
			return fail(400, { error: 'ID perpanjangan tidak valid' });
		}

		const ext = db.prepare('SELECT * FROM rental_extensions WHERE id = ?').get(extensionId) as any;
		if (!ext) {
			return fail(404, { error: 'Data perpanjangan tidak ditemukan' });
		}

		db.prepare("UPDATE rental_extensions SET status = 'rejected' WHERE id = ?").run(extensionId);

		return {
			success: true,
			message: 'Permohonan perpanjangan sewa dari penyewa telah ditolak.'
		};
	}
};
