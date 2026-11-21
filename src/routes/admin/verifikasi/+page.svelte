<!-- src/routes/admin/verifikasi/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Verifikasi Pendaftar KTP - SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header with Earthy Palette -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="shield" size={14} />
				<span>Panel Administrasi</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Verifikasi Validasi KTP & Pendaftar Baru</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Tinjau dan validasi NIK KTP calon penyewa sebelum akun diberikan otorisasi untuk melakukan transaksi sewa garasi.
			</p>
		</div>
	</div>

	{#if form?.success}
		<div class="p-4 bg-[#EFF3ED] border border-[#C2CCBC] text-[#2E382A] rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="check" size={16} class="text-[#71856A]" />
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Antrean Menunggu Verifikasi (Pending) -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
			<div class="flex items-center gap-2.5">
				<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
					Permohonan Pendaftar Menunggu Verifikasi
				</h2>
				<span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FDFBF7] text-[#8A7545] border border-[#DAC99B]">
					{data.pendingUsers.length} Permohonan
				</span>
			</div>
		</div>

		{#if data.pendingUsers.length === 0}
			<div class="p-10 text-center text-[#A08F6E] text-xs">
				Tidak ada calon penyewa yang menunggu verifikasi KTP saat ini. Seluruh permohonan telah diproses.
			</div>
		{:else}
			<div class="divide-y divide-[#F4EFE7]">
				{#each data.pendingUsers as user (user.id)}
					<div class="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#FAF8F4] transition">
						<div class="space-y-1.5">
							<div class="flex items-center gap-2.5">
								<span class="font-bold text-sm text-[#383123]">{user.name}</span>
								<span class="text-xs font-mono font-bold bg-[#FAF8F4] text-[#4F4532] px-2.5 py-0.5 rounded-md border border-[#DFD5C2]">
									NIK: {user.nik}
								</span>
							</div>
							<div class="text-[11px] text-[#6B5E45] flex flex-wrap gap-x-4 gap-y-1 font-mono">
								<span class="font-sans">Email: {user.email}</span>
								<span>Telp: {user.phone}</span>
								<span>Tanggal Daftar: {user.created_at.split('T')[0]}</span>
							</div>
						</div>

						<div class="flex items-center gap-2.5 w-full md:w-auto shrink-0">
							<form method="POST" action="?/verify" class="flex-1 md:flex-initial">
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="decision" value="approved" />
								<button
									type="submit"
									class="w-full md:w-auto px-4 py-2 bg-[#71856A] hover:bg-[#596A53] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs btn-interactive"
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
									class="w-full md:w-auto px-4 py-2 bg-[#FAF8F4] hover:bg-rose-50 text-[#6B5E45] hover:text-rose-700 border border-[#DFD5C2] hover:border-rose-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs btn-interactive"
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
	<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4]">
			<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
				Daftar Calon Penyewa yang Telah Diverifikasi
			</h2>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
					<tr>
						<th class="py-3 px-4">Nama Lengkap</th>
						<th class="py-3 px-4 font-mono">NIK (KTP 16 Digit)</th>
						<th class="py-3 px-4">Kontak (Email / Telepon)</th>
						<th class="py-3 px-4 font-mono">Tanggal Registrasi</th>
						<th class="py-3 px-4">Status Otorisasi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-[#F4EFE7]">
					{#each data.processedUsers as user (user.id)}
						<tr class="hover:bg-[#FAF8F4] transition">
							<td class="py-3 px-4 font-bold text-[#383123]">{user.name}</td>
							<td class="py-3 px-4 font-mono text-[#4F4532] font-semibold">{user.nik}</td>
							<td class="py-3 px-4 text-[#6B5E45] font-mono text-[11px]">{user.email} • {user.phone}</td>
							<td class="py-3 px-4 text-[#877758] font-mono">{user.created_at.split('T')[0]}</td>
							<td class="py-3 px-4">
								<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase {user.status === 'approved' ? 'bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
									{user.status === 'approved' ? '✓ Disetujui (Approved)' : '✕ Ditolak (Rejected)'}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>