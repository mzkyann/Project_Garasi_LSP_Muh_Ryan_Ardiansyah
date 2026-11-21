<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Daftar Akun Penyewa - GARASI.ID</title>
</svelte:head>

<div class="max-w-lg mx-auto my-6">
	<div class="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
		<div class="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6">
			<h2 class="text-xl font-bold">Pendaftaran Penyewa Baru</h2>
			<p class="text-xs text-indigo-200 mt-1">
				Lengkapi data diri Anda sesuai KTP untuk mulai menyewa garasi
			</p>
		</div>

		{#if form?.success}
			<div class="p-8 text-center space-y-4">
				<div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
					✓
				</div>
				<h3 class="text-lg font-bold text-slate-800">Pendaftaran Berhasil!</h3>
				<p class="text-sm text-slate-600">
					{form.message}
				</p>
				<div class="pt-4">
					<a
						href="/auth/login"
						class="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
					>
						Kembali ke Halaman Masuk
					</a>
				</div>
			</div>
		{:else}
			<form method="POST" action="?/register" class="p-6 space-y-4">
				{#if form?.error}
					<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
						⚠️ {form.error}
					</div>
				{/if}

				<div>
					<label for="nik" class="block text-xs font-semibold text-slate-700 mb-1">
						NIK (Nomor KTP) <span class="text-rose-500">*16 digit</span>
					</label>
					<input
						type="text"
						id="nik"
						name="nik"
						maxlength="16"
						required
						placeholder="Contoh: 3578012345670001"
						value={form?.values?.nik ?? ''}
						class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
					/>
				</div>

				<div>
					<label for="name" class="block text-xs font-semibold text-slate-700 mb-1">
						Nama Lengkap <span class="text-rose-500">*sesuai KTP</span>
					</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						placeholder="Contoh: Budi Santoso"
						value={form?.values?.name ?? ''}
						class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>

				<div>
					<label for="phone" class="block text-xs font-semibold text-slate-700 mb-1">
						Nomor Telepon / WhatsApp <span class="text-rose-500">*</span>
					</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						required
						placeholder="Contoh: 08123456789"
						value={form?.values?.phone ?? ''}
						class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>

				<div>
					<label for="email" class="block text-xs font-semibold text-slate-700 mb-1">
						Email (digunakan sebagai Username) <span class="text-rose-500">*</span>
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						placeholder="nama@email.com"
						value={form?.values?.email ?? ''}
						class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>

				<div>
					<label for="password" class="block text-xs font-semibold text-slate-700 mb-1">
						Password <span class="text-rose-500">*</span>
					</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						placeholder="Minimal 6 karakter"
						class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>

				<div class="pt-2">
					<button
						type="submit"
						class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition shadow"
					>
						Daftar Sekarang
					</button>
				</div>

				<div class="text-center pt-2">
					<p class="text-xs text-slate-500">
						Sudah memiliki akun terverifikasi?
						<a href="/auth/login" class="font-bold text-indigo-600 hover:underline">
							Masuk di sini
						</a>
					</p>
				</div>
			</form>
		{/if}
	</div>
</div>
