// src/hooks.server.ts
import { db } from '#lib/server/db/index.js';

export async function handle({ event, resolve }: any) {
	const sessionUserId = event.cookies.get('session_user_id');

	if (sessionUserId) {
		const user = db
			.prepare('SELECT id, nik, name, phone, email, role, status FROM users WHERE id = ?')
			.get(parseInt(sessionUserId, 10)) as App.Locals['user'] | undefined;

		if (user) {
			event.locals.user = user;
		} else {
			event.cookies.delete('session_user_id', { path: '/' });
		}
	}

	return resolve(event);
}
