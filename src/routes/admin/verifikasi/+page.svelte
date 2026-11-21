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
	<!-- Page Header -->
	<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
				<Icon name="shield" size={14} class="text-blue-600" />
				<span>Panel Administrasi</span>
			</div>
			<h1 class="text-lg font-bold text-slate-900 mt-1">Verifikasi Validasi KTP & Pendaftar Baru</h1>
			<p class="text-xs text-slate-500 mt-0.5">
				Tinjau dan validasi NIK KTP calon penyewa sebelum akun diberikan otorisasi untuk melakukan transaksi sewa.
			</p>
		</div>
	</div>

	{#if form?.success}
		<div class="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-medium flex items-center gap-2">
			<Icon name="check" size={15} class="text-emerald-600" />
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Antrean Menunggu Verifikasi (Pending) -->
	<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
		<div class="p-4 border-b border-slate-100 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
					Permohonan Pendaftar Menunggu Verifikasi
				</h2>
				<span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
					{data.pendingUsers.length} Permohonan
				</span>
			</div>
		</div>

		{#if data.pendingUsers.length === 0}
			<div class="p-8 text-center text-slate-400 text-xs">
				Tidak ada calon penyewa yang menunggu verifikasi KTP saat ini.
			</div>
		{:else}
			<div class="divide-y divide-slate-100">
				{#each data.pendingUsers as user (user.id)}
					<div class="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<span class="font-bold text-xs text-slate-900">{user.name}</span>
								<span class="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
									NIK: {user.nik}
								</span>
							</div>
							<div class="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1 font-mono">
								<span class="font-sans">Email: {user.email}</span>
								<span>Telp: {user.phone}</span>
								<span>Daftar: {user.created_at.split('T')[0]}</span>
							</div>
						</div>

						<div class="flex items-center gap-2 w-full md:w-auto shrink-0">
							<form method="POST" action="?/verify" class="flex-1 md:flex-initial">
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="decision" value="approved" />
								<button
									type="submit"
									class="w-full md:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition flex items-center justify-center gap-1 shadow-xs"
								>
									<Icon name="check" size={13} />
									<span>Setujui (Approve)</span>
								</button>
							</form>

							<form method="POST" action="?/verify" class="flex-1 md:flex-initial">
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="decision" value="rejected" />
								<button
									type="submit"
									class="w-full md:w-auto px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 rounded text-xs font-medium transition flex items-center justify-center gap-1 shadow-xs"
								>
									<Icon name="x" size={13} />
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
	<div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
		<div class="p-4 border-b border-slate-100">
			<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide">
				Daftar Penyewa yang Telah Diverifikasi
			</h2>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
					<tr>
						<th class="py-2.5 px-4 font-semibold">Nama Lengkap</th>
						<th class="py-2.5 px-4 font-semibold font-mono">NIK (KTP)</th>
						<th class="py-2.5 px-4 font-semibold">Kontak (Email / Telepon)</th>
						<th class="py-2.5 px-4 font-semibold font-mono">Tanggal Registrasi</th>
						<th class="py-2.5 px-4 font-semibold">Status Otorisasi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.processedUsers as user (user.id)}
						<tr class="hover:bg-slate-50/80 transition">
							<td class="py-2.5 px-4 font-semibold text-slate-900">{user.name}</td>
							<td class="py-2.5 px-4 font-mono text-slate-700">{user.nik}</td>
							<td class="py-2.5 px-4 text-slate-600 font-mono text-[11px]">{user.email} • {user.phone}</td>
							<td class="py-2.5 px-4 text-slate-500 font-mono">{user.created_at.split('T')[0]}</td>
							<td class="py-2.5 px-4">
								<span class="px-2 py-0.5 rounded text-[10px] font-medium uppercase {user.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
									{user.status === 'approved' ? 'Disetujui' : 'Ditolak'}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
