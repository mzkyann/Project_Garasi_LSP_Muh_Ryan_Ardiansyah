<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';

	let { data }: { data: PageData } = $props();
	let showSuccessAlert = $derived(page.url.searchParams.get('success') === '1');
</script>

<svelte:head>
	<title>Riwayat Sewa Saya - GARASI.ID</title>
</svelte:head>

<div class="max-w-5xl mx-auto py-4 space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
		<div>
			<h1 class="text-2xl font-bold text-slate-800">Riwayat Sewa Garasi Saya</h1>
			<p class="text-xs text-slate-500 mt-1">
				Daftar transaksi garasi yang sedang aktif maupun yang telah selesai.
			</p>
		</div>
		<a
			href="/penyewa/sewa-baru"
			class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs transition shadow flex items-center gap-1.5"
		>
			<span>+</span> Sewa Garasi Baru
		</a>
	</div>

	{#if showSuccessAlert}
		<div class="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span>🎉</span> Transaksi sewa garasi baru Anda berhasil diproses dan disimpan!
			</div>
		</div>
	{/if}

	{#if data.rentals.length === 0}
		<div class="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
			<div class="text-4xl text-slate-300">🏢</div>
			<h3 class="text-base font-bold text-slate-700">Belum Ada Transaksi Sewa</h3>
			<p class="text-xs text-slate-500 max-w-sm mx-auto">
				Anda belum pernah melakukan pemesanan sewa garasi. Silakan buat transaksi sewa baru untuk kendaraan Anda.
			</p>
			<div class="pt-2">
				<a
					href="/penyewa/sewa-baru"
					class="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
				>
					Mulai Sewa Sekarang
				</a>
			</div>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.rentals as rental (rental.id)}
				<div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow transition">
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
						<div class="flex items-center gap-3">
							<span class="text-xl font-black font-mono px-3 py-1 bg-slate-900 text-amber-300 rounded-lg">
								{rental.garage_code}
							</span>
							<div>
								<div class="text-sm font-bold text-slate-800">
									{rental.vehicle_brand_model}
									{#if rental.license_plate}
										<span class="text-xs font-mono font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
											{rental.license_plate}
										</span>
									{/if}
								</div>
								<div class="text-xs text-slate-500 capitalize">
									Tipe Garasi: {rental.garage_type.replace('_', ' ')} • Sewa {rental.rental_type} ({rental.duration} {rental.rental_type === 'harian' ? 'Hari' : 'Bulan'})
								</div>
							</div>
						</div>

						<div>
							<span class="text-xs font-bold px-2.5 py-1 rounded-full {rental.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
								{rental.status === 'active' ? '● Sedang Digunakan' : 'Selesai'}
							</span>
						</div>
					</div>

					<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs py-2">
						<div>
							<span class="text-slate-400 block">Periode Sewa</span>
							<span class="font-semibold text-slate-700">{rental.start_date} s/d {rental.end_date}</span>
						</div>
						<div>
							<span class="text-slate-400 block">Biaya Pokok</span>
							<span class="font-semibold text-slate-700">Rp {rental.base_rental_cost.toLocaleString('id-ID')}</span>
						</div>
						<div>
							<span class="text-slate-400 block">Biaya Listrik</span>
							<span class="font-semibold text-emerald-700">
								{rental.electricity_cost > 0 ? `Rp ${rental.electricity_cost.toLocaleString('id-ID')}` : 'Rp 0'}
							</span>
						</div>
						<div>
							<span class="text-slate-400 block">Total Biaya Dibayar</span>
							<span class="font-bold text-indigo-700 text-sm">Rp {rental.total_cost.toLocaleString('id-ID')}</span>
						</div>
					</div>

					<!-- Riwayat Perpanjangan jika ada -->
					{#if rental.extensions && rental.extensions.length > 0}
						<div class="mt-3 pt-3 border-t border-slate-100 bg-slate-50 rounded-xl p-3 text-xs">
							<div class="font-bold text-slate-700 mb-1">Riwayat Perpanjangan Garasi:</div>
							<div class="space-y-1">
								{#each rental.extensions as ext}
									<div class="flex justify-between text-slate-600">
										<span>Diperpanjang dari <strong>{ext.old_end_date}</strong> hingga <strong>{ext.new_end_date}</strong> (+{ext.additional_days} hari)</span>
										<span class="font-semibold text-indigo-600">+ Rp {ext.additional_cost.toLocaleString('id-ID')}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
