<!-- src/routes/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data }: { data: PageData } = $props();

	let occupancyRate = $derived(
		data.totalCount > 0 ? Math.round(((data.totalCount - data.availableCount) / data.totalCount) * 100) : 0
	);

	// Interactive Simulator State
	let simVehicleType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let simRentalType = $state<'harian' | 'bulanan'>('harian');
	let simDuration = $state<number>(3);
	let simBatteryKwh = $state<number>(58);

	// 3D Tilt Card Pointer Interactions
	let cardRotateX = $state<number>(0);
	let cardRotateY = $state<number>(0);
	let isHovering3D = $state<boolean>(false);

	function handleMouseMove(e: MouseEvent) {
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		cardRotateX = -(y / (rect.height / 2)) * 14;
		cardRotateY = (x / (rect.width / 2)) * 14;
	}

	function handleMouseEnter() {
		isHovering3D = true;
	}

	function handleMouseLeave() {
		isHovering3D = false;
		cardRotateX = 0;
		cardRotateY = 0;
	}

	// Interactive calculation based on realistic garage rental rates
	let simResult = $derived.by(() => {
		let dailyRate = 50000;
		let evRatePerKwh = 0;

		if (simVehicleType === 'sepeda') {
			dailyRate = 20000;
		} else if (simVehicleType === 'mobil') {
			dailyRate = 50000;
		} else if (simVehicleType === 'mobil_listrik') {
			dailyRate = 75000;
			evRatePerKwh = 2500;
		}

		const monthlyRate = 25 * dailyRate;
		const dur = Math.max(1, simDuration || 1);
		const baseCost = simRentalType === 'harian' ? dur * dailyRate : dur * monthlyRate;
		const electricityCost = simVehicleType === 'mobil_listrik' ? Math.max(0, simBatteryKwh) * evRatePerKwh : 0;
		const totalCost = baseCost + electricityCost;

		return {
			dailyRate,
			monthlyRate,
			baseCost,
			electricityCost,
			totalCost
		};
	});

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}

	function formatDateIndo(isoStr?: string | null): string {
		if (!isoStr) return '-';
		try {
			const [year, month, day] = isoStr.split('-').map(Number);
			const date = new Date(year, month - 1, day);
			return new Intl.DateTimeFormat('id-ID', {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			}).format(date);
		} catch {
			return isoStr;
		}
	}
</script>

<svelte:head>
	<title>GARTA - Garasi Takalar | Smart Safe Garage & EV Hub</title>
</svelte:head>

<div class="space-y-12 py-2">
	<!-- ================= 1. HERO SECTION DENGAN 3D ISOMETRIC GARAGE CARD ================= -->
	<section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#273224] via-[#1F271D] to-[#151C13] border border-[#3A4A36] text-[#FAF8F4] p-8 sm:p-12 shadow-2xl">
		<!-- Background ambient mesh glow -->
		<div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#687D61]/25 blur-3xl pointer-events-none"></div>
		<div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#C2A649]/20 blur-3xl pointer-events-none"></div>

		<div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
			<!-- Hero Left: Headline, Badge, CTAs, Trust Elements -->
			<div class="lg:col-span-7 space-y-6">
				<!-- Pill Tagline Takalar -->
				<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#344230]/90 border border-[#52664D] text-[#E0E9DE] text-xs font-semibold shadow-inner">
					<span class="w-2 h-2 rounded-full bg-[#E5C772] animate-ping"></span>
					<span class="text-[#E5C772] font-mono font-bold tracking-wide">GARTA TAKALAR</span>
					<span class="text-[#8FA587]">•</span>
					<span>Smart Safe Garage & EV Hub</span>
				</div>

				<!-- Main Headline -->
				<h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
					Penitipan Kendaraan Paling <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#E5C772] via-[#F4DE95] to-[#C2A649]">Aman & Modern</span> di Takalar
				</h1>

				<!-- Subheadline -->
				<p class="text-sm sm:text-base text-[#C2CFC0] leading-relaxed max-w-xl">
					Solusi sewa slot garasi terstruktur untuk <strong>sepeda, motor, mobil keluarga</strong>, hingga <strong>mobil listrik (EV)</strong> dengan fasilitas SPKLU Wallbox otomatis, perlindungan indoor penuh, dan pengawasan CCTV 24 Jam.
				</p>

				<!-- Action Buttons -->
				<div class="flex flex-wrap items-center gap-3.5 pt-2">
					<a
						href="/penyewa/sewa-baru"
						class="px-6 py-3.5 bg-gradient-to-r from-[#687D61] to-[#51644B] hover:from-[#768E6F] hover:to-[#5D7256] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-[#1D241A]/50 flex items-center gap-2 btn-interactive"
					>
						<Icon name="plus" size={16} />
						<span>Sewa Slot Garasi Sekarang</span>
					</a>

					<a
						href="#kapasitas"
						class="px-5 py-3.5 bg-[#2B3627]/80 hover:bg-[#344230] text-[#E0E9DE] font-semibold rounded-xl text-xs sm:text-sm transition-all border border-[#485943] shadow-sm flex items-center gap-2 btn-interactive"
					>
						<span>Cek Ketersediaan Slot ↓</span>
					</a>
				</div>

				<!-- Trust Elements Mini Bar -->
				<div class="grid grid-cols-3 gap-3 pt-4 border-t border-[#374533]/70 text-xs font-mono text-[#A8BCA4]">
					<div>
						<span class="text-white font-bold block text-sm sm:text-base">{data.totalCount} Slot</span>
						<span class="text-[11px] text-[#8FA587]">Kapasitas Garasi</span>
					</div>
					<div>
						<span class="text-[#E5C772] font-bold block text-sm sm:text-base">{data.availableCount} Tersedia</span>
						<span class="text-[11px] text-[#8FA587]">Siap Pakai Hari Ini</span>
					</div>
					<div>
						<span class="text-white font-bold block text-sm sm:text-base">24/7 Live</span>
						<span class="text-[11px] text-[#8FA587]">CCTV & Keamanan</span>
					</div>
				</div>
			</div>

			<!-- Hero Right: INTERACTIVE 3D ISOMETRIC GARAGE CARD -->
			<div class="lg:col-span-5 flex justify-center">
				<!-- 3D Perspective Box -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="relative w-full max-w-sm rounded-2xl cursor-pointer select-none transition-transform duration-200 ease-out"
					style="perspective: 1000px;"
					onmousemove={handleMouseMove}
					onmouseenter={handleMouseEnter}
					onmouseleave={handleMouseLeave}
				>
					<div
						class="w-full rounded-2xl bg-gradient-to-b from-[#2B3627] to-[#1E261B] border-2 border-[#54684E] p-6 shadow-2xl relative overflow-hidden transition-all"
						style="transform-style: preserve-3d; transform: rotateX({cardRotateX}deg) rotateY({cardRotateY}deg) scale3d({isHovering3D ? 1.03 : 1}, {isHovering3D ? 1.03 : 1}, 1);"
					>
						<!-- Gloss Specular Reflection -->
						<div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-2xl"></div>

						<!-- Floating 3D Badge Status -->
						<div class="flex items-center justify-between pb-4 border-b border-[#3E4F39]" style="transform: translateZ(35px);">
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
								<span class="font-mono text-xs font-bold text-white tracking-wider">GARASI TAKALAR 3D HUB</span>
							</div>
							<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C2A649]/20 text-[#E5C772] border border-[#C2A649]/40 font-bold">
								Live Interactive
							</span>
						</div>

						<!-- 3D Isometric Garage Bay Visualizer -->
						<div class="py-6 space-y-4" style="transform: translateZ(25px);">
							<!-- Bay 1: Slot Sepeda & Motor (S001) -->
							<div class="p-3 rounded-xl bg-[#1F271C] border border-[#3E4F39] flex items-center justify-between hover:border-[#687D61] transition">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-lg bg-[#2E3B2A] text-[#9EB697] flex items-center justify-center font-bold">
										<Icon name="bike" size={16} />
									</div>
									<div>
										<span class="font-mono font-bold text-xs text-white block">Slot Sepeda & Motor (S)</span>
										<span class="text-[10px] text-[#A4B89F]">Gowes & Sepeda Motor Harian</span>
									</div>
								</div>
								<span class="font-mono text-xs text-[#E5C772] font-bold">Rp 20.000<span class="text-[9px] text-[#8FA587]">/hr</span></span>
							</div>

							<!-- Bay 2: Slot Mobil Bensin (C001) -->
							<div class="p-3 rounded-xl bg-[#1F271C] border border-[#3E4F39] flex items-center justify-between hover:border-[#687D61] transition">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-lg bg-[#2E3B2A] text-[#E5C772] flex items-center justify-center font-bold">
										<Icon name="car" size={16} />
									</div>
									<div>
										<span class="font-mono font-bold text-xs text-white block">Slot Mobil Bensin (C)</span>
										<span class="text-[10px] text-[#A4B89F]">MPV, SUV, Sedan Indoor Safe</span>
									</div>
								</div>
								<span class="font-mono text-xs text-[#E5C772] font-bold">Rp 50.000<span class="text-[9px] text-[#8FA587]">/hr</span></span>
							</div>

							<!-- Bay 3: Slot Mobil Listrik & SPKLU (E001) with Animated Glow -->
							<div class="p-3 rounded-xl bg-gradient-to-r from-[#1F271C] to-[#263522] border-2 border-[#687D61] flex items-center justify-between shadow-md relative overflow-hidden">
								<div class="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-emerald-500/20 blur-xl"></div>
								<div class="flex items-center gap-3 relative z-10">
									<div class="w-8 h-8 rounded-lg bg-[#2D4525] text-emerald-300 flex items-center justify-center font-bold shadow-xs">
										<Icon name="zap" size={16} />
									</div>
									<div>
										<span class="font-mono font-bold text-xs text-white block flex items-center gap-1.5">
											<span>Slot EV + SPKLU (E)</span>
											<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
										</span>
										<span class="text-[10px] text-emerald-200">Fast Wallbox 22 kW AC Charger</span>
									</div>
								</div>
								<span class="font-mono text-xs text-emerald-300 font-bold relative z-10">Rp 75.000<span class="text-[9px] text-emerald-400">/hr</span></span>
							</div>
						</div>

						<!-- Floating 3D Footnote -->
						<div class="pt-3 border-t border-[#3E4F39] flex items-center justify-between text-[11px] font-mono text-[#8FA587]" style="transform: translateZ(40px);">
							<span class="flex items-center gap-1 text-[#E0E9DE]">
								<Icon name="shield" size={13} class="text-[#E5C772]" />
								<span>Sensor Parkir Otomatis</span>
							</span>
							<span class="text-[#E5C772] font-bold">Pattallassang, Takalar</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ================= 2. LIVE CAPACITY MONITOR (BENTO GRID KAPASITAS GARASI) ================= -->
	<section id="kapasitas" class="space-y-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFD5C2] pb-4">
			<div>
				<div class="flex items-center gap-2 text-xs font-bold text-[#687D61] uppercase tracking-wider">
					<Icon name="building" size={14} />
					<span>Ketersediaan Real-Time Takalar</span>
				</div>
				<h2 class="text-xl sm:text-2xl font-extrabold text-[#242D21] mt-1">
					Status Kapasitas Slot Garasi Saat Ini
				</h2>
				<p class="text-xs text-[#6B5E45] mt-0.5">
					Sistem cerdas GARTA mendeteksi kuota secara otomatis. Jika penuh, perkiraan tanggal slot kosong langsung tertera.
				</p>
			</div>
			<div class="self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-[#DFD5C2] text-xs font-mono text-[#54674E] shadow-xs">
				📅 Hari Ini: <strong>{formatDateIndo(data.today)}</strong>
			</div>
		</div>

		<!-- 3 Bento Cards for 3 Garage Types -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each data.stats as stat}
				{@const isSepeda = stat.type === 'sepeda'}
				{@const isMobil = stat.type === 'mobil'}
				{@const isListrik = stat.type === 'mobil_listrik'}
				<div class="bg-white rounded-2xl border {stat.isFull ? 'border-rose-300 ring-2 ring-rose-200' : 'border-[#DFD5C2]'} p-6 shadow-xs flex flex-col justify-between card-hover transition-all">
					<div class="space-y-4">
						<!-- Top Info Header -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="w-11 h-11 rounded-xl flex items-center justify-center border {isSepeda ? 'bg-[#EFF3ED] text-[#54674E] border-[#DFE5DC]' : isMobil ? 'bg-[#FAF8F4] text-[#877758] border-[#DFD5C2]' : 'bg-[#EBF3E8] text-[#3D5E34] border-[#CCE0C7]'}">
									{#if isSepeda}
										<Icon name="bike" size={22} />
									{:else if isMobil}
										<Icon name="car" size={22} />
									{:else}
										<Icon name="zap" size={22} />
									{/if}
								</div>
								<div>
									<h3 class="font-extrabold text-base text-[#242D21]">
										{#if isSepeda}Garasi Sepeda & Motor{:else if isMobil}Garasi Mobil Bensin{:else}Garasi Mobil Listrik (EV){/if}
									</h3>
									<span class="text-[11px] text-[#877758] font-medium">
										{#if isSepeda}Roda Dua Indoor{:else if isMobil}Roda Empat Standar{:else}Dilengkapi Wallbox SPKLU{/if}
									</span>
								</div>
							</div>
							<span class="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg border {isSepeda ? 'bg-[#EFF3ED] text-[#54674E] border-[#DFE5DC]' : isMobil ? 'bg-[#FAF8F4] text-[#877758] border-[#DFD5C2]' : 'bg-[#EBF3E8] text-[#3D5E34] border-[#CCE0C7]'}">
								{#if isSepeda}Prefix S{:else if isMobil}Prefix C{:else}Prefix E{/if}
							</span>
						</div>

						<!-- Status Ketersediaan Slot -->
						{#if stat.isFull}
							<div class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
								<div class="flex items-center justify-between">
									<span class="font-mono font-extrabold text-xs text-rose-700 flex items-center gap-1.5">
										<Icon name="alert" size={14} />
										<span>⛔ GARASI PENUH</span>
									</span>
									<span class="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-rose-200 text-rose-600">
										0/{stat.total} Slot Kosong
									</span>
								</div>
								<div class="text-[11px] text-rose-800 pt-1.5 border-t border-rose-200/70 flex items-center justify-between">
									<span>Kosong kembali pada:</span>
									<strong class="font-mono font-bold text-rose-900">
										{stat.nextEmptyDate ? formatDateIndo(stat.nextEmptyDate) : 'Menunggu Selesai'}
									</strong>
								</div>
							</div>
						{:else}
							<div class="p-3 bg-[#EFF3ED] border border-[#C2CCBC] rounded-xl flex items-center justify-between">
								<div class="flex items-center gap-2 text-[#242D21] text-xs font-bold">
									<Icon name="check" size={15} class="text-[#687D61]" />
									<span>✓ Tersedia Siap Sewa</span>
								</div>
								<span class="text-xs font-mono font-extrabold text-[#54674E] bg-white px-2.5 py-1 rounded-lg border border-[#DFE5DC] shadow-2xs">
									{stat.available} dari {stat.total} Slot
								</span>
							</div>
						{/if}

						<p class="text-xs text-[#5D5240] leading-relaxed">
							{#if isSepeda}
								Tempat parkir beratap anti karat khusus sepeda gowes dan motor. Bebas panas terik & hujan, dengan sistem kunci individual.
							{:else if isMobil}
								Slot garasi luas berkanopi kokoh untuk mobil keluarga (Avanza, Innova, Brio, Fortuner, dll) dengan akses keluar masuk 24 jam.
							{:else}
								Slot garasi eksklusif kendaraan listrik (Ioniq 5, Wuling Air EV, Byd, dll) dilengkapi AC Wallbox Charger hingga 22 kW.
							{/if}
						</p>

						<!-- Price Breakdown Box -->
						<div class="space-y-2 bg-[#FAF8F4] p-3.5 rounded-xl border border-[#DFD5C2] text-xs">
							<div class="flex justify-between items-center">
								<span class="text-[#877758]">Tarif Harian:</span>
								<span class="font-mono font-bold text-[#242D21] text-sm">{formatRupiah(stat.dailyPrice)} <span class="text-[10px] font-normal text-[#877758]">/hari</span></span>
							</div>
							<div class="flex justify-between items-center border-t border-[#EAE3D4] pt-1.5">
								<span class="text-[#877758]">Tarif Bulanan (25x):</span>
								<span class="font-mono font-bold text-[#687D61]">{formatRupiah(stat.monthlyPrice)} <span class="text-[10px] font-normal text-[#877758]">/bln</span></span>
							</div>
							{#if isListrik}
								<div class="flex justify-between items-center border-t border-[#EAE3D4] pt-1.5 text-[#3D5E34]">
									<span>Tarif Cas Listrik:</span>
									<span class="font-mono font-bold">{formatRupiah(stat.electricityPrice || 2500)} <span class="text-[10px] font-normal text-[#54674E]">/kWh</span></span>
								</div>
							{/if}
						</div>
					</div>

					<!-- Bottom Action Link -->
					<div class="mt-5 pt-3 border-t border-[#F4EFE7]">
						<a
							href="/penyewa/sewa-baru"
							class="w-full py-2.5 rounded-xl font-bold text-xs text-center block transition shadow-xs btn-interactive {stat.isFull ? 'bg-[#BEB092] hover:bg-[#A08F6E] text-white' : 'bg-[#687D61] hover:bg-[#54674E] text-white'}"
						>
							{#if stat.isFull}
								Lihat Antrean Jadwal Kosong
							{:else}
								Sewa Slot {isSepeda ? 'Motor' : isMobil ? 'Mobil' : 'EV'} Ini →
							{/if}
						</a>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ================= 3. SMART INTERACTIVE FEE CALCULATOR ================= -->
	<section class="bg-white rounded-3xl border border-[#DFD5C2] p-8 sm:p-10 shadow-sm card-hover">
		<div class="max-w-2xl mb-8">
			<div class="inline-flex items-center gap-2 text-xs font-bold text-[#687D61] uppercase tracking-wider mb-1">
				<Icon name="clock" size={14} />
				<span>Simulasi Estimasi Biaya</span>
			</div>
			<h2 class="text-2xl font-extrabold text-[#242D21]">
				Kalkulator Sewa Garasi GARTA Takalar
			</h2>
			<p class="text-xs sm:text-sm text-[#6B5E45] mt-1">
				Hitung estimasi pengeluaran penitipan kendaraan Anda secara langsung dan transparan sebelum melakukan pemesanan.
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
			<!-- Controls Input -->
			<div class="lg:col-span-7 space-y-6">
				<!-- 1. Tipe Kendaraan -->
				<div>
					<span class="block text-xs font-bold text-[#4F4532] mb-2">1. Pilih Jenis Kendaraan</span>
					<div class="grid grid-cols-3 gap-3">
						<button
							type="button"
							onclick={() => (simVehicleType = 'sepeda')}
							class="p-3.5 rounded-xl border text-left transition-all btn-interactive {simVehicleType === 'sepeda' ? 'bg-[#EFF3ED] border-[#687D61] ring-2 ring-[#687D61] text-[#242D21]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="font-bold text-xs flex items-center gap-1.5">
								<Icon name="bike" size={14} />
								<span>Motor / Sepeda</span>
							</div>
							<div class="text-[10px] font-mono text-[#687D61] mt-1">Rp 20.000 / hari</div>
						</button>

						<button
							type="button"
							onclick={() => (simVehicleType = 'mobil')}
							class="p-3.5 rounded-xl border text-left transition-all btn-interactive {simVehicleType === 'mobil' ? 'bg-[#EFF3ED] border-[#687D61] ring-2 ring-[#687D61] text-[#242D21]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="font-bold text-xs flex items-center gap-1.5">
								<Icon name="car" size={14} />
								<span>Mobil Bensin</span>
							</div>
							<div class="text-[10px] font-mono text-[#877758] mt-1">Rp 50.000 / hari</div>
						</button>

						<button
							type="button"
							onclick={() => (simVehicleType = 'mobil_listrik')}
							class="p-3.5 rounded-xl border text-left transition-all btn-interactive {simVehicleType === 'mobil_listrik' ? 'bg-[#EFF3ED] border-[#687D61] ring-2 ring-[#687D61] text-[#242D21]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="font-bold text-xs flex items-center gap-1.5">
								<Icon name="zap" size={14} />
								<span>Mobil EV</span>
							</div>
							<div class="text-[10px] font-mono text-[#54674E] mt-1">Rp 75.000 / hari</div>
						</button>
					</div>
				</div>

				<!-- 2. Skema & Durasi Sewa -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="simRentalType" class="block text-xs font-bold text-[#4F4532] mb-1.5">2. Kategori Durasi</label>
						<select
							id="simRentalType"
							bind:value={simRentalType}
							class="w-full px-3.5 py-2.5 text-xs border border-[#DFD5C2] rounded-xl input-focus bg-[#FAF8F4] font-medium"
						>
							<option value="harian">Sewa Harian (Maks. 30 Hari)</option>
							<option value="bulanan">Sewa Bulanan (Hemat 25x Tarif)</option>
						</select>
					</div>

					<div>
						<label for="simDuration" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Durasi ({simRentalType === 'harian' ? 'Hari' : 'Bulan'})
						</label>
						<input
							type="number"
							id="simDuration"
							bind:value={simDuration}
							min="1"
							max={simRentalType === 'harian' ? 30 : 12}
							class="w-full px-3.5 py-2.5 text-xs border border-[#DFD5C2] rounded-xl input-focus bg-[#FAF8F4] font-mono font-bold"
						/>
					</div>
				</div>

				<!-- 3. Jika Mobil Listrik: Input Baterai kWh -->
				{#if simVehicleType === 'mobil_listrik'}
					<div class="bg-[#EFF3ED] border border-[#C2CCBC] p-4 rounded-xl space-y-2">
						<div class="flex justify-between items-center text-xs">
							<label for="simBatteryKwh" class="font-bold text-[#242D21]">Kapasitas Baterai Listrik (kWh):</label>
							<span class="font-mono font-bold text-[#54674E] bg-white px-2 py-0.5 rounded border border-[#DFE5DC]">{simBatteryKwh} kWh</span>
						</div>
						<input
							type="range"
							id="simBatteryKwh"
							bind:value={simBatteryKwh}
							min="15"
							max="100"
							step="1"
							class="w-full accent-[#687D61]"
						/>
						<p class="text-[10px] text-[#54674E]">
							* Cas penuh SPKLU 100% baterai: {simBatteryKwh} kWh × Rp 2.500 = {formatRupiah(simBatteryKwh * 2500)}
						</p>
					</div>
				{/if}
			</div>

			<!-- Result Showcase Box -->
			<div class="lg:col-span-5 bg-gradient-to-br from-[#242D21] to-[#182016] text-[#FAF8F4] p-7 rounded-2xl border border-[#3E4F39] shadow-xl space-y-4">
				<div class="flex items-center justify-between border-b border-[#3E4F39] pb-3">
					<span class="font-mono text-xs font-bold text-[#E5C772] uppercase tracking-wider">Hasil Estimasi Biaya</span>
					<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#687D61] text-white">Takalar Official</span>
				</div>

				<div class="space-y-2.5 text-xs font-mono">
					<div class="flex justify-between text-[#C9D6C5]">
						<span>Sewa Pokok Garasi:</span>
						<span class="font-bold text-white">{formatRupiah(simResult.baseCost)}</span>
					</div>
					{#if simVehicleType === 'mobil_listrik'}
						<div class="flex justify-between text-emerald-300">
							<span>Biaya Cas SPKLU ({simBatteryKwh} kWh):</span>
							<span class="font-bold">{formatRupiah(simResult.electricityCost)}</span>
						</div>
					{/if}
					<div class="flex justify-between text-[#C9D6C5]">
						<span>Durasi Pilihan:</span>
						<span class="font-bold text-white">{simDuration} {simRentalType === 'harian' ? 'Hari' : 'Bulan'}</span>
					</div>
				</div>

				<div class="pt-4 border-t-2 border-[#3E4F39] space-y-1">
					<span class="text-[10px] text-[#A8BCA4] uppercase tracking-wider block font-mono">Total Pembayaran Diperkirakan:</span>
					<div class="text-2xl sm:text-3xl font-extrabold font-mono text-[#E5C772]">
						{formatRupiah(simResult.totalCost)}
					</div>
				</div>

				<div class="pt-2">
					<a
						href="/penyewa/sewa-baru"
						class="w-full py-3 bg-[#687D61] hover:bg-[#54674E] text-white font-bold rounded-xl text-xs text-center block transition shadow-md btn-interactive"
					>
						Lanjutkan Sewa dengan Biaya Ini →
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- ================= 4. KEUNGGULAN EKSKLUSIF GARTA TAKALAR ================= -->
	<section class="space-y-6">
		<div class="text-center max-w-xl mx-auto">
			<span class="text-xs font-bold text-[#687D61] uppercase tracking-wider block mb-1">Standar Kualitas & Kenyamanan</span>
			<h2 class="text-2xl font-extrabold text-[#242D21]">Mengapa Memilih GARTA Takalar?</h2>
			<p class="text-xs sm:text-sm text-[#6B5E45] mt-1">
				Fasilitas penitipan terpadu yang dirancang untuk menjaga kondisi kendaraan Anda tetap prima dan aman selama Anda beraktivitas.
			</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
			<!-- Feature 1 -->
			<div class="bg-white p-6 rounded-2xl border border-[#DFD5C2] shadow-xs space-y-3 card-hover">
				<div class="w-10 h-10 rounded-xl bg-[#EFF3ED] text-[#687D61] border border-[#DFE5DC] flex items-center justify-center font-bold">
					<Icon name="shield" size={20} />
				</div>
				<h3 class="font-bold text-sm text-[#242D21]">Proteksi CCTV 24/7 & Satpam</h3>
				<p class="text-xs text-[#6B5E45] leading-relaxed">
					Didukung sistem kamera pengawas terpusat dan petugas jaga satpam Takalar 2 lapis untuk keamanan maksimal siang dan malam.
				</p>
			</div>

			<!-- Feature 2 -->
			<div class="bg-white p-6 rounded-2xl border border-[#DFD5C2] shadow-xs space-y-3 card-hover">
				<div class="w-10 h-10 rounded-xl bg-[#FAF8F4] text-[#877758] border border-[#DFD5C2] flex items-center justify-center font-bold">
					<Icon name="building" size={20} />
				</div>
				<h3 class="font-bold text-sm text-[#242D21]">Kanopi Indoor Anti Panas</h3>
				<p class="text-xs text-[#6B5E45] leading-relaxed">
					Seluruh slot dilindungi atap baja ringan berinsulasi panas untuk melindungi cat mobil dan motor dari terik matahari dan hujan lebat.
				</p>
			</div>

			<!-- Feature 3 -->
			<div class="bg-white p-6 rounded-2xl border border-[#DFD5C2] shadow-xs space-y-3 card-hover">
				<div class="w-10 h-10 rounded-xl bg-[#EFF3ED] text-[#54674E] border-[#DFE5DC] flex items-center justify-center font-bold">
					<Icon name="zap" size={20} />
				</div>
				<h3 class="font-bold text-sm text-[#242D21]">SPKLU Wallbox 22 kW EV</h3>
				<p class="text-xs text-[#6B5E45] leading-relaxed">
					Stasiun pengisian daya kendaraan listrik terstandar dengan pencatatan meteran kWh transparan dan cut-off proteksi arus lebih.
				</p>
			</div>

			<!-- Feature 4 -->
			<div class="bg-white p-6 rounded-2xl border border-[#DFD5C2] shadow-xs space-y-3 card-hover">
				<div class="w-10 h-10 rounded-xl bg-[#FAF8F4] text-[#71856A] border border-[#DFD5C2] flex items-center justify-center font-bold">
					<Icon name="check" size={20} />
				</div>
				<h3 class="font-bold text-sm text-[#242D21]">Lokasi Strategis Takalar</h3>
				<p class="text-xs text-[#6B5E45] leading-relaxed">
					Berada di kawasan pusat Pattallassang Kabupaten Takalar, dekat dengan jalan poros utama yang mudah dijangkau kapan pun.
				</p>
			</div>
		</div>
	</section>

	<!-- ================= 5. CALL TO ACTION BANNER MEWAH ================= -->
	<section class="rounded-3xl bg-gradient-to-r from-[#242D21] via-[#2F3A2B] to-[#242D21] border border-[#485943] text-white p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
		<div class="relative z-10 max-w-2xl mx-auto space-y-4">
			<span class="px-3 py-1 rounded-full bg-[#C2A649]/20 text-[#E5C772] text-[11px] font-mono font-bold border border-[#C2A649]/40 inline-block">
				Pendaftaran Online Cepat & Praktis
			</span>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-white">
				Titipkan Kendaraan Anda di GARTA Takalar Hari Ini
			</h2>
			<p class="text-xs sm:text-sm text-[#C2CFC0] leading-relaxed">
				Daftarkan akun Anda dalam 1 menit, pilih slot garasi yang diinginkan, dan nikmati ketenangan penitipan bergaransi resmi.
			</p>
			<div class="pt-4 flex flex-wrap items-center justify-center gap-3">
				<a
					href="/auth/register"
					class="px-6 py-3 bg-[#E5C772] hover:bg-[#F4DE95] text-[#1E251B] font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md btn-interactive"
				>
					Daftar Akun Penyewa Baru
				</a>
				<a
					href="/auth/login"
					class="px-6 py-3 bg-[#384634] hover:bg-[#455541] text-[#E0E9DE] font-semibold rounded-xl text-xs sm:text-sm transition-all border border-[#52664D] shadow-xs btn-interactive"
				>
					Sudah Punya Akun? Masuk
				</a>
			</div>
		</div>
	</section>
</div>
