<!-- src/routes/admin/verifikasi/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Verifikasi KTP Pendaftar - GARTA Takalar</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header with Dark Automotive Palette -->
	<div class="bg-gradient-to-r from-[#242D21] via-[#2D382A] to-[#1C2319] text-white rounded-2xl p-6 sm:p-7 shadow-md border border-[#3E4F39] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
		<div class="space-y-1.5 relative z-10">
			<div class="inline-flex items-center gap-2 text-xs font-bold text-[#E5C772] uppercase tracking-wider font-mono">
				<Icon name="shield" size={13} />
				<span>Panel Otorisasi Administrator</span>
			</div>
			<h1 class="text-2xl font-extrabold text-[#FAF8F4] tracking-tight">
				Verifikasi Validasi KTP & Pendaftar Baru
			</h1>
			<p class="text-xs text-[#D1DDCE] leading-relaxed max-w-xl">
				Sesuai petunjuk soal LSP: Setelah validasi NIK 16 digit KTP, Administrator dapat menerima (Approve) atau menolak (Reject) calon penyewa baru sebelum diizinkan menyewa garasi.
			</p>
		</div>

		<div class="flex items-center gap-2 relative z-10">
			<span class="px-4 py-2 rounded-xl text-xs font-mono font-bold {data.pendingUsers.length > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-[#384634] text-[#D1DDCE] border border-[#4F624A]'}">
				{data.pendingUsers.length} Permohonan Menunggu
			</span>
		</div>
	</div>

	{#if form?.success}
		<div class="p-4 bg-[#EFF3ED] border border-[#C2CCBC] text-[#2E382A] rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="check" size={16} class="text-[#71856A]" />
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Antrean Menunggu Verifikasi (Pending) -->
	<div class="bg-white rounded-2xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
			<div class="flex items-center gap-2.5">
				<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
					<Icon name="user" size={15} class="text-[#71856A]" />
					<span>Antrean Pendaftar Menunggu Validasi KTP</span>
				</h2>
				<span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
					{data.pendingUsers.length} Pendaftar
				</span>
			</div>
		</div>

		{#if data.pendingUsers.length === 0}
			<div class="p-12 text-center text-[#A08F6E] text-xs space-y-2">
				<Icon name="check" size={32} class="mx-auto text-[#71856A]" />
				<div class="font-bold text-[#383123]">Seluruh Calon Penyewa Telah Diverifikasi</div>
				<p class="text-[11px] text-[#877758] max-w-sm mx-auto">
					Tidak ada antrean pendaftar baru yang berstatus pending saat ini.
				</p>
			</div>
		{:else}
			<div class="divide-y divide-[#F4EFE7]">
				{#each data.pendingUsers as user (user.id)}
					<div class="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#FAF8F4] transition">
						<div class="space-y-1.5">
							<div class="flex flex-wrap items-center gap-2.5">
								<span class="font-bold text-sm text-[#383123]">{user.name}</span>
								<span class="text-xs font-mono font-bold bg-[#242D21] text-[#FAF8F4] px-2.5 py-0.5 rounded-md shadow-xs">
									NIK: {user.nik}
								</span>
							</div>
							<div class="text-[11px] text-[#6B5E45] flex flex-wrap gap-x-4 gap-y-1 font-mono">
								<span class="font-sans">Email: {user.email}</span>
								<span>No. WA: {user.phone}</span>
								<span>Registrasi: {user.created_at.split('T')[0]}</span>
							</div>
						</div>

						<div class="flex items-center gap-2.5 w-full md:w-auto shrink-0">
							<form method="POST" action="?/verify" class="flex-1 md:flex-initial">
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="decision" value="approved" />
								<button
									type="submit"
									class="w-full md:w-auto px-4 py-2 bg-[#71856A] hover:bg-[#596A53] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs btn-interactive"
								>
									<Icon name="check" size={14} />
									<span>Setujui (Approve)</span>
								</button>
							</form>

							<form method="POST" action="?/verify" class="flex-1 md:flex-initial">
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="decision" value="rejected" />
								<button
									type="submit"
									class="w-full md:w-auto px-4 py-2 bg-white hover:bg-rose-50 text-[#6B5E45] hover:text-rose-700 border border-[#DFD5C2] hover:border-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs btn-interactive"
								>
									<Icon name="x" size={14} />
									<span>Tolak (Reject)</span>
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Riwayat Pendaftar yang telah diproses -->
	<div class="bg-white rounded-2xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
			<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
				Daftar Calon Penyewa yang Telah Diverifikasi
			</h2>
			<span class="text-xs text-[#71856A] font-mono font-bold">
				{data.processedUsers.length} Riwayat
			</span>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
					<tr>
						<th class="py-3.5 px-4">Nama Lengkap</th>
						<th class="py-3.5 px-4 font-mono">NIK (KTP 16 Digit)</th>
						<th class="py-3.5 px-4">Kontak (Email / Telepon)</th>
						<th class="py-3.5 px-4 font-mono">Tanggal Registrasi</th>
						<th class="py-3.5 px-4 text-center">Status Otorisasi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-[#F4EFE7]">
					{#if data.processedUsers.length === 0}
						<tr>
							<td colspan="5" class="p-8 text-center text-[#A08F6E]">Belum ada riwayat pendaftar yang diverifikasi.</td>
						</tr>
					{:else}
						{#each data.processedUsers as user (user.id)}
							<tr class="hover:bg-[#FAF8F4] transition">
								<td class="py-3 px-4 font-bold text-[#383123]">{user.name}</td>
								<td class="py-3 px-4 font-mono text-[#383123] font-semibold">{user.nik}</td>
								<td class="py-3 px-4 text-[#6B5E45] font-mono text-[11px]">{user.email} &bull; {user.phone}</td>
								<td class="py-3 px-4 text-[#877758] font-mono">{user.created_at.split('T')[0]}</td>
								<td class="py-3 px-4 text-center">
									<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase {user.status === 'approved' ? 'bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
										{user.status === 'approved' ? '✓ Disetujui (Approved)' : '✕ Ditolak (Rejected)'}
									</span>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
