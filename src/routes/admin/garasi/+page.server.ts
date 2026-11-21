// src/routes/admin/garasi/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.js';
import { GarageCodeGenerator } from '#lib/server/domain/GarageCodeGenerator.js';
import type { GarageType } from '#lib/server/domain/Garage.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/auth/login');
	}

	// Hitung sequence number saat ini untuk masing-masing tipe garasi
	const seqSepeda = db.prepare("SELECT COUNT(*) as count FROM garages WHERE type = 'sepeda'").get() as { count: number };
	const seqMobil = db.prepare("SELECT COUNT(*) as count FROM garages WHERE type = 'mobil'").get() as { count: number };
	const seqListrik = db.prepare("SELECT COUNT(*) as count FROM garages WHERE type = 'mobil_listrik'").get() as { count: number };

	// Daftar seluruh garasi
	const garages = db.prepare(`
		SELECT 
			g.*,
			(SELECT COUNT(*) FROM rentals r WHERE r.garage_id = g.id) as total_rentals
		FROM garages g
		ORDER BY g.type, g.code ASC
	`).all() as any[];

	return {
		garages,
		sequences: {
			sepeda: seqSepeda.count,
			mobil: seqMobil.count,
			mobil_listrik: seqListrik.count
		}
	};
};

export const actions: Actions = {
	createBatchGarages: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak membuat garasi baru' });
		}

		const data = await request.formData();
		const type = data.get('type')?.toString() as GarageType;
		const count = parseInt(data.get('count')?.toString() || '0', 10);
		const dailyPrice = parseFloat(data.get('dailyPrice')?.toString() || '0');
		const electricityPrice = parseFloat(data.get('electricityPrice')?.toString() || '0');

		if (!type || !['sepeda', 'mobil', 'mobil_listrik'].includes(type)) {
			return fail(400, { error: 'Tipe garasi tidak valid' });
		}

		if (isNaN(count) || count < 1 || count > 999) {
			return fail(400, { error: 'Jumlah garasi yang dibuat harus antara 1 sampai 999' });
		}

		if (isNaN(dailyPrice) || dailyPrice <= 0) {
			return fail(400, { error: 'Harga sewa harian harus bernilai positif' });
		}

		if (type === 'mobil_listrik' && (isNaN(electricityPrice) || electricityPrice < 0)) {
			return fail(400, { error: 'Harga listrik per kWh harus ditentukan untuk garasi mobil listrik' });
		}

		// Ambil sequence terakhir dari database
		const currentCountRow = db
			.prepare('SELECT COUNT(*) as count FROM garages WHERE type = ?')
			.get(type) as { count: number };
		const startSeq = currentCountRow.count + 1;

		let codes: string[];
		try {
			codes = GarageCodeGenerator.generateBatchCodes(type, startSeq, count);
		} catch (err: any) {
			return fail(400, { error: err.message });
		}

		const now = new Date().toISOString();
		const insertStmt = db.prepare(`
			INSERT INTO garages (code, type, daily_price, electricity_price_kwh, status, created_at)
			VALUES (?, ?, ?, ?, 'available', ?)
		`);

		const finalElectricityPrice = type === 'mobil_listrik' ? electricityPrice : 0;

		// Eksekusi insert massal
		for (const code of codes) {
			insertStmt.run(code, type, dailyPrice, finalElectricityPrice, now);
		}

		return {
			success: true,
			message: `Berhasil membuat ${count} unit garasi tipe ${type.replace('_', ' ')} (${codes[0]} s/d ${codes[codes.length - 1]}).`
		};
	}
};
