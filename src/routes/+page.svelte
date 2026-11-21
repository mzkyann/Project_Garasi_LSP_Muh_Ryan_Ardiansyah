<!-- src/routes/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data }: { data: PageData } = $props();

	let occupancyRate = $derived(
		data.totalCount > 0 ? Math.round(((data.totalCount - data.availableCount) / data.totalCount) * 100) : 0
	);
</script>

<svelte:head>
	<title>Portal Persewaan Garasi - SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- System Portal Header Card -->
	<div class="bg-white rounded-lg border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
		<div>
			<div class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mb-2">
				<Icon name="shield" size={13} />
				<span>Uji Kompetensi Pemrogram — Universitas Ciputra</span>
			</div>
			<h1 class="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
				Portal Manajemen & Persewaan Garasi Kendaraan
			</h1>
			<p class="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
				Sistem informasi operasional penyewaan garasi terstruktur untuk pengelolaan unit garasi sepeda, kendaraan roda empat konvensional, serta kendaraan listrik dengan integrasi tarif pengisian daya baterai.
			</p>
		</div>

		<div class="flex items-center gap-2 shrink-0">
			<a
				href="/penyewa/sewa-baru"
				class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition flex items-center gap-1.5 shadow-xs"
			>
				<Icon name="plus" size={14} />
				<span>Formulir Sewa Baru</span>
			</a>
			<a
				href="/auth/login"
				class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded text-xs transition border border-slate-300 shadow-xs"
			>
				Masuk Sistem
			</a>
		</div>
	</div>

	<!-- Status Metrics Grid -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
			<div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Kapasitas Garasi</div>
			<div class="text-2xl font-bold font-mono text-slate-900 mt-1">{data.totalCount} Unit</div>
			<div class="text-[11px] text-slate-400 mt-0.5">Seluruh kategori garasi</div>
		</div>

		<div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
			<div class="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Unit Tersedia</div>
			<div class="text-2xl font-bold font-mono text-emerald-700 mt-1">{data.availableCount} Unit</div>
			<div class="text-[11px] text-emerald-600/80 mt-0.5">Siap untuk disewa</div>
		</div>

		<div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
			<div class="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">Unit Terisi (Used)</div>
			<div class="text-2xl font-bold font-mono text-amber-700 mt-1">{data.totalCount - data.availableCount} Unit</div>
			<div class="text-[11px] text-amber-600/80 mt-0.5">Sedang aktif disewa</div>
		</div>

		<div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
			<div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Tingkat Okupansi</div>
			<div class="text-2xl font-bold font-mono text-blue-700 mt-1">{occupancyRate}%</div>
			<div class="text-[11px] text-slate-400 mt-0.5">Rasio keterisian garasi</div>
		</div>
	</div>

	<!-- Klasifikasi Tipe Garasi -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
				<Icon name="building" size={15} class="text-slate-500" />
				<span>Klasifikasi & Spesifikasi Tipe Garasi</span>
			</h2>
			<span class="text-xs text-slate-500 font-mono">Kode Format: S, C, E</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Tipe Sepeda -->
			<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between pb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center">
								<Icon name="bike" size={16} />
							</div>
							<span class="font-bold text-sm text-slate-800">Garasi Sepeda</span>
						</div>
						<span class="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
							Prefix: S
						</span>
					</div>

					<p class="text-xs text-slate-600 mt-3 leading-relaxed">
						Peruntukan khusus bagi kendaraan roda dua: sepeda (gowes) dan sepeda motor.
					</p>

					<div class="mt-4 space-y-1.5 text-xs text-slate-600">
						<div class="flex justify-between py-1 border-b border-slate-50">
							<span class="text-slate-500">Tarif Harian:</span>
							<span class="font-mono font-semibold text-slate-900">Mulai Rp 10.000 / hari</span>
						</div>
						<div class="flex justify-between py-1 border-b border-slate-50">
							<span class="text-slate-500">Tarif Bulanan:</span>
							<span class="font-mono font-semibold text-blue-700">25 x Tarif Harian</span>
						</div>
						<div class="flex justify-between py-1">
							<span class="text-slate-500">Ketentuan Plat:</span>
							<span class="text-slate-700">Tidak wajib untuk sepeda</span>
						</div>
					</div>
				</div>

				<div class="mt-4 pt-3 border-t border-slate-100">
					<span class="text-[11px] text-slate-400 block font-mono">Contoh Kode: S001, S002, S003</span>
				</div>
			</div>

			<!-- Tipe Mobil Bensin -->
			<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between pb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center">
								<Icon name="car" size={16} />
							</div>
							<span class="font-bold text-sm text-slate-800">Garasi Mobil</span>
						</div>
						<span class="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
							Prefix: C
						</span>
					</div>

					<p class="text-xs text-slate-600 mt-3 leading-relaxed">
						Peruntukan kendaraan roda empat: mobil berbahan bakar bensin/diesel atau mobil listrik (tanpa pengisian daya).
					</p>

					<div class="mt-4 space-y-1.5 text-xs text-slate-600">
						<div class="flex justify-between py-1 border-b border-slate-50">
							<span class="text-slate-500">Tarif Harian:</span>
							<span class="font-mono font-semibold text-slate-900">Mulai Rp 50.000 / hari</span>
						</div>
						<div class="flex justify-between py-1 border-b border-slate-50">
							<span class="text-slate-500">Tarif Bulanan:</span>
							<span class="font-mono font-semibold text-blue-700">25 x Tarif Harian</span>
						</div>
						<div class="flex justify-between py-1">
							<span class="text-slate-500">Ketentuan Plat:</span>
							<span class="text-slate-700">Wajib nomor plat resmi</span>
						</div>
					</div>
				</div>

				<div class="mt-4 pt-3 border-t border-slate-100">
					<span class="text-[11px] text-slate-400 block font-mono">Contoh Kode: C001, C002, C010</span>
				</div>
			</div>

			<!-- Tipe Mobil Listrik -->
			<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between pb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
								<Icon name="zap" size={16} />
							</div>
							<span class="font-bold text-sm text-slate-800">Garasi Mobil Listrik</span>
						</div>
						<span class="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
							Prefix: E
						</span>
					</div>

					<p class="text-xs text-slate-600 mt-3 leading-relaxed">
						Dilengkapi stasiun pengisian daya. Kendaraan wajib mengisi baterai hingga penuh (100% capacity).
					</p>

					<div class="mt-4 space-y-1.5 text-xs text-slate-600">
						<div class="flex justify-between py-1 border-b border-slate-50">
							<span class="text-slate-500">Tarif Harian:</span>
							<span class="font-mono font-semibold text-slate-900">Mulai Rp 75.000 / hari</span>
						</div>
						<div class="flex justify-between py-1 border-b border-slate-50">
							<span class="text-slate-500">Biaya Listrik:</span>
							<span class="font-mono font-semibold text-blue-700">Kapasitas (kWh) x Tarif/kWh</span>
						</div>
						<div class="flex justify-between py-1">
							<span class="text-slate-500">Kewajiban Charge:</span>
							<span class="text-slate-700 font-medium">100% Full Capacity</span>
						</div>
					</div>
				</div>

				<div class="mt-4 pt-3 border-t border-slate-100">
					<span class="text-[11px] text-slate-400 block font-mono">Contoh Kode: E001, E002, E003</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Prosedur Operasional Standar (SOP) -->
	<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
		<h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
			<Icon name="file-text" size={14} class="text-slate-500" />
			<span>Alur Operasional Sistem Persewaan</span>
		</h3>

		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
			<div class="p-3 bg-slate-50 rounded border border-slate-200/80">
				<div class="font-bold text-slate-800 mb-1">1. Registrasi Penyewa</div>
				<p class="text-slate-600 leading-relaxed">
					Penyewa mendaftar dengan NIK (16 digit), nama, nomor telepon, email, dan password. Status awal adalah <em>pending</em>.
				</p>
			</div>

			<div class="p-3 bg-slate-50 rounded border border-slate-200/80">
				<div class="font-bold text-slate-800 mb-1">2. Verifikasi Identitas</div>
				<p class="text-slate-600 leading-relaxed">
					Admin meninjau keabsahan KTP/NIK dan menyetujui (approve) atau menolak pendaftaran calon penyewa.
				</p>
			</div>

			<div class="p-3 bg-slate-50 rounded border border-slate-200/80">
				<div class="font-bold text-slate-800 mb-1">3. Transaksi Sewa</div>
				<p class="text-slate-600 leading-relaxed">
					Penyewa memilih jenis kendaraan, durasi (harian maks 30 hari atau bulanan), sistem memfilter garasi yang cocok, dan kalkulasi total biaya.
				</p>
			</div>

			<div class="p-3 bg-slate-50 rounded border border-slate-200/80">
				<div class="font-bold text-slate-800 mb-1">4. Perpanjangan Sewa</div>
				<p class="text-slate-600 leading-relaxed">
					Admin dapat memperpanjang tanggal selesai sewa garasi yang aktif dengan menghitung selisih hari dan mengunggah bukti bayar.
				</p>
			</div>
		</div>
	</div>
</div>
