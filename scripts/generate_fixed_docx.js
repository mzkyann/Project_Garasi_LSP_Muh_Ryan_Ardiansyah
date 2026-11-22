// scripts/generate_fixed_docx.js
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
	PageNumber,
	ImageRun
} from 'docx';

const IMAGES_DIR = path.resolve(process.cwd(), 'extracted_user_docx');

// Helper styling constants
const FONT_FAMILY = 'Calibri';
const COLOR_PRIMARY = '1E3A8A';   // Navy Blue for Main Headings
const COLOR_SECONDARY = '334155'; // Slate for Sub-headings
const COLOR_BODY = '1F2937';      // Dark gray body text
const COLOR_MUTED = '64748B';     // Muted gray
const COLOR_ACCENT = '8B774F';    // Palette Accent (Gold-Brown)
const TABLE_HEADER_BG = '2C3E50'; // Elegant dark slate for table headers
const TABLE_ZEBRA_BG = 'F8FAFC';  // Very soft slate for alternate rows
const BORDER_COLOR = 'CBD5E1';    // Clean soft gray border

function createTitle(text) {
	return new Paragraph({
		children: [
			new TextRun({
				text: text,
				bold: true,
				size: 32, // 16pt
				font: FONT_FAMILY,
				color: COLOR_PRIMARY
			})
		],
		alignment: AlignmentType.CENTER,
		spacing: { before: 100, after: 80 }
	});
}

function createSubtitle(text) {
	return new Paragraph({
		children: [
			new TextRun({
				text: text,
				bold: true,
				size: 24, // 12pt
				font: FONT_FAMILY,
				color: COLOR_ACCENT
			})
		],
		alignment: AlignmentType.CENTER,
		spacing: { after: 240 }
	});
}

function createHeading1(text) {
	return new Paragraph({
		children: [
			new TextRun({
				text: text,
				bold: true,
				size: 26, // 13pt
				font: FONT_FAMILY,
				color: COLOR_PRIMARY
			})
		],
		heading: HeadingLevel.HEADING_1,
		keepNext: true,
		spacing: { before: 320, after: 120 }
	});
}

function createHeading2(text) {
	return new Paragraph({
		children: [
			new TextRun({
				text: text,
				bold: true,
				size: 23, // 11.5pt
				font: FONT_FAMILY,
				color: COLOR_SECONDARY
			})
		],
		heading: HeadingLevel.HEADING_2,
		keepNext: true,
		spacing: { before: 240, after: 80 }
	});
}

function createHeading3(text) {
	return new Paragraph({
		children: [
			new TextRun({
				text: text,
				bold: true,
				size: 22, // 11pt
				font: FONT_FAMILY,
				color: COLOR_SECONDARY
			})
		],
		heading: HeadingLevel.HEADING_3,
		keepNext: true,
		spacing: { before: 180, after: 60 }
	});
}

function createParagraph(text, isBold = false) {
	return new Paragraph({
		children: [
			new TextRun({
				text: text,
				bold: isBold,
				size: 22, // 11pt
				font: FONT_FAMILY,
				color: COLOR_BODY
			})
		],
		alignment: AlignmentType.JUSTIFIED,
		spacing: { after: 120, line: 276 } // 1.15 line spacing
	});
}

function createBullet(text, boldPrefix = '') {
	const children = [];
	if (boldPrefix) {
		children.push(
			new TextRun({
				text: boldPrefix + ' ',
				bold: true,
				size: 22,
				font: FONT_FAMILY,
				color: COLOR_BODY
			})
		);
	}
	children.push(
		new TextRun({
			text: text,
			size: 22,
			font: FONT_FAMILY,
			color: COLOR_BODY
		})
	);
	return new Paragraph({
		children: children,
		bullet: { level: 0 },
		alignment: AlignmentType.JUSTIFIED,
		spacing: { after: 80, line: 260 }
	});
}

function createImageWithCaption(imageFileName, captionText, customWidth = 600, customHeight = null) {
	const imagePath = path.join(IMAGES_DIR, imageFileName);
	if (!fs.existsSync(imagePath)) {
		console.warn(`[WARN] Image not found: ${imagePath}`);
		return [
			new Paragraph({
				children: [new TextRun({ text: `[Gambar tidak ditemukan: ${imageFileName}]`, color: 'FF0000' })],
				alignment: AlignmentType.CENTER
			})
		];
	}

	const imageBuffer = fs.readFileSync(imagePath);

	// Default aspect ratios based on measured dimensions
	let finalHeight = customHeight;
	if (!finalHeight) {
		// Calculate roughly from typical 16:9 or diagram aspect ratio
		if (imageFileName === 'image10.png') {
			finalHeight = Math.round(customWidth * (668 / 741));
		} else if (imageFileName === 'image1.png') {
			finalHeight = Math.round(customWidth * (574 / 974));
		} else if (imageFileName === 'image7.png') {
			finalHeight = Math.round(customWidth * (585 / 1014));
		} else if (imageFileName === 'image14.png') {
			finalHeight = Math.round(customWidth * (824 / 1423));
		} else if (imageFileName === 'image12.png') {
			finalHeight = Math.round(customWidth * (1020 / 1920));
		} else {
			finalHeight = Math.round(customWidth * (1080 / 1920));
		}
	}

	return [
		new Paragraph({
			children: [
				new ImageRun({
					data: imageBuffer,
					transformation: {
						width: customWidth,
						height: finalHeight
					}
				})
			],
			alignment: AlignmentType.CENTER,
			spacing: { before: 180, after: 60 }
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: captionText,
					italics: true,
					size: 20, // 10pt
					font: FONT_FAMILY,
					color: COLOR_SECONDARY
				})
			],
			alignment: AlignmentType.CENTER,
			spacing: { after: 200 }
		})
	];
}

const tableBorderDef = {
	top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
	bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
	left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
	right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
	insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
	insideVertical: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR }
};

function createTableCell(text, isHeader = false, widthPercent = 25, isZebra = false) {
	return new TableCell({
		children: [
			new Paragraph({
				children: [
					new TextRun({
						text: text,
						bold: isHeader,
						color: isHeader ? 'FFFFFF' : COLOR_BODY,
						size: isHeader ? 20 : 19, // 10pt header, 9.5pt body
						font: FONT_FAMILY
					})
				],
				alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
				spacing: { before: 40, after: 40 }
			})
		],
		width: { size: widthPercent, type: WidthType.PERCENTAGE },
		shading: {
			type: ShadingType.CLEAR,
			fill: isHeader ? TABLE_HEADER_BG : isZebra ? TABLE_ZEBRA_BG : 'FFFFFF'
		},
		margins: {
			top: 100,
			bottom: 100,
			left: 140,
			right: 140
		}
	});
}

function buildMetaTable() {
	const items = [
		['Nama Peserta', 'Muh. Ryan Ardiansyah'],
		['Skema Sertifikasi', 'Okupasi Pemrogram'],
		['Tanggal Pelaksanaan', '22 November 2026'],
		['Jenis Aplikasi', 'Aplikasi Web Full-Stack dengan Basis Data Relasional (ACID)'],
		['Runtime & Stack', 'Bun v1.4.0, SvelteKit 5, Tailwind CSS v4, SQLite (node:sqlite) / PostgreSQL, Vitest']
	];

	return new Table({
		width: { size: 100, type: WidthType.PERCENTAGE },
		borders: tableBorderDef,
		rows: items.map(
			([label, value], idx) =>
				new TableRow({
					cantSplit: true,
					children: [
						new TableCell({
							children: [
								new Paragraph({
									children: [
										new TextRun({
											text: label,
											bold: true,
											size: 20,
											font: FONT_FAMILY,
											color: COLOR_PRIMARY
										})
									]
								})
							],
							width: { size: 30, type: WidthType.PERCENTAGE },
							shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
							margins: { top: 80, bottom: 80, left: 120, right: 120 }
						}),
						new TableCell({
							children: [
								new Paragraph({
									children: [
										new TextRun({
											text: value,
											bold: idx === 0,
											size: 20,
											font: FONT_FAMILY,
											color: COLOR_BODY
										})
									]
								})
							],
							width: { size: 70, type: WidthType.PERCENTAGE },
							shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? 'FFFFFF' : TABLE_ZEBRA_BG },
							margins: { top: 80, bottom: 80, left: 120, right: 120 }
						})
					]
				})
		)
	});
}

async function generateDocx() {
	console.log('Building executive DOCX with full embedded images...');

	const doc = new Document({
		styles: {
			default: {
				document: {
					run: {
						font: FONT_FAMILY,
						size: 22,
						color: COLOR_BODY
					}
				}
			}
		},
		sections: [
			{
				properties: {
					page: {
						size: {
							width: 11906, // A4
							height: 16838
						},
						margin: {
							top: 1440,
							bottom: 1440,
							left: 1440,
							right: 1440
						}
					}
				},
				headers: {
					default: new Header({
						children: [
							new Paragraph({
								children: [
									new TextRun({
										text: 'Laporan Proyek Sertifikasi LSP — Okupasi Pemrogram | ',
										italics: true,
										size: 18,
										font: FONT_FAMILY,
										color: COLOR_MUTED
									}),
									new TextRun({
										text: 'GARASI TA (GARTA)',
										bold: true,
										size: 18,
										font: FONT_FAMILY,
										color: COLOR_ACCENT
									})
								],
								alignment: AlignmentType.RIGHT,
								spacing: { after: 120 }
							})
						]
					})
				},
				footers: {
					default: new Footer({
						children: [
							new Paragraph({
								children: [
									new TextRun({
										text: 'Muh. Ryan Ardiansyah  •  ',
										size: 18,
										font: FONT_FAMILY,
										color: COLOR_MUTED
									}),
									new TextRun({
										text: 'Halaman ',
										size: 18,
										font: FONT_FAMILY,
										color: COLOR_MUTED
									}),
									new TextRun({
										children: [PageNumber.CURRENT],
										size: 18,
										font: FONT_FAMILY,
										color: COLOR_MUTED
									}),
									new TextRun({
										text: ' dari ',
										size: 18,
										font: FONT_FAMILY,
										color: COLOR_MUTED
									}),
									new TextRun({
										children: [PageNumber.TOTAL_PAGES],
										size: 18,
										font: FONT_FAMILY,
										color: COLOR_MUTED
									})
								],
								alignment: AlignmentType.RIGHT,
								spacing: { before: 120 }
							})
						]
					})
				},
				children: [
					// ==================== HEADER / TITLE ====================
					createTitle('LAPORAN PROYEK LSP OKUPASI PEMROGRAM'),
					createSubtitle('Sistem Manajemen dan Penyewaan Garasi Modern (GARASI TA)'),

					// ==================== METADATA TABLE ====================
					buildMetaTable(),

					new Paragraph({ spacing: { after: 200 } }),

					// ==================== RINGKASAN SISTEM ====================
					createHeading1('Ringkasan Sistem dan Spesifikasi Kebutuhan'),
					createParagraph(
						'GARASI TA (GARTA) adalah aplikasi web full-stack modern yang dirancang untuk mengelola unit garasi dan seluruh transaksi penyewaan kendaraan roda dua (sepeda manual dan sepeda motor), mobil bensin/diesel, serta mobil listrik (Electric Vehicle / EV). Sistem ini memisahkan secara ketat hak akses antara Administrator (pengelola operasional) dan Penyewa (pengguna umum).'
					),

					createHeading2('Kebutuhan Fungsional'),
					createBullet(
						'Calon penyewa mendaftar akun secara mandiri menggunakan NIK tepat 16 digit angka, nama lengkap, nomor telepon (10–15 digit), alamat email unik, serta kata sandi minimal 6 karakter.',
						'1. Registrasi Akun Penyewa:'
					),
					createBullet(
						'Administrator memiliki wewenang untuk memeriksa berkas dan memverifikasi calon penyewa (APPROVED atau REJECTED) sebelum akun tersebut dapat melakukan transaksi penyewaan.',
						'2. Verifikasi Calon Penyewa:'
					),
					createBullet(
						'Administrator dapat menambah unit garasi secara massal per kategori (kode S untuk sepeda/motor, C untuk mobil konvensional, E untuk mobil listrik) dengan format 3 digit hingga batas maksimal 999 unit per kategori.',
						'3. Manajemen Inventaris Garasi Massal:'
					),
					createBullet(
						'Penyewa yang telah terverifikasi (APPROVED) dapat menyewa garasi secara harian atau bulanan (tarif bulanan flat dihitung 25 kali tarif harian), mendaftarkan atau memilih kendaraan, memilih unit garasi yang kosong pada rentang tanggal yang diinginkan, menghitung estimasi biaya pengisian baterai EV per kWh, serta mengunggah bukti transfer pembayaran.',
						'4. Transaksi Sewa Baru & Cas Listrik:'
					),
					createBullet(
						'Administrator dapat memperpanjang masa sewa aktif pada hari berjalan dengan perhitungan blok bulan penuh (25 kali tarif harian) ditambah sisa hari, disertai unggah bukti pelunasan perpanjangan.',
						'5. Perpanjangan Masa Sewa Aktif:'
					),
					createBullet(
						'Administrator dapat menyaring dan mencetak laporan transaksi persewaan beserta akumulasi total pendapatan berdasarkan bulan, tanggal harian, tipe garasi, atau penyewa secara instan.',
						'6. Laporan Keuangan dan Transaksi:'
					),

					// ==================== USE CASE DIAGRAM ====================
					createHeading1('Use Case Diagram'),
					...createImageWithCaption('image7.png', 'Gambar 1. Use Case Diagram Sistem GARASI TA', 580),
					createParagraph(
						'Diagram use case di atas menggambarkan alur interaksi dari aktor utama terhadap sistem GARASI TA:'
					),
					createBullet(
						'Mendaftar akun menggunakan NIK 16 digit valid, login/logout, serta melihat status verifikasi, daftar kendaraan, dan riwayat transaksi sewa melalui dashboard.',
						'• Calon Penyewa:'
					),
					createBullet(
						'Mewarisi seluruh hak akses Calon Penyewa dan mendapatkan hak akses untuk membuat transaksi sewa baru setelah akun disetujui (APPROVED) oleh Administrator.',
						'• Penyewa (Terverifikasi):'
					),
					createBullet(
						'Melakukan autentikasi, memverifikasi (menyetujui/menolak) calon penyewa, menambah unit garasi secara massal (bulk generate), memperpanjang transaksi sewa aktif, serta memantau dan mencetak laporan keuangan.',
						'• Administrator:'
					),

					// ==================== CLASS DIAGRAM ====================
					createHeading1('Class Diagram'),
					// NOTE: scaled to 580 so it NEVER overflows margins!
					...createImageWithCaption(
						'image14.png',
						'Gambar 2. Class Diagram Arsitektur 3 Lapis (Models, Services, Repositories)',
						580,
						335
					),
					createParagraph(
						'Struktur kelas pada aplikasi GARASI TA dibangun menggunakan prinsip Pemrograman Berorientasi Objek (PBO) dengan pembagian arsitektur 3 lapis yang bersih (Clean Architecture):'
					),
					createBullet(
						'Terdiri dari kelas abstrak BaseModel yang diturunkan ke UserModel, KendaraanModel, GarasiModel, dan SewaModel, ditambah PerpanjanganSewaDTO. Lapisan ini mengenkapsulasi seluruh aturan bisnis inti, mulai dari validasi NIK 16 digit, penomoran kode unit 3 digit (S001, C001, E001), matriks kecocokan kendaraan dengan garasi, hingga formula kalkulasi tarif (25x harian) dan biaya listrik EV.',
						'1. Domain Models:'
					),
					createBullet(
						'Berisi AuthService, SewaService, GarasiService, dan LaporanService yang mengoordinasikan use case sistem dan menjadi jembatan antara tampilan UI dengan model dan database.',
						'2. Services Layer:'
					),
					createBullet(
						'Berisi UserRepository, KendaraanRepository, GarasiRepository, dan SewaRepository yang menangani persistensi data secara terstruktur dengan transaksi ACID dan integritas relasional.',
						'3. Repositories Layer:'
					),

					// ==================== ERD ====================
					createHeading1('Entity-Relationship Diagram (ERD) Basis Data Relasional'),
					...createImageWithCaption(
						'image1.png',
						'Gambar 3. Entity-Relationship Diagram (ERD) Basis Data Relasional',
						580
					),
					createParagraph(
						'Basis data sistem GARASI TA dirancang menggunakan skema relasional terstruktur ACID dengan lima entitas utama yang saling terhubung secara konsisten:'
					),
					createBullet(
						'Menyimpan data akun Admin dan Penyewa, termasuk NIK 16 digit unik, nomor telepon, email, kata sandi terenkripsi, dan status verifikasi.',
						'• Users:'
					),
					createBullet(
						'Menyimpan master unit garasi dengan kode unik (S/C/E), tipe garasi, tarif harian, tarif listrik SPKLU per kWh, dan status ketersediaan.',
						'• Garages:'
					),
					createBullet(
						'Menyimpan data kendaraan milik penyewa, meliputi jenis kendaraan, merek/model, nomor plat registrasi, dan kapasitas baterai (khusus mobil listrik).',
						'• Kendaraan / Rentals Vehicle:'
					),
					createBullet(
						'Mencatat transaksi sewa yang menghubungkan pengguna, unit garasi, dan kendaraan, mencakup rentang tanggal mulai-selesai, rincian biaya sewa & listrik, serta bukti transfer.',
						'• Rentals (Sewa):'
					),
					createBullet(
						'Merekam audit riwayat setiap kali transaksi sewa diperpanjang oleh Admin, mencakup tanggal selesai baru, tambahan hari, biaya tambahan, dan bukti pembayaran perpanjangan.',
						'• RentalExtensions (Perpanjangan Sewa):'
					),

					new Paragraph({ spacing: { before: 120, after: 60 } }),
					createParagraph('Adapun relasi dan kardinalitas antar tabel adalah sebagai berikut:', true),

					// Table 1: Kardinalitas
					new Table({
						width: { size: 100, type: WidthType.PERCENTAGE },
						borders: tableBorderDef,
						rows: [
							new TableRow({
								cantSplit: true,
								tblHeader: true,
								children: [
									createTableCell('Relasi Tabel', true, 25),
									createTableCell('Kardinalitas', true, 18),
									createTableCell('Keterangan Aturan Bisnis', true, 57)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('User → Kendaraan', false, 25),
									createTableCell('1 : N (One-to-Many)', false, 18),
									createTableCell('Satu penyewa dapat mendaftarkan lebih dari satu kendaraan.', false, 57)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('User → Sewa', false, 25, true),
									createTableCell('1 : N (One-to-Many)', false, 18, true),
									createTableCell(
										'Satu penyewa dapat memiliki banyak riwayat transaksi sewa garasi.',
										false,
										57,
										true
									)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('Garasi → Sewa', false, 25),
									createTableCell('1 : N (One-to-Many)', false, 18),
									createTableCell(
										'Satu unit garasi dapat disewa berulang kali pada jadwal rentang tanggal yang berbeda tanpa bentrok.',
										false,
										57
									)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('Kendaraan → Sewa', false, 25, true),
									createTableCell('1 : N (One-to-Many)', false, 18, true),
									createTableCell(
										'Satu kendaraan dapat didaftarkan pada beberapa transaksi sewa dari waktu ke waktu.',
										false,
										57,
										true
									)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('Sewa → PerpanjanganSewa', false, 25),
									createTableCell('1 : N (One-to-Many)', false, 18),
									createTableCell(
										'Satu transaksi sewa aktif dapat diperpanjang lebih dari satu kali oleh Admin.',
										false,
										57
									)
								]
							})
						]
					}),

					// ==================== LIBRARY TABLE ====================
					createHeading1('Penjelasan Library dan Pre-Existing Component yang Digunakan'),
					createParagraph(
						'Pengembangan aplikasi GARASI TA memanfaatkan ekosistem modern yang efisien, berkinerja tinggi, dan terstandarisasi untuk menjamin kecepatan eksekusi, keandalan persistensi data, serta keamanan operasional:'
					),

					new Table({
						width: { size: 100, type: WidthType.PERCENTAGE },
						borders: tableBorderDef,
						rows: [
							new TableRow({
								cantSplit: true,
								tblHeader: true,
								children: [
									createTableCell('Library / Tools', true, 26),
									createTableCell('Versi', true, 14),
									createTableCell('Lisensi', true, 14),
									createTableCell('Fungsi dan Alasan Pemilihan', true, 46)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('SvelteKit & Svelte', false, 26),
									createTableCell('^3.2.0 / ^5.57.3', false, 14),
									createTableCell('MIT', false, 14),
									createTableCell(
										'Framework full-stack utama untuk merender antarmuka pengguna reaktif sekaligus menangani server endpoints, form actions, validasi, dan proteksi sesi dalam satu arsitektur terintegrasi.',
										false,
										46
									)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('Tailwind CSS v4', false, 26, true),
									createTableCell('^4.3.5', false, 14, true),
									createTableCell('MIT', false, 14, true),
									createTableCell(
										'Utility-first CSS framework untuk membangun desain antarmuka responsif kelas eksekutif dengan palet warna natural (#8B774F, #8F987E, #EDE8D2).',
										false,
										46,
										true
									)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('Bun Runtime & Package Manager', false, 26),
									createTableCell('1.4.0', false, 14),
									createTableCell('MIT', false, 14),
									createTableCell(
										'JavaScript & TypeScript all-in-one runtime ultra-cepat yang menggantikan Node.js dan npm, mempercepat proses instalasi paket, eksekusi skrip, dan pengujian unit.',
										false,
										46
									)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('Basis Data Relasional & DDL ACID', false, 26, true),
									createTableCell('Native / SQL', false, 14, true),
									createTableCell('Public Domain', false, 14, true),
									createTableCell(
										'Mengimplementasikan unit kompetensi basis data relasional menggunakan SQLite (node:sqlite DatabaseSync) dan PostgreSQL dengan transaksi ACID, Foreign Key ON DELETE CASCADE/RESTRICT, dan indeks performa.',
										false,
										46,
										true
									)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('Vitest', false, 26),
									createTableCell('^5.1.0', false, 14),
									createTableCell('MIT', false, 14),
									createTableCell(
										'Test runner otomatis untuk menjalankan pengujian unit Black-box (BVA & EP) pada logika domain model dan kalkulator biaya secara instan.',
										false,
										46
									)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('TypeScript', false, 26, true),
									createTableCell('^6.0.3', false, 14, true),
									createTableCell('Apache-2.0', false, 14, true),
									createTableCell(
										'Menjamin pengetikan statis (static typing) yang ketat pada domain models, DTO, dan repositories untuk meminimalisasi bug runtime.',
										false,
										46,
										true
									)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('Lucide Svelte', false, 26),
									createTableCell('^1.0.1', false, 14),
									createTableCell('ISC', false, 14),
									createTableCell(
										'Kumpulan ikon vektor modern dan konsisten untuk navigasi menu, status badge, dan tombol aksi pada antarmuka pengguna.',
										false,
										46
									)
								]
							})
						]
					}),

					// ==================== FITUR APLIKASI ====================
					createHeading1('Fitur-Fitur Aplikasi yang Dihasilkan'),

					createHeading2('1. Halaman Utama (Landing Page)'),
					createParagraph(
						'Halaman awal menampilkan informasi profil layanan GARASI TA, katalog tiga tipe garasi (Sepeda & Motor S001–S999, Mobil Bensin/Diesel C001–C999, dan Mobil Listrik EV E001–E999), tombol akses masuk akun, serta tombol registrasi.'
					),
					...createImageWithCaption('image2.png', 'Gambar 4. Halaman Utama GARASI TA', 580),

					createHeading2('2. Registrasi Calon Penyewa dengan Validasi NIK 16 Digit'),
					createParagraph(
						'Formulir pendaftaran dilengkapi validasi ketat di sisi klien dan server: NIK wajib tepat 16 digit angka, nomor telepon 10–15 digit, email valid dan unik, serta kata sandi minimal 6 karakter. Sistem secara otomatis menolak NIK yang tidak memenuhi 16 digit angka.'
					),
					...createImageWithCaption(
						'image11.png',
						'Gambar 5. Halaman Pendaftaran Calon Penyewa dengan Validasi NIK 16 Digit',
						580
					),

					createHeading2('3. Dashboard Penyewa (Status Akun Menunggu Verifikasi / PENDING)'),
					createParagraph(
						'Setiap akun yang baru mendaftar otomatis memiliki status PENDING. Selama akun belum diverifikasi oleh Administrator, dashboard menyajikan banner notifikasi resmi bahwa akun sedang dalam antrean verifikasi dan akses sewa garasi baru dikunci demi keamanan.'
					),
					...createImageWithCaption(
						'image8.png',
						'Gambar 6. Dashboard Penyewa Saat Status Akun Masih PENDING',
						580
					),

					createHeading2('4. Panel Verifikasi Calon Penyewa oleh Administrator'),
					createParagraph(
						'Administrator dapat memeriksa berkas pendaftar, menyaring daftar pendaftar berdasarkan status (Pending, Disetujui, Ditolak), dan memberikan keputusan persetujuan (APPROVED) atau penolakan (REJECTED). Begitu disetujui, penyewa langsung dapat melakukan transaksi sewa.'
					),
					...createImageWithCaption(
						'image12.png',
						'Gambar 7. Halaman Verifikasi Calon Penyewa pada Panel Admin',
						580
					),

					createHeading2('5. Formulir Transaksi Sewa Garasi Baru'),
					createParagraph(
						'Penyewa yang berstatus APPROVED dapat memilih kendaraan miliknya atau mendaftarkan kendaraan baru, memilih paket harian atau bulanan (tarif bulanan otomatis dihitung flat 25 kali tarif harian), serta menentukan tanggal mulai dan selesai.'
					),
					...createImageWithCaption(
						'image13.png',
						'Gambar 8. Formulir Sewa Garasi Baru (Identitas Kendaraan dan Paket Durasi)',
						580
					),
					createParagraph(
						'Sistem secara dinamis menyajikan daftar slot unit garasi yang benar-benar kosong pada tanggal yang dipilih. Khusus mobil listrik yang memilih garasi EV, sistem otomatis menghitung tambahan biaya cas listrik berdasarkan kebutuhan daya baterai (kWh) dikalikan tarif per kWh, kemudian penyewa mengunggah bukti transfer.'
					),
					...createImageWithCaption(
						'image3.png',
						'Gambar 9. Formulir Sewa Garasi Baru (Pilihan Unit Tersedia, Rincian Biaya, dan Bukti Bayar)',
						580
					),

					createHeading2('6. Panel Inventaris Garasi dan Penambahan Unit Massal (Bulk Generate)'),
					createParagraph(
						'Administrator dapat memantau ketersediaan seluruh unit garasi per kategori dan menambah unit baru secara massal (bulk insert) dengan kode terstandarisasi 3 digit berurutan hingga batas maksimal 999 unit per kategori (misal: S001–S999, C001–C999, E001–E999).'
					),
					...createImageWithCaption(
						'image6.png',
						'Gambar 10. Panel Inventaris Unit Garasi dan Form Tambah Unit Massal',
						580
					),

					createHeading2('7. Perpanjangan Masa Sewa Aktif oleh Administrator'),
					createParagraph(
						'Administrator dapat meninjau daftar penyewaan aktif yang sedang berlangsung dan memperpanjang masa sewa atas permintaan penyewa pada hari berjalan.'
					),
					...createImageWithCaption(
						'image5.png',
						'Gambar 11. Daftar Transaksi Sewa Aktif pada Menu Perpanjangan Sewa',
						580
					),
					createParagraph(
						'Pada modal pop-up perpanjangan, Admin memilih tanggal selesai baru (tersedia tombol cepat +1 Bulan Penuh). Sistem secara otomatis menghitung tambahan hari dan tambahan biaya (blok bulan dihitung 25x tarif harian ditambah sisa hari), lalu Admin mengunggah bukti transfer pelunasan perpanjangan.'
					),
					...createImageWithCaption(
						'image9.png',
						'Gambar 12. Pop-up Perpanjangan Masa Sewa dengan Perhitungan Biaya Tambahan',
						580
					),

					createHeading2('8. Laporan Transaksi Persewaan dan Cetak PDF'),
					createParagraph(
						'Halaman laporan merangkum metrik performa utama: total omzet pendapatan, jumlah unit garasi terisi, serta jumlah penyewa aktif. Data laporan dapat disaring fleksibel berdasarkan 4 kriteria (per bulan, per hari, per tipe garasi, atau per penyewa) dan dapat langsung dicetak atau diekspor ke PDF dengan tata letak dokumen yang rapi.'
					),
					...createImageWithCaption(
						'image4.png',
						'Gambar 13. Halaman Laporan Persewaan dan Keuangan Admin',
						580
					),

					// ==================== UNIT TESTING ====================
					createHeading1('Skenario dan Hasil Pengujian Unit (Black-box Testing)'),
					createParagraph(
						'Pengujian perangkat lunak dilakukan menggunakan framework Vitest dengan metode pengujian fungsional Black-box Testing. Teknik yang diterapkan meliputi Boundary Value Analysis (BVA) untuk menguji nilai batas minimum/maksimum input dan Equivalence Partitioning (EP) untuk memvalidasi partisi kelas data valid serta tidak valid. Pengujian mencakup 7 kelompok modul domain bisnis dengan total 31 skenario uji yang lulus 100%:'
					),

					// Table 3: Skenario Unit Testing
					new Table({
						width: { size: 100, type: WidthType.PERCENTAGE },
						borders: tableBorderDef,
						rows: [
							new TableRow({
								cantSplit: true,
								tblHeader: true,
								children: [
									createTableCell('Modul (Jumlah Tes)', true, 22),
									createTableCell('Teknik', true, 13),
									createTableCell('Skenario dan Data Uji', true, 35),
									createTableCell('Hasil yang Diharapkan', true, 22),
									createTableCell('Status', true, 8)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('UserModel (5 tes)', false, 22),
									createTableCell('BVA & EP', false, 13),
									createTableCell(
										'Validasi NIK dengan variasi input: 15 digit, 16 digit angka, 17 digit, 16 karakter berhuruf, serta nilai null untuk akun Admin.',
										false,
										35
									),
									createTableCell(
										'Hanya NIK tepat 16 digit angka (Penyewa) dan null (Admin) yang diterima; format lain ditolak sistem.',
										false,
										22
									),
									createTableCell('PASS', true, 8)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('GarasiModel (6 tes)', false, 22, true),
									createTableCell('BVA & EP', false, 13, true),
									createTableCell(
										'Batas kapasitas kumulatif unit garasi (998+1, 998+2, jumlah 0, dan -5) serta pembuatan format kode 3 digit (1, 10, 999, 1000).',
										false,
										35,
										true
									),
									createTableCell(
										'Maksimal 999 unit per kategori diterima dengan kode S001, C010, E999; input 0/negatif dan urutan ke-1000 ditolak.',
										false,
										22,
										true
									),
									createTableCell('PASS', true, 8, true)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('KendaraanModel & GarasiModel (4 tes)', false, 22),
									createTableCell('EP', false, 13),
									createTableCell(
										'Matriks kompatibilitas 4 tipe kendaraan (Sepeda, Sepeda Motor, Mobil, Mobil Listrik) terhadap 3 tipe garasi (SEPEDA, MOBIL, MOBIL_LISTRIK).',
										false,
										35
									),
									createTableCell(
										'Sepeda dan Motor hanya dapat diparkir di garasi SEPEDA, Mobil di MOBIL, Mobil Listrik di MOBIL atau MOBIL_LISTRIK.',
										false,
										22
									),
									createTableCell('PASS', true, 8)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('KendaraanModel & SewaModel (4 tes)', false, 22, true),
									createTableCell('EP & BVA', false, 13, true),
									createTableCell(
										'Validasi plat nomor (sepeda tanpa plat vs kendaraan bermotor wajib plat) serta batasan kapasitas baterai mobil listrik (kapasitas 0, negatif, dan sisa daya melebihi kapasitas).',
										false,
										35,
										true
									),
									createTableCell(
										'Sepeda diperbolehkan tanpa plat nomor, kendaraan bermotor wajib plat, kapasitas baterai wajib positif dan sisa daya valid.',
										false,
										22,
										true
									),
									createTableCell('PASS', true, 8, true)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('SewaModel: Durasi (4 tes)', false, 22),
									createTableCell('BVA', false, 13),
									createTableCell(
										'Batas durasi sewa harian per bulan kalender: Februari 2026 (28 hari), Februari 2028 kabisat (29 hari), November 2026 (30 hari), dan Desember 2026 (31 hari).',
										false,
										35
									),
									createTableCell(
										'Maksimal durasi paket harian adalah hari bulan - 1; durasi 0 hari atau sebulan penuh dialihkan ke paket bulanan.',
										false,
										22
									),
									createTableCell('PASS', true, 8)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('SewaModel: Tanggal Mulai (3 tes)', false, 22, true),
									createTableCell('BVA', false, 13, true),
									createTableCell(
										'Validasi tanggal awal sewa: tanggal kemarin (lampau), tanggal hari ini (berjalan), dan tanggal minggu depan (pemesanan mendatang).',
										false,
										35,
										true
									),
									createTableCell(
										'Tanggal lampau ditolak oleh validator; tanggal hari ini dan tanggal mendatang diterima dengan sukses.',
										false,
										22,
										true
									),
									createTableCell('PASS', true, 8, true)
								]
							}),
							new TableRow({
								cantSplit: true,
								children: [
									createTableCell('SewaModel: Kalkulasi Biaya (5 tes)', false, 22),
									createTableCell('EP', false, 13),
									createTableCell(
										'Perhitungan biaya sewa harian (3 x Rp10.000), tarif bulanan (25 x Rp10.000), cas baterai EV ((50 - 5) x Rp2.500), akumulasi total bulanan + cas listrik, serta perpanjangan 5 hari.',
										false,
										35
									),
									createTableCell(
										'Hasil perhitungan persis: Harian Rp30.000, Bulanan Rp250.000, Listrik Rp112.500, Total Rp362.500, Perpanjangan Rp50.000.',
										false,
										22
									),
									createTableCell('PASS', true, 8)
								]
							})
						]
					}),

					...createImageWithCaption(
						'image10.png',
						'Gambar 14. Hasil Pengujian Unit Black-box Testing Menggunakan Vitest (31 Skenario Lulus)',
						520,
						469
					),
					createParagraph(
						'Dari hasil eksekusi runner pengujian, seluruh 31 skenario pengujian unit berhasil lulus 100% (31/31 passed). Hal ini membuktikan bahwa seluruh aturan bisnis, validasi integritas data, formula penomoran unik, pencegahan bentrok slot garasi, dan formula perhitungan tarif telah terverifikasi secara matematis dan fungsional.'
					),

					// ==================== GITHUB & PANDUAN RUNNING ====================
					createHeading1('Repositori Kode Program dan Panduan Menjalankan Sistem'),
					createParagraph(
						'Seluruh kode sumber aplikasi GARASI TA dikelola menggunakan sistem kontrol versi Git dan dapat diakses publik melalui tautan repositori GitHub resmi berikut:'
					),

					new Paragraph({
						children: [
							new TextRun({
								text: 'https://github.com/mzkyann/Project_Garasi_LSP_Muh_Ryan_Ardiansyah',
								bold: true,
								size: 22,
								font: FONT_FAMILY,
								color: '2563EB'
							})
						],
						alignment: AlignmentType.CENTER,
						spacing: { before: 100, after: 180 }
					}),

					createHeading2('Langkah Menjalankan Aplikasi di Komputer Lokal (Menggunakan Bun):'),
					createBullet(
						'Buka terminal pada direktori proyek, kemudian jalankan perintah bun install untuk mengunduh seluruh dependensi aplikasi.',
						'1. Instal Dependensi:'
					),
					createBullet(
						'Jalankan perintah bun run db:reset untuk menginisialisasi skema tabel basis data relasional (SQLite/PostgreSQL) dan mengisi data awal (seeding data demo).',
						'2. Inisialisasi Basis Data Relasional:'
					),
					createBullet(
						'Jalankan aplikasi dengan perintah bun run dev. Server lokal akan aktif dan dapat diakses melalui browser pada URL http://localhost:5173.',
						'3. Jalankan Server Pengembangan:'
					),
					createBullet(
						'Jalankan perintah bun run test atau bunx vitest run untuk mengeksekusi seluruh 31 skenario pengujian unit secara otomatis.',
						'4. Eksekusi Pengujian Unit Otomatis:'
					),

					createHeading2('Daftar Akun Demo untuk Pengujian:'),
					createBullet('admin@garasi.id / admin123 (NIK: 1234567890123456)', '• Administrator:'),
					createBullet(
						'budi@gmail.com / budi123 (NIK: 3578012345670001) — Memiliki kendaraan Mobil & Motor',
						'• Penyewa Terverifikasi (APPROVED):'
					),
					createBullet(
						'ani@gmail.com / ani123 (NIK: 3578019876540002) — Menunggu persetujuan Admin',
						'• Calon Penyewa PENDING 1:'
					),
					createBullet(
						'citra@gmail.com / citra123 (NIK: 3578015544330003) — Antrean verifikasi baru',
						'• Calon Penyewa PENDING 2:'
					),
					createBullet(
						'doni@gmail.com / doni123 (NIK: 3578011122330004) — Akun ditolak verifikasinya',
						'• Calon Penyewa REJECTED:'
					)
				]
			}
		]
	});

	// Output paths
	const outPath1 = path.resolve(process.cwd(), 'LAPORAN_PROYEK_LSP_MUH_RYAN_ARDIANSYAH.docx');
	const outPath2 = path.resolve(
		process.cwd(),
		'Laporan_LSP_Muh._Ryan_Ardiansyah_0806022310019_FIXED.docx'
	);

	const buffer = await Packer.toBuffer(doc);
	fs.writeFileSync(outPath1, buffer);
	fs.writeFileSync(outPath2, buffer);

	console.log(`Successfully generated DOCX files:\n1. ${outPath1} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)\n2. ${outPath2} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

generateDocx().catch((err) => {
	console.error('Error generating document:', err);
	process.exit(1);
});
