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

	// Daftar seluruh unit garasi / kendaraan beserta jadwal sewa aktif dan nama penyewa
	const garages = db.prepare(`
		SELECT 
			g.*,
			(
				SELECT r.start_date FROM rentals r 
				WHERE r.garage_id = g.id AND r.status = 'active' AND r.end_date > ?
				ORDER BY r.end_date DESC LIMIT 1
			) as active_start_date,
			(
				SELECT r.end_date FROM rentals r 
				WHERE r.garage_id = g.id AND r.status = 'active' AND r.end_date > ?
				ORDER BY r.end_date DESC LIMIT 1
			) as active_end_date,
			(
				SELECT u.name FROM rentals r 
				JOIN users u ON r.user_id = u.id
				WHERE r.garage_id = g.id AND r.status = 'active' AND r.end_date > ?
				ORDER BY r.end_date DESC LIMIT 1
			) as active_tenant_name,
			(
				SELECT COUNT(*) FROM rentals r 
				WHERE r.garage_id = g.id AND r.status = 'active' AND r.end_date > ?
			) as active_rentals
		FROM garages g
		ORDER BY g.type, g.code ASC
	`).all(today, today, today, today) as any[];

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
	// CREATE: Tambah 1 Unit Garasi & Kendaraan Baru
	createGarage: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak membuat garasi baru' });
		}

		const data = await request.formData();
		const code = data.get('code')?.toString().trim().toUpperCase() || '';
		const type = data.get('type')?.toString() as GarageType;
		const vehicleName = data.get('vehicleName')?.toString().trim() || 'Kendaraan Standar';
		const licensePlate = data.get('licensePlate')?.toString().trim().toUpperCase() || null;
		const carType = data.get('carType')?.toString().trim() || 'Standar';
		const dailyPrice = parseFloat(data.get('dailyPrice')?.toString() || '0');
		const electricityPrice = parseFloat(data.get('electricityPrice')?.toString() || '0');
		const batteryCapacity = parseFloat(data.get('batteryCapacity')?.toString() || '0');
		const status = (data.get('status')?.toString() || 'available') as 'available' | 'used';

		if (!code) {
			return fail(400, { error: 'Kode garasi tidak boleh kosong' });
		}

		if (!type || !['sepeda', 'mobil', 'mobil_listrik'].includes(type)) {
			return fail(400, { error: 'Kategori tipe garasi tidak valid' });
		}

		if (isNaN(dailyPrice) || dailyPrice <= 0) {
			return fail(400, { error: 'Tarif sewa harian harus bernilai positif' });
		}

		// Cek duplikasi kode garasi
		const existing = db.prepare('SELECT id FROM garages WHERE code = ?').get(code);
		if (existing) {
			return fail(400, { error: `Kode unit ${code} sudah terdaftar di sistem. Silakan gunakan kode lain.` });
		}

		const now = new Date().toISOString();
		const finalElectricityPrice = type === 'mobil_listrik' ? Math.max(0, electricityPrice) : 0;
		const finalBatteryCapacity = type === 'mobil_listrik' ? Math.max(0, batteryCapacity) : 0;

		db.prepare(`
			INSERT INTO garages (
				code, type, vehicle_name, license_plate, car_type, 
				daily_price, electricity_price_kwh, battery_capacity_kwh, status, created_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).run(
			code,
			type,
			vehicleName,
			licensePlate,
			carType,
			dailyPrice,
			finalElectricityPrice,
			finalBatteryCapacity,
			status,
			now
		);

		return {
			success: true,
			message: `Berhasil menambahkan unit ${code} (${vehicleName} - ${licensePlate || 'Bebas Plat'}) dengan tarif Rp ${dailyPrice.toLocaleString('id-ID')}/hari.`
		};
	},

	// CREATE: Batch Generation Garasi Berkelompok
	createBatchGarages: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak membuat garasi baru' });
		}

		const data = await request.formData();
		const type = data.get('type')?.toString() as GarageType;
		const carType = data.get('carType')?.toString().trim() || 'Standar';
		const vehicleName = data.get('vehicleName')?.toString().trim() || 'Unit Kendaraan';
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
			INSERT INTO garages (
				code, type, vehicle_name, license_plate, car_type, 
				daily_price, electricity_price_kwh, battery_capacity_kwh, status, created_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)
		`);

		const finalElectricityPrice = type === 'mobil_listrik' ? electricityPrice : 0;
		const defaultBattery = type === 'mobil_listrik' ? 58 : 0;

		for (let i = 0; i < codes.length; i++) {
			const code = codes[i];
			const randomNum = 1000 + startSeq + i;
			const samplePlate = type === 'sepeda' ? null : `B ${randomNum} ABC`;
			const nameWithSeq = `${vehicleName} #${startSeq + i}`;
			insertStmt.run(code, type, nameWithSeq, samplePlate, carType, dailyPrice, finalElectricityPrice, defaultBattery, now);
		}

		return {
			success: true,
			message: `Berhasil membuat ${count} unit garasi tipe ${type.replace('_', ' ')} (${codes[0]} s/d ${codes[codes.length - 1]}).`
		};
	},

	// UPDATE: Edit Data Garasi & Kendaraan
	updateGarage: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Hanya admin yang berhak memperbarui data garasi' });
		}

		const data = await request.formData();
		const id = parseInt(data.get('id')?.toString() || '0', 10);
		const code = data.get('code')?.toString().trim().toUpperCase() || '';
		const type = data.get('type')?.toString() as GarageType;
		const vehicleName = data.get('vehicleName')?.toString().trim() || 'Kendaraan';
		const licensePlate = data.get('licensePlate')?.toString().trim().toUpperCase() || null;
		const carType = data.get('carType')?.toString().trim() || 'Standar';
		const dailyPrice = parseFloat(data.get('dailyPrice')?.toString() || '0');
		const electricityPrice = parseFloat(data.get('electricityPrice')?.toString() || '0');
		const batteryCapacity = parseFloat(data.get('batteryCapacity')?.toString() || '0');
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

		// Cek duplikasi kode garasi pada ID lain
		const duplicate = db.prepare('SELECT id FROM garages WHERE code = ? AND id != ?').get(code, id);
		if (duplicate) {
			return fail(400, { error: `Kode garasi ${code} sudah digunakan oleh unit garasi lain.` });
		}

		const finalElectricityPrice = type === 'mobil_listrik' ? Math.max(0, electricityPrice) : 0;
		const finalBatteryCapacity = type === 'mobil_listrik' ? Math.max(0, batteryCapacity) : 0;

		db.prepare(`
			UPDATE garages
			SET code = ?, type = ?, vehicle_name = ?, license_plate = ?, car_type = ?, 
				daily_price = ?, electricity_price_kwh = ?, battery_capacity_kwh = ?, status = ?
			WHERE id = ?
		`).run(code, type, vehicleName, licensePlate, carType, dailyPrice, finalElectricityPrice, finalBatteryCapacity, status, id);

		return {
			success: true,
			message: `Data unit ${code} (${vehicleName}) berhasil diperbarui.`
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

		const garage = db.prepare('SELECT code, vehicle_name FROM garages WHERE id = ?').get(id) as { code: string; vehicle_name: string } | undefined;
		if (!garage) {
			return fail(404, { error: 'Unit garasi tidak ditemukan' });
		}

		// Cek apakah garasi sedang aktif dirental atau menunggu ACC
		const activeRental = db.prepare("SELECT COUNT(*) as count FROM rentals WHERE garage_id = ? AND status IN ('pending', 'active')").get(id) as { count: number };
		if (activeRental.count > 0) {
			return fail(400, { error: `Unit ${garage.code} tidak dapat dihapus karena masih memiliki kontrak sewa aktif atau pengajuan sewa yang sedang diproses.` });
		}

		db.prepare('DELETE FROM rentals WHERE garage_id = ?').run(id);
		db.prepare('DELETE FROM garages WHERE id = ?').run(id);

		return {
			success: true,
			message: `Unit garasi ${garage.code} (${garage.vehicle_name}) berhasil dihapus.`
		};
	}
};
