<!-- src/routes/penyewa/riwayat/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import Icon from '#lib/components/Icon.svelte';

	let { data }: { data: PageData } = $props();
	let showSuccessAlert = $derived(page.url.searchParams.get('success') === '1');
</script>

<svelte:head>
	<title>Riwayat Sewa Garasi - SIM-GARASI</title>
</svelte:head>

<div class="max-w-5xl mx-auto py-2 space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
		<div>
			<div class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
				<Icon name="clock" size={14} class="text-blue-600" />
				<span>Panel Penyewa</span>
			</div>
			<h1 class="text-lg font-bold text-slate-900 mt-1">Daftar Riwayat Persewaan Garasi</h1>
			<p class="text-xs text-slate-500 mt-0.5">
				Informasi unit garasi yang sedang aktif digunakan dan riwayat transaksi sebelumnya.
			</p>
		</div>
		<a
			href="/penyewa/sewa-baru"
			class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs transition flex items-center gap-1.5 shadow-xs"
		>
			<Icon name="plus" size={14} />
			<span>Sewa Garasi Baru</span>
		</a>
	</div>

	{#if showSuccessAlert}
		<div class="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-medium flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Icon name="check" size={15} class="text-emerald-600" />
				<span>Transaksi sewa garasi baru Anda berhasil diproses dan disimpan ke sistem.</span>
			</div>
		</div>
	{/if}

	{#if data.rentals.length === 0}
		<div class="bg-white rounded-lg p-10 text-center border border-slate-200 space-y-2">
			<div class="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
				<Icon name="building" size={20} />
			</div>
			<h3 class="text-sm font-bold text-slate-700">Belum Ada Transaksi Persewaan</h3>
			<p class="text-xs text-slate-500 max-w-sm mx-auto">
				Anda belum memiliki riwayat sewa garasi. Silakan ajukan sewa garasi baru melalui tombol di atas.
			</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.rentals as rental (rental.id)}
				<div class="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-3">
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
						<div class="flex items-center gap-3">
							<span class="text-base font-bold font-mono px-2.5 py-1 bg-slate-800 text-white rounded border border-slate-700">
								{rental.garage_code}
							</span>
							<div>
								<div class="text-xs font-bold text-slate-900">
									{rental.vehicle_brand_model}
									{#if rental.license_plate}
										<span class="font-mono font-normal text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 ml-1">
											{rental.license_plate}
										</span>
									{/if}
								</div>
								<div class="text-[11px] text-slate-500 capitalize mt-0.5">
									Tipe Garasi: {rental.garage_type.replace('_', ' ')} • Sewa {rental.rental_type} ({rental.duration} {rental.rental_type === 'harian' ? 'Hari' : 'Bulan'})
								</div>
							</div>
						</div>

						<div>
							<span class="text-[11px] font-mono font-semibold px-2 py-0.5 rounded {rental.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
								{rental.status === 'active' ? 'Status: Digunakan (Active)' : 'Status: Selesai'}
							</span>
						</div>
					</div>

					<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono py-1">
						<div>
							<span class="text-[11px] font-sans text-slate-400 block">Periode Sewa</span>
							<span class="font-semibold text-slate-700">{rental.start_date} s/d {rental.end_date}</span>
						</div>
						<div>
							<span class="text-[11px] font-sans text-slate-400 block">Biaya Pokok</span>
							<span class="font-semibold text-slate-700">Rp {rental.base_rental_cost.toLocaleString('id-ID')}</span>
						</div>
						<div>
							<span class="text-[11px] font-sans text-slate-400 block">Biaya Listrik EV</span>
							<span class="font-semibold text-blue-700">
								{rental.electricity_cost > 0 ? `Rp ${rental.electricity_cost.toLocaleString('id-ID')}` : '-'}
							</span>
						</div>
						<div>
							<span class="text-[11px] font-sans text-slate-400 block">Total Pembayaran</span>
							<span class="font-bold text-blue-700">Rp {rental.total_cost.toLocaleString('id-ID')}</span>
						</div>
					</div>

					{#if rental.extensions && rental.extensions.length > 0}
						<div class="mt-2 pt-2 border-t border-slate-100 bg-slate-50 rounded p-3 text-xs space-y-1">
							<div class="font-semibold text-slate-700">Riwayat Perpanjangan Sewa:</div>
							{#each rental.extensions as ext}
								<div class="flex justify-between text-slate-600 font-mono text-[11px]">
									<span>Perpanjangan dari {ext.old_end_date} hingga {ext.new_end_date} (+{ext.additional_days} hari)</span>
									<span class="font-semibold text-blue-700">+ Rp {ext.additional_cost.toLocaleString('id-ID')}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
