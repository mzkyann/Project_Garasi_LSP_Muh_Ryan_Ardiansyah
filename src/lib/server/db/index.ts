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
				car_type TEXT DEFAULT 'Standar',
				daily_price REAL NOT NULL CHECK(daily_price > 0),
				electricity_price_kwh REAL DEFAULT 0 CHECK(electricity_price_kwh >= 0),
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
				status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
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
				created_at TEXT NOT NULL
			);
		`);
	}

	// Migrasi aman untuk menambahkan car_type jika tabel sudah ada sebelumnya
	try {
		db.exec(`ALTER TABLE garages ADD COLUMN car_type TEXT DEFAULT 'Standar';`);
	} catch (e) {
		// Kolom car_type sudah ada
	}

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
			INSERT INTO garages (code, type, car_type, daily_price, electricity_price_kwh, status, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`);

		// Garasi Sepeda & Motor (Kode S...) - Tarif Sepeda Motor: 125rb per hari
		insertGarage.run('S001', 'sepeda', 'Sepeda Motor Matic / Bebek (Vario, Beat)', 125000, 0, 'used', now);
		insertGarage.run('S002', 'sepeda', 'Sepeda Motor Sport / Maxi (NMax, PCX, CBR)', 125000, 0, 'available', now);
		insertGarage.run('S003', 'sepeda', 'Sepeda Motor Trail / Gowes (CRF, Polygon)', 125000, 0, 'available', now);

		// Garasi Mobil (Kode C...) - Tarif Mobil: 500rb s/d 1jt per hari
		insertGarage.run('C001', 'mobil', 'City Car / Hatchback (Honda Brio, Toyota Yaris)', 500000, 0, 'used', now);
		insertGarage.run('C002', 'mobil', 'MPV Keluarga (Toyota Avanza, Mitsubishi Xpander)', 650000, 0, 'used', now);
		insertGarage.run('C003', 'mobil', 'Medium SUV / Crossover (Honda HR-V, Hyundai Creta)', 750000, 0, 'available', now);
		insertGarage.run('C004', 'mobil', 'Executive Sedan / Luxury SUV (Toyota Camry, Fortuner)', 1000000, 0, 'available', now);

		// Garasi Mobil Listrik (Kode E...) - Dilengkapi SPKLU AC Wallbox
		insertGarage.run('E001', 'mobil_listrik', 'Crossover EV (Hyundai Ioniq 5, Kona EV)', 750000, 2500, 'used', now);
		insertGarage.run('E002', 'mobil_listrik', 'Performance EV Sedan (BYD Seal Performance)', 850000, 2500, 'available', now);
		insertGarage.run('E003', 'mobil_listrik', 'Flagship Luxury EV (Kia EV9, BMW iX)', 1000000, 2500, 'available', now);

		// Ambil User Budi & Garasi-garasi untuk membuat transaksi sampel
		const budiUser = db.prepare('SELECT id FROM users WHERE email = ?').get('budi@gmail.com') as { id: number };
		const c001 = db.prepare('SELECT id, daily_price FROM garages WHERE code = ?').get('C001') as any;
		const c002 = db.prepare('SELECT id, daily_price FROM garages WHERE code = ?').get('C002') as any;
		const e001 = db.prepare('SELECT id, daily_price, electricity_price_kwh FROM garages WHERE code = ?').get('E001') as any;
		const s001 = db.prepare('SELECT id, daily_price FROM garages WHERE code = ?').get('S001') as any;

		if (budiUser && c001 && e001 && s001) {
			const paymentProofSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="%2322c55e"/><text x="10" y="55" fill="white" font-weight="bold">BUKTI BAYAR LUNAS</text></svg>';

			const insertRental = db.prepare(`
				INSERT INTO rentals (
					user_id, garage_id, vehicle_type, license_plate, vehicle_brand_model,
					battery_capacity_kwh, rental_type, duration, start_date, end_date,
					base_rental_cost, electricity_cost, total_cost, payment_proof, status, created_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`);

			// Rental 1: Mobil Bensin di C001 (5 hari x 500.000 = 2.500.000)
			const endC001 = new Date();
			endC001.setDate(endC001.getDate() + 5);
			const r1Result = insertRental.run(
				budiUser.id,
				c001.id,
				'mobil',
				'L 1234 AB',
				'Toyota Avanza 1.5G 2024',
				0,
				'harian',
				5,
				today,
				endC001.toISOString().split('T')[0],
				2500000,
				0,
				2500000,
				paymentProofSvg,
				'active',
				now
			);

			// Rental 2: Mobil Listrik di E001 (3 hari x 750.000 = 2.250.000 + 60 kWh x 2500 = 150.000 => 2.400.000)
			const endE001 = new Date();
			endE001.setDate(endE001.getDate() + 3);
			insertRental.run(
				budiUser.id,
				e001.id,
				'mobil_listrik',
				'B 5678 EV',
				'Hyundai Ioniq 5 Signature',
				60,
				'harian',
				3,
				today,
				endE001.toISOString().split('T')[0],
				2250000,
				150000, // 60 kWh * 2500
				2400000,
				paymentProofSvg,
				'active',
				now
			);

			// Rental 3: Sepeda Motor di S001 (Bulanan: 1 bulan = 25 x 125.000 = 3.125.000)
			const endS001 = new Date();
			endS001.setMonth(endS001.getMonth() + 1);
			insertRental.run(
				budiUser.id,
				s001.id,
				'sepeda_motor',
				'L 9876 XYZ',
				'Honda Vario 160 ABS',
				0,
				'bulanan',
				1,
				today,
				endS001.toISOString().split('T')[0],
				3125000,
				0,
				3125000,
				paymentProofSvg,
				'active',
				now
			);

			// Rental 4: Mobil di C002 (7 hari x 650.000 = 4.550.000)
			const endC002 = new Date();
			endC002.setDate(endC002.getDate() + 7);
			insertRental.run(
				budiUser.id,
				c002.id,
				'mobil',
				'N 9999 CD',
				'Mitsubishi Xpander Ultimate',
				0,
				'harian',
				7,
				today,
				endC002.toISOString().split('T')[0],
				4550000,
				0,
				4550000,
				paymentProofSvg,
				'active',
				now
			);

			// Tambahkan 1 riwayat perpanjangan pada Rental 1 (2 hari x 500.000 = 1.000.000)
			const rental1Id = Number(r1Result.lastInsertRowid);
			if (rental1Id) {
				const extEnd = new Date(endC001);
				extEnd.setDate(extEnd.getDate() + 2);

				db.prepare(`
					INSERT INTO rental_extensions (
						rental_id, old_end_date, new_end_date, additional_days, additional_cost, payment_proof, created_at
					) VALUES (?, ?, ?, ?, ?, ?, ?)
				`).run(
					rental1Id,
					endC001.toISOString().split('T')[0],
					extEnd.toISOString().split('T')[0],
					2,
					1000000, // 2 * 500.000
					paymentProofSvg,
					now
				);
			}
		}
	}
}

// Inisialisasi DB saat modul dimuat
initDb();
