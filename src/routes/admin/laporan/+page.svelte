<script lang="ts">
	import type { PageData } from './$types';

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
	<title>Laporan Persewaan Garasi - GARASI.ID</title>
</svelte:head>

<div class="space-y-8 py-4">
	<!-- Page Header -->
	<div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold flex items-center gap-2">
				<span>📊</span> Laporan Persewaan Garasi Kendaraan
			</h1>
			<p class="text-xs text-indigo-200 mt-1">
				Rekapitulasi dan analisis data persewaan garasi berdasarkan bulan, hari, tipe garasi, atau per penyewa.
			</p>
		</div>
		<button
			type="button"
			onclick={() => window.print()}
			class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition flex items-center gap-2"
		>
			<span>🖨️</span> Cetak / Simpan PDF
		</button>
	</div>

	<!-- Mode Filter Tabs -->
	<div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
		<a
			href="/admin/laporan?mode=bulan&year={data.selectedYear}&month={data.selectedMonth}"
			class="px-4 py-2 rounded-xl transition {data.mode === 'bulan' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
		>
			📅 Per Bulan dalam Tahun
		</a>
		<a
			href="/admin/laporan?mode=hari&date={data.selectedDate}"
			class="px-4 py-2 rounded-xl transition {data.mode === 'hari' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
		>
			🗓️ Per Hari dalam Bulan
		</a>
		<a
			href="/admin/laporan?mode=tipe&garageType=all"
			class="px-4 py-2 rounded-xl transition {data.mode === 'tipe' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
		>
			🏷️ Per Tipe Garasi
		</a>
		<a
			href="/admin/laporan?mode=penyewa&tenantId=all"
			class="px-4 py-2 rounded-xl transition {data.mode === 'penyewa' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
		>
			👤 Per Penyewa
		</a>
	</div>

	<!-- Parameter Filter Sub-form -->
	<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
		<form method="GET" action="/admin/laporan" class="flex flex-wrap items-end gap-4 text-xs">
			<input type="hidden" name="mode" value={data.mode} />

			{#if data.mode === 'bulan'}
				<div>
					<label for="month" class="block font-semibold text-slate-700 mb-1">Pilih Bulan</label>
					<select
						id="month"
						name="month"
						value={data.selectedMonth}
						class="px-3 py-2 border border-slate-300 rounded-lg bg-white"
					>
						{#each months as m}
							<option value={m.val}>{m.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="year" class="block font-semibold text-slate-700 mb-1">Pilih Tahun</label>
					<input
						type="number"
						id="year"
						name="year"
						value={data.selectedYear}
						min="2020"
						max="2035"
						class="px-3 py-2 border border-slate-300 rounded-lg w-28 font-mono"
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
						class="px-3 py-2 border border-slate-300 rounded-lg font-mono"
					/>
				</div>
			{:else if data.mode === 'tipe'}
				<div>
					<label for="garageType" class="block font-semibold text-slate-700 mb-1">Filter Tipe Garasi</label>
					<select
						id="garageType"
						name="garageType"
						value={data.selectedType}
						class="px-3 py-2 border border-slate-300 rounded-lg bg-white"
					>
						<option value="all">Semua Tipe Garasi</option>
						<option value="sepeda">Garasi Sepeda & Motor (S)</option>
						<option value="mobil">Garasi Mobil (C)</option>
						<option value="mobil_listrik">Garasi Mobil Listrik (E)</option>
					</select>
				</div>
			{:else if data.mode === 'penyewa'}
				<div>
					<label for="tenantId" class="block font-semibold text-slate-700 mb-1">Pilih Penyewa</label>
					<select
						id="tenantId"
						name="tenantId"
						value={data.selectedTenant}
						class="px-3 py-2 border border-slate-300 rounded-lg bg-white"
					>
						<option value="all">Semua Penyewa</option>
						{#each data.tenantsList as t}
							<option value={t.id}>{t.name} ({t.email})</option>
						{/each}
					</select>
				</div>
			{/if}

			<div>
				<button
					type="submit"
					class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
				>
					Terapkan Filter
				</button>
			</div>
		</form>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Total Transaksi</span>
			<div class="text-2xl font-black text-slate-900 mt-1 font-mono">
				{data.summary.totalTransactions}
			</div>
		</div>
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
			<span class="text-xs text-slate-500 font-medium">Pendapatan Sewa Pokok</span>
			<div class="text-lg font-black text-slate-800 mt-1 font-mono">
				Rp {data.summary.totalBaseCost.toLocaleString('id-ID')}
			</div>
		</div>
		<div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
			<span class="text-xs text-emerald-700 font-medium">Pendapatan Listrik EV</span>
			<div class="text-lg font-black text-emerald-700 mt-1 font-mono">
				Rp {data.summary.totalElectricityCost.toLocaleString('id-ID')}
			</div>
		</div>
		<div class="bg-indigo-900 text-white p-5 rounded-2xl shadow-md">
			<span class="text-xs text-indigo-300 font-medium">Grand Total Omset</span>
			<div class="text-xl font-black text-amber-300 mt-1 font-mono">
				Rp {data.summary.grandTotal.toLocaleString('id-ID')}
			</div>
		</div>
	</div>

	<!-- Data Table -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
		<div class="p-6 border-b border-slate-100 flex items-center justify-between">
			<h2 class="text-base font-bold text-slate-800">
				Detail Data Persewaan ({data.reportData.length} Data)
			</h2>
		</div>

		{#if data.reportData.length === 0}
			<div class="p-12 text-center text-slate-500 text-xs">
				Tidak ada transaksi persewaan pada kriteria filter ini.
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
						<tr>
							<th class="py-3 px-4">Garasi</th>
							<th class="py-3 px-4">Penyewa</th>
							<th class="py-3 px-4">Kendaraan</th>
							<th class="py-3 px-4">Periode</th>
							<th class="py-3 px-4">Tipe Sewa</th>
							<th class="py-3 px-4">Biaya Pokok</th>
							<th class="py-3 px-4">Biaya Listrik</th>
							<th class="py-3 px-4">Total Biaya</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.reportData as row (row.id)}
							<tr class="hover:bg-slate-50 transition">
								<td class="py-3 px-4 font-mono font-bold text-slate-900">
									{row.garage_code}
									<span class="block text-[10px] text-slate-400 capitalize font-sans font-normal">
										{row.garage_type.replace('_', ' ')}
									</span>
								</td>
								<td class="py-3 px-4">
									<div class="font-semibold text-slate-800">{row.tenant_name}</div>
									<div class="text-[10px] text-slate-400">{row.tenant_email}</div>
								</td>
								<td class="py-3 px-4">
									<div class="text-slate-800">{row.vehicle_brand_model}</div>
									<div class="text-[10px] font-mono text-slate-500">{row.license_plate || 'Tanpa Plat'}</div>
								</td>
								<td class="py-3 px-4 font-mono text-slate-600">
									{row.start_date} <br />
									<span class="text-slate-400">s/d {row.end_date}</span>
								</td>
								<td class="py-3 px-4 capitalize">
									{row.rental_type} ({row.duration} {row.rental_type === 'harian' ? 'hari' : 'bln'})
								</td>
								<td class="py-3 px-4 font-mono">Rp {row.base_rental_cost.toLocaleString('id-ID')}</td>
								<td class="py-3 px-4 font-mono text-emerald-700">
									{row.electricity_cost > 0 ? `Rp ${row.electricity_cost.toLocaleString('id-ID')}` : '-'}
								</td>
								<td class="py-3 px-4 font-mono font-bold text-indigo-700">
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
