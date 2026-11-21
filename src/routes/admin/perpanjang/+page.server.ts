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

	// 1. Ambil seluruh permohonan perpanjangan sewa yang diajukan oleh penyewa (status = 'pending')
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

	// Deteksi apakah slot garasi tersebut sudah ada yang booking di hari setelah sewa penyewa berakhir
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

	// 2. Ambil riwayat persetujuan perpanjangan yang sudah diproses (approved / rejected)
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

	// 3. Info monitoring slot garasi yang saat ini sedang aktif disewa
	const activeRentedGarages = db.prepare(`
		SELECT 
			r.id as rental_id,
			r.start_date,
			r.end_date,
			r.vehicle_brand_model,
			r.license_plate,
			g.code as garage_code,
			g.type as garage_type,
			u.name as tenant_name
		FROM rentals r
		JOIN garages g ON r.garage_id = g.id
		JOIN users u ON r.user_id = u.id
		WHERE r.status = 'active'
		ORDER BY r.end_date ASC
	`).all() as any[];

	return {
		pendingExtensions,
		extensionHistory,
		activeRentedGarages,
		today
	};
};

export const actions: Actions = {
	// Admin MENYETUJUI (ACC) perpanjangan sewa dari customer
	// HANYA jika slot tersebut belum ada yang booking di tanggal setelah sewa berakhir
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

		// VALIDASI UTAMA: Cek apakah slot garasi sudah ada yang booking di hari setelah penyewa berakhir
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
