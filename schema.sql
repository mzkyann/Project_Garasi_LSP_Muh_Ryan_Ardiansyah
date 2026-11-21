-- ====================================================================
-- SKEMA BASIS DATA RELASIONAL (RELATIONAL DATABASE SCHEMA)
-- Sistem Manajemen Persewaan Garasi Kendaraan (GARASI.ID)
-- Skema Sertifikasi Pemrogram (IMT.01.15/SSK/LSP/IX/2021)
-- Unit Kompetensi: J.620100.021.02 Menerapkan Akses Basis Data
-- ====================================================================

PRAGMA foreign_keys = ON;

-- --------------------------------------------------------------------
-- 1. TABEL PENGGUNA (USERS)
-- Menyimpan data Admin dan Penyewa dengan validasi NIK (Nomor KTP)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);

-- --------------------------------------------------------------------
-- 2. TABEL GARASI (GARAGES)
-- Menyimpan daftar unit garasi dengan kode unik incremental (S001, C001, E001)
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_garages_type_status ON garages(type, status);
CREATE INDEX IF NOT EXISTS idx_garages_code ON garages(code);

-- --------------------------------------------------------------------
-- 3. TABEL TRANSAKSI PERSEWAAN (RENTALS)
-- Menyimpan transaksi sewa garasi baru oleh penyewa
-- --------------------------------------------------------------------
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
    base_rental_cost REAL NOT NULL CHECK(base_rental_cost >= 0),
    electricity_cost REAL DEFAULT 0 CHECK(electricity_cost >= 0),
    total_cost REAL NOT NULL CHECK(total_cost >= 0),
    payment_proof TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rentals_user ON rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_garage ON rentals(garage_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status_dates ON rentals(status, start_date, end_date);

-- --------------------------------------------------------------------
-- 4. TABEL PERPANJANGAN SEWA (RENTAL_EXTENSIONS)
-- Menyimpan riwayat perpanjangan masa sewa oleh admin
-- --------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_extensions_rental ON rental_extensions(rental_id);

