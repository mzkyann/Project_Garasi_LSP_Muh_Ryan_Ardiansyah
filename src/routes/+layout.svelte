<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import './layout.css';
	import type { LayoutData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, children }: { data: LayoutData; children: any } = $props();
	let user = $derived(data.user);
</script>

<div class="min-h-screen flex flex-col bg-[#F8F5EC] text-[#383123] antialiased font-sans selection:bg-[#DFE5DC] selection:text-[#2E382A]">
	<!-- Navbar Header with Warm Olive / Earthy Dark Tone -->
	<header class="bg-[#383123] text-[#FAF8F4] border-b border-[#4F4532] sticky top-0 z-50 shadow-sm backdrop-blur-md bg-opacity-95">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<!-- Brand Logo & Context -->
				<div class="flex items-center gap-3">
					<a href="/" class="flex items-center gap-3 font-bold text-base tracking-tight hover:opacity-95 transition group">
						<div class="w-9 h-9 rounded-lg bg-[#71856A] text-[#FAF8F4] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
							<Icon name="building" size={20} />
						</div>
						<div class="leading-tight">
							<span class="font-extrabold tracking-tight text-white flex items-center gap-1.5">
								SIM-GARASI
								<span class="text-[10px] bg-[#877758] text-[#FAF8F4] px-1.5 py-0.2 rounded font-mono font-medium">v2.1</span>
							</span>
							<span class="block text-[11px] text-[#D8CEB9] font-normal tracking-wide">Sistem Persewaan Garasi & EV</span>
						</div>
					</a>
					<span class="hidden lg:inline-flex items-center gap-1 text-[11px] bg-[#4F4532] text-[#EAE3D4] px-2.5 py-1 rounded-md border border-[#6B5E45] ml-2 font-medium">
						<Icon name="shield" size={11} class="text-[#DAC99B]" />
						<span>Skema Pemrogram LSP</span>
					</span>
				</div>

				<!-- Nav Links -->
				<nav class="flex items-center gap-1.5 sm:gap-2 text-xs font-medium">
					<a
						href="/"
						class="px-3 py-1.5 rounded-md text-[#D8CEB9] hover:text-white hover:bg-[#4F4532] transition-colors"
					>
						Beranda
					</a>

					{#if user}
						{#if user.role === 'admin'}
							<a
								href="/admin/garasi"
								class="px-3 py-1.5 rounded-md text-[#D8CEB9] hover:text-white hover:bg-[#4F4532] transition-colors"
							>
								Kelola Garasi
							</a>
							<a
								href="/admin/verifikasi"
								class="px-3 py-1.5 rounded-md text-[#D8CEB9] hover:text-white hover:bg-[#4F4532] transition-colors"
							>
								Verifikasi Pendaftar
							</a>
							<a
								href="/admin/perpanjang"
								class="px-3 py-1.5 rounded-md text-[#D8CEB9] hover:text-white hover:bg-[#4F4532] transition-colors"
							>
								Perpanjang Sewa
							</a>
							<a
								href="/admin/laporan"
								class="px-3 py-1.5 rounded-md text-[#D8CEB9] hover:text-white hover:bg-[#4F4532] transition-colors"
							>
								Laporan
							</a>
						{:else}
							<a
								href="/penyewa/sewa-baru"
								class="px-3.5 py-1.5 rounded-md bg-[#71856A] hover:bg-[#596A53] text-white font-semibold transition-all shadow-xs flex items-center gap-1.5 btn-interactive"
							>
								<Icon name="plus" size={13} />
								<span>Sewa Garasi Baru</span>
							</a>
							<a
								href="/penyewa/riwayat"
								class="px-3 py-1.5 rounded-md text-[#D8CEB9] hover:text-white hover:bg-[#4F4532] transition-colors"
							>
								Riwayat Sewa
							</a>
						{/if}

						<!-- User Profile Info & Logout -->
						<div class="flex items-center gap-2.5 pl-3 ml-2 border-l border-[#4F4532]">
							<div class="hidden md:block text-right">
								<div class="text-xs font-semibold text-white leading-none">{user.name}</div>
								<div class="text-[10px] text-[#DAC99B] uppercase font-mono mt-0.5">
									{user.role} {#if user.status !== 'approved'}<span class="text-amber-300">({user.status})</span>{/if}
								</div>
							</div>
							<form action="/auth/logout" method="POST" class="inline">
								<button
									type="submit"
									class="text-xs bg-[#4F4532] hover:bg-rose-900/80 hover:text-white text-[#EAE3D4] px-2.5 py-1.5 rounded-md border border-[#6B5E45] transition flex items-center gap-1 btn-interactive"
									title="Keluar dari sistem"
								>
									<Icon name="logout" size={13} />
									<span class="hidden sm:inline">Keluar</span>
								</button>
							</form>
						</div>
					{:else}
						<a
							href="/auth/login"
							class="px-3 py-1.5 rounded-md text-[#D8CEB9] hover:text-white hover:bg-[#4F4532] transition-colors"
						>
							Masuk
						</a>
						<a
							href="/auth/register"
							class="px-3.5 py-1.5 rounded-md bg-[#71856A] hover:bg-[#596A53] text-white font-semibold transition-all shadow-xs btn-interactive"
						>
							Pendaftaran
						</a>
					{/if}
				</nav>
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
		{@render children()}
	</main>

	<!-- Professional Footer with Earthy Palette -->
	<footer class="bg-[#EFE8D6] border-t border-[#D8CEB9] mt-auto py-6 text-xs text-[#6B5E45]">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col md:flex-row items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<div class="w-7 h-7 rounded bg-[#71856A] text-white flex items-center justify-center font-bold text-xs">
						SG
					</div>
					<div>
						<p class="font-bold text-[#383123]">
							SIM-GARASI • Sistem Informasi Persewaan Garasi & Ekosistem EV
						</p>
						<p class="text-[11px] text-[#71856A] font-medium">
							Sesuai Standar Kompetensi Kerja Nasional Indonesia (SKKNI) LSP Pemrogram
						</p>
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-2 text-[11px]">
					<span class="bg-[#FAF8F4] px-2.5 py-1 rounded border border-[#D8CEB9] font-mono text-[#4F4532]">
						OOP TypeScript
					</span>
					<span class="bg-[#FAF8F4] px-2.5 py-1 rounded border border-[#D8CEB9] font-mono text-[#4F4532]">
						SQLite ACID
					</span>
					<span class="bg-[#FAF8F4] px-2.5 py-1 rounded border border-[#D8CEB9] font-mono text-[#4F4532]">
						Tailwind CSS
					</span>
					<span class="bg-[#FAF8F4] px-2.5 py-1 rounded border border-[#D8CEB9] font-mono text-[#4F4532]">
						SvelteKit 5
					</span>
				</div>
			</div>
		</div>
	</footer>
</div>
