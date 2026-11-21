// src/app.d.ts
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: number;
				nik: string;
				name: string;
				phone: string;
				email: string;
				role: 'admin' | 'penyewa';
				status: 'pending' | 'approved' | 'rejected';
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
