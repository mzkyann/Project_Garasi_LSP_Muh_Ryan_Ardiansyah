// src/routes/penyewa/riwayat/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

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

	// Ambil riwayat ekstensi untuk setiap rental
	const rentalsWithExtensions = rentals.map((rental) => {
		const extensions = db.prepare(`
			SELECT * FROM rental_extensions WHERE rental_id = ? ORDER BY id ASC
		`).all(rental.id) as any[];

		return {
			...rental,
			extensions
		};
	});

	return {
		rentals: rentalsWithExtensions
	};
};
