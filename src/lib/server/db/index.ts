// src/lib/server/db/index.ts
/**
 * Menerapkan Akses Basis Data Relasional
 * Unit Kompetensi: J.620100.021.02
 * Menggunakan SQLite (node:sqlite DatabaseSync) untuk persistensi relasional ACID
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve(process.cwd(), 'garage.db');
const db = new DatabaseSync(dbPath);

// Aktifkan Foreign Keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDb() {
	// 1. Tabel Users
	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nik TEXT NOT NULL UNIQUE,
			name TEXT NOT NULL,
			phone TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
			role TEXT NOT NULL CHECK(role IN ('admin', 'penyewa')),
			status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
			created_at TEXT NOT NULL
		);
	`);

	// 2. Tabel Garages
	db.exec(`
		CREATE TABLE IF NOT EXISTS garages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			code TEXT NOT NULL UNIQUE,
			type TEXT NOT NULL CHECK(type IN ('sepeda', 'mobil', 'mobil_listrik')),
			daily_price REAL NOT NULL,
			electricity_price_kwh REAL DEFAULT 0,
			status TEXT NOT NULL CHECK(status IN ('available', 'used')),
			created_at TEXT NOT NULL
		);
	`);

	// 3. Tabel Rentals
	db.exec(`
		CREATE TABLE IF NOT EXISTS rentals (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			garage_id INTEGER NOT NULL REFERENCES garages(id) ON DELETE RESTRICT,
			vehicle_type TEXT NOT NULL CHECK(vehicle_type IN ('sepeda', 'sepeda_motor', 'mobil', 'mobil_listrik')),
			license_plate TEXT,
			vehicle_brand_model TEXT NOT NULL,
			battery_capacity_kwh REAL DEFAULT 0,
			rental_type TEXT NOT NULL CHECK(rental_type IN ('harian', 'bulanan')),
			duration INTEGER NOT NULL,
			start_date TEXT NOT NULL,
			end_date TEXT NOT NULL,
			base_rental_cost REAL NOT NULL,
			electricity_cost REAL DEFAULT 0,
			total_cost REAL NOT NULL,
			payment_proof TEXT,
			status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
			created_at TEXT NOT NULL
		);
	`);

	// 4. Tabel Rental Extensions
	db.exec(`
		CREATE TABLE IF NOT EXISTS rental_extensions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			rental_id INTEGER NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
			old_end_date TEXT NOT NULL,
			new_end_date TEXT NOT NULL,
			additional_days INTEGER NOT NULL,
			additional_cost REAL NOT NULL,
			payment_proof TEXT NOT NULL,
			created_at TEXT NOT NULL
		);
	`);

	seedInitialData();
}

function seedInitialData() {
	const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
	const now = new Date().toISOString();
	const today = now.split('T')[0];

	if (userCount.count === 0) {
		// Seed Admin
		const insertUser = db.prepare(`
			INSERT INTO users (nik, name, phone, email, password, role, status, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`);

		insertUser.run('1234567890123456', 'Administrator Garasi', '08123456789', 'admin@garasi.id', 'admin123', 'admin', 'approved', now);
		insertUser.run('3578012345670001', 'Budi Santoso', '08129876543', 'budi@gmail.com', 'budi123', 'penyewa', 'approved', now);
		insertUser.run('3578019876540002', 'Ani Wijaya', '08561234987', 'ani@gmail.com', 'ani123', 'penyewa', 'pending', now);
	}

	const garageCount = db.prepare('SELECT COUNT(*) as count FROM garages').get() as { count: number };
	if (garageCount.count === 0) {
		const insertGarage = db.prepare(`
			INSERT INTO garages (code, type, daily_price, electricity_price_kwh, status, created_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`);

		// Sepeda
		insertGarage.run('S001', 'sepeda', 10000, 0, 'available', now);
		insertGarage.run('S002', 'sepeda', 10000, 0, 'available', now);

		// Mobil
		insertGarage.run('C001', 'mobil', 50000, 0, 'available', now);
		insertGarage.run('C002', 'mobil', 50000, 0, 'available', now);
		insertGarage.run('C003', 'mobil', 50000, 0, 'available', now);

		// Mobil Listrik
		insertGarage.run('E001', 'mobil_listrik', 75000, 2500, 'available', now);
		insertGarage.run('E002', 'mobil_listrik', 75000, 2500, 'available', now);

		// Buat 1 rental aktif untuk demo perpanjang
		const budiUser = db.prepare('SELECT id FROM users WHERE email = ?').get('budi@gmail.com') as { id: number };
		const c001Garage = db.prepare('SELECT id, daily_price FROM garages WHERE code = ?').get('C001') as { id: number; daily_price: number };

		if (budiUser && c001Garage) {
			const endDateObj = new Date();
			endDateObj.setDate(endDateObj.getDate() + 5);
			const endDate = endDateObj.toISOString().split('T')[0];

			const insertRental = db.prepare(`
				INSERT INTO rentals (
					user_id, garage_id, vehicle_type, license_plate, vehicle_brand_model,
					battery_capacity_kwh, rental_type, duration, start_date, end_date,
					base_rental_cost, electricity_cost, total_cost, payment_proof, status, created_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`);

			insertRental.run(
				budiUser.id,
				c001Garage.id,
				'mobil',
				'L 1234 AB',
				'Toyota Avanza 2023',
				0,
				'harian',
				5,
				today,
				endDate,
				250000,
				0,
				250000,
				'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="%2322c55e"/><text x="10" y="55" fill="white">BUKTI BAYAR LUNAS</text></svg>',
				'active',
				now
			);

			// Tandai garasi C001 used
			db.prepare('UPDATE garages SET status = ? WHERE id = ?').run('used', c001Garage.id);
		}
	}
}

// Inisialisasi DB saat modul dimuat
initDb();

export { db };
