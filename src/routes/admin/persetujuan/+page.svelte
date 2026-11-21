<!-- src/routes/admin/persetujuan/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let activeTab = $state<'rentals' | 'extensions' | 'active'>('rentals');
	let previewProofUrl = $state<string | null>(null);

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}

	function formatDateIndo(dateStr: string) {
		if (!dateStr) return '-';
		const parts = dateStr.split('T')[0].split('-');
		if (parts.length !== 3) return dateStr;
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
		return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
	}
</script>

<svelte:head>
	<title>Persetujuan Sewa & ACC - Admin SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="shield" size={14} />
				<span>Panel Administrasi</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Persetujuan & ACC Transaksi Sewa</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Verifikasi permohonan sewa baru dan permohonan perpanjangan dari penyewa, periksa bukti pelunasan, lalu putuskan persetujuan (ACC).
			</p>
		</div>

		<!-- Action Tabs Switcher -->
		<div class="flex items-center gap-2 flex-wrap">
			<button
				type="button"
				onclick={() => (activeTab = 'rentals')}
				class="px-4 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'rentals' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="file-text" size={13} />
				<span>Sewa Baru ({data.pendingRentals.length})</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'extensions')}
				class="px-4 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'extensions' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="clock" size={13} />
				<span>Perpanjangan ({data.pendingExtensions.length})</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'active')}
				class="px-4 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'active' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="check" size={13} />
				<span>Sewa Berjalan ({data.activeRentals.length})</span>
			</button>
		</div>
	</div>

	<!-- Alert Messages -->
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

	<!-- TAB 1: PERMOHONAN SEWA BARU (MENUNGGU ACC) -->
	{#if activeTab === 'rentals'}
		<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
			<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
				<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
					<Icon name="clock" size={14} class="text-[#8A7545]" />
					<span>Antrean Permohonan Sewa Baru Menunggu ACC</span>
				</h2>
				<span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FDFBF7] text-[#8A7545] border border-[#DAC99B]">
					{data.pendingRentals.length} Pengajuan
				</span>
			</div>

			{#if data.pendingRentals.length === 0}
				<div class="p-12 text-center text-[#A08F6E] text-xs space-y-2">
					<div class="w-10 h-10 rounded-full bg-[#FAF8F4] flex items-center justify-center mx-auto text-[#71856A] border border-[#DFD5C2]">
						<Icon name="check" size={20} />
					</div>
					<div class="font-bold text-[#383123] text-sm">Tidak Ada Permohonan Sewa Baru</div>
					<p class="max-w-sm mx-auto">Semua permohonan sewa telah ditinjau dan disetujui oleh admin.</p>
				</div>
			{:else}
				<div class="divide-y divide-[#F4EFE7]">
					{#each data.pendingRentals as rental (rental.id)}
						<div class="p-6 space-y-4 hover:bg-[#FAF8F4] transition">
							<!-- Header Baris: Tenant & Unit Info -->
							<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div class="flex items-center gap-3">
									<span class="font-mono font-extrabold text-sm px-3 py-1.5 bg-[#383123] text-white rounded-lg">
										{rental.garage_code}
									</span>
									<div>
										<h3 class="font-extrabold text-sm text-[#383123] flex items-center gap-2">
											<span>{rental.vehicle_brand_model}</span>
											<span class="text-xs font-mono font-bold bg-[#FAF8F4] text-[#4F4532] px-2 py-0.5 rounded border border-[#DFD5C2]">
												{rental.license_plate || 'Bebas Plat'}
											</span>
										</h3>
										<p class="text-xs text-[#6B5E45] mt-0.5">
											Penyewa: <strong class="text-[#383123]">{rental.tenant_name}</strong> (NIK: {rental.tenant_nik}) • Telp: {rental.tenant_phone}
										</p>
									</div>
								</div>

								<div class="text-right self-start sm:self-auto">
									<span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FDFBF7] text-[#8A7545] border border-[#DAC99B]">
										Menunggu ACC
									</span>
									<span class="text-[10px] text-[#A08F6E] block mt-0.5">
										Diajukan: {formatDateIndo(rental.created_at)}
									</span>
								</div>
							</div>

							<!-- Grid Detail: Tanggal, Biaya, Bukti Pembayaran -->
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-[#DFD5C2] text-xs">
								<!-- Kolom 1: Detail Periode -->
								<div class="space-y-1.5 border-b md:border-b-0 md:border-r border-[#F4EFE7] pb-3 md:pb-0 md:pr-4">
									<span class="text-[11px] font-bold text-[#877758] uppercase block">Periode & Durasi Sewa</span>
									<div class="font-mono text-[#383123] font-bold">
										{formatDateIndo(rental.start_date)} s/d {formatDateIndo(rental.end_date)}
									</div>
									<div class="text-[#6B5E45]">
										Durasi: <strong>{rental.duration} {rental.rental_type === 'harian' ? 'Hari' : 'Bulan'}</strong> ({rental.rental_type})
									</div>
									<div class="text-[#6B5E45]">
										Tipe Kendaraan: <strong class="capitalize">{rental.vehicle_type.replace('_', ' ')}</strong>
									</div>
								</div>

								<!-- Kolom 2: Rincian Biaya -->
								<div class="space-y-1.5 border-b md:border-b-0 md:border-r border-[#F4EFE7] pb-3 md:pb-0 md:pr-4">
									<span class="text-[11px] font-bold text-[#877758] uppercase block">Rincian Keuangan</span>
									<div class="flex justify-between text-[#6B5E45]">
										<span>Sewa Pokok:</span>
										<span class="font-mono font-bold text-[#383123]">{formatRupiah(rental.base_rental_cost)}</span>
									</div>
									{#if rental.electricity_cost > 0}
										<div class="flex justify-between text-[#596A53]">
											<span>Biaya Listrik EV:</span>
											<span class="font-mono font-bold">+{formatRupiah(rental.electricity_cost)}</span>
										</div>
									{/if}
									<div class="flex justify-between text-[#383123] font-bold border-t border-[#F4EFE7] pt-1">
										<span>Total Pelunasan:</span>
										<span class="font-mono text-sm text-[#71856A]">{formatRupiah(rental.total_cost)}</span>
									</div>
								</div>

								<!-- Kolom 3: Bukti Pelunasan -->
								<div class="space-y-1.5 flex flex-col justify-between">
									<span class="text-[11px] font-bold text-[#877758] uppercase block">Bukti Pembayaran</span>
									{#if rental.payment_proof}
										<div class="flex items-center gap-3">
											<button
												type="button"
												onclick={() => (previewProofUrl = rental.payment_proof)}
												class="w-20 h-14 rounded-lg border border-[#DFD5C2] overflow-hidden bg-[#FAF8F4] shrink-0 hover:opacity-80 transition cursor-zoom-in"
												title="Klik untuk memperbesar bukti bayar"
											>
												<img src={rental.payment_proof} alt="Bukti Pembayaran" class="w-full h-full object-cover" />
											</button>
											<div>
												<button
													type="button"
													onclick={() => (previewProofUrl = rental.payment_proof)}
													class="text-xs text-[#71856A] font-bold hover:underline flex items-center gap-1"
												>
													<Icon name="search" size={12} />
													<span>Periksa Struk Bayar</span>
												</button>
												<span class="text-[10px] text-[#A08F6E] block mt-0.5">Struk Pelunasan Terlampir</span>
											</div>
										</div>
									{:else}
										<span class="text-rose-600">Tidak ada lampiran bukti bayar</span>
									{/if}
								</div>
							</div>

							<!-- Tombol Aksi ACC / Tolak -->
							<div class="flex items-center justify-end gap-3 pt-2">
								<form method="POST" action="?/rejectRental">
									<input type="hidden" name="rentalId" value={rental.id} />
									<button
										type="submit"
										class="px-4 py-2 bg-[#FAF8F4] hover:bg-rose-50 text-[#877758] hover:text-rose-700 rounded-lg text-xs font-bold border border-[#DFD5C2] hover:border-rose-300 transition flex items-center gap-1.5 btn-interactive"
									>
										<Icon name="x" size={13} />
										<span>Tolak Permohonan</span>
									</button>
								</form>

								<form method="POST" action="?/approveRental">
									<input type="hidden" name="rentalId" value={rental.id} />
									<button
										type="submit"
										class="px-5 py-2 bg-[#71856A] hover:bg-[#596A53] text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 btn-interactive"
									>
										<Icon name="check" size={14} />
										<span>ACC & Setujui Sewa Mobil</span>
									</button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- TAB 2: PERMOHONAN PERPANJANGAN SEWA (MENUNGGU ACC) -->
	{#if activeTab === 'extensions'}
		<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
			<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
				<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
					<Icon name="clock" size={14} class="text-[#8A7545]" />
					<span>Permintaan Perpanjangan Sewa dari Customer Menunggu ACC</span>
				</h2>
				<span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FDFBF7] text-[#8A7545] border border-[#DAC99B]">
					{data.pendingExtensions.length} Permintaan
				</span>
			</div>

			{#if data.pendingExtensions.length === 0}
				<div class="p-12 text-center text-[#A08F6E] text-xs space-y-2">
					<div class="w-10 h-10 rounded-full bg-[#FAF8F4] flex items-center justify-center mx-auto text-[#71856A] border border-[#DFD5C2]">
						<Icon name="check" size={20} />
					</div>
					<div class="font-bold text-[#383123] text-sm">Tidak Ada Permintaan Perpanjangan Menunggu ACC</div>
					<p class="max-w-sm mx-auto">Customer belum mengajukan perpanjangan kontrak sewa aktif saat ini.</p>
				</div>
			{:else}
				<div class="divide-y divide-[#F4EFE7]">
					{#each data.pendingExtensions as ext (ext.id)}
						<div class="p-6 space-y-4 hover:bg-[#FAF8F4] transition">
							<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div class="flex items-center gap-3">
									<span class="font-mono font-extrabold text-sm px-3 py-1.5 bg-[#383123] text-white rounded-lg">
										{ext.garage_code}
									</span>
									<div>
										<h3 class="font-extrabold text-sm text-[#383123] flex items-center gap-2">
											<span>{ext.vehicle_brand_model}</span>
											<span class="text-xs font-mono font-bold bg-[#FAF8F4] text-[#4F4532] px-2 py-0.5 rounded border border-[#DFD5C2]">
												{ext.license_plate || 'Bebas Plat'}
											</span>
										</h3>
										<p class="text-xs text-[#6B5E45] mt-0.5">
											Penyewa: <strong class="text-[#383123]">{ext.tenant_name}</strong> • Telp: {ext.phone}
										</p>
									</div>
								</div>

								<div class="text-right">
									<span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FDFBF7] text-[#8A7545] border border-[#DAC99B]">
										Minta Perpanjangan
									</span>
									<span class="text-[10px] text-[#A08F6E] block mt-0.5">
										Diajukan: {formatDateIndo(ext.created_at)}
									</span>
								</div>
							</div>

							<!-- Grid Detail Perpanjangan -->
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-[#DFD5C2] text-xs">
								<!-- Kolom 1: Perubahan Tanggal -->
								<div class="space-y-1.5 border-b md:border-b-0 md:border-r border-[#F4EFE7] pb-3 md:pb-0 md:pr-4">
									<span class="text-[11px] font-bold text-[#877758] uppercase block">Perubahan Tanggal Selesai</span>
									<div class="flex justify-between">
										<span class="text-[#6B5E45]">Selesai Lama:</span>
										<span class="font-mono font-bold text-rose-700">{formatDateIndo(ext.old_end_date)}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-[#6B5E45]">Selesai Baru:</span>
										<span class="font-mono font-extrabold text-[#71856A]">{formatDateIndo(ext.new_end_date)}</span>
									</div>
									<div class="text-[#383123] font-bold pt-1 border-t border-[#F4EFE7]">
										Tambahan: +{ext.additional_days} Hari
									</div>
								</div>

								<!-- Kolom 2: Biaya Tambahan -->
								<div class="space-y-1.5 border-b md:border-b-0 md:border-r border-[#F4EFE7] pb-3 md:pb-0 md:pr-4">
									<span class="text-[11px] font-bold text-[#877758] uppercase block">Biaya Tambahan</span>
									<div class="flex justify-between text-[#6B5E45]">
										<span>Tarif Harian:</span>
										<span class="font-mono">{formatRupiah(ext.garage_daily_price)}</span>
									</div>
									<div class="flex justify-between text-[#383123] font-bold border-t border-[#F4EFE7] pt-1">
										<span>Total Tambahan:</span>
										<span class="font-mono text-sm text-[#71856A]">{formatRupiah(ext.additional_cost)}</span>
									</div>
								</div>

								<!-- Kolom 3: Bukti Pembayaran Tambahan -->
								<div class="space-y-1.5 flex flex-col justify-between">
									<span class="text-[11px] font-bold text-[#877758] uppercase block">Bukti Pembayaran Tambahan</span>
									{#if ext.payment_proof}
										<div class="flex items-center gap-3">
											<button
												type="button"
												onclick={() => (previewProofUrl = ext.payment_proof)}
												class="w-20 h-14 rounded-lg border border-[#DFD5C2] overflow-hidden bg-[#FAF8F4] shrink-0 hover:opacity-80 transition cursor-zoom-in"
											>
												<img src={ext.payment_proof} alt="Bukti Pelunasan Tambahan" class="w-full h-full object-cover" />
											</button>
											<div>
												<button
													type="button"
													onclick={() => (previewProofUrl = ext.payment_proof)}
													class="text-xs text-[#71856A] font-bold hover:underline flex items-center gap-1"
												>
													<Icon name="search" size={12} />
													<span>Cek Struk Tambahan</span>
												</button>
												<span class="text-[10px] text-[#A08F6E] block mt-0.5">Struk Pelunasan</span>
											</div>
										</div>
									{:else}
										<span class="text-rose-600">Tidak ada lampiran bukti bayar</span>
									{/if}
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="flex items-center justify-end gap-3 pt-2">
								<form method="POST" action="?/rejectExtension">
									<input type="hidden" name="extensionId" value={ext.id} />
									<button
										type="submit"
										class="px-4 py-2 bg-[#FAF8F4] hover:bg-rose-50 text-[#877758] hover:text-rose-700 rounded-lg text-xs font-bold border border-[#DFD5C2] hover:border-rose-300 transition flex items-center gap-1.5 btn-interactive"
									>
										<Icon name="x" size={13} />
										<span>Tolak Perpanjangan</span>
									</button>
								</form>

								<form method="POST" action="?/approveExtension">
									<input type="hidden" name="extensionId" value={ext.id} />
									<button
										type="submit"
										class="px-5 py-2 bg-[#71856A] hover:bg-[#596A53] text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 btn-interactive"
									>
										<Icon name="check" size={14} />
										<span>ACC & Perpanjang Masa Sewa</span>
									</button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- TAB 3: DAFTAR SEWA AKTIF BERJALAN -->
	{#if activeTab === 'active'}
		<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
			<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
				<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
					<Icon name="check" size={14} class="text-[#71856A]" />
					<span>Daftar Seluruh Kontrak Sewa Aktif Berjalan</span>
				</h2>
				<span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]">
					{data.activeRentals.length} Kontrak Aktif
				</span>
			</div>

			{#if data.activeRentals.length === 0}
				<div class="p-12 text-center text-[#A08F6E] text-xs">
					Tidak ada slot garasi yang sedang dalam status sewa aktif saat ini.
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-left text-xs">
						<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
							<tr>
								<th class="py-3 px-4">Unit Garasi</th>
								<th class="py-3 px-4">Nama Penyewa</th>
								<th class="py-3 px-4">Periode Kontrak Sewa</th>
								<th class="py-3 px-4 text-right">Total Biaya</th>
								<th class="py-3 px-4 text-center">Status</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-[#F4EFE7]">
							{#each data.activeRentals as r (r.id)}
								<tr class="hover:bg-[#FAF8F4] transition">
									<td class="py-3 px-4">
										<span class="font-mono font-bold text-xs bg-[#383123] text-white px-2 py-0.5 rounded mr-2">
											{r.garage_code}
										</span>
										<strong class="text-[#383123]">{r.vehicle_brand_model}</strong>
									</td>
									<td class="py-3 px-4">
										<div class="font-bold text-[#383123]">{r.tenant_name}</div>
										<div class="text-[11px] text-[#6B5E45]">{r.tenant_phone}</div>
									</td>
									<td class="py-3 px-4 font-mono">
										<span class="text-[#383123] font-bold">{formatDateIndo(r.start_date)} s/d {formatDateIndo(r.end_date)}</span>
									</td>
									<td class="py-3 px-4 text-right font-mono font-bold text-[#71856A]">
										{formatRupiah(r.total_cost)}
									</td>
									<td class="py-3 px-4 text-center">
										<span class="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]">
											● Aktif
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- MODAL PREVIEW BUKTI BAYAR FULL RESOLUSI -->
{#if previewProofUrl}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl border border-[#DFD5C2] max-w-xl w-full p-5 shadow-2xl space-y-4">
			<div class="flex items-center justify-between border-b border-[#F4EFE7] pb-3">
				<h3 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
					<Icon name="search" size={14} class="text-[#71856A]" />
					<span>Pratinjau Struk / Bukti Pelunasan Pembayaran</span>
				</h3>
				<button
					type="button"
					onclick={() => (previewProofUrl = null)}
					class="p-1 rounded-lg text-[#877758] hover:bg-[#FAF8F4]"
				>
					<Icon name="x" size={18} />
				</button>
			</div>

			<div class="bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl p-3 flex items-center justify-center max-h-[70vh] overflow-auto">
				<img src={previewProofUrl} alt="Bukti Pembayaran Penuh" class="max-w-full max-h-[65vh] object-contain rounded-lg shadow-sm" />
			</div>

			<div class="flex justify-end">
				<button
					type="button"
					onclick={() => (previewProofUrl = null)}
					class="px-4 py-2 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] text-xs font-bold rounded-lg border border-[#DFD5C2] transition"
				>
					Tutup Pratinjau
				</button>
			</div>
		</div>
	</div>
{/if}

