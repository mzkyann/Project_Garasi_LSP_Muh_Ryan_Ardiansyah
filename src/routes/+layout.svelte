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

<div class="min-h-screen flex flex-col bg-[#080C14] text-[#F1F5F9] antialiased selection:bg-emerald-500/30 selection:text-white">
	<!-- Ambient Top Glow Beam -->
	<div class="fixed top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-24 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-cyan-500/10 blur-3xl pointer-events-none -z-10"></div>

	<!-- Modern Dribbble Glassmorphic Floating Header -->
	<header class="sticky top-0 z-50 backdrop-blur-2xl bg-[#0B0F17]/85 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16 sm:h-20">
				
				<!-- Brand Identity: GARTA Takalar with 3D Cyber Emblem -->
				<div class="flex items-center gap-3.5">
					<a href="/" class="flex items-center gap-3.5 group" title="Kembali ke Beranda GARTA Takalar">
						<!-- 3D Geometric Garage & EV Lightning Icon -->
						<div class="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#050811] p-2 flex items-center justify-center shadow-lg border border-white/10 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300">
							<!-- Subtle Ambient Glow inside emblem -->
							<div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-transparent to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
							
							<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-110">
								<!-- Silhouette Atap Garasi High-tech -->
								<path d="M4 15 L18 5 L32 15 L30 31 C30 31.6 29.4 32 28.5 32 L7.5 32 C6.6 32 6 31.6 6 31 Z" fill="#0B0F17" stroke="#38BDF8" stroke-width="1.2" stroke-linejoin="round"/>
								<!-- Smart Rollup Door -->
								<path d="M11 29 V18 C11 16.9 11.9 16 13 16 H23 C24.1 16 25 16.9 25 18 V29" fill="#141E33" stroke="#94A3B8" stroke-width="1.2"/>
								<line x1="12" y1="19.5" x2="24" y2="19.5" stroke="#38BDF8" stroke-width="0.8" opacity="0.6"/>
								<line x1="12" y1="22.5" x2="24" y2="22.5" stroke="#38BDF8" stroke-width="0.8" opacity="0.6"/>
								<line x1="12" y1="25.5" x2="24" y2="25.5" stroke="#38BDF8" stroke-width="0.8" opacity="0.6"/>
								<!-- Electric EV Lightning Bolt (Gold Neon) -->
								<path d="M20 7 L14 17 H21 L16 26" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse"/>
							</svg>
						</div>

						<div class="leading-tight">
							<div class="flex items-center gap-2">
								<span class="font-extrabold tracking-tight text-white text-xl sm:text-2xl font-mono">
									GARTA
								</span>
								<span class="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
									TAKALAR
								</span>
							</div>
							<span class="block text-[11px] text-slate-400 font-medium tracking-wide">
								Smart Safe Garage & EV Hub
							</span>
						</div>
					</a>

					<!-- Live Status Indicator Pill (Hidden on mobile) -->
					<div class="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 ml-3">
						<span class="relative flex h-2 w-2">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
							<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
						</span>
						<span>Takalar Live 24/7 • Skema LSP</span>
					</div>
				</div>

				<!-- Navigation Pill Tabs -->
				<nav class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
					<a
						href="/"
						class="px-3.5 py-2 rounded-xl transition-all duration-200 {isActive('/') ? 'text-white bg-white/10 font-semibold shadow-inner border border-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
					>
						Beranda
					</a>

					{#if user}
						{#if user.role === 'admin'}
							<a
								href="/admin/garasi"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 {isActive('/admin/garasi') ? 'text-white bg-white/10 font-semibold shadow-inner border border-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							>
								Kelola Garasi
							</a>

							<a
								href="/admin/persetujuan"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 relative flex items-center gap-2 {isActive('/admin/persetujuan') ? 'text-white bg-white/10 font-semibold shadow-inner border border-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							>
								<span>Persetujuan Sewa</span>
								{#if data.pendingApprovals > 0}
									<span class="px-1.5 py-0.5 bg-amber-500 text-black text-[10px] font-mono font-extrabold rounded-full animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.6)]">
										{data.pendingApprovals}
									</span>
								{/if}
							</a>

							<a
								href="/admin/perpanjang"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 {isActive('/admin/perpanjang') ? 'text-white bg-white/10 font-semibold shadow-inner border border-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							>
								Perpanjang Sewa
							</a>

							<a
								href="/admin/verifikasi"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 relative flex items-center gap-2 {isActive('/admin/verifikasi') ? 'text-white bg-white/10 font-semibold shadow-inner border border-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							>
								<span>Verifikasi KTP</span>
								{#if data.pendingUsers > 0}
									<span class="px-1.5 py-0.5 bg-cyan-400 text-black text-[10px] font-mono font-extrabold rounded-full">
										{data.pendingUsers}
									</span>
								{/if}
							</a>

							<a
								href="/admin/laporan"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 {isActive('/admin/laporan') ? 'text-white bg-white/10 font-semibold shadow-inner border border-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							>
								Laporan
							</a>
						{:else}
							<!-- Penyewa Nav Links -->
							<a
								href="/penyewa/sewa-baru"
								class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2 btn-interactive"
							>
								<Icon name="plus" size={15} />
								<span>Sewa Garasi Baru</span>
							</a>

							<a
								href="/penyewa/riwayat"
								class="px-3.5 py-2 rounded-xl transition-all duration-200 {isActive('/penyewa/riwayat') ? 'text-white bg-white/10 font-semibold shadow-inner border border-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
							>
								Riwayat Sewa
							</a>
						{/if}

						<!-- User Profile Capsule Pill -->
						<div class="flex items-center pl-2 sm:pl-4 ml-1 sm:ml-2 border-l border-slate-800">
							<a
								href="/profile"
								class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all shadow-sm group btn-interactive"
								title="Buka Pengaturan Akun & Profil"
							>
								<!-- Avatar with Glowing Status Ring -->
								<div class="relative w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs font-mono shadow-inner group-hover:scale-105 transition-transform">
									{user.name.charAt(0).toUpperCase()}
									<span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0B0F17]"></span>
								</div>

								<div class="text-left hidden md:block">
									<div class="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors leading-none">
										{user.name.split(' ')[0]}
									</div>
									<div class="text-[9px] text-amber-400 uppercase font-mono mt-1 font-bold tracking-wider">
										{user.role}
									</div>
								</div>

								<Icon name="chevron-right" size={12} class="text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all hidden sm:block" />
							</a>
						</div>
					{:else}
						<!-- Guest Mode Links -->
						<a
							href="/auth/login"
							class="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all"
						>
							Masuk
						</a>
						<a
							href="/auth/register"
							class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] btn-interactive"
						>
							Daftar Akun
						</a>
					{/if}
				</nav>
			</div>
		</div>
	</header>

	<!-- Main Content Area with Dark Glass Canvas -->
	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
		{@render children()}
	</main>

	<!-- High-Tech Modern Footer -->
	<footer class="bg-[#06080E] border-t border-slate-800/80 mt-auto py-10 text-xs text-slate-400">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col md:flex-row items-center justify-between gap-6">
				<!-- Brand Info -->
				<div class="flex items-center gap-4">
					<div class="w-10 h-10 rounded-2xl bg-slate-900 p-2 flex items-center justify-center border border-slate-800 shadow-md">
						<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
							<path d="M4 15 L18 5 L32 15 L30 31 C30 31.6 29.4 32 28.5 32 L7.5 32 C6.6 32 6 31.6 6 31 Z" fill="#0B0F17" stroke="#38BDF8" stroke-width="1.2"/>
							<path d="M11 29 V18 C11 16.9 11.9 16 13 16 H23 C24.1 16 25 16.9 25 18 V29" fill="#141E33" stroke="#94A3B8" stroke-width="1.2"/>
							<path d="M20 7 L14 17 H21 L16 26" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<div>
						<p class="font-extrabold text-sm text-white font-mono flex items-center gap-2">
							GARTA TAKALAR
							<span class="text-[10px] text-emerald-400 font-sans font-normal border border-emerald-500/30 px-2 py-0.5 rounded-full bg-emerald-500/10">
								Smart EV Charging & Garage
							</span>
						</p>
						<p class="text-[11px] text-slate-400 mt-0.5">
							Sistem Sewa Garasi Digital Terintegrasi Kabupaten Takalar, Sulawesi Selatan.
						</p>
					</div>
				</div>

				<!-- Accreditations & Trust Chips -->
				<div class="flex flex-wrap items-center gap-2 text-[11px]">
					<span class="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-slate-300 flex items-center gap-1.5">
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
						Pattallassang, Takalar
					</span>
					<span class="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-slate-300 flex items-center gap-1.5">
						<span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
						CCTV 24 Jam Live
					</span>
					<span class="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-slate-300 flex items-center gap-1.5">
						<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
						SPKLU Wallbox 22 kW
					</span>
					<span class="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-emerald-400 font-semibold">
						Skema Pemrogram LSP
					</span>
				</div>
			</div>

			<div class="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
				<p>© 2026 GARTA (Garasi Takalar). Dikembangkan untuk Uji Kompetensi Sertifikasi Pemrogram LSP.</p>
				<p class="font-mono">Node.js 22 • SvelteKit 5 • SQLite ACID Relational</p>
			</div>
		</div>
	</footer>
</div>
