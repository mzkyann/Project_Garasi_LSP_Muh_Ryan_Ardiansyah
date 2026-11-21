<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let garageCount = $state<number>(5);
	let dailyPrice = $state<number>(50000);
	let electricityPrice = $state<number>(2500);

	// Preview kode yang akan dihasilkan
	let nextCodePreview = $derived.by(() => {
		const currentCount = data.sequences[selectedType] || 0;
		const nextStart = currentCount + 1;
		const nextEnd = nextStart + Math.max(1, garageCount || 1) - 1;
		const prefix = selectedType === 'sepeda' ? 'S' : selectedType === 'mobil' ? 'C' : 'E';

		const startStr = `${prefix}${String(nextStart).padStart(3, '0')}`;
		const endStr = `${prefix}${String(nextEnd).padStart(3, '0')}`;

		return garageCount === 1 ? startStr : `${startStr} s/d ${endStr}`;
	});
</script>

<svelte:head>
	<title>Kelola & Buat Garasi Berkelompok - GARASI.ID</title>
</svelte:head>

<div class="space-y-8 py-4">
	<!-- Page Header -->
	<div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
		<h1 class="text-2xl font-bold flex items-center gap-2">
			<span>🏗️</span> Manajemen & Pembuatan Garasi Berkelompok (Batch)
		</h1>
		<p class="text-xs text-indigo-200 mt-1">
			Buat sejumlah garasi secara otomatis dengan format kode incremental standar: S001 (Sepeda), C001 (Mobil), dan E001 (Mobil Listrik).
		</p>
	</div>

	{#if form?.success}
		<div class="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
			<span>✓</span> {form.message}
		</div>
	{:else if form?.error}
		<div class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
			<span>⚠️</span> {form.error}
		</div>
	{/if}

	<!-- Form Buat Garasi Berkelompok -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
		<h2 class="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
			<span>➕</span> Formulir Pembuatan Garasi Baru Secara Berkelompok
		</h2>

		<form method="POST" action="?/createBatchGarages" class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Tipe Garasi -->
				<div>
					<label for="type" class="block text-xs font-semibold text-slate-700 mb-1">
						Tipe Garasi <span class="text-rose-500">*</span>
					</label>
					<select
						id="type"
						name="type"
						bind:value={selectedType}
						class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
					>
						<option value="sepeda">Garasi Sepeda (Kode S)</option>
						<option value="mobil">Garasi Mobil (Kode C)</option>
						<option value="mobil_listrik">Garasi Mobil Listrik (Kode E)</option>
					</select>
					<p class="text-[11px] text-slate-400 mt-1">
						Total saat ini: {data.sequences[selectedType]} unit
					</p>
				</div>

				<!-- Jumlah Garasi -->
				<div>
					<label for="count" class="block text-xs font-semibold text-slate-700 mb-1">
						Jumlah Garasi Dibuat <span class="text-rose-500">*Maks 999</span>
					</label>
					<input
						type="number"
						id="count"
						name="count"
						bind:value={garageCount}
						min="1"
						max="999"
						required
						class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
					/>
				</div>

				<!-- Harga Sewa Harian -->
				<div>
					<label for="dailyPrice" class="block text-xs font-semibold text-slate-700 mb-1">
						Harga Sewa Harian (Rp) <span class="text-rose-500">*</span>
					</label>
					<input
						type="number"
						id="dailyPrice"
						name="dailyPrice"
						bind:value={dailyPrice}
						min="1000"
						step="1000"
						required
						class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
					/>
					<p class="text-[11px] text-indigo-600 mt-1">
						Bulanan: Rp {(dailyPrice * 25).toLocaleString('id-ID')} (25 x harian)
					</p>
				</div>

				<!-- Harga Listrik per KWH (khusus mobil listrik) -->
				{#if selectedType === 'mobil_listrik'}
					<div class="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
						<label for="electricityPrice" class="block text-xs font-bold text-emerald-900 mb-1">
							Harga Listrik per kWh (Rp) <span class="text-rose-500">*</span>
						</label>
						<input
							type="number"
							id="electricityPrice"
							name="electricityPrice"
							bind:value={electricityPrice}
							min="0"
							step="100"
							required
							class="w-full px-3 py-1.5 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
						/>
					</div>
				{/if}
			</div>

			<!-- Preview Info -->
			<div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
				<div>
					<span class="text-slate-500">Preview Kode Otomatis:</span>
					<span class="ml-2 font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
						{nextCodePreview}
					</span>
				</div>
				<button
					type="submit"
					class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition shadow"
				>
					Generate & Simpan Garasi
				</button>
			</div>
		</form>
	</div>

	<!-- Tabel Seluruh Garasi -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
		<div class="p-6 border-b border-slate-100 flex items-center justify-between">
			<h2 class="text-base font-bold text-slate-800">
				Daftar Seluruh Garasi ({data.garages.length} Unit)
			</h2>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
					<tr>
						<th class="py-3 px-4">Kode</th>
						<th class="py-3 px-4">Tipe Garasi</th>
						<th class="py-3 px-4">Tarif Harian</th>
						<th class="py-3 px-4">Tarif Bulanan (25x)</th>
						<th class="py-3 px-4">Tarif Listrik / kWh</th>
						<th class="py-3 px-4">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.garages as garage (garage.id)}
						<tr class="hover:bg-slate-50 transition">
							<td class="py-3 px-4 font-mono font-black text-slate-900">{garage.code}</td>
							<td class="py-3 px-4 capitalize">
								<span class="px-2 py-0.5 rounded text-[11px] font-semibold {garage.type === 'mobil_listrik' ? 'bg-emerald-100 text-emerald-800' : garage.type === 'mobil' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}">
									{garage.type.replace('_', ' ')}
								</span>
							</td>
							<td class="py-3 px-4 font-mono">Rp {garage.daily_price.toLocaleString('id-ID')}</td>
							<td class="py-3 px-4 font-mono text-indigo-700">Rp {(garage.daily_price * 25).toLocaleString('id-ID')}</td>
							<td class="py-3 px-4 font-mono text-emerald-700">
								{garage.type === 'mobil_listrik' ? `Rp ${garage.electricity_price_kwh.toLocaleString('id-ID')}` : '-'}
							</td>
							<td class="py-3 px-4">
								<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase {garage.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
									{garage.status === 'available' ? 'Tersedia' : 'Terpakai (Used)'}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
