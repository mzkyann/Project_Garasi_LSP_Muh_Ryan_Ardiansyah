<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Verifikasi Pendaftar Baru - GARASI.ID</title>
</svelte:head>

<div class="space-y-8 py-4">
	<!-- Page Header -->
	<div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
		<h1 class="text-2xl font-bold flex items-center gap-2">
			<span>🛡️</span> Verifikasi Validasi KTP & Pendaftar Baru
		</h1>
		<p class="text-xs text-indigo-200 mt-1">
			Tinjau dan validasi pendaftaran calon penyewa baru berdasarkan nomor KTP (NIK) dan data identitas sebelum diberikan izin menyewa.
		</p>
	</div>

	{#if form?.success}
		<div class="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
			<span>✓</span> {form.message}
		</div>
	{/if}

	<!-- Antrean Menunggu Verifikasi (Pending) -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
		<div class="p-6 border-b border-slate-100 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<h2 class="text-base font-bold text-slate-800">Menunggu Verifikasi KTP</h2>
				<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
					{data.pendingUsers.length} Permintaan
				</span>
			</div>
		</div>

		{#if data.pendingUsers.length === 0}
			<div class="p-8 text-center text-slate-500 text-xs">
				✨ Tidak ada pendaftar baru yang menunggu verifikasi saat ini.
			</div>
		{:else}
			<div class="divide-y divide-slate-100">
				{#each data.pendingUsers as user (user.id)}
					<div class="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 transition">
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<span class="font-bold text-sm text-slate-900">{user.name}</span>
								<span class="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
									NIK: {user.nik}
								</span>
							</div>
							<div class="text-xs text-slate-500 flex flex-wrap gap-4">
								<span>✉️ {user.email}</span>
								<span>📞 {user.phone}</span>
								<span>📅 {user.created_at.split('T')[0]}</span>
							</div>
						</div>

						<div class="flex items-center gap-2 w-full md:w-auto">
							<form method="POST" action="?/verify" class="flex-1 md:flex-initial">
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="decision" value="approved" />
								<button
									type="submit"
									class="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow"
								>
									✓ Terima (Approve)
								</button>
							</form>

							<form method="POST" action="?/verify" class="flex-1 md:flex-initial">
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="decision" value="rejected" />
								<button
									type="submit"
									class="w-full md:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow"
								>
									✕ Tolak (Reject)
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Riwayat Pendaftar yang telah diproses -->
	<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
		<div class="p-6 border-b border-slate-100">
			<h2 class="text-base font-bold text-slate-800">Riwayat Calon Penyewa yang Telah Diproses</h2>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead class="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
					<tr>
						<th class="py-3 px-4">Nama Lengkap</th>
						<th class="py-3 px-4">NIK (KTP)</th>
						<th class="py-3 px-4">Email / Telepon</th>
						<th class="py-3 px-4">Tanggal Daftar</th>
						<th class="py-3 px-4">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.processedUsers as user (user.id)}
						<tr class="hover:bg-slate-50 transition">
							<td class="py-3 px-4 font-semibold text-slate-900">{user.name}</td>
							<td class="py-3 px-4 font-mono text-slate-700">{user.nik}</td>
							<td class="py-3 px-4 text-slate-600">{user.email} <br /> {user.phone}</td>
							<td class="py-3 px-4 text-slate-500">{user.created_at.split('T')[0]}</td>
							<td class="py-3 px-4">
								<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase {user.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
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
