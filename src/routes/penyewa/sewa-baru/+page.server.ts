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
	type Garage
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
			garages: [],
			today: new Date().toISOString().split('T')[0]
		};
	}

	const today = new Date().toISOString().split('T')[0];

	// Ambil seluruh unit garasi/kendaraan beserta jadwal sewa aktifnya (tanggal mulai s/d tanggal selesai)
	const garages = db.prepare(`
		SELECT 
			g.*,
			(
				SELECT r.start_date FROM rentals r 
				WHERE r.garage_id = g.id AND r.status = 'active' AND r.end_date >= ?
				ORDER BY r.end_date DESC LIMIT 1
			) as active_start_date,
			(
				SELECT r.end_date FROM rentals r 
				WHERE r.garage_id = g.id AND r.status = 'active' AND r.end_date >= ?
				ORDER BY r.end_date DESC LIMIT 1
			) as active_end_date,
			(
				SELECT u.name FROM rentals r 
				JOIN users u ON r.user_id = u.id
				WHERE r.garage_id = g.id AND r.status = 'active' AND r.end_date >= ?
				ORDER BY r.end_date DESC LIMIT 1
			) as active_tenant_name
		FROM garages g
		ORDER BY g.type, g.code ASC
	`).all(today, today, today) as any[];

	// Ambil semua sewa aktif untuk kalender ketersediaan armada
	const allActiveRentals = db.prepare(`
		SELECT r.garage_id, r.start_date, r.end_date, u.name as tenant_name
		FROM rentals r
		JOIN users u ON r.user_id = u.id
		WHERE r.status = 'active' AND r.end_date >= ?
		ORDER BY r.start_date ASC
	`).all(today) as any[];

	// Hitung kapan masing-masing kendaraan ready kembali
	for (const g of garages) {
		g.active_rentals = allActiveRentals.filter((r) => r.garage_id === g.id);
		if (g.active_end_date && g.active_end_date >= today) {
			const endObj = new Date(g.active_end_date);
			endObj.setDate(endObj.getDate() + 1);
			g.next_available_date = endObj.toISOString().split('T')[0];
		} else {
			g.next_available_date = today;
		}
	}

	return {
		notApproved: false,
		userStatus: locals.user.status,
		garages,
		today
	};
};

export const actions: Actions = {
	submitRental: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'penyewa' || locals.user.status !== 'approved') {
			return fail(403, { error: 'Akses ditolak atau akun belum disetujui' });
		}

		const data = await request.formData();
		const rentalType = data.get('rentalType')?.toString() as 'harian' | 'bulanan';
		const duration = parseInt(data.get('duration')?.toString() || '1', 10);
		const garageId = parseInt(data.get('garageId')?.toString() || '0', 10);
		const proofFile = data.get('paymentProof') as File;
		const inputStartDate = data.get('startDate')?.toString()?.trim();

		const today = new Date().toISOString().split('T')[0];
		const startDate = inputStartDate && inputStartDate >= today ? inputStartDate : today;

		// Validasi dasar
		if (!rentalType || !garageId) {
			return fail(400, { error: 'Silakan pilih unit kendaraan dan tentukan durasi sewa' });
		}

		// Validasi Unit dari DB
		const rawGarage = db.prepare('SELECT * FROM garages WHERE id = ?').get(garageId) as any;
		if (!rawGarage) {
			return fail(404, { error: 'Unit kendaraan yang dipilih tidak ditemukan' });
		}

		// Hitung perkiraan tanggal selesai
		let expectedEndDate: string;
		try {
			expectedEndDate = RentalCalculator.calculateEndDate(startDate, rentalType, duration);
		} catch (err: any) {
			return fail(400, { error: err.message });
		}

		// Validasi overlap jadwal sewa aktif: Apakah ada sewa aktif yang bertabrakan dengan rentang [startDate, expectedEndDate]?
		const overlappingRental = db.prepare(`
			SELECT id, start_date, end_date FROM rentals 
			WHERE garage_id = ? AND status = 'active'
			  AND NOT (end_date < ? OR start_date > ?)
			ORDER BY end_date DESC
			LIMIT 1
		`).get(garageId, startDate, expectedEndDate) as any;

		if (overlappingRental) {
			const endObj = new Date(overlappingRental.end_date);
			endObj.setDate(endObj.getDate() + 1);
			const readyDate = endObj.toISOString().split('T')[0];

			return fail(400, {
				error: `Unit ${rawGarage.code} (${rawGarage.vehicle_name}) sedang dirental pada periode tersebut (${overlappingRental.start_date} s/d ${overlappingRental.end_date}). Unit ini siap disewa kembali mulai tanggal ${readyDate}.`
			});
		}

		const vehicleBrandModel = rawGarage.vehicle_name || `${rawGarage.car_type || 'Kendaraan'} ${rawGarage.code}`;
		const licensePlate = rawGarage.license_plate || null;
		const vehicleType = rawGarage.type === 'sepeda' && licensePlate ? 'sepeda_motor' : rawGarage.type;
		const batteryCapacity = rawGarage.battery_capacity_kwh || 0;

		// Bentuk objek Domain OOP Vehicle
		let vehicleObj: Vehicle;
		try {
			if (vehicleType === 'sepeda') {
				vehicleObj = new Bicycle(vehicleBrandModel);
			} else if (vehicleType === 'sepeda_motor') {
				vehicleObj = new Motorcycle(vehicleBrandModel, licensePlate || 'B 0000 XX');
			} else if (vehicleType === 'mobil') {
				vehicleObj = new GasolineCar(vehicleBrandModel, licensePlate || 'B 0000 XX');
			} else if (vehicleType === 'mobil_listrik') {
				const cap = batteryCapacity > 0 ? batteryCapacity : 58;
				vehicleObj = new ElectricCar(vehicleBrandModel, licensePlate || 'B 0000 EV', cap);
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
				startDate
			);
		} catch (err: any) {
			return fail(400, { error: err.message });
		}

		// Proses bukti pembayaran
		let paymentProofDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="%2371856A"/><text x="10" y="55" fill="white" font-weight="bold">BUKTI BAYAR LUNAS</text></svg>';

		if (proofFile && proofFile.size > 0) {
			const buffer = await proofFile.arrayBuffer();
			const base64 = Buffer.from(buffer).toString('base64');
			paymentProofDataUrl = `data:${proofFile.type};base64,${base64}`;
		}

		const now = new Date().toISOString();

		// Simpan sewa ke database dan ubah status garasi menjadi 'used' (tersewa)
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

		// Eksekusi insert sewa dan update status garasi menjadi 'used'
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

		if (startDate === today) {
			updateGarage.run(garageObj.id);
		}

		throw redirect(303, '/penyewa/riwayat?success=1');
	}
};
