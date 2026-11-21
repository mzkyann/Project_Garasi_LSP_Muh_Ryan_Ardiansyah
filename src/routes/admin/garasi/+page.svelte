<!-- src/routes/admin/garasi/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

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
	<title>Kelola Garasi - SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header -->
	<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
				<Icon name="building" size={14} class="text-blue-600" />
				<span>Panel Administrasi</span>
			</div>
			<h1 class="text-lg font-bold text-slate-900 mt-1">Manajemen & Pembuatan Unit Garasi Berkelompok</h1>
			<p class="text-xs text-slate-500 mt-0.5">
				Pembuatan massal unit garasi baru dengan penomoran otomatis bertahap: S (Sepeda), C (Mobil), dan E (Mobil Listrik).
			</p>
		</div>
	</div>

	{#if form?.success}
		<div class="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-medium flex items-center gap-2">
			<Icon name="check" size={15} class="text-emerald-600" />
			<span>{form.message}</span>
		</div>
	{:else if form?.error}
		<div class="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-medium flex items-center gap-2">
			<Icon name="alert" size={15} class="text-rose-600" />
			<span>{form.error}</span>
		</div>
	{/if}

	<!-- Form Batch Creation -->
	<div class="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
		<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-2">
			<Icon name="plus" size={14} class="text-slate-500" />
			<span>Formulir Batch Generation Garasi Baru</span>
		</h2>

		<form method="POST" action="?/createBatchGarages" class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div>
					<label for="type" class="block text-xs font-semibold text-slate-700 mb-1">
						Tipe Garasi <span class="text-rose-600">*</span>
					</label>
					<select
						id="type"
						name="type"
						bind:value={selectedType}
						class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 bg-white"
					>
						<option value="sepeda">Garasi Sepeda & Motor (Kode S)</option>
						<option value="mobil">Garasi Mobil (Kode C)</option>
						<option value="mobil_listrik">Garasi Mobil Listrik (Kode E)</option>
					</select>
					<span class="text-[11px] text-slate-400 mt-1 block">
						Total terdaftar: {data.sequences[selectedType]} unit
					</span>
				</div>

				<div>
					<label for="count" class="block text-xs font-semibold text-slate-700 mb-1">
						Jumlah Garasi Dibuat <span class="text-rose-600">*(Maks 999)</span>
					</label>
					<input
						type="number"
						id="count"
						name="count"
						bind:value={garageCount}
						min="1"
						max="999"
						required
						class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 font-mono"
					/>
				</div>

				<div>
					<label for="dailyPrice" class="block text-xs font-semibold text-slate-700 mb-1">
						Tarif Sewa Harian (Rp) <span class="text-rose-600">*</span>
					</label>
					<input
						type="number"
						id="dailyPrice"
						name="dailyPrice"
						bind:value={dailyPrice}
						min="1000"
						step="1000"
						required
						class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 font-mono"
					/>
					<span class="text-[11px] text-slate-500 mt-1 block font-mono">
						Bulanan: Rp {(dailyPrice * 25).toLocaleString('id-ID')} (25x)
					</span>
				</div>

				{#if selectedType === 'mobil_listrik'}
					<div class="bg-blue-50/60 border border-blue-200 p-2.5 rounded">
						<label for="electricityPrice" class="block text-xs font-bold text-blue-900 mb-1">
							Tarif Listrik / kWh (Rp) <span class="text-rose-600">*</span>
						</label>
						<input
							type="number"
							id="electricityPrice"
							name="electricityPrice"
							bind:value={electricityPrice}
							min="0"
							step="100"
							required
							class="w-full px-3 py-1.5 text-xs border border-blue-300 rounded bg-white font-mono"
						/>
					</div>
				{/if}
			</div>

			<div class="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
				<div>
					<span class="text-slate-500">Estimasi Kode Unit Dihasilkan:</span>
					<span class="ml-2 font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
						{nextCodePreview}
					</span>
				</div>
				<button
					type="submit"
					class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs transition flex items-center gap-1.5 shadow-xs"
				>
					<Icon name="plus" size={13} />
					<span>Generate & Simpan Garasi</span>
				</button>
			</div>
		</form>
	</div>

	<!-- Tabel Seluruh Garasi -->
	<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
		<div class="p-4 border-b border-slate-100 flex items-center justify-between">
			<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
				Daftar Seluruh Unit Garasi ({data.garages.length} Unit)
			</h2>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
					<tr>
						<th class="py-2.5 px-4 font-semibold">Kode Unit</th>
						<th class="py-2.5 px-4 font-semibold">Kategori Garasi</th>
						<th class="py-2.5 px-4 font-semibold text-right">Tarif Harian</th>
						<th class="py-2.5 px-4 font-semibold text-right">Tarif Bulanan (25x)</th>
						<th class="py-2.5 px-4 font-semibold text-right">Tarif Listrik / kWh</th>
						<th class="py-2.5 px-4 font-semibold">Status Operasional</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 font-mono">
					{#each data.garages as garage (garage.id)}
						<tr class="hover:bg-slate-50/80 transition">
							<td class="py-2.5 px-4 font-bold text-slate-900">{garage.code}</td>
							<td class="py-2.5 px-4 font-sans capitalize">
								<span class="px-2 py-0.5 rounded text-[11px] font-medium {garage.type === 'mobil_listrik' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
									{garage.type.replace('_', ' ')}
								</span>
							</td>
							<td class="py-2.5 px-4 text-right">Rp {garage.daily_price.toLocaleString('id-ID')}</td>
							<td class="py-2.5 px-4 text-right text-slate-700">Rp {(garage.daily_price * 25).toLocaleString('id-ID')}</td>
							<td class="py-2.5 px-4 text-right text-blue-700">
								{garage.type === 'mobil_listrik' ? `Rp ${garage.electricity_price_kwh.toLocaleString('id-ID')}` : '-'}
							</td>
							<td class="py-2.5 px-4 font-sans">
								<span class="px-2 py-0.5 rounded text-[10px] font-medium uppercase {garage.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
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
