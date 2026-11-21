<!-- src/routes/admin/perpanjang/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Modal Bukti Bayar Preview
	let previewProofUrl = $state<string | null>(null);

	// State Modal Perpanjang Sewa Langsung oleh Admin (FR.IA.04A)
	let selectedRental = $state<any | null>(null);
	let newEndDate = $state<string>('');
	let proofFilePreview = $state<string | null>(null);

	// Perhitungan real-time
	let additionalDays = $derived.by(() => {
		if (!selectedRental || !newEndDate) return 0;
		const d1 = new Date(selectedRental.end_date);
		const d2 = new Date(newEndDate);
		const diff = d2.getTime() - d1.getTime();
		const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
		return days > 0 ? days : 0;
	});

	let additionalCost = $derived.by(() => {
		if (!selectedRental || additionalDays <= 0) return 0;
		return additionalDays * (selectedRental.garage_daily_price || 0);
	});

	let isCollisionWithNextBooking = $derived.by(() => {
		if (!selectedRental || !newEndDate) return false;
		if (selectedRental.next_booking) {
			return newEndDate > selectedRental.next_booking.start_date;
		}
		return false;
	});

	function openDirectExtendModal(rental: any) {
		selectedRental = rental;
		// Default tanggal baru: 1 hari setelah tanggal selesai saat ini
		const currentEnd = new Date(rental.end_date);
		currentEnd.setDate(currentEnd.getDate() + 1);
		newEndDate = currentEnd.toISOString().split('T')[0];
		proofFilePreview = null;
	}

	function closeDirectExtendModal() {
		selectedRental = null;
		newEndDate = '';
		proofFilePreview = null;
	}

	function handleProofFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const reader = new FileReader();
			reader.onload = (ev) => {
				proofFilePreview = ev.target?.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			proofFilePreview = null;
		}
	}

	function openProof(url: string) {
		previewProofUrl = url;
	}

	function closeProof() {
		previewProofUrl = null;
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

	function getMinDate(dateStr: string) {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		d.setDate(d.getDate() + 1);
		return d.toISOString().split('T')[0];
	}
</script>

<svelte:head>
	<title>Perpanjang Status Garasi - Admin GARTA Takalar</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Admin Header -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="clock" size={14} />
				<span>Panel Administrasi GARTA Takalar</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Perpanjang Status Sewa Garasi</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed max-w-2xl">
				Sesuai instruksi soal uji LSP: Admin dapat memilih garasi yang sedang aktif disewa hari ini, mengubah tanggal selesai sewa, melihat kalkulasi sisa biaya otomatis, dan mengunggah bukti bayar perpanjangan.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<span class="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]">
				{data.activeRentedGarages.length} Slot Sedang Disewa Hari Ini
			</span>
			{#if data.pendingExtensions.length > 0}
				<span class="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
					{data.pendingExtensions.length} Pengajuan Penyewa
				</span>
			{/if}
		</div>
	</div>

	<!-- Alert Messages -->
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

	<!-- ================= 1. DAFTAR GARASI YANG SEDANG DISEWA PADA HARI ITU (FR.IA.04A) ================= -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
			<div>
				<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
					<Icon name="car" size={15} class="text-[#71856A]" />
					<span>Daftar Garasi yang Sedang Disewa Hari Ini</span>
				</h2>
				<p class="text-[11px] text-[#6B5E45] mt-0.5">
					Pilih salah satu unit garasi di bawah ini untuk memperpanjang tanggal selesai sewa dan menghitung sisa biaya.
				</p>
			</div>
			<span class="text-xs font-mono font-bold text-[#71856A]">
				Tanggal Sistem: {formatDateIndo(data.today)}
			</span>
		</div>

		{#if data.activeRentedGarages.length === 0}
			<div class="p-10 text-center text-[#A08F6E] text-xs space-y-2">
				<Icon name="car" size={32} class="mx-auto text-[#BEB092] opacity-60" />
				<div class="font-bold text-[#383123]">Tidak Ada Garasi yang Sedang Disewa Hari Ini</div>
				<p class="text-[11px] max-w-sm mx-auto text-[#877758]">
					Semua slot garasi saat ini berstatus kosong atau masa sewa telah selesai.
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
						<tr>
							<th class="py-3 px-4">Unit Slot</th>
							<th class="py-3 px-4">Penyewa & Kontak</th>
							<th class="py-3 px-4">Kendaraan Terparkir</th>
							<th class="py-3 px-4 font-mono">Batas Selesai Sewa</th>
							<th class="py-3 px-4 font-mono text-right">Tarif / Hari</th>
							<th class="py-3 px-4">Jadwal Antrean</th>
							<th class="py-3 px-4 text-center">Aksi Admin</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#F4EFE7]">
						{#each data.activeRentedGarages as rent (rent.rental_id)}
							<tr class="hover:bg-[#FAF8F4] transition">
								<td class="py-3 px-4">
									<div class="font-mono font-extrabold text-sm text-[#383123]">
										<span class="px-2.5 py-1 rounded-md bg-[#383123] text-white">
											{rent.garage_code}
										</span>
									</div>
									<div class="text-[10px] text-[#877758] mt-1 uppercase font-semibold">
										{rent.garage_type.replace('_', ' ')}
									</div>
								</td>
								<td class="py-3 px-4">
									<div class="font-bold text-sm text-[#383123]">{rent.tenant_name}</div>
									<div class="text-[11px] text-[#6B5E45] font-mono">{rent.tenant_phone || '-'}</div>
									<div class="text-[10px] text-[#877758] font-mono truncate max-w-[140px]">{rent.tenant_email}</div>
								</td>
								<td class="py-3 px-4">
									<div class="font-bold text-[#383123]">{rent.vehicle_brand_model}</div>
									{#if rent.license_plate}
										<div class="font-mono text-[11px] font-bold text-[#71856A]">
											{rent.license_plate}
										</div>
									{:else}
										<div class="text-[10px] text-[#877758] italic">Bebas Plat (Sepeda)</div>
									{/if}
								</td>
								<td class="py-3 px-4 font-mono">
									<div class="font-bold text-[#383123]">{formatDateIndo(rent.end_date)}</div>
									<div class="text-[10px] text-[#877758]">Mulai: {formatDateIndo(rent.start_date)}</div>
								</td>
								<td class="py-3 px-4 font-mono text-right font-bold text-[#596A53]">
									{formatRupiah(rent.garage_daily_price)}
								</td>
								<td class="py-3 px-4">
									{#if rent.next_booking}
										<div class="p-1.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-tight">
											<span class="font-bold block">Ada Booking Berikutnya:</span>
											<span>{rent.next_booking.booked_by_name} ({formatDateIndo(rent.next_booking.start_date)})</span>
										</div>
									{:else}
										<span class="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#EFF3ED] text-[#596A53]">
											Slot Kosong Setelahnya
										</span>
									{/if}
								</td>
								<td class="py-3 px-4 text-center">
									<button
										type="button"
										onclick={() => openDirectExtendModal(rent)}
										class="px-3 py-1.5 bg-[#71856A] hover:bg-[#596A53] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 mx-auto btn-interactive"
									>
										<Icon name="clock" size={13} />
										<span>Perpanjang Sewa</span>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<!-- ================= 2. PERMOHONAN PERPANJANGAN DARI PENYEWA (JIKA ADA REQUEST) ================= -->
	{#if data.pendingExtensions.length > 0}
		<div class="space-y-4 pt-2">
			<div class="flex items-center justify-between">
				<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
					<Icon name="clock" size={15} class="text-amber-600" />
					<span>Permohonan Perpanjangan Dari Penyewa (Menunggu ACC)</span>
				</h2>
				<span class="text-xs text-[#877758]">
					Total: <strong>{data.pendingExtensions.length} Pengajuan</strong>
				</span>
			</div>

			<div class="space-y-4">
				{#each data.pendingExtensions as ext (ext.id)}
					<div class="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden card-hover">
						<div class="bg-amber-50/70 px-5 py-3 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
							<div class="flex items-center gap-3">
								<span class="font-mono font-extrabold text-xs px-2.5 py-1 bg-[#383123] text-white rounded-md">
									{ext.garage_code}
								</span>
								<div class="text-xs font-bold text-[#383123]">
									{ext.tenant_name} &bull; {ext.vehicle_brand_model}
								</div>
							</div>
							<span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
								⏳ Menunggu Verifikasi Admin
							</span>
						</div>

						<div class="p-5 space-y-4">
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
								<div class="bg-[#FCFAF4] p-3 rounded-xl border border-[#DFD5C2]">
									<span class="text-[10px] font-bold text-[#877758] uppercase block">Penyewa</span>
									<div class="font-bold text-[#383123]">{ext.tenant_name}</div>
									<div class="text-[11px] text-[#6B5E45] font-mono">{ext.tenant_phone}</div>
								</div>
								<div class="bg-[#FCFAF4] p-3 rounded-xl border border-[#DFD5C2]">
									<span class="text-[10px] font-bold text-[#877758] uppercase block">Perubahan Periode</span>
									<div class="text-[11px] text-[#877758]">Lama: {formatDateIndo(ext.old_end_date)}</div>
									<div class="text-xs font-bold text-[#2E382A]">Baru: {formatDateIndo(ext.new_end_date)} (+{ext.additional_days} hari)</div>
								</div>
								<div class="bg-[#EFF3ED] p-3 rounded-xl border border-[#C2CCBC]">
									<span class="text-[10px] font-bold text-[#2E382A] uppercase block">Sisa Biaya Tambahan</span>
									<div class="text-sm font-extrabold text-[#2E382A]">{formatRupiah(ext.additional_cost)}</div>
									{#if ext.payment_proof}
										<button
											type="button"
											onclick={() => openProof(ext.payment_proof)}
											class="text-[11px] font-bold text-[#71856A] underline mt-1 block"
										>
											Lihat Bukti Transfer
										</button>
									{/if}
								</div>
							</div>

							<!-- Tindakan Admin -->
							<div class="flex items-center justify-end gap-2 pt-2 border-t border-[#F4EFE7]">
								<form method="POST" action="?/rejectExtension">
									<input type="hidden" name="extensionId" value={ext.id} />
									<button
										type="submit"
										class="px-4 py-2 bg-white hover:bg-rose-50 text-[#877758] hover:text-rose-700 text-xs font-bold rounded-lg border border-[#DFD5C2] hover:border-rose-300 transition"
									>
										Tolak
									</button>
								</form>

								<form method="POST" action="?/approveExtension">
									<input type="hidden" name="extensionId" value={ext.id} />
									<button
										type="submit"
										disabled={ext.hasCollision}
										class="px-5 py-2 bg-[#71856A] hover:bg-[#596A53] disabled:bg-[#BEB092] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 btn-interactive"
									>
										<Icon name="check" size={14} />
										<span>Setujui (ACC)</span>
									</button>
								</form>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- ================= 3. RIWAYAT PERSETUJUAN PERPANJANGAN SEWA ================= -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
			<div>
				<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
					Riwayat Perpanjangan Sewa Garasi
				</h2>
				<p class="text-[11px] text-[#6B5E45] mt-0.5">
					Catatan seluruh perpanjangan yang telah disetujui (ACC) atau ditolak oleh admin.
				</p>
			</div>
			<span class="text-xs font-mono font-bold text-[#71856A]">
				{data.extensionHistory.length} Riwayat
			</span>
		</div>

		{#if data.extensionHistory.length === 0}
			<div class="p-8 text-center text-[#A08F6E] text-xs">
				Belum ada riwayat permohonan perpanjangan yang diproses.
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
						<tr>
							<th class="py-3 px-4">Unit Garasi</th>
							<th class="py-3 px-4">Penyewa & Kendaraan</th>
							<th class="py-3 px-4 font-mono">Tanggal Lama</th>
							<th class="py-3 px-4 font-mono">Tanggal Baru</th>
							<th class="py-3 px-4 font-mono text-center">Tambahan</th>
							<th class="py-3 px-4 font-mono text-right">Biaya Tambahan</th>
							<th class="py-3 px-4 text-center">Bukti Bayar</th>
							<th class="py-3 px-4 text-center">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#F4EFE7]">
						{#each data.extensionHistory as ext (ext.id)}
							<tr class="hover:bg-[#FAF8F4] transition">
								<td class="py-3 px-4 font-mono font-bold text-[#383123]">
									<span class="px-2 py-0.5 rounded bg-[#FAF8F4] border border-[#DFD5C2]">
										{ext.garage_code}
									</span>
								</td>
								<td class="py-3 px-4">
									<div class="font-bold text-[#383123]">{ext.tenant_name}</div>
									<div class="text-[11px] text-[#6B5E45]">
										{ext.vehicle_brand_model}
										{#if ext.license_plate}
											<span class="font-mono text-[#71856A]">({ext.license_plate})</span>
										{/if}
									</div>
								</td>
								<td class="py-3 px-4 font-mono text-[#877758]">{formatDateIndo(ext.old_end_date)}</td>
								<td class="py-3 px-4 font-mono font-bold text-[#383123]">{formatDateIndo(ext.new_end_date)}</td>
								<td class="py-3 px-4 font-mono text-center">+{ext.additional_days} hari</td>
								<td class="py-3 px-4 font-mono text-right font-extrabold text-[#596A53]">
									{formatRupiah(ext.additional_cost)}
								</td>
								<td class="py-3 px-4 text-center">
									{#if ext.payment_proof}
										<button
											type="button"
											onclick={() => openProof(ext.payment_proof)}
											class="text-[11px] font-bold text-[#71856A] hover:underline"
										>
											Lihat
										</button>
									{:else}
										<span class="text-[#BEB092]">-</span>
									{/if}
								</td>
								<td class="py-3 px-4 text-center">
									{#if ext.status === 'approved'}
										<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]">
											✓ Disetujui (ACC)
										</span>
									{:else}
										<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
											✕ Ditolak
										</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- ================= MODAL PERPANJANG STATUS SEWA LANGSUNG OLEH ADMIN (FR.IA.04A) ================= -->
{#if selectedRental}
	<div class="fixed inset-0 z-50 bg-[#252016]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
		<div class="bg-white rounded-2xl border border-[#DFD5C2] max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 my-8">
			<!-- Modal Header -->
			<div class="flex items-center justify-between border-b border-[#F4EFE7] pb-3.5">
				<div>
					<h3 class="text-base font-extrabold text-[#383123] flex items-center gap-2">
						<Icon name="clock" size={18} class="text-[#71856A]" />
						<span>Perpanjang Status Sewa Garasi</span>
					</h3>
					<p class="text-xs text-[#6B5E45] mt-0.5">
						Ubah tanggal selesai sewa dan unggah bukti bayar perpanjangan.
					</p>
				</div>
				<button
					type="button"
					onclick={closeDirectExtendModal}
					class="w-8 h-8 rounded-lg bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] flex items-center justify-center font-bold text-sm"
				>
					✕
				</button>
			</div>

			<!-- Rincian Unit Garasi & Penyewa -->
			<div class="bg-[#FCFAF4] p-4 rounded-xl border border-[#DFD5C2] space-y-2 text-xs">
				<div class="flex items-center justify-between">
					<span class="text-[#877758] font-semibold">Unit Garasi:</span>
					<span class="font-mono font-extrabold text-[#383123] px-2 py-0.5 bg-white rounded border border-[#DFD5C2]">
						{selectedRental.garage_code} ({selectedRental.garage_type.replace('_', ' ')})
					</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-[#877758] font-semibold">Penyewa:</span>
					<span class="font-bold text-[#383123]">{selectedRental.tenant_name}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-[#877758] font-semibold">Kendaraan:</span>
					<span class="font-semibold text-[#383123]">
						{selectedRental.vehicle_brand_model}
						{#if selectedRental.license_plate}
							<span class="font-mono text-[#71856A]">({selectedRental.license_plate})</span>
						{/if}
					</span>
				</div>
				<div class="flex items-center justify-between pt-1 border-t border-[#EAE3D4]">
					<span class="text-[#877758] font-semibold">Batas Selesai Saat Ini:</span>
					<span class="font-mono font-bold text-rose-700">{formatDateIndo(selectedRental.end_date)}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-[#877758] font-semibold">Tarif Sewa:</span>
					<span class="font-mono font-bold text-[#596A53]">{formatRupiah(selectedRental.garage_daily_price)} / hari</span>
				</div>
			</div>

			<!-- Form Perpanjangan -->
			<form method="POST" action="?/adminDirectExtend" enctype="multipart/form-data" class="space-y-4">
				<input type="hidden" name="rentalId" value={selectedRental.rental_id} />

				<!-- 1. Input Tanggal Selesai Baru -->
				<div class="space-y-1.5">
					<label for="newEndDate" class="text-xs font-bold text-[#383123] block">
						Tanggal Selesai Sewa Baru <span class="text-rose-500">*</span>
					</label>
					<input
						type="date"
						id="newEndDate"
						name="newEndDate"
						bind:value={newEndDate}
						min={getMinDate(selectedRental.end_date)}
						required
						class="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-white text-xs font-mono font-semibold focus:outline-none focus:border-[#71856A] focus:ring-1 focus:ring-[#71856A]"
					/>
					<span class="text-[10px] text-[#877758] block">
						Pilih tanggal yang lebih lama dari {formatDateIndo(selectedRental.end_date)}.
					</span>
				</div>

				<!-- Warning jika bentrok dengan booking berikutnya -->
				{#if isCollisionWithNextBooking}
					<div class="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 space-y-1">
						<div class="font-bold flex items-center gap-1.5 text-rose-700">
							<Icon name="alert" size={15} />
							<span>⛔ Tanggal Bentrok dengan Booking Lain!</span>
						</div>
						<p class="text-[11px] leading-relaxed text-rose-800">
							Slot garasi ini telah dibooking oleh <strong>{selectedRental.next_booking.booked_by_name}</strong> ({selectedRental.next_booking.vehicle_brand_model}) mulai tanggal <strong>{formatDateIndo(selectedRental.next_booking.start_date)}</strong>. Batas perpanjangan maksimal adalah <strong>{formatDateIndo(selectedRental.next_booking.start_date)}</strong>.
						</p>
					</div>
				{/if}

				<!-- 2. Kalkulasi Sisa Biaya Otomatis (Sesuai Soal) -->
				<div class="bg-[#EFF3ED] p-4 rounded-xl border border-[#C2CCBC] space-y-2">
					<div class="flex items-center justify-between text-xs text-[#2E382A]">
						<span>Tambahan Masa Sewa:</span>
						<span class="font-mono font-bold">+{additionalDays} Hari</span>
					</div>
					<div class="flex items-center justify-between text-xs text-[#2E382A]">
						<span>Tarif Harian Garasi:</span>
						<span class="font-mono font-bold">{formatRupiah(selectedRental.garage_daily_price)} / hari</span>
					</div>
					<div class="pt-2 border-t border-[#C2CCBC] flex items-center justify-between">
						<div>
							<span class="text-xs font-extrabold text-[#2E382A] block">Sisa Biaya yang Harus Dibayarkan:</span>
							<span class="text-[10px] text-[#596A53]">Dihitung otomatis oleh sistem</span>
						</div>
						<span class="font-mono font-extrabold text-base text-[#2E382A]">
							{formatRupiah(additionalCost)}
						</span>
					</div>
				</div>

				<!-- 3. Upload Bukti Bayar (Admin mengupload bukti bayar) -->
				<div class="space-y-1.5">
					<label for="paymentProof" class="text-xs font-bold text-[#383123] block">
						Unggah Bukti Bayar Pelunasan <span class="text-rose-500">*</span>
					</label>
					<input
						type="file"
						id="paymentProof"
						name="paymentProof"
						accept="image/*"
						onchange={handleProofFileChange}
						required
						class="w-full text-xs text-[#6B5E45] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#383123] file:text-white hover:file:bg-[#4F4532] file:cursor-pointer cursor-pointer border border-[#DFD5C2] rounded-xl p-1.5 bg-white"
					/>
					<span class="text-[10px] text-[#877758] block">
						Format file: JPG, PNG, atau WebP (struk transfer / kuitansi pelunasan).
					</span>

					{#if proofFilePreview}
						<div class="mt-2 p-2 bg-[#FCFAF4] border border-[#DFD5C2] rounded-xl">
							<span class="text-[10px] font-bold text-[#877758] block mb-1">Pratinjau Bukti Bayar:</span>
							<img src={proofFilePreview} alt="Preview Bukti Bayar" class="max-h-36 rounded-lg object-contain mx-auto" />
						</div>
					{/if}
				</div>

				<!-- Tombol Aksi Modal -->
				<div class="pt-3 border-t border-[#F4EFE7] flex items-center justify-end gap-2.5">
					<button
						type="button"
						onclick={closeDirectExtendModal}
						class="px-4 py-2 bg-white hover:bg-[#FAF8F4] text-[#6B5E45] text-xs font-bold rounded-lg border border-[#DFD5C2] transition"
					>
						Batal
					</button>

					<button
						type="submit"
						disabled={additionalDays <= 0 || isCollisionWithNextBooking}
						class="px-5 py-2 bg-[#71856A] hover:bg-[#596A53] disabled:bg-[#BEB092] disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 btn-interactive"
					>
						<Icon name="check" size={14} />
						<span>Simpan & Perpanjang Status Sewa</span>
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ================= MODAL PRATINJAU BUKTI PEMBAYARAN ================= -->
{#if previewProofUrl}
	<div class="fixed inset-0 z-50 bg-[#252016]/50 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl border border-[#DFD5C2] max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
			<div class="flex items-center justify-between border-b border-[#F4EFE7] pb-3">
				<h3 class="text-sm font-extrabold text-[#383123] flex items-center gap-2">
					<Icon name="search" size={16} class="text-[#71856A]" />
					<span>Bukti Transfer Pembayaran Perpanjangan</span>
				</h3>
				<button
					type="button"
					onclick={closeProof}
					class="w-7 h-7 rounded-lg bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] flex items-center justify-center font-bold text-xs"
				>
					✕
				</button>
			</div>

			<div class="border border-[#DFD5C2] rounded-xl overflow-hidden bg-[#FAF8F4] flex items-center justify-center p-2 min-h-[240px]">
				<img
					src={previewProofUrl}
					alt="Bukti Transfer Perpanjangan"
					class="max-w-full max-h-[70vh] object-contain rounded-lg"
				/>
			</div>

			<div class="flex justify-end pt-2">
				<button
					type="button"
					onclick={closeProof}
					class="px-4 py-2 bg-[#383123] text-white font-bold rounded-lg text-xs hover:bg-[#4F4532] transition"
				>
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}
