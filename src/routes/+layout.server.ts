// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { db, syncGarageStatuses } from '#lib/server/db/index.js';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Sinkronkan status unit garasi dan masa sewa dengan kalender hari ini
	syncGarageStatuses();

	let pendingApprovals = 0;
	let pendingUsers = 0;

	if (locals.user && locals.user.role === 'admin') {
		const rPending = db.prepare("SELECT COUNT(*) as c FROM rentals WHERE status = 'pending'").get() as any;
		const ePending = db.prepare("SELECT COUNT(*) as c FROM rental_extensions WHERE status = 'pending'").get() as any;
		const uPending = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'penyewa' AND status = 'pending'").get() as any;
		pendingApprovals = (rPending?.c || 0) + (ePending?.c || 0);
		pendingUsers = uPending?.c || 0;
	}

	return {
		user: locals.user ?? null,
		pendingApprovals,
		pendingUsers
	};
};
