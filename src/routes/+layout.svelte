<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import './layout.css';
	import type { LayoutData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, children }: { data: LayoutData; children: any } = $props();
	let user = $derived(data.user);
</script>

<div class="min-h-screen flex flex-col bg-slate-100 text-slate-800 antialiased font-sans">
	<!-- Navbar Header -->
	<header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-15">
				<!-- Brand Logo & Context -->
				<div class="flex items-center gap-3">
					<a href="/" class="flex items-center gap-2.5 font-bold text-base tracking-tight hover:text-slate-200 transition">
						<div class="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center">
							<Icon name="building" size={18} />
						</div>
						<div class="leading-tight">
							<span class="font-extrabold tracking-normal">SIM-GARASI</span>
							<span class="block text-[10px] text-slate-400 font-normal tracking-wide">Sistem Persewaan Kendaraan</span>
						</div>
					</a>
					<span class="hidden lg:inline-block text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 ml-2">
						Skema Pemrogram LSP
					</span>
				</div>

				<!-- Nav Links -->
				<nav class="flex items-center gap-1 sm:gap-2 text-xs font-medium">
					<a href="/" class="px-3 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition">
						Beranda
					</a>

					{#if user}
						{#if user.role === 'admin'}
							<a href="/admin/garasi" class="px-3 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition">
								Kelola Garasi
							</a>
							<a href="/admin/verifikasi" class="px-3 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition">
								Verifikasi Pendaftar
							</a>
							<a href="/admin/perpanjang" class="px-3 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition">
								Perpanjang Sewa
							</a>
							<a href="/admin/laporan" class="px-3 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition">
								Laporan
							</a>
						{:else}
							<a href="/penyewa/sewa-baru" class="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-1.5">
								<Icon name="plus" size={13} />
								<span>Sewa Garasi Baru</span>
							</a>
							<a href="/penyewa/riwayat" class="px-3 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition">
								Riwayat Sewa
							</a>
						{/if}

						<!-- User Profile Info & Logout -->
						<div class="flex items-center gap-2.5 pl-3 ml-2 border-l border-slate-700">
							<div class="hidden md:block text-right">
								<div class="text-xs font-semibold text-slate-200 leading-none">{user.name}</div>
								<div class="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
									{user.role} {#if user.status !== 'approved'}<span class="text-amber-400">({user.status})</span>{/if}
								</div>
							</div>
							<form action="/auth/logout" method="POST" class="inline">
								<button
									type="submit"
									class="text-xs bg-slate-800 hover:bg-rose-900/80 hover:text-rose-200 text-slate-300 px-2.5 py-1.5 rounded border border-slate-700 transition flex items-center gap-1"
									title="Keluar dari sistem"
								>
									<Icon name="logout" size={13} />
									<span class="hidden sm:inline">Keluar</span>
								</button>
							</form>
						</div>
					{:else}
						<a href="/auth/login" class="px-3 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition">
							Masuk
						</a>
						<a
							href="/auth/register"
							class="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
						>
							Pendaftaran
						</a>
					{/if}
				</nav>
			</div>
		</div>
	</header>

	<!-- Main Body -->
	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
		{@render children()}
	</main>

	<!-- Clean Academic Footer -->
	<footer class="bg-white border-t border-slate-200 mt-auto py-5 text-center text-xs text-slate-500">
		<div class="max-w-7xl mx-auto px-4 space-y-1">
			<p class="font-medium text-slate-700">
				Sistem Informasi Manajemen Persewaan Garasi Kendaraan
			</p>
			<p class="text-[11px] text-slate-500">
				Program Studi Informatika • Standar Kompetensi Kerja Nasional Indonesia (SKKNI) Skema Sertifikasi Pemrogram (IMT.01.15/SSK/LSP/IX/2021)
			</p>
		</div>
	</footer>
</div>
