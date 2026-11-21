<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data }: { data: PageData } = $props();
	let user = $derived(data.user);
	let stats = $derived(data.stats);

	function formatDateIndo(dateStr: string) {
		if (!dateStr) return '-';
		const datePart = dateStr.split('T')[0];
		const parts = datePart.split('-');
		if (parts.length !== 3) return dateStr;
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
		return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
	}
</script>

<svelte:head>
	<title>Profil Pengguna - GARTA Takalar</title>
</svelte:head>

<div class="max-w-2xl mx-auto my-6 space-y-6">
	<!-- Page Header -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div class="w-14 h-14 rounded-2xl bg-[#383123] text-[#FAF8F4] flex items-center justify-center font-extrabold text-xl font-mono shadow-xs">
				{user.name.charAt(0).toUpperCase()}
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-lg font-extrabold text-[#383123]">{user.name}</h1>
					<span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase {user.role === 'admin' ? 'bg-[#383123] text-white' : 'bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]'}">
						{user.role}
					</span>
				</div>
				<p class="text-xs text-[#6B5E45] mt-0.5 font-mono">{user.email}</p>
			</div>
		</div>

		<div class="flex items-center gap-2 self-start sm:self-auto">
			{#if user.role === 'admin'}
				<a
					href="/admin/garasi"
					class="px-3.5 py-1.5 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] text-xs font-semibold rounded-lg border border-[#DFD5C2] transition btn-interactive"
				>
					← Ke Panel Admin
				</a>
			{:else}
				<a
					href="/penyewa/sewa-baru"
					class="px-3.5 py-1.5 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] text-xs font-semibold rounded-lg border border-[#DFD5C2] transition btn-interactive"
				>
					← Ke Sewa Garasi
				</a>
			{/if}
		</div>
	</div>

	<!-- Profil Detail & Kredensial -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
		<div class="p-5 border-b border-[#F4EFE7] bg-[#FAF8F4] flex items-center justify-between">
			<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
				<Icon name="user" size={14} class="text-[#71856A]" />
				<span>Informasi Akun Terdaftar</span>
			</h2>
			<span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded border {user.status === 'approved' ? 'bg-[#EFF3ED] text-[#596A53] border-[#DFE5DC]' : 'bg-[#FDFBF7] text-[#8A7545] border-[#DAC99B]'}">
				Status: {user.status.toUpperCase()}
			</span>
		</div>

		<div class="p-6 divide-y divide-[#F4EFE7] text-xs space-y-4">
			<div class="flex justify-between items-center py-2">
				<span class="text-[#877758] font-medium">Nomor Induk Kependudukan (NIK KTP):</span>
				<span class="font-mono font-extrabold text-[#383123] text-sm bg-[#FAF8F4] px-2.5 py-1 rounded border border-[#DFD5C2]">{user.nik}</span>
			</div>
			<div class="flex justify-between items-center py-2">
				<span class="text-[#877758] font-medium">Nama Lengkap Sesuai KTP:</span>
				<span class="font-bold text-[#383123] text-sm">{user.name}</span>
			</div>
			<div class="flex justify-between items-center py-2">
				<span class="text-[#877758] font-medium">Alamat Email:</span>
				<span class="font-mono font-bold text-[#383123]">{user.email}</span>
			</div>
			<div class="flex justify-between items-center py-2">
				<span class="text-[#877758] font-medium">Nomor WhatsApp / Telepon:</span>
				<span class="font-mono font-bold text-[#383123]">{user.phone}</span>
			</div>
			<div class="flex justify-between items-center py-2">
				<span class="text-[#877758] font-medium">Terdaftar Sejak:</span>
				<span class="font-mono text-[#6B5E45]">{formatDateIndo(user.created_at)}</span>
			</div>
		</div>
	</div>

	<!-- Quick Stats Summary -->
	<div class="grid grid-cols-2 gap-4">
		{#if user.role === 'penyewa'}
			<div class="bg-white p-4 rounded-xl border border-[#DFD5C2] shadow-xs card-hover flex items-center justify-between">
				<div>
					<span class="text-[11px] text-[#877758] font-medium block">Sewa Berjalan (Aktif)</span>
					<div class="text-xl font-mono font-extrabold text-[#71856A] mt-0.5">{stats.activeRentals} Unit</div>
				</div>
				<a href="/penyewa/riwayat" class="text-xs text-[#71856A] font-bold hover:underline">
					Lihat →
				</a>
			</div>
			<div class="bg-white p-4 rounded-xl border border-[#DFD5C2] shadow-xs card-hover flex items-center justify-between">
				<div>
					<span class="text-[11px] text-[#877758] font-medium block">Menunggu ACC Admin</span>
					<div class="text-xl font-mono font-extrabold text-[#8A7545] mt-0.5">{stats.pendingRentals} Pengajuan</div>
				</div>
				<a href="/penyewa/riwayat" class="text-xs text-[#8A7545] font-bold hover:underline">
					Cek Status →
				</a>
			</div>
		{:else}
			<div class="bg-white p-4 rounded-xl border border-[#DFD5C2] shadow-xs card-hover flex items-center justify-between">
				<div>
					<span class="text-[11px] text-[#877758] font-medium block">Total Penyewa Terdaftar</span>
					<div class="text-xl font-mono font-extrabold text-[#383123] mt-0.5">{stats.totalRentals} Pengguna</div>
				</div>
				<a href="/admin/verifikasi" class="text-xs text-[#71856A] font-bold hover:underline">
					Kelola →
				</a>
			</div>
			<div class="bg-white p-4 rounded-xl border border-[#DFD5C2] shadow-xs card-hover flex items-center justify-between">
				<div>
					<span class="text-[11px] text-[#877758] font-medium block">Sewa Menunggu ACC</span>
					<div class="text-xl font-mono font-extrabold text-[#8A7545] mt-0.5">{stats.pendingRentals} Pengajuan</div>
				</div>
				<a href="/admin/persetujuan" class="text-xs text-[#8A7545] font-bold hover:underline">
					Review Sekarang →
				</a>
			</div>
		{/if}
	</div>

	<!-- Secure Logout Section -->
	<div class="bg-white rounded-xl border border-rose-200 p-6 shadow-xs card-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		<div>
			<h3 class="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
				<Icon name="logout" size={14} class="text-rose-600" />
				<span>Keluar Dari Akun Sistem</span>
			</h3>
			<p class="text-xs text-[#6B5E45] mt-0.5">
				Sesi Anda akan dihentikan dan Anda perlu memasukkan email & password untuk masuk kembali.
			</p>
		</div>

		<form action="?/logout" method="POST">
			<button
				type="submit"
				class="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 btn-interactive"
			>
				<Icon name="logout" size={14} />
				<span>Keluar (Logout)</span>
			</button>
		</form>
	</div>
</div>

