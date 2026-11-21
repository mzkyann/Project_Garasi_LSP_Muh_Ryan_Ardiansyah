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

	$effect(() => {
		if (!selectedStartDate && data.today) {
			selectedStartDate = data.today;
		}
	});

	// Filter tab ketersediaan (Semua / Kosong / Terisi)
	let availabilityFilter = $state<'all' | 'ready' | 'booked'>('all');

	// Modal detail jadwal ketersediaan garasi
	let scheduleModalGarage = $state<any | null>(null);

	// Helper pergeseran tanggal
	function getOffsetDate(days: number): string {
		const d = new Date(data.today || new Date());
		d.setDate(d.getDate() + days);
		return d.toISOString().split('T')[0];
	}

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
	// - Sepeda / Sepeda Motor -> Garasi Tipe Sepeda (Kode S...)
	// - Mobil -> Garasi Tipe Mobil (Kode C...)
	// - Mobil Listrik -> Garasi Tipe Mobil Listrik (Kode E...) atau Garasi Mobil (Kode C...)
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

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:head>
	<title>Sewa Slot Garasi Kendaraan - SIM-GARASI</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-2 space-y-6">
	<!-- Page Header with Earthy Palette -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs card-hover flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="building" size={14} />
				<span>Modul Penyewaan Tempat Garasi</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Formulir Sewa Slot Garasi Kendaraan</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Daftarkan kendaraan Anda untuk mendapatkan slot garasi berkanopi aman (sepeda, motor, mobil bensin, maupun mobil listrik EV dengan stasiun SPKLU).
			</p>
		</div>

		<a
			href="/penyewa/riwayat"
			class="px-3.5 py-1.5 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] text-xs font-semibold rounded-lg border border-[#DFD5C2] transition flex items-center gap-1.5 self-start md:self-auto btn-interactive"
		>
			<Icon name="clock" size={13} />
			<span>Lihat Riwayat Sewa</span>
		</a>
	</div>

	{#if data.notApproved}
		<div class="bg-white border border-[#DAC99B] rounded-xl p-8 text-center space-y-3 shadow-xs">
			<div class="w-12 h-12 rounded-full bg-[#FAF8F4] text-[#8A7545] flex items-center justify-center mx-auto border border-[#DAC99B]">
				<Icon name="clock" size={24} />
			</div>
			<h2 class="text-base font-bold text-[#383123]">Status Akun Belum Disetujui</h2>
			<p class="text-xs text-[#6B5E45] max-w-md mx-auto leading-relaxed">
				Akun Anda saat ini berstatus <span class="font-mono font-bold uppercase text-[#8A7545] bg-[#FAF8F4] px-2 py-0.5 rounded border border-[#DAC99B]">{data.userStatus}</span>.
				Admin wajib memverifikasi dokumen KTP Anda terlebih dahulu sebelum transaksi sewa dapat dilakukan.
			</p>
			<div class="pt-2">
				<a
					href="/"
					class="inline-block px-4 py-2 bg-[#71856A] hover:bg-[#596A53] text-white rounded-lg text-xs font-bold transition btn-interactive"
				>
					Kembali ke Beranda
				</a>
			</div>
		</div>
	{:else}
		{#if form?.error}
			<div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2.5">
				<Icon name="alert" size={16} class="text-rose-600 shrink-0" />
				<span>{form.error}</span>
			</div>
		{/if}

		<form method="POST" action="?/submitRental" enctype="multipart/form-data" class="space-y-6">
			<!-- Hidden startDate value -->
			<input type="hidden" name="startDate" value={selectedStartDate} />

			<!-- Bagian 1: Detail Kendaraan yang Disewakan Garasi (Sesuai Soal LSP) -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs space-y-4 card-hover">
				<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="car" size={15} class="text-[#71856A]" />
						<span>1. Detail Kendaraan Anda</span>
					</h2>
					<span class="text-[11px] text-[#A08F6E]">Wajib mencantumkan data kendaraan</span>
				</div>

				<!-- Pilihan Tipe Kendaraan -->
				<div>
					<span class="block text-xs font-bold text-[#4F4532] mb-1.5">
						Tipe Kendaraan Anda <span class="text-rose-600">*</span>
					</span>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
						<button
							type="button"
							onclick={() => { vehicleType = 'sepeda_motor'; }}
							class="p-3 rounded-xl border text-left transition btn-interactive {vehicleType === 'sepeda_motor' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="flex items-center gap-2">
								<Icon name="bike" size={16} class="text-[#71856A]" />
								<span class="font-bold text-xs">Sepeda Motor</span>
							</div>
							<div class="text-[10px] text-[#71856A] mt-1 font-semibold">Garasi S (Rp 20.000/hr)</div>
						</button>

						<button
							type="button"
							onclick={() => { vehicleType = 'mobil'; }}
							class="p-3 rounded-xl border text-left transition btn-interactive {vehicleType === 'mobil' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="flex items-center gap-2">
								<Icon name="car" size={16} class="text-[#877758]" />
								<span class="font-bold text-xs">Mobil Bensin</span>
							</div>
							<div class="text-[10px] text-[#877758] mt-1 font-semibold">Garasi C (Rp 50.000/hr)</div>
						</button>

						<button
							type="button"
							onclick={() => { vehicleType = 'mobil_listrik'; }}
							class="p-3 rounded-xl border text-left transition btn-interactive {vehicleType === 'mobil_listrik' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="flex items-center gap-2">
								<Icon name="zap" size={16} class="text-[#596A53]" />
								<span class="font-bold text-xs">Mobil Listrik (EV)</span>
							</div>
							<div class="text-[10px] text-[#596A53] mt-1 font-semibold">Garasi E (Rp 75.000/hr + Cas)</div>
						</button>

						<button
							type="button"
							onclick={() => { vehicleType = 'sepeda'; }}
							class="p-3 rounded-xl border text-left transition btn-interactive {vehicleType === 'sepeda' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="flex items-center gap-2">
								<Icon name="bike" size={16} class="text-[#71856A]" />
								<span class="font-bold text-xs">Sepeda (Gowes)</span>
							</div>
							<div class="text-[10px] text-[#71856A] mt-1 font-semibold">Bebas Nomor Plat</div>
						</button>
					</div>
					<input type="hidden" name="vehicleType" value={vehicleType} />
				</div>

				<!-- Input Merek/Tipe + Plat Polisi + Kapasitas Baterai -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
					<div>
						<label for="vehicleBrandModel" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Merek dan Tipe Kendaraan <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="vehicleBrandModel"
							name="vehicleBrandModel"
							bind:value={vehicleBrandModel}
							required
							placeholder={vehicleType === 'sepeda' ? 'Polygon Strattos S3' : vehicleType === 'sepeda_motor' ? 'Honda Vario 160' : vehicleType === 'mobil' ? 'Toyota Avanza 1.5G' : 'Hyundai Ioniq 5'}
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium text-[#383123]"
						/>
					</div>

					<div>
						<label for="licensePlate" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Nomor Plat Kendaraan {#if vehicleType !== 'sepeda'}<span class="text-rose-600">*</span>{:else}<span class="text-[#A08F6E] font-normal">(Bebas plat)</span>{/if}
						</label>
						<input
							type="text"
							id="licensePlate"
							name="licensePlate"
							bind:value={licensePlate}
							required={vehicleType !== 'sepeda'}
							placeholder={vehicleType === 'sepeda' ? 'Bebas Plat' : 'B 1234 ABC'}
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold text-[#383123] uppercase"
						/>
					</div>

					{#if vehicleType === 'mobil_listrik'}
						<div>
							<label for="batteryCapacity" class="block text-xs font-bold text-[#4F4532] mb-1.5">
								Kapasitas Baterai Listrik (kWh) <span class="text-rose-600">*</span>
							</label>
							<input
								type="number"
								id="batteryCapacity"
								name="batteryCapacity"
								bind:value={batteryCapacity}
								min="1"
								max="200"
								step="0.1"
								required
								placeholder="58"
								class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold text-[#383123]"
							/>
							<span class="text-[10px] text-[#596A53] mt-0.5 block font-semibold">
								Wajib isi baterai full @ Rp 2.500/kWh
							</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Bagian 2: PILIH TANGGAL SEWA & KALKULASI PERIODE -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs space-y-4 card-hover">
				<div class="border-b border-[#F4EFE7] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
					<div>
						<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
							<Icon name="calendar" size={15} class="text-[#71856A]" />
							<span>2. Periode & Durasi Sewa Garasi</span>
						</h2>
						<p class="text-[11px] text-[#6B5E45] mt-0.5">
							Sesuai ketentuan soal: Tanggal mulai sewa selalu hari ini, tanggal selesai dihitung otomatis oleh sistem.
						</p>
					</div>
					<div class="flex items-center gap-1.5 self-start sm:self-auto">
						<span class="text-[11px] text-[#877758] font-semibold">Pilihan Cepat:</span>
						<button
							type="button"
							onclick={() => (selectedStartDate = data.today)}
							class="px-2 py-0.5 text-[11px] font-bold rounded border transition btn-interactive {selectedStartDate === data.today ? 'bg-[#71856A] text-white border-[#71856A]' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
						>
							Hari Ini
						</button>
						<button
							type="button"
							onclick={() => (selectedStartDate = getOffsetDate(1))}
							class="px-2 py-0.5 text-[11px] font-bold rounded border transition btn-interactive {selectedStartDate === getOffsetDate(1) ? 'bg-[#71856A] text-white border-[#71856A]' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
						>
							Besok
						</button>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
					<!-- Pemilih Tanggal Mulai -->
					<div>
						<label for="startDateInput" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Tanggal Mulai Sewa <span class="text-rose-600">*</span>
						</label>
						<div class="relative">
							<input
								type="date"
								id="startDateInput"
								bind:value={selectedStartDate}
								min={data.today}
								required
								class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold text-[#383123]"
							/>
						</div>
						<span class="text-[11px] text-[#71856A] font-semibold mt-1 block">
							Mulai: {formatDateIndo(selectedStartDate)} ({getDaysRemainingText(selectedStartDate, data.today)})
						</span>
					</div>

					<!-- Kategori Durasi -->
					<div>
						<label for="rentalType" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Kategori Durasi Sewa <span class="text-rose-600">*</span>
						</label>
						<select
							id="rentalType"
							name="rentalType"
							bind:value={rentalType}
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						>
							<option value="harian">Sewa Harian (Maksimal 30 Hari)</option>
							<option value="bulanan">Sewa Bulanan (Tarif = 25 x Tarif Harian)</option>
						</select>
					</div>

					<!-- Input Durasi -->
					<div>
						<div class="flex justify-between items-center mb-1.5">
							<label for="duration" class="text-xs font-bold text-[#4F4532]">
								Durasi ({rentalType === 'harian' ? 'Hari' : 'Bulan'}) <span class="text-rose-600">*</span>
							</label>
							<span class="text-[11px] text-[#A08F6E]">
								{rentalType === 'harian' ? 'Maks. 30 hari' : 'Maks. 12 bulan'}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<input
								type="number"
								id="duration"
								name="duration"
								bind:value={duration}
								min="1"
								max={rentalType === 'harian' ? 30 : 12}
								required
								class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
							/>
							<div class="flex gap-1 shrink-0">
								{#if rentalType === 'harian'}
									<button
										type="button"
										onclick={() => (duration = 1)}
										class="px-2 py-1 text-[11px] bg-[#FAF8F4] hover:bg-[#EFE8D6] rounded border border-[#DFD5C2] font-mono font-bold"
									>1h</button>
									<button
										type="button"
										onclick={() => (duration = 3)}
										class="px-2 py-1 text-[11px] bg-[#FAF8F4] hover:bg-[#EFE8D6] rounded border border-[#DFD5C2] font-mono font-bold"
									>3h</button>
									<button
										type="button"
										onclick={() => (duration = 7)}
										class="px-2 py-1 text-[11px] bg-[#FAF8F4] hover:bg-[#EFE8D6] rounded border border-[#DFD5C2] font-mono font-bold"
									>7h</button>
								{:else}
									<button
										type="button"
										onclick={() => (duration = 1)}
										class="px-2 py-1 text-[11px] bg-[#FAF8F4] hover:bg-[#EFE8D6] rounded border border-[#DFD5C2] font-mono font-bold"
									>1bln</button>
									<button
										type="button"
										onclick={() => (duration = 3)}
										class="px-2 py-1 text-[11px] bg-[#FAF8F4] hover:bg-[#EFE8D6] rounded border border-[#DFD5C2] font-mono font-bold"
									>3bln</button>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Ringkasan Periode Aktif -->
				<div class="bg-[#EFF3ED] border border-[#C2CCBC] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
					<div class="flex items-center gap-2 text-[#2E382A]">
						<Icon name="calendar" size={15} class="text-[#71856A]" />
						<span>
							{#if rentalType === 'harian' && duration === 1}
								Masa Sewa: <strong>{formatDateIndo(selectedStartDate)} (1 Hari / 24 Jam)</strong> • Selesai: <strong>{formatDateIndo(calculatedEndDate)}</strong>
							{:else}
								Periode Sewa: <strong>{formatDateIndo(selectedStartDate)}</strong> s/d <strong>{formatDateIndo(calculatedEndDate)}</strong>
								<span class="font-mono text-[#596A53]">({duration} {rentalType === 'harian' ? 'Hari' : 'Bulan'})</span>
							{/if}
						</span>
					</div>
					<span class="text-[11px] text-[#596A53] font-semibold bg-white px-2.5 py-0.5 rounded-full border border-[#DFE5DC] self-start sm:self-auto">
						Ketersediaan slot otomatis disesuaikan
					</span>
				</div>
			</div>

			<!-- Bagian 3: PILIH UNIT SLOT GARASI TERSEDIA (DENGAN DETEKSI GARASI PENUH) -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs space-y-4 card-hover">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F4EFE7] pb-3 gap-2">
					<div>
						<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
							<Icon name="building" size={15} class="text-[#71856A]" />
							<span>3. Pilih Slot Garasi ({readyGaragesCount} Slot Tersedia)</span>
						</h2>
						<p class="text-[11px] text-[#6B5E45] mt-0.5">
							Pilih slot garasi yang kosong untuk kendaraan Anda. Jika garasi penuh, sistem akan menampilkan tanggal kapan slot kosong kembali.
						</p>
					</div>

					<!-- Filter Ketersediaan Cepat -->
					<div class="flex items-center gap-1.5 self-start sm:self-auto">
						<button
							type="button"
							onclick={() => (availabilityFilter = 'all')}
							class="px-2.5 py-1 text-[11px] font-bold rounded-lg border transition btn-interactive {availabilityFilter === 'all' ? 'bg-[#71856A] text-white border-[#71856A]' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2]'}"
						>
							Semua ({filteredGarages.length})
						</button>
						<button
							type="button"
							onclick={() => (availabilityFilter = 'ready')}
							class="px-2.5 py-1 text-[11px] font-bold rounded-lg border transition btn-interactive {availabilityFilter === 'ready' ? 'bg-[#596A53] text-white border-[#596A53]' : 'bg-[#FAF8F4] text-[#596A53] border-[#DFD5C2]'}"
						>
							✓ Kosong ({readyGaragesCount})
						</button>
						<button
							type="button"
							onclick={() => (availabilityFilter = 'booked')}
							class="px-2.5 py-1 text-[11px] font-bold rounded-lg border transition btn-interactive {availabilityFilter === 'booked' ? 'bg-[#8A7545] text-white border-[#8A7545]' : 'bg-[#FAF8F4] text-[#8A7545] border-[#DFD5C2]'}"
						>
							Terisi ({bookedGaragesCount})
						</button>
					</div>
				</div>

				<!-- KONDISI JIKA GARASI PENUH -->
				{#if readyGaragesCount === 0}
					<div class="p-5 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-3">
						<div class="flex items-start gap-3">
							<div class="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
								<Icon name="alert" size={20} />
							</div>
							<div class="flex-1">
								<div class="font-extrabold text-sm text-rose-800">
									⛔ GARASI PENUH — Semua Slot Sedang Terisi
								</div>
								<p class="text-xs text-rose-700 mt-1 leading-relaxed">
									Seluruh slot garasi untuk tipe kendaraan ini sedang terisi pada periode sewa yang Anda pilih ({formatDateIndo(selectedStartDate)} s/d {formatDateIndo(calculatedEndDate)}).
								</p>
								{#if earliestAvailableDate}
									<div class="mt-2.5 p-3 bg-white rounded-lg border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
										<div>
											<span class="text-rose-700">Slot garasi berikutnya akan kosong pada tanggal:</span>
											<strong class="font-mono text-rose-900 block sm:inline sm:ml-1 font-extrabold">{formatDateIndo(earliestAvailableDate)}</strong>
										</div>
										<button
											type="button"
											onclick={() => {
												selectedStartDate = earliestAvailableDate;
												availabilityFilter = 'all';
											}}
											class="px-3.5 py-1.5 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg transition text-[11px] flex items-center gap-1.5 shrink-0 shadow-xs"
										>
											<Icon name="calendar" size={13} />
											<span>⚡ Jadwalkan Mulai {formatDateIndo(earliestAvailableDate)}</span>
										</button>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				{#if displayedGarages.length === 0}
					<div class="p-8 bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl text-center text-[#877758] text-xs space-y-1">
						<div class="font-bold">Tidak ada unit slot garasi pada kriteria filter ini.</div>
						<div class="text-[11px] text-[#A08F6E]">Ubah filter ketersediaan ke "Semua" untuk melihat seluruh slot.</div>
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each displayedGarages as garage (garage.id)}
							{@const isBooked = isGarageBookedOnSelectedRange(garage, selectedStartDate, calculatedEndDate)}
							<div
								class="border rounded-xl p-4.5 transition-all flex flex-col justify-between {isBooked ? 'bg-[#FDFBF7] border-[#EAE3D4]' : selectedGarageId === garage.id ? 'border-[#71856A] bg-[#EFF3ED] ring-2 ring-[#71856A] shadow-sm' : 'border-[#DFD5C2] hover:border-[#BEB092] bg-[#FAF8F4]'}"
							>
								<div>
									<!-- Top Row: Radio + Code + Status Badge -->
									<div class="flex items-start justify-between gap-2">
										<label class="flex items-center gap-2.5 cursor-pointer">
											<input
												type="radio"
												name="garageId"
												value={garage.id}
												bind:group={selectedGarageId}
												disabled={isBooked}
												class="text-[#71856A] focus:ring-[#71856A] accent-[#71856A] disabled:opacity-40"
											/>
											<div>
												<span class="font-mono font-extrabold text-base text-[#383123]">{garage.code}</span>
												<span class="text-[11px] font-mono text-[#877758] bg-white px-2 py-0.5 rounded border border-[#DFE5DC] ml-1.5 font-bold uppercase">
													{garage.type.replace('_', ' ')}
												</span>
											</div>
										</label>

										<!-- Status Badge -->
										{#if isBooked}
											<div class="text-right">
												<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-block">
													⛔ Sedang Digunakan
												</span>
											</div>
										{:else}
											<div class="text-right">
												<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC] inline-block">
													✓ Slot Kosong
												</span>
											</div>
										{/if}
									</div>

									<!-- Middle: Slot Details -->
									<div class="mt-3 bg-white p-3 rounded-lg border border-[#F4EFE7]">
										<div class="flex items-start justify-between gap-2">
											<div>
												<div class="font-bold text-sm text-[#383123]">
													{garage.vehicle_name || `Slot Garasi ${garage.code}`}
												</div>
												<div class="text-xs text-[#6B5E45] mt-0.5 flex items-center gap-3">
													<span>Tipe: <strong class="text-[#383123]">{garage.car_type || 'Standar'}</strong></span>
												</div>
											</div>
											<button
												type="button"
												onclick={() => (scheduleModalGarage = garage)}
												class="text-[11px] text-[#71856A] hover:text-[#596A53] font-bold hover:underline shrink-0 flex items-center gap-1"
											>
												<Icon name="calendar" size={12} />
												<span>Cek Jadwal</span>
											</button>
										</div>

										{#if garage.type === 'mobil_listrik'}
											<div class="text-[11px] text-[#596A53] font-semibold mt-1.5 pt-1.5 border-t border-[#F4EFE7] flex items-center gap-1">
												<Icon name="zap" size={12} />
												<span>Dilengkapi SPKLU AC Wallbox (Tarif Cas: Rp 2.500/kWh)</span>
											</div>
										{/if}
									</div>

									<!-- HIGHLIGHT KAPAN KOSONG JIKA SEDANG DIGUNAKAN -->
									{#if isBooked}
										<div class="mt-2.5 p-2.5 bg-[#FAF8F4] border border-[#DAC99B] rounded-lg space-y-1.5">
											<div class="flex items-center justify-between text-xs">
												<span class="text-[#8A7545] font-semibold">Masa Sewa Saat Ini:</span>
												<span class="font-mono text-[#8A7545] font-bold text-[11px]">
													{formatDateIndo(garage.active_start_date)}
													{#if garage.active_end_date}
														<span class="text-[#877758] font-normal">(Selesai: {formatDateIndo(garage.active_end_date)})</span>
													{/if}
												</span>
											</div>
											<div class="flex items-center justify-between text-xs pt-1 border-t border-[#EAE3D4]">
												<span class="font-bold text-[#383123] flex items-center gap-1">
													<Icon name="clock" size={12} class="text-[#71856A]" />
													<span>Kosong Kembali:</span>
												</span>
												<span class="font-mono font-extrabold text-[#71856A] text-xs">
													{formatDateIndo(garage.next_available_date)}
													<span class="text-[10px] text-[#877758] font-normal">({getDaysRemainingText(garage.next_available_date, data.today)})</span>
												</span>
											</div>
											<div class="text-[10px] text-[#596A53] bg-[#EFF3ED] p-1.5 rounded border border-[#DFE5DC] font-medium leading-tight">
												💡 Slot langsung kosong dan siap disewa pada tanggal selesai ({formatDateIndo(garage.next_available_date)}).
											</div>
											<button
												type="button"
												onclick={() => scheduleFromReadyDate(garage)}
												class="w-full mt-1 py-1.5 bg-[#71856A] hover:bg-[#596A53] text-white rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-xs btn-interactive"
											>
												<Icon name="calendar" size={12} />
												<span>⚡ Jadwalkan Mulai {formatDateIndo(garage.next_available_date)}</span>
											</button>
										</div>
									{/if}
								</div>

								<!-- Bottom: Pricing -->
								<div class="mt-3 text-xs space-y-1 text-[#6B5E45] border-t border-[#EAE3D4] pt-2.5 font-mono">
									<div class="flex justify-between">
										<span class="text-[#877758] font-sans">Tarif Harian:</span>
										<span class="font-bold text-[#383123]">{formatRupiah(garage.daily_price)}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-[#877758] font-sans">Tarif Bulanan (25x):</span>
										<span class="font-bold text-[#71856A]">{formatRupiah(garage.daily_price * 25)}</span>
									</div>
									{#if garage.type === 'mobil_listrik'}
										<div class="flex justify-between text-[#596A53] font-semibold pt-1 border-t border-[#DFE5DC]">
											<span class="font-sans flex items-center gap-1">
												<Icon name="zap" size={11} /> Listrik SPKLU:
											</span>
											<span>{formatRupiah(garage.electricity_price_kwh || 2500)} / kWh</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Bagian 4: Pembayaran & Rincian Total -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs space-y-5 card-hover">
				<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="upload" size={15} class="text-[#71856A]" />
						<span>4. Pelunasan & Rincian Biaya Garasi</span>
					</h2>
					<span class="text-[11px] text-[#71856A] font-semibold">Tercatat Otomatis di Sistem</span>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
					<div>
						<label for="paymentProof" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Unggah Bukti Pelunasan Pembayaran <span class="text-rose-600">*</span>
						</label>
						<input
							type="file"
							id="paymentProof"
							name="paymentProof"
							accept="image/*"
							required
							class="w-full text-xs text-[#4F4532] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#EFF3ED] file:text-[#2E382A] hover:file:bg-[#DFE5DC] border border-[#DFD5C2] rounded-xl p-1.5 bg-[#FAF8F4]"
						/>
						<p class="text-[11px] text-[#A08F6E] mt-1.5">
							Format file: JPG, PNG, WebP (Struk transfer bank / QRIS)
						</p>
					</div>

					<!-- Rincian Biaya Bersih -->
					<div class="bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl p-5 space-y-2.5 text-xs shadow-xs">
						<div class="text-[#4F4532] font-bold border-b border-[#EAE3D4] pb-2 flex items-center justify-between">
							<span>Slot Garasi Pilihan</span>
							<span class="text-[10px] text-[#71856A] uppercase font-mono font-bold">
								{selectedGarage ? selectedGarage.code : 'Belum dipilih'}
							</span>
						</div>
						{#if selectedGarage}
							<div class="text-xs text-[#383123] font-bold">
								{vehicleBrandModel} <span class="text-[#877758] font-normal font-mono">({licensePlate || 'Bebas Plat'})</span>
							</div>
							<div class="text-[11px] text-[#71856A] font-semibold">
								Masa Sewa: {formatDateIndo(selectedStartDate)} s/d {formatDateIndo(calculatedEndDate)}
							</div>
						{/if}
						<div class="flex justify-between text-[#6B5E45] border-t border-[#EAE3D4] pt-2">
							<span>Biaya Sewa Garasi ({duration} {rentalType === 'harian' ? 'hari' : 'bulan'}):</span>
							<span class="font-mono font-bold text-[#383123]">{formatRupiah(costCalculation.baseCost)}</span>
						</div>
						{#if costCalculation.electricityCost > 0}
							<div class="flex justify-between text-[#596A53] pt-1 border-t border-[#EAE3D4]">
								<span>Cas Baterai 100% Full ({batteryCapacity || 58} kWh):</span>
								<span class="font-mono font-bold">+ {formatRupiah(costCalculation.electricityCost)}</span>
							</div>
						{/if}
						<div class="flex justify-between text-base font-extrabold border-t-2 border-[#DFD5C2] pt-3 text-[#383123]">
							<span>Total Biaya Sewa:</span>
							<span class="font-mono text-[#596A53]">{formatRupiah(costCalculation.totalCost)}</span>
						</div>
					</div>
				</div>

				<div class="pt-3 border-t border-[#F4EFE7]">
					<button
						type="submit"
						disabled={!selectedGarageId}
						class="w-full py-3 bg-[#71856A] hover:bg-[#596A53] disabled:bg-[#BEB092] disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 btn-interactive"
					>
						<Icon name="check" size={16} />
						<span>Konfirmasi & Simpan Sewa Garasi</span>
					</button>
				</div>
			</div>
		</form>
	{/if}
</div>

<!-- MODAL POPUP: CEK JADWAL & KALENDER KETERSEDIAAN SLOT -->
{#if scheduleModalGarage}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
		<div class="bg-white rounded-2xl border border-[#DFD5C2] max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
			<!-- Modal Header -->
			<div class="flex items-start justify-between border-b border-[#F4EFE7] pb-3.5">
				<div>
					<div class="flex items-center gap-2">
						<span class="font-mono font-extrabold text-xs px-2.5 py-0.5 bg-[#383123] text-white rounded">
							{scheduleModalGarage.code}
						</span>
						<h3 class="font-bold text-base text-[#383123]">
							Slot Garasi {scheduleModalGarage.code}
						</h3>
					</div>
					<div class="text-xs text-[#6B5E45] mt-1 flex items-center gap-3">
						<span>Tipe: <strong class="text-[#383123] uppercase">{scheduleModalGarage.type.replace('_', ' ')}</strong></span>
						<span>Tarif Harian: <strong class="text-[#71856A] font-mono">{formatRupiah(scheduleModalGarage.daily_price)}</strong></span>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (scheduleModalGarage = null)}
					aria-label="Tutup modal jadwal garasi"
					class="p-1 rounded-lg text-[#877758] hover:bg-[#F4EFE7] transition"
				>
					<Icon name="x" size={18} />
				</button>
			</div>

			<!-- Status Saat Ini & Kapan Ready -->
			<div class="space-y-3">
				<div class="p-4 rounded-xl border {scheduleModalGarage.active_end_date ? 'bg-[#FDFBF7] border-[#DAC99B]' : 'bg-[#EFF3ED] border-[#C2CCBC]'}">
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold uppercase tracking-wider {scheduleModalGarage.active_end_date ? 'text-[#8A7545]' : 'text-[#596A53]'}">
							{scheduleModalGarage.active_end_date ? 'Status: Sedang Digunakan' : 'Status: Slot Kosong Siap Digunakan'}
						</span>
						<span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full {scheduleModalGarage.active_end_date ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-white text-[#596A53] border border-[#DFE5DC]'}">
							{scheduleModalGarage.active_end_date ? 'Terisi' : 'Kosong'}
						</span>
					</div>

					{#if scheduleModalGarage.active_end_date}
						<div class="mt-3 text-xs space-y-1.5 border-t border-[#EAE3D4] pt-2.5">
							<div class="flex justify-between">
								<span class="text-[#6B5E45]">Masa Sewa Berjalan:</span>
								<span class="font-mono font-bold text-[#383123]">
									{formatDateIndo(scheduleModalGarage.active_start_date)}
									<span class="text-[#877758] font-normal">(Selesai: {formatDateIndo(scheduleModalGarage.active_end_date)})</span>
								</span>
							</div>
							{#if scheduleModalGarage.active_tenant_name}
								<div class="flex justify-between">
									<span class="text-[#6B5E45]">Penyewa Saat Ini:</span>
									<span class="font-bold text-[#383123]">{scheduleModalGarage.active_tenant_name}</span>
								</div>
							{/if}
							<div class="flex justify-between items-center bg-white p-2.5 rounded-lg border border-[#DFD5C2] mt-2">
								<span class="font-bold text-[#383123] flex items-center gap-1.5">
									<Icon name="check" size={14} class="text-[#71856A]" />
									<span>Kosong Kembali Pada:</span>
								</span>
								<span class="font-mono font-extrabold text-[#71856A] text-sm">
									{formatDateIndo(scheduleModalGarage.next_available_date)}
								</span>
							</div>
							<div class="text-[11px] text-[#596A53] bg-[#EFF3ED] p-2 rounded-lg border border-[#DFE5DC] font-medium">
								💡 Slot garasi langsung kosong dan siap disewa pada tanggal selesai ({formatDateIndo(scheduleModalGarage.next_available_date)}).
							</div>
						</div>
					{:else}
						<div class="mt-2 text-xs text-[#596A53] leading-relaxed">
							Slot garasi ini kosong dan siap disewa kapan saja mulai hari ini ({formatDateIndo(data.today)}).
						</div>
					{/if}
				</div>

				<!-- Pratinjau Ketersediaan 7 Hari ke Depan -->
				<div>
					<span class="text-xs font-bold text-[#4F4532] block mb-2">Pratinjau Ketersediaan 7 Hari Kedepan</span>
					<div class="grid grid-cols-7 gap-1.5 text-center">
						{#each Array.from({ length: 7 }) as _, i}
							{@const dayDate = getOffsetDate(i)}
							{@const nextDayDate = getOffsetDate(i + 1)}
							{@const isDayBooked = isGarageBookedOnSelectedRange(scheduleModalGarage, dayDate, nextDayDate)}
							<div class="p-2 rounded-lg border text-[10px] {isDayBooked ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-[#EFF3ED] border-[#C2CCBC] text-[#2E382A]'}">
								<div class="font-bold">{i === 0 ? 'Hari Ini' : `+${i}h`}</div>
								<div class="font-mono text-[9px] mt-0.5">{dayDate.split('-')[2]}/{dayDate.split('-')[1]}</div>
								<div class="font-extrabold mt-1 text-[11px]">{isDayBooked ? '✕' : '✓'}</div>
							</div>
						{/each}
					</div>
					<div class="flex items-center justify-between text-[10px] text-[#877758] mt-2 px-1">
						<span>✓ = Slot Kosong (Siap Sewa)</span>
						<span>✕ = Slot Terisi</span>
					</div>
				</div>
			</div>

			<!-- Modal Footer -->
			<div class="flex items-center justify-end gap-2.5 border-t border-[#F4EFE7] pt-3.5">
				<button
					type="button"
					onclick={() => (scheduleModalGarage = null)}
					class="px-4 py-2 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] text-xs font-bold rounded-lg border border-[#DFD5C2] transition btn-interactive"
				>
					Tutup
				</button>

				{#if scheduleModalGarage.active_end_date}
					<button
						type="button"
						onclick={() => {
							scheduleFromReadyDate(scheduleModalGarage);
							scheduleModalGarage = null;
						}}
						class="px-4 py-2 bg-[#71856A] hover:bg-[#596A53] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 btn-interactive"
					>
						<Icon name="calendar" size={13} />
						<span>Pilih Mulai {formatDateIndo(scheduleModalGarage.next_available_date)}</span>
					</button>
				{:else}
					<button
						type="button"
						onclick={() => {
							selectedStartDate = data.today;
							selectedGarageId = scheduleModalGarage.id;
							scheduleModalGarage = null;
						}}
						class="px-4 py-2 bg-[#71856A] hover:bg-[#596A53] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 btn-interactive"
					>
						<Icon name="check" size={13} />
						<span>Pilih Slot Ini Sekarang</span>
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
