<!-- src/routes/admin/perpanjang/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Modal Bukti Bayar Preview
	let previewProofUrl = $state<string | null>(null);

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
</script>

<svelte:head>
	<title>Persetujuan Perpanjangan Sewa Garasi - Admin SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Admin Header -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="clock" size={14} />
				<span>Panel Administrasi Garasi</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Persetujuan Perpanjangan Sewa Garasi</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed max-w-2xl">
				Perpanjangan sewa hanya dapat diajukan oleh penyewa. Admin bertugas melihat permohonan dan menyetujui (ACC) jika slot garasi <strong>belum ada yang booking</strong> di tanggal setelah sewa berakhir.
			</p>
		</div>

		<div class="flex items-center gap-2">
			<span class="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold {data.pendingExtensions.length > 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]'}">
				{data.pendingExtensions.length} Permintaan Menunggu ACC
			</span>
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

	<!-- 1. DAFTAR PERMINTAAN PERPANJANGAN MENUNGGU PERSETUJUAN (PENDING) -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
				<Icon name="clock" size={15} class="text-[#71856A]" />
				<span>Permohonan Perpanjangan Dari Penyewa (Menunggu ACC)</span>
			</h2>
			<span class="text-xs text-[#877758]">
				Total: <strong>{data.pendingExtensions.length} Pengajuan</strong>
			</span>
		</div>

		{#if data.pendingExtensions.length === 0}
			<div class="bg-white rounded-xl p-10 text-center border border-[#DFD5C2] space-y-3 shadow-xs">
				<div class="w-12 h-12 rounded-full bg-[#EFF3ED] text-[#71856A] flex items-center justify-center mx-auto border border-[#DFE5DC]">
					<Icon name="check" size={24} />
				</div>
				<h3 class="text-sm font-bold text-[#383123]">Tidak Ada Permintaan Perpanjangan Menunggu ACC</h3>
				<p class="text-xs text-[#6B5E45] max-w-md mx-auto leading-relaxed">
					Semua permintaan perpanjangan sewa dari penyewa telah diproses. Permohonan baru yang diajukan oleh penyewa akan otomatis muncul di sini.
				</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each data.pendingExtensions as ext (ext.id)}
					<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
						<!-- Header Kartu Permohonan -->
						<div class="bg-[#FAF8F4] px-5 py-3.5 border-b border-[#F4EFE7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
							<div class="flex items-center gap-3">
								<span class="font-mono font-extrabold text-xs px-2.5 py-1 bg-[#383123] text-white rounded-md border border-[#4F4532]">
									{ext.garage_code}
								</span>
								<div>
									<span class="text-xs font-bold text-[#383123] block">
										{ext.vehicle_brand_model}
										{#if ext.license_plate}
											<span class="font-mono text-[11px] text-[#71856A] font-bold ml-1">({ext.license_plate})</span>
										{/if}
									</span>
									<span class="text-[10px] text-[#877758] font-medium uppercase">
										Kategori: {ext.garage_type.replace('_', ' ')}
									</span>
								</div>
							</div>

							<div class="flex items-center gap-2">
								<span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
									⏳ Menunggu Verifikasi Admin
								</span>
								<span class="text-[11px] text-[#A08F6E] font-mono">
									Diajukan: {ext.created_at ? ext.created_at.split('T')[0] : '-'}
								</span>
							</div>
						</div>

						<!-- Body Konten Permohonan -->
						<div class="p-5 space-y-4">
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
								<!-- Kolom 1: Data Penyewa -->
								<div class="bg-[#FCFAF4] p-3.5 rounded-xl border border-[#DFD5C2] space-y-1.5">
									<span class="text-[10px] font-bold text-[#877758] uppercase tracking-wider block">Identitas Penyewa</span>
									<div class="font-bold text-sm text-[#383123]">{ext.tenant_name}</div>
									<div class="text-[11px] text-[#6B5E45]">
										NIK: <span class="font-mono font-semibold">{ext.tenant_nik || '-'}</span>
									</div>
									<div class="text-[11px] text-[#6B5E45]">
										No. HP / WA: <span class="font-mono font-bold text-[#71856A]">{ext.tenant_phone || '-'}</span>
									</div>
									<div class="text-[11px] text-[#6B5E45] font-mono truncate">
										{ext.tenant_email}
									</div>
								</div>

								<!-- Kolom 2: Detail Masa Perpanjangan -->
								<div class="bg-[#FCFAF4] p-3.5 rounded-xl border border-[#DFD5C2] space-y-1.5">
									<span class="text-[10px] font-bold text-[#877758] uppercase tracking-wider block">Rincian Periode Sewa</span>
									<div class="text-[11px] text-[#6B5E45]">
										Tanggal Selesai Lama:
										<strong class="font-mono text-[#383123] block text-xs">{formatDateIndo(ext.old_end_date)}</strong>
									</div>
									<div class="text-[11px] text-[#71856A] font-semibold pt-1 border-t border-[#EAE3D4]">
										Tanggal Selesai Baru:
										<strong class="font-mono text-[#2E382A] block text-sm font-extrabold">{formatDateIndo(ext.new_end_date)}</strong>
									</div>
									<div class="text-[10px] font-mono text-[#877758]">
										Tambahan Durasi: <strong>+{ext.additional_days} Hari</strong>
									</div>
								</div>

								<!-- Kolom 3: Biaya Tambahan & Bukti Bayar -->
								<div class="bg-[#EFF3ED] p-3.5 rounded-xl border border-[#C2CCBC] space-y-2">
									<span class="text-[10px] font-bold text-[#2E382A] uppercase tracking-wider block">Finansial & Bukti Pelunasan</span>
									<div class="text-xs text-[#2E382A]">
										Tarif Garasi: <span class="font-mono font-bold">{formatRupiah(ext.garage_daily_price || 0)} / hari</span>
									</div>
									<div class="text-xs text-[#2E382A]">
										Biaya Tambahan:
										<span class="font-mono font-extrabold text-base text-[#2E382A] block mt-0.5">
											{formatRupiah(ext.additional_cost)}
										</span>
									</div>

									{#if ext.payment_proof}
										<div class="pt-1.5 border-t border-[#C2CCBC]">
											<button
												type="button"
												onclick={() => openProof(ext.payment_proof)}
												class="text-[11px] font-bold text-[#71856A] hover:text-[#596A53] underline flex items-center gap-1"
											>
												<Icon name="search" size={12} />
												<span>Lihat Bukti Transfer Pembayaran</span>
											</button>
										</div>
									{/if}
								</div>
							</div>

							<!-- INDIKATOR DETEKSI BOOKING SLOT GARASI (ATURAN UTAMA SOAL) -->
							<div class="p-3.5 rounded-xl text-xs font-medium border {ext.hasCollision ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-[#EFF3ED] border-[#C2CCBC] text-[#2E382A]'}">
								{#if ext.hasCollision}
									<div class="flex items-start gap-2.5">
										<Icon name="alert" size={18} class="text-rose-600 shrink-0 mt-0.5" />
										<div>
											<div class="font-bold text-sm text-rose-700">
												⛔ PERPANJANGAN TIDAK BISA DI-ACC: Slot Garasi Sudah Ada Yang Booking!
											</div>
											<p class="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
												Slot garasi <strong>{ext.garage_code}</strong> telah dibooking oleh penyewa lain (<strong>{ext.collisionDetails?.booked_by_name}</strong> - {ext.collisionDetails?.vehicle_brand_model}) pada periode <strong>{formatDateIndo(ext.collisionDetails?.start_date)} s/d {formatDateIndo(ext.collisionDetails?.end_date)}</strong>. Sesuai aturan sistem, penyewa lama tidak dapat memperpanjang sewa pada tanggal tersebut.
											</p>
										</div>
									</div>
								{:else}
									<div class="flex items-start gap-2.5">
										<Icon name="check" size={18} class="text-[#71856A] shrink-0 mt-0.5" />
										<div>
											<div class="font-bold text-sm text-[#2E382A]">
												✅ Slot Garasi Bersih (Belum Ada Yang Booking Setelah Tanggal Berakhir)
											</div>
											<p class="text-[11px] text-[#596A53] mt-0.5 leading-relaxed">
												Slot garasi <strong>{ext.garage_code}</strong> tidak memiliki jadwal sewa/booking lain pada rentang tanggal perpanjangan. Permohonan aman untuk disetujui (ACC).
											</p>
										</div>
									</div>
								{/if}
							</div>

							<!-- Tindakan Admin (ACC / Tolak) -->
							<div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#F4EFE7]">
								<div class="text-[11px] text-[#877758] italic">
									* Menyetujui akan otomatis memperbarui tanggal akhir kontrak sewa penyewa di sistem.
								</div>

								<div class="flex items-center gap-2.5 w-full sm:w-auto">
									<!-- Form Tolak -->
									<form method="POST" action="?/rejectExtension" class="inline">
										<input type="hidden" name="extensionId" value={ext.id} />
										<button
											type="submit"
											onclick={(e) => {
												if (!confirm(`Apakah Anda yakin ingin MENOLAK perpanjangan sewa slot ${ext.garage_code} untuk ${ext.tenant_name}?`)) {
													e.preventDefault();
												}
											}}
											class="px-4 py-2 bg-white hover:bg-rose-50 text-[#877758] hover:text-rose-700 text-xs font-bold rounded-lg border border-[#DFD5C2] hover:border-rose-300 transition"
										>
											Tolak Permohonan
										</button>
									</form>

									<!-- Form Setujui (ACC) - Dinonaktifkan jika ada bentrok booking -->
									<form method="POST" action="?/approveExtension" class="inline">
										<input type="hidden" name="extensionId" value={ext.id} />
										<button
											type="submit"
											disabled={ext.hasCollision}
											class="px-5 py-2 bg-[#71856A] hover:bg-[#596A53] disabled:bg-[#BEB092] disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 btn-interactive"
											title={ext.hasCollision ? 'Tidak dapat di-ACC karena slot sudah dibooking penyewa lain' : 'Setujui Perpanjangan'}
										>
											<Icon name="check" size={14} />
											<span>Setujui (ACC) Perpanjangan</span>
										</button>
									</form>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- 2. TABEL RIWAYAT PERSETUJUAN PERPANJANGAN SEWA SEBELUMNYA -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
			<div>
				<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
					Riwayat Persetujuan Perpanjangan Sewa
				</h2>
				<p class="text-[11px] text-[#6B5E45] mt-0.5">
					Catatan riwayat permohonan yang telah di-ACC (disetujui) atau ditolak oleh admin.
				</p>
			</div>
			<span class="text-xs font-mono font-bold text-[#71856A]">
				{data.extensionHistory.length} Riwayat Tercatat
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
							<th class="py-3 px-4">Nama Penyewa & Kendaraan</th>
							<th class="py-3 px-4 font-mono">Tanggal Lama</th>
							<th class="py-3 px-4 font-mono">Tanggal Baru</th>
							<th class="py-3 px-4 font-mono text-center">Tambahan</th>
							<th class="py-3 px-4 font-mono text-right">Biaya Tambahan</th>
							<th class="py-3 px-4 text-center">Status ACC</th>
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
								<td class="py-3 px-4 font-mono text-[#877758]">{ext.old_end_date}</td>
								<td class="py-3 px-4 font-mono font-bold text-[#383123]">{ext.new_end_date}</td>
								<td class="py-3 px-4 font-mono text-center">+{ext.additional_days} hari</td>
								<td class="py-3 px-4 font-mono text-right font-extrabold text-[#596A53]">
									{formatRupiah(ext.additional_cost)}
								</td>
								<td class="py-3 px-4 text-center">
									{#if ext.status === 'approved'}
										<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]">
											✓ Disetujui (ACC)
										</span>
									{:else if ext.status === 'rejected'}
										<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
											✕ Ditolak
										</span>
									{:else}
										<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
											⏳ Pending
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
