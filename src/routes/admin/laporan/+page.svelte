<!-- src/routes/admin/laporan/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data }: { data: PageData } = $props();

	const months = [
		{ val: 1, name: 'Januari' },
		{ val: 2, name: 'Februari' },
		{ val: 3, name: 'Maret' },
		{ val: 4, name: 'April' },
		{ val: 5, name: 'Mei' },
		{ val: 6, name: 'Juni' },
		{ val: 7, name: 'Juli' },
		{ val: 8, name: 'Agustus' },
		{ val: 9, name: 'September' },
		{ val: 10, name: 'Oktober' },
		{ val: 11, name: 'November' },
		{ val: 12, name: 'Desember' }
	];

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:head>
	<title>Laporan Rekapitulasi - GARTA Takalar</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header with Earthy Palette & Print Button -->
	<div class="bg-gradient-to-r from-[#242D21] via-[#2D382A] to-[#1C2319] text-white rounded-2xl p-6 sm:p-7 shadow-md border border-[#3E4F39] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
		<div class="space-y-1.5 relative z-10">
			<div class="inline-flex items-center gap-2 text-xs font-bold text-[#E5C772] uppercase tracking-wider font-mono">
				<Icon name="file-text" size={13} />
				<span>Panel Administrasi Finansial</span>
			</div>
			<h1 class="text-2xl font-extrabold text-[#FAF8F4] tracking-tight">
				Laporan Rekapitulasi Persewaan Garasi
			</h1>
			<p class="text-xs text-[#D1DDCE] leading-relaxed max-w-xl">
				Ekstraksi data transaksi persewaan sesuai 4 modul FR.IA.04A: Per bulan dalam tahun tertentu, per hari dalam bulan tertentu, per tipe garasi, atau per penyewa.
			</p>
		</div>

		<div class="relative z-10">
			<button
				type="button"
				onclick={() => window.print()}
				class="px-4 py-2.5 bg-[#384634] hover:bg-[#485942] text-[#FAF8F4] rounded-xl text-xs font-bold border border-[#4F624A] transition-all flex items-center gap-2 shadow-xs btn-interactive"
			>
				<Icon name="printer" size={15} class="text-[#E5C772]" />
				<span>Cetak / Ekspor PDF</span>
			</button>
		</div>
	</div>

	<!-- Mode Filter Segmented Tabs -->
	<div class="bg-white p-2 rounded-2xl border border-[#DFD5C2] shadow-xs flex flex-wrap gap-2 text-xs font-bold card-hover">
		<a
			href="/admin/laporan?mode=bulan&year={data.selectedYear}&month={data.selectedMonth}"
			class="px-4 py-2 rounded-xl transition-all {data.mode === 'bulan' ? 'bg-[#383123] text-white shadow-xs' : 'bg-[#FAF8F4] text-[#6B5E45] hover:bg-[#EAE3D4] border border-[#DFD5C2]'}"
		>
			1. Per Bulan dalam Tahun
		</a>
		<a
			href="/admin/laporan?mode=hari&date={data.selectedDate}"
			class="px-4 py-2 rounded-xl transition-all {data.mode === 'hari' ? 'bg-[#383123] text-white shadow-xs' : 'bg-[#FAF8F4] text-[#6B5E45] hover:bg-[#EAE3D4] border border-[#DFD5C2]'}"
		>
			2. Per Hari dalam Bulan
		</a>
		<a
			href="/admin/laporan?mode=tipe&garageType=all"
			class="px-4 py-2 rounded-xl transition-all {data.mode === 'tipe' ? 'bg-[#383123] text-white shadow-xs' : 'bg-[#FAF8F4] text-[#6B5E45] hover:bg-[#EAE3D4] border border-[#DFD5C2]'}"
		>
			3. Per Tipe Garasi
		</a>
		<a
			href="/admin/laporan?mode=penyewa&tenantId=all"
			class="px-4 py-2 rounded-xl transition-all {data.mode === 'penyewa' ? 'bg-[#383123] text-white shadow-xs' : 'bg-[#FAF8F4] text-[#6B5E45] hover:bg-[#EAE3D4] border border-[#DFD5C2]'}"
		>
			4. Per Penyewa
		</a>
	</div>

	<!-- Parameter Filter Sub-form -->
	<div class="bg-white p-5 rounded-2xl border border-[#DFD5C2] shadow-xs card-hover">
		<form method="GET" action="/admin/laporan" class="flex flex-wrap items-end gap-4 text-xs">
			<input type="hidden" name="mode" value={data.mode} />

			{#if data.mode === 'bulan'}
				<div>
					<label for="month" class="block font-bold text-[#383123] mb-1.5">Pilih Bulan</label>
					<select
						id="month"
						name="month"
						value={data.selectedMonth}
						class="px-3.5 py-2.5 border border-[#DFD5C2] rounded-xl bg-[#FCFAF4] input-focus text-xs font-semibold"
					>
						{#each months as m}
							<option value={m.val}>{m.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="year" class="block font-bold text-[#383123] mb-1.5">Tahun</label>
					<input
						type="number"
						id="year"
						name="year"
						value={data.selectedYear}
						min="2020"
						max="2035"
						class="px-3.5 py-2.5 border border-[#DFD5C2] rounded-xl bg-[#FCFAF4] input-focus w-28 font-mono text-xs font-bold"
					/>
				</div>
			{:else if data.mode === 'hari'}
				<div>
					<label for="date" class="block font-bold text-[#383123] mb-1.5">Pilih Tanggal</label>
					<input
						type="date"
						id="date"
						name="date"
						value={data.selectedDate}
						class="px-3.5 py-2.5 border border-[#DFD5C2] rounded-xl bg-[#FCFAF4] input-focus font-mono text-xs font-bold"
					/>
				</div>
			{:else if data.mode === 'tipe'}
				<div>
					<label for="garageType" class="block font-bold text-[#383123] mb-1.5">Filter Kategori Garasi</label>
					<select
						id="garageType"
						name="garageType"
						value={data.selectedType}
						class="px-3.5 py-2.5 border border-[#DFD5C2] rounded-xl bg-[#FCFAF4] input-focus text-xs font-semibold"
					>
						<option value="all">Seluruh Kategori Garasi</option>
						<option value="sepeda">Garasi Sepeda & Motor (Kode S)</option>
						<option value="mobil">Garasi Mobil (Kode C)</option>
						<option value="mobil_listrik">Garasi Mobil Listrik (Kode E)</option>
					</select>
				</div>
			{:else if data.mode === 'penyewa'}
				<div>
					<label for="tenantId" class="block font-bold text-[#383123] mb-1.5">Filter Berdasarkan Penyewa</label>
					<select
						id="tenantId"
						name="tenantId"
						value={data.selectedTenant}
						class="px-3.5 py-2.5 border border-[#DFD5C2] rounded-xl bg-[#FCFAF4] input-focus text-xs font-semibold"
					>
						<option value="all">Seluruh Penyewa</option>
						{#each data.tenantsList as t}
							<option value={t.id}>{t.name} ({t.email})</option>
						{/each}
					</select>
				</div>
			{/if}

			<div>
				<button
					type="submit"
					class="px-5 py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs btn-interactive"
				>
					<Icon name="filter" size={14} />
					<span>Terapkan Filter</span>
				</button>
			</div>
		</form>
	</div>

	<!-- 4 Summary Metrics Cards Bento -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<div class="bg-white p-5 rounded-2xl border border-[#DFD5C2] shadow-xs card-hover">
			<span class="text-[10px] text-[#877758] font-bold uppercase tracking-wider block">Total Transaksi</span>
			<div class="text-2xl font-extrabold font-mono text-[#383123] mt-1.5">
				{data.summary.totalTransactions} Transaksi
			</div>
		</div>

		<div class="bg-white p-5 rounded-2xl border border-[#DFD5C2] shadow-xs card-hover">
			<span class="text-[10px] text-[#877758] font-bold uppercase tracking-wider block">Pendapatan Sewa Pokok</span>
			<div class="text-base font-extrabold font-mono text-[#383123] mt-1.5">
				{formatRupiah(data.summary.totalBaseCost)}
			</div>
		</div>

		<div class="bg-white p-5 rounded-2xl border border-[#C2CCBC] shadow-xs card-hover">
			<span class="text-[10px] text-[#596A53] font-bold uppercase tracking-wider block">Pendapatan Cas SPKLU</span>
			<div class="text-base font-extrabold font-mono text-[#596A53] mt-1.5">
				{formatRupiah(data.summary.totalElectricityCost)}
			</div>
		</div>

		<div class="bg-[#EFF3ED] p-5 rounded-2xl border border-[#71856A] shadow-xs card-hover">
			<span class="text-[10px] text-[#2E382A] font-bold uppercase tracking-wider block">Akumulasi Omset Total</span>
			<div class="text-lg font-extrabold font-mono text-[#2E382A] mt-1.5">
				{formatRupiah(data.summary.grandTotal)}
			</div>
		</div>
	</div>

	<!-- Data Table -->
	<div class="bg-white rounded-2xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
			<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
				Rincian Transaksi ({data.reportData.length} Data Transaksi)
			</h2>
			<span class="text-xs text-[#71856A] font-mono font-bold">GARTA TAKALAR • LSP REPORT</span>
		</div>

		{#if data.reportData.length === 0}
			<div class="p-12 text-center text-[#A08F6E] text-xs">
				Tidak ada data transaksi yang sesuai dengan parameter filter yang dipilih.
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
						<tr>
							<th class="py-3 px-4 font-mono">Kode Slot</th>
							<th class="py-3 px-4">Penyewa</th>
							<th class="py-3 px-4">Kendaraan</th>
							<th class="py-3 px-4 font-mono">Periode Sewa</th>
							<th class="py-3 px-4">Durasi</th>
							<th class="py-3 px-4 font-mono text-right">Biaya Pokok</th>
							<th class="py-3 px-4 font-mono text-right">Biaya Listrik</th>
							<th class="py-3 px-4 font-mono text-right">Total Pelunasan</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#F4EFE7] font-mono">
						{#each data.reportData as row (row.id)}
							<tr class="hover:bg-[#FAF8F4] transition">
								<td class="py-3 px-4 font-bold text-[#383123]">
									<span class="px-2 py-0.5 rounded bg-[#FAF8F4] border border-[#DFD5C2] font-mono font-extrabold">
										{row.garage_code}
									</span>
									<span class="block text-[10px] text-[#877758] font-sans font-normal capitalize mt-1">
										{row.garage_type.replace('_', ' ')}
									</span>
								</td>
								<td class="py-3 px-4 font-sans">
									<div class="font-bold text-[#383123]">{row.tenant_name}</div>
									<div class="text-[10px] text-[#A08F6E] font-mono">{row.tenant_email}</div>
								</td>
								<td class="py-3 px-4 font-sans">
									<div class="text-[#383123] font-medium">{row.vehicle_brand_model}</div>
									<div class="text-[10px] font-mono text-[#877758]">{row.license_plate || 'Bebas Plat'}</div>
								</td>
								<td class="py-3 px-4 text-[#6B5E45] text-[11px]">
									{row.start_date} <br />
									<span class="text-[#A08F6E]">s/d {row.end_date}</span>
								</td>
								<td class="py-3 px-4 font-sans capitalize text-[11px]">
									{row.rental_type} ({row.duration} {row.rental_type === 'harian' ? 'hari' : 'bln'})
								</td>
								<td class="py-3 px-4 text-right text-[#383123]">{formatRupiah(row.base_rental_cost)}</td>
								<td class="py-3 px-4 text-right text-[#596A53]">
									{row.electricity_cost > 0 ? formatRupiah(row.electricity_cost) : '-'}
								</td>
								<td class="py-3 px-4 text-right font-extrabold text-[#2E382A]">
									{formatRupiah(row.total_cost)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
