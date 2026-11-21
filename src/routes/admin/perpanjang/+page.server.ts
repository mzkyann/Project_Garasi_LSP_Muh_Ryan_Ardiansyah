// src/routes/admin/perpanjang/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/auth/login');
	}
	// Seluruh perpanjangan & ACC kini terintegrasi di pusat persetujuan admin
	throw redirect(303, '/admin/persetujuan');
};
