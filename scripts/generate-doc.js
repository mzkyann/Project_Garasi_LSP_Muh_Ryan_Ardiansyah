// scripts/generate-doc.js
import fs from 'node:fs';
import path from 'node:path';
import {
	Document,
	Packer,
	Paragraph,
	TextRun,
	HeadingLevel,
	Table,
	TableRow,
	TableCell,
	WidthType,
	BorderStyle,
	AlignmentType,
	ShadingType,
	Header,
	Footer,
	PageNumber
} from 'docx';

function createHeading1(text) {
	return new Paragraph({
		text: text,
		heading: HeadingLevel.HEADING_1,
		spacing: { before: 280, after: 120 }
	});
}

function createHeading2(text) {
	return new Paragraph({
		text: text,
		heading: HeadingLevel.HEADING_2,
		spacing: { before: 200, after: 100 }
	});
}

function createParagraph(text, isBold = false) {
	return new Paragraph({
		children: [new TextRun({ text: text, bold: isBold, size: 22 })],
		spacing: { after: 120, line: 276 }
	});
}

function createBullet(text, boldPrefix = '') {
	const children = [];
	if (boldPrefix) {
		children.push(new TextRun({ text: boldPrefix + ' ', bold: true, size: 22 }));
	}
	children.push(new TextRun({ text: text, size: 22 }));
	return new Paragraph({
		children: children,
		bullet: { level: 0 },
		spacing: { after: 80, line: 260 }
	});
}

function createImagePlaceholder(boxText, captionText) {
	return [
		new Paragraph({
			children: [
				new TextRun({
					text: boxText,
					bold: true,
					color: '1F2937',
					size: 20
				})
			],
			alignment: AlignmentType.CENTER,
			spacing: { before: 200, after: 80 },
			border: {
				top: { style: BorderStyle.DASHED, size: 2, color: '8B774F' },
				bottom: { style: BorderStyle.DASHED, size: 2, color: '8B774F' },
				left: { style: BorderStyle.DASHED, size: 2, color: '8B774F' },
				right: { style: BorderStyle.DASHED, size: 2, color: '8B774F' }
			},
			shading: {
				type: ShadingType.CLEAR,
				fill: 'F7F5EC'
			}
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: captionText,
					italics: true,
					size: 20,
					color: '4B5563'
				})
			],
			alignment: AlignmentType.CENTER,
			spacing: { after: 200 }
		})
	];
}

function createTableCell(text, isHeader = false, widthPercent = 25) {
	return new TableCell({
		children: [
			new Paragraph({
				children: [new TextRun({ text: text, bold: isHeader, size: 20, color: isHeader ? 'FFFFFF' : '1F2937' })],
				alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
				spacing: { before: 80, after: 80 }
			})
		],
		shading: isHeader ? { fill: '2C2518' } : undefined,
		width: { size: widthPercent, type: WidthType.PERCENTAGE }
	});
}

const doc = new Document({
	styles: {
		default: {
			document: {
				run: {
					font: 'Calibri',
					size: 22,
					color: '1F2937'
				}
			}
		}
	},
	sections: [
		{
			properties: {
				page: {
					margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch
				}
			},
			headers: {
				default: new Header({
					children: [
						new Paragraph({
							children: [
								new TextRun({
									text: 'LAPORAN PROYEK LSP PEMROGRAM — SISTEM GARASI TA',
									size: 18,
									color: '8B774F',
									bold: true
								})
							],
							alignment: AlignmentType.RIGHT
						})
					]
				})
			},
			footers: {
				default: new Footer({
					children: [
						new Paragraph({
							children: [
								new TextRun({ text: 'Muh. Ryan Ardiansyah | Halaman ', size: 18 }),
								new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
								new TextRun({ text: ' dari ', size: 18 }),
								new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 })
							],
							alignment: AlignmentType.CENTER
						})
					]
				})
			},
			children: [
				// TITLE HEADER
				new Paragraph({
					children: [
						new TextRun({
							text: 'LAPORAN PROYEK UJI KOMPETENSI SKEMA SERTIFIKASI PEMROGRAM',
							bold: true,
							size: 32,
							color: '2C2518'
						})
					],
					alignment: AlignmentType.CENTER,
					spacing: { after: 100 }
				}),
				new Paragraph({
					children: [
						new TextRun({
							text: 'Sistem Manajemen dan Penyewaan Garasi Terpadu (GARASI TA)',
							bold: true,
							size: 26,
							color: '8B774F'
						})
					],
					alignment: AlignmentType.CENTER,
					spacing: { after: 300 }
				}),

				// METADATA TABLE
				new Table({
					width: { size: 100, type: WidthType.PERCENTAGE },
					rows: [
						new TableRow({
							children: [
								createTableCell('Nama Peserta', true, 30),
								createTableCell('Muh. Ryan Ardiansyah', false, 70)
							]
						}),
						new TableRow({
							children: [
								createTableCell('Skema Sertifikasi', true, 30),
								createTableCell('Okupasi Pemrogram (Nomor: IMT.01.15/SSK/LSP/IX/2021)', false, 70)
							]
						}),
						new TableRow({
							children: [
								createTableCell('Nama Asesor', true, 30),
								createTableCell('Citra Lestari', false, 70)
							]
						}),
						new TableRow({
							children: [
								createTableCell('Tanggal Uji', true, 30),
								createTableCell('22 November 2026', false, 70)
							]
						}),
						new TableRow({
							children: [
								createTableCell('Jenis Aplikasi', true, 30),
								createTableCell('Aplikasi Web Full-Stack dengan Basis Data Relasional Terstruktur (SQLite ACID)', false, 70)
							]
						}),
						new TableRow({
							children: [
								createTableCell('Repositori GitHub', true, 30),
								createTableCell('https://github.com/mzkyann/Project_Garasi_LSP_Muh_Ryan_Ardiansyah', false, 70)
							]
						})
					]
				}),
				new Paragraph({ spacing: { after: 240 } }),

				// 1. RINGKASAN SISTEM
				createHeading1('1. Ringkasan Sistem dan Spesifikasi Kebutuhan'),
				createParagraph(
					'GARASI TA (GARTA - Garasi Takalar) adalah sistem aplikasi berbasis web terintegrasi yang dirancang untuk mengelola unit garasi kendaraan dan transaksi penyewaan secara aman, transparan, dan terstruktur. Sistem ini mengakomodasi berbagai jenis kendaraan, mulai dari kendaraan roda dua (sepeda manual dan sepeda motor), mobil konvensional (bensin/diesel), hingga kendaraan masa depan yaitu mobil listrik (Electric Vehicle / EV) yang terintegrasi dengan stasiun pengisian daya (Wallbox SPKLU). Sistem memisahkan peran pengguna secara tegas berbasis hak akses (Role-Based Access Control), yaitu peran Administrator dan Penyewa.'
				),
				createParagraph(
					'Proyek ini dibangun untuk memenuhi seluruh 8 Unit Kompetensi dalam Skema Sertifikasi Pemrogram:'
				),
				createBullet('Menerjemahkan aturan bisnis garasi, formula tarif harian/bulanan, dan pengisian daya EV.', '1. J.620100.009.02 (Spesifikasi Program):'),
				createBullet('Clean Code, pemisahan Domain Logic, Persistence Layer, dan UI Presentation Layer.', '2. J.620100.016.01 (Guidelines & Best Practices):'),
				createBullet('Alur logika modular kalkulasi tarif, filter tanggal collision-free, dan perpanjangan sewa.', '3. J.620100.017.02 (Pemrograman Terstruktur):'),
				createBullet('Pewarisan (Inheritance), enkapsulasi, polimorfisme pada kelas Vehicle dan Garage.', '4. J.620100.018.02 (Pemrograman Berorientasi Objek / OOP):'),
				createBullet('Memanfaatkan framework SvelteKit 5, TypeScript, Tailwind CSS v4, Lucide Icons, dan Vitest.', '5. J.620100.019.02 (Library Pre-existing):'),
				createBullet('Basis data relasional SQLite (node:sqlite) dengan Foreign Keys, integritas referensial, dan transaksi ACID.', '6. J.620100.021.02 (Akses Basis Data Relasional):'),
				createBullet('Penanganan validasi form server-side, pencegahan bentrok tanggal sewa, dan handling error.', '7. J.620100.025.02 (Debugging Program):'),
				createBullet('14 skenario unit testing otomatis menggunakan Vitest dengan metode BVA dan Equivalence Partitioning.', '8. J.62010.033.02 (Pengujian Unit Program):'),

				createHeading2('Kebutuhan Fungsional Utama:'),
				createBullet('Calon penyewa mendaftar akun menggunakan NIK tepat 16 digit angka numerik, nama lengkap, nomor telepon, email unik, dan kata sandi minimal 6 karakter. Status awal pendaftaran adalah pending.'),
				createBullet('Administrator memverifikasi calon pendaftar (APPROVED atau REJECTED) sebelum akun dapat mengakses fitur sewa garasi.'),
				createBullet('Administrator menambah unit garasi secara massal per kategori: Sepeda/Motor (S001-S999), Mobil (C001-C999), dan EV (E001-E999) dengan batas kapasitas 999 unit per kategori.'),
				createBullet('Penyewa terverifikasi menyewa garasi harian (maks 30 hari) atau bulanan (25x tarif harian), memilih kendaraan, memeriksa ketersediaan slot bebas bentrok jadwal, menghitung biaya listrik EV 100% penuh, dan mengunggah bukti bayar.'),
				createBullet('Administrator memperpanjang masa sewa aktif pada hari berjalan dengan perhitungan otomatis sisa hari dan biaya tambahan serta unggah bukti bayar perpanjangan.'),
				createBullet('Administrator menyaring dan mencetak laporan transaksi persewaan per bulan, per hari, per tipe garasi, atau per penyewa ke format PDF.'),

				// 2. USE CASE
				createHeading1('2. Use Case Diagram'),
				createParagraph(
					'Use Case Diagram memodelkan interaksi aktor terhadap batasan fungsional sistem. Terdapat 3 aktor: Calon Penyewa (pendaftaran & login), Penyewa Terverifikasi (sewa baru, cek ketersediaan, upload bukti, riwayat), dan Administrator (verifikasi NIK, batch garasi, ACC sewa, perpanjang sewa hari ini, laporan persewaan).'
				),
				...createImagePlaceholder(
					'[TEMPAT GAMBAR 1: Masukkan Gambar Use Case Diagram Sistem GARASI TA di sini]',
					'Gambar 1. Use Case Diagram Sistem GARASI TA'
				),

				// 3. CLASS DIAGRAM
				createHeading1('3. Class Diagram (Arsitektur Berorientasi Objek / OOP)'),
				createParagraph(
					'Penerapan OOP membagi struktur ke dalam 3 hierarki: Hierarki Kelas Kendaraan (Vehicle -> Bicycle, Motorcycle, GasolineCar, ElectricCar), Hierarki Kelas Garasi (Garage -> BicycleGarage, CarGarage, ElectricCarGarage), serta Domain Services & Utilities (RentalCalculator, GarageCodeGenerator, Rental, RentalExtension).'
				),
				...createImagePlaceholder(
					'[TEMPAT GAMBAR 2: Masukkan Gambar Class Diagram Arsitektur Berorientasi Objek di sini]',
					'Gambar 2. Class Diagram Arsitektur Berorientasi Objek Sistem GARASI TA'
				),

				// 4. ERD
				createHeading1('4. Entity-Relationship Diagram (ERD Basis Data Relasional)'),
				createParagraph(
					'Basis data relasional menerapkan kaidah normalisasi 3NF dengan integritas Foreign Key Constraints. Terdiri dari 4 tabel utama: users (kredensial & NIK), garages (master unit fisik S/C/E), rentals (transaksi kontrak sewa), dan rental_extensions (riwayat perpanjangan sewa).'
				),
				...createImagePlaceholder(
					'[TEMPAT GAMBAR 3: Masukkan Gambar Entity-Relationship Diagram (ERD) di sini]',
					'Gambar 3. Entity-Relationship Diagram (ERD) Basis Data Relasional'
				),

				// TABEL RELASI ERD
				createHeading2('Tabel Relasi dan Kardinalitas:'),
				new Table({
					width: { size: 100, type: WidthType.PERCENTAGE },
					rows: [
						new TableRow({
							children: [
								createTableCell('Relasi Tabel', true, 25),
								createTableCell('Kardinalitas', true, 20),
								createTableCell('Penjelasan Integritas Bisnis', true, 55)
							]
						}),
						new TableRow({
							children: [
								createTableCell('users -> rentals', false, 25),
								createTableCell('1 : N', false, 20),
								createTableCell('Satu penyewa dapat memiliki banyak transaksi sewa (ON DELETE CASCADE).', false, 55)
							]
						}),
						new TableRow({
							children: [
								createTableCell('garages -> rentals', false, 25),
								createTableCell('1 : N', false, 20),
								createTableCell('Satu unit garasi dapat disewa pada banyak jadwal berbeda (ON DELETE RESTRICT).', false, 55)
							]
						}),
						new TableRow({
							children: [
								createTableCell('rentals -> rental_extensions', false, 25),
								createTableCell('1 : N', false, 20),
								createTableCell('Satu transaksi sewa dapat memiliki banyak riwayat perpanjangan sewa.', false, 55)
							]
						})
					]
				}),
				new Paragraph({ spacing: { after: 200 } }),

				// 5. LIBRARY
				createHeading1('5. Penjelasan Library / Pre-Existing Component'),
				createParagraph('Berikut adalah komponen dan pustaka yang digunakan dalam pengembangan aplikasi GARASI TA:'),
				new Table({
					width: { size: 100, type: WidthType.PERCENTAGE },
					rows: [
						new TableRow({
							children: [
								createTableCell('Library / Tools', true, 25),
								createTableCell('Versi', true, 15),
								createTableCell('Lisensi', true, 15),
								createTableCell('Fungsi dan Alasan Pemilihan', true, 45)
							]
						}),
						new TableRow({
							children: [
								createTableCell('SvelteKit', false, 25),
								createTableCell('^3.2.0', false, 15),
								createTableCell('MIT', false, 15),
								createTableCell('Framework full-stack modern dengan server routing, form actions, dan SSR.', false, 45)
							]
						}),
						new TableRow({
							children: [
								createTableCell('Svelte Core', false, 25),
								createTableCell('^5.57.3', false, 15),
								createTableCell('MIT', false, 15),
								createTableCell('Kompilasi antarmuka reaktif (Svelte 5 Runes) berkecepatan tinggi.', false, 45)
							]
						}),
						new TableRow({
							children: [
								createTableCell('Tailwind CSS', false, 25),
								createTableCell('^4.3.5', false, 15),
								createTableCell('MIT', false, 15),
								createTableCell('Utility-first styling untuk merancang antarmuka palet resmi Skandinavia.', false, 45)
							]
						}),
						new TableRow({
							children: [
								createTableCell('node:sqlite', false, 25),
								createTableCell('Node 22', false, 15),
								createTableCell('MIT', false, 15),
								createTableCell('Driver database relasional bawaan Node.js dengan query SQL ACID & Foreign Keys.', false, 45)
							]
						}),
						new TableRow({
							children: [
								createTableCell('Vitest', false, 25),
								createTableCell('^5.1.0', false, 15),
								createTableCell('MIT', false, 15),
								createTableCell('Test runner otomatis untuk menjalankan pengujian unit model dan kalkulator.', false, 45)
							]
						}),
						new TableRow({
							children: [
								createTableCell('TypeScript & Bun', false, 25),
								createTableCell('^6.0.3 / 1.4.0', false, 15),
								createTableCell('Apache-2.0 / MIT', false, 15),
								createTableCell('TypeScript untuk type safety, sedangkan Bun (v1.4.0) digunakan sebagai runtime berkecepatan tinggi dan package manager utama.', false, 45)
							]
						})
					]
				}),
				new Paragraph({ spacing: { after: 200 } }),

				// 6. FITUR APLIKASI & GAMBAR 4-13
				createHeading1('6. Fitur-Fitur Aplikasi yang Dihasilkan'),

				createHeading2('6.1 Halaman Utama (Landing Page & 3D Interactive Hub)'),
				createParagraph('Menampilkan profil layanan GARTA Takalar, visualisasi ketersediaan tiga kategori slot garasi secara real-time, kalkulator simulasi biaya interaktif dengan slider baterai EV, serta kartu interaktif 3D.'),
				...createImagePlaceholder('[TEMPAT GAMBAR 4: Masukkan Gambar Halaman Utama GARASI TA di sini]', 'Gambar 4. Halaman Utama GARASI TA'),

				createHeading2('6.2 Registrasi Calon Penyewa dengan Validasi NIK 16 Digit'),
				createParagraph('Formulir pendaftaran akun dengan pengecekan format data: NIK tepat 16 digit angka numerik, nama lengkap, nomor telepon, email valid, dan kata sandi minimal 6 karakter.'),
				...createImagePlaceholder('[TEMPAT GAMBAR 5: Masukkan Gambar Halaman Pendaftaran Calon Penyewa dengan Validasi NIK 16 Digit di sini]', 'Gambar 5. Halaman Pendaftaran Calon Penyewa dengan Validasi NIK 16 Digit'),

				createHeading2('6.3 Dashboard Penyewa (Status Menunggu Verifikasi / Pending)'),
				createParagraph('Pengguna baru otomatis berstatus pending. Sistem mengunci modul sewa baru dan menampilkan notifikasi bahwa akun sedang menunggu persetujuan Admin.'),
				...createImagePlaceholder('[TEMPAT GAMBAR 6: Masukkan Gambar Dashboard Penyewa Saat Status Akun Masih PENDING di sini]', 'Gambar 6. Dashboard Penyewa Saat Status Akun Masih PENDING'),

				createHeading2('6.4 Verifikasi Calon Penyewa pada Panel Administrator'),
				createParagraph('Administrator memeriksa NIK 16 digit pendaftar, memfilter status (Pending, Approved, Rejected), dan mengeksekusi persetujuan (Approve) atau penolakan (Reject).'),
				...createImagePlaceholder('[TEMPAT GAMBAR 7: Masukkan Gambar Halaman Verifikasi Calon Penyewa pada Panel Admin di sini]', 'Gambar 7. Halaman Verifikasi Calon Penyewa pada Panel Admin'),

				createHeading2('6.5 Formulir Sewa Garasi Baru: Identitas Kendaraan & Paket Durasi'),
				createParagraph('Penyewa terverifikasi memilih jenis kendaraan, menginput plat nomor polisi, merek/tipe, kapasitas baterai kWh, serta durasi (Harian maks 30 hari atau Bulanan).'),
				...createImagePlaceholder('[TEMPAT GAMBAR 8: Masukkan Gambar Formulir Sewa Garasi Baru (Identitas Kendaraan dan Durasi) di sini]', 'Gambar 8. Formulir Sewa Garasi Baru (Identitas Kendaraan dan Paket Durasi)'),

				createHeading2('6.6 Formulir Sewa Garasi Baru: Pilihan Slot Unit, Rincian Biaya, & Bukti Bayar'),
				createParagraph('Sistem menampilkan slot garasi yang cocok dan jadwalnya tidak bentrok, menghitung total sewa pokok + biaya cas EV 100%, serta menerima upload bukti bayar.'),
				...createImagePlaceholder('[TEMPAT GAMBAR 9: Masukkan Gambar Formulir Sewa Garasi Baru (Pilihan Unit Tersedia, Rincian Biaya, dan Bukti Bayar) di sini]', 'Gambar 9. Formulir Sewa Garasi Baru (Pilihan Unit Tersedia, Rincian Biaya, dan Bukti Bayar)'),

				createHeading2('6.7 Manajemen Unit Garasi dan Pembuatan Unit Massal (Batch Creation)'),
				createParagraph('Menampilkan visualisasi Parking Bay Grid dan formulir tambah unit massal per kategori (Sepeda S, Mobil C, EV E) hingga 999 unit per kategori.'),
				...createImagePlaceholder('[TEMPAT GAMBAR 10: Masukkan Gambar Panel Inventaris Unit Garasi dan Form Tambah Unit Massal di sini]', 'Gambar 10. Panel Inventaris Unit Garasi dan Form Tambah Unit Massal'),

				createHeading2('6.8 Daftar Transaksi Sewa Aktif pada Menu Perpanjangan Sewa'),
				createParagraph('Menampilkan daftar unit garasi yang sedang aktif disewa hari ini beserta data penyewa dan tombol aksi untuk memperpanjang durasi kontrak.'),
				...createImagePlaceholder('[TEMPAT GAMBAR 11: Masukkan Gambar Daftar Transaksi Sewa Aktif pada Menu Perpanjangan Sewa di sini]', 'Gambar 11. Daftar Transaksi Sewa Aktif pada Menu Perpanjangan Sewa'),

				createHeading2('6.9 Modal Perpanjangan Masa Sewa dengan Perhitungan Biaya Real-Time'),
				createParagraph('Admin memilih tanggal selesai baru. Sistem menghitung selisih tambahan hari dan sisa biaya perpanjangan, lalu Admin mengunggah bukti bayar perpanjangan.'),
				...createImagePlaceholder('[TEMPAT GAMBAR 12: Masukkan Gambar Pop-up Perpanjangan Masa Sewa dengan Perhitungan Biaya Tambahan di sini]', 'Gambar 12. Modal Perpanjangan Masa Sewa dengan Perhitungan Biaya Tambahan Otomatis'),

				createHeading2('6.10 Halaman Laporan Persewaan dan Rekapitulasi Keuangan'),
				createParagraph('Menampilkan statistik omzet, total transaksi, unit terisi, filter fleksibel (Per Bulan, Per Hari, Per Tipe, Per Penyewa), serta tombol cetak/ekspor PDF.'),
				...createImagePlaceholder('[TEMPAT GAMBAR 13: Masukkan Gambar Halaman Laporan Persewaan dan Keuangan Admin di sini]', 'Gambar 13. Halaman Laporan Persewaan dan Keuangan Admin dengan Fitur Cetak PDF'),

				// 7. UNIT TESTING
				createHeading1('7. Skenario dan Hasil Unit Testing (J.62010.033.02)'),
				createParagraph(
					'Pengujian unit dilakukan menggunakan Vitest dengan metode Black-box Testing melalui Boundary Value Analysis (BVA) dan Equivalence Partitioning (EP) dengan total 14 skenario uji yang 100% lulus (Passed):'
				),
				new Table({
					width: { size: 100, type: WidthType.PERCENTAGE },
					rows: [
						new TableRow({
							children: [
								createTableCell('No', true, 8),
								createTableCell('Modul Uji', true, 22),
								createTableCell('Teknik', true, 12),
								createTableCell('Skenario dan Data Uji', true, 38),
								createTableCell('Hasil yang Diharapkan', true, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('1', false, 8),
								createTableCell('GarageCodeGenerator', false, 22),
								createTableCell('BVA', false, 12),
								createTableCell('Nomor urut 1, 10, dan 99 pada sepeda, mobil, listrik.', false, 38),
								createTableCell('Kode 3-digit: S001, C010, E099 (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('2', false, 8),
								createTableCell('GarageCodeGenerator', false, 22),
								createTableCell('EP', false, 12),
								createTableCell('Pembuatan batch kode beruntun 3 unit garasi listrik.', false, 38),
								createTableCell("['E001', 'E002', 'E003'] (PASS)", false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('3', false, 8),
								createTableCell('GarageCodeGenerator', false, 22),
								createTableCell('BVA', false, 12),
								createTableCell('Input nomor urut 0 dan 1000 di luar rentang valid.', false, 38),
								createTableCell('Exception error batas 1-999 (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('4', false, 8),
								createTableCell('Kompatibilitas', false, 22),
								createTableCell('EP', false, 12),
								createTableCell('Sepeda dan motor terhadap seluruh tipe garasi.', false, 38),
								createTableCell('Hanya cocok di garasi sepeda (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('5', false, 8),
								createTableCell('Kompatibilitas', false, 22),
								createTableCell('EP', false, 12),
								createTableCell('Mobil konvensional bensin terhadap tipe garasi.', false, 38),
								createTableCell('Hanya cocok di garasi mobil (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('6', false, 8),
								createTableCell('Kompatibilitas', false, 22),
								createTableCell('EP', false, 12),
								createTableCell('Mobil listrik (EV) terhadap tipe garasi.', false, 38),
								createTableCell('Cocok di mobil dan mobil_listrik (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('7', false, 8),
								createTableCell('Kalkulator Tarif', false, 22),
								createTableCell('BVA', false, 12),
								createTableCell('Sewa harian sepeda Rp10.000 selama 5 hari.', false, 38),
								createTableCell('Total Rp50.000, listrik Rp0 (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('8', false, 8),
								createTableCell('Kalkulator Tarif', false, 22),
								createTableCell('BVA', false, 12),
								createTableCell('Validasi batas sewa harian input 31 hari.', false, 38),
								createTableCell('Error maks sewa harian 30 hari (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('9', false, 8),
								createTableCell('Kalkulator Tarif', false, 22),
								createTableCell('EP', false, 12),
								createTableCell('Sewa bulanan mobil bensin Rp50.000 selama 2 bulan.', false, 38),
								createTableCell('2 x (25 x 50.000) = Rp2.500.000 (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('10', false, 8),
								createTableCell('Kewajiban Listrik EV', false, 22),
								createTableCell('EP', false, 12),
								createTableCell('Mobil listrik 60 kWh di garasi EV selama 3 hari.', false, 38),
								createTableCell('Sewa 225rb + Cas 120rb = 345rb (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('11', false, 8),
								createTableCell('Mobil Listrik Biasa', false, 22),
								createTableCell('EP', false, 12),
								createTableCell('Mobil listrik di garasi mobil standar (tanpa SPKLU).', false, 38),
								createTableCell('Biaya listrik tepat Rp0 (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('12', false, 8),
								createTableCell('Perpanjangan Sewa', false, 22),
								createTableCell('BVA', false, 12),
								createTableCell('Perpanjangan 5 hari dengan tarif harian Rp50.000.', false, 38),
								createTableCell('Tambahan biaya tepat Rp250.000 (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('13', false, 8),
								createTableCell('Tanggal Perpanjang', false, 22),
								createTableCell('BVA', false, 12),
								createTableCell('Tanggal selesai baru <= tanggal selesai lama.', false, 38),
								createTableCell('Ditolak dengan error validasi (PASS)', false, 20)
							]
						}),
						new TableRow({
							children: [
								createTableCell('14', false, 8),
								createTableCell('Service Component', false, 22),
								createTableCell('EP', false, 12),
								createTableCell('Pengujian formatting sapaan sistem.', false, 38),
								createTableCell('Format greeting valid (PASS)', false, 20)
							]
						})
					]
				}),
				new Paragraph({ spacing: { after: 150 } }),
				...createImagePlaceholder(
					'[TEMPAT GAMBAR 14: Masukkan Gambar Hasil Pengujian Unit Vitest di sini]',
					'Gambar 14. Hasil Pengujian Unit Testing Menggunakan Vitest (14 dari 14 Skenario Berhasil Lulus 100%)'
				),

				// 8. LINK GITHUB & PANDUAN RUNNING
				createHeading1('8. Link Repositori GitHub & Panduan Menjalankan Sistem'),
				createParagraph('Kode program aplikasi GARASI TA dapat diakses melalui repositori GitHub resmi berikut:'),
				createParagraph('https://github.com/mzkyann/Project_Garasi_LSP_Muh_Ryan_Ardiansyah', true),

				createHeading2('Panduan Menjalankan di Lokal:'),
				createBullet('Instal dependensi proyek: bun install'),
				createBullet('Jalankan unit testing otomatis: bun run test (atau: bunx vitest run)'),
				createBullet('Jalankan server aplikasi: bun run dev, lalu buka http://localhost:5173 di browser.'),
				createBullet('Reset database ke kondisi awal (opsional): bun run db:reset'),

				createHeading2('Daftar Akun Demo Pengujian:'),
				createBullet('admin@garasi.id / admin123 (NIK: 1234567890123456, Status: Approved)', 'Administrator:'),
				createBullet('budi@gmail.com / budi123 (NIK: 3578012345670001, Status: Approved)', 'Penyewa Aktif:'),
				createBullet('ani@gmail.com / ani123 (NIK: 3578019876540002, Status: Pending)', 'Penyewa Pending:'),
				createBullet('citra@gmail.com / citra123 (NIK: 3578015544330003, Status: Pending)', 'Antrean Verifikasi:'),
				createBullet('doni@gmail.com / doni123 (NIK: 3578011122330004, Status: Rejected)', 'Penyewa Ditolak:')
			]
		}
	]
});

async function main() {
	const buffer = await Packer.toBuffer(doc);
	const outputPath = path.resolve(process.cwd(), 'LAPORAN_PROYEK_LSP_MUH_RYAN_ARDIANSYAH.docx');
	fs.writeFileSync(outputPath, buffer);
	console.log('File DOCX berhasil dibuat di:', outputPath);
}

main().catch(console.error);

