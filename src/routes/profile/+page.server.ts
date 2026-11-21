// src/routes/profile/+page.server.ts
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

	const user = db.prepare('SELECT id, nik, name, phone, email, role, status, created_at FROM users WHERE id = ?').get(locals.user.id) as any;

	if (!user) {
		throw redirect(303, '/auth/login');
	}

	// Ambil statistik ringkas untuk ditampilkan di profil
	let stats = {
		totalRentals: 0,
		activeRentals: 0,
		pendingRentals: 0
	};

	if (user.role === 'penyewa') {
		const total = db.prepare('SELECT COUNT(*) as c FROM rentals WHERE user_id = ?').get(user.id) as any;
		const active = db.prepare("SELECT COUNT(*) as c FROM rentals WHERE user_id = ? AND status = 'active'").get(user.id) as any;
		const pending = db.prepare("SELECT COUNT(*) as c FROM rentals WHERE user_id = ? AND status = 'pending'").get(user.id) as any;
		stats.totalRentals = total?.c || 0;
		stats.activeRentals = active?.c || 0;
		stats.pendingRentals = pending?.c || 0;
	} else {
		const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users WHERE role = ?').get('penyewa') as any;
		const pendingApprovals = db.prepare("SELECT COUNT(*) as c FROM rentals WHERE status = 'pending'").get() as any;
		stats.totalRentals = totalUsers?.c || 0;
		stats.pendingRentals = pendingApprovals?.c || 0;
	}

	return {
		user,
		stats
	};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete('session_user_id', { path: '/' });
		throw redirect(303, '/auth/login');
	}
};
