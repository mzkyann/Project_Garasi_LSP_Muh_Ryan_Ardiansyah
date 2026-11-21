<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>GARASI.ID - Sistem Manajemen Persewaan Garasi Kendaraan</title>
</svelte:head>

<div class="space-y-8 py-4">
	<!-- Hero Section -->
	<section class="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-indigo-800/50 relative overflow-hidden">
		<div class="max-w-2xl relative z-10 space-y-4">
			<div class="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold">
				<span>🛡️</span> Sistem Berstandar SKKNI Pemrogram
			</div>
			<h1 class="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
				Solusi Modern Persewaan Garasi Kendaraan Anda
			</h1>
			<p class="text-indigo-200 text-sm md:text-base leading-relaxed">
				Kelola dan sewa garasi secara harian atau bulanan untuk sepeda, sepeda motor, mobil konvensional, hingga mobil listrik dengan fasilitas pengisian daya baterai terintegrasi.
			</p>
			<div class="pt-4 flex flex-wrap gap-3">
				<a
					href="/penyewa/sewa-baru"
					class="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center gap-2"
				>
					<span>🚗</span> Sewa Garasi Sekarang
				</a>
				<a
					href="/auth/login"
					class="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition border border-white/20"
				>
					Portal Masuk
				</a>
			</div>
		</div>

		<!-- Decorative Background -->
		<div class="absolute -right-10 -bottom-10 opacity-10 text-[200px] select-none pointer-events-none">
			🏢
		</div>
	</section>

	<!-- Status & Tipe Garasi Cards -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold text-slate-900">Ketersediaan Tipe Garasi</h2>
				<p class="text-xs text-slate-500">Pilihan garasi yang disesuaikan dengan jenis kendaraan Anda</p>
			</div>
			<div class="text-right">
				<span class="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
					{data.availableCount} dari {data.totalCount} Garasi Tersedia
				</span>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- Sepeda -->
			<div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
				<div class="flex items-center justify-between mb-4">
					<div class="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center text-2xl">
						🚲
					</div>
					<span class="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
						Kode S...
					</span>
				</div>
				<h3 class="text-lg font-bold text-slate-800">Garasi Sepeda & Motor</h3>
				<p class="text-xs text-slate-500 mt-1 mb-4">
					Khusus untuk sepeda gowes dan sepeda motor.
				</p>
				<div class="pt-4 border-t border-slate-100 space-y-2 text-xs">
					<div class="flex justify-between">
						<span class="text-slate-500">Tarif Harian:</span>
						<span class="font-bold text-slate-800">Mulai Rp 10.000 / hari</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">Tarif Bulanan:</span>
						<span class="font-bold text-indigo-600">25 x Tarif Harian</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">Ketentuan Plat:</span>
						<span class="text-slate-700 font-medium">Bebas plat untuk sepeda</span>
					</div>
				</div>
			</div>

			<!-- Mobil Bensin -->
			<div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
				<div class="flex items-center justify-between mb-4">
					<div class="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-2xl">
						🚗
					</div>
					<span class="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
						Kode C...
					</span>
				</div>
				<h3 class="text-lg font-bold text-slate-800">Garasi Mobil</h3>
				<p class="text-xs text-slate-500 mt-1 mb-4">
					Untuk mobil berbahan bakar bensin atau mobil listrik (tanpa pengisian daya).
				</p>
				<div class="pt-4 border-t border-slate-100 space-y-2 text-xs">
					<div class="flex justify-between">
						<span class="text-slate-500">Tarif Harian:</span>
						<span class="font-bold text-slate-800">Mulai Rp 50.000 / hari</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">Tarif Bulanan:</span>
						<span class="font-bold text-indigo-600">25 x Tarif Harian</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">Ketentuan Plat:</span>
						<span class="text-slate-700 font-medium">Wajib memiliki plat nomor</span>
					</div>
				</div>
			</div>

			<!-- Mobil Listrik -->
			<div class="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm hover:shadow-md transition relative overflow-hidden">
				<div class="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">
					Charging Station
				</div>
				<div class="flex items-center justify-between mb-4">
					<div class="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-2xl">
						⚡
					</div>
					<span class="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
						Kode E...
					</span>
				</div>
				<h3 class="text-lg font-bold text-slate-800">Garasi Mobil Listrik</h3>
				<p class="text-xs text-slate-500 mt-1 mb-4">
					Khusus mobil listrik dengan kewajiban pengisian daya baterai hingga penuh (100%).
				</p>
				<div class="pt-4 border-t border-slate-100 space-y-2 text-xs">
					<div class="flex justify-between">
						<span class="text-slate-500">Tarif Harian:</span>
						<span class="font-bold text-slate-800">Mulai Rp 75.000 / hari</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">Biaya Listrik:</span>
						<span class="font-bold text-emerald-700">Kapasitas (kWh) x Tarif/kWh</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">Status Pengisian:</span>
						<span class="text-emerald-700 font-semibold">Wajib Terisi Penuh</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Business Rules Infographic -->
	<section class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
		<h2 class="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
			<span>📋</span> Ketentuan & Alur Sistem Persewaan Garasi
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600">
			<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
				<div class="font-bold text-slate-800 mb-1 text-sm">1. Registrasi & Verifikasi</div>
				Penyewa mendaftar dengan NIK, nama lengkap, telepon, email & password. Admin memverifikasi validitas KTP sebelum sewa dapat dilakukan.
			</div>
			<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
				<div class="font-bold text-slate-800 mb-1 text-sm">2. Pemilihan Garasi</div>
				Sistem menyaring tipe garasi sesuai jenis kendaraan: Sepeda/Motor (S), Mobil Bensin (C), Mobil Listrik (C atau E).
			</div>
			<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
				<div class="font-bold text-slate-800 mb-1 text-sm">3. Durasi & Pembayaran</div>
				Sewa harian maksimal 30 hari. Sewa bulanan otomatis dihitung 25x tarif harian. Penyewa mengunggah bukti bayar pelunasan.
			</div>
			<div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
				<div class="font-bold text-slate-800 mb-1 text-sm">4. Perpanjangan Garasi</div>
				Admin dapat memperpanjang masa sewa garasi aktif dengan mengunggah bukti bayar baru dan menghitung selisih hari tambahan.
			</div>
		</div>
	</section>
</div>
