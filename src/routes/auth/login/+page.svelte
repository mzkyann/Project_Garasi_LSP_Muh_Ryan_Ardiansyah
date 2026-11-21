<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
	import type { ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Masuk Sistem - SIM-GARASI</title>
</svelte:head>

<div class="max-w-md mx-auto my-6 space-y-5">
	<!-- Demo Testing Card for LSP Assessor -->
	<div class="bg-white border border-[#DFD5C2] rounded-xl p-5 shadow-xs card-hover">
		<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] mb-1">
			<Icon name="shield" size={15} />
			<span>Akses Cepat Pengujian Asesor / Reviewer</span>
		</div>
		<p class="text-[11px] text-[#6B5E45] mb-3 leading-relaxed">
			Klik salah satu akun di bawah untuk masuk otomatis tanpa mengisi kredensial manual:
		</p>
		<div class="grid grid-cols-2 gap-2.5">
			<form method="POST" action="?/quickLogin">
				<input type="hidden" name="targetRole" value="admin" />
				<button
					type="submit"
					class="w-full py-2 px-3 bg-[#383123] hover:bg-[#252016] text-[#FAF8F4] rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 btn-interactive"
				>
					<Icon name="user" size={13} class="text-[#DAC99B]" />
					<span>Admin (Citra)</span>
				</button>
			</form>
			<form method="POST" action="?/quickLogin">
				<input type="hidden" name="targetRole" value="penyewa" />
				<button
					type="submit"
					class="w-full py-2 px-3 bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] border border-[#C2CCBC] rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 btn-interactive"
				>
					<Icon name="user" size={13} class="text-[#71856A]" />
					<span>Penyewa (Budi)</span>
				</button>
			</form>
		</div>
	</div>

	<!-- Main Login Card -->
	<div class="bg-white rounded-xl shadow-xs border border-[#DFD5C2] overflow-hidden card-hover">
		<div class="p-6 border-b border-[#F4EFE7] bg-[#FAF8F4]">
			<h2 class="text-base font-extrabold text-[#383123]">Masuk ke Portal SIM-GARASI</h2>
			<p class="text-xs text-[#6B5E45] mt-1">Masukkan alamat email terdaftar dan kata sandi Anda</p>
		</div>

		<form method="POST" action="?/login" class="p-6 space-y-4">
			{#if form?.error}
				<div class="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2">
					<Icon name="alert" size={15} class="text-rose-600 shrink-0" />
					<span>{form.error}</span>
				</div>
			{/if}

			<div>
				<label for="email" class="block text-xs font-bold text-[#4F4532] mb-1.5">
					Alamat Email (Username)
				</label>
				<input
					type="email"
					id="email"
					name="email"
					value={form?.email ?? ''}
					required
					placeholder="nama@email.com"
					class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
				/>
			</div>

			<div>
				<label for="password" class="block text-xs font-bold text-[#4F4532] mb-1.5">
					Kata Sandi
				</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					placeholder="••••••••"
					class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
				/>
			</div>

			<button
				type="submit"
				class="w-full py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg text-xs transition-all shadow-xs btn-interactive mt-2"
			>
				Masuk ke Akun
			</button>

			<div class="text-center pt-3 border-t border-[#F4EFE7]">
				<p class="text-xs text-[#6B5E45]">
					Belum terdaftar sebagai penyewa?
					<a href="/auth/register" class="font-bold text-[#71856A] hover:underline ml-1">
						Pendaftaran Penyewa Baru
					</a>
				</p>
			</div>
		</form>
	</div>
</div>