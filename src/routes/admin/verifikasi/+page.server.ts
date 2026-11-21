// src/routes/admin/verifikasi/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/auth/login');
	}

	const pendingUsers = db.prepare(`
		SELECT id, nik, name, phone, email, status, created_at
		FROM users
		WHERE role = 'penyewa' AND status = 'pending'
		ORDER BY id DESC
	`).all() as any[];

	const processedUsers = db.prepare(`
		SELECT id, nik, name, phone, email, status, created_at
		FROM users
		WHERE role = 'penyewa' AND status != 'pending'
		ORDER BY id DESC
	`).all() as any[];

	return {
		pendingUsers,
		processedUsers
	};
};

export const actions: Actions = {
	verify: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Akses ditolak' });
		}

		const data = await request.formData();
		const userId = parseInt(data.get('userId')?.toString() || '0', 10);
		const decision = data.get('decision')?.toString();

		if (!userId || !['approved', 'rejected'].includes(decision || '')) {
			return fail(400, { error: 'Data verifikasi tidak valid' });
		}

		db.prepare('UPDATE users SET status = ? WHERE id = ?').run(decision, userId);

		return {
			success: true,
			message: `Status pendaftaran penyewa berhasil diubah menjadi: ${decision?.toUpperCase()}`
		};
	}
};
