<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
	import type { ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Masuk - GARTA (Garasi Takalar)</title>
</svelte:head>

<div class="max-w-md mx-auto my-8 space-y-5">
	<!-- Main Login Card -->
	<div class="bg-white rounded-2xl shadow-sm border border-[#DFD5C2] overflow-hidden card-hover">
		<div class="p-6 border-b border-[#F4EFE7] bg-[#FAF8F4]">
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider font-mono mb-1">
				<Icon name="shield" size={13} />
				<span>GARTA TAKALAR AUTH</span>
			</div>
			<h2 class="text-lg font-extrabold text-[#383123]">Masuk ke Portal GARTA</h2>
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