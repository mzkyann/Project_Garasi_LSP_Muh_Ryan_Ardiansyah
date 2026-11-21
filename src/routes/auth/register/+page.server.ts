// src/routes/auth/register/+page.server.ts
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
	register: async ({ request }) => {
		const data = await request.formData();
		const nik = data.get('nik')?.toString().trim();
		const name = data.get('name')?.toString().trim();
		const phone = data.get('phone')?.toString().trim();
		const email = data.get('email')?.toString().trim().toLowerCase();
		const password = data.get('password')?.toString();

		// Validasi
		if (!nik || !name || !phone || !email || !password) {
			return fail(400, {
				error: 'Semua kolom formulir pendaftaran wajib diisi.',
				values: { nik, name, phone, email }
			});
		}

		if (nik.length !== 16 || !/^\d+$/.test(nik)) {
			return fail(400, {
				error: 'NIK (Nomor KTP) harus terdiri dari 16 digit angka.',
				values: { nik, name, phone, email }
			});
		}

		// Cek duplikasi NIK atau Email
		const existingUser = db
			.prepare('SELECT id, nik, email FROM users WHERE nik = ? OR email = ?')
			.get(nik, email) as any;

		if (existingUser) {
			if (existingUser.nik === nik) {
				return fail(400, {
					error: 'NIK ini sudah terdaftar sebelumnya.',
					values: { nik, name, phone, email }
				});
			}
			return fail(400, {
				error: 'Email ini sudah digunakan. Silakan gunakan email lain.',
				values: { nik, name, phone, email }
			});
		}

		const now = new Date().toISOString();

		// Simpan pendaftar baru dengan status 'pending' (menunggu verifikasi KTP oleh admin)
		db.prepare(`
			INSERT INTO users (nik, name, phone, email, password, role, status, created_at)
			VALUES (?, ?, ?, ?, ?, 'penyewa', 'pending', ?)
		`).run(nik, name, phone, email, password, now);

		return {
			success: true,
			message: 'Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi validasi KTP oleh Admin.'
		};
	}
};
