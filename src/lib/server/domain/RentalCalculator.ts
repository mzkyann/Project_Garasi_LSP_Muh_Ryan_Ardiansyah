// src/lib/server/domain/RentalCalculator.ts
/**
 * Logika Bisnis & Perhitungan Biaya Persewaan Garasi
 * Memenuhi Aturan:
 * 1. Sepeda/sepeda motor hanya di garasi sepeda
 * 2. Mobil bensin hanya di garasi mobil
 * 3. Mobil listrik di garasi mobil atau mobil listrik
 * 4. Mobil listrik di garasi mobil listrik WAJIB isi listrik hingga penuh (Kapasitas kWh * tarif per kWh)
 * 5. Durasi sewa harian maks 30 hari. Sewa bulanan tarif 25 x tarif harian
 * 6. Tanggal mulai selalu hari ini, tanggal selesai otomatis
 * 7. Perpanjangan garasi: menghitung selisih hari dan biaya tambahan
 */

import { Vehicle, ElectricCar } from './Vehicle';
import { Garage, ElectricCarGarage, type GarageType } from './Garage';

export interface RentalCostBreakdown {
	baseRentalCost: number;
	electricityCost: number;
	totalCost: number;
	durationText: string;
	startDate: string;
	endDate: string;
}

export interface ExtensionCostBreakdown {
	additionalDays: number;
	dailyRate: number;
	additionalCost: number;
	oldEndDate: string;
	newEndDate: string;
}

export class RentalCalculator {
	/**
	 * Cek apakah kendaraan diizinkan diparkir pada tipe garasi tertentu
	 */
	public static isCompatible(vehicleCategory: string, garageType: GarageType): boolean {
		if (vehicleCategory === 'sepeda' || vehicleCategory === 'sepeda_motor') {
			return garageType === 'sepeda';
		}
		if (vehicleCategory === 'mobil') {
			return garageType === 'mobil';
		}
		if (vehicleCategory === 'mobil_listrik') {
			return garageType === 'mobil' || garageType === 'mobil_listrik';
		}
		return false;
	}

	/**
	 * Hitung tanggal selesai berdasarkan tanggal mulai dan durasi
	 */
	public static calculateEndDate(
		startDate: string,
		rentalType: 'harian' | 'bulanan',
		duration: number
	): string {
		const start = new Date(startDate);
		if (isNaN(start.getTime())) {
			throw new Error('Format tanggal mulai tidak valid');
		}

		const end = new Date(start);
		if (rentalType === 'harian') {
			if (duration < 1 || duration > 30) {
				throw new Error('Jumlah hari untuk sewa harian harus antara 1 sampai 30 hari');
			}
			// Misal mulai tgl 1, durasi 1 hari -> selesai tgl 2
			end.setDate(end.getDate() + duration);
		} else if (rentalType === 'bulanan') {
			if (duration < 1) {
				throw new Error('Durasi sewa bulanan minimal 1 bulan');
			}
			end.setMonth(end.getMonth() + duration);
		} else {
			throw new Error(`Tipe sewa tidak dikenal: ${rentalType}`);
		}

		return end.toISOString().split('T')[0];
	}

	/**
	 * Menghitung rincian biaya sewa baru
	 */
	public static calculateNewRentalCost(
		vehicle: Vehicle,
		garage: Garage,
		rentalType: 'harian' | 'bulanan',
		duration: number,
		startDate: string
	): RentalCostBreakdown {
		// 1. Validasi kesesuaian kendaraan & garasi
		if (!this.isCompatible(vehicle.category, garage.type)) {
			throw new Error(
				`Kendaraan tipe '${vehicle.category}' tidak diizinkan parkir di garasi '${garage.type}'`
			);
		}

		// 2. Validasi nomor plat
		if (!vehicle.validateLicensePlate()) {
			throw new Error(`Nomor plat kendaraan harus diisi untuk ${vehicle.category}`);
		}

		// 3. Validasi & hitung tanggal selesai
		const endDate = this.calculateEndDate(startDate, rentalType, duration);

		// 4. Hitung biaya pokok sewa
		let baseRentalCost = 0;
		let durationText = '';

		if (rentalType === 'harian') {
			baseRentalCost = duration * garage.dailyPrice;
			durationText = `${duration} Hari (@ Rp ${garage.dailyPrice.toLocaleString('id-ID')}/hari)`;
		} else {
			baseRentalCost = duration * garage.monthlyPrice;
			durationText = `${duration} Bulan (@ Rp ${garage.monthlyPrice.toLocaleString('id-ID')}/bulan)`;
		}

		// 5. Hitung biaya listrik (Khusus mobil listrik di garasi mobil listrik)
		let electricityCost = 0;
		if (vehicle instanceof ElectricCar && garage instanceof ElectricCarGarage) {
			electricityCost = vehicle.batteryCapacityKwh * garage.electricityPricePerKwh;
		}

		// 6. Total biaya
		const totalCost = baseRentalCost + electricityCost;

		return {
			baseRentalCost,
			electricityCost,
			totalCost,
			durationText,
			startDate,
			endDate
		};
	}

	/**
	 * Menghitung biaya perpanjangan garasi
	 */
	public static calculateExtensionCost(
		oldEndDate: string,
		newEndDate: string,
		dailyPrice: number
	): ExtensionCostBreakdown {
		const oldDate = new Date(oldEndDate);
		const newDate = new Date(newEndDate);

		if (isNaN(oldDate.getTime()) || isNaN(newDate.getTime())) {
			throw new Error('Format tanggal perpanjangan tidak valid');
		}

		// Hitung selisih hari
		const diffTime = newDate.getTime() - oldDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays <= 0) {
			throw new Error('Tanggal selesai baru harus lebih besar daripada tanggal selesai saat ini');
		}

		const additionalCost = diffDays * dailyPrice;

		return {
			additionalDays: diffDays,
			dailyRate: dailyPrice,
			additionalCost,
			oldEndDate,
			newEndDate
		};
	}
}

