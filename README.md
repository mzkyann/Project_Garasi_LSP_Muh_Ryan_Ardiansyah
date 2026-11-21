# GARASI.ID - Sistem Aplikasi Manajemen & Persewaan Garasi Kendaraan

Aplikasi Web Persewaan Garasi Kendaraan berbasis SvelteKit 5, TypeScript, Tailwind CSS, dan SQLite Relasional untuk Uji Kompetensi Skema Sertifikasi Pemrogram (IMT.01.15/SSK/LSP/IX/2021).

## 🚀 Fitur Utama
1. **Autentikasi & Verifikasi KTP (NIK):**
   - Registrasi calon penyewa dengan validasi NIK 16 digit.
   - Panel Admin untuk verifikasi validitas KTP (Terima / Tolak pendaftaran).
2. **Manajemen Garasi Berkelompok (Batch):**
   - Pembuatan garasi massal hingga 999 unit dengan kode incremental: `S001` (Sepeda), `C001` (Mobil), dan `E001` (Mobil Listrik).
   - Penentuan tarif harian, bulanan ($25 \times \text{harian}$), dan tarif listrik per kWh.
3. **Penyewaan Garasi Baru:**
   - Kompatibilitas kendaraan otomatis (Sepeda/Motor $\rightarrow$ Garasi Sepeda; Mobil $\rightarrow$ Garasi Mobil; Mobil Listrik $\rightarrow$ Garasi Mobil atau Listrik).
   - Kewajiban pengisian daya penuh (100% full charge) untuk mobil listrik di garasi listrik.
   - Pilihan sewa harian (maks. 30 hari) atau bulanan.
   - Perhitungan total biaya otomatis & unggah bukti pelunasan.
4. **Perpanjangan Status Sewa Garasi:**
   - Menampilkan garasi yang sedang disewa hari ini.
   - Perhitungan sisa biaya berdasarkan selisih tanggal baru & unggah bukti bayar perpanjangan.
5. **Laporan Persewaan Garasi:**
   - Per bulan dalam tahun tertentu.
   - Per hari dalam bulan tertentu.
   - Per tipe garasi.
   - Per penyewa.
   - Ringkasan total transaksi dan omset dengan fitur cetak laporan.

## 🛠️ Menjalankan Aplikasi
```bash
# Menjalankan unit testing otomatis
npm run test

# Menjalankan development server
npm run dev
```
Akses aplikasi melalui peramban di: `http://localhost:5173`

## 👥 Akun Demo untuk Pengujian / Asesor
Tersedia tombol *Quick Login* di halaman Masuk:
- **Admin:** `admin@garasi.id` / `admin123`
- **Penyewa (Aktif):** `budi@gmail.com` / `budi123`
- **Penyewa (Pending):** `ani@gmail.com` / `ani123`

## 📄 Laporan Lengkap
Dokumen laporan lengkap yang memuat Use Case Diagram, Class Diagram (OOP), Entity-Relationship Diagram (ERD), Penjelasan Library, dan Hasil Skenario Unit Testing dapat dilihat pada [LAPORAN_PROYEK.md](file:///d:/Magang/Sertifikasi/LAPORAN_PROYEK.md).
