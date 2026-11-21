// src/routes/admin/laporan/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.js';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/auth/login');
	}

	const mode = url.searchParams.get('mode') || 'bulan'; // 'bulan' | 'hari' | 'tipe' | 'penyewa'
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;
	const todayDate = new Date().toISOString().split('T')[0];

	const selectedYear = parseInt(url.searchParams.get('year') || String(currentYear), 10);
	const selectedMonth = parseInt(url.searchParams.get('month') || String(currentMonth), 10);
	const selectedDate = url.searchParams.get('date') || todayDate;
	const selectedType = url.searchParams.get('garageType') || 'all';
	const selectedTenant = url.searchParams.get('tenantId') || 'all';

	// Ambil daftar penyewa untuk opsi dropdown filter
	const tenantsList = db.prepare(`
		SELECT id, name, email FROM users WHERE role = 'penyewa' ORDER BY name ASC
	`).all() as any[];

	let reportData: any[] = [];
	let summary = {
		totalTransactions: 0,
		totalBaseCost: 0,
		totalElectricityCost: 0,
		grandTotal: 0
	};

	if (mode === 'bulan') {
		// Per bulan dalam tahun tertentu
		const paddedMonth = String(selectedMonth).padStart(2, '0');
		const monthPrefix = `${selectedYear}-${paddedMonth}`;

		reportData = db.prepare(`
			SELECT 
				r.*,
				g.code as garage_code,
				g.type as garage_type,
				u.name as tenant_name,
				u.email as tenant_email
			FROM rentals r
			JOIN garages g ON r.garage_id = g.id
			JOIN users u ON r.user_id = u.id
			WHERE r.start_date LIKE ? AND r.status IN ('active', 'completed')
			ORDER BY r.start_date DESC
		`).all(`${monthPrefix}%`) as any[];
	} else if (mode === 'hari') {
		// Per hari dalam bulan tertentu
		reportData = db.prepare(`
			SELECT 
				r.*,
				g.code as garage_code,
				g.type as garage_type,
				u.name as tenant_name,
				u.email as tenant_email
			FROM rentals r
			JOIN garages g ON r.garage_id = g.id
			JOIN users u ON r.user_id = u.id
			WHERE r.start_date = ? AND r.status IN ('active', 'completed')
			ORDER BY r.id DESC
		`).all(selectedDate) as any[];
	} else if (mode === 'tipe') {
		// Per Tipe Garasi
		let query = `
			SELECT 
				r.*,
				g.code as garage_code,
				g.type as garage_type,
				u.name as tenant_name,
				u.email as tenant_email
			FROM rentals r
			JOIN garages g ON r.garage_id = g.id
			JOIN users u ON r.user_id = u.id
			WHERE r.status IN ('active', 'completed')
		`;
		const params: any[] = [];

		if (selectedType !== 'all') {
			query += ' AND g.type = ?';
			params.push(selectedType);
		}
		query += ' ORDER BY g.type, r.id DESC';

		reportData = db.prepare(query).all(...params) as any[];
	} else if (mode === 'penyewa') {
		// Per Penyewa
		let query = `
			SELECT 
				r.*,
				g.code as garage_code,
				g.type as garage_type,
				u.name as tenant_name,
				u.email as tenant_email
			FROM rentals r
			JOIN garages g ON r.garage_id = g.id
			JOIN users u ON r.user_id = u.id
			WHERE r.status IN ('active', 'completed')
		`;
		const params: any[] = [];

		if (selectedTenant !== 'all') {
			query += ' AND r.user_id = ?';
			params.push(parseInt(selectedTenant, 10));
		}
		query += ' ORDER BY u.name, r.id DESC';

		reportData = db.prepare(query).all(...params) as any[];
	}

	// Hitung agregasi summary
	for (const item of reportData) {
		summary.totalTransactions += 1;
		summary.totalBaseCost += item.base_rental_cost || 0;
		summary.totalElectricityCost += item.electricity_cost || 0;
		summary.grandTotal += item.total_cost || 0;
	}

	return {
		mode,
		selectedYear,
		selectedMonth,
		selectedDate,
		selectedType,
		selectedTenant,
		tenantsList,
		reportData,
		summary
	};
};
