// src/lib/server/domain/Garage.ts
/**
 * Implementasi Pemrograman Berorientasi Objek (OOP)
 * Unit Kompetensi: J.620100.018.02
 * Base Class Garasi dan Turunannya
 */

export type GarageType = 'sepeda' | 'mobil' | 'mobil_listrik';

export abstract class Garage {
	protected _id: number | null;
	protected _code: string;
	protected _type: GarageType;
	protected _dailyPrice: number;
	protected _status: 'available' | 'used';

	constructor(
		code: string,
		type: GarageType,
		dailyPrice: number,
		id: number | null = null,
		status: 'available' | 'used' = 'available'
	) {
		if (dailyPrice <= 0) {
			throw new Error('Harga sewa harian harus bernilai positif');
		}
		this._code = code;
		this._type = type;
		this._dailyPrice = dailyPrice;
		this._id = id;
		this._status = status;
	}

	get id(): number | null {
		return this._id;
	}

	get code(): string {
		return this._code;
	}

	get type(): GarageType {
		return this._type;
	}

	get dailyPrice(): number {
		return this._dailyPrice;
	}

	/**
	 * Aturan bisnis: Harga sewa bulanan adalah 25 x harga sewa harian
	 */
	get monthlyPrice(): number {
		return 25 * this._dailyPrice;
	}

	get status(): 'available' | 'used' {
		return this._status;
	}

	set status(newStatus: 'available' | 'used') {
		this._status = newStatus;
	}
}

export class BicycleGarage extends Garage {
	constructor(code: string, dailyPrice: number, id: number | null = null, status: 'available' | 'used' = 'available') {
		super(code, 'sepeda', dailyPrice, id, status);
	}
}

export class CarGarage extends Garage {
	constructor(code: string, dailyPrice: number, id: number | null = null, status: 'available' | 'used' = 'available') {
		super(code, 'mobil', dailyPrice, id, status);
	}
}

export class ElectricCarGarage extends Garage {
	private _electricityPricePerKwh: number;

	constructor(
		code: string,
		dailyPrice: number,
		electricityPricePerKwh: number,
		id: number | null = null,
		status: 'available' | 'used' = 'available'
	) {
		super(code, 'mobil_listrik', dailyPrice, id, status);
		if (electricityPricePerKwh < 0) {
			throw new Error('Harga listrik per kWh tidak boleh negatif');
		}
		this._electricityPricePerKwh = electricityPricePerKwh;
	}

	get electricityPricePerKwh(): number {
		return this._electricityPricePerKwh;
	}
}

