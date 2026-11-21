// src/routes/auth/logout/+server.ts
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('session_user_id', { path: '/' });
	throw redirect(303, '/auth/login');
};
