// src/routes/admin/persetujuan/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, syncGarageStatuses } from '#lib/server/db/index.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/auth/login');
	}

	const today = new Date().toISOString().split('T')[0];
	syncGarageStatuses(today);

	// 1. Permohonan sewa baru yang menunggu persetujuan (status = 'pending')
	const pendingRentals = db.prepare(`
		SELECT 
			r.*,
			u.name as tenant_name,
			u.email as tenant_email,
			u.phone as tenant_phone,
			u.nik as tenant_nik,
			g.code as garage_code,
			g.type as garage_type,
			g.daily_price as garage_daily_price,
			g.car_type
		FROM rentals r
		JOIN users u ON r.user_id = u.id
		JOIN garages g ON r.garage_id = g.id
		WHERE r.status = 'pending'
		ORDER BY r.id DESC
	`).all() as any[];

	// 2. Permintaan perpanjangan sewa dari customer (status = 'pending')
	const pendingExtensions = db.prepare(`
		SELECT 
			e.*,
			r.garage_id,
			r.vehicle_brand_model,
			r.license_plate,
			r.rental_type,
			r.start_date as rental_start_date,
			u.name as tenant_name,
			u.email as tenant_email,
			u.phone as tenant_phone,
			u.nik as tenant_nik,
			g.code as garage_code,
			g.daily_price as garage_daily_price
		FROM rental_extensions e
		JOIN rentals r ON e.rental_id = r.id
		JOIN users u ON r.user_id = u.id
		JOIN garages g ON r.garage_id = g.id
		WHERE e.status = 'pending'
		ORDER BY e.id DESC
	`).all() as any[];

	// 3. Sewa yang saat ini aktif berjalan
	const activeRentals = db.prepare(`
		SELECT 
			r.*,
			u.name as tenant_name,
			u.email as tenant_email,
			u.phone as tenant_phone,
			g.code as garage_code
		FROM rentals r
		JOIN users u ON r.user_id = u.id
		JOIN garages g ON r.garage_id = g.id
		WHERE r.status = 'active'
		ORDER BY r.end_date DESC
	`).all() as any[];

	return {
		pendingRentals,
		pendingExtensions,
		activeRentals,
		today
	};
};

export const actions: Actions = {
	approveRental: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const data = await request.formData();
		const rentalId = parseInt(data.get('rentalId')?.toString() || '0', 10);

		if (!rentalId) {
			return fail(400, { error: 'ID transaksi tidak valid' });
		}

		const rental = db.prepare('SELECT * FROM rentals WHERE id = ?').get(rentalId) as any;
		if (!rental) {
			return fail(404, { error: 'Data rental tidak ditemukan' });
		}

		const today = new Date().toISOString().split('T')[0];

		// Ubah status sewa menjadi 'active'
		db.prepare("UPDATE rentals SET status = 'active' WHERE id = ?").run(rentalId);

		// Sinkronkan status garasi secara otomatis
		syncGarageStatuses(today);

		return {
			success: true,
			message: `Permohonan sewa untuk ${rental.vehicle_brand_model} (${rental.license_plate || 'Bebas Plat'}) berhasil di-ACC (Disetujui).`
		};
	},

	rejectRental: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const data = await request.formData();
		const rentalId = parseInt(data.get('rentalId')?.toString() || '0', 10);

		if (!rentalId) {
			return fail(400, { error: 'ID transaksi tidak valid' });
		}

		const rental = db.prepare('SELECT * FROM rentals WHERE id = ?').get(rentalId) as any;
		if (!rental) {
			return fail(404, { error: 'Data rental tidak ditemukan' });
		}

		db.prepare("UPDATE rentals SET status = 'rejected' WHERE id = ?").run(rentalId);

		return {
			success: true,
			message: `Permohonan sewa untuk ${rental.vehicle_brand_model} telah ditolak.`
		};
	},

	approveExtension: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak' });
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

		const rental = db.prepare('SELECT * FROM rentals WHERE id = ?').get(ext.rental_id) as any;
		if (!rental) {
			return fail(404, { error: 'Kontrak rental terkait tidak ditemukan' });
		}

		// Double check konflik sebelum ACC
		const collision = db.prepare(`
			SELECT id, start_date, end_date FROM rentals
			WHERE garage_id = ?
			  AND id != ?
			  AND status IN ('pending', 'active')
			  AND NOT (end_date <= ? OR start_date >= ?)
			LIMIT 1
		`).get(rental.garage_id, rental.id, ext.old_end_date, ext.new_end_date) as any;

		if (collision) {
			return fail(400, {
				error: `Tidak dapat di-ACC: Unit telah dipesan oleh rental lain pada rentang ${collision.start_date} s/d ${collision.end_date}.`
			});
		}

		// Update extension status
		db.prepare("UPDATE rental_extensions SET status = 'approved' WHERE id = ?").run(extensionId);

		// Perbarui tanggal selesai dan total biaya pada rental
		db.prepare(`
			UPDATE rentals 
			SET end_date = ?, total_cost = total_cost + ?
			WHERE id = ?
		`).run(ext.new_end_date, ext.additional_cost, rental.id);

		syncGarageStatuses();

		return {
			success: true,
			message: `Perpanjangan sewa berhasil di-ACC. Tanggal selesai baru kini menjadi ${ext.new_end_date}.`
		};
	},

	rejectExtension: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const data = await request.formData();
		const extensionId = parseInt(data.get('extensionId')?.toString() || '0', 10);

		if (!extensionId) {
			return fail(400, { error: 'ID perpanjangan tidak valid' });
		}

		db.prepare("UPDATE rental_extensions SET status = 'rejected' WHERE id = ?").run(extensionId);

		return {
			success: true,
			message: 'Permintaan perpanjangan sewa telah ditolak.'
		};
	}
};

