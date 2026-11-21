// src/lib/server/domain/domain.spec.ts
import { describe, it, expect } from 'vitest';
import { Bicycle, Motorcycle, GasolineCar, ElectricCar } from './Vehicle';
import { BicycleGarage, CarGarage, ElectricCarGarage } from './Garage';
import { RentalCalculator } from './RentalCalculator';
import { GarageCodeGenerator } from './GarageCodeGenerator';

describe('Unit Testing: Domain Logic & Business Rules', () => {
	describe('GarageCodeGenerator', () => {
		it('should generate code with correct prefix and 3-digit zero-padded number', () => {
			expect(GarageCodeGenerator.formatCode('sepeda', 1)).toBe('S001');
			expect(GarageCodeGenerator.formatCode('mobil', 10)).toBe('C010');
			expect(GarageCodeGenerator.formatCode('mobil_listrik', 99)).toBe('E099');
		});

		it('should generate batch codes accurately', () => {
			const codes = GarageCodeGenerator.generateBatchCodes('mobil_listrik', 1, 3);
			expect(codes).toEqual(['E001', 'E002', 'E003']);
		});

		it('should reject sequence numbers outside 1-999', () => {
			expect(() => GarageCodeGenerator.formatCode('sepeda', 0)).toThrow();
			expect(() => GarageCodeGenerator.formatCode('sepeda', 1000)).toThrow();
		});
	});

	describe('Vehicle and Garage Compatibility', () => {
		it('sepeda and motor can only park in sepeda garage', () => {
			expect(RentalCalculator.isCompatible('sepeda', 'sepeda')).toBe(true);
			expect(RentalCalculator.isCompatible('sepeda_motor', 'sepeda')).toBe(true);
			expect(RentalCalculator.isCompatible('sepeda', 'mobil')).toBe(false);
			expect(RentalCalculator.isCompatible('sepeda_motor', 'mobil_listrik')).toBe(false);
		});

		it('gasoline car can only park in mobil garage', () => {
			expect(RentalCalculator.isCompatible('mobil', 'mobil')).toBe(true);
			expect(RentalCalculator.isCompatible('mobil', 'sepeda')).toBe(false);
			expect(RentalCalculator.isCompatible('mobil', 'mobil_listrik')).toBe(false);
		});

		it('electric car can park in mobil or mobil_listrik garage', () => {
			expect(RentalCalculator.isCompatible('mobil_listrik', 'mobil')).toBe(true);
			expect(RentalCalculator.isCompatible('mobil_listrik', 'mobil_listrik')).toBe(true);
			expect(RentalCalculator.isCompatible('mobil_listrik', 'sepeda')).toBe(false);
		});
	});

	describe('Pricing and Rental Calculation', () => {
		const bicycleGarage = new BicycleGarage('S001', 10000); // 10rb/hari, 250rb/bulan
		const carGarage = new CarGarage('C001', 50000); // 50rb/hari, 1.25jt/bulan
		const evGarage = new ElectricCarGarage('E001', 75000, 2000); // 75rb/hari, 1.875jt/bln, 2000/kWh

		it('should calculate daily bicycle rental cost correctly', () => {
			const bike = new Bicycle('Polygon Cascade');
			const breakdown = RentalCalculator.calculateNewRentalCost(
				bike,
				bicycleGarage,
				'harian',
				5,
				'2026-11-21'
			);

			expect(breakdown.baseRentalCost).toBe(50000);
			expect(breakdown.electricityCost).toBe(0);
			expect(breakdown.totalCost).toBe(50000);
			expect(breakdown.endDate).toBe('2026-11-26');
		});

		it('should reject daily rental exceeding 30 days', () => {
			const bike = new Bicycle('Polygon Cascade');
			expect(() => {
				RentalCalculator.calculateNewRentalCost(
					bike,
					bicycleGarage,
					'harian',
					31,
					'2026-11-21'
				);
			}).toThrow('Jumlah hari untuk sewa harian harus antara 1 sampai 30 hari');
		});

		it('should calculate monthly rental as 25 x daily rate', () => {
			expect(carGarage.monthlyPrice).toBe(25 * 50000); // 1,250,000

			const car = new GasolineCar('Toyota Avanza', 'B 1234 CD');
			const breakdown = RentalCalculator.calculateNewRentalCost(
				car,
				carGarage,
				'bulanan',
				2,
				'2026-11-21'
			);

			expect(breakdown.baseRentalCost).toBe(2 * 1250000);
			expect(breakdown.totalCost).toBe(2500000);
		});

		it('should enforce full battery charge fee for electric car in electric garage', () => {
			const ev = new ElectricCar('Hyundai Ioniq 5', 'B 5678 EV', 60); // 60 kWh
			const breakdown = RentalCalculator.calculateNewRentalCost(
				ev,
				evGarage,
				'harian',
				3,
				'2026-11-21'
			);

			// Base cost: 3 * 75000 = 225000
			// Electricity: 60 * 2000 = 120000
			// Total: 345000
			expect(breakdown.baseRentalCost).toBe(225000);
			expect(breakdown.electricityCost).toBe(120000);
			expect(breakdown.totalCost).toBe(345000);
		});

		it('electric car in regular car garage does not charge electricity fee', () => {
			const ev = new ElectricCar('Wuling Air EV', 'L 9999 EV', 26);
			const breakdown = RentalCalculator.calculateNewRentalCost(
				ev,
				carGarage,
				'harian',
				2,
				'2026-11-21'
			);

			expect(breakdown.baseRentalCost).toBe(100000);
			expect(breakdown.electricityCost).toBe(0);
			expect(breakdown.totalCost).toBe(100000);
		});

		it('should calculate extension cost correctly for extra days', () => {
			const extension = RentalCalculator.calculateExtensionCost(
				'2026-11-25',
				'2026-11-30',
				50000
			);

			expect(extension.additionalDays).toBe(5);
			expect(extension.additionalCost).toBe(250000);
		});

		it('should throw error if extension date is not in the future', () => {
			expect(() => {
				RentalCalculator.calculateExtensionCost('2026-11-25', '2026-11-25', 50000);
			}).toThrow();
		});
	});
});
