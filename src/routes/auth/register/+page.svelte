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
	<div class="bg-white rounded-xl shadow-xs border border-[#DFD5C2] overflow-hidden card-hover">
		<div class="p-6 border-b border-[#F4EFE7] bg-[#FAF8F4]">
			<div class="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#71856A] uppercase tracking-wider mb-1">
				<Icon name="shield" size={13} />
				<span>Standar Sertifikasi KTP 16 Digit</span>
			</div>
			<h2 class="text-base font-extrabold text-[#383123]">Formulir Pendaftaran Penyewa Baru</h2>
			<p class="text-xs text-[#6B5E45] mt-1 leading-relaxed">
				Lengkapi data identitas resmi sesuai KTP Anda. Akun akan melalui proses verifikasi oleh tim administrator.
			</p>
		</div>

		{#if form?.success}
			<div class="p-8 text-center space-y-4">
				<div class="w-14 h-14 bg-[#EFF3ED] text-[#71856A] rounded-full flex items-center justify-center mx-auto border border-[#DFE5DC]">
					<Icon name="check" size={26} />
				</div>
				<h3 class="text-base font-extrabold text-[#383123]">Pendaftaran Berhasil Dikirim</h3>
				<p class="text-xs text-[#6B5E45] max-w-sm mx-auto leading-relaxed">
					{form.message}
				</p>
				<div class="pt-2">
					<a
						href="/auth/login"
						class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg text-xs transition-all shadow-xs btn-interactive"
					>
						<span>Menuju Halaman Masuk</span>
						<Icon name="chevron-right" size={13} />
					</a>
				</div>
			</div>
		{:else}
			<form method="POST" action="?/register" class="p-6 space-y-4">
				{#if form?.error}
					<div class="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2">
						<Icon name="alert" size={15} class="text-rose-600 shrink-0" />
						<span>{form.error}</span>
					</div>
				{/if}

				<div>
					<label for="nik" class="block text-xs font-bold text-[#4F4532] mb-1">
						Nomor Induk Kependudukan (NIK / KTP) <span class="text-rose-600">*</span>
					</label>
					<input
						type="text"
						id="nik"
						name="nik"
						maxlength="16"
						required
						placeholder="357801xxxxxxxxxx (Tepat 16 digit angka)"
						value={form?.values?.nik ?? ''}
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-medium"
					/>
					<p class="text-[11px] text-[#A08F6E] mt-1">Sistem memvalidasi panjang tepat 16 digit angka sesuai KTP resmi</p>
				</div>

				<div>
					<label for="name" class="block text-xs font-bold text-[#4F4532] mb-1">
						Nama Lengkap <span class="text-rose-600">*</span>
					</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						placeholder="Nama lengkap sesuai identitas KTP"
						value={form?.values?.name ?? ''}
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
					/>
				</div>

				<div>
					<label for="phone" class="block text-xs font-bold text-[#4F4532] mb-1">
						Nomor Telepon / WhatsApp <span class="text-rose-600">*</span>
					</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						required
						placeholder="Contoh: 08123456789"
						value={form?.values?.phone ?? ''}
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-medium"
					/>
				</div>

				<div>
					<label for="email" class="block text-xs font-bold text-[#4F4532] mb-1">
						Alamat Email (Username Akun) <span class="text-rose-600">*</span>
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						placeholder="nama@email.com"
						value={form?.values?.email ?? ''}
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
					/>
				</div>

				<div>
					<label for="password" class="block text-xs font-bold text-[#4F4532] mb-1">
						Kata Sandi <span class="text-rose-600">*</span>
					</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						placeholder="Minimal 6 karakter"
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
					/>
				</div>

				<div class="pt-3">
					<button
						type="submit"
						class="w-full py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg text-xs transition-all shadow-xs btn-interactive"
					>
						Kirimkan Permohonan Pendaftaran
					</button>
				</div>

				<div class="text-center pt-3 border-t border-[#F4EFE7]">
					<p class="text-xs text-[#6B5E45]">
						Sudah memiliki akun terdaftar?
						<a href="/auth/login" class="font-bold text-[#71856A] hover:underline ml-1">
							Masuk di sini
						</a>
					</p>
				</div>
			</form>
		{/if}
	</div>
</div>