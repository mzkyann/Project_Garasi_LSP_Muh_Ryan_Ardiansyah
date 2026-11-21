// src/routes/admin/garasi/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, syncGarageStatuses } from '#lib/server/db/index.js';
import { GarageCodeGenerator } from '#lib/server/domain/GarageCodeGenerator.js';
import type { GarageType } from '#lib/server/domain/Garage.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/auth/login');
	}

	const today = new Date().toISOString().split('T')[0];
	syncGarageStatuses(today);

	// Hitung sequence number saat ini untuk masing-masing tipe garasi
	const seqSepeda = db.prepare("SELECT COUNT(*) as count FROM garages WHERE type = 'sepeda'").get() as { count: number };
	const seqMobil = db.prepare("SELECT COUNT(*) as count FROM garages WHERE type = 'mobil'").get() as { count: number };
	const seqListrik = db.prepare("SELECT COUNT(*) as count FROM garages WHERE type = 'mobil_listrik'").get() as { count: number };

	// Ambil semua sewa aktif beserta data lengkap penyewa untuk keperluan Review Sewa (Read-Only)
	const activeRentals = db.prepare(`
		SELECT 
			r.id as rental_id,
			r.garage_id,
			r.user_id,
			r.start_date,
			r.end_date,
			r.duration_days,
			r.vehicle_type,
			r.vehicle_brand_model,
			r.license_plate,
			r.battery_capacity_kwh,
			r.electricity_cost,
			r.daily_price,
			r.total_cost,
			r.payment_proof,
			r.notes,
			r.created_at as rental_created_at,
			u.name as tenant_name,
			u.nik as tenant_nik,
			u.phone as tenant_phone,
			u.email as tenant_email
		FROM rentals r
		JOIN users u ON r.user_id = u.id
		WHERE r.status = 'active' AND r.end_date > ?
		ORDER BY r.end_date DESC
	`).all(today) as any[];

	const rentalMap = new Map<number, any>();
	for (const r of activeRentals) {
		// Pasangkan rental aktif terakhir untuk setiap slot garasi
		if (!rentalMap.has(r.garage_id)) {
			rentalMap.set(r.garage_id, r);
		}
	}

	// Daftar seluruh slot garasi
	const rawGarages = db.prepare(`
		SELECT 
			g.*,
			(
				SELECT COUNT(*) FROM rentals r 
				WHERE r.garage_id = g.id AND r.status = 'active' AND r.end_date > ?
			) as active_rentals
		FROM garages g
		ORDER BY g.type, g.code ASC
	`).all(today) as any[];

	const garages = rawGarages.map((g) => {
		const rental = rentalMap.get(g.id) || null;
		return {
			...g,
			active_rental: rental,
			active_start_date: rental ? rental.start_date : null,
			active_end_date: rental ? rental.end_date : null,
			active_tenant_name: rental ? rental.tenant_name : null
		};
	});

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
	// CREATE: Tambah 1 Slot Garasi Baru (Kode Auto-Generate & Terkunci)
	createGarage: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak menambah slot garasi' });
		}

		const data = await request.formData();
		const type = data.get('type')?.toString() as GarageType;
		const dailyPrice = parseFloat(data.get('dailyPrice')?.toString() || '0');
		const electricityPrice = parseFloat(data.get('electricityPrice')?.toString() || '0');

		if (!type || !['sepeda', 'mobil', 'mobil_listrik'].includes(type)) {
			return fail(400, { error: 'Kategori tipe garasi tidak valid' });
		}

		if (isNaN(dailyPrice) || dailyPrice <= 0) {
			return fail(400, { error: 'Tarif sewa harian garasi harus bernilai positif' });
		}

		// Auto-generate kode berikutnya secara sekuensial unik
		const currentCountRow = db
			.prepare('SELECT COUNT(*) as count FROM garages WHERE type = ?')
			.get(type) as { count: number };
		
		let seq = currentCountRow.count + 1;
		let code = GarageCodeGenerator.formatCode(type, seq);

		// Pastikan kode benar-benar unik jika ada riwayat nomor sebelumnya
		while (db.prepare('SELECT id FROM garages WHERE code = ?').get(code)) {
			seq++;
			code = GarageCodeGenerator.formatCode(type, seq);
		}

		const now = new Date().toISOString();
		const slotName = `Slot Garasi ${code}`;
		const carTypeDesc =
			type === 'sepeda'
				? 'Garasi Roda Dua'
				: type === 'mobil'
					? 'Garasi Mobil Bensin'
					: 'Garasi EV + SPKLU';

		const finalElectricityPrice = type === 'mobil_listrik' ? Math.max(0, electricityPrice) : 0;

		db.prepare(`
			INSERT INTO garages (
				code, type, vehicle_name, license_plate, car_type, 
				daily_price, electricity_price_kwh, battery_capacity_kwh, status, created_at
			) VALUES (?, ?, ?, NULL, ?, ?, ?, 0, 'available', ?)
		`).run(
			code,
			type,
			slotName,
			carTypeDesc,
			dailyPrice,
			finalElectricityPrice,
			now
		);

		return {
			success: true,
			message: `Berhasil menambahkan Slot Garasi ${code} (${carTypeDesc}) dengan tarif Rp ${dailyPrice.toLocaleString('id-ID')}/hari.`
		};
	},

	// CREATE BATCH: Tambah Banyak Slot Garasi Sekaligus (1 s/d 999 Slot)
	createBatchGarages: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak menambah slot garasi' });
		}

		const data = await request.formData();
		const type = data.get('type')?.toString() as GarageType;
		const count = parseInt(data.get('count')?.toString() || '0', 10);
		const dailyPrice = parseFloat(data.get('dailyPrice')?.toString() || '0');
		const electricityPrice = parseFloat(data.get('electricityPrice')?.toString() || '0');

		if (!type || !['sepeda', 'mobil', 'mobil_listrik'].includes(type)) {
			return fail(400, { error: 'Tipe garasi tidak valid' });
		}

		if (isNaN(count) || count < 1 || count > 999) {
			return fail(400, { error: 'Jumlah slot garasi yang ditambahkan harus antara 1 sampai 999' });
		}

		if (isNaN(dailyPrice) || dailyPrice <= 0) {
			return fail(400, { error: 'Tarif sewa harian harus bernilai positif' });
		}

		const currentCountRow = db
			.prepare('SELECT COUNT(*) as count FROM garages WHERE type = ?')
			.get(type) as { count: number };
		
		let startSeq = currentCountRow.count + 1;
		let codes: string[] = [];

		try {
			codes = GarageCodeGenerator.generateBatchCodes(type, startSeq, count);
			// Cek jika ada collision dengan kode yang sudah ada
			const existingCodes = db.prepare(`SELECT code FROM garages WHERE code IN (${codes.map(() => '?').join(',')})`).all(...codes) as { code: string }[];
			if (existingCodes.length > 0) {
				// Cari max seq yang ada
				const allCodes = db.prepare('SELECT code FROM garages WHERE type = ?').all(type) as { code: string }[];
				const maxNum = allCodes.reduce((max, c) => {
					const num = parseInt(c.code.slice(1), 10);
					return isNaN(num) ? max : Math.max(max, num);
				}, 0);
				startSeq = maxNum + 1;
				codes = GarageCodeGenerator.generateBatchCodes(type, startSeq, count);
			}
		} catch (err: any) {
			return fail(400, { error: err.message });
		}

		const now = new Date().toISOString();
		const carTypeDesc =
			type === 'sepeda'
				? 'Garasi Roda Dua'
				: type === 'mobil'
					? 'Garasi Mobil Bensin'
					: 'Garasi EV + SPKLU';

		const finalElectricityPrice = type === 'mobil_listrik' ? electricityPrice : 0;

		const insertStmt = db.prepare(`
			INSERT INTO garages (
				code, type, vehicle_name, license_plate, car_type, 
				daily_price, electricity_price_kwh, battery_capacity_kwh, status, created_at
			) VALUES (?, ?, ?, NULL, ?, ?, ?, 0, 'available', ?)
		`);

		for (const code of codes) {
			insertStmt.run(
				code,
				type,
				`Slot Garasi ${code}`,
				carTypeDesc,
				dailyPrice,
				finalElectricityPrice,
				now
			);
		}

		return {
			success: true,
			message: `Berhasil menambahkan ${count} slot garasi tipe ${carTypeDesc} (${codes[0]} s/d ${codes[codes.length - 1]}).`
		};
	},

	// UPDATE: Hanya Mengedit Tarif Garasi (Sesuai Permintaan: Hanya Tarif yang Boleh Diedit)
	updateGarage: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak memperbarui tarif garasi' });
		}

		const data = await request.formData();
		const id = parseInt(data.get('id')?.toString() || '0', 10);
		const dailyPrice = parseFloat(data.get('dailyPrice')?.toString() || '0');
		const electricityPrice = parseFloat(data.get('electricityPrice')?.toString() || '0');

		if (!id) {
			return fail(400, { error: 'ID garasi tidak ditemukan' });
		}

		const garage = db.prepare('SELECT id, code, type FROM garages WHERE id = ?').get(id) as { id: number; code: string; type: GarageType } | undefined;
		if (!garage) {
			return fail(404, { error: 'Slot garasi tidak ditemukan' });
		}

		if (isNaN(dailyPrice) || dailyPrice <= 0) {
			return fail(400, { error: 'Tarif sewa harian harus lebih besar dari Rp 0' });
		}

		const finalElectricityPrice = garage.type === 'mobil_listrik' ? Math.max(0, electricityPrice) : 0;

		// HANYA update tarif sewa harian dan tarif listrik (kode, tipe, nama, dan status tidak diubah)
		db.prepare(`
			UPDATE garages
			SET daily_price = ?, electricity_price_kwh = ?
			WHERE id = ?
		`).run(dailyPrice, finalElectricityPrice, id);

		return {
			success: true,
			message: `Tarif sewa Slot Garasi ${garage.code} berhasil diperbarui menjadi Rp ${dailyPrice.toLocaleString('id-ID')}/hari.`
		};
	},

	// DELETE: Hapus Slot Garasi (Hanya Jika Kosong / Tidak Sedang Disewa)
	deleteGarage: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak menghapus slot garasi' });
		}

		const data = await request.formData();
		const id = parseInt(data.get('id')?.toString() || '0', 10);

		if (!id) {
			return fail(400, { error: 'ID garasi tidak valid' });
		}

		const garage = db.prepare('SELECT code, vehicle_name FROM garages WHERE id = ?').get(id) as { code: string; vehicle_name: string } | undefined;
		if (!garage) {
			return fail(404, { error: 'Slot garasi tidak ditemukan' });
		}

		// Cek apakah garasi sedang aktif dirental atau menunggu ACC
		const activeRental = db.prepare("SELECT COUNT(*) as count FROM rentals WHERE garage_id = ? AND status IN ('pending', 'active')").get(id) as { count: number };
		if (activeRental.count > 0) {
			return fail(400, { error: `Slot garasi ${garage.code} tidak dapat dihapus karena sedang disewa aktif atau memiliki pengajuan sewa yang sedang diproses.` });
		}

		db.prepare('DELETE FROM rentals WHERE garage_id = ?').run(id);
		db.prepare('DELETE FROM garages WHERE id = ?').run(id);

		return {
			success: true,
			message: `Slot garasi ${garage.code} berhasil dihapus dari sistem.`
		};
	}
};
