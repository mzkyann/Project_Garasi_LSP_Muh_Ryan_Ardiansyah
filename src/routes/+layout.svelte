<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import './layout.css';
	import type { LayoutData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, children }: { data: LayoutData; children: any } = $props();
	let user = $derived(data.user);
</script>

<svelte:head>
	<title>GARTA - Garasi Takalar | Smart Safe Garage & EV Hub</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2E281E] antialiased font-sans selection:bg-[#D5DFD1] selection:text-[#1F291D]">
	<!-- Navbar Header with Warm Forest Slate & Champagne Accents -->
	<header class="bg-[#242D21] text-[#FAF8F4] border-b border-[#374433] sticky top-0 z-50 shadow-sm backdrop-blur-md bg-opacity-95">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<!-- Brand Logo & Context: GARTA (Garasi Takalar) -->
				<div class="flex items-center gap-3">
					<a href="/" class="flex items-center gap-3 font-bold text-base tracking-tight hover:opacity-95 transition group">
						<!-- Logo GARTA Eksklusif (Garasi + Huruf G Geometris + EV Zap Gold) -->
						<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#687D61] to-[#384634] p-1.5 flex items-center justify-center shadow-md border border-[#83987C]/40 group-hover:scale-105 transition-transform">
							<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
								<!-- Silhouette Atap Garasi Modern -->
								<path d="M4 16 L18 6 L32 16 L30 30 C30 31.1 29.1 32 28 32 L8 32 C6.9 32 6 31.1 6 30 Z" fill="#1C2319" stroke="#E5C772" stroke-width="1.2"/>
								<!-- Pintu Garasi Smart Roller Door -->
								<path d="M12 28 V19 C12 17.9 12.9 17 14 17 H22 C23.1 17 24 17.9 24 19 V28" fill="#283224" stroke="#FAF8F4" stroke-width="1.2"/>
								<line x1="13" y1="20.5" x2="23" y2="20.5" stroke="#71856A" stroke-width="0.8"/>
								<line x1="13" y1="23.5" x2="23" y2="23.5" stroke="#71856A" stroke-width="0.8"/>
								<line x1="13" y1="26.5" x2="23" y2="26.5" stroke="#71856A" stroke-width="0.8"/>
								<!-- Petir Listrik EV Emas -->
								<path d="M19.5 9 L15.5 15.5 H20.5 L16.5 22.5" stroke="#F4D068" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						<div class="leading-tight">
							<span class="font-extrabold tracking-tight text-white flex items-center gap-1.5 text-lg font-mono">
								GARTA
								<span class="text-[9px] bg-[#C2A649] text-[#1F251A] px-1.5 py-0.5 rounded font-mono font-extrabold tracking-wider uppercase">Takalar</span>
							</span>
							<span class="block text-[10px] text-[#C9D6C5] font-normal tracking-wide">
								Garasi Takalar & EV Hub
							</span>
						</div>
					</a>
					<span class="hidden lg:inline-flex items-center gap-1 text-[11px] bg-[#333E2F] text-[#E0E9DE] px-2.5 py-1 rounded-md border border-[#485743] ml-2 font-medium">
						<Icon name="shield" size={11} class="text-[#E5C772]" />
						<span>Kabupaten Takalar • Skema LSP</span>
					</span>
				</div>

				<!-- Nav Links -->
				<nav class="flex items-center gap-1.5 sm:gap-2 text-xs font-medium">
					<a
						href="/"
						class="px-3 py-1.5 rounded-md text-[#D1DDCE] hover:text-white hover:bg-[#384634] transition-colors"
					>
						Beranda
					</a>

					{#if user}
						{#if user.role === 'admin'}
							<a
								href="/admin/garasi"
								class="px-3 py-1.5 rounded-md text-[#D1DDCE] hover:text-white hover:bg-[#384634] transition-colors"
							>
								Kelola Garasi
							</a>
							<a
								href="/admin/persetujuan"
								class="px-3 py-1.5 rounded-md text-[#D1DDCE] hover:text-white hover:bg-[#384634] transition-colors relative flex items-center gap-1.5"
							>
								<span>Persetujuan Sewa (ACC)</span>
								{#if data.pendingApprovals > 0}
									<span class="px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-mono font-extrabold rounded-full animate-pulse">
										{data.pendingApprovals}
									</span>
								{/if}
							</a>
							<a
								href="/admin/perpanjang"
								class="px-3 py-1.5 rounded-md text-[#D1DDCE] hover:text-white hover:bg-[#384634] transition-colors"
							>
								Perpanjang Sewa
							</a>
							<a
								href="/admin/verifikasi"
								class="px-3 py-1.5 rounded-md text-[#D1DDCE] hover:text-white hover:bg-[#384634] transition-colors relative flex items-center gap-1.5"
							>
								<span>Verifikasi KTP</span>
								{#if data.pendingUsers > 0}
									<span class="px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-mono font-extrabold rounded-full">
										{data.pendingUsers}
									</span>
								{/if}
							</a>
							<a
								href="/admin/laporan"
								class="px-3 py-1.5 rounded-md text-[#D1DDCE] hover:text-white hover:bg-[#384634] transition-colors"
							>
								Laporan
							</a>
						{:else}
							<a
								href="/penyewa/sewa-baru"
								class="px-3.5 py-1.5 rounded-md bg-[#687D61] hover:bg-[#54674E] text-white font-semibold transition-all shadow-xs flex items-center gap-1.5 btn-interactive"
							>
								<Icon name="plus" size={13} />
								<span>Sewa Garasi Baru</span>
							</a>
							<a
								href="/penyewa/riwayat"
								class="px-3 py-1.5 rounded-md text-[#D1DDCE] hover:text-white hover:bg-[#384634] transition-colors"
							>
								Riwayat Sewa
							</a>
						{/if}

						<!-- User Profile Link (Ke Halaman Profile Terlebih Dahulu Sebelum Logout) -->
						<div class="flex items-center pl-3 ml-2 border-l border-[#384634]">
							<a
								href="/profile"
								class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#384634] hover:bg-[#455541] text-[#FAF8F4] border border-[#4F624A] transition-all btn-interactive group"
								title="Buka Halaman Profil & Pengaturan Akun"
							>
								<div class="w-6 h-6 rounded-md bg-[#687D61] text-white flex items-center justify-center font-bold text-[11px] font-mono group-hover:scale-105 transition-transform">
									{user.name.charAt(0).toUpperCase()}
								</div>
								<div class="text-left hidden sm:block">
									<div class="text-xs font-semibold leading-none">{user.name}</div>
									<div class="text-[9px] text-[#E5C772] uppercase font-mono mt-0.5">
										{user.role}
									</div>
								</div>
								<span class="text-[10px] text-[#E5C772] font-medium hidden md:inline">Profil →</span>
							</a>
						</div>
					{:else}
						<a
							href="/auth/login"
							class="px-3 py-1.5 rounded-md text-[#D1DDCE] hover:text-white hover:bg-[#384634] transition-colors"
						>
							Masuk
						</a>
						<a
							href="/auth/register"
							class="px-3.5 py-1.5 rounded-md bg-[#687D61] hover:bg-[#54674E] text-white font-semibold transition-all shadow-xs btn-interactive"
						>
							Daftar Akun
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

	<!-- Professional Footer with GARTA Takalar Identity -->
	<footer class="bg-[#EDE7DA] border-t border-[#D9D1BF] mt-auto py-8 text-xs text-[#5D5240]">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col md:flex-row items-center justify-between gap-6">
				<!-- Brand Info -->
				<div class="flex items-center gap-3.5">
					<div class="w-9 h-9 rounded-xl bg-[#242D21] p-1.5 flex items-center justify-center shadow-xs border border-[#3E4F39]">
						<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
							<path d="M4 16 L18 6 L32 16 L30 30 C30 31.1 29.1 32 28 32 L8 32 C6.9 32 6 31.1 6 30 Z" fill="#1C2319" stroke="#E5C772" stroke-width="1.2"/>
							<path d="M12 28 V19 C12 17.9 12.9 17 14 17 H22 C23.1 17 24 17.9 24 19 V28" fill="#283224" stroke="#FAF8F4" stroke-width="1.2"/>
							<path d="M19.5 9 L15.5 15.5 H20.5 L16.5 22.5" stroke="#F4D068" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<div>
						<p class="font-extrabold text-sm text-[#242D21] font-mono">
							GARTA • Garasi Takalar & Smart EV Charging Hub
						</p>
						<p class="text-[11px] text-[#54674E] font-medium">
							Layanan Penitipan Kendaraan Aman Terstruktur Kabupaten Takalar, Sulawesi Selatan.
						</p>
					</div>
				</div>

				<!-- LSP Badges -->
				<div class="flex flex-wrap items-center gap-2 text-[11px]">
					<span class="bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#D9D1BF] font-mono text-[#384634] font-medium">
						📍 Pattallassang, Takalar
					</span>
					<span class="bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#D9D1BF] font-mono text-[#384634] font-medium">
						🛡️ CCTV 24 Jam & Security
					</span>
					<span class="bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#D9D1BF] font-mono text-[#384634] font-medium">
						⚡ SPKLU Wallbox 22 kW
					</span>
					<span class="bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#D9D1BF] font-mono text-[#384634] font-medium">
						Skema Pemrogram LSP
					</span>
				</div>
			</div>

			<div class="mt-6 pt-4 border-t border-[#DFD7C5] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A6E59] gap-2">
				<p>© 2026 GARTA (Garasi Takalar). Dikembangkan oleh Muh. Ryan Ardiansyah.</p>
				<p>Standar Kompetensi Kerja Nasional Indonesia (SKKNI) Pemrogram.</p>
			</div>
		</div>
	</footer>
</div>
