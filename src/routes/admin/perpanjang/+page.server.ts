// src/routes/admin/perpanjang/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { Buffer } from 'node:buffer';
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.js';
import { RentalCalculator } from '#lib/server/domain/RentalCalculator.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/auth/login');
	}

	const today = new Date().toISOString().split('T')[0];

	// Ambil daftar garasi yang sedang disewa pada hari itu (status rental = active dan garasi used)
	const activeRentedGarages = db.prepare(`
		SELECT 
			r.id as rental_id,
			r.user_id,
			r.garage_id,
			r.vehicle_type,
			r.vehicle_brand_model,
			r.license_plate,
			r.start_date,
			r.end_date,
			r.total_cost,
			g.code as garage_code,
			g.type as garage_type,
			g.daily_price as garage_daily_price,
			u.name as tenant_name,
			u.phone as tenant_phone,
			u.email as tenant_email
		FROM rentals r
		JOIN garages g ON r.garage_id = g.id
		JOIN users u ON r.user_id = u.id
		WHERE r.status = 'active' AND g.status = 'used'
		ORDER BY r.end_date ASC
	`).all() as any[];

	// Ambil riwayat perpanjangan sebelumnya
	const extensionHistory = db.prepare(`
		SELECT 
			re.*,
			g.code as garage_code,
			u.name as tenant_name
		FROM rental_extensions re
		JOIN rentals r ON re.rental_id = r.id
		JOIN garages g ON r.garage_id = g.id
		JOIN users u ON r.user_id = u.id
		ORDER BY re.id DESC
		LIMIT 20
	`).all() as any[];

	return {
		activeRentedGarages,
		extensionHistory,
		today
	};
};

export const actions: Actions = {
	extendRental: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const data = await request.formData();
		const rentalId = parseInt(data.get('rentalId')?.toString() || '0', 10);
		const newEndDate = data.get('newEndDate')?.toString();
		const proofFile = data.get('paymentProof') as File;

		if (!rentalId || !newEndDate) {
			return fail(400, { error: 'Pilih garasi dan tanggal selesai sewa baru' });
		}

		// Ambil rental dan garasi
		const rental = db.prepare(`
			SELECT r.*, g.daily_price, g.code
			FROM rentals r
			JOIN garages g ON r.garage_id = g.id
			WHERE r.id = ? AND r.status = 'active'
		`).get(rentalId) as any;

		if (!rental) {
			return fail(404, { error: 'Data sewa garasi aktif tidak ditemukan' });
		}

		// Hitung biaya perpanjangan dengan domain OOP
		let extensionBreakdown;
		try {
			extensionBreakdown = RentalCalculator.calculateExtensionCost(
				rental.end_date,
				newEndDate,
				rental.daily_price
			);
		} catch (err: any) {
			return fail(400, { error: err.message });
		}

		// Proses bukti bayar perpanjangan
		let paymentProofDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="%232563eb"/><text x="10" y="55" fill="white">BUKTI PERPANJANGAN</text></svg>';

		if (proofFile && proofFile.size > 0) {
			const buffer = await proofFile.arrayBuffer();
			const base64 = Buffer.from(buffer).toString('base64');
			paymentProofDataUrl = `data:${proofFile.type};base64,${base64}`;
		}

		const now = new Date().toISOString();

		// Update database
		const insertExtension = db.prepare(`
			INSERT INTO rental_extensions (
				rental_id, old_end_date, new_end_date, additional_days, additional_cost, payment_proof, created_at
			) VALUES (?, ?, ?, ?, ?, ?, ?)
		`);

		const updateRental = db.prepare(`
			UPDATE rentals 
			SET end_date = ?, total_cost = total_cost + ?
			WHERE id = ?
		`);

		insertExtension.run(
			rental.id,
			rental.end_date,
			newEndDate,
			extensionBreakdown.additionalDays,
			extensionBreakdown.additionalCost,
			paymentProofDataUrl,
			now
		);

		updateRental.run(newEndDate, extensionBreakdown.additionalCost, rental.id);

		return {
			success: true,
			message: `Masa sewa garasi ${rental.code} berhasil diperpanjang hingga ${newEndDate} (+${extensionBreakdown.additionalDays} hari, biaya tambahan: Rp ${extensionBreakdown.additionalCost.toLocaleString('id-ID')}).`
		};
	}
};
