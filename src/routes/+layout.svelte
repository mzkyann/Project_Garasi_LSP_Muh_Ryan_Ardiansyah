<script lang="ts">
	import './layout.css';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
	let user = $derived(data.user);
</script>

<div class="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
	<!-- Navbar Header -->
	<header class="bg-indigo-900 text-white shadow-md sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<!-- Brand Logo -->
				<div class="flex items-center gap-3">
					<a href="/" class="flex items-center gap-2 font-bold text-xl tracking-tight hover:text-indigo-200 transition">
						<span class="bg-indigo-600 text-white p-2 rounded-lg text-lg">🏢</span>
						<span>GARASI<span class="text-amber-400">.ID</span></span>
					</a>
					<span class="hidden md:inline-block text-xs bg-indigo-800/80 text-indigo-200 px-2 py-0.5 rounded border border-indigo-700">
						Sertifikasi Pemrogram
					</span>
				</div>

				<!-- Nav Links -->
				<nav class="flex items-center gap-1 md:gap-3 text-sm font-medium">
					<a href="/" class="px-3 py-2 rounded-md hover:bg-indigo-800 transition">Beranda</a>

					{#if user}
						{#if user.role === 'admin'}
							<a href="/admin/garasi" class="px-3 py-2 rounded-md hover:bg-indigo-800 transition">
								Kelola Garasi
							</a>
							<a href="/admin/verifikasi" class="px-3 py-2 rounded-md hover:bg-indigo-800 transition">
								Verifikasi Pendaftar
							</a>
							<a href="/admin/perpanjang" class="px-3 py-2 rounded-md hover:bg-indigo-800 transition">
								Perpanjang Sewa
							</a>
							<a href="/admin/laporan" class="px-3 py-2 rounded-md hover:bg-indigo-800 transition">
								Laporan
							</a>
						{:else}
							<a href="/penyewa/sewa-baru" class="px-3 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition">
								+ Sewa Baru
							</a>
							<a href="/penyewa/riwayat" class="px-3 py-2 rounded-md hover:bg-indigo-800 transition">
								Riwayat Sewa
							</a>
						{/if}

						<!-- User Profile Info & Logout -->
						<div class="flex items-center gap-2 pl-3 ml-2 border-l border-indigo-700">
							<div class="hidden sm:block text-right">
								<div class="text-xs font-semibold leading-tight">{user.name}</div>
								<div class="text-[10px] uppercase font-bold text-amber-300">
									{user.role} {#if user.status !== 'approved'}({user.status}){/if}
								</div>
							</div>
							<form action="/auth/logout" method="POST" class="inline">
								<button
									type="submit"
									class="text-xs bg-rose-600/80 hover:bg-rose-600 text-white px-2.5 py-1.5 rounded transition font-medium"
								>
									Keluar
								</button>
							</form>
						</div>
					{:else}
						<a href="/auth/login" class="px-3 py-2 rounded-md hover:bg-indigo-800 transition">
							Masuk
						</a>
						<a
							href="/auth/register"
							class="px-3 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition"
						>
							Daftar Akun
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

	<!-- Footer -->
	<footer class="bg-white border-t border-slate-200 mt-auto py-6 text-center text-xs text-slate-500">
		<div class="max-w-7xl mx-auto px-4">
			<p class="font-semibold text-slate-700">Aplikasi Sistem Penyewaan Garasi Kendaraan (GARASI.ID)</p>
			<p class="mt-1">
				Standar Kompetensi Kerja Nasional Indonesia (SKKNI) — Skema Sertifikasi Pemrogram (IMT.01.15/SSK/LSP/IX/2021)
			</p>
			<p class="mt-1 text-slate-400">Dibangun dengan SvelteKit 5, TypeScript, SQLite Relasional & Tailwind CSS</p>
		</div>
	</footer>
</div>
