// src/lib/server/db/index.ts
/**
 * Menerapkan Akses Basis Data Relasional
 * Unit Kompetensi: J.620100.021.02
 * Menggunakan SQLite (node:sqlite DatabaseSync) dengan skema relasional terstruktur ACID
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve(process.cwd(), 'garage.db');
export const db = new DatabaseSync(dbPath);

// Aktifkan Foreign Keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDb() {
	// Baca file skema schema.sql jika tersedia, atau jalankan DDL
	const schemaPath = path.resolve(process.cwd(), 'schema.sql');
	if (fs.existsSync(schemaPath)) {
		const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
		db.exec(schemaSql);
	} else {
		// Fallback DDL
		db.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				nik TEXT NOT NULL UNIQUE CHECK(length(nik) = 16),
				name TEXT NOT NULL,
				phone TEXT NOT NULL,
				email TEXT NOT NULL UNIQUE,
				password TEXT NOT NULL,
				role TEXT NOT NULL CHECK(role IN ('admin', 'penyewa')),
				status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
				created_at TEXT NOT NULL
			);

			CREATE TABLE IF NOT EXISTS garages (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				code TEXT NOT NULL UNIQUE,
				type TEXT NOT NULL CHECK(type IN ('sepeda', 'mobil', 'mobil_listrik')),
				vehicle_name TEXT NOT NULL DEFAULT 'Kendaraan',
				license_plate TEXT,
				car_type TEXT DEFAULT 'Standar',
				daily_price REAL NOT NULL CHECK(daily_price > 0),
				electricity_price_kwh REAL DEFAULT 0 CHECK(electricity_price_kwh >= 0),
				battery_capacity_kwh REAL DEFAULT 0 CHECK(battery_capacity_kwh >= 0),
				status TEXT NOT NULL CHECK(status IN ('available', 'used')),
				created_at TEXT NOT NULL
			);

			CREATE TABLE IF NOT EXISTS rentals (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				garage_id INTEGER NOT NULL REFERENCES garages(id) ON DELETE RESTRICT,
				vehicle_type TEXT NOT NULL CHECK(vehicle_type IN ('sepeda', 'sepeda_motor', 'mobil', 'mobil_listrik')),
				license_plate TEXT,
				vehicle_brand_model TEXT NOT NULL,
				battery_capacity_kwh REAL DEFAULT 0,
				rental_type TEXT NOT NULL CHECK(rental_type IN ('harian', 'bulanan')),
				duration INTEGER NOT NULL CHECK(duration > 0),
				start_date TEXT NOT NULL,
				end_date TEXT NOT NULL,
				base_rental_cost REAL NOT NULL,
				electricity_cost REAL DEFAULT 0,
				total_cost REAL NOT NULL,
				payment_proof TEXT,
				status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'completed', 'cancelled', 'rejected')),
				created_at TEXT NOT NULL
			);

			CREATE TABLE IF NOT EXISTS rental_extensions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				rental_id INTEGER NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
				old_end_date TEXT NOT NULL,
				new_end_date TEXT NOT NULL,
				additional_days INTEGER NOT NULL CHECK(additional_days > 0),
				additional_cost REAL NOT NULL CHECK(additional_cost >= 0),
				payment_proof TEXT NOT NULL,
				status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
				created_at TEXT NOT NULL
			);
		`);
	}

	// Migrasi aman untuk menambahkan kolom baru jika tabel sudah ada sebelumnya
	try {
		db.exec(`ALTER TABLE garages ADD COLUMN car_type TEXT DEFAULT 'Standar';`);
	} catch (e) {}
	try {
		db.exec(`ALTER TABLE garages ADD COLUMN vehicle_name TEXT DEFAULT 'Kendaraan';`);
	} catch (e) {}
	try {
		db.exec(`ALTER TABLE garages ADD COLUMN license_plate TEXT DEFAULT NULL;`);
	} catch (e) {}
	try {
		db.exec(`ALTER TABLE garages ADD COLUMN battery_capacity_kwh REAL DEFAULT 0;`);
	} catch (e) {}

	seedInitialData();
}

export function seedInitialData(force = false) {
	if (force) {
		db.exec('DELETE FROM rental_extensions;');
		db.exec('DELETE FROM rentals;');
		db.exec('DELETE FROM garages;');
		db.exec('DELETE FROM users;');
	}

	const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
	const now = new Date().toISOString();
	const today = now.split('T')[0];

	if (userCount.count === 0) {
		const insertUser = db.prepare(`
			INSERT INTO users (nik, name, phone, email, password, role, status, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`);

		// 1. Admin
		insertUser.run('1234567890123456', 'Administrator Garasi', '08123456789', 'admin@garasi.id', 'admin123', 'admin', 'approved', now);
		// 2. Penyewa Approved (Budi)
		insertUser.run('3578012345670001', 'Budi Santoso', '08129876543', 'budi@gmail.com', 'budi123', 'penyewa', 'approved', now);
		// 3. Penyewa Pending 1 (Ani)
		insertUser.run('3578019876540002', 'Ani Wijaya', '08561234987', 'ani@gmail.com', 'ani123', 'penyewa', 'pending', now);
		// 4. Penyewa Pending 2 (Citra)
		insertUser.run('3578015544330003', 'Citra Lestari', '08139988776', 'citra@gmail.com', 'citra123', 'penyewa', 'pending', now);
		// 5. Penyewa Rejected (Doni)
		insertUser.run('3578011122330004', 'Doni Pratama', '08781122334', 'doni@gmail.com', 'doni123', 'penyewa', 'rejected', now);
	}

	const garageCount = db.prepare('SELECT COUNT(*) as count FROM garages').get() as { count: number };
	if (garageCount.count === 0 || force) {
		const insertGarage = db.prepare(`
			INSERT INTO garages (code, type, vehicle_name, license_plate, car_type, daily_price, electricity_price_kwh, battery_capacity_kwh, status, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);

		// Garasi Sepeda & Sepeda Motor (Kode S...) - Tarif penitipan motor: Rp 20.000 / hari (Bulanan Rp 500.000)
		insertGarage.run('S001', 'sepeda', 'Slot Garasi Sepeda / Motor S001', null, 'Garasi Roda Dua', 20000, 0, 0, 'available', now);
		insertGarage.run('S002', 'sepeda', 'Slot Garasi Sepeda / Motor S002', null, 'Garasi Roda Dua', 20000, 0, 0, 'available', now);
		insertGarage.run('S003', 'sepeda', 'Slot Garasi Sepeda / Motor S003', null, 'Garasi Roda Dua', 20000, 0, 0, 'available', now);

		// Garasi Mobil Bensin (Kode C...) - Tarif penitipan mobil: Rp 50.000 / hari (Bulanan Rp 1.250.000)
		insertGarage.run('C001', 'mobil', 'Slot Garasi Mobil C001', null, 'Garasi Mobil Bensin', 50000, 0, 0, 'available', now);
		insertGarage.run('C002', 'mobil', 'Slot Garasi Mobil C002', null, 'Garasi Mobil Bensin', 50000, 0, 0, 'available', now);
		insertGarage.run('C003', 'mobil', 'Slot Garasi Mobil C003', null, 'Garasi Mobil Bensin', 50000, 0, 0, 'available', now);
		insertGarage.run('C004', 'mobil', 'Slot Garasi Mobil C004', null, 'Garasi Mobil Bensin', 50000, 0, 0, 'available', now);

		// Garasi Mobil Listrik (Kode E...) - Tarif penitipan EV + SPKLU: Rp 75.000 / hari (Bulanan Rp 1.875.000) + Cas Rp 2.500 / kWh
		insertGarage.run('E001', 'mobil_listrik', 'Slot Garasi EV + SPKLU E001', null, 'Garasi Listrik & SPKLU', 75000, 2500, 0, 'available', now);
		insertGarage.run('E002', 'mobil_listrik', 'Slot Garasi EV + SPKLU E002', null, 'Garasi Listrik & SPKLU', 75000, 2500, 0, 'available', now);
		insertGarage.run('E003', 'mobil_listrik', 'Slot Garasi EV + SPKLU E003', null, 'Garasi Listrik & SPKLU', 75000, 2500, 0, 'available', now);
	}
}

/**
 * Sinkronisasi status garasi dan sewa berdasarkan tanggal hari ini:
 * - Sewa aktif yang sudah melewati tanggal selesai (end_date <= today) otomatis menjadi 'completed'
 * - Garasi yang sedang disewa aktif hari ini (start_date <= today AND end_date > today) berstatus 'used'
 * - Garasi lainnya berstatus 'available' (siap dirental)
 */
export function syncGarageStatuses(referenceDate?: string) {
	const today = referenceDate || new Date().toISOString().split('T')[0];

	try {
		// 1. Selesaikan kontrak rental aktif yang sudah selesai (end_date <= today)
		db.prepare(`
			UPDATE rentals 
			SET status = 'completed' 
			WHERE status = 'active' AND end_date <= ?
		`).run(today);

		// 2. Tandai garasi sebagai 'used' hanya jika ada sewa aktif yang mencakup hari ini
		db.prepare(`
			UPDATE garages 
			SET status = 'used' 
			WHERE id IN (
				SELECT DISTINCT garage_id FROM rentals 
				WHERE status = 'active' AND start_date <= ? AND end_date > ?
			)
		`).run(today, today);

		// 3. Kembalikan garasi menjadi 'available' jika tidak ada sewa aktif yang berjalan hari ini
		db.prepare(`
			UPDATE garages 
			SET status = 'available' 
			WHERE id NOT IN (
				SELECT DISTINCT garage_id FROM rentals 
				WHERE status = 'active' AND start_date <= ? AND end_date > ?
			)
		`).run(today, today);
	} catch (err) {
		console.error('Error syncing garage statuses:', err);
	}
}

// Inisialisasi DB saat modul dimuat
initDb();
syncGarageStatuses();
