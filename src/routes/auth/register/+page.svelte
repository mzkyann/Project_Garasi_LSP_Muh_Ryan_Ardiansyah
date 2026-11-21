<!-- src/routes/auth/register/+page.svelte -->
<script lang="ts">
	import type { ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Pendaftaran Penyewa - SIM-GARASI</title>
</svelte:head>

<div class="max-w-lg mx-auto my-6">
	<div class="bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
		<div class="p-5 border-b border-slate-100 bg-slate-50/50">
			<h2 class="text-base font-bold text-slate-900">Formulir Pendaftaran Penyewa Baru</h2>
			<p class="text-xs text-slate-500 mt-0.5">
				Isi data identitas diri sesuai Kartu Tanda Penduduk (KTP) untuk verifikasi akun
			</p>
		</div>

		{#if form?.success}
			<div class="p-8 text-center space-y-4">
				<div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
					<Icon name="check" size={24} />
				</div>
				<h3 class="text-base font-bold text-slate-800">Pendaftaran Berhasil Dikirim</h3>
				<p class="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
					{form.message}
				</p>
				<div class="pt-2">
					<a
						href="/auth/login"
						class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs transition"
					>
						<span>Halaman Masuk</span>
						<Icon name="chevron-right" size={12} />
					</a>
				</div>
			</div>
		{:else}
			<form method="POST" action="?/register" class="p-5 space-y-4">
				{#if form?.error}
					<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-medium flex items-center gap-2">
						<Icon name="alert" size={14} class="text-rose-600 shrink-0" />
						<span>{form.error}</span>
					</div>
				{/if}

				<div>
					<label for="nik" class="block text-xs font-semibold text-slate-700 mb-1">
						Nomor Induk Kependudukan (NIK / KTP) <span class="text-rose-600">*</span>
					</label>
					<input
						type="text"
						id="nik"
						name="nik"
						maxlength="16"
						required
						placeholder="357801xxxxxxxxxx (16 digit angka)"
						value={form?.values?.nik ?? ''}
						class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
					/>
					<p class="text-[11px] text-slate-400 mt-1">Harus tepat 16 digit angka sesuai identitas KTP resmi</p>
				</div>

				<div>
					<label for="name" class="block text-xs font-semibold text-slate-700 mb-1">
						Nama Lengkap <span class="text-rose-600">*</span>
					</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						placeholder="Nama lengkap sesuai KTP"
						value={form?.values?.name ?? ''}
						class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
					/>
				</div>

				<div>
					<label for="phone" class="block text-xs font-semibold text-slate-700 mb-1">
						Nomor Telepon / Handphone <span class="text-rose-600">*</span>
					</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						required
						placeholder="Contoh: 08123456789"
						value={form?.values?.phone ?? ''}
						class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
					/>
				</div>

				<div>
					<label for="email" class="block text-xs font-semibold text-slate-700 mb-1">
						Alamat Email (Digunakan Sebagai Username) <span class="text-rose-600">*</span>
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						placeholder="nama@email.com"
						value={form?.values?.email ?? ''}
						class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
					/>
				</div>

				<div>
					<label for="password" class="block text-xs font-semibold text-slate-700 mb-1">
						Kata Sandi <span class="text-rose-600">*</span>
					</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						placeholder="Minimal 6 karakter"
						class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
					/>
				</div>

				<div class="pt-2">
					<button
						type="submit"
						class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs transition shadow-xs"
					>
						Kirim Pendaftaran Akun
					</button>
				</div>

				<div class="text-center pt-2 border-t border-slate-100">
					<p class="text-xs text-slate-500">
						Sudah memiliki akun terverifikasi?
						<a href="/auth/login" class="font-semibold text-blue-600 hover:underline">
							Masuk di sini
						</a>
					</p>
				</div>
			</form>
		{/if}
	</div>
</div>
