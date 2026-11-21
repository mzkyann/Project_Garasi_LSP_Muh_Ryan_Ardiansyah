// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { db, syncGarageStatuses } from '#lib/server/db/index.js';

export const load: PageServerLoad = async () => {
	const today = new Date().toISOString().split('T')[0];
	syncGarageStatuses(today);

	// Tipe garasi standar
	const garageTypes: ('sepeda' | 'mobil' | 'mobil_listrik')[] = ['sepeda', 'mobil', 'mobil_listrik'];

	const stats = garageTypes.map((type) => {
		const aggregate = db.prepare(`
			SELECT 
				COUNT(*) as total,
				SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
				SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
				MIN(daily_price) as daily_price,
				MIN(electricity_price_kwh) as electricity_price_kwh
			FROM garages
			WHERE type = ?
		`).get(type) as any;

		const total = aggregate?.total || 0;
		const available = aggregate?.available || 0;
		const used = aggregate?.used || 0;
		const dailyPrice = aggregate?.daily_price || (type === 'sepeda' ? 20000 : type === 'mobil' ? 50000 : 75000);
		const electricityPrice = aggregate?.electricity_price_kwh || 0;
		const isFull = total > 0 && available === 0;

		// Jika penuh, cari kapan slot terdekat akan kosong kembali
		let nextEmptyDate: string | null = null;
		if (isFull) {
			const earliest = db.prepare(`
				SELECT MIN(r.end_date) as next_end
				FROM rentals r
				JOIN garages g ON r.garage_id = g.id
				WHERE g.type = ? AND r.status IN ('pending', 'active') AND r.end_date > ?
			`).get(type, today) as any;
			nextEmptyDate = earliest?.next_end || null;
		}

		return {
			type,
			total,
			available,
			used,
			dailyPrice,
			monthlyPrice: dailyPrice * 25,
			electricityPrice,
			isFull,
			nextEmptyDate
		};
	});

	const totalGarages = db.prepare('SELECT COUNT(*) as count FROM garages').get() as { count: number };
	const availableGarages = db.prepare("SELECT COUNT(*) as count FROM garages WHERE status = 'available'").get() as { count: number };

	return {
		stats,
		totalCount: totalGarages.count,
		availableCount: availableGarages.count,
		today
	};
};
