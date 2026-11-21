<!-- src/routes/penyewa/riwayat/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { page } from '$app/state';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showSubmittedAlert = $derived(page.url.searchParams.get('submitted') === '1');
	let showSuccessAlert = $derived(page.url.searchParams.get('success') === '1');

	// Modal State Perpanjangan
	let extendingRental = $state<any | null>(null);
	let newEndDate = $state<string>('');
	let previewProof = $state<string | null>(null);

	// Lightbox bukti bayar
	let activeLightboxUrl = $state<string | null>(null);

	function openExtensionModal(rental: any) {
		extendingRental = rental;
		const curEnd = new Date(rental.end_date);
		curEnd.setDate(curEnd.getDate() + 3);
		newEndDate = curEnd.toISOString().split('T')[0];
	}

	function closeExtensionModal() {
		extendingRental = null;
		newEndDate = '';
	}

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

	// Metrik ringkasan penyewa
	let activeRentalsCount = $derived(data.rentals.filter((r: any) => r.status === 'active').length);
	let pendingRentalsCount = $derived(data.rentals.filter((r: any) => r.status === 'pending').length);
	let completedRentalsCount = $derived(data.rentals.filter((r: any) => r.status === 'completed').length);
	let totalSpending = $derived(data.rentals.reduce((sum: number, r: any) => sum + (r.total_cost || 0), 0));

	// Deteksi konflik perpanjangan secara real-time di front-end
	let extensionCheck = $derived.by(() => {
		if (!extendingRental || !newEndDate) {
			return { isValid: false, error: '', days: 0, cost: 0, collision: null };
		}

		const oldEnd = new Date(extendingRental.end_date);
		const newEnd = new Date(newEndDate);

		if (isNaN(newEnd.getTime()) || newEnd <= oldEnd) {
			return {
				isValid: false,
				error: `Tanggal baru harus lebih besar daripada tanggal selesai kontrak saat ini (${extendingRental.end_date})`,
				days: 0,
				cost: 0,
				collision: null
			};
		}

		// Cek apakah ada booking lain pada rentang ini
		const collision = extendingRental.otherBookings.find((b: any) => {
			return !(b.end_date <= extendingRental.end_date || b.start_date >= newEndDate);
		});

		if (collision) {
			return {
				isValid: false,
				error: `Slot garasi ini telah dibooking oleh penyewa lain pada tanggal ${formatDateIndo(collision.start_date)} s/d ${formatDateIndo(collision.end_date)}. Otomatis tidak dapat diperpanjang ke tanggal tersebut.`,
				days: 0,
				cost: 0,
				collision
			};
		}

		const diffTime = newEnd.getTime() - oldEnd.getTime();
		const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		const cost = days * extendingRental.garage_daily_price;

		return {
			isValid: true,
			error: '',
			days,
			cost,
			collision: null
		};
	});
</script>

<svelte:head>
	<title>Riwayat Sewa Garasi - GARTA Takalar</title>
</svelte:head>

<div class="max-w-6xl mx-auto py-2 space-y-6">
	<!-- Page Header Hero Banner -->
	<div class="bg-gradient-to-r from-[#242D21] via-[#2E3A2B] to-[#1C2319] text-white rounded-2xl p-6 sm:p-7 shadow-md border border-[#3E4F39] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
		<div class="absolute -right-10 -bottom-10 w-48 h-48 bg-[#71856A]/20 rounded-full blur-2xl pointer-events-none"></div>

		<div class="space-y-1.5 relative z-10">
			<div class="inline-flex items-center gap-2 text-xs font-bold text-[#E5C772] uppercase tracking-wider font-mono">
				<Icon name="clock" size={13} />
				<span>Panel Akun Pelanggan</span>
			</div>
			<h1 class="text-2xl font-extrabold text-[#FAF8F4] tracking-tight">
				Riwayat & Kontrak Sewa Garasi
			</h1>
			<p class="text-xs text-[#D1DDCE] leading-relaxed max-w-xl">
				Pantau status persetujuan transaksi, jadwal akhir penitipan kendaraan Anda, dan ajukan perpanjangan sewa dengan proteksi tanggal anti-bentrok.
			</p>
		</div>

		<div class="relative z-10">
			<a
				href="/penyewa/sewa-baru"
				class="px-5 py-2.5 bg-[#687D61] hover:bg-[#54674E] text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 btn-interactive"
			>
				<Icon name="plus" size={15} />
				<span>+ Sewa Slot Garasi Baru</span>
			</a>
		</div>
	</div>

	<!-- Bento Stat Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
		<div class="bg-white p-4 rounded-xl border border-[#DFD5C2] shadow-xs card-hover">
			<span class="text-[10px] font-bold text-[#877758] uppercase block">Total Transaksi</span>
			<span class="text-2xl font-extrabold text-[#383123] font-mono mt-1 block">{data.rentals.length} Kontrak</span>
		</div>
		<div class="bg-white p-4 rounded-xl border border-[#DFD5C2] shadow-xs card-hover">
			<span class="text-[10px] font-bold text-[#596A53] uppercase block">Sedang Aktif Terparkir</span>
			<span class="text-2xl font-extrabold text-[#2E382A] font-mono mt-1 block flex items-center gap-1.5">
				<span>{activeRentalsCount}</span>
				{#if activeRentalsCount > 0}
					<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
				{/if}
			</span>
		</div>
		<div class="bg-white p-4 rounded-xl border border-[#DFD5C2] shadow-xs card-hover">
			<span class="text-[10px] font-bold text-amber-700 uppercase block">Menunggu ACC Admin</span>
			<span class="text-2xl font-extrabold text-amber-900 font-mono mt-1 block">{pendingRentalsCount}</span>
		</div>
		<div class="bg-white p-4 rounded-xl border border-[#DFD5C2] shadow-xs card-hover">
			<span class="text-[10px] font-bold text-[#71856A] uppercase block">Total Pembayaran</span>
			<span class="text-lg sm:text-xl font-extrabold text-[#2E382A] font-mono mt-1 block truncate">
				{formatRupiah(totalSpending)}
			</span>
		</div>
	</div>

	<!-- Alerts -->
	{#if showSubmittedAlert}
		<div class="p-4 bg-[#FDFBF7] border border-[#DAC99B] text-[#8A7545] rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="clock" size={16} class="shrink-0" />
			<span>Permohonan sewa Anda berhasil diajukan ke sistem! Administrator sedang memverifikasi bukti bayar dan akan segera menyetujui (ACC).</span>
		</div>
	{/if}

	{#if form?.success}
		<div class="p-4 bg-[#EFF3ED] border border-[#C2CCBC] text-[#2E382A] rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="check" size={16} class="text-[#71856A] shrink-0" />
			<span>{form.message}</span>
		</div>
	{:else if form?.error}
		<div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="alert" size={16} class="text-rose-600 shrink-0" />
			<span>{form.error}</span>
		</div>
	{/if}

	{#if data.rentals.length === 0}
		<div class="bg-white rounded-2xl p-12 text-center border border-[#DFD5C2] space-y-3 shadow-xs">
			<div class="w-14 h-14 rounded-2xl bg-[#FAF8F4] text-[#877758] flex items-center justify-center mx-auto border border-[#DFD5C2]">
				<Icon name="building" size={28} />
			</div>
			<h3 class="text-base font-bold text-[#383123]">Belum Ada Transaksi Sewa Garasi</h3>
			<p class="text-xs text-[#6B5E45] max-w-sm mx-auto leading-relaxed">
				Anda belum memiliki permohonan atau kontrak sewa aktif. Silakan pilih slot garasi siap pakai melalui tombol sewa di atas.
			</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.rentals as rental (rental.id)}
				<div class="bg-white rounded-2xl p-5 sm:p-6 border border-[#DFD5C2] shadow-xs space-y-4 card-hover">
					<!-- Top Row: Unit, Brand, Status Badge -->
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#F4EFE7] pb-4">
						<div class="flex items-center gap-3">
							<span class="text-sm sm:text-base font-extrabold font-mono px-3 py-1.5 bg-[#242D21] text-[#FAF8F4] rounded-xl border border-[#3E4F39] shadow-xs">
								{rental.garage_code}
							</span>
							<div>
								<div class="text-sm font-extrabold text-[#383123] flex flex-wrap items-center gap-2">
									<span>{rental.vehicle_brand_model}</span>
									{#if rental.license_plate}
										<span class="font-mono font-bold text-xs text-[#383123] bg-[#FAF8F4] px-2 py-0.5 rounded-md border border-[#DFD5C2]">
											{rental.license_plate}
										</span>
									{/if}
								</div>
								<div class="text-xs text-[#877758] capitalize mt-0.5">
									Kategori: <strong class="text-[#383123]">{rental.garage_type.replace('_', ' ')}</strong> &bull; Sewa {rental.rental_type} ({rental.duration} {rental.rental_type === 'harian' ? 'Hari' : 'Bulan'})
								</div>
							</div>
						</div>

						<div class="flex items-center gap-2">
							{#if rental.status === 'pending'}
								<span class="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5">
									<Icon name="clock" size={12} />
									<span>⏳ Menunggu ACC Admin</span>
								</span>
							{:else if rental.status === 'active'}
								<span class="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#EFF3ED] text-[#2E382A] border border-[#C2CCBC] flex items-center gap-1.5">
									<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
									<span>● Aktif Terparkir</span>
								</span>
							{:else if rental.status === 'rejected'}
								<span class="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
									<Icon name="x" size={12} />
									<span>✕ Ditolak Admin</span>
								</span>
							{:else}
								<span class="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FAF8F4] text-[#6B5E45] border border-[#DFD5C2]">
									✓ Selesai
								</span>
							{/if}
						</div>
					</div>

					<!-- Financial & Period Grid -->
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono py-1">
						<div class="bg-[#FAF8F4] p-3 rounded-xl border border-[#DFD5C2]">
							<span class="text-[10px] font-sans text-[#877758] block mb-0.5">Periode Kontrak</span>
							<span class="font-bold text-[#383123]">{formatDateIndo(rental.start_date)} s/d {formatDateIndo(rental.end_date)}</span>
						</div>
						<div class="bg-[#FAF8F4] p-3 rounded-xl border border-[#DFD5C2]">
							<span class="text-[10px] font-sans text-[#877758] block mb-0.5">Sewa Garasi Pokok</span>
							<span class="font-bold text-[#383123]">{formatRupiah(rental.base_rental_cost)}</span>
						</div>
						<div class="bg-[#FAF8F4] p-3 rounded-xl border border-[#DFD5C2]">
							<span class="text-[10px] font-sans text-[#877758] block mb-0.5">Cas Baterai SPKLU</span>
							<span class="font-bold text-[#596A53]">
								{rental.electricity_cost > 0 ? formatRupiah(rental.electricity_cost) : '-'}
							</span>
						</div>
						<div class="bg-[#EFF3ED] p-3 rounded-xl border border-[#C2CCBC]">
							<span class="text-[10px] font-sans text-[#596A53] block mb-0.5">Total Biaya Pelunasan</span>
							<span class="font-extrabold text-[#2E382A] text-sm">{formatRupiah(rental.total_cost)}</span>
						</div>
					</div>

					<!-- Pending Extension Banner if Any -->
					{#if rental.pendingExtension}
						<div class="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
							<div class="flex items-center gap-2 text-amber-900">
								<Icon name="clock" size={14} class="shrink-0" />
								<span>
									Permohonan perpanjangan sewa hingga <strong>{formatDateIndo(rental.pendingExtension.new_end_date)}</strong> (+{rental.pendingExtension.additional_days} hari, {formatRupiah(rental.pendingExtension.additional_cost)}) sedang <strong>menunggu ACC Admin</strong>.
								</span>
							</div>
							<span class="text-[10px] font-mono font-bold bg-white text-amber-800 px-2.5 py-0.5 rounded border border-amber-300">
								Sedang Ditinjau
							</span>
						</div>
					{/if}

					<!-- Action Row: Request Extension Button -->
					<div class="flex items-center justify-between pt-2 border-t border-[#F4EFE7]">
						<div class="text-[11px] text-[#877758]">
							Tarif harian slot ini: <strong class="font-mono text-[#383123]">{formatRupiah(rental.garage_daily_price)} / hari</strong>
						</div>

						<div class="flex items-center gap-2">
							{#if rental.payment_proof}
								<button
									type="button"
									onclick={() => { activeLightboxUrl = rental.payment_proof; }}
									class="px-3 py-1.5 bg-[#FAF8F4] hover:bg-[#EAE3D4] text-[#383123] rounded-lg text-xs font-semibold border border-[#DFD5C2] transition"
								>
									Lihat Bukti Bayar
								</button>
							{/if}

							{#if rental.status === 'active' && !rental.pendingExtension}
								<button
									type="button"
									onclick={() => openExtensionModal(rental)}
									class="px-4 py-2 bg-[#71856A] hover:bg-[#596A53] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs btn-interactive"
								>
									<Icon name="clock" size={13} />
									<span>+ Minta Perpanjangan Sewa</span>
								</button>
							{/if}
						</div>
					</div>

					<!-- Extension History List if Any -->
					{#if rental.extensions && rental.extensions.length > 0}
						<div class="pt-3 border-t border-[#F4EFE7] bg-[#FAF8F4] rounded-xl p-3.5 text-xs space-y-2 border border-[#DFD5C2]">
							<div class="font-bold text-[#383123] flex items-center gap-1.5">
								<Icon name="clock" size={13} class="text-[#71856A]" />
								<span>Catatan Riwayat Perpanjangan Kontrak:</span>
							</div>
							<div class="divide-y divide-[#EAE3D4]">
								{#each rental.extensions as ext}
									<div class="py-2 flex items-center justify-between font-mono text-[11px]">
										<div>
											<span>{formatDateIndo(ext.old_end_date)} → <strong class="text-[#71856A]">{formatDateIndo(ext.new_end_date)}</strong> (+{ext.additional_days} hari)</span>
											<span class="text-[#877758] ml-2">Biaya: {formatRupiah(ext.additional_cost)}</span>
										</div>
										<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {ext.status === 'approved' ? 'bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]' : ext.status === 'pending' ? 'bg-amber-50 text-amber-800 border border-amber-300' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
											{ext.status === 'approved' ? 'Disetujui (ACC)' : ext.status === 'pending' ? 'Menunggu ACC' : 'Ditolak'}
										</span>
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

<!-- ================= MODAL PERPANJANGAN SEWA ================= -->
{#if extendingRental}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
		<div class="bg-white rounded-2xl border border-[#DFD5C2] max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
			<!-- Header -->
			<div class="flex items-start justify-between border-b border-[#F4EFE7] pb-3.5">
				<div>
					<div class="flex items-center gap-2">
						<span class="font-mono font-bold text-xs bg-[#242D21] text-white px-2 py-0.5 rounded">
							{extendingRental.garage_code}
						</span>
						<h3 class="font-bold text-base text-[#383123]">
							Ajukan Perpanjangan Masa Sewa
						</h3>
					</div>
					<p class="text-xs text-[#6B5E45] mt-1">
						{extendingRental.vehicle_brand_model} ({extendingRental.license_plate || 'Bebas Plat'})
					</p>
				</div>
				<button
					type="button"
					onclick={closeExtensionModal}
					class="w-7 h-7 rounded-lg text-[#877758] hover:bg-[#FAF8F4] flex items-center justify-center"
				>
					<Icon name="x" size={16} />
				</button>
			</div>

			<form method="POST" action="?/requestExtension" enctype="multipart/form-data" class="space-y-4 text-xs">
				<input type="hidden" name="rentalId" value={extendingRental.id} />

				<!-- Tanggal Saat Ini & Input Tanggal Baru -->
				<div class="p-4 bg-[#FAF8F4] rounded-xl border border-[#DFD5C2] space-y-3">
					<div class="flex justify-between items-center text-xs">
						<span class="text-[#877758]">Tanggal Selesai Saat Ini:</span>
						<span class="font-mono font-bold text-rose-700">{formatDateIndo(extendingRental.end_date)}</span>
					</div>

					<div>
						<label for="newEndDate" class="block font-bold text-[#383123] mb-1.5">
							Pilih Tanggal Selesai Baru <span class="text-rose-600">*</span>
						</label>
						<input
							type="date"
							id="newEndDate"
							name="newEndDate"
							bind:value={newEndDate}
							min={extendingRental.end_date}
							required
							class="w-full px-3.5 py-2.5 border border-[#DFD5C2] rounded-xl bg-white font-mono font-bold text-[#383123] focus:outline-none focus:border-[#71856A]"
						/>
					</div>

					<!-- Quick buttons (+1h, +3h, +7h) -->
					<div class="flex items-center gap-1.5 pt-1">
						<span class="text-[11px] text-[#877758]">Tambah Cepat:</span>
						<button
							type="button"
							onclick={() => {
								const d = new Date(extendingRental.end_date);
								d.setDate(d.getDate() + 1);
								newEndDate = d.toISOString().split('T')[0];
							}}
							class="px-2.5 py-1 text-[11px] bg-white hover:bg-[#EAE3D4] rounded-md border border-[#DFD5C2] font-mono"
						>+1 Hari</button>
						<button
							type="button"
							onclick={() => {
								const d = new Date(extendingRental.end_date);
								d.setDate(d.getDate() + 3);
								newEndDate = d.toISOString().split('T')[0];
							}}
							class="px-2.5 py-1 text-[11px] bg-white hover:bg-[#EAE3D4] rounded-md border border-[#DFD5C2] font-mono"
						>+3 Hari</button>
						<button
							type="button"
							onclick={() => {
								const d = new Date(extendingRental.end_date);
								d.setDate(d.getDate() + 7);
								newEndDate = d.toISOString().split('T')[0];
							}}
							class="px-2.5 py-1 text-[11px] bg-white hover:bg-[#EAE3D4] rounded-md border border-[#DFD5C2] font-mono"
						>+7 Hari</button>
					</div>
				</div>

				<!-- HASIL PENGECEKAN BENTROK JADWAL / KALKULASI BIAYA -->
				{#if !extensionCheck.isValid && extensionCheck.error}
					<div class="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-semibold flex items-start gap-2.5">
						<Icon name="alert" size={16} class="text-rose-600 shrink-0 mt-0.5" />
						<span>{extensionCheck.error}</span>
					</div>
				{:else if extensionCheck.isValid}
					<div class="p-4 bg-[#EFF3ED] border border-[#C2CCBC] rounded-xl text-xs space-y-2">
						<div class="flex justify-between">
							<span class="text-[#2E382A]">Tambahan Hari:</span>
							<span class="font-mono font-bold text-[#2E382A]">+{extensionCheck.days} Hari</span>
						</div>
						<div class="flex justify-between">
							<span class="text-[#2E382A]">Tarif Harian Garasi:</span>
							<span class="font-mono text-[#2E382A]">{formatRupiah(extendingRental.garage_daily_price)} / hari</span>
						</div>
						<div class="flex justify-between items-center text-sm font-extrabold border-t border-[#C2CCBC] pt-2 text-[#2E382A]">
							<span>Total Biaya Tambahan:</span>
							<span class="font-mono text-[#596A53]">{formatRupiah(extensionCheck.cost)}</span>
						</div>
					</div>
				{/if}

				<!-- Unggah Bukti Pelunasan Tambahan -->
				<div class="space-y-1.5">
					<label for="extensionPaymentProof" class="block font-bold text-[#383123]">
						Unggah Bukti Pelunasan Biaya Tambahan <span class="text-rose-600">*</span>
					</label>
					<input
						type="file"
						id="extensionPaymentProof"
						name="extensionPaymentProof"
						accept="image/*"
						required
						class="w-full text-xs text-[#6B5E45] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#242D21] file:text-white border border-[#DFD5C2] rounded-xl p-1.5 bg-[#FAF8F4]"
					/>
				</div>

				<!-- Footer Buttons -->
				<div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F4EFE7]">
					<button
						type="button"
						onclick={closeExtensionModal}
						class="px-4 py-2 bg-white hover:bg-[#FAF8F4] text-[#6B5E45] text-xs font-bold rounded-lg border border-[#DFD5C2] transition"
					>
						Batal
					</button>

					<button
						type="submit"
						disabled={!extensionCheck.isValid}
						class="px-5 py-2 bg-[#71856A] hover:bg-[#596A53] disabled:bg-[#BEB092] disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 btn-interactive"
					>
						<Icon name="check" size={14} />
						<span>Kirim Permintaan ke Admin</span>
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Lightbox Modal -->
{#if activeLightboxUrl}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
			<div class="flex items-center justify-between border-b pb-2">
				<h3 class="text-sm font-bold text-[#383123]">Bukti Pembayaran</h3>
				<button type="button" onclick={() => { activeLightboxUrl = null; }} class="text-xs font-bold">✕</button>
			</div>
			<div class="bg-[#FAF8F4] p-2 rounded-xl flex items-center justify-center">
				<img src={activeLightboxUrl} alt="Bukti Pembayaran" class="max-h-[60vh] object-contain rounded-lg" />
			</div>
			<div class="flex justify-end">
				<button type="button" onclick={() => { activeLightboxUrl = null; }} class="px-4 py-1.5 bg-[#242D21] text-white text-xs font-bold rounded-lg">Tutup</button>
			</div>
		</div>
	</div>
{/if}
