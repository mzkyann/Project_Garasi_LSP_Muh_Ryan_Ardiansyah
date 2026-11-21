<!-- src/routes/penyewa/riwayat/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import Icon from '#lib/components/Icon.svelte';

	let { data }: { data: PageData } = $props();
	let showSuccessAlert = $derived(page.url.searchParams.get('success') === '1');

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:head>
	<title>Riwayat Sewa Garasi - SIM-GARASI</title>
</svelte:head>

<div class="max-w-5xl mx-auto py-2 space-y-6">
	<!-- Page Header with Earthy Palette -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#DFD5C2] shadow-xs card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="clock" size={14} />
				<span>Panel Penyewa Terdaftar</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Daftar Riwayat Sewa Garasi</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Daftar unit garasi yang sedang aktif digunakan dan catatan historis perpanjangan sewa Anda.
			</p>
		</div>
		<a
			href="/penyewa/sewa-baru"
			class="px-4 py-2 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-1.5 btn-interactive"
		>
			<Icon name="plus" size={14} />
			<span>Sewa Garasi Baru</span>
		</a>
	</div>

	{#if showSuccessAlert}
		<div class="p-4 bg-[#EFF3ED] border border-[#C2CCBC] text-[#2E382A] rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
			<div class="flex items-center gap-2.5">
				<div class="w-6 h-6 rounded-full bg-[#71856A] text-white flex items-center justify-center">
					<Icon name="check" size={14} />
				</div>
				<span>Transaksi sewa garasi baru Anda berhasil diproses dan tersimpan di database sistem.</span>
			</div>
		</div>
	{/if}

	{#if data.rentals.length === 0}
		<div class="bg-white rounded-xl p-12 text-center border border-[#DFD5C2] space-y-3 shadow-xs">
			<div class="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#877758] flex items-center justify-center mx-auto border border-[#DFD5C2]">
				<Icon name="building" size={24} />
			</div>
			<h3 class="text-base font-bold text-[#383123]">Belum Ada Transaksi Sewa Garasi</h3>
			<p class="text-xs text-[#6B5E45] max-w-sm mx-auto leading-relaxed">
				Anda belum memiliki kontrak sewa aktif. Silakan ajukan permohonan sewa baru melalui tombol di atas.
			</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.rentals as rental (rental.id)}
				<div class="bg-white rounded-xl p-6 border border-[#DFD5C2] shadow-xs space-y-4 card-hover">
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#F4EFE7] pb-4">
						<div class="flex items-center gap-3">
							<span class="text-base font-extrabold font-mono px-3 py-1.5 bg-[#383123] text-[#FAF8F4] rounded-lg border border-[#4F4532] shadow-xs">
								{rental.garage_code}
							</span>
							<div>
								<div class="text-sm font-extrabold text-[#383123] flex items-center gap-2">
									<span>{rental.vehicle_brand_model}</span>
									{#if rental.license_plate}
										<span class="font-mono font-bold text-xs text-[#4F4532] bg-[#FAF8F4] px-2 py-0.5 rounded border border-[#DFD5C2]">
											{rental.license_plate}
										</span>
									{/if}
								</div>
								<div class="text-xs text-[#877758] capitalize mt-0.5">
									Kategori Garasi: <span class="font-semibold text-[#4F4532]">{rental.garage_type.replace('_', ' ')}</span> • Sewa {rental.rental_type} ({rental.duration} {rental.rental_type === 'harian' ? 'Hari' : 'Bulan'})
								</div>
							</div>
						</div>

						<div>
							<span class="text-xs font-mono font-bold px-3 py-1 rounded-full {rental.status === 'active' ? 'bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]' : 'bg-[#FAF8F4] text-[#6B5E45] border border-[#DFD5C2]'}">
								{rental.status === 'active' ? '● Aktif Digunakan' : '○ Selesai'}
							</span>
						</div>
					</div>

					<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono py-1">
						<div class="bg-[#FAF8F4] p-3 rounded-lg border border-[#F4EFE7]">
							<span class="text-[11px] font-sans text-[#877758] block mb-0.5">Periode Kontrak</span>
							<span class="font-bold text-[#383123]">{rental.start_date} s/d {rental.end_date}</span>
						</div>
						<div class="bg-[#FAF8F4] p-3 rounded-lg border border-[#F4EFE7]">
							<span class="text-[11px] font-sans text-[#877758] block mb-0.5">Sewa Garasi Pokok</span>
							<span class="font-bold text-[#383123]">{formatRupiah(rental.base_rental_cost)}</span>
						</div>
						<div class="bg-[#FAF8F4] p-3 rounded-lg border border-[#F4EFE7]">
							<span class="text-[11px] font-sans text-[#877758] block mb-0.5">Biaya Listrik EV</span>
							<span class="font-bold text-[#596A53]">
								{rental.electricity_cost > 0 ? formatRupiah(rental.electricity_cost) : '-'}
							</span>
						</div>
						<div class="bg-[#EFF3ED] p-3 rounded-lg border border-[#C2CCBC]">
							<span class="text-[11px] font-sans text-[#596A53] block mb-0.5">Total Pelunasan</span>
							<span class="font-extrabold text-[#2E382A] text-sm">{formatRupiah(rental.total_cost)}</span>
						</div>
					</div>

					{#if rental.extensions && rental.extensions.length > 0}
						<div class="pt-3 border-t border-[#F4EFE7] bg-[#FAF8F4] rounded-lg p-3.5 text-xs space-y-1.5 border border-[#DFD5C2]">
							<div class="font-bold text-[#4F4532] flex items-center gap-1.5">
								<Icon name="clock" size={13} class="text-[#71856A]" />
								<span>Catatan Riwayat Perpanjangan Sewa:</span>
							</div>
							{#each rental.extensions as ext}
								<div class="flex justify-between items-center text-[#6B5E45] font-mono text-[11px] pt-1">
									<span>Diperpanjang dari {ext.old_end_date} sampai {ext.new_end_date} (+{ext.additional_days} hari)</span>
									<span class="font-bold text-[#596A53]">+ {formatRupiah(ext.additional_cost)}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>