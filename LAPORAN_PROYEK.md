# LAPORAN PROYEK UJI KOMPETENSI SKEMA SERTIFIKASI PEMROGRAM
## Sistem Manajemen dan Penyewaan Garasi Terpadu (GARASI TA / GARTA)

- **Nama Peserta:** Muh. Ryan Ardiansyah
- **Nomor Registrasi Asesi:** (Sesuai Form APL-01 / APL-02)
- **Skema Sertifikasi:** Okupasi Pemrogram
- **Nomor Skema:** IMT.01.15/SSK/LSP/IX/2021
- **Nama Asesor:** Citra Lestari
- **Tanggal Pelaksanaan:** 22 November 2026
- **Jenis Aplikasi:** Aplikasi Web Full-Stack dengan Basis Data Relasional Terstruktur (ACID)
- **Repositori GitHub:** https://github.com/mzkyann/Project_Garasi_LSP_Muh_Ryan_Ardiansyah

---

## 1. Ringkasan Sistem dan Spesifikasi Kebutuhan

### 1.1 Deskripsi Umum Sistem
**GARASI TA (GARTA - Garasi Takalar)** adalah sistem aplikasi berbasis web terintegrasi yang dirancang untuk mengelola unit garasi kendaraan dan transaksi penyewaan secara aman, transparan, dan terstruktur. Sistem ini mengakomodasi berbagai jenis kendaraan, mulai dari kendaraan roda dua (sepeda manual dan sepeda motor), mobil konvensional (bensin/diesel), hingga kendaraan masa depan yaitu mobil listrik (*Electric Vehicle* / EV) yang terintegrasi dengan stasiun pengisian daya (*Wallbox SPKLU*). Sistem memisahkan peran pengguna secara tegas berbasis hak akses (*Role-Based Access Control*), yaitu peran **Administrator** dan **Penyewa**.

Aplikasi dibangun untuk memenuhi seluruh standar kompetensi kerja nasional pada skema Okupasi Pemrogram:
1. **J.620100.009.02 (Menggunakan Spesifikasi Program):** Menerjemahkan seluruh aturan bisnis penitipan garasi, perhitungan tarif harian/bulanan, formula tarif pengisian listrik EV, pembatasan kuota dan penomoran batch, hingga perpanjangan masa sewa aktif.
2. **J.620100.016.01 (Menulis Kode dengan Prinsip Guidelines & Best Practices):** Menerapkan arsitektur *Clean Code*, pemisahan *Domain Logic*, *Persistence Layer*, dan *UI Presentation Layer*.
3. **J.620100.017.02 (Pemrograman Terstruktur):** Logika modular pada kalkulasi tarif, filter tanggal collision-free, dan alur perpanjangan masa sewa.
4. **J.620100.018.02 (Pemrograman Berorientasi Objek / OOP):** Mengimplementasikan pewarisan (*inheritance*), enkapsulasi, polimorfisme, dan abstraksi pada kelas `Vehicle` dan kelas `Garage`.
5. **J.620100.019.02 (Menggunakan Library / Komponen Pre-Existing):** Memanfaatkan SvelteKit 5, TypeScript, Tailwind CSS v4, Lucide Icons, dan Vitest.
6. **J.620100.021.02 (Menerapkan Akses Basis Data Relasional):** Basis data relasional SQLite (`node:sqlite`) dengan dukungan *Foreign Keys*, integritas referensial, dan transaksi ACID.
7. **J.620100.025.02 (Melakukan Debugging):** Penanganan validasi form di sisi server, penanganan bentrok jadwal, dan proteksi error yang *graceful*.
8. **J.62010.033.02 (Melaksanakan Pengujian Unit Program):** Pengujian otomatis menggunakan Vitest dengan metode *Black-box Testing* (*Boundary Value Analysis* dan *Equivalence Partitioning*).

---

### 1.2 Kebutuhan Fungsional Sistem
1. **Autentikasi dan Pendaftaran Pengguna:**
   - Calon penyewa mendaftar akun baru dengan mengisikan Nomor Induk Kependudukan (NIK) tepat 16 digit angka, nama lengkap, nomor telepon (10–15 digit), email unik (sebagai username login), dan kata sandi minimal 6 karakter.
   - Status awal setiap pendaftar baru adalah `pending` dan wajib diverifikasi oleh Administrator sebelum dapat melakukan transaksi sewa.
   - Sistem menyediakan autentikasi berbasis sesi (*session-based authentication*) yang membedakan hak akses halaman Admin dan Penyewa secara aman.

2. **Verifikasi Calon Penyewa oleh Administrator:**
   - Administrator memiliki wewenang untuk memeriksa data calon penyewa beserta validitas NIK 16 digit.
   - Administrator dapat menyetujui (*APPROVED*) atau menolak (*REJECTED*) pendaftaran. Pengguna yang disetujui otomatis dapat masuk ke modul sewa baru.

3. **Manajemen Unit Garasi dan Pembuatan Massal (Bulk Creation):**
   - Administrator dapat menambahkan sejumlah unit garasi baru secara berkelompok (*batch creation*) sesuai kategori:
     - Kategori **Sepeda & Sepeda Motor** (Prefix kode: `S001` s/d `S999`).
     - Kategori **Mobil Konvensional** (Prefix kode: `C001` s/d `C999`).
     - Kategori **Mobil Listrik / EV** (Prefix kode: `E001` s/d `E999`).
   - Kode garasi digenerate secara otomatis dan inkremental dengan batas maksimal 999 unit per kategori.
   - Administrator menentukan tarif sewa harian dan tarif pengisian daya listrik per kWh (khusus garasi mobil listrik). Tarif sewa bulanan dihitung flat sebesar 25 kali tarif sewa harian.

4. **Sewa Baru Garasi oleh Penyewa Terverifikasi:**
   - Penyewa memilih kategori kendaraan: Sepeda, Sepeda Motor, Mobil Bensin, atau Mobil Listrik.
   - Pengguna wajib memasukkan plat nomor polisi (wajib kecuali sepeda manual), merek & tipe kendaraan, serta kapasitas baterai listrik (kWh) khusus mobil listrik.
   - Penyewa memilih skema durasi: **Harian** (maksimal 30 hari) atau **Bulanan** (kelipatan bulan). Tanggal mulai sewa ditentukan oleh pengguna.
   - Sistem melakukan pengecekan kompatibilitas kendaraan terhadap garasi:
     - Sepeda dan Sepeda Motor hanya boleh menyewa Garasi Sepeda (`S`).
     - Mobil Konvensional hanya boleh menyewa Garasi Mobil (`C`).
     - Mobil Listrik dapat menyewa Garasi Mobil (`C`) atau Garasi Mobil Listrik (`E`).
   - Sistem hanya menampilkan daftar garasi yang berstatus tersedia (*available*) dan tidak bertabrakan (*collision-free*) dengan penyewaan lain pada rentang tanggal yang dipilih.
   - Perhitungan total biaya dihitung secara transparan dan otomatis oleh sistem:
     $$\text{Total Biaya} = \text{Biaya Pokok Sewa} + \text{Biaya Cas Listrik EV}$$
     Di mana biaya cas mobil listrik pada garasi EV adalah $\text{Kapasitas Baterai (kWh)} \times \text{Tarif Listrik per kWh}$ (kewajiban pengisian 100% penuh).
   - Penyewa mengunggah bukti transfer pelunasan pembayaran. Setelah transaksi berhasil disimpan, status transaksi menjadi `pending` menunggu verifikasi admin.

5. **Persetujuan Transaksi & Sinkronisasi Status Garasi:**
   - Administrator memeriksa transaksi masuk beserta bukti bayar yang diunggah.
   - Setelah disetujui Admin, status transaksi berubah menjadi `aktif` (*active*) dan status unit garasi otomatis berubah menjadi `terpakai` (*used*).
   - Sistem secara otomatis menyinkronkan status garasi setiap hari: jika masa sewa telah berakhir, status sewa berubah menjadi `selesai` (*completed*) dan unit garasi kembali `tersedia` (*available*).

6. **Perpanjangan Masa Sewa Aktif oleh Administrator:**
   - Aplikasi menampilkan daftar garasi yang sedang aktif disewa pada hari berjalan.
   - Administrator memilih garasi yang ingin diperpanjang dan menentukan tanggal selesai sewa baru.
   - Sistem secara real-time menghitung durasi tambahan hari dan sisa biaya perpanjangan:
     $$\text{Sisa Biaya} = \text{Tambahan Hari} \times \text{Tarif Harian Garasi}$$
     *(atau perhitungan paket kelipatan 25x untuk perpanjangan bulan penuh)*.
   - Administrator mengunggah bukti pembayaran perpanjangan dan menyimpannya ke sistem.

7. **Laporan Persewaan dan Rekapitulasi Keuangan:**
   - Menampilkan ringkasan pendapatan kotor, total transaksi, unit terisi, dan rekapitulasi data.
   - Menyediakan 4 mode penyaringan (*filter*):
     - **Per Bulan dalam Tahun Tertentu:** Menampilkan tren omzet bulanan.
     - **Per Hari dalam Bulan Tertentu:** Rincian pemasukan harian.
     - **Per Tipe Garasi:** Perbandingan utilisasi garasi Sepeda, Mobil, dan EV.
     - **Per Penyewa:** Riwayat transaksi spesifik per pelanggan.
   - Dilengkapi tombol cetak laporan (*Print / Save to PDF*) siap pakai untuk kebutuhan audit.

---

## 2. Use Case Diagram

Diagram Use Case menggambarkan batasan sistem serta interaksi fungsional antara Aktor terhadap fitur-fitur aplikasi.

```
[Tempat Gambar 1: Masukkan Gambar Use Case Diagram Sistem GARASI TA di sini]
```
*Gambar 1. Use Case Diagram Sistem GARASI TA*

### Deskripsi Interaksi Aktor:
1. **Calon Penyewa:**
   - Mengakses formulir pendaftaran akun menggunakan NIK 16 digit, nama lengkap, telepon, email, dan password.
   - Melakukan login ke sistem untuk memantau status verifikasi akun pada dashboard.
2. **Penyewa (Terverifikasi / Approved):**
   - Mewarisi hak akses pengguna terdaftar.
   - Mengakses formulir Sewa Garasi Baru: memilih tipe kendaraan, input kapasitas baterai kWh, memilih durasi sewa (harian/bulanan), memeriksa ketersediaan slot garasi, melihat rincian biaya real-time, dan mengunggah foto bukti pembayaran.
   - Mengakses menu Riwayat Sewa untuk melihat detail kontrak aktif, status pembayaran, dan riwayat perpanjangan.
3. **Administrator:**
   - Melakukan autentikasi akun administrator.
   - Mengelola verifikasi pendaftaran calon penyewa baru (menyetujui atau menolak akun).
   - Mengelola inventaris unit garasi: membuat unit garasi secara berkelompok (*batch S/C/E*), menentukan tarif harian, tarif bulanan, dan tarif listrik.
   - Memeriksa dan menyetujui transaksi sewa baru (*ACC Sewa*).
   - Memperpanjang masa sewa garasi aktif di hari berjalan, menghitung sisa tagihan, dan mengunggah bukti bayar perpanjangan.
   - Mengakses, memfilter, dan mencetak laporan transaksi persewaan ke format dokumen PDF.

---

## 3. Class Diagram (Arsitektur Berorientasi Objek / OOP)

Sesuai dengan unit kompetensi **J.620100.018.02**, sistem dirancang menggunakan prinsip Pemrograman Berorientasi Objek (*Object-Oriented Programming*) dengan membagi kode ke dalam 3 lapisan modular: **Domain Models (OOP Hierarchy)**, **Business Services**, dan **Utilities**.

```
[Tempat Gambar 2: Masukkan Gambar Class Diagram Arsitektur Berorientasi Objek di sini]
```
*Gambar 2. Class Diagram Arsitektur Sistem GARASI TA*

### Penjelasan Struktur Kelas dan Prinsip OOP:
1. **Hierarki Kelas Kendaraan (`Vehicle`):**
   - **`Vehicle` (Abstract Base Class):** Memiliki atribut terlindungi (`#_category`, `#_brandAndType`, `#_licensePlate`) dan metode validasi plat nomor `validateLicensePlate(): boolean`.
   - **`Bicycle`:** Kelas turunan untuk sepeda gowes; plat nomor bersifat opsional/null.
   - **`Motorcycle`:** Kelas turunan untuk sepeda motor; wajib plat nomor dan memiliki kapasitas mesin `engineCc`.
   - **`GasolineCar`:** Kelas turunan untuk mobil berbahan bakar bensin/diesel; wajib plat nomor polisi dan jenis BBM.
   - **`ElectricCar`:** Kelas turunan untuk mobil listrik; memiliki atribut privat `-batteryCapacityKwh` serta metode polimorfik untuk menghitung kebutuhan pengisian daya listrik.

2. **Hierarki Kelas Garasi (`Garage`):**
   - **`Garage` (Abstract Base Class):** Menyimpan atribut kode unit unik (`code`), tipe garasi (`type`), tarif sewa harian (`dailyPrice`), dan status ketersediaan (`status`). Memiliki getter otomatis `monthlyPrice = 25 * dailyPrice`.
   - **`BicycleGarage`:** Subclass khusus slot parkir beratap untuk sepeda dan sepeda motor (prefix `S`).
   - **`CarGarage`:** Subclass untuk garasi mobil keluarga standar (prefix `C`).
   - **`ElectricCarGarage`:** Subclass eksklusif yang memiliki atribut tambahan `-electricityPricePerKwh` untuk fasilitas SPKLU Wallbox (prefix `E`).

3. **Domain Service & Utilities:**
   - **`RentalCalculator` (Domain Service):** Menangani logika validasi bisnis kompleks, seperti pengecekan matriks kecocokan kendaraan terhadap garasi (`isCompatible`), kalkulasi tanggal selesai, kalkulasi tarif sewa pokok dan listrik, serta perhitungan sisa tagihan perpanjangan.
   - **`GarageCodeGenerator` (Utility):** Menghasilkan kode unit garasi standar 3-digit berurutan (`S001`, `C010`, `E999`) dan memvalidasi batas kapasitas 1–999 unit.
   - **`Rental` & `RentalExtension`:** Entitas transaksi yang menghubungkan pengguna, garasi, dan kendaraan.

---

## 4. Entity-Relationship Diagram (ERD Basis Data Relasional)

Sistem basis data dirancang menggunakan prinsip **Normalisasi Basis Data (Third Normal Form / 3NF)** untuk mencegah redundansi data dan menjamin integritas referensial data melalui *Foreign Key Constraints*.

```
[Tempat Gambar 3: Masukkan Gambar Entity-Relationship Diagram (ERD) di sini]
```
*Gambar 3. Entity-Relationship Diagram (ERD) Basis Data Relasional*

### Rincian Tabel dan Skema Basis Data Relasional:

| Nama Tabel | Primary Key (PK) | Foreign Key (FK) | Keterangan & Integritas Kolom |
|---|---|---|---|
| **`users`** | `id` (INTEGER) | - | Menyimpan kredensial pengguna (Admin & Penyewa), NIK unik 16 digit (`CHECK(length(nik) = 16)`), nomor telepon, email unik, password hash, dan status verifikasi (`pending`, `approved`, `rejected`). |
| **`garages`** | `id` (INTEGER) | - | Master data unit fisik garasi dengan kode unik (`S001`, `C001`, `E001`), tipe garasi, tarif sewa harian, tarif listrik per kWh, dan status fisik (`available`, `used`). |
| **`rentals`** | `id` (INTEGER) | `user_id` $\rightarrow$ `users(id)`<br/>`garage_id` $\rightarrow$ `garages(id)` | Transaksi kontrak sewa garasi, mencatat jenis kendaraan, plat nomor, kapasitas baterai, tipe sewa (harian/bulanan), tanggal mulai, tanggal selesai, rincian biaya sewa, biaya listrik, total bayar, bukti transfer, dan status sewa. |
| **`rental_extensions`** | `id` (INTEGER) | `rental_id` $\rightarrow$ `rentals(id)` | Riwayat perpanjangan masa sewa garasi aktif, mencatat tanggal batas lama, tanggal batas baru, jumlah tambahan hari sewa, biaya perpanjangan, dan file bukti pembayaran. |

### Matriks Relasi dan Kardinalitas Antar Tabel:
| Hubungan Relasi | Kardinalitas | Penjelasan Bisnis Integritas Relasional |
|---|:---:|---|
| **`users` $\rightarrow$ `rentals`** | **1 : N** | Satu pengguna (penyewa) dapat melakukan banyak transaksi penyewaan garasi di waktu yang sama maupun berbeda. Terhubung dengan *Foreign Key* `ON DELETE CASCADE`. |
| **`garages` $\rightarrow$ `rentals`** | **1 : N** | Satu unit garasi dapat disewa berulang kali pada rentang tanggal/jadwal yang berbeda sepanjang waktu. Terhubung dengan *Foreign Key* `ON DELETE RESTRICT` untuk melindungi integritas unit fisik. |
| **`rentals` $\rightarrow$ `rental_extensions`** | **1 : N** | Satu transaksi penyewaan garasi dapat diperpanjang beberapa kali selama masa kontrak berjalan. Terhubung dengan *Foreign Key* `ON DELETE CASCADE`. |

---

## 5. Penjelasan Library / Pre-Existing Component yang Digunakan

Dalam pemenuhan unit kompetensi **J.620100.019.02 (Menggunakan Library atau Komponen Pre-Existing)**, proyek ini memanfaatkan ekosistem modern yang teruji performanya:

| No | Library / Tools | Versi | Lisensi | Fungsi dan Alasan Pemilihan |
|:---:|---|:---:|:---:|---|
| 1 | **SvelteKit** | `^3.2.0` | MIT | Framework full-stack modern dengan kompilasi reaktif (*Svelte 5 Runes*). Menangani perutean berbasis file (`+page.svelte`), aksi form server-side (`+page.server.ts`), dan server-side rendering (SSR) berkecepatan tinggi dalam satu arsitektur terpadu. |
| 2 | **Svelte Core** | `^5.57.3` | MIT | Engine antarmuka reaktif tanpa *virtual DOM overhead*, memastikan performa kalkulasi biaya real-time dan interaksi antarmuka berjalan sangat mulus. |
| 3 | **TypeScript** | `^6.0.3` | Apache-2.0 | Menjamin *type safety* pada seluruh entitas model domain, kontrak request/response, dan mencegah bug runtime pada kalkulasi durasi serta tarif sewa. |
| 4 | **Tailwind CSS v4** | `^4.3.5` | MIT | Framework CSS modern utilitas generasi terbaru berbasis engine performa tinggi, mempermudah pembuatan antarmuka responsif elegan dengan palet warna resmi Skandinavia (*Warm Olive Bronze*, *Sage Green*, *Cream Linen*, *Sand Khaki*). |
| 5 | **node:sqlite (DatabaseSync)** | Bawaan Node.js 22 | MIT | Driver engine basis data relasional SQLite resmi bawaan Node.js runtime. Memproses query SQL transaksional ACID, integritas *Foreign Keys*, dan migrasi skema tabel tanpa dependensi binary eksternal yang rumit. |
| 6 | **Lucide Icons (`@lucide/svelte`)** | `^1.77.0` | ISC | Kumpulan ikon vektor SVG modern yang ringan dan konsisten untuk memperjelas navigasi visual (ikon mobil, sepeda motor, garasi, SPKLU, status verifikasi, dan laporan). |
| 7 | **Vitest** | `^5.1.0` | MIT | Framework pengujian unit (*Unit Testing*) berkecepatan tinggi berbasis Vite runner, digunakan untuk menguji validasi batas input, kompatibilitas kendaraan, formula tarif, dan aturan perpanjangan sewa. |

---

## 6. Fitur-Fitur Aplikasi yang Dihasilkan

### 6.1 Halaman Utama (Landing Page & 3D Interactive Hub)
Halaman depan menampilkan profil layanan GARTA Takalar, visualisasi ketersediaan tiga kategori slot garasi secara real-time, kalkulator simulasi biaya interaktif dengan slider baterai EV, kartu interaktif 3D yang merespons kursor mouse, serta tautan cepat login dan pendaftaran akun.

```
[Tempat Gambar 4: Masukkan Gambar Halaman Utama GARASI TA di sini]
```
*Gambar 4. Halaman Utama GARASI TA*

---

### 6.2 Registrasi Calon Penyewa dengan Validasi NIK 16 Digit
Calon penyewa mendaftar dengan validasi ketat di sisi klien dan server: NIK wajib tepat 16 digit angka numerik, nama lengkap, nomor telepon 10–15 digit, format email valid, dan konfirmasi password.

```
[Tempat Gambar 5: Masukkan Gambar Halaman Pendaftaran Calon Penyewa dengan Validasi NIK 16 Digit di sini]
```
*Gambar 5. Halaman Pendaftaran Calon Penyewa dengan Validasi NIK 16 Digit*

---

### 6.3 Dashboard Penyewa (Status Menunggu Verifikasi / Pending)
Pengguna yang baru mendaftar secara otomatis berstatus `pending`. Sistem mengunci akses sewa garasi dan menampilkan pemberitahuan visual bahwa akun sedang dalam antrean verifikasi oleh Administrator.

```
[Tempat Gambar 6: Masukkan Gambar Dashboard Penyewa Saat Status Akun Masih PENDING di sini]
```
*Gambar 6. Dashboard Penyewa Saat Status Akun Masih PENDING*

---

### 6.4 Verifikasi Calon Penyewa pada Panel Administrator
Administrator dapat melihat antrean calon penyewa, memeriksa kesesuaian NIK 16 digit, memfilter berdasarkan status (*Pending*, *Approved*, *Rejected*), lalu melakukan aksi persetujuan (*Approve*) atau penolakan (*Reject*) dengan satu kali klik.

```
[Tempat Gambar 7: Masukkan Gambar Halaman Verifikasi Calon Penyewa pada Panel Admin di sini]
```
*Gambar 7. Halaman Verifikasi Calon Penyewa pada Panel Admin*

---

### 6.5 Formulir Sewa Garasi Baru: Identitas Kendaraan & Paket Durasi
Penyewa yang berstatus `approved` dapat memilih kategori kendaraan, mengisi nomor plat polisi, merek/tipe, kapasitas baterai kWh (khusus EV), serta menentukan tanggal mulai dan jenis sewa (Harian maks 30 hari atau Bulanan).

```
[Tempat Gambar 8: Masukkan Gambar Formulir Sewa Garasi Baru (Identitas Kendaraan dan Durasi) di sini]
```
*Gambar 8. Formulir Sewa Garasi Baru (Identitas Kendaraan dan Paket Durasi)*

---

### 6.6 Formulir Sewa Garasi Baru: Pilihan Slot Unit, Rincian Biaya, & Bukti Bayar
Sistem menampilkan daftar slot garasi yang kompatibel dan tidak bentrok (*available*). Total tarif sewa pokok dihitung otomatis ditambah biaya pengisian daya listrik 100% penuh untuk mobil listrik. Penyewa mengunggah foto bukti pembayaran pelunasan sebelum mengirim formulir.

```
[Tempat Gambar 9: Masukkan Gambar Formulir Sewa Garasi Baru (Pilihan Unit Tersedia, Rincian Biaya, dan Bukti Bayar) di sini]
```
*Gambar 9. Formulir Sewa Garasi Baru (Pilihan Unit Tersedia, Rincian Biaya, dan Bukti Bayar)*

---

### 6.7 Manajemen Unit Garasi dan Pembuatan Unit Massal (Batch Creation)
Administrator dapat melihat status kapasitas seluruh garasi dalam format visual *Parking Bay Grid* maupun tabel detail. Administrator dapat membuat unit garasi secara massal (1–999 unit) per kategori dengan penomoran otomatis bertahap (`S001`, `C001`, `E001`).

```
[Tempat Gambar 10: Masukkan Gambar Panel Inventaris Unit Garasi dan Form Tambah Unit Massal di sini]
```
*Gambar 10. Panel Inventaris Unit Garasi dan Form Tambah Unit Massal*

---

### 6.8 Daftar Transaksi Sewa Aktif pada Menu Perpanjangan Sewa
Menampilkan daftar garasi yang sedang aktif disewa pada hari berjalan, lengkap dengan informasi nama penyewa, jenis kendaraan, tanggal sewa, dan tombol aksi untuk memperpanjang durasi kontrak.

```
[Tempat Gambar 11: Masukkan Gambar Daftar Transaksi Sewa Aktif pada Menu Perpanjangan Sewa di sini]
```
*Gambar 11. Daftar Transaksi Sewa Aktif pada Menu Perpanjangan Sewa*

---

### 6.9 Modal Perpanjangan Masa Sewa dengan Perhitungan Biaya Real-Time
Administrator memilih tanggal selesai baru. Sistem langsung menghitung selisih tambahan hari dan sisa biaya yang harus dibayar. Administrator mengunggah bukti bayar perpanjangan dan memperbarui masa sewa garasi.

```
[Tempat Gambar 12: Masukkan Gambar Pop-up Perpanjangan Masa Sewa dengan Perhitungan Biaya Tambahan di sini]
```
*Gambar 12. Modal Perpanjangan Masa Sewa dengan Perhitungan Biaya Tambahan Otomatis*

---

### 6.10 Halaman Laporan Persewaan dan Rekapitulasi Keuangan
Menyajikan ringkasan omzet sewa pokok, pemasukan listrik SPKLU, total pendapatan, dan grafik utilisasi. Laporan dapat difilter secara fleksibel berdasarkan 4 kriteria: **Per Bulan**, **Per Hari**, **Per Tipe Garasi**, dan **Per Penyewa**, serta dilengkapi tombol Cetak / Ekspor PDF.

```
[Tempat Gambar 13: Masukkan Gambar Halaman Laporan Persewaan dan Keuangan Admin di sini]
```
*Gambar 13. Halaman Laporan Persewaan dan Keuangan Admin dengan Fitur Cetak PDF*

---

## 7. Skenario dan Hasil Unit Testing (J.62010.033.02)

Pengujian unit pada aplikasi GARASI TA dijalankan secara otomatis menggunakan test runner **Vitest** dengan pendekatan *Black-box Testing*. Teknik yang diterapkan adalah:
- **Boundary Value Analysis (BVA):** Menguji nilai ambang batas sistem (batas nomor urut garasi 1–999, batas hari sewa harian 1–30 hari, dan batas NIK 16 digit).
- **Equivalence Partitioning (EP):** Mengelompokkan kelas input valid dan tidak valid pada matriks kecocokan kendaraan dan formula tarif sewa.

### Tabel Rincian Skenario Unit Testing:

| No | Modul Uji | Teknik | Skenario dan Data Uji | Hasil yang Diharapkan | Status |
|:---:|---|:---:|---|---|:---:|
| 1 | `GarageCodeGenerator` | BVA | Pembuatan kode garasi dengan nomor urut 1, 10, dan 99 pada tipe sepeda, mobil, dan listrik. | Menghasilkan kode terformat 3 digit: `S001`, `C010`, `E099`. | **PASSED** |
| 2 | `GarageCodeGenerator` | EP | Pembuatan kode beruntun secara massal (*batch generation*) sebanyak 3 unit garasi listrik. | Menghasilkan array berurutan: `['E001', 'E002', 'E003']`. | **PASSED** |
| 3 | `GarageCodeGenerator` | BVA | Input nomor urut batas tidak valid (nomor urut 0 dan 1000). | Sistem melempar *exception error* batas nomor urut 1–999. | **PASSED** |
| 4 | Matriks Kompatibilitas | EP | Uji kompatibilitas sepeda manual dan sepeda motor terhadap seluruh tipe garasi. | Hanya cocok pada garasi `sepeda` (`true`); ditolak pada mobil dan listrik (`false`). | **PASSED** |
| 5 | Matriks Kompatibilitas | EP | Uji kompatibilitas mobil konvensional bensin terhadap garasi sepeda, mobil, dan listrik. | Hanya cocok pada garasi `mobil` (`true`); ditolak pada garasi sepeda dan listrik. | **PASSED** |
| 6 | Matriks Kompatibilitas | EP | Uji kompatibilitas mobil listrik (EV) terhadap garasi sepeda, mobil, dan listrik. | Cocok pada garasi `mobil` dan `mobil_listrik` (`true`); ditolak pada garasi sepeda. | **PASSED** |
| 7 | Kalkulator Tarif Sewa | BVA | Perhitungan sewa harian sepeda tarif Rp10.000/hari selama 5 hari mulai 21 Nov 2026. | Biaya sewa tepat Rp50.000, biaya listrik Rp0, total Rp50.000, tanggal selesai 26 Nov 2026. | **PASSED** |
| 8 | Kalkulator Tarif Sewa | BVA | Validasi batas maksimal sewa harian dengan memasukkan durasi 31 hari. | Sistem menolak dengan pesan error maksimal sewa harian 30 hari. | **PASSED** |
| 9 | Kalkulator Tarif Sewa | EP | Perhitungan sewa bulanan mobil bensin tarif harian Rp50.000 selama 2 bulan. | Tarif bulanan otomatis $25 \times 50.000 = 1.250.000$; total 2 bulan tepat Rp2.500.000. | **PASSED** |
| 10 | Kewajiban Listrik EV | EP | Sewa garasi EV (tarif listrik Rp2.000/kWh) untuk mobil listrik berkapasitas 60 kWh selama 3 hari. | Biaya pokok $3 \times 75.000 = 225.000$; biaya listrik $60 \times 2.000 = 120.000$; total Rp345.000. | **PASSED** |
| 11 | Mobil Listrik di Garasi Biasa | EP | Mobil listrik menyewa garasi mobil konvensional (tanpa fasilitas wallbox charger). | Biaya listrik terhitung tepat Rp0 (tidak ada fasilitas pengisian daya). | **PASSED** |
| 12 | Perpanjangan Sewa | BVA | Perpanjangan kontrak sewa aktif dari 26 Nov 2026 menjadi 01 Des 2026 (selisih 5 hari) tarif Rp50.000. | Tambahan hari 5 hari; biaya perpanjangan dihitung tepat $5 \times 50.000 = \text{Rp}250.000$. | **PASSED** |
| 13 | Validasi Tanggal Perpanjang | BVA | Mengubah tanggal selesai baru lebih awal atau sama dengan tanggal selesai lama. | Sistem menolak input dengan melempar validasi tanggal tidak valid. | **PASSED** |
| 14 | Sample Service Component | EP | Pengujian fungsi utility formatting salam sapaan sistem. | Menghasilkan string sapaan terformat valid. | **PASSED** |

```
[Tempat Gambar 14: Masukkan Gambar Hasil Pengujian Unit Vitest di sini]
```
*Gambar 14. Hasil Pengujian Unit Testing Menggunakan Vitest (14 dari 14 Skenario Berhasil Lulus 100%)*

Seluruh 14 skenario pengujian berhasil lulus 100% (*Passed*) dalam waktu eksekusi singkat (301 ms). Hal ini membuktikan bahwa seluruh aturan bisnis, validasi batas input, integritas data, dan algoritma finansial berjalan dengan presisi dan andal.

---

## 8. Link Repositori GitHub & Panduan Menjalankan Sistem

Kode program aplikasi GARASI TA bersifat *open-source* dan dapat diakses secara publik oleh Asesor melalui tautan berikut:  
**URL Repositori GitHub:**  
👉 **https://github.com/mzkyann/Project_Garasi_LSP_Muh_Ryan_Ardiansyah**

### 8.1 Panduan Menjalankan Aplikasi di Lingkungan Lokal:
1. **Prasyarat Lingkungan:**
   - Node.js versi 20+ (Direkomendasikan Node.js 22 LTS).
   - Git CLI.
2. **Kloning Repositori:**
   ```bash
   git clone https://github.com/mzkyann/Project_Garasi_LSP_Muh_Ryan_Ardiansyah.git
   cd Project_Garasi_LSP_Muh_Ryan_Ardiansyah
   ```
3. **Instalasi Dependensi:**
   ```bash
   npm install
   ```
4. **Menjalankan Pengujian Unit Otomatis (Vitest):**
   ```bash
   npm run test
   ```
5. **Menjalankan Server Pengembangan (Dev Server):**
   ```bash
   npm run dev
   ```
   Buka peramban pada alamat lokal: `http://localhost:5173`.
6. **Mereset Basis Data ke Kondisi Awal (Opsional):**
   ```bash
   npm run db:reset
   ```

### 8.2 Daftar Akun Demo Pengujian untuk Asesor:
| Peran Pengguna | Email Login | Kata Sandi | NIK Terdaftar | Status Akun | Skenario Demonstrasi |
|---|---|---|---|:---:|---|
| **Administrator** | `admin@garasi.id` | `admin123` | `1234567890123456` | `approved` | Login admin, verifikasi NIK KTP, batch creation garasi, perpanjang sewa aktif hari ini, cetak laporan. |
| **Penyewa (Aktif)** | `budi@gmail.com` | `budi123` | `3578012345670001` | `approved` | Login penyewa terverifikasi, sewa garasi baru harian/bulanan, input kWh mobil listrik, unggah bukti bayar. |
| **Penyewa (Pending 1)** | `ani@gmail.com` | `ani123` | `3578019876540002` | `pending` | Menguji tampilan proteksi dashboard saat akun belum diverifikasi admin. |
| **Penyewa (Pending 2)** | `citra@gmail.com` | `citra123` | `3578015544330003` | `pending` | Antrean verifikasi calon penyewa untuk didemonstrasikan aksi *Approve/Reject* oleh Admin. |
| **Penyewa (Ditolak)** | `doni@gmail.com` | `doni123` | `3578011122330004` | `rejected` | Demonstrasi penolakan pendaftaran karena NIK tidak valid. |

---
*Laporan Proyek ini disusun dengan sebenar-benarnya sebagai pemenuhan berkas unjuk kerja Portofolio Asesi pada Uji Kompetensi Pemrogram.*
