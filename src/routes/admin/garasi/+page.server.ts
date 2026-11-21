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

	// Daftar seluruh garasi beserta status relasi sewa aktif
	const garages = db.prepare(`
		SELECT 
			g.*,
			(SELECT COUNT(*) FROM rentals r WHERE r.garage_id = g.id) as total_rentals,
			(SELECT COUNT(*) FROM rentals r WHERE r.garage_id = g.id AND r.status = 'active') as active_rentals
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
	// CREATE: Tambah 1 Unit Garasi Baru
	createGarage: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak membuat garasi baru' });
		}

		const data = await request.formData();
		const code = data.get('code')?.toString().trim().toUpperCase() || '';
		const type = data.get('type')?.toString() as GarageType;
		const carType = data.get('carType')?.toString().trim() || 'Standar';
		const dailyPrice = parseFloat(data.get('dailyPrice')?.toString() || '0');
		const electricityPrice = parseFloat(data.get('electricityPrice')?.toString() || '0');
		const status = (data.get('status')?.toString() || 'available') as 'available' | 'used';

		if (!code) {
			return fail(400, { error: 'Kode garasi tidak boleh kosong' });
		}

		if (!type || !['sepeda', 'mobil', 'mobil_listrik'].includes(type)) {
			return fail(400, { error: 'Kategori tipe garasi tidak valid' });
		}

		if (isNaN(dailyPrice) || dailyPrice <= 0) {
			return fail(400, { error: 'Tarif sewa harian harus lebih besar dari 0' });
		}

		// Cek duplikasi kode garasi
		const existing = db.prepare('SELECT id FROM garages WHERE code = ?').get(code);
		if (existing) {
			return fail(400, { error: `Kode garasi ${code} sudah terdaftar di sistem. Gunakan kode lain.` });
		}

		const now = new Date().toISOString();
		const finalElectricityPrice = type === 'mobil_listrik' ? Math.max(0, electricityPrice) : 0;

		db.prepare(`
			INSERT INTO garages (code, type, car_type, daily_price, electricity_price_kwh, status, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`).run(code, type, carType, dailyPrice, finalElectricityPrice, status, now);

		return {
			success: true,
			message: `Berhasil menambahkan unit garasi baru ${code} (${carType}) dengan tarif Rp ${dailyPrice.toLocaleString('id-ID')}/hari.`
		};
	},

	// CREATE: Tambah Kelompok Garasi (Batch Generation)
	createBatchGarages: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak membuat garasi baru' });
		}

		const data = await request.formData();
		const type = data.get('type')?.toString() as GarageType;
		const carType = data.get('carType')?.toString().trim() || 'Standar';
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
			INSERT INTO garages (code, type, car_type, daily_price, electricity_price_kwh, status, created_at)
			VALUES (?, ?, ?, ?, ?, 'available', ?)
		`);

		const finalElectricityPrice = type === 'mobil_listrik' ? electricityPrice : 0;

		// Eksekusi insert massal
		for (const code of codes) {
			insertStmt.run(code, type, carType, dailyPrice, finalElectricityPrice, now);
		}

		return {
			success: true,
			message: `Berhasil membuat ${count} unit garasi tipe ${type.replace('_', ' ')} (${codes[0]} s/d ${codes[codes.length - 1]}) kategori "${carType}".`
		};
	},

	// UPDATE: Edit Data Garasi
	updateGarage: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak memperbarui data garasi' });
		}

		const data = await request.formData();
		const id = parseInt(data.get('id')?.toString() || '0', 10);
		const code = data.get('code')?.toString().trim().toUpperCase() || '';
		const type = data.get('type')?.toString() as GarageType;
		const carType = data.get('carType')?.toString().trim() || 'Standar';
		const dailyPrice = parseFloat(data.get('dailyPrice')?.toString() || '0');
		const electricityPrice = parseFloat(data.get('electricityPrice')?.toString() || '0');
		const status = (data.get('status')?.toString() || 'available') as 'available' | 'used';

		if (!id) {
			return fail(400, { error: 'ID garasi tidak ditemukan' });
		}

		if (!code) {
			return fail(400, { error: 'Kode garasi tidak boleh kosong' });
		}

		if (!type || !['sepeda', 'mobil', 'mobil_listrik'].includes(type)) {
			return fail(400, { error: 'Kategori tipe garasi tidak valid' });
		}

		if (isNaN(dailyPrice) || dailyPrice <= 0) {
			return fail(400, { error: 'Tarif sewa harian harus lebih besar dari 0' });
		}

		// Cek apakah kode garasi sudah digunakan oleh ID lain
		const duplicate = db.prepare('SELECT id FROM garages WHERE code = ? AND id != ?').get(code, id);
		if (duplicate) {
			return fail(400, { error: `Kode garasi ${code} sudah digunakan oleh unit garasi lain.` });
		}

		const finalElectricityPrice = type === 'mobil_listrik' ? Math.max(0, electricityPrice) : 0;

		db.prepare(`
			UPDATE garages
			SET code = ?, type = ?, car_type = ?, daily_price = ?, electricity_price_kwh = ?, status = ?
			WHERE id = ?
		`).run(code, type, carType, dailyPrice, finalElectricityPrice, status, id);

		return {
			success: true,
			message: `Data unit garasi ${code} berhasil diperbarui.`
		};
	},

	// DELETE: Hapus Unit Garasi
	deleteGarage: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak menghapus unit garasi' });
		}

		const data = await request.formData();
		const id = parseInt(data.get('id')?.toString() || '0', 10);

		if (!id) {
			return fail(400, { error: 'ID garasi tidak valid' });
		}

		const garage = db.prepare('SELECT code FROM garages WHERE id = ?').get(id) as { code: string } | undefined;
		if (!garage) {
			return fail(404, { error: 'Unit garasi tidak ditemukan' });
		}

		// Validasi integritas: Apakah ada rental aktif?
		const activeRental = db.prepare("SELECT COUNT(*) as count FROM rentals WHERE garage_id = ? AND status = 'active'").get(id) as { count: number };
		if (activeRental.count > 0) {
			return fail(400, { error: `Garasi ${garage.code} tidak dapat dihapus karena masih aktif digunakan oleh penyewa.` });
		}

		// Hapus riwayat sewa lama yang terikat (jika ada) lalu hapus garasi
		db.prepare('DELETE FROM rentals WHERE garage_id = ?').run(id);
		db.prepare('DELETE FROM garages WHERE id = ?').run(id);

		return {
			success: true,
			message: `Unit garasi ${garage.code} berhasil dihapus dari sistem.`
		};
	}
};
