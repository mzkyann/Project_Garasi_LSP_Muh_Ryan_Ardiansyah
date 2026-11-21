// scripts/reset-db.js
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'garage.db');

try {
	if (fs.existsSync(dbPath)) {
		try {
			fs.unlinkSync(dbPath);
			console.log('Database lama garage.db berhasil dihapus.');
		} catch (err) {
			console.log('File garage.db sedang dibuka proses lain, melakukan reset tabel SQL...');
		}
	}

	// Import module DB untuk menginisialisasi ulang & paksa seed data
	const dbModule = await import('../src/lib/server/db/index.ts');
	if (typeof dbModule.seedInitialData === 'function') {
		dbModule.seedInitialData(true);
	}
	console.log('Database garage.db berhasil di-reset dan di-seed dengan data lengkap sesuai instruksi!');
} catch (error) {
	console.error('Gagal mereset database:', error);
	process.exit(1);
}

