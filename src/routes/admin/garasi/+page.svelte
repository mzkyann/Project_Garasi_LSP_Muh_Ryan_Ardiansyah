<!-- src/routes/admin/garasi/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let garageCount = $state<number>(5);
	let dailyPrice = $state<number>(50000);
	let electricityPrice = $state<number>(2500);

	// Preview kode yang akan dihasilkan secara berurutan
	let nextCodePreview = $derived.by(() => {
		const currentCount = data.sequences[selectedType] || 0;
		const nextStart = currentCount + 1;
		const nextEnd = nextStart + Math.max(1, garageCount || 1) - 1;
		const prefix = selectedType === 'sepeda' ? 'S' : selectedType === 'mobil' ? 'C' : 'E';

		const startStr = `${prefix}${String(nextStart).padStart(3, '0')}`;
		const endStr = `${prefix}${String(nextEnd).padStart(3, '0')}`;

		return garageCount === 1 ? startStr : `${startStr} s/d ${endStr}`;
	});

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:head>
	<title>Kelola Garasi - SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header with Earthy Palette -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="building" size={14} />
				<span>Panel Administrasi</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Manajemen & Batch Generation Unit Garasi</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Pembuatan unit garasi berkelompok dengan penomoran otomatis terurut: S (Sepeda), C (Mobil), dan E (Mobil Listrik).
			</p>
		</div>
	</div>

	{#if form?.success}
		<div class="p-4 bg-[#EFF3ED] border border-[#C2CCBC] text-[#2E382A] rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="check" size={16} class="text-[#71856A]" />
			<span>{form.message}</span>
		</div>
	{:else if form?.error}
		<div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="alert" size={16} class="text-rose-600" />
			<span>{form.error}</span>
		</div>
	{/if}

	<!-- Form Batch Creation with Earthy Palette -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs p-6 space-y-5 card-hover">
		<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider border-b border-[#F4EFE7] pb-3 flex items-center gap-2">
			<Icon name="plus" size={15} class="text-[#71856A]" />
			<span>Formulir Batch Generation Garasi Baru</span>
		</h2>

		<form method="POST" action="?/createBatchGarages" class="space-y-5">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div>
					<label for="type" class="block text-xs font-bold text-[#4F4532] mb-1.5">
						Tipe Garasi <span class="text-rose-600">*</span>
					</label>
					<select
						id="type"
						name="type"
						bind:value={selectedType}
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
					>
						<option value="sepeda">Garasi Sepeda & Motor (Kode S)</option>
						<option value="mobil">Garasi Mobil (Kode C)</option>
						<option value="mobil_listrik">Garasi Mobil Listrik (Kode E)</option>
					</select>
					<span class="text-[11px] text-[#A08F6E] mt-1 block font-mono">
						Terdaftar saat ini: {data.sequences[selectedType]} unit
					</span>
				</div>

				<div>
					<label for="count" class="block text-xs font-bold text-[#4F4532] mb-1.5">
						Jumlah Garasi Dibuat <span class="text-rose-600">*(1-999)</span>
					</label>
					<input
						type="number"
						id="count"
						name="count"
						bind:value={garageCount}
						min="1"
						max="999"
						required
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
					/>
				</div>

				<div>
					<label for="dailyPrice" class="block text-xs font-bold text-[#4F4532] mb-1.5">
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
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
					/>
					<span class="text-[11px] text-[#71856A] mt-1 block font-mono">
						Tarif Bulanan (25x): {formatRupiah(dailyPrice * 25)}
					</span>
				</div>

				{#if selectedType === 'mobil_listrik'}
					<div class="bg-[#EFF3ED] border border-[#C2CCBC] p-3 rounded-xl space-y-1">
						<label for="electricityPrice" class="block text-xs font-bold text-[#2E382A]">
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
							class="w-full px-3 py-1.5 text-xs border border-[#71856A] rounded-lg bg-white font-mono font-bold text-[#2E382A]"
						/>
						<span class="text-[10px] text-[#596A53] block">Standar SPKLU: Rp 2.500 / kWh</span>
					</div>
				{/if}
			</div>

			<div class="bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
				<div>
					<span class="text-[#877758] font-medium">Estimasi Kode Unit yang Dihasilkan:</span>
					<span class="ml-2 font-mono font-extrabold text-[#383123] bg-white px-3 py-1 rounded-md border border-[#DFD5C2] shadow-xs">
						{nextCodePreview}
					</span>
				</div>
				<button
					type="submit"
					class="px-5 py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-2 btn-interactive"
				>
					<Icon name="plus" size={14} />
					<span>Generate & Simpan Garasi</span>
				</button>
			</div>
		</form>
	</div>

	<!-- Tabel Seluruh Garasi -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] flex items-center justify-between bg-[#FAF8F4]">
			<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
				Daftar Seluruh Unit Garasi ({data.garages.length} Unit)
			</h2>
			<span class="text-xs text-[#877758] font-mono">Status & Tarif Realistis</span>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
					<tr>
						<th class="py-3 px-4">Kode Unit</th>
						<th class="py-3 px-4">Kategori Garasi</th>
						<th class="py-3 px-4 text-right">Tarif Harian</th>
						<th class="py-3 px-4 text-right">Tarif Bulanan (25x)</th>
						<th class="py-3 px-4 text-right">Tarif Listrik / kWh</th>
						<th class="py-3 px-4">Status Operasional</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-[#F4EFE7] font-mono">
					{#each data.garages as garage (garage.id)}
						<tr class="hover:bg-[#FAF8F4] transition">
							<td class="py-3 px-4 font-bold text-[#383123]">{garage.code}</td>
							<td class="py-3 px-4 font-sans capitalize">
								<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold {garage.type === 'mobil_listrik' ? 'bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]' : 'bg-[#FAF8F4] text-[#6B5E45] border border-[#DFD5C2]'}">
									{garage.type.replace('_', ' ')}
								</span>
							</td>
							<td class="py-3 px-4 text-right font-semibold text-[#383123]">{formatRupiah(garage.daily_price)}</td>
							<td class="py-3 px-4 text-right font-semibold text-[#71856A]">{formatRupiah(garage.daily_price * 25)}</td>
							<td class="py-3 px-4 text-right font-semibold text-[#596A53]">
								{garage.type === 'mobil_listrik' ? `${formatRupiah(garage.electricity_price_kwh)}` : '-'}
							</td>
							<td class="py-3 px-4 font-sans">
								<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase {garage.status === 'available' ? 'bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]' : 'bg-[#FDFBF7] text-[#8A7545] border border-[#DAC99B]'}">
									{garage.status === 'available' ? '● Tersedia' : '▲ Terpakai (Used)'}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>