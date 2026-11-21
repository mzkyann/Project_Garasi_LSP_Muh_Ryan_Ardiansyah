// scripts/reset-db.js
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'garage.db');
if (fs.existsSync(dbPath)) {
	fs.unlinkSync(dbPath);
	console.log('Database lama garage.db berhasil dihapus.');
}

// Import module DB untuk menginisialisasi ulang
await import('../src/lib/server/db/index.ts');
console.log('Database garage.db berhasil dibuat dan di-seed dengan data lengkap sesuai instruksi!');
