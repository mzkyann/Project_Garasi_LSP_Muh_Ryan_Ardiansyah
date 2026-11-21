// src/lib/server/domain/Vehicle.ts
/**
 * Implementasi Pemrograman Berorientasi Objek (OOP)
 * Unit Kompetensi: J.620100.018.02
 * Base Class Kendaraan dan Turunannya (Inheritance & Polymorphism)
 */

export type VehicleCategory = 'sepeda' | 'sepeda_motor' | 'mobil' | 'mobil_listrik';

export abstract class Vehicle {
	protected _brandAndType: string;
	protected _category: VehicleCategory;
	protected _licensePlate: string | null;

	constructor(category: VehicleCategory, brandAndType: string, licensePlate: string | null = null) {
		this._category = category;
		this._brandAndType = brandAndType;
		this._licensePlate = licensePlate;
	}

	get category(): VehicleCategory {
		return this._category;
	}

	get brandAndType(): string {
		return this._brandAndType;
	}

	get licensePlate(): string | null {
		return this._licensePlate;
	}

	/**
	 * Validasi kelayakan nomor plat sesuai aturan:
	 * Sepeda tidak wajib punya plat; Sepeda motor, mobil, dan mobil listrik wajib.
	 */
	public validateLicensePlate(): boolean {
		if (this._category === 'sepeda') {
			return true;
		}
		return !!(this._licensePlate && this._licensePlate.trim().length > 0);
	}
}

export class Bicycle extends Vehicle {
	constructor(brandAndType: string) {
		super('sepeda', brandAndType, null);
	}
}

export class Motorcycle extends Vehicle {
	constructor(brandAndType: string, licensePlate: string) {
		super('sepeda_motor', brandAndType, licensePlate);
	}
}

export class GasolineCar extends Vehicle {
	constructor(brandAndType: string, licensePlate: string) {
		super('mobil', brandAndType, licensePlate);
	}
}

export class ElectricCar extends Vehicle {
	private _batteryCapacityKwh: number;

	constructor(brandAndType: string, licensePlate: string, batteryCapacityKwh: number) {
		super('mobil_listrik', brandAndType, licensePlate);
		if (batteryCapacityKwh <= 0) {
			throw new Error('Kapasitas baterai mobil listrik harus lebih dari 0 kWh');
		}
		this._batteryCapacityKwh = batteryCapacityKwh;
	}

	get batteryCapacityKwh(): number {
		return this._batteryCapacityKwh;
	}
}
