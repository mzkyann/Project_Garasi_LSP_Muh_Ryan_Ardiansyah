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
</script>

<svelte:head>
	<title>Laporan Persewaan - SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header -->
	<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
				<Icon name="file-text" size={14} class="text-blue-600" />
				<span>Panel Administrasi</span>
			</div>
			<h1 class="text-lg font-bold text-slate-900 mt-1">Laporan Rekapitulasi Persewaan Garasi</h1>
			<p class="text-xs text-slate-500 mt-0.5">
				Ekstraksi data transaksi persewaan berdasarkan periode bulan, hari, kategori tipe garasi, atau per penyewa.
			</p>
		</div>
		<button
			type="button"
			onclick={() => window.print()}
			class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium border border-slate-300 transition flex items-center gap-1.5 shadow-xs"
		>
			<Icon name="printer" size={14} />
			<span>Cetak / Cetak PDF</span>
		</button>
	</div>

	<!-- Mode Filter Tabs -->
	<div class="bg-white p-2 rounded-lg border border-slate-200 shadow-xs flex flex-wrap gap-1.5 text-xs font-medium">
		<a
			href="/admin/laporan?mode=bulan&year={data.selectedYear}&month={data.selectedMonth}"
			class="px-3 py-1.5 rounded transition {data.mode === 'bulan' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}"
		>
			Per Bulan dalam Tahun
		</a>
		<a
			href="/admin/laporan?mode=hari&date={data.selectedDate}"
			class="px-3 py-1.5 rounded transition {data.mode === 'hari' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}"
		>
			Per Hari dalam Bulan
		</a>
		<a
			href="/admin/laporan?mode=tipe&garageType=all"
			class="px-3 py-1.5 rounded transition {data.mode === 'tipe' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}"
		>
			Per Tipe Garasi
		</a>
		<a
			href="/admin/laporan?mode=penyewa&tenantId=all"
			class="px-3 py-1.5 rounded transition {data.mode === 'penyewa' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}"
		>
			Per Penyewa
		</a>
	</div>

	<!-- Parameter Filter Sub-form -->
	<div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
		<form method="GET" action="/admin/laporan" class="flex flex-wrap items-end gap-3 text-xs">
			<input type="hidden" name="mode" value={data.mode} />

			{#if data.mode === 'bulan'}
				<div>
					<label for="month" class="block font-semibold text-slate-700 mb-1">Pilih Bulan</label>
					<select
						id="month"
						name="month"
						value={data.selectedMonth}
						class="px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
					>
						{#each months as m}
							<option value={m.val}>{m.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="year" class="block font-semibold text-slate-700 mb-1">Tahun</label>
					<input
						type="number"
						id="year"
						name="year"
						value={data.selectedYear}
						min="2020"
						max="2035"
						class="px-3 py-1.5 border border-slate-300 rounded w-24 font-mono text-xs"
					/>
				</div>
			{:else if data.mode === 'hari'}
				<div>
					<label for="date" class="block font-semibold text-slate-700 mb-1">Pilih Tanggal</label>
					<input
						type="date"
						id="date"
						name="date"
						value={data.selectedDate}
						class="px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
					/>
				</div>
			{:else if data.mode === 'tipe'}
				<div>
					<label for="garageType" class="block font-semibold text-slate-700 mb-1">Filter Kategori Garasi</label>
					<select
						id="garageType"
						name="garageType"
						value={data.selectedType}
						class="px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
					>
						<option value="all">Seluruh Kategori Garasi</option>
						<option value="sepeda">Garasi Sepeda & Motor (Kode S)</option>
						<option value="mobil">Garasi Mobil (Kode C)</option>
						<option value="mobil_listrik">Garasi Mobil Listrik (Kode E)</option>
					</select>
				</div>
			{:else if data.mode === 'penyewa'}
				<div>
					<label for="tenantId" class="block font-semibold text-slate-700 mb-1">Filter Berdasarkan Penyewa</label>
					<select
						id="tenantId"
						name="tenantId"
						value={data.selectedTenant}
						class="px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
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
					class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition flex items-center gap-1 shadow-xs"
				>
					<Icon name="filter" size={12} />
					<span>Terapkan</span>
				</button>
			</div>
		</form>
	</div>

	<!-- Summary Metrics Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
			<span class="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Total Transaksi</span>
			<div class="text-xl font-bold font-mono text-slate-900 mt-1">
				{data.summary.totalTransactions} Transaksi
			</div>
		</div>

		<div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
			<span class="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Pendapatan Pokok Garasi</span>
			<div class="text-base font-bold font-mono text-slate-800 mt-1">
				Rp {data.summary.totalBaseCost.toLocaleString('id-ID')}
			</div>
		</div>

		<div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
			<span class="text-[11px] text-blue-700 font-semibold uppercase tracking-wide">Pendapatan Listrik EV</span>
			<div class="text-base font-bold font-mono text-blue-700 mt-1">
				Rp {data.summary.totalElectricityCost.toLocaleString('id-ID')}
			</div>
		</div>

		<div class="bg-white p-4 rounded-lg border border-blue-200 shadow-xs bg-blue-50/20">
			<span class="text-[11px] text-slate-700 font-semibold uppercase tracking-wide">Akumulasi Pendapatan</span>
			<div class="text-lg font-bold font-mono text-blue-700 mt-1">
				Rp {data.summary.grandTotal.toLocaleString('id-ID')}
			</div>
		</div>
	</div>

	<!-- Data Table -->
	<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
		<div class="p-4 border-b border-slate-100 flex items-center justify-between">
			<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
				Rincian Transaksi ({data.reportData.length} Data)
			</h2>
		</div>

		{#if data.reportData.length === 0}
			<div class="p-8 text-center text-slate-400 text-xs">
				Tidak ada data transaksi yang sesuai dengan parameter filter.
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
						<tr>
							<th class="py-2.5 px-4 font-semibold font-mono">Kode</th>
							<th class="py-2.5 px-4 font-semibold">Penyewa</th>
							<th class="py-2.5 px-4 font-semibold">Kendaraan</th>
							<th class="py-2.5 px-4 font-semibold font-mono">Periode Sewa</th>
							<th class="py-2.5 px-4 font-semibold">Durasi</th>
							<th class="py-2.5 px-4 font-semibold font-mono text-right">Biaya Pokok</th>
							<th class="py-2.5 px-4 font-semibold font-mono text-right">Biaya Listrik</th>
							<th class="py-2.5 px-4 font-semibold font-mono text-right">Total Biaya</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 font-mono">
						{#each data.reportData as row (row.id)}
							<tr class="hover:bg-slate-50/80 transition">
								<td class="py-2.5 px-4 font-bold text-slate-900">
									{row.garage_code}
									<span class="block text-[10px] text-slate-400 font-sans font-normal capitalize">
										{row.garage_type.replace('_', ' ')}
									</span>
								</td>
								<td class="py-2.5 px-4 font-sans">
									<div class="font-medium text-slate-800">{row.tenant_name}</div>
									<div class="text-[10px] text-slate-400 font-mono">{row.tenant_email}</div>
								</td>
								<td class="py-2.5 px-4 font-sans">
									<div class="text-slate-800">{row.vehicle_brand_model}</div>
									<div class="text-[10px] font-mono text-slate-500">{row.license_plate || 'Bebas Plat'}</div>
								</td>
								<td class="py-2.5 px-4 text-slate-600 text-[11px]">
									{row.start_date} <br />
									<span class="text-slate-400">s/d {row.end_date}</span>
								</td>
								<td class="py-2.5 px-4 font-sans capitalize text-[11px]">
									{row.rental_type} ({row.duration} {row.rental_type === 'harian' ? 'hari' : 'bln'})
								</td>
								<td class="py-2.5 px-4 text-right">Rp {row.base_rental_cost.toLocaleString('id-ID')}</td>
								<td class="py-2.5 px-4 text-right text-blue-700">
									{row.electricity_cost > 0 ? `Rp ${row.electricity_cost.toLocaleString('id-ID')}` : '-'}
								</td>
								<td class="py-2.5 px-4 text-right font-bold text-slate-900">
									Rp {row.total_cost.toLocaleString('id-ID')}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
