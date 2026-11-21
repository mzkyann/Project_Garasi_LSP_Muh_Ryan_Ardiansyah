<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import './layout.css';
	import type { LayoutData } from './$types';
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';

	let { data, children }: { data: LayoutData; children: any } = $props();
	let user = $derived(data.user);

	function isActive(path: string): boolean {
		if (path === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(path);
	}
</script>

<svelte:head>
	<title>GARTA - Garasi Takalar | Smart Safe Garage & EV Hub</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-[#F8F6F0] text-[#2C2518] antialiased selection:bg-[#DCCFA6] selection:text-[#2C2518]">
	<!-- Ambient Warm Glow Beam -->
	<div class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-24 bg-gradient-to-r from-[#DCCFA6]/30 via-[#8F987E]/20 to-[#8B774F]/20 blur-3xl pointer-events-none -z-10"></div>

	<!-- Modern Luxury Header with Deep Bronze Aesthetic (#2C2518) -->
	<header class="sticky top-0 z-50 backdrop-blur-2xl bg-[#2C2518]/95 text-[#EDE8D2] border-b border-[#423825] shadow-[0_4px_25px_rgba(44,37,24,0.3)] transition-all">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16 sm:h-20">
				
				<!-- Brand Identity: GARTA Takalar -->
				<div class="flex items-center gap-3.5">
					<a href="/" class="flex items-center gap-3.5 group" title="Kembali ke Beranda GARTA Takalar">
						<!-- 3D Geometric Garage & EV Lightning Icon in Palette Colors -->
						<div class="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8B774F] via-[#5C4F35] to-[#2C2518] p-2 flex items-center justify-center shadow-md border border-[#DCCFA6]/40 group-hover:border-[#DCCFA6] group-hover:scale-105 transition-all duration-300">
							<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full relative z-10">
								<!-- Atap Garasi -->
								<path d="M4 15 L18 5 L32 15 L30 31 C30 31.6 29.4 32 28.5 32 L7.5 32 C6.6 32 6 31.6 6 31 Z" fill="#2C2518" stroke="#DCCFA6" stroke-width="1.3" stroke-linejoin="round"/>
								<!-- Pintu Garasi -->
								<path d="M11 29 V18 C11 16.9 11.9 16 13 16 H23 C24.1 16 25 16.9 25 18 V29" fill="#3D3524" stroke="#EDE8D2" stroke-width="1.2"/>
								<line x1="12" y1="19.5" x2="24" y2="19.5" stroke="#8F987E" stroke-width="0.9"/>
								<line x1="12" y1="22.5" x2="24" y2="22.5" stroke="#8F987E" stroke-width="0.9"/>
								<line x1="12" y1="25.5" x2="24" y2="25.5" stroke="#8F987E" stroke-width="0.9"/>
								<!-- EV Lightning Bolt (Gold Sand #DCCFA6) -->
								<path d="M20 7 L14 17 H21 L16 26" stroke="#EDE8D2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse"/>
							</svg>
						</div>

						<div class="leading-tight">
							<div class="flex items-center gap-2">
								<span class="font-extrabold tracking-tight text-white text-xl sm:text-2xl font-mono">
									GARTA
								</span>
								<span class="text-[10px] font-mono font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-md bg-[#DCCFA6] text-[#2C2518] shadow-xs">
									TAKALAR
								</span>
							</div>
							<span class="block text-[11px] text-[#C3C9B8] font-medium tracking-wide">
								Garasi Takalar & EV Hub
							</span>
						</div>
					</a>

					<!-- Live Status Indicator Pill (Hidden on mobile) -->
					<div class="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#353F32]/90 border border-[#8F987E]/40 text-[11px] font-mono text-[#EDE8D2] ml-3">
						<span class="relative flex h-2 w-2">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8F987E] opacity-75"></span>
							<span class="relative inline-flex rounded-full h-2 w-2 bg-[#8F987E]"></span>
						</span>
						<span>Takalar Live 24/7 • Skema LSP</span>
					</div>
				</div>

				<!-- Navigation Pill Tabs -->
				<nav class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
					<a
						href="/"
						class="px-3.5 py-2 rounded-xl transition-all duration-200 {isActive('/') ? 'text-[#2C2518] bg-[#DCCFA6] font-bold shadow-xs' : 'text-[#DFE3D9] hover:text-white hover:bg-[#3D3524]'}"
					>
						Beranda
					</a>

					{#if user}
						{#if user.role === 'admin'}
							<a
								href="/admin/garasi"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 {isActive('/admin/garasi') ? 'text-[#2C2518] bg-[#DCCFA6] font-bold shadow-xs' : 'text-[#DFE3D9] hover:text-white hover:bg-[#3D3524]'}"
							>
								Kelola Garasi
							</a>

							<a
								href="/admin/persetujuan"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 relative flex items-center gap-2 {isActive('/admin/persetujuan') ? 'text-[#2C2518] bg-[#DCCFA6] font-bold shadow-xs' : 'text-[#DFE3D9] hover:text-white hover:bg-[#3D3524]'}"
							>
								<span>Persetujuan Sewa</span>
								{#if data.pendingApprovals > 0}
									<span class="px-1.5 py-0.5 bg-[#8B774F] text-white text-[10px] font-mono font-extrabold rounded-full animate-bounce shadow-xs">
										{data.pendingApprovals}
									</span>
								{/if}
							</a>

							<a
								href="/admin/perpanjang"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 {isActive('/admin/perpanjang') ? 'text-[#2C2518] bg-[#DCCFA6] font-bold shadow-xs' : 'text-[#DFE3D9] hover:text-white hover:bg-[#3D3524]'}"
							>
								Perpanjang Sewa
							</a>

							<a
								href="/admin/verifikasi"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 relative flex items-center gap-2 {isActive('/admin/verifikasi') ? 'text-[#2C2518] bg-[#DCCFA6] font-bold shadow-xs' : 'text-[#DFE3D9] hover:text-white hover:bg-[#3D3524]'}"
							>
								<span>Verifikasi KTP</span>
								{#if data.pendingUsers > 0}
									<span class="px-1.5 py-0.5 bg-[#8F987E] text-white text-[10px] font-mono font-extrabold rounded-full">
										{data.pendingUsers}
									</span>
								{/if}
							</a>

							<a
								href="/admin/laporan"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 {isActive('/admin/laporan') ? 'text-[#2C2518] bg-[#DCCFA6] font-bold shadow-xs' : 'text-[#DFE3D9] hover:text-white hover:bg-[#3D3524]'}"
							>
								Laporan
							</a>
						{:else}
							<!-- Penyewa Nav Links -->
							<a
								href="/penyewa/sewa-baru"
								class="px-4 py-2 rounded-xl bg-[#8F987E] hover:bg-[#778267] text-white font-semibold transition-all shadow-sm flex items-center gap-2 btn-interactive"
							>
								<Icon name="plus" size={15} />
								<span>Sewa Garasi Baru</span>
							</a>

							<a
								href="/penyewa/riwayat"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 {isActive('/penyewa/riwayat') ? 'text-[#2C2518] bg-[#DCCFA6] font-bold shadow-xs' : 'text-[#DFE3D9] hover:text-white hover:bg-[#3D3524]'}"
							>
								Riwayat Sewa
							</a>
						{/if}

						<!-- User Profile Capsule Pill -->
						<div class="flex items-center pl-2 sm:pl-4 ml-1 sm:ml-2 border-l border-[#423825]">
							<a
								href="/profile"
								class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#353F32] hover:bg-[#424F3F] border border-[#8F987E]/50 transition-all shadow-sm group btn-interactive"
								title="Buka Pengaturan Akun & Profil"
							>
								<!-- Avatar with Palette Tone -->
								<div class="relative w-7 h-7 rounded-lg bg-[#8B774F] text-white flex items-center justify-center font-bold text-xs font-mono shadow-inner group-hover:scale-105 transition-transform">
									{user.name.charAt(0).toUpperCase()}
									<span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#8F987E] border border-[#2C2518]"></span>
								</div>

								<div class="text-left hidden md:block">
									<div class="text-xs font-semibold text-[#EDE8D2] group-hover:text-white transition-colors leading-none">
										{user.name.split(' ')[0]}
									</div>
									<div class="text-[9px] text-[#DCCFA6] uppercase font-mono mt-1 font-bold tracking-wider">
										{user.role}
									</div>
								</div>

								<Icon name="chevron-right" size={12} class="text-[#8F987E] group-hover:text-[#EDE8D2] group-hover:translate-x-0.5 transition-all hidden sm:block" />
							</a>
						</div>
					{:else}
						<!-- Guest Mode Links -->
						<a
							href="/auth/login"
							class="px-4 py-2 rounded-xl text-[#EDE8D2] hover:text-white hover:bg-[#3D3524] transition-all"
						>
							Masuk
						</a>
						<a
							href="/auth/register"
							class="px-4 py-2 rounded-xl bg-[#8F987E] hover:bg-[#778267] text-white font-semibold transition-all shadow-sm btn-interactive"
						>
							Daftar Akun
						</a>
					{/if}
				</nav>
			</div>
		</div>
	</header>

	<!-- Main Content Area with Clean Warm Linen Background -->
	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
		{@render children()}
	</main>

	<!-- High-Tech Modern Footer with Palette Colors -->
	<footer class="bg-[#EDE8D2] border-t border-[#DCCFA6] mt-auto py-10 text-xs text-[#5C4F35]">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col md:flex-row items-center justify-between gap-6">
				<!-- Brand Info -->
				<div class="flex items-center gap-4">
					<div class="w-10 h-10 rounded-2xl bg-[#2C2518] p-2 flex items-center justify-center border border-[#8B774F] shadow-sm">
						<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
							<path d="M4 15 L18 5 L32 15 L30 31 C30 31.6 29.4 32 28.5 32 L7.5 32 C6.6 32 6 31.6 6 31 Z" fill="#2C2518" stroke="#DCCFA6" stroke-width="1.3"/>
							<path d="M11 29 V18 C11 16.9 11.9 16 13 16 H23 C24.1 16 25 16.9 25 18 V29" fill="#3D3524" stroke="#EDE8D2" stroke-width="1.2"/>
							<path d="M20 7 L14 17 H21 L16 26" stroke="#DCCFA6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<div>
						<p class="font-extrabold text-sm text-[#2C2518] font-mono flex items-center gap-2">
							GARTA TAKALAR
							<span class="text-[10px] text-[#2C2518] font-sans font-semibold border border-[#8F987E] px-2 py-0.5 rounded-full bg-[#DCCFA6]/60">
								Smart EV Charging & Garage
							</span>
						</p>
						<p class="text-[11px] text-[#756442] mt-0.5">
							Sistem Sewa Garasi Digital Terintegrasi Kabupaten Takalar, Sulawesi Selatan.
						</p>
					</div>
				</div>

				<!-- Accreditations & Trust Chips -->
				<div class="flex flex-wrap items-center gap-2 text-[11px]">
					<span class="bg-[#F8F6F0] px-3 py-1.5 rounded-xl border border-[#DCCFA6] font-mono text-[#423825] flex items-center gap-1.5">
						<span class="w-1.5 h-1.5 rounded-full bg-[#8F987E]"></span>
						Pattallassang, Takalar
					</span>
					<span class="bg-[#F8F6F0] px-3 py-1.5 rounded-xl border border-[#DCCFA6] font-mono text-[#423825] flex items-center gap-1.5">
						<span class="w-1.5 h-1.5 rounded-full bg-[#8B774F]"></span>
						CCTV 24 Jam Live
					</span>
					<span class="bg-[#F8F6F0] px-3 py-1.5 rounded-xl border border-[#DCCFA6] font-mono text-[#423825] flex items-center gap-1.5">
						<span class="w-1.5 h-1.5 rounded-full bg-[#8F987E]"></span>
						SPKLU Wallbox 22 kW
					</span>
					<span class="bg-[#2C2518] px-3 py-1.5 rounded-xl border border-[#8B774F] font-mono text-[#DCCFA6] font-semibold">
						Skema Pemrogram LSP
					</span>
				</div>
			</div>

			<div class="mt-8 pt-6 border-t border-[#DCCFA6]/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#756442] gap-4">
				<p>© 2026 GARTA (Garasi Takalar). Dikembangkan untuk Uji Kompetensi Sertifikasi Pemrogram LSP.</p>
				<p class="font-mono">Node.js 22 • SvelteKit 5 • SQLite ACID Relational</p>
			</div>
		</div>
	</footer>
</div>
