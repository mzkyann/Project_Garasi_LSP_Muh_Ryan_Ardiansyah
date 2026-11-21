// src/routes/penyewa/riwayat/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { Buffer } from 'node:buffer';
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

	const today = new Date().toISOString().split('T')[0];

	const rentals = db.prepare(`
		SELECT 
			r.*,
			g.code as garage_code,
			g.type as garage_type,
			g.daily_price as garage_daily_price
		FROM rentals r
		JOIN garages g ON r.garage_id = g.id
		WHERE r.user_id = ?
		ORDER BY r.id DESC
	`).all(locals.user.id) as any[];

	// Ambil riwayat ekstensi dan booking lain pada unit yang sama
	const rentalsWithDetails = rentals.map((rental) => {
		const extensions = db.prepare(`
			SELECT * FROM rental_extensions WHERE rental_id = ? ORDER BY id DESC
		`).all(rental.id) as any[];

		// Cek apakah ada permohonan perpanjangan yang masih pending
		const pendingExtension = extensions.find((e) => e.status === 'pending') || null;

		// Ambil semua booking lain pada mobil ini untuk deteksi jadwal bentrok di front-end
		const otherBookings = db.prepare(`
			SELECT id, start_date, end_date FROM rentals
			WHERE garage_id = ?
			  AND id != ?
			  AND status IN ('pending', 'active')
			ORDER BY start_date ASC
		`).all(rental.garage_id, rental.id) as any[];

		return {
			...rental,
			extensions,
			pendingExtension,
			otherBookings
		};
	});

	return {
		rentals: rentalsWithDetails,
		today
	};
};

export const actions: Actions = {
	requestExtension: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'penyewa') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const data = await request.formData();
		const rentalId = parseInt(data.get('rentalId')?.toString() || '0', 10);
		const newEndDate = data.get('newEndDate')?.toString()?.trim();
		const proofFile = data.get('extensionPaymentProof') as File;

		if (!rentalId || !newEndDate) {
			return fail(400, { error: 'ID sewa dan tanggal selesai baru wajib diisi' });
		}

		const rental = db.prepare(`
			SELECT r.*, g.daily_price as garage_daily_price
			FROM rentals r
			JOIN garages g ON r.garage_id = g.id
			WHERE r.id = ? AND r.user_id = ?
		`).get(rentalId, locals.user.id) as any;

		if (!rental) {
			return fail(404, { error: 'Data kontrak sewa tidak ditemukan' });
		}

		if (rental.status !== 'active') {
			return fail(400, { error: 'Hanya sewa yang berstatus aktif yang dapat diajukan perpanjangan' });
		}

		// Validasi tanggal selesai baru harus lebih besar dari tanggal selesai saat ini
		const oldEnd = new Date(rental.end_date);
		const newEnd = new Date(newEndDate);

		if (isNaN(newEnd.getTime()) || newEnd <= oldEnd) {
			return fail(400, { error: `Tanggal baru harus lebih besar daripada tanggal selesai kontrak (${rental.end_date})` });
		}

		// Validasi apakah mobil sudah dibooking oleh penyewa lain pada periode yang ingin diperpanjang
		const collision = db.prepare(`
			SELECT id, start_date, end_date FROM rentals
			WHERE garage_id = ?
			  AND id != ?
			  AND status IN ('pending', 'active')
			  AND NOT (end_date <= ? OR start_date >= ?)
			LIMIT 1
		`).get(rental.garage_id, rental.id, rental.end_date, newEndDate) as any;

		if (collision) {
			return fail(400, {
				error: `Mobil ini telah dibooking oleh penyewa lain pada periode ${collision.start_date} s/d ${collision.end_date}, sehingga otomatis tidak dapat diperpanjang ke tanggal tersebut.`
			});
		}

		// Hitung selisih hari dan biaya tambahan
		const diffTime = newEnd.getTime() - oldEnd.getTime();
		const additionalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		const additionalCost = additionalDays * rental.garage_daily_price;

		// Proses bukti pembayaran tambahan
		let paymentProofDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="%2371856A"/><text x="10" y="55" fill="white" font-weight="bold">BUKTI PERPANJANGAN</text></svg>';

		if (proofFile && proofFile.size > 0) {
			const buffer = await proofFile.arrayBuffer();
			const base64 = Buffer.from(buffer).toString('base64');
			paymentProofDataUrl = `data:${proofFile.type};base64,${base64}`;
		}

		const now = new Date().toISOString();

		// Simpan permintaan perpanjangan dengan status 'pending' (menunggu ACC Admin)
		db.prepare(`
			INSERT INTO rental_extensions (
				rental_id, old_end_date, new_end_date, additional_days, additional_cost, payment_proof, status, created_at
			) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
		`).run(
			rental.id,
			rental.end_date,
			newEndDate,
			additionalDays,
			additionalCost,
			paymentProofDataUrl,
			now
		);

		return {
			success: true,
			message: `Permintaan perpanjangan sewa hingga ${newEndDate} (+${additionalDays} hari) berhasil dikirim. Menunggu persetujuan (ACC) dari Admin.`
		};
	}
};
