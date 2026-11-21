<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
	import type { ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Masuk Sistem - SIM-GARASI</title>
</svelte:head>

<div class="max-w-md mx-auto my-6 space-y-4">
	<!-- Demo Testing Section -->
	<div class="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
		<div class="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
			<Icon name="shield" size={14} class="text-blue-600" />
			<span>Autentikasi Cepat Sesi Pengujian Asesor</span>
		</div>
		<p class="text-[11px] text-slate-500 mb-3">
			Gunakan tombol di bawah untuk masuk langsung tanpa memasukkan kredensial manual:
		</p>
		<div class="grid grid-cols-2 gap-2">
			<form method="POST" action="?/quickLogin">
				<input type="hidden" name="targetRole" value="admin" />
				<button
					type="submit"
					class="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium transition flex items-center justify-center gap-1.5"
				>
					<Icon name="user" size={13} />
					<span>Admin (Citra)</span>
				</button>
			</form>
			<form method="POST" action="?/quickLogin">
				<input type="hidden" name="targetRole" value="penyewa" />
				<button
					type="submit"
					class="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-medium transition flex items-center justify-center gap-1.5"
				>
					<Icon name="user" size={13} />
					<span>Penyewa (Budi)</span>
				</button>
			</form>
		</div>
	</div>

	<!-- Main Login Card -->
	<div class="bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
		<div class="p-5 border-b border-slate-100 bg-slate-50/50">
			<h2 class="text-base font-bold text-slate-900">Masuk ke Sistem</h2>
			<p class="text-xs text-slate-500 mt-0.5">Masukkan email dan kata sandi yang terdaftar</p>
		</div>

		<form method="POST" action="?/login" class="p-5 space-y-4">
			{#if form?.error}
				<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-medium flex items-center gap-2">
					<Icon name="alert" size={14} class="text-rose-600 shrink-0" />
					<span>{form.error}</span>
				</div>
			{/if}

			<div>
				<label for="email" class="block text-xs font-semibold text-slate-700 mb-1">
					Alamat Email (Username)
				</label>
				<input
					type="email"
					id="email"
					name="email"
					value={form?.email ?? ''}
					required
					placeholder="nama@email.com"
					class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
				/>
			</div>

			<div>
				<label for="password" class="block text-xs font-semibold text-slate-700 mb-1">
					Kata Sandi
				</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					placeholder="••••••••"
					class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
				/>
			</div>

			<button
				type="submit"
				class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs transition shadow-xs"
			>
				Masuk
			</button>

			<div class="text-center pt-2 border-t border-slate-100">
				<p class="text-xs text-slate-500">
					Belum memiliki akun?
					<a href="/auth/register" class="font-semibold text-blue-600 hover:underline">
						Pendaftaran Penyewa Baru
					</a>
				</p>
			</div>
		</form>
	</div>
</div>
