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

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:head>
	<title>Perpanjang Masa Sewa - SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header with Earthy Palette -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="clock" size={14} />
				<span>Panel Administrasi</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Perpanjangan Kontrak Sewa Garasi Aktif</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Pilih unit garasi yang sedang aktif disewa, perbarui tanggal selesai sewa, dan konfirmasi bukti pelunasan biaya tambahan.
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

	{#if data.activeRentedGarages.length === 0}
		<div class="bg-white rounded-xl p-12 text-center border border-[#DFD5C2] space-y-3 shadow-xs">
			<div class="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#877758] flex items-center justify-center mx-auto border border-[#DFD5C2]">
				<Icon name="building" size={24} />
			</div>
			<h2 class="text-base font-bold text-[#383123]">Tidak Ada Garasi yang Sedang Aktif Disewa</h2>
			<p class="text-xs text-[#6B5E45] max-w-sm mx-auto leading-relaxed">
				Seluruh unit garasi berstatus tersedia atau tidak ada kontrak transaksi sewa yang sedang berjalan.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Kolom Kiri: Garasi Sedang Disewa -->
			<div class="lg:col-span-1 bg-white rounded-xl border border-[#DFD5C2] shadow-xs p-5 space-y-4 card-hover">
				<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
						Unit Garasi Aktif
					</h2>
					<span class="text-xs font-mono font-bold text-[#71856A] bg-[#EFF3ED] px-2 py-0.5 rounded border border-[#DFE5DC]">
						{data.activeRentedGarages.length} Unit
					</span>
				</div>

				<div class="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
					{#each data.activeRentedGarages as r (r.rental_id)}
						<button
							type="button"
							onclick={() => (selectedRentalId = r.rental_id)}
							class="w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between btn-interactive {selectedRentalId === r.rental_id ? 'border-[#71856A] bg-[#EFF3ED] ring-2 ring-[#71856A] shadow-xs' : 'border-[#DFD5C2] hover:border-[#BEB092] bg-[#FAF8F4]'}"
						>
							<div>
								<div class="flex items-center gap-2">
									<span class="font-mono font-extrabold text-[#383123] text-sm">{r.garage_code}</span>
									<span class="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-white text-[#4F4532] border border-[#DFE5DC]">
										{r.garage_type.replace('_', ' ')}
									</span>
								</div>
								<div class="text-xs font-bold text-[#383123] mt-1.5">{r.tenant_name}</div>
								<div class="text-[11px] text-[#6B5E45]">{r.vehicle_brand_model}</div>
							</div>
							<div class="text-right text-xs font-mono">
								<span class="text-[#877758] block text-[10px] font-sans">Selesai:</span>
								<span class="font-bold text-[#383123]">{r.end_date}</span>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Kolom Kanan: Form Perpanjang & Kalkulasi -->
			<div class="lg:col-span-2 bg-white rounded-xl border border-[#DFD5C2] shadow-xs p-6 space-y-5 card-hover">
				{#if selectedRental}
					<div class="border-b border-[#F4EFE7] pb-3">
						<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
							<Icon name="clock" size={14} class="text-[#71856A]" />
							<span>Perpanjangan Kontrak Garasi {selectedRental.garage_code}</span>
						</h2>
						<p class="text-xs text-[#6B5E45] mt-1">
							Penyewa: <strong class="text-[#383123]">{selectedRental.tenant_name}</strong> ({selectedRental.tenant_phone}) • Kendaraan: {selectedRental.vehicle_brand_model}
						</p>
					</div>

					<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#FAF8F4] p-4 rounded-xl text-xs border border-[#DFD5C2] font-mono">
						<div>
							<span class="text-[#877758] block font-sans text-[11px]">Tanggal Mulai</span>
							<span class="font-bold text-[#383123]">{selectedRental.start_date}</span>
						</div>
						<div>
							<span class="text-[#877758] block font-sans text-[11px]">Selesai Saat Ini</span>
							<span class="font-extrabold text-[#383123]">{selectedRental.end_date}</span>
						</div>
						<div>
							<span class="text-[#877758] block font-sans text-[11px]">Tarif Harian Garasi</span>
							<span class="font-bold text-[#71856A]">{formatRupiah(selectedRental.garage_daily_price)} / hari</span>
						</div>
					</div>

					<form method="POST" action="?/extendRental" enctype="multipart/form-data" class="space-y-4">
						<input type="hidden" name="rentalId" value={selectedRental.rental_id} />

						<div>
							<label for="newEndDate" class="block text-xs font-bold text-[#4F4532] mb-1">
								Tanggal Selesai Baru <span class="text-rose-600">*Harus melebihi {selectedRental.end_date}</span>
							</label>
							<input
								type="date"
								id="newEndDate"
								name="newEndDate"
								bind:value={newEndDate}
								min={selectedRental.end_date}
								required
								class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
							/>
							{#if calculation.error}
								<p class="text-xs text-rose-600 mt-1 font-semibold">{calculation.error}</p>
							{/if}
						</div>

						<!-- Box Kalkulasi Sisa Biaya -->
						<div class="bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl p-5 space-y-2.5 text-xs shadow-xs">
							<div class="text-[#4F4532] font-bold border-b border-[#EAE3D4] pb-2 flex items-center justify-between">
								<span>Kalkulasi Tambahan Biaya Perpanjangan</span>
								<span class="text-[10px] text-[#71856A] uppercase font-mono">System Calculation</span>
							</div>
							<div class="flex justify-between text-[#6B5E45]">
								<span>Tambahan Hari Sewa:</span>
								<span class="font-mono font-bold text-[#383123]">
									{calculation.additionalDays > 0 ? `+${calculation.additionalDays} Hari` : '0 Hari'}
								</span>
							</div>
							<div class="flex justify-between text-[#6B5E45]">
								<span>Tarif per Hari:</span>
								<span class="font-mono font-bold text-[#383123]">
									{formatRupiah(selectedRental.garage_daily_price)}
								</span>
							</div>
							<div class="flex justify-between text-base font-extrabold border-t-2 border-[#DFD5C2] pt-3 text-[#383123]">
								<span>Sisa Biaya Tambahan:</span>
								<span class="font-mono text-[#596A53]">
									{formatRupiah(calculation.additionalCost)}
								</span>
							</div>
						</div>

						<div>
							<label for="paymentProof" class="block text-xs font-bold text-[#4F4532] mb-1.5">
								Dokumen Bukti Pelunasan Perpanjangan <span class="text-rose-600">*</span>
							</label>
							<input
								type="file"
								id="paymentProof"
								name="paymentProof"
								accept="image/*"
								class="w-full text-xs text-[#4F4532] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#EFF3ED] file:text-[#2E382A] hover:file:bg-[#DFE5DC] border border-[#DFD5C2] rounded-xl p-1.5 bg-[#FAF8F4]"
							/>
						</div>

						<div class="pt-2">
							<button
								type="submit"
								disabled={!calculation.isValid}
								class="w-full py-3 bg-[#71856A] hover:bg-[#596A53] disabled:bg-[#BEB092] disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 btn-interactive"
							>
								<Icon name="check" size={16} />
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
		<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
			<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4]">
				<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
					Riwayat Transaksi Perpanjangan Sewa Sebelumnya
				</h2>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
						<tr>
							<th class="py-3 px-4">Unit Garasi</th>
							<th class="py-3 px-4">Nama Penyewa</th>
							<th class="py-3 px-4 font-mono">Tanggal Lama</th>
							<th class="py-3 px-4 font-mono">Tanggal Baru</th>
							<th class="py-3 px-4 font-mono text-center">Tambahan Hari</th>
							<th class="py-3 px-4 font-mono text-right">Biaya Tambahan</th>
							<th class="py-3 px-4 font-mono">Tanggal Proses</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#F4EFE7] font-mono">
						{#each data.extensionHistory as ext (ext.id)}
							<tr class="hover:bg-[#FAF8F4] transition">
								<td class="py-3 px-4 font-bold text-[#383123]">{ext.garage_code}</td>
								<td class="py-3 px-4 font-sans font-bold text-[#383123]">{ext.tenant_name}</td>
								<td class="py-3 px-4 text-[#877758]">{ext.old_end_date}</td>
								<td class="py-3 px-4 font-bold text-[#71856A]">{ext.new_end_date}</td>
								<td class="py-3 px-4 text-center">+{ext.additional_days} hari</td>
								<td class="py-3 px-4 text-right font-extrabold text-[#596A53]">{formatRupiah(ext.additional_cost)}</td>
								<td class="py-3 px-4 text-[#A08F6E]">{ext.created_at.split('T')[0]}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>