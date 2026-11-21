// src/routes/penyewa/sewa-baru/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { Buffer } from 'node:buffer';
import type { PageServerLoad } from './$types';
import { db } from '#lib/server/db/index.js';
import {
	Bicycle,
	Motorcycle,
	GasolineCar,
	ElectricCar,
	type Vehicle
} from '#lib/server/domain/Vehicle.js';
import {
	BicycleGarage,
	CarGarage,
	ElectricCarGarage,
	type Garage,
	type GarageType
} from '#lib/server/domain/Garage.js';
import { RentalCalculator } from '#lib/server/domain/RentalCalculator.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

	if (locals.user.role !== 'penyewa') {
		throw redirect(303, '/admin/garasi');
	}

	if (locals.user.status !== 'approved') {
		return {
			notApproved: true,
			userStatus: locals.user.status,
			availableGarages: [],
			today: new Date().toISOString().split('T')[0]
		};
	}

	const today = new Date().toISOString().split('T')[0];

	// Ambil semua garasi yang berstatus available
	const availableGarages = db.prepare(`
		SELECT id, code, type, daily_price, electricity_price_kwh, status
		FROM garages
		WHERE status = 'available'
		ORDER BY type, code ASC
	`).all() as any[];

	return {
		notApproved: false,
		userStatus: locals.user.status,
		availableGarages,
		today
	};
};

export const actions: Actions = {
	submitRental: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'penyewa' || locals.user.status !== 'approved') {
			return fail(403, { error: 'Akses ditolak atau akun belum disetujui' });
		}

		const data = await request.formData();
		const vehicleType = data.get('vehicleType')?.toString();
		const vehicleBrandModel = data.get('vehicleBrandModel')?.toString().trim();
		const licensePlate = data.get('licensePlate')?.toString().trim() || null;
		const batteryCapacity = parseFloat(data.get('batteryCapacity')?.toString() || '0');
		const rentalType = data.get('rentalType')?.toString() as 'harian' | 'bulanan';
		const duration = parseInt(data.get('duration')?.toString() || '1', 10);
		const garageId = parseInt(data.get('garageId')?.toString() || '0', 10);
		const proofFile = data.get('paymentProof') as File;

		const today = new Date().toISOString().split('T')[0];

		// Validasi dasar
		if (!vehicleType || !vehicleBrandModel || !rentalType || !garageId) {
			return fail(400, { error: 'Semua kolom formulir yang wajib harus diisi' });
		}

		// Validasi Garasi dari DB
		const rawGarage = db.prepare('SELECT * FROM garages WHERE id = ?').get(garageId) as any;
		if (!rawGarage) {
			return fail(404, { error: 'Garasi yang dipilih tidak ditemukan' });
		}
		if (rawGarage.status !== 'available') {
			return fail(400, { error: 'Garasi ini baru saja disewa dan sudah tidak tersedia' });
		}

		// Bentuk objek Domain OOP Vehicle
		let vehicleObj: Vehicle;
		try {
			if (vehicleType === 'sepeda') {
				vehicleObj = new Bicycle(vehicleBrandModel);
			} else if (vehicleType === 'sepeda_motor') {
				if (!licensePlate) throw new Error('Sepeda motor wajib memiliki nomor plat');
				vehicleObj = new Motorcycle(vehicleBrandModel, licensePlate);
			} else if (vehicleType === 'mobil') {
				if (!licensePlate) throw new Error('Mobil wajib memiliki nomor plat');
				vehicleObj = new GasolineCar(vehicleBrandModel, licensePlate);
			} else if (vehicleType === 'mobil_listrik') {
				if (!licensePlate) throw new Error('Mobil listrik wajib memiliki nomor plat');
				if (isNaN(batteryCapacity) || batteryCapacity <= 0) {
					throw new Error('Kapasitas baterai mobil listrik harus lebih dari 0 kWh');
				}
				vehicleObj = new ElectricCar(vehicleBrandModel, licensePlate, batteryCapacity);
			} else {
				throw new Error('Tipe kendaraan tidak valid');
			}
		} catch (err: any) {
			return fail(400, { error: err.message });
		}

		// Bentuk objek Domain OOP Garage
		let garageObj: Garage;
		if (rawGarage.type === 'sepeda') {
			garageObj = new BicycleGarage(rawGarage.code, rawGarage.daily_price, rawGarage.id);
		} else if (rawGarage.type === 'mobil') {
			garageObj = new CarGarage(rawGarage.code, rawGarage.daily_price, rawGarage.id);
		} else {
			garageObj = new ElectricCarGarage(
				rawGarage.code,
				rawGarage.daily_price,
				rawGarage.electricity_price_kwh,
				rawGarage.id
			);
		}

		// Kalkulasi biaya melalui OOP RentalCalculator
		let breakdown;
		try {
			breakdown = RentalCalculator.calculateNewRentalCost(
				vehicleObj,
				garageObj,
				rentalType,
				duration,
				today
			);
		} catch (err: any) {
			return fail(400, { error: err.message });
		}

		// Proses bukti pembayaran (file to base64 atau data URL placeholder)
		let paymentProofDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="%2322c55e"/><text x="10" y="55" fill="white">BUKTI BAYAR LUNAS</text></svg>';

		if (proofFile && proofFile.size > 0) {
			const buffer = await proofFile.arrayBuffer();
			const base64 = Buffer.from(buffer).toString('base64');
			paymentProofDataUrl = `data:${proofFile.type};base64,${base64}`;
		}

		const now = new Date().toISOString();

		// Simpan sewa ke database dan ubah status garasi menjadi 'used' dalam transaksi
		const insertRental = db.prepare(`
			INSERT INTO rentals (
				user_id, garage_id, vehicle_type, license_plate, vehicle_brand_model,
				battery_capacity_kwh, rental_type, duration, start_date, end_date,
				base_rental_cost, electricity_cost, total_cost, payment_proof, status, created_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
		`);

		const updateGarage = db.prepare(`
			UPDATE garages SET status = 'used' WHERE id = ?
		`);

		// Eksekusi
		insertRental.run(
			locals.user.id,
			garageObj.id,
			vehicleType,
			vehicleObj.licensePlate,
			vehicleObj.brandAndType,
			vehicleType === 'mobil_listrik' ? (vehicleObj as ElectricCar).batteryCapacityKwh : 0,
			rentalType,
			duration,
			breakdown.startDate,
			breakdown.endDate,
			breakdown.baseRentalCost,
			breakdown.electricityCost,
			breakdown.totalCost,
			paymentProofDataUrl,
			now
		);

		updateGarage.run(garageObj.id);

		throw redirect(303, '/penyewa/riwayat?success=1');
	}
};
