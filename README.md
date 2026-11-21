# GARTA — Garasi Takalar (Sistem Smart Safe Garage & EV Hub)

[![SvelteKit 5](https://img.shields.io/badge/SvelteKit-5-orange.svg)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Unit_Tests-14%2F14_Passed-brightgreen.svg)](https://vitest.dev)
[![SQLite Relational](https://img.shields.io/badge/Database-SQLite_ACID-003B57.svg)](https://www.sqlite.org)

Proyek Uji Kompetensi Skema Sertifikasi Pemrogram (Nomor Skema: `IMT.01.15/SSK/LSP/IX/2021`) — Informatika Universitas Ciputra & Lembaga Sertifikasi Profesi (LSP).

* **Nama Asesi:** Muh. Ryan Ardiansyah
* **Nama Asesor:** Citra Lestari
* **Tanggal Pelaksanaan:** 21 November 2026
* **Repositori GitHub:** [Project_Garasi_LSP_Muh_Ryan_Ardiansyah](https://github.com/mzkyann/Project_Garasi_LSP_Muh_Ryan_Ardiansyah.git)

---

## 📋 Deskripsi Proyek
**GARTA (Garasi Takalar)** adalah platform web cerdas berbasis basis data relasional untuk mengelola operasional penyewaan tempat/slot garasi aman dan penitipan kendaraan di Kabupaten Takalar, baik secara harian maupun bulanan. Sistem mengelola tiga kategori unit garasi terstandarisasi:
1. **Garasi Sepeda & Sepeda Motor (Kode Prefix `S...`):** Khusus roda dua (sepeda gowes dan sepeda motor).
2. **Garasi Mobil Bensin (Kode Prefix `C...`):** Untuk kendaraan roda empat konvensional (bensin/diesel).
3. **Garasi Mobil Listrik EV (Kode Prefix `E...`):** Dilengkapi fasilitas pengisian daya baterai (*AC Wallbox Charging Station*).

---

## ✨ Fitur Sesuai Spesifikasi Soal Uji Praktik

### 1. Peran Penyewa (Customer)
* **Pendaftaran Akun Baru:** Validasi NIK KTP 16 digit, Nama Lengkap, Nomor HP, Email (sebagai username), dan Password. Status awal akun: `pending` menunggu verifikasi KTP admin.
* **Sewa Garasi Baru:**
  * Detail Kendaraan: Tipe (`sepeda`, `sepeda_motor`, `mobil`, `mobil_listrik`), Merek & Tipe Kendaraan, Nomor Plat Kendaraan (wajib diisi kecuali sepeda gowes), dan Kapasitas Baterai Listrik (kWh) untuk mobil listrik.
  * Durasi Sewa: Pilihan **Harian** (maksimal 30 hari) atau **Bulanan** (tarif dihitung otomatis: $25 \times \text{Tarif Harian}$).
  * Tanggal Mulai: Selalu tanggal hari ini (otomatis).
  * Tanggal Selesai: Dihitung otomatis oleh sistem berdasarkan tanggal mulai dan durasi.
  * Pilihan Unit Garasi: Hanya menampilkan slot garasi yang kompatibel dan berstatus kosong (*available*) pada periode sewa tersebut.
  * **Status Garasi Penuh Real-time:** Jika semua slot garasi pada tipe yang dipilih sedang terisi, sistem secara otomatis menampilkan tanda **⛔ GARASI PENUH**, lengkap dengan informasi **tanggal berapa lagi slot garasi akan kosong kembali** beserta tombol cepat penjadwalan.
  * Perhitungan Biaya Otomatis: Biaya sewa garasi ditambah biaya cas penuh (100% baterai $\text{kWh} \times \text{Tarif Listrik/kWh}$) jika mobil listrik berada di garasi mobil listrik.
  * Unggah Bukti Pelunasan Pembayaran: Pratinjau gambar bukti transfer/struk pelunasan sewa.
  * Status garasi otomatis menjadi `used` setelah transaksi disimpan.
* **Riwayat & Pengajuan Perpanjangan Sewa:**
  * Penyewa dapat melihat seluruh kontrak sewa berjalan dan selesai.
  * Fitur minta perpanjangan sewa: Sistem secara otomatis mendeteksi bentrok (*collision detection*). Jika slot garasi sudah dipesan oleh orang lain pada tanggal tersebut, perpanjangan **otomatis diblokir**.

### 2. Peran Administrator
* **Pengaturan Kapasitas & Pembuatan Garasi Massal (Batch):**
  * Admin dapat membuat unit slot garasi secara berkelompok (1 s/d 999 unit) sesuai tipe garasi (Sepeda `S...`, Mobil `C...`, Mobil Listrik `E...`).
  * Penomoran ID unik otomatis incremental 3 digit (contoh: `S001`, `S002`, `C010`).
  * Admin menentukan tarif sewa harian dan harga isi listrik per kWh (khusus garasi listrik).
* **Verifikasi KTP Pendaftar Baru:**
  * Admin memeriksa validitas identitas KTP pendaftar untuk menyetujui (*Approve*) atau menolak (*Reject*).
* **Pusat Persetujuan & Verifikasi Bukti Pembayaran:**
  * Admin dapat memeriksa detail pengajuan sewa, mengecek pratinjau zoom bukti transfer pembayaran, lalu melakukan ACC (setujui) atau tolak.
* **Perpanjang Status Garasi:**
  * Menampilkan daftar garasi yang sedang aktif disewa hari itu.
  * Admin dapat mengubah tanggal selesai sewa, sistem secara otomatis menghitung selisih hari dan sisa biaya tambahan, serta admin mengunggah bukti bayar perpanjangan.
* **Laporan Persewaan Garasi:**
  * Laporan per bulan dalam tahun tertentu.
  * Laporan per hari dalam bulan tertentu.
  * Laporan per tipe garasi.
  * Laporan per penyewa.
  * Dilengkapi tombol cetak / simpan PDF.
* **Halaman Profil Pengguna:**
  * Pengguna masuk ke halaman `/profile` terlebih dahulu untuk melihat informasi akun sebelum keluar (*logout* aman).

---

## 🏛️ Arsitektur & Prinsip Rekayasa Perangkat Lunak (OOP & Clean Architecture)

Proyek menerapkan prinsip Pemrograman Berorientasi Objek (*Object-Oriented Programming*):
* **Domain Model Hierarchy:**
  * `Vehicle` (Abstract) $\rightarrow$ `Bicycle`, `Motorcycle`, `GasolineCar`, `ElectricCar`.
  * `Garage` (Abstract) $\rightarrow$ `BicycleGarage`, `CarGarage`, `ElectricCarGarage`.
* **Domain Service:**
  * `RentalCalculator`: Validasi kecocokan tipe kendaraan dengan garasi, formula tanggal selesai, perhitungan sewa bulanan ($25 \times \text{harian}$), cas mobil listrik (100% full capacity), dan selisih hari perpanjangan sewa.
  * `GarageCodeGenerator`: Generator kode unik incremental berbasis prefix (`S`, `C`, `E`).
* **Basis Data Relasional SQLite (ACID):**
  * Skema relasional terstruktur dengan tabel `users`, `garages`, `rentals`, dan `rental_extensions`.
  * Mendukung *Foreign Keys*, *Constraints Check*, dan transaksi ACID.

---

## 🧪 Pengujian Unit Otomatis (Unit Testing)

Tersedia **14 skenario unit testing** berbasis Vitest yang menguji seluruh logika bisnis:
```bash
bun run test
# atau
npm run test
```
*Hasil Pengujian:*
```
 ✓  server  src/lib/vitest-examples/greet.spec.ts (1 test)
 ✓  server  src/lib/server/domain/domain.spec.ts (13 tests)

 Test Files  2 passed (2)
      Tests  14 passed (14)
   Duration  299ms (100% PASS)
```

---

## 🚀 Panduan Menjalankan Aplikasi

### Persyaratan Sistem:
* [Bun](https://bun.sh/) (atau Node.js versi 18 ke atas)

### Langkah Instalasi & Menjalankan:
```bash
# 1. Clone repositori
git clone https://github.com/mzkyann/Project_Garasi_LSP_Muh_Ryan_Ardiansyah.git
cd Project_Garasi_LSP_Muh_Ryan_Ardiansyah

# 2. Install dependensi
bun install
# atau: npm install

# 3. Jalankan type checking
bun run check

# 4. Jalankan unit test
bun run test

# 5. Jalankan server lokal
bun run dev
# atau: npm run dev
```
Akses aplikasi melalui browser: **`http://localhost:5173`**

---

## 🔑 Kredensial Akun untuk Penilaian

* **Akun Administrator:**
  * Email: `admin@garasi.id`
  * Password: `admin123`
* **Akun Penyewa Terverifikasi (Approved):**
  * Email: `budi@gmail.com`
  * Password: `budi123`
* **Akun Penyewa Menunggu Verifikasi KTP (Pending):**
  * Email: `ani@gmail.com`
  * Password: `ani123`

---

## 📑 Dokumen Laporan Lengkap
Dokumentasi teknis lengkap yang menyajikan Use Case Diagram, Class Diagram (OOP), Entity-Relationship Diagram (ERD), Penjelasan Library, dan Matriks Pengujian Unit dapat dibaca pada:
👉 **[LAPORAN_PROYEK.md](file:///d:/Magang/Sertifikasi/LAPORAN_PROYEK.md)**
