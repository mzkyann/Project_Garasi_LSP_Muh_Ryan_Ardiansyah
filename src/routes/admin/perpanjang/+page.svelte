<!-- src/routes/admin/perpanjang/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedRentalId = $state<number | null>(null);

	$effect(() => {
		if (selectedRentalId === null && data.activeRentedGarages.length > 0) {
			selectedRentalId = data.activeRentedGarages[0].rental_id;
		}
	});

	let selectedRental = $derived(
		data.activeRentedGarages.find((r: any) => r.rental_id === selectedRentalId) ?? null
	);

	let newEndDate = $state<string>('');

	// Saat garasi yang dipilih berganti, inisialisasi default tanggal selesai baru (+3 hari dari tanggal selesai lama)
	$effect(() => {
		if (selectedRental) {
			const currentEnd = new Date(selectedRental.end_date);
			const defaultNewEnd = new Date(currentEnd);
			defaultNewEnd.setDate(defaultNewEnd.getDate() + 3);
			newEndDate = defaultNewEnd.toISOString().split('T')[0];
		} else {
			newEndDate = '';
		}
	});

	// Hitung selisih hari & sisa biaya secara real-time
	let calculation = $derived.by(() => {
		if (!selectedRental || !newEndDate) {
			return { additionalDays: 0, additionalCost: 0, isValid: false, error: '' };
		}

		const oldDate = new Date(selectedRental.end_date);
		const newDate = new Date(newEndDate);

		if (isNaN(newDate.getTime())) {
			return { additionalDays: 0, additionalCost: 0, isValid: false, error: 'Format tanggal tidak valid' };
		}

		const diffTime = newDate.getTime() - oldDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays <= 0) {
			return {
				additionalDays: diffDays,
				additionalCost: 0,
				isValid: false,
				error: 'Tanggal baru harus lebih besar daripada tanggal selesai saat ini'
			};
		}

		const cost = diffDays * selectedRental.garage_daily_price;

		return {
			additionalDays: diffDays,
			additionalCost: cost,
			isValid: true,
			error: ''
		};
	});
</script>

<svelte:head>
	<title>Perpanjang Masa Sewa - SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header -->
	<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
				<Icon name="clock" size={14} class="text-blue-600" />
				<span>Panel Administrasi</span>
			</div>
			<h1 class="text-lg font-bold text-slate-900 mt-1">Perpanjangan Status Sewa Garasi Aktif</h1>
			<p class="text-xs text-slate-500 mt-0.5">
				Pilih unit garasi yang sedang aktif disewa hari ini, ubah tanggal selesai sewa, dan konfirmasi bukti pelunasan biaya tambahan.
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

	{#if data.activeRentedGarages.length === 0}
		<div class="bg-white rounded-lg p-10 text-center border border-slate-200 space-y-2">
			<div class="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
				<Icon name="building" size={20} />
			</div>
			<h2 class="text-sm font-bold text-slate-800">Tidak Ada Garasi yang Sedang Disewa Hari Ini</h2>
			<p class="text-xs text-slate-500 max-w-sm mx-auto">
				Semua unit garasi berstatus tersedia atau tidak ada kontrak transaksi sewa yang sedang aktif.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
			<!-- Kolom Kiri: Garasi Sedang Disewa -->
			<div class="lg:col-span-1 bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
				<div class="border-b border-slate-100 pb-2 flex items-center justify-between">
					<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
						Unit Garasi Aktif
					</h2>
					<span class="text-xs font-mono font-semibold text-slate-500">
						{data.activeRentedGarages.length} Unit
					</span>
				</div>

				<div class="space-y-2 max-h-[480px] overflow-y-auto pr-1">
					{#each data.activeRentedGarages as r (r.rental_id)}
						<button
							type="button"
							onclick={() => (selectedRentalId = r.rental_id)}
							class="w-full text-left p-3 rounded border transition flex items-center justify-between {selectedRentalId === r.rental_id ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-slate-300 bg-white'}"
						>
							<div>
								<div class="flex items-center gap-2">
									<span class="font-mono font-bold text-slate-900 text-xs">{r.garage_code}</span>
									<span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
										{r.garage_type.replace('_', ' ')}
									</span>
								</div>
								<div class="text-xs font-medium text-slate-800 mt-1">{r.tenant_name}</div>
								<div class="text-[11px] text-slate-500">{r.vehicle_brand_model}</div>
							</div>
							<div class="text-right text-xs font-mono">
								<span class="text-slate-400 block text-[10px] font-sans">Selesai:</span>
								<span class="font-semibold text-slate-800">{r.end_date}</span>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Kolom Kanan: Form Perpanjang & Kalkulasi -->
			<div class="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-5">
				{#if selectedRental}
					<div>
						<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
							Perpanjangan Kontrak Garasi {selectedRental.garage_code}
						</h2>
						<p class="text-xs text-slate-500 mt-0.5">
							Penyewa: <strong class="text-slate-700">{selectedRental.tenant_name}</strong> ({selectedRental.tenant_phone}) • Kendaraan: {selectedRental.vehicle_brand_model}
						</p>
					</div>

					<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded text-xs border border-slate-200 font-mono">
						<div>
							<span class="text-slate-400 block font-sans text-[11px]">Tanggal Mulai</span>
							<span class="font-semibold text-slate-800">{selectedRental.start_date}</span>
						</div>
						<div>
							<span class="text-slate-400 block font-sans text-[11px]">Tanggal Selesai Saat Ini</span>
							<span class="font-bold text-slate-900">{selectedRental.end_date}</span>
						</div>
						<div>
							<span class="text-slate-400 block font-sans text-[11px]">Tarif Harian Garasi</span>
							<span class="font-semibold text-slate-800">Rp {selectedRental.garage_daily_price.toLocaleString('id-ID')} / hari</span>
						</div>
					</div>

					<form method="POST" action="?/extendRental" enctype="multipart/form-data" class="space-y-4">
						<input type="hidden" name="rentalId" value={selectedRental.rental_id} />

						<div>
							<label for="newEndDate" class="block text-xs font-semibold text-slate-700 mb-1">
								Tanggal Selesai Sewa Baru <span class="text-rose-600">*Harus melebihi {selectedRental.end_date}</span>
							</label>
							<input
								type="date"
								id="newEndDate"
								name="newEndDate"
								bind:value={newEndDate}
								min={selectedRental.end_date}
								required
								class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 font-mono"
							/>
							{#if calculation.error}
								<p class="text-xs text-rose-600 mt-1 font-medium">{calculation.error}</p>
							{/if}
						</div>

						<!-- Box Kalkulasi Sisa Biaya -->
						<div class="bg-slate-50 border border-slate-200 rounded p-4 space-y-2 text-xs">
							<div class="text-slate-600 font-semibold border-b border-slate-200 pb-1.5">
								Kalkulasi Tambahan Biaya Perpanjangan
							</div>
							<div class="flex justify-between">
								<span class="text-slate-500">Tambahan Hari Sewa:</span>
								<span class="font-mono font-medium text-slate-800">
									{calculation.additionalDays > 0 ? `+${calculation.additionalDays} Hari` : '0 Hari'}
								</span>
							</div>
							<div class="flex justify-between">
								<span class="text-slate-500">Tarif per Hari:</span>
								<span class="font-mono font-medium text-slate-800">
									Rp {selectedRental.garage_daily_price.toLocaleString('id-ID')}
								</span>
							</div>
							<div class="flex justify-between text-sm font-bold border-t border-slate-200 pt-2 text-slate-900">
								<span>Sisa Biaya yang Harus Dibayar:</span>
								<span class="font-mono text-blue-700">
									Rp {calculation.additionalCost.toLocaleString('id-ID')}
								</span>
							</div>
						</div>

						<div>
							<label for="paymentProof" class="block text-xs font-semibold text-slate-700 mb-1">
								Dokumen Bukti Pelunasan Perpanjangan <span class="text-rose-600">*</span>
							</label>
							<input
								type="file"
								id="paymentProof"
								name="paymentProof"
								accept="image/*"
								class="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 rounded p-1"
							/>
						</div>

						<div class="pt-2">
							<button
								type="submit"
								disabled={!calculation.isValid}
								class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded text-xs transition shadow-xs flex items-center justify-center gap-1.5"
							>
								<Icon name="check" size={14} />
								<span>Konfirmasi dan Simpan Perpanjangan</span>
							</button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Tabel Riwayat Perpanjangan -->
	{#if data.extensionHistory.length > 0}
		<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
			<div class="p-4 border-b border-slate-100">
				<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
					Riwayat Transaksi Perpanjangan Sewa Sebelumnya
				</h2>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
						<tr>
							<th class="py-2.5 px-4 font-semibold">Unit Garasi</th>
							<th class="py-2.5 px-4 font-semibold">Nama Penyewa</th>
							<th class="py-2.5 px-4 font-semibold font-mono">Tanggal Lama</th>
							<th class="py-2.5 px-4 font-semibold font-mono">Tanggal Baru</th>
							<th class="py-2.5 px-4 font-semibold font-mono text-center">Tambahan Hari</th>
							<th class="py-2.5 px-4 font-semibold font-mono text-right">Biaya Tambahan</th>
							<th class="py-2.5 px-4 font-semibold font-mono">Tanggal Proses</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 font-mono">
						{#each data.extensionHistory as ext (ext.id)}
							<tr class="hover:bg-slate-50/80 transition">
								<td class="py-2.5 px-4 font-bold text-slate-900">{ext.garage_code}</td>
								<td class="py-2.5 px-4 font-sans font-medium text-slate-800">{ext.tenant_name}</td>
								<td class="py-2.5 px-4 text-slate-500">{ext.old_end_date}</td>
								<td class="py-2.5 px-4 font-bold text-blue-700">{ext.new_end_date}</td>
								<td class="py-2.5 px-4 text-center">+{ext.additional_days} hari</td>
								<td class="py-2.5 px-4 text-right font-bold text-slate-900">Rp {ext.additional_cost.toLocaleString('id-ID')}</td>
								<td class="py-2.5 px-4 text-slate-400">{ext.created_at.split('T')[0]}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
