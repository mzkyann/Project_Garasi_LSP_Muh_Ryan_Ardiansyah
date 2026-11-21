<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Masuk - GARASI.ID</title>
</svelte:head>

<div class="max-w-md mx-auto my-8">
	<!-- Demo Quick Login Card -->
	<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm">
		<h3 class="text-sm font-bold text-amber-900 mb-2 flex items-center gap-1.5">
			<span>⚡</span> Akses Cepat Demo (Untuk Pengujian & Asesor)
		</h3>
		<p class="text-xs text-amber-800 mb-3">
			Klik salah satu tombol di bawah untuk masuk langsung tanpa mengetik password:
		</p>
		<div class="grid grid-cols-2 gap-2">
			<form method="POST" action="?/quickLogin">
				<input type="hidden" name="targetRole" value="admin" />
				<button
					type="submit"
					class="w-full py-2 px-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow transition"
				>
					👨‍💼 Masuk sbg Admin
				</button>
			</form>
			<form method="POST" action="?/quickLogin">
				<input type="hidden" name="targetRole" value="penyewa" />
				<button
					type="submit"
					class="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow transition"
				>
					🚗 Masuk sbg Penyewa
				</button>
			</form>
		</div>
	</div>

	<!-- Main Login Card -->
	<div class="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
		<div class="bg-slate-900 text-white p-6">
			<h2 class="text-xl font-bold">Masuk ke Akun</h2>
			<p class="text-xs text-slate-300 mt-1">Masukkan email dan password untuk melanjutkan</p>
		</div>

		<form method="POST" action="?/login" class="p-6 space-y-4">
			{#if form?.error}
				<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
					⚠️ {form.error}
				</div>
			{/if}

			<div>
				<label for="email" class="block text-xs font-semibold text-slate-700 mb-1">
					Email (Username)
				</label>
				<input
					type="email"
					id="email"
					name="email"
					value={form?.email ?? ''}
					required
					placeholder="nama@email.com"
					class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>

			<div>
				<label for="password" class="block text-xs font-semibold text-slate-700 mb-1">
					Password
				</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					placeholder="••••••••"
					class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>

			<button
				type="submit"
				class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition shadow"
			>
				Masuk
			</button>

			<div class="text-center pt-2">
				<p class="text-xs text-slate-500">
					Belum punya akun?
					<a href="/auth/register" class="font-bold text-indigo-600 hover:underline">
						Daftar sebagai Penyewa
					</a>
				</p>
			</div>
		</form>
	</div>
</div>
