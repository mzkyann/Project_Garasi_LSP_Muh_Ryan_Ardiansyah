// src/routes/auth/login/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, locals.user.role === 'admin' ? '/admin/garasi' : '/penyewa/sewa-baru');
	}
	return {};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString().trim();
		const password = data.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email dan password harus diisi', email });
		}

		const user = db
			.prepare('SELECT id, nik, name, phone, email, password, role, status FROM users WHERE email = ?')
			.get(email) as any;

		if (!user || user.password !== password) {
			return fail(400, { error: 'Email atau password salah', email });
		}

		if (user.role === 'penyewa' && user.status === 'pending') {
			return fail(403, {
				error: 'Akun Anda sedang menunggu verifikasi KTP oleh Admin. Harap tunggu persetujuan.',
				email
			});
		}

		if (user.role === 'penyewa' && user.status === 'rejected') {
			return fail(403, {
				error: 'Pendaftaran akun Anda telah ditolak oleh Admin.',
				email
			});
		}

		// Set cookie session
		cookies.set('session_user_id', String(user.id), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 hari
		});

		throw redirect(303, user.role === 'admin' ? '/admin/garasi' : '/penyewa/sewa-baru');
	},

	quickLogin: async ({ request, cookies }) => {
		const data = await request.formData();
		const targetRole = data.get('targetRole')?.toString();

		let userEmail = 'admin@garasi.id';
		if (targetRole === 'penyewa') {
			userEmail = 'budi@gmail.com';
		}

		const user = db.prepare('SELECT id, role FROM users WHERE email = ?').get(userEmail) as any;
		if (user) {
			cookies.set('session_user_id', String(user.id), {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});
			throw redirect(303, user.role === 'admin' ? '/admin/garasi' : '/penyewa/sewa-baru');
		}

		return fail(500, { error: 'Akun demo tidak ditemukan' });
	}
};
