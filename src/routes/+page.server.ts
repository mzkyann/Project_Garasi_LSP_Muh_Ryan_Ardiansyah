// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.js';

export const load: PageServerLoad = async () => {
	const stats = db.prepare(`
		SELECT 
			type,
			COUNT(*) as total,
			SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
			SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
			MIN(daily_price) as min_daily_price,
			MIN(electricity_price_kwh) as min_electricity_price
		FROM garages
		GROUP BY type
	`).all() as any[];

	const totalGarages = db.prepare('SELECT COUNT(*) as count FROM garages').get() as { count: number };
	const availableGarages = db.prepare("SELECT COUNT(*) as count FROM garages WHERE status = 'available'").get() as { count: number };

	return {
		stats,
		totalCount: totalGarages.count,
		availableCount: availableGarages.count
	};
};
