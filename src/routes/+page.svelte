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

<div class="space-y-14 py-2">
	<!-- ================= 1. HERO SECTION DENGAN 3D ISOMETRIC GARAGE CARD ================= -->
	<section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2C2518] via-[#222920] to-[#161A14] border border-[#8B774F]/40 text-[#EDE8D2] p-8 sm:p-14 shadow-2xl">
		<!-- Background ambient mesh glow -->
		<div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#8B774F]/25 blur-3xl pointer-events-none"></div>
		<div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#DCCFA6]/20 blur-3xl pointer-events-none"></div>
		<div class="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#8F987E]/20 blur-3xl pointer-events-none"></div>

		<div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
			<!-- Hero Left: Headline, Badge, CTAs, Trust Elements -->
			<div class="lg:col-span-7 space-y-7">
				<!-- Pill Tagline Takalar with Ping Indicator -->
				<div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#353F32]/90 border border-[#8F987E]/50 text-xs font-semibold shadow-inner">
					<span class="relative flex h-2.5 w-2.5">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DCCFA6] opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DCCFA6]"></span>
					</span>
					<span class="text-[#DCCFA6] font-mono font-bold tracking-wider">GARTA TAKALAR</span>
					<span class="text-[#8F987E]">•</span>
					<span class="text-[#EDE8D2]">Smart Safe Garage & EV Charging Hub</span>
				</div>

				<!-- Main Headline -->
				<h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
					Penitipan Kendaraan <br/>
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-[#DCCFA6] via-[#EDE8D2] to-[#8F987E]">Paling Aman & Modern</span> <br/>
					di Takalar
				</h1>

				<!-- Subheadline -->
				<p class="text-sm sm:text-base text-[#DFE3D9] leading-relaxed max-w-xl">
					Solusi sewa garasi indoor terintegrasi untuk <strong>sepeda, motor, mobil konvensional</strong>, hingga <strong>mobil listrik (EV)</strong> dengan fasilitas SPKLU Wallbox otomatis, sensor keamanan, dan pengawasan CCTV 24 Jam.
				</p>

				<!-- Action Buttons -->
				<div class="flex flex-wrap items-center gap-4 pt-2">
					<a
						href="/penyewa/sewa-baru"
						class="px-7 py-3.5 bg-[#8F987E] hover:bg-[#778267] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-[#161A14]/50 flex items-center gap-2.5 btn-interactive"
					>
						<Icon name="plus" size={17} />
						<span>Sewa Slot Garasi Sekarang</span>
					</a>

					<a
						href="#kapasitas"
						class="px-6 py-3.5 bg-[#353F32]/80 hover:bg-[#424F3F] text-[#EDE8D2] font-semibold rounded-xl text-sm transition-all border border-[#8F987E]/50 shadow-sm flex items-center gap-2 btn-interactive"
					>
						<span>Cek Ketersediaan Slot ↓</span>
					</a>
				</div>

				<!-- Trust Elements Mini Bar -->
				<div class="grid grid-cols-3 gap-4 pt-6 border-t border-[#423825] text-xs font-mono">
					<div class="p-3 rounded-xl bg-[#222920]/70 border border-[#8F987E]/30">
						<span class="text-white font-extrabold block text-base sm:text-lg">{data.totalCount} Slot</span>
						<span class="text-[11px] text-[#C3C9B8]">Total Kapasitas</span>
					</div>
					<div class="p-3 rounded-xl bg-[#222920]/70 border border-[#8F987E]/30">
						<span class="text-[#DCCFA6] font-extrabold block text-base sm:text-lg">{data.availableCount} Tersedia</span>
						<span class="text-[11px] text-[#C3C9B8]">Siap Pakai Hari Ini</span>
					</div>
					<div class="p-3 rounded-xl bg-[#222920]/70 border border-[#8F987E]/30">
						<span class="text-[#8F987E] font-extrabold block text-base sm:text-lg">24/7 Live</span>
						<span class="text-[11px] text-[#C3C9B8]">CCTV & Keamanan</span>
					</div>
				</div>
			</div>

			<!-- Hero Right: INTERACTIVE 3D ISOMETRIC GARAGE CARD -->
			<div class="lg:col-span-5 flex justify-center">
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="relative w-full max-w-sm rounded-3xl cursor-pointer select-none transition-transform duration-200 ease-out"
					style="perspective: 1200px;"
					onmousemove={handleMouseMove}
					onmouseenter={handleMouseEnter}
					onmouseleave={handleMouseLeave}
				>
					<div
						class="w-full rounded-3xl bg-gradient-to-b from-[#222920] to-[#161A14] border-2 border-[#8B774F]/60 p-6 shadow-2xl relative overflow-hidden transition-all hover:border-[#DCCFA6]"
						style="transform-style: preserve-3d; transform: rotateX({cardRotateX}deg) rotateY({cardRotateY}deg) scale3d({isHovering3D ? 1.03 : 1}, {isHovering3D ? 1.03 : 1}, 1);"
					>
						<!-- Specular Light Effect -->
						<div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-3xl"></div>

						<!-- Floating 3D Badge Status -->
						<div class="flex items-center justify-between pb-4 border-b border-[#423825]" style="transform: translateZ(35px);">
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 rounded-full bg-[#8F987E] animate-pulse"></div>
								<span class="font-mono text-xs font-bold text-white tracking-wider">GARTA 3D GARAGE HUB</span>
							</div>
							<span class="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#DCCFA6]/20 text-[#DCCFA6] border border-[#DCCFA6]/40 font-bold">
								Live Bay
							</span>
						</div>

						<!-- 3D Isometric Garage Bay Visualizer -->
						<div class="py-6 space-y-3.5" style="transform: translateZ(25px);">
							<!-- Bay 1: Slot Sepeda & Motor (S001) -->
							<div class="p-3.5 rounded-2xl bg-[#1B1710] border border-[#423825] flex items-center justify-between hover:border-[#8B774F] transition">
								<div class="flex items-center gap-3">
									<div class="w-9 h-9 rounded-xl bg-[#2C2518] text-[#DCCFA6] flex items-center justify-center font-bold border border-[#5C4F35]">
										<Icon name="bike" size={17} />
									</div>
									<div>
										<span class="font-mono font-bold text-xs text-white block">Slot Sepeda & Motor (S)</span>
										<span class="text-[10px] text-[#A7AF99]">Roda Dua Indoor Beratap</span>
									</div>
								</div>
								<span class="font-mono text-xs text-[#DCCFA6] font-bold">Rp 20.000<span class="text-[9px] text-[#A7AF99]">/hr</span></span>
							</div>

							<!-- Bay 2: Slot Mobil Bensin (C001) -->
							<div class="p-3.5 rounded-2xl bg-[#1B1710] border border-[#423825] flex items-center justify-between hover:border-[#8B774F] transition">
								<div class="flex items-center gap-3">
									<div class="w-9 h-9 rounded-xl bg-[#2C2518] text-[#8B774F] flex items-center justify-center font-bold border border-[#5C4F35]">
										<Icon name="car" size={17} />
									</div>
									<div>
										<span class="font-mono font-bold text-xs text-white block">Slot Mobil Bensin (C)</span>
										<span class="text-[10px] text-[#A7AF99]">MPV, SUV, Sedan Safe Bay</span>
									</div>
								</div>
								<span class="font-mono text-xs text-[#DCCFA6] font-bold">Rp 50.000<span class="text-[9px] text-[#A7AF99]">/hr</span></span>
							</div>

							<!-- Bay 3: Slot Mobil Listrik & SPKLU (E001) -->
							<div class="p-3.5 rounded-2xl bg-gradient-to-r from-[#1B1710] to-[#222920] border-2 border-[#8F987E] flex items-center justify-between shadow-lg relative overflow-hidden">
								<div class="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#8F987E]/20 blur-2xl"></div>
								<div class="flex items-center gap-3 relative z-10">
									<div class="w-9 h-9 rounded-xl bg-[#353F32] text-[#EDE8D2] flex items-center justify-center font-bold border border-[#8F987E]">
										<Icon name="zap" size={17} />
									</div>
									<div>
										<span class="font-mono font-bold text-xs text-white block flex items-center gap-1.5">
											<span>Slot EV + SPKLU (E)</span>
											<span class="w-2 h-2 rounded-full bg-[#8F987E] animate-ping"></span>
										</span>
										<span class="text-[10px] text-[#C3C9B8]">Fast Wallbox 22 kW Charger</span>
									</div>
								</div>
								<span class="font-mono text-xs text-[#DCCFA6] font-bold relative z-10">Rp 75.000<span class="text-[9px] text-[#EDE8D2]">/hr</span></span>
							</div>
						</div>

						<!-- Floating 3D Footnote -->
						<div class="pt-3 border-t border-[#423825] flex items-center justify-between text-[11px] font-mono text-[#A7AF99]" style="transform: translateZ(40px);">
							<span class="flex items-center gap-1.5 text-[#EDE8D2]">
								<Icon name="shield" size={13} class="text-[#DCCFA6]" />
								<span>Sensor Parkir Otomatis</span>
							</span>
							<span class="text-[#DCCFA6] font-bold">Pattallassang, Takalar</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ================= 2. LIVE CAPACITY MONITOR (BENTO GRID KAPASITAS GARASI) ================= -->
	<section id="kapasitas" class="space-y-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCCFA6] pb-4">
			<div>
				<div class="flex items-center gap-2 text-xs font-bold text-[#8B774F] uppercase tracking-wider">
					<Icon name="building" size={14} />
					<span>Ketersediaan Real-Time Takalar</span>
				</div>
				<h2 class="text-2xl sm:text-3xl font-extrabold text-[#2C2518] mt-1">
					Status Kapasitas Slot Garasi Saat Ini
				</h2>
				<p class="text-xs sm:text-sm text-[#5C4F35] mt-1">
					Sistem cerdas GARTA mendeteksi kuota secara otomatis. Jika penuh, perkiraan tanggal slot kosong langsung tertera.
				</p>
			</div>
			<div class="self-start sm:self-auto bg-white px-4 py-2 rounded-xl border border-[#DCCFA6] text-xs font-mono text-[#2C2518] shadow-xs flex items-center gap-2">
				<span class="w-2 h-2 rounded-full bg-[#8F987E]"></span>
				<span>Hari Ini: <strong>{formatDateIndo(data.today)}</strong></span>
			</div>
		</div>

		<!-- 3 Bento Cards for 3 Garage Types -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each data.stats as stat}
				{@const isSepeda = stat.type === 'sepeda'}
				{@const isMobil = stat.type === 'mobil'}
				{@const isListrik = stat.type === 'mobil_listrik'}
				<div class="bg-white rounded-3xl border {stat.isFull ? 'border-rose-300 ring-2 ring-rose-200' : 'border-[#DCCFA6]'} p-6 sm:p-7 flex flex-col justify-between card-hover shadow-xs">
					<div class="space-y-5">
						<!-- Top Info Header -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3.5">
								<div class="w-12 h-12 rounded-2xl flex items-center justify-center border {isSepeda ? 'bg-[#F7F9F6] text-[#8F987E] border-[#DFE3D9]' : isMobil ? 'bg-[#F7F4EC] text-[#8B774F] border-[#DDD3BC]' : 'bg-[#FAF8F2] text-[#5C4F35] border-[#DCCFA6]'}">
									{#if isSepeda}
										<Icon name="bike" size={24} />
									{:else if isMobil}
										<Icon name="car" size={24} />
									{:else}
										<Icon name="zap" size={24} />
									{/if}
								</div>
								<div>
									<h3 class="font-extrabold text-base text-[#2C2518]">
										{#if isSepeda}Garasi Sepeda & Motor{:else if isMobil}Garasi Mobil Bensin{:else}Garasi Mobil Listrik (EV){/if}
									</h3>
									<span class="text-[11px] text-[#756442] font-medium">
										{#if isSepeda}Roda Dua Indoor{:else if isMobil}Roda Empat Standar{:else}Dilengkapi Wallbox SPKLU{/if}
									</span>
								</div>
							</div>
							<span class="font-mono text-xs font-extrabold px-3 py-1 rounded-xl border bg-[#F8F6F0] border-[#DCCFA6] text-[#2C2518]">
								Prefix {isSepeda ? 'S' : isMobil ? 'C' : 'E'}
							</span>
						</div>

						<!-- Status Ketersediaan Slot -->
						{#if stat.isFull}
							<div class="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
								<div class="flex items-center justify-between">
									<span class="font-mono font-extrabold text-xs text-rose-700 flex items-center gap-1.5">
										<Icon name="alert" size={14} />
										<span>⛔ GARASI PENUH</span>
									</span>
									<span class="text-[10px] font-mono font-bold bg-white px-2.5 py-0.5 rounded-md border border-rose-200 text-rose-600">
										0/{stat.total} Kosong
									</span>
								</div>
								<div class="text-[11px] text-rose-800 pt-2 border-t border-rose-200/80 flex items-center justify-between">
									<span>Kosong kembali pada:</span>
									<strong class="font-mono font-bold text-rose-900">
										{stat.nextEmptyDate ? formatDateIndo(stat.nextEmptyDate) : 'Menunggu Selesai'}
									</strong>
								</div>
							</div>
						{:else}
							<div class="p-3.5 bg-[#EFF1EC] border border-[#C3C9B8] rounded-2xl flex items-center justify-between">
								<div class="flex items-center gap-2 text-[#2C2518] text-xs font-bold">
									<Icon name="check" size={16} class="text-[#8F987E]" />
									<span>✓ Tersedia Siap Sewa</span>
								</div>
								<span class="text-xs font-mono font-extrabold text-[#2C2518] bg-white px-3 py-1 rounded-xl border border-[#DFE3D9] shadow-2xs">
									{stat.available} dari {stat.total} Slot
								</span>
							</div>
						{/if}

						<p class="text-xs text-[#5C4F35] leading-relaxed">
							{#if isSepeda}
								Tempat parkir beratap anti karat khusus sepeda gowes dan motor. Bebas panas terik & hujan, dengan sistem kunci individual.
							{:else if isMobil}
								Slot garasi luas berkanopi kokoh untuk mobil keluarga (Avanza, Innova, Brio, Fortuner, dll) dengan akses keluar masuk 24 jam.
							{:else}
								Slot garasi eksklusif kendaraan listrik (Ioniq 5, Wuling Air EV, BYD, dll) dilengkapi AC Wallbox Charger hingga 22 kW.
							{/if}
						</p>

						<!-- Price Breakdown Box -->
						<div class="space-y-2.5 bg-[#FAF8F2] p-4 rounded-2xl border border-[#DCCFA6] text-xs">
							<div class="flex justify-between items-center">
								<span class="text-[#756442]">Tarif Harian:</span>
								<span class="font-mono font-bold text-[#2C2518] text-sm">{formatRupiah(stat.dailyPrice)} <span class="text-[10px] font-normal text-[#756442]">/hari</span></span>
							</div>
							<div class="flex justify-between items-center border-t border-[#DDD3BC] pt-2">
								<span class="text-[#756442]">Tarif Bulanan (25x):</span>
								<span class="font-mono font-bold text-[#8B774F]">{formatRupiah(stat.monthlyPrice)} <span class="text-[10px] font-normal text-[#756442]">/bln</span></span>
							</div>
							{#if isListrik}
								<div class="flex justify-between items-center border-t border-[#DDD3BC] pt-2 text-[#4D5C4A]">
									<span>Tarif Cas Listrik:</span>
									<span class="font-mono font-bold">{formatRupiah(stat.electricityPrice || 2500)} <span class="text-[10px] font-normal text-[#756442]">/kWh</span></span>
								</div>
							{/if}
						</div>
					</div>

					<!-- Bottom Action Link -->
					<div class="mt-6 pt-4 border-t border-[#FAF8F2]">
						<a
							href="/penyewa/sewa-baru"
							class="w-full py-3 rounded-xl font-bold text-xs text-center block transition shadow-xs btn-interactive {stat.isFull ? 'bg-[#C2B392] text-white hover:bg-[#A8956E]' : 'bg-[#8F987E] hover:bg-[#778267] text-white'}"
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
	<section class="bg-white rounded-3xl border border-[#DCCFA6] p-8 sm:p-12 shadow-sm relative overflow-hidden">
		<!-- Background ambient glow -->
		<div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#DCCFA6]/30 blur-3xl pointer-events-none"></div>

		<div class="max-w-2xl mb-8 relative z-10">
			<div class="inline-flex items-center gap-2 text-xs font-bold text-[#8B774F] uppercase tracking-wider mb-1">
				<Icon name="clock" size={14} />
				<span>Simulasi Estimasi Biaya</span>
			</div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-[#2C2518]">
				Kalkulator Sewa Garasi GARTA Takalar
			</h2>
			<p class="text-xs sm:text-sm text-[#5C4F35] mt-1">
				Hitung estimasi pengeluaran penitipan kendaraan Anda secara langsung dan transparan sebelum melakukan pemesanan.
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
			<!-- Controls Input -->
			<div class="lg:col-span-7 space-y-6">
				<!-- 1. Tipe Kendaraan -->
				<div>
					<span class="block text-xs font-bold text-[#423825] mb-2.5">1. Pilih Jenis Kendaraan</span>
					<div class="grid grid-cols-3 gap-3">
						<button
							type="button"
							onclick={() => (simVehicleType = 'sepeda')}
							class="p-4 rounded-2xl border text-left transition-all btn-interactive {simVehicleType === 'sepeda' ? 'bg-[#EFF1EC] border-[#8F987E] ring-2 ring-[#8F987E] text-[#2C2518]' : 'bg-[#FAF8F2] border-[#DCCFA6] text-[#756442]'}"
						>
							<div class="font-bold text-xs flex items-center gap-2">
								<Icon name="bike" size={16} class={simVehicleType === 'sepeda' ? 'text-[#8F987E]' : 'text-[#756442]'} />
								<span>Motor / Sepeda</span>
							</div>
							<div class="text-[11px] font-mono text-[#8B774F] font-semibold mt-1.5">Rp 20.000/hr</div>
						</button>

						<button
							type="button"
							onclick={() => (simVehicleType = 'mobil')}
							class="p-4 rounded-2xl border text-left transition-all btn-interactive {simVehicleType === 'mobil' ? 'bg-[#EFF1EC] border-[#8F987E] ring-2 ring-[#8F987E] text-[#2C2518]' : 'bg-[#FAF8F2] border-[#DCCFA6] text-[#756442]'}"
						>
							<div class="font-bold text-xs flex items-center gap-2">
								<Icon name="car" size={16} class={simVehicleType === 'mobil' ? 'text-[#8B774F]' : 'text-[#756442]'} />
								<span>Mobil Bensin</span>
							</div>
							<div class="text-[11px] font-mono text-[#8B774F] font-semibold mt-1.5">Rp 50.000/hr</div>
						</button>

						<button
							type="button"
							onclick={() => (simVehicleType = 'mobil_listrik')}
							class="p-4 rounded-2xl border text-left transition-all btn-interactive {simVehicleType === 'mobil_listrik' ? 'bg-[#EFF1EC] border-[#8F987E] ring-2 ring-[#8F987E] text-[#2C2518]' : 'bg-[#FAF8F2] border-[#DCCFA6] text-[#756442]'}"
						>
							<div class="font-bold text-xs flex items-center gap-2">
								<Icon name="zap" size={16} class={simVehicleType === 'mobil_listrik' ? 'text-[#8F987E]' : 'text-[#756442]'} />
								<span>Mobil EV</span>
							</div>
							<div class="text-[11px] font-mono text-[#8B774F] font-semibold mt-1.5">Rp 75.000/hr</div>
						</button>
					</div>
				</div>

				<!-- 2. Skema & Durasi Sewa -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="simRentalType" class="block text-xs font-bold text-[#423825] mb-2">2. Kategori Durasi</label>
						<select
							id="simRentalType"
							bind:value={simRentalType}
							class="w-full px-4 py-3 text-xs border border-[#DCCFA6] rounded-xl input-focus bg-[#FAF8F2] text-[#2C2518] font-medium"
						>
							<option value="harian">Sewa Harian (Maks. 30 Hari)</option>
							<option value="bulanan">Sewa Bulanan (Hemat 25x Tarif)</option>
						</select>
					</div>

					<div>
						<label for="simDuration" class="block text-xs font-bold text-[#423825] mb-2">
							Durasi ({simRentalType === 'harian' ? 'Hari' : 'Bulan'})
						</label>
						<input
							type="number"
							id="simDuration"
							bind:value={simDuration}
							min="1"
							max={simRentalType === 'harian' ? 30 : 12}
							class="w-full px-4 py-3 text-xs border border-[#DCCFA6] rounded-xl input-focus bg-[#FAF8F2] text-[#2C2518] font-mono font-bold"
						/>
					</div>
				</div>

				<!-- 3. Jika Mobil Listrik: Input Baterai kWh -->
				{#if simVehicleType === 'mobil_listrik'}
					<div class="bg-[#EFF1EC] border border-[#C3C9B8] p-5 rounded-2xl space-y-3">
						<div class="flex justify-between items-center text-xs">
							<label for="simBatteryKwh" class="font-bold text-[#2C2518] flex items-center gap-2">
								<Icon name="zap" size={15} class="text-[#8F987E]" />
								<span>Kapasitas Baterai Listrik (kWh):</span>
							</label>
							<span class="font-mono font-bold text-[#2C2518] bg-white px-3 py-1 rounded-xl border border-[#DFE3D9] text-sm">
								{simBatteryKwh} kWh
							</span>
						</div>
						<input
							type="range"
							id="simBatteryKwh"
							bind:value={simBatteryKwh}
							min="15"
							max="100"
							step="1"
							class="w-full accent-[#8F987E] cursor-pointer"
						/>
						<p class="text-[11px] text-[#4D5C4A]">
							* Biaya pengisian penuh SPKLU 100%: {simBatteryKwh} kWh × Rp 2.500 = {formatRupiah(simBatteryKwh * 2500)}
						</p>
					</div>
				{/if}
			</div>

			<!-- Result Showcase Box -->
			<div class="lg:col-span-5 bg-gradient-to-br from-[#2C2518] to-[#1B1710] text-[#EDE8D2] p-8 rounded-3xl border border-[#8B774F]/50 shadow-xl space-y-5">
				<div class="flex items-center justify-between border-b border-[#423825] pb-4">
					<span class="font-mono text-xs font-bold text-[#DCCFA6] uppercase tracking-wider">Hasil Estimasi Biaya</span>
					<span class="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#8F987E]/30 text-[#EDE8D2] border border-[#8F987E]/50 font-bold">
						Takalar Verified
					</span>
				</div>

				<div class="space-y-3 text-xs font-mono">
					<div class="flex justify-between text-[#DFE3D9]">
						<span>Sewa Pokok Garasi:</span>
						<span class="font-bold text-white">{formatRupiah(simResult.baseCost)}</span>
					</div>
					{#if simVehicleType === 'mobil_listrik'}
						<div class="flex justify-between text-[#DCCFA6]">
							<span>Biaya Cas SPKLU ({simBatteryKwh} kWh):</span>
							<span class="font-bold">{formatRupiah(simResult.electricityCost)}</span>
						</div>
					{/if}
					<div class="flex justify-between text-[#DFE3D9]">
						<span>Durasi Pilihan:</span>
						<span class="font-bold text-white">{simDuration} {simRentalType === 'harian' ? 'Hari' : 'Bulan'}</span>
					</div>
				</div>

				<div class="pt-5 border-t border-[#423825] space-y-1">
					<span class="text-[10px] text-[#A7AF99] uppercase tracking-wider block font-mono">Total Pembayaran Diperkirakan:</span>
					<div class="text-3xl font-extrabold font-mono text-[#DCCFA6] tracking-tight">
						{formatRupiah(simResult.totalCost)}
					</div>
				</div>

				<div class="pt-2">
					<a
						href="/penyewa/sewa-baru"
						class="w-full py-3.5 bg-[#8F987E] hover:bg-[#778267] text-white font-bold rounded-xl text-xs text-center block transition shadow-md btn-interactive"
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
			<span class="text-xs font-bold text-[#8B774F] uppercase tracking-wider block mb-1">Standar Kualitas & Kenyamanan</span>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-[#2C2518]">Mengapa Memilih GARTA Takalar?</h2>
			<p class="text-xs sm:text-sm text-[#5C4F35] mt-1">
				Fasilitas penitipan terpadu yang dirancang untuk menjaga kondisi kendaraan Anda tetap prima dan aman selama Anda beraktivitas.
			</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
			<!-- Feature 1 -->
			<div class="bg-white p-6 rounded-3xl border border-[#DCCFA6] shadow-xs space-y-3.5 card-hover">
				<div class="w-11 h-11 rounded-2xl bg-[#EFF1EC] text-[#8F987E] border border-[#DFE3D9] flex items-center justify-center font-bold">
					<Icon name="shield" size={22} />
				</div>
				<h3 class="font-bold text-sm text-[#2C2518]">Proteksi CCTV 24/7 & Satpam</h3>
				<p class="text-xs text-[#5C4F35] leading-relaxed">
					Didukung sistem kamera pengawas terpusat dan petugas jaga satpam Takalar 2 lapis untuk keamanan maksimal siang dan malam.
				</p>
			</div>

			<!-- Feature 2 -->
			<div class="bg-white p-6 rounded-3xl border border-[#DCCFA6] shadow-xs space-y-3.5 card-hover">
				<div class="w-11 h-11 rounded-2xl bg-[#F7F4EC] text-[#8B774F] border border-[#DDD3BC] flex items-center justify-center font-bold">
					<Icon name="building" size={22} />
				</div>
				<h3 class="font-bold text-sm text-[#2C2518]">Kanopi Indoor Anti Panas</h3>
				<p class="text-xs text-[#5C4F35] leading-relaxed">
					Seluruh slot dilindungi atap baja ringan berinsulasi panas untuk melindungi cat mobil dan motor dari terik matahari dan hujan lebat.
				</p>
			</div>

			<!-- Feature 3 -->
			<div class="bg-white p-6 rounded-3xl border border-[#DCCFA6] shadow-xs space-y-3.5 card-hover">
				<div class="w-11 h-11 rounded-2xl bg-[#EFF1EC] text-[#8F987E] border border-[#DFE3D9] flex items-center justify-center font-bold">
					<Icon name="zap" size={22} />
				</div>
				<h3 class="font-bold text-sm text-[#2C2518]">SPKLU Wallbox 22 kW EV</h3>
				<p class="text-xs text-[#5C4F35] leading-relaxed">
					Stasiun pengisian daya kendaraan listrik terstandar dengan pencatatan meteran kWh transparan dan cut-off proteksi arus lebih.
				</p>
			</div>

			<!-- Feature 4 -->
			<div class="bg-white p-6 rounded-3xl border border-[#DCCFA6] shadow-xs space-y-3.5 card-hover">
				<div class="w-11 h-11 rounded-2xl bg-[#FAF8F2] text-[#8B774F] border border-[#DCCFA6] flex items-center justify-center font-bold">
					<Icon name="check" size={22} />
				</div>
				<h3 class="font-bold text-sm text-[#2C2518]">Lokasi Strategis Takalar</h3>
				<p class="text-xs text-[#5C4F35] leading-relaxed">
					Berada di kawasan pusat Pattallassang Kabupaten Takalar, dekat dengan jalan poros utama yang mudah dijangkau kapan pun.
				</p>
			</div>
		</div>
	</section>

	<!-- ================= 5. CALL TO ACTION BANNER MEWAH ================= -->
	<section class="rounded-3xl bg-gradient-to-r from-[#2C2518] via-[#353F32] to-[#2C2518] border border-[#8B774F]/50 text-white p-8 sm:p-14 text-center shadow-xl relative overflow-hidden">
		<div class="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#8B774F]/20 blur-3xl pointer-events-none"></div>
		<div class="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[#DCCFA6]/20 blur-3xl pointer-events-none"></div>

		<div class="relative z-10 max-w-2xl mx-auto space-y-4">
			<span class="px-4 py-1 rounded-full bg-[#DCCFA6]/20 text-[#DCCFA6] text-xs font-mono font-bold border border-[#DCCFA6]/40 inline-block">
				Pendaftaran Online Cepat & Praktis
			</span>
			<h2 class="text-2xl sm:text-4xl font-extrabold text-white">
				Titipkan Kendaraan Anda di GARTA Takalar Hari Ini
			</h2>
			<p class="text-xs sm:text-sm text-[#DFE3D9] leading-relaxed">
				Daftarkan akun Anda dalam 1 menit, pilih slot garasi yang diinginkan, dan nikmati ketenangan penitipan bergaransi resmi.
			</p>
			<div class="pt-5 flex flex-wrap items-center justify-center gap-3.5">
				<a
					href="/auth/register"
					class="px-7 py-3.5 bg-[#8F987E] hover:bg-[#778267] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md btn-interactive"
				>
					Daftar Akun Penyewa Baru
				</a>
				<a
					href="/auth/login"
					class="px-7 py-3.5 bg-[#353F32] hover:bg-[#424F3F] text-[#EDE8D2] font-semibold rounded-xl text-xs sm:text-sm transition-all border border-[#8F987E]/50 shadow-sm btn-interactive"
				>
					Sudah Punya Akun? Masuk
				</a>
			</div>
		</div>
	</section>
</div>
