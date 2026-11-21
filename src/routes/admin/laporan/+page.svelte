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
	<title>Laporan Persewaan - SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header with Earthy Palette & Print Button -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="file-text" size={14} />
				<span>Panel Administrasi</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Laporan Rekapitulasi Persewaan Garasi</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Ekstraksi data transaksi persewaan berdasarkan periode bulan, hari, kategori tipe garasi, atau per penyewa.
			</p>
		</div>
		<button
			type="button"
			onclick={() => window.print()}
			class="px-4 py-2 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] rounded-lg text-xs font-bold border border-[#DFD5C2] transition-all flex items-center gap-2 shadow-xs btn-interactive"
		>
			<Icon name="printer" size={14} />
			<span>Cetak / Ekspor PDF</span>
		</button>
	</div>

	<!-- Mode Filter Tabs -->
	<div class="bg-white p-2 rounded-xl border border-[#DFD5C2] shadow-xs flex flex-wrap gap-2 text-xs font-bold card-hover">
		<a
			href="/admin/laporan?mode=bulan&year={data.selectedYear}&month={data.selectedMonth}"
			class="px-3.5 py-2 rounded-lg transition-all {data.mode === 'bulan' ? 'bg-[#71856A] text-white shadow-xs' : 'bg-[#FAF8F4] text-[#6B5E45] hover:bg-[#EFE8D6] border border-[#DFD5C2]'}"
		>
			Per Bulan dalam Tahun
		</a>
		<a
			href="/admin/laporan?mode=hari&date={data.selectedDate}"
			class="px-3.5 py-2 rounded-lg transition-all {data.mode === 'hari' ? 'bg-[#71856A] text-white shadow-xs' : 'bg-[#FAF8F4] text-[#6B5E45] hover:bg-[#EFE8D6] border border-[#DFD5C2]'}"
		>
			Per Hari dalam Bulan
		</a>
		<a
			href="/admin/laporan?mode=tipe&garageType=all"
			class="px-3.5 py-2 rounded-lg transition-all {data.mode === 'tipe' ? 'bg-[#71856A] text-white shadow-xs' : 'bg-[#FAF8F4] text-[#6B5E45] hover:bg-[#EFE8D6] border border-[#DFD5C2]'}"
		>
			Per Tipe Garasi
		</a>
		<a
			href="/admin/laporan?mode=penyewa&tenantId=all"
			class="px-3.5 py-2 rounded-lg transition-all {data.mode === 'penyewa' ? 'bg-[#71856A] text-white shadow-xs' : 'bg-[#FAF8F4] text-[#6B5E45] hover:bg-[#EFE8D6] border border-[#DFD5C2]'}"
		>
			Per Penyewa
		</a>
	</div>

	<!-- Parameter Filter Sub-form -->
	<div class="bg-white p-5 rounded-xl border border-[#DFD5C2] shadow-xs card-hover">
		<form method="GET" action="/admin/laporan" class="flex flex-wrap items-end gap-4 text-xs">
			<input type="hidden" name="mode" value={data.mode} />

			{#if data.mode === 'bulan'}
				<div>
					<label for="month" class="block font-bold text-[#4F4532] mb-1.5">Pilih Bulan</label>
					<select
						id="month"
						name="month"
						value={data.selectedMonth}
						class="px-3.5 py-2 border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus text-xs font-medium"
					>
						{#each months as m}
							<option value={m.val}>{m.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="year" class="block font-bold text-[#4F4532] mb-1.5">Tahun</label>
					<input
						type="number"
						id="year"
						name="year"
						value={data.selectedYear}
						min="2020"
						max="2035"
						class="px-3.5 py-2 border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus w-24 font-mono text-xs font-bold"
					/>
				</div>
			{:else if data.mode === 'hari'}
				<div>
					<label for="date" class="block font-bold text-[#4F4532] mb-1.5">Pilih Tanggal</label>
					<input
						type="date"
						id="date"
						name="date"
						value={data.selectedDate}
						class="px-3.5 py-2 border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus font-mono text-xs font-bold"
					/>
				</div>
			{:else if data.mode === 'tipe'}
				<div>
					<label for="garageType" class="block font-bold text-[#4F4532] mb-1.5">Filter Kategori Garasi</label>
					<select
						id="garageType"
						name="garageType"
						value={data.selectedType}
						class="px-3.5 py-2 border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus text-xs font-medium"
					>
						<option value="all">Seluruh Kategori Garasi</option>
						<option value="sepeda">Garasi Sepeda & Motor (Kode S)</option>
						<option value="mobil">Garasi Mobil (Kode C)</option>
						<option value="mobil_listrik">Garasi Mobil Listrik (Kode E)</option>
					</select>
				</div>
			{:else if data.mode === 'penyewa'}
				<div>
					<label for="tenantId" class="block font-bold text-[#4F4532] mb-1.5">Filter Berdasarkan Penyewa</label>
					<select
						id="tenantId"
						name="tenantId"
						value={data.selectedTenant}
						class="px-3.5 py-2 border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus text-xs font-medium"
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
					class="px-4 py-2 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs btn-interactive"
				>
					<Icon name="filter" size={13} />
					<span>Terapkan Filter</span>
				</button>
			</div>
		</form>
	</div>

	<!-- Summary Metrics Cards with Earthy Palette -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<div class="bg-white p-5 rounded-xl border border-[#DFD5C2] shadow-xs card-hover">
			<span class="text-[11px] text-[#877758] font-bold uppercase tracking-wider">Total Transaksi</span>
			<div class="text-2xl font-extrabold font-mono text-[#383123] mt-1.5">
				{data.summary.totalTransactions} Transaksi
			</div>
		</div>

		<div class="bg-white p-5 rounded-xl border border-[#DFD5C2] shadow-xs card-hover">
			<span class="text-[11px] text-[#877758] font-bold uppercase tracking-wider">Pendapatan Pokok Garasi</span>
			<div class="text-base font-extrabold font-mono text-[#383123] mt-1.5">
				{formatRupiah(data.summary.totalBaseCost)}
			</div>
		</div>

		<div class="bg-white p-5 rounded-xl border border-[#C2CCBC] shadow-xs card-hover">
			<span class="text-[11px] text-[#596A53] font-bold uppercase tracking-wider">Pendapatan Listrik EV</span>
			<div class="text-base font-extrabold font-mono text-[#596A53] mt-1.5">
				{formatRupiah(data.summary.totalElectricityCost)}
			</div>
		</div>

		<div class="bg-[#EFF3ED] p-5 rounded-xl border border-[#71856A] shadow-xs card-hover">
			<span class="text-[11px] text-[#2E382A] font-bold uppercase tracking-wider">Akumulasi Pendapatan</span>
			<div class="text-lg font-extrabold font-mono text-[#2E382A] mt-1.5">
				{formatRupiah(data.summary.grandTotal)}
			</div>
		</div>
	</div>

	<!-- Data Table -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
			<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
				Rincian Transaksi ({data.reportData.length} Data)
			</h2>
			<span class="text-xs text-[#877758] font-mono">LSP Examination Report</span>
		</div>

		{#if data.reportData.length === 0}
			<div class="p-10 text-center text-[#A08F6E] text-xs">
				Tidak ada data transaksi yang sesuai dengan parameter filter yang dipilih.
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
						<tr>
							<th class="py-3 px-4 font-mono">Kode</th>
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
									{row.garage_code}
									<span class="block text-[10px] text-[#877758] font-sans font-normal capitalize">
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
								<td class="py-3 px-4 text-right font-bold text-[#2E382A]">
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