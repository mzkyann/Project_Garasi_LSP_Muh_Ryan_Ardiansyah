<!-- src/routes/penyewa/sewa-baru/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Detail Kendaraan Penyewa (sesuai spesifikasi soal LSP)
	let vehicleType = $state<'sepeda' | 'sepeda_motor' | 'mobil' | 'mobil_listrik'>('sepeda_motor');
	let vehicleBrandModel = $state<string>('Honda Vario 160');
	let licensePlate = $state<string>('B 1234 ABC');
	let batteryCapacity = $state<number>(58);

	// Kategori garasi yang cocok berdasarkan tipe kendaraan
	let vehicleCategory = $derived.by(() => {
		if (vehicleType === 'sepeda' || vehicleType === 'sepeda_motor') {
			return 'sepeda';
		}
		if (vehicleType === 'mobil') {
			return 'mobil';
		}
		return 'mobil_listrik';
	});

	let rentalType = $state<'harian' | 'bulanan'>('harian');
	let duration = $state<number>(1);
	let selectedStartDate = $state<string>('');
	let selectedGarageId = $state<number | null>(null);

	// Bukti bayar preview
	let proofPreview = $state<string | null>(null);

	$effect(() => {
		if (!selectedStartDate && data.today) {
			selectedStartDate = data.today;
		}
	});

	// Filter tab ketersediaan (Semua / Kosong / Terisi)
	let availabilityFilter = $state<'all' | 'ready' | 'booked'>('all');

	// Modal detail jadwal ketersediaan garasi
	let scheduleModalGarage = $state<any | null>(null);

	function formatDateIndo(dateStr: string | null | undefined): string {
		if (!dateStr) return '-';
		const parts = dateStr.split('-');
		if (parts.length !== 3) return dateStr;
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
		const day = parseInt(parts[2], 10);
		const monthIndex = parseInt(parts[1], 10) - 1;
		const month = months[monthIndex] || parts[1];
		return `${day} ${month} ${parts[0]}`;
	}

	function getDaysRemainingText(targetDateStr: string | null | undefined, baseDateStr: string | null | undefined): string {
		if (!targetDateStr || !baseDateStr) return '';
		const target = new Date(targetDateStr);
		const base = new Date(baseDateStr);
		const diffTime = target.getTime() - base.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		if (diffDays <= 0) return 'Hari ini';
		if (diffDays === 1) return 'Besok';
		if (diffDays === 2) return 'Lusa';
		return `${diffDays} hari lagi`;
	}

	// Filter slot garasi sesuai tipe kendaraan:
	let filteredGarages = $derived.by(() => {
		return data.garages.filter((g: any) => {
			if (vehicleCategory === 'sepeda') {
				return g.type === 'sepeda';
			}
			if (vehicleCategory === 'mobil') {
				return g.type === 'mobil';
			}
			if (vehicleCategory === 'mobil_listrik') {
				return g.type === 'mobil_listrik' || g.type === 'mobil';
			}
			return true;
		});
	});

	// Hitung Tanggal Selesai otomatis berdasarkan selectedStartDate dan durasi
	let calculatedEndDate = $derived.by(() => {
		if (!selectedStartDate) return '';
		const start = new Date(selectedStartDate);
		const end = new Date(start);
		const dur = Math.max(1, duration || 1);

		if (rentalType === 'harian') {
			end.setDate(end.getDate() + dur);
		} else {
			end.setMonth(end.getMonth() + dur);
		}
		return end.toISOString().split('T')[0];
	});

	// Cek apakah slot garasi sedang terpakai / bentrok pada rentang tanggal terpilih
	function isGarageBookedOnSelectedRange(garage: any, start: string, end: string): boolean {
		if (!start || !end) return false;
		if (garage.active_rentals && garage.active_rentals.length > 0) {
			return garage.active_rentals.some((r: any) => !(r.end_date <= start || r.start_date >= end));
		}
		if (garage.active_start_date && garage.active_end_date) {
			return !(garage.active_end_date <= start || garage.active_start_date >= end);
		}
		if (start === data.today && garage.status === 'used') {
			return true;
		}
		return false;
	}

	// Hitung jumlah slot garasi ready vs booked pada kategori yang aktif
	let readyGaragesCount = $derived(
		filteredGarages.filter((g: any) => !isGarageBookedOnSelectedRange(g, selectedStartDate, calculatedEndDate)).length
	);

	let bookedGaragesCount = $derived(
		filteredGarages.filter((g: any) => isGarageBookedOnSelectedRange(g, selectedStartDate, calculatedEndDate)).length
	);

	// Tanggal tercepat slot garasi berikutnya akan kosong jika semua slot penuh
	let earliestAvailableDate = $derived.by(() => {
		if (filteredGarages.length === 0) return null;
		const dates = filteredGarages.map((g: any) => g.next_available_date).filter(Boolean);
		if (dates.length === 0) return null;
		return [...dates].sort()[0];
	});

	// Filter tampilan akhir berdasarkan tab availability
	let displayedGarages = $derived.by(() => {
		return filteredGarages.filter((g: any) => {
			const isBooked = isGarageBookedOnSelectedRange(g, selectedStartDate, calculatedEndDate);
			if (availabilityFilter === 'ready') return !isBooked;
			if (availabilityFilter === 'booked') return isBooked;
			return true;
		});
	});

	// Auto-select slot garasi pertama yang kosong (ready)
	$effect(() => {
		const currentSelected = data.garages.find((g: any) => g.id === selectedGarageId);
		const isCurrentBooked = currentSelected ? isGarageBookedOnSelectedRange(currentSelected, selectedStartDate, calculatedEndDate) : true;

		if (isCurrentBooked || !currentSelected) {
			const availableUnits = filteredGarages.filter(
				(g: any) => !isGarageBookedOnSelectedRange(g, selectedStartDate, calculatedEndDate)
			);
			if (availableUnits.length > 0) {
				selectedGarageId = availableUnits[0].id;
			} else {
				selectedGarageId = null;
			}
		}
	});

	let selectedGarage = $derived(
		data.garages.find((g: any) => g.id === selectedGarageId) ?? null
	);

	// Jadwalkan sewa mulai tanggal slot ready
	function scheduleFromReadyDate(garage: any) {
		if (garage.next_available_date) {
			selectedStartDate = garage.next_available_date;
			selectedGarageId = garage.id;
			availabilityFilter = 'all';
		}
	}

	// Hitung Biaya Real-time sesuai tarif slot garasi dan cas baterai listrik
	let costCalculation = $derived.by(() => {
		if (!selectedGarage) {
			return { baseCost: 0, electricityCost: 0, totalCost: 0 };
		}

		const dur = Math.max(1, duration || 1);
		const dailyPrice = selectedGarage.daily_price;
		const monthlyPrice = 25 * dailyPrice;

		const baseCost = rentalType === 'harian' ? dur * dailyPrice : dur * monthlyPrice;

		let electricityCost = 0;
		if (vehicleType === 'mobil_listrik' && selectedGarage.type === 'mobil_listrik') {
			const kwh = Math.max(0, batteryCapacity || 58);
			const ratePerKwh = selectedGarage.electricity_price_kwh || 2500;
			electricityCost = kwh * ratePerKwh;
		}

		return {
			baseCost,
			electricityCost,
			totalCost: baseCost + electricityCost
		};
	});

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const reader = new FileReader();
			reader.onload = (ev) => {
				proofPreview = ev.target?.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			proofPreview = null;
		}
	}

	function removeProof() {
		proofPreview = null;
		const input = document.getElementById('paymentProof') as HTMLInputElement;
		if (input) input.value = '';
	}

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:head>
	<title>Sewa Slot Garasi - GARTA (Garasi Takalar)</title>
</svelte:head>

<div class="max-w-7xl mx-auto py-2 space-y-6">
	<!-- Hero Header Bento -->
	<div class="bg-gradient-to-r from-[#242D21] via-[#2D382A] to-[#1C2319] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-[#3E4F39] relative overflow-hidden">
		<!-- Subtle ambient background glow -->
		<div class="absolute -right-16 -top-16 w-64 h-64 bg-[#71856A]/20 rounded-full blur-3xl pointer-events-none"></div>
		<div class="absolute right-1/3 -bottom-20 w-80 h-80 bg-[#C2A649]/10 rounded-full blur-3xl pointer-events-none"></div>

		<div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
			<div class="space-y-2 max-w-2xl">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#384634]/90 border border-[#4F624A] text-[#E5C772] text-[11px] font-mono font-bold tracking-wide">
					<Icon name="shield" size={13} class="text-[#E5C772]" />
					<span>GARTA TAKALAR • SMART GARAGE & CHARGING HUB</span>
				</div>
				<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAF8F4]">
					Sewa Slot Garasi Kendaraan
				</h1>
				<p class="text-xs sm:text-sm text-[#D1DDCE] leading-relaxed">
					Sistem penitipan kendaraan aman terintegrasi. Pilih kategori kendaraan, tentukan durasi harian atau bulanan, dan sistem menghitung ketersediaan serta biaya secara transparan real-time.
				</p>
			</div>

			<div class="flex items-center gap-3 shrink-0">
				<a
					href="/penyewa/riwayat"
					class="px-4 py-2.5 bg-[#384634] hover:bg-[#485942] text-[#FAF8F4] text-xs font-bold rounded-xl border border-[#4F624A] transition-all flex items-center gap-2 shadow-xs btn-interactive"
				>
					<Icon name="clock" size={14} class="text-[#E5C772]" />
					<span>Lihat Riwayat Sewa Saya</span>
				</a>
			</div>
		</div>
	</div>

	{#if data.notApproved}
		<div class="bg-white border border-[#DAC99B] rounded-2xl p-10 text-center space-y-4 shadow-sm max-w-xl mx-auto my-8">
			<div class="w-14 h-14 rounded-2xl bg-[#FAF8F4] text-[#8A7545] flex items-center justify-center mx-auto border border-[#DAC99B] shadow-inner">
				<Icon name="clock" size={28} />
			</div>
			<div class="space-y-1">
				<h2 class="text-lg font-bold text-[#383123]">Status Akun Menunggu Verifikasi KTP</h2>
				<p class="text-xs text-[#6B5E45] leading-relaxed">
					Akun Anda saat ini berstatus <span class="font-mono font-bold uppercase text-[#8A7545] bg-[#FAF8F4] px-2 py-0.5 rounded border border-[#DAC99B]">{data.userStatus}</span>.
					Sesuai prosedur LSP, Administrator sedang memvalidasi data KTP pendaftaran Anda.
				</p>
			</div>
			<div class="pt-2">
				<a
					href="/"
					class="inline-block px-5 py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white rounded-xl text-xs font-bold transition shadow-xs btn-interactive"
				>
					Kembali ke Beranda
				</a>
			</div>
		</div>
	{:else}
		{#if form?.error}
			<div class="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-3 shadow-xs">
				<Icon name="alert" size={18} class="text-rose-600 shrink-0" />
				<span>{form.error}</span>
			</div>
		{/if}

		<form method="POST" action="?/submitRental" enctype="multipart/form-data">
			<input type="hidden" name="startDate" value={selectedStartDate} />

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				<!-- ================= LEFT COLUMN: FORM SEWA (7 COLS) ================= -->
				<div class="lg:col-span-7 space-y-6">
					<!-- STEP 1: PILIH TIPE KENDARAAN (Visual Cards) -->
					<div class="bg-white rounded-2xl border border-[#DFD5C2] p-6 shadow-xs space-y-4 card-hover">
						<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="w-6 h-6 rounded-lg bg-[#383123] text-white flex items-center justify-center text-xs font-bold font-mono">1</span>
								<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
									Pilih Kategori Kendaraan Anda
								</h2>
							</div>
							<span class="text-[11px] text-[#71856A] font-semibold">Kompatibilitas Otomatis</span>
						</div>

						<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
							<!-- Sepeda Motor -->
							<button
								type="button"
								onclick={() => { vehicleType = 'sepeda_motor'; }}
								class="p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[110px] btn-interactive {vehicleType === 'sepeda_motor' ? 'bg-[#EFF3ED] border-[#71856A] ring-2 ring-[#71856A] shadow-xs' : 'bg-[#FAF8F4] border-[#DFD5C2] hover:border-[#BEB092]'}"
							>
								{#if vehicleType === 'sepeda_motor'}
									<span class="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#71856A] text-white flex items-center justify-center text-[9px] font-bold">✓</span>
								{/if}
								<div class="w-8 h-8 rounded-lg bg-white border border-[#DFD5C2] flex items-center justify-center text-[#71856A] mb-2">
									<Icon name="bike" size={18} />
								</div>
								<div>
									<span class="font-bold text-xs text-[#383123] block leading-tight">Sepeda Motor</span>
									<span class="text-[10px] font-mono text-[#71856A] font-bold block mt-0.5">Slot S (20rb/hr)</span>
								</div>
							</button>

							<!-- Mobil Bensin -->
							<button
								type="button"
								onclick={() => { vehicleType = 'mobil'; }}
								class="p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[110px] btn-interactive {vehicleType === 'mobil' ? 'bg-[#EFF3ED] border-[#71856A] ring-2 ring-[#71856A] shadow-xs' : 'bg-[#FAF8F4] border-[#DFD5C2] hover:border-[#BEB092]'}"
							>
								{#if vehicleType === 'mobil'}
									<span class="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#71856A] text-white flex items-center justify-center text-[9px] font-bold">✓</span>
								{/if}
								<div class="w-8 h-8 rounded-lg bg-white border border-[#DFD5C2] flex items-center justify-center text-[#383123] mb-2">
									<Icon name="car" size={18} />
								</div>
								<div>
									<span class="font-bold text-xs text-[#383123] block leading-tight">Mobil Bensin</span>
									<span class="text-[10px] font-mono text-[#71856A] font-bold block mt-0.5">Slot C (50rb/hr)</span>
								</div>
							</button>

							<!-- Mobil Listrik EV -->
							<button
								type="button"
								onclick={() => { vehicleType = 'mobil_listrik'; }}
								class="p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[110px] btn-interactive {vehicleType === 'mobil_listrik' ? 'bg-[#EFF3ED] border-[#71856A] ring-2 ring-[#71856A] shadow-xs' : 'bg-[#FAF8F4] border-[#DFD5C2] hover:border-[#BEB092]'}"
							>
								{#if vehicleType === 'mobil_listrik'}
									<span class="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#71856A] text-white flex items-center justify-center text-[9px] font-bold">✓</span>
								{/if}
								<div class="w-8 h-8 rounded-lg bg-white border border-[#DFD5C2] flex items-center justify-center text-amber-600 mb-2">
									<Icon name="zap" size={18} />
								</div>
								<div>
									<span class="font-bold text-xs text-[#383123] block leading-tight">Mobil Listrik (EV)</span>
									<span class="text-[10px] font-mono text-[#71856A] font-bold block mt-0.5">Slot E (+SPKLU)</span>
								</div>
							</button>

							<!-- Sepeda Gowes -->
							<button
								type="button"
								onclick={() => { vehicleType = 'sepeda'; }}
								class="p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[110px] btn-interactive {vehicleType === 'sepeda' ? 'bg-[#EFF3ED] border-[#71856A] ring-2 ring-[#71856A] shadow-xs' : 'bg-[#FAF8F4] border-[#DFD5C2] hover:border-[#BEB092]'}"
							>
								{#if vehicleType === 'sepeda'}
									<span class="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#71856A] text-white flex items-center justify-center text-[9px] font-bold">✓</span>
								{/if}
								<div class="w-8 h-8 rounded-lg bg-white border border-[#DFD5C2] flex items-center justify-center text-[#877758] mb-2">
									<Icon name="bike" size={18} />
								</div>
								<div>
									<span class="font-bold text-xs text-[#383123] block leading-tight">Sepeda Gowes</span>
									<span class="text-[10px] font-mono text-[#71856A] font-bold block mt-0.5">Slot S (20rb/hr)</span>
								</div>
							</button>
						</div>

						<!-- Identitas & Plat Nomor -->
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
							<div class="space-y-1.5">
								<label for="vehicleBrandModel" class="text-xs font-bold text-[#383123] block">
									Merek & Tipe Kendaraan <span class="text-rose-500">*</span>
								</label>
								<input
									type="text"
									id="vehicleBrandModel"
									name="vehicleBrandModel"
									bind:value={vehicleBrandModel}
									required
									placeholder="Contoh: Honda Vario 160, Avanza, Ioniq 5"
									class="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-white text-xs text-[#383123] focus:outline-none focus:border-[#71856A] focus:ring-1 focus:ring-[#71856A]"
								/>
							</div>

							{#if vehicleType !== 'sepeda'}
								<div class="space-y-1.5">
									<label for="licensePlate" class="text-xs font-bold text-[#383123] block">
										Nomor Plat Polisi <span class="text-rose-500">*</span>
									</label>
									<input
										type="text"
										id="licensePlate"
										name="licensePlate"
										bind:value={licensePlate}
										required
										placeholder="Contoh: DD 1234 XY"
										class="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD5C2] bg-white text-xs font-mono font-bold text-[#383123] uppercase focus:outline-none focus:border-[#71856A] focus:ring-1 focus:ring-[#71856A]"
									/>
								</div>
							{/if}
						</div>

						<!-- Kapasitas Baterai (Khusus EV) -->
						{#if vehicleType === 'mobil_listrik'}
							<div class="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<Icon name="zap" size={16} class="text-amber-600" />
										<span class="text-xs font-bold text-amber-950">Kapasitas Baterai Mobil Listrik (kWh)</span>
									</div>
									<span class="font-mono text-xs font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
										{batteryCapacity} kWh
									</span>
								</div>
								<input
									type="range"
									min="15"
									max="120"
									step="1"
									bind:value={batteryCapacity}
									class="w-full accent-amber-600 cursor-pointer"
								/>
								<div class="flex justify-between text-[10px] text-amber-800 font-mono">
									<span>15 kWh (City Car)</span>
									<span>58 kWh (Standard EV)</span>
									<span>120 kWh (Long Range)</span>
								</div>
								<p class="text-[11px] text-amber-900 leading-relaxed italic">
									* Sesuai ketentuan, mobil listrik di garasi listrik wajib melakukan pengisian daya hingga 100% penuh otomatis.
								</p>
							</div>
						{/if}
					</div>

					<!-- STEP 2: DURASI & TANGGAL SEWA -->
					<div class="bg-white rounded-2xl border border-[#DFD5C2] p-6 shadow-xs space-y-4 card-hover">
						<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="w-6 h-6 rounded-lg bg-[#383123] text-white flex items-center justify-center text-xs font-bold font-mono">2</span>
								<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
									Pilihan Periode & Durasi Sewa
								</h2>
							</div>
							<span class="text-[11px] text-[#877758]">Harian / Bulanan</span>
						</div>

						<!-- Segmented Switch Harian vs Bulanan -->
						<div class="grid grid-cols-2 p-1 bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl gap-1">
							<button
								type="button"
								onclick={() => { rentalType = 'harian'; if (duration > 30) duration = 30; }}
								class="py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 {rentalType === 'harian' ? 'bg-[#383123] text-white shadow-xs' : 'text-[#6B5E45] hover:text-[#383123]'}"
							>
								<span>Sewa Harian (Maks 30 Hari)</span>
							</button>

							<button
								type="button"
								onclick={() => { rentalType = 'bulanan'; if (duration > 12) duration = 12; }}
								class="py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 {rentalType === 'bulanan' ? 'bg-[#383123] text-white shadow-xs' : 'text-[#6B5E45] hover:text-[#383123]'}"
							>
								<span>Sewa Bulanan (Hemat 25x Tarif)</span>
							</button>
						</div>

						<!-- Durasi Number & Quick Chips -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="duration" class="text-xs font-bold text-[#383123]">
									Durasi Waktu Sewa:
								</label>
								<span class="font-mono text-xs font-extrabold text-[#71856A]">
									{duration} {rentalType === 'harian' ? 'Hari' : 'Bulan'}
								</span>
							</div>

							<div class="flex items-center gap-3">
								<button
									type="button"
									onclick={() => { if (duration > 1) duration--; }}
									class="w-10 h-10 rounded-xl bg-[#FAF8F4] hover:bg-[#EAE3D4] border border-[#DFD5C2] text-sm font-bold text-[#383123] flex items-center justify-center transition"
								>
									-
								</button>
								<input
									type="number"
									id="duration"
									name="duration"
									bind:value={duration}
									min="1"
									max={rentalType === 'harian' ? 30 : 12}
									required
									class="flex-1 px-3.5 py-2 rounded-xl border border-[#DFD5C2] bg-white text-center text-sm font-mono font-bold text-[#383123] focus:outline-none focus:border-[#71856A]"
								/>
								<button
									type="button"
									onclick={() => { const max = rentalType === 'harian' ? 30 : 12; if (duration < max) duration++; }}
									class="w-10 h-10 rounded-xl bg-[#FAF8F4] hover:bg-[#EAE3D4] border border-[#DFD5C2] text-sm font-bold text-[#383123] flex items-center justify-center transition"
								>
									+
								</button>
							</div>

							<!-- Quick Presets -->
							<div class="flex flex-wrap gap-1.5 pt-1">
								{#if rentalType === 'harian'}
									{#each [1, 2, 3, 5, 7, 14, 30] as d}
										<button
											type="button"
											onclick={() => { duration = d; }}
											class="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition border {duration === d ? 'bg-[#71856A] text-white border-[#71856A]' : 'bg-[#FAF8F4] text-[#6B5E45] border-[#DFD5C2] hover:bg-[#EAE3D4]'}"
										>
											+{d} Hari
										</button>
									{/each}
								{:else}
									{#each [1, 2, 3, 6, 12] as m}
										<button
											type="button"
											onclick={() => { duration = m; }}
											class="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition border {duration === m ? 'bg-[#71856A] text-white border-[#71856A]' : 'bg-[#FAF8F4] text-[#6B5E45] border-[#DFD5C2] hover:bg-[#EAE3D4]'}"
										>
											+{m} Bulan
										</button>
									{/each}
								{/if}
							</div>
						</div>

						<!-- Timeline Tanggal Visual -->
						<div class="bg-[#FCFAF4] p-3.5 rounded-xl border border-[#DFD5C2] grid grid-cols-2 gap-3 text-xs">
							<div>
								<span class="text-[10px] font-bold text-[#877758] uppercase block">Tanggal Mulai Sewa</span>
								<span class="font-mono font-extrabold text-[#383123] text-xs block mt-0.5">
									{formatDateIndo(selectedStartDate)}
								</span>
							</div>
							<div>
								<span class="text-[10px] font-bold text-[#71856A] uppercase block">Tanggal Selesai (Batas Akhir)</span>
								<span class="font-mono font-extrabold text-[#2E382A] text-xs block mt-0.5">
									{formatDateIndo(calculatedEndDate)}
								</span>
							</div>
						</div>
					</div>

					<!-- STEP 3: PILIH SLOT GARASI (Interactive Bento Grid) -->
					<div class="bg-white rounded-2xl border border-[#DFD5C2] p-6 shadow-xs space-y-4 card-hover">
						<div class="border-b border-[#F4EFE7] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
							<div class="flex items-center gap-2">
								<span class="w-6 h-6 rounded-lg bg-[#383123] text-white flex items-center justify-center text-xs font-bold font-mono">3</span>
								<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider">
									Pilih Unit Slot Garasi Tersedia
								</h2>
							</div>

							<!-- Filter Status Ketersediaan -->
							<div class="flex items-center gap-1.5 text-[11px]">
								<button
									type="button"
									onclick={() => { availabilityFilter = 'all'; }}
									class="px-2.5 py-1 rounded-md font-semibold transition {availabilityFilter === 'all' ? 'bg-[#383123] text-white' : 'bg-[#FAF8F4] text-[#6B5E45] border border-[#DFD5C2]'}"
								>
									Semua ({filteredGarages.length})
								</button>
								<button
									type="button"
									onclick={() => { availabilityFilter = 'ready'; }}
									class="px-2.5 py-1 rounded-md font-semibold transition {availabilityFilter === 'ready' ? 'bg-[#71856A] text-white' : 'bg-[#FAF8F4] text-[#6B5E45] border border-[#DFD5C2]'}"
								>
									Kosong ({readyGaragesCount})
								</button>
								<button
									type="button"
									onclick={() => { availabilityFilter = 'booked'; }}
									class="px-2.5 py-1 rounded-md font-semibold transition {availabilityFilter === 'booked' ? 'bg-amber-600 text-white' : 'bg-[#FAF8F4] text-[#6B5E45] border border-[#DFD5C2]'}"
								>
									Terisi ({bookedGaragesCount})
								</button>
							</div>
						</div>

						<!-- Banner Jika Garasi Penuh -->
						{#if readyGaragesCount === 0}
							<div class="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
								<div class="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
									<Icon name="alert" size={18} />
									<span>⛔ SELURUH SLOT GARASI TIPE INI SEDANG PENUH</span>
								</div>
								<p class="text-xs text-rose-800 leading-relaxed">
									Tidak ada slot garasi kosong pada tanggal <strong>{formatDateIndo(selectedStartDate)}</strong>.
									{#if earliestAvailableDate}
										Slot garasi berikutnya akan kosong pada: <strong class="font-mono text-rose-950 underline">{formatDateIndo(earliestAvailableDate)}</strong> ({getDaysRemainingText(earliestAvailableDate, selectedStartDate)}).
									{/if}
								</p>
								{#if earliestAvailableDate}
									<button
										type="button"
										onclick={() => {
											selectedStartDate = earliestAvailableDate;
											availabilityFilter = 'all';
										}}
										class="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 btn-interactive mt-1"
									>
										<span>Jadwalkan Mulai Tanggal {formatDateIndo(earliestAvailableDate)}</span>
										<Icon name="arrow-right" size={12} />
									</button>
								{/if}
							</div>
						{/if}

						<!-- Grid Slot Garasi -->
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{#each displayedGarages as g (g.id)}
								{@const isBooked = isGarageBookedOnSelectedRange(g, selectedStartDate, calculatedEndDate)}
								{@const isSelected = selectedGarageId === g.id}

								<div
									role="button"
									tabindex="0"
									onclick={() => {
										if (!isBooked) {
											selectedGarageId = g.id;
										}
									}}
									onkeydown={(e) => {
										if ((e.key === 'Enter' || e.key === ' ') && !isBooked) {
											selectedGarageId = g.id;
										}
									}}
									class="p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[120px] cursor-pointer {isBooked ? 'bg-[#F4EFE7]/50 border-dashed border-[#DFD5C2] opacity-80 cursor-not-allowed' : isSelected ? 'bg-[#EFF3ED] border-[#71856A] ring-2 ring-[#71856A] shadow-xs' : 'bg-[#FAF8F4] border-[#DFD5C2] hover:border-[#BEB092]'}"
								>
									<div class="flex items-start justify-between">
										<span class="font-mono font-extrabold text-sm px-2 py-0.5 rounded {isSelected ? 'bg-[#71856A] text-white' : 'bg-[#383123] text-white'}">
											{g.code}
										</span>

										{#if isBooked}
											<span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
												Terisi
											</span>
										{:else}
											<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
												<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
												Ready
											</span>
										{/if}
									</div>

									<div class="mt-2 space-y-0.5">
										<span class="text-[11px] font-bold text-[#383123] block leading-tight truncate">
											{g.car_type || g.vehicle_name}
										</span>
										<span class="text-[10px] font-mono text-[#596A53] font-bold block">
											{formatRupiah(g.daily_price)} / hari
										</span>
									</div>

									{#if isBooked}
										<div class="mt-2 pt-1 border-t border-[#DFD5C2]/60">
											<span class="text-[9px] text-[#877758] block">
												Ready: <strong class="text-[#383123] font-mono">{formatDateIndo(g.next_available_date)}</strong>
											</span>
											<button
												type="button"
												onclick={(e) => {
													e.stopPropagation();
													scheduleFromReadyDate(g);
												}}
												class="text-[9px] text-[#71856A] font-bold underline hover:text-[#596A53] mt-0.5"
											>
												Pilih Tanggal Ini
											</button>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- ================= RIGHT COLUMN: STICKY INVOICE / RINGKASAN ORDER (5 COLS) ================= -->
				<div class="lg:col-span-5 sticky top-20 space-y-6">
					<div class="bg-white rounded-2xl border border-[#DFD5C2] shadow-md p-6 space-y-5">
						<div class="flex items-center justify-between border-b border-[#F4EFE7] pb-3.5">
							<h3 class="text-sm font-extrabold text-[#383123] flex items-center gap-2">
								<Icon name="file-text" size={16} class="text-[#71856A]" />
								<span>Ringkasan Transaksi Sewa</span>
							</h3>
							<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FAF8F4] text-[#71856A] border border-[#DFD5C2]">
								GARTA TAKALAR
							</span>
						</div>

						<!-- Selected Slot Preview Card -->
						{#if selectedGarage}
							<div class="bg-[#EFF3ED] p-4 rounded-xl border border-[#C2CCBC] flex items-center justify-between">
								<div class="space-y-0.5">
									<span class="text-[10px] text-[#596A53] uppercase font-bold tracking-wider">Unit Slot Dipilih</span>
									<div class="text-base font-extrabold text-[#2E382A] font-mono">
										Slot {selectedGarage.code}
									</div>
									<div class="text-[11px] text-[#596A53]">
										{selectedGarage.car_type || selectedGarage.vehicle_name}
									</div>
								</div>
								<div class="text-right">
									<span class="text-[10px] text-[#596A53] uppercase block font-semibold">Tarif Pokok</span>
									<span class="text-xs font-mono font-bold text-[#2E382A]">
										{formatRupiah(selectedGarage.daily_price)} / hari
									</span>
								</div>
							</div>
						{:else}
							<div class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-900">
								Silakan pilih slot garasi yang berstatus ready di sebelah kiri.
							</div>
						{/if}

						<!-- Hidden Garage ID input -->
						<input type="hidden" name="garageId" value={selectedGarageId || ''} />
						<input type="hidden" name="vehicleType" value={vehicleType} />
						<input type="hidden" name="rentalType" value={rentalType} />
						<input type="hidden" name="batteryCapacity" value={batteryCapacity} />

						<!-- Breakdown Rincian Biaya -->
						<div class="space-y-2.5 text-xs">
							<div class="flex justify-between text-[#6B5E45]">
								<span>Durasi Waktu ({rentalType === 'harian' ? 'Harian' : 'Bulanan'}):</span>
								<span class="font-mono font-bold text-[#383123]">
									{duration} {rentalType === 'harian' ? 'Hari' : 'Bulan'}
								</span>
							</div>

							<div class="flex justify-between text-[#6B5E45]">
								<span>Biaya Sewa Pokok:</span>
								<span class="font-mono font-bold text-[#383123]">
									{formatRupiah(costCalculation.baseCost)}
								</span>
							</div>

							{#if costCalculation.electricityCost > 0}
								<div class="flex justify-between text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
									<div>
										<span class="block font-bold">Pengisian Baterai Listrik:</span>
										<span class="text-[10px] text-amber-700">{batteryCapacity} kWh × Rp 2.500/kWh</span>
									</div>
									<span class="font-mono font-bold">
										{formatRupiah(costCalculation.electricityCost)}
									</span>
								</div>
							{/if}

							<div class="pt-3 border-t border-[#DFD5C2] flex items-baseline justify-between">
								<div>
									<span class="text-xs font-extrabold text-[#383123] block">Total Pembayaran:</span>
									<span class="text-[10px] text-[#71856A]">Dihitung resmi oleh sistem</span>
								</div>
								<span class="text-lg font-mono font-extrabold text-[#2E382A]">
									{formatRupiah(costCalculation.totalCost)}
								</span>
							</div>
						</div>

						<!-- DROPZONE UPLOAD BUKTI BAYAR -->
						<div class="space-y-2 pt-2 border-t border-[#F4EFE7]">
							<label for="paymentProof" class="text-xs font-bold text-[#383123] flex items-center justify-between">
								<span>Bukti Pelunasan Biaya <span class="text-rose-500">*</span></span>
								<span class="text-[10px] font-normal text-[#877758]">Transfer / Struk</span>
							</label>

							<div class="border-2 border-dashed border-[#DFD5C2] hover:border-[#71856A] rounded-xl p-3 bg-[#FAF8F4] text-center transition">
								<input
									type="file"
									id="paymentProof"
									name="paymentProof"
									accept="image/*"
									onchange={handleFileChange}
									required
									class="hidden"
								/>

								{#if proofPreview}
									<div class="space-y-2">
										<img src={proofPreview} alt="Bukti Bayar" class="max-h-32 mx-auto rounded-lg object-contain border border-[#DFD5C2]" />
										<div class="flex items-center justify-center gap-2">
											<label
												for="paymentProof"
												class="text-[11px] font-bold text-[#71856A] hover:underline cursor-pointer"
											>
												Ganti Foto
											</label>
											<span class="text-[#DFD5C2]">&bull;</span>
											<button
												type="button"
												onclick={removeProof}
												class="text-[11px] font-bold text-rose-600 hover:underline"
											>
												Hapus
											</button>
										</div>
									</div>
								{:else}
									<label for="paymentProof" class="cursor-pointer block space-y-1.5 py-3">
										<div class="w-10 h-10 rounded-full bg-[#EFF3ED] text-[#71856A] flex items-center justify-center mx-auto border border-[#DFE5DC]">
											<Icon name="upload" size={18} />
										</div>
										<span class="text-xs font-bold text-[#383123] block">Klik untuk Unggah Gambar</span>
										<span class="text-[10px] text-[#877758] block">Format JPG, PNG, atau WebP</span>
									</label>
								{/if}
							</div>
						</div>

						<!-- CTA SUBMIT BUTTON -->
						<button
							type="submit"
							disabled={!selectedGarageId}
							class="w-full py-3 bg-[#71856A] hover:bg-[#596A53] disabled:bg-[#BEB092] disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 btn-interactive"
						>
							<Icon name="check" size={16} />
							<span>Simpan Permohonan Sewa Garasi</span>
						</button>

						<p class="text-[10px] text-[#877758] text-center leading-tight">
							* Status unit garasi akan otomatis berubah menjadi <span class="font-mono font-bold text-[#383123]">used</span> setelah permohonan berhasil disimpan.
						</p>
					</div>
				</div>
			</div>
		</form>
	{/if}
</div>
