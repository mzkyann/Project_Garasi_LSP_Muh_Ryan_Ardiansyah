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
	if (garageCount.count === 0) {
		const insertGarage = db.prepare(`
			INSERT INTO garages (code, type, vehicle_name, license_plate, car_type, daily_price, electricity_price_kwh, battery_capacity_kwh, status, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);

		// Garasi Sepeda & Sepeda Motor (Kode S...) - Tarif Sepeda Motor: 125rb per hari
		insertGarage.run('S001', 'sepeda', 'Honda Vario 160 ABS', 'L 9876 XYZ', 'Sepeda Motor Matic', 125000, 0, 0, 'available', now);
		insertGarage.run('S002', 'sepeda', 'Yamaha NMax 155 Connected', 'B 4567 NMX', 'Sepeda Motor Maxi', 125000, 0, 0, 'available', now);
		insertGarage.run('S003', 'sepeda', 'Honda CRF 150L Trail', 'W 3456 CRF', 'Sepeda Motor Trail', 125000, 0, 0, 'available', now);

		// Garasi Mobil (Kode C...) - Tarif Mobil: 500rb s/d 1jt per hari
		insertGarage.run('C001', 'mobil', 'Toyota Avanza 1.5G', 'L 1234 AB', 'MPV Keluarga', 500000, 0, 0, 'available', now);
		insertGarage.run('C002', 'mobil', 'Mitsubishi Xpander Ultimate', 'N 9999 CD', 'MPV Keluarga', 650000, 0, 0, 'available', now);
		insertGarage.run('C003', 'mobil', 'Honda HR-V SE 1.5 CVT', 'B 2345 HRV', 'Medium SUV', 750000, 0, 0, 'available', now);
		insertGarage.run('C004', 'mobil', 'Toyota Camry 2.5 V Luxury', 'B 1000 CMR', 'Executive Sedan', 1000000, 0, 0, 'available', now);

		// Garasi Mobil Listrik (Kode E...) - Dilengkapi SPKLU AC Wallbox
		insertGarage.run('E001', 'mobil_listrik', 'Hyundai Ioniq 5 Signature', 'B 5678 EV', 'Crossover EV', 750000, 2500, 58, 'available', now);
		insertGarage.run('E002', 'mobil_listrik', 'BYD Seal Performance AWD', 'B 3456 BYD', 'Performance EV Sedan', 850000, 2500, 82, 'available', now);
		insertGarage.run('E003', 'mobil_listrik', 'Kia EV9 GT-Line AWD', 'B 9999 KIA', 'Flagship Luxury EV', 1000000, 2500, 99.8, 'available', now);
	}
}

// Inisialisasi DB saat modul dimuat
initDb();
