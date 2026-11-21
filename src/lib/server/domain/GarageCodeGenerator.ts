// src/lib/server/domain/GarageCodeGenerator.ts
/**
 * Generator Kode Garasi Otomatis (Incremental)
 * Aturan Bisnis:
 * S+<3 digit> untuk sepeda (misal S001)
 * C+<3 digit> untuk mobil (misal C001, C010)
 * E+<3 digit> untuk mobil listrik (misal E001)
 * Tiga digit tersebut adalah hasil incremental setiap kali garasi dengan tipe yang sama dibuat.
 * Maksimum 999.
 */

import type { GarageType } from './Garage';

export class GarageCodeGenerator {
	/**
	 * Mendapatkan prefix kode berdasarkan tipe garasi
	 */
	public static getPrefix(type: GarageType): string {
		switch (type) {
			case 'sepeda':
				return 'S';
			case 'mobil':
				return 'C';
			case 'mobil_listrik':
				return 'E';
			default:
				throw new Error(`Tipe garasi tidak dikenal: ${type}`);
		}
	}

	/**
	 * Format sequence number menjadi kode lengkap dengan padding 3 digit
	 * Contoh: (type='mobil', seq=10) => 'C010'
	 */
	public static formatCode(type: GarageType, sequenceNumber: number): string {
		if (sequenceNumber < 1 || sequenceNumber > 999) {
			throw new Error(`Nomor urut garasi harus antara 1 sampai 999, diterima: ${sequenceNumber}`);
		}
		const prefix = this.getPrefix(type);
		const padded = String(sequenceNumber).padStart(3, '0');
		return `${prefix}${padded}`;
	}

	/**
	 * Menghasilkan daftar kode berurutan untuk batch creation
	 * @param type Tipe garasi
	 * @param startingSeq Nomor urut berikutnya (misal jika sudah ada 5 garasi, startingSeq = 6)
	 * @param count Jumlah garasi yang ingin dibuat
	 */
	public static generateBatchCodes(type: GarageType, startingSeq: number, count: number): string[] {
		if (count < 1 || count > 999) {
			throw new Error('Jumlah garasi yang dibuat harus antara 1 sampai 999');
		}
		if (startingSeq + count - 1 > 999) {
			throw new Error('Jumlah akumulasi garasi melebihi batas maksimum 999');
		}

		const codes: string[] = [];
		for (let i = 0; i < count; i++) {
			codes.push(this.formatCode(type, startingSeq + i));
		}
		return codes;
	}
}
