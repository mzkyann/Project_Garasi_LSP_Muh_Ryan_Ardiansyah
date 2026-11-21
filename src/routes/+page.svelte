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
	let simBatteryKwh = $state<number>(60);

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
	<title>Portal Penyewaan Garasi & Penitipan Kendaraan - SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Hero Header with Earthy Palette & Interactive CTAs -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 sm:p-7 shadow-xs relative overflow-hidden card-hover">
		<div class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#EFF3ED] opacity-60 pointer-events-none"></div>
		<div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
			<div class="space-y-2 max-w-2xl">
				<div class="inline-flex items-center gap-2 text-xs font-semibold text-[#596A53] bg-[#EFF3ED] px-3 py-1 rounded-full border border-[#DFE5DC]">
					<Icon name="shield" size={13} class="text-[#71856A]" />
					<span>Uji Sertifikasi Kredensial Mikro Pemrogram — LSP & Universitas Ciputra</span>
				</div>
				<h1 class="text-2xl sm:text-3xl font-extrabold text-[#383123] tracking-tight leading-tight">
					Sistem Informasi Penyewaan Garasi & Penitipan Kendaraan
				</h1>
				<p class="text-xs sm:text-sm text-[#6B5E45] leading-relaxed">
					Layanan resmi penyewaan slot garasi aman untuk sepeda, sepeda motor, mobil konvensional, serta garasi mobil listrik (EV) dengan fasilitas stasiun pengisian daya terintegrasi.
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-3 shrink-0">
				<a
					href="/penyewa/sewa-baru"
					class="px-5 py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white font-semibold rounded-lg text-xs transition-all shadow-sm flex items-center gap-2 btn-interactive"
				>
					<Icon name="plus" size={14} />
					<span>Sewa Slot Garasi</span>
				</a>
				<a
					href="/auth/login"
					class="px-5 py-2.5 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] font-semibold rounded-lg text-xs transition-all border border-[#DFD5C2] shadow-xs btn-interactive"
				>
					<span>Masuk Portal</span>
				</a>
			</div>
		</div>
	</div>

	<!-- Status Metrics Grid with Earthy Aesthetic & Progress Bar -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="bg-white p-5 rounded-xl border border-[#DFD5C2] shadow-xs card-hover flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between">
					<span class="text-[11px] font-bold text-[#6B5E45] uppercase tracking-wider">Total Kapasitas Garasi</span>
					<div class="w-7 h-7 rounded-md bg-[#FAF8F4] border border-[#DFD5C2] text-[#4F4532] flex items-center justify-center">
						<Icon name="building" size={15} />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-extrabold font-mono text-[#383123] mt-2">{data.totalCount} Slot</div>
			</div>
			<div class="text-[11px] text-[#A08F6E] mt-3 pt-2 border-t border-[#F4EFE7]">
				Total kuota seluruh tipe garasi
			</div>
		</div>

		<div class="bg-white p-5 rounded-xl border border-[#C2CCBC] shadow-xs card-hover flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between">
					<span class="text-[11px] font-bold text-[#596A53] uppercase tracking-wider">Slot Tersedia</span>
					<div class="w-7 h-7 rounded-md bg-[#EFF3ED] border border-[#DFE5DC] text-[#71856A] flex items-center justify-center">
						<Icon name="check" size={15} />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-extrabold font-mono text-[#596A53] mt-2">{data.availableCount} Slot</div>
			</div>
			<div class="text-[11px] text-[#71856A] mt-3 pt-2 border-t border-[#EFF3ED]">
				Kosong & siap disewa hari ini
			</div>
		</div>

		<div class="bg-white p-5 rounded-xl border border-[#E6D9B8] shadow-xs card-hover flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between">
					<span class="text-[11px] font-bold text-[#8A7545] uppercase tracking-wider">Slot Terisi (Used)</span>
					<div class="w-7 h-7 rounded-md bg-[#FDFBF7] border border-[#DAC99B] text-[#B0975C] flex items-center justify-center">
						<Icon name="clock" size={15} />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-extrabold font-mono text-[#8A7545] mt-2">{data.totalCount - data.availableCount} Slot</div>
			</div>
			<div class="text-[11px] text-[#B0975C] mt-3 pt-2 border-t border-[#F8F4E8]">
				Sedang digunakan penyewa
			</div>
		</div>

		<div class="bg-white p-5 rounded-xl border border-[#DFD5C2] shadow-xs card-hover flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between">
					<span class="text-[11px] font-bold text-[#6B5E45] uppercase tracking-wider">Tingkat Okupansi</span>
					<div class="w-7 h-7 rounded-md bg-[#FAF8F4] border border-[#DFD5C2] text-[#71856A] flex items-center justify-center">
						<Icon name="filter" size={15} />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-extrabold font-mono text-[#71856A] mt-2">{occupancyRate}%</div>
			</div>
			<div class="mt-3 pt-2 border-t border-[#F4EFE7]">
				<div class="w-full bg-[#EFF3ED] rounded-full h-1.5 overflow-hidden">
					<div class="bg-[#71856A] h-1.5 rounded-full transition-all duration-500" style="width: {occupancyRate}%"></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Ketersediaan Real-time Per Tipe Garasi (Dengan Status Penuh & Tanggal Kosong Berikutnya) -->
	<div class="space-y-3">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4EFE7] pb-2">
			<div>
				<h2 class="text-xs font-bold text-[#4F4532] uppercase tracking-wider flex items-center gap-2">
					<Icon name="building" size={15} class="text-[#71856A]" />
					<span>Kapasitas & Status Ketersediaan Garasi Terkini</span>
				</h2>
				<p class="text-[11px] text-[#6B5E45] mt-0.5">
					Sistem secara otomatis menampilkan kapasitas slot, tanda <strong>PENUH</strong> jika kuota habis, serta perkiraan tanggal berapa lagi slot akan kosong kembali.
				</p>
			</div>
			<span class="text-xs text-[#877758] font-mono bg-[#FAF8F4] px-2.5 py-1 rounded border border-[#DFD5C2] self-start sm:self-auto">
				Hari Ini: {formatDateIndo(data.today)}
			</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
			{#each data.stats as stat}
				{@const isSepeda = stat.type === 'sepeda'}
				{@const isMobil = stat.type === 'mobil'}
				{@const isListrik = stat.type === 'mobil_listrik'}
				<div class="bg-white rounded-xl border {stat.isFull ? 'border-rose-300 ring-1 ring-rose-300' : 'border-[#DFD5C2]'} p-5 shadow-xs flex flex-col justify-between card-hover">
					<div>
						<!-- Header Card: Icon + Title + Prefix Badge -->
						<div class="flex items-center justify-between pb-3 border-b border-[#F4EFE7]">
							<div class="flex items-center gap-2.5">
								<div class="w-10 h-10 rounded-lg flex items-center justify-center border {isSepeda ? 'bg-[#EFF3ED] text-[#71856A] border-[#DFE5DC]' : isMobil ? 'bg-[#FAF8F4] text-[#877758] border-[#DFD5C2]' : 'bg-[#EFF3ED] text-[#596A53] border-[#DFE5DC]'}">
									{#if isSepeda}
										<Icon name="bike" size={20} />
									{:else if isMobil}
										<Icon name="car" size={20} />
									{:else}
										<Icon name="zap" size={20} />
									{/if}
								</div>
								<div>
									<span class="font-bold text-sm text-[#383123] block leading-tight">
										{#if isSepeda}Garasi Sepeda & Motor{:else if isMobil}Garasi Mobil Bensin{:else}Garasi Mobil Listrik (EV){/if}
									</span>
									<span class="text-[10px] text-[#A08F6E]">
										{#if isSepeda}Sepeda Gowes & Sepeda Motor{:else if isMobil}MPV, SUV, Sedan, City Car{:else}Fasilitas SPKLU AC Wallbox{/if}
									</span>
								</div>
							</div>
							<span class="font-mono text-xs font-extrabold px-2 py-0.5 rounded border {isSepeda ? 'bg-[#EFF3ED] text-[#596A53] border-[#DFE5DC]' : isMobil ? 'bg-[#FAF8F4] text-[#877758] border-[#DFD5C2]' : 'bg-[#EFF3ED] text-[#596A53] border-[#DFE5DC]'}">
								{#if isSepeda}S001..{:else if isMobil}C001..{:else}E001..{/if}
							</span>
						</div>

						<!-- Status Badge Penuh / Tersedia -->
						<div class="mt-3">
							{#if stat.isFull}
								<div class="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
									<div class="flex items-center justify-between">
										<span class="font-mono font-extrabold text-xs text-rose-700 flex items-center gap-1.5">
											<Icon name="alert" size={13} />
											<span>⛔ GARASI PENUH</span>
										</span>
										<span class="text-[10px] font-mono text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200 font-bold">
											0/{stat.total} Kosong
										</span>
									</div>
									<div class="text-[11px] text-rose-800 pt-1 border-t border-rose-200/60 flex items-center justify-between">
										<span>Kosong lagi pada:</span>
										<strong class="font-mono font-bold text-rose-900">
											{stat.nextEmptyDate ? formatDateIndo(stat.nextEmptyDate) : 'Menunggu Selesai'}
										</strong>
									</div>
								</div>
							{:else}
								<div class="p-2.5 bg-[#EFF3ED] border border-[#C2CCBC] rounded-lg flex items-center justify-between">
									<div class="flex items-center gap-1.5 text-[#2E382A] text-xs font-bold">
										<Icon name="check" size={14} class="text-[#71856A]" />
										<span>✓ Tersedia Siap Sewa</span>
									</div>
									<span class="text-xs font-mono font-extrabold text-[#596A53] bg-white px-2.5 py-0.5 rounded border border-[#DFE5DC]">
										{stat.available} dari {stat.total} Slot Kosong
									</span>
								</div>
							{/if}
						</div>

						<!-- Keterangan & Deskripsi -->
						<p class="text-xs text-[#6B5E45] mt-3 leading-relaxed">
							{#if isSepeda}
								Slot penitipan aman berkanopi khusus roda dua. Akses gembok individual dan terlindung dari cuaca panas maupun hujan.
							{:else if isMobil}
								Slot parkir beratap untuk kendaraan roda empat konvensional (bensin/diesel) atau EV yang tidak memerlukan pengisian daya.
							{:else}
								Slot garasi khusus kendaraan listrik dilengkapi fasilitas AC Wallbox Charger. Wajib cas penuh (100% kapasitas baterai).
							{/if}
						</p>

						<!-- Tarif Sewa Realistis Penitipan Kendaraan -->
						<div class="mt-4 space-y-1.5 text-xs bg-[#FAF8F4] p-3 rounded-lg border border-[#DFD5C2]">
							<div class="flex justify-between py-0.5">
								<span class="text-[#877758]">Tarif Sewa Harian:</span>
								<span class="font-mono font-bold text-[#383123]">{formatRupiah(stat.dailyPrice)} / hari</span>
							</div>
							<div class="flex justify-between py-0.5 border-t border-[#EAE3D4] pt-1">
								<span class="text-[#877758]">Tarif Sewa Bulanan (25x):</span>
								<span class="font-mono font-bold text-[#71856A]">{formatRupiah(stat.monthlyPrice)} / bulan</span>
							</div>
							{#if isListrik}
								<div class="flex justify-between py-0.5 border-t border-[#EAE3D4] pt-1 text-[#596A53]">
									<span>Tarif Listrik SPKLU:</span>
									<span class="font-mono font-bold">{formatRupiah(stat.electricityPrice || 2500)} / kWh</span>
								</div>
							{/if}
						</div>
					</div>

					<!-- Tombol Booking / Sewa Cepat -->
					<div class="mt-4 pt-3 border-t border-[#F4EFE7]">
						<a
							href="/penyewa/sewa-baru"
							class="w-full py-2 {stat.isFull ? 'bg-[#BEB092] hover:bg-[#A08F6E]' : 'bg-[#71856A] hover:bg-[#596A53]'} text-white text-xs font-bold rounded-lg text-center block transition shadow-xs btn-interactive"
						>
							{#if stat.isFull}
								<span>Lihat Jadwal Slot Kosong</span>
							{:else}
								<span>Sewa Slot {isSepeda ? 'Sepeda / Motor' : isMobil ? 'Mobil Bensin' : 'Mobil Listrik'}</span>
							{/if}
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Interactive Live Cost Estimator (Simulasi Biaya Penitipan Garasi) -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs card-hover">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F4EFE7] gap-2">
			<div>
				<span class="text-[11px] font-bold uppercase tracking-wider text-[#71856A] flex items-center gap-1.5">
					<Icon name="zap" size={14} />
					<span>Kalkulator Simulasi Biaya Penitipan Garasi</span>
				</span>
				<h2 class="text-lg font-bold text-[#383123] mt-0.5">Estimasi Biaya Sewa Tempat Garasi</h2>
			</div>
			<span class="text-xs text-[#877758] font-mono bg-[#FAF8F4] px-3 py-1 rounded-full border border-[#EAE3D4]">
				Sesuai Soal: Harian (≤30 hari) & Bulanan (Tarif = 25 x Harian)
			</span>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
			<!-- Interactive Form Controls -->
			<div class="lg:col-span-2 space-y-4">
				<!-- Vehicle Selector Pills -->
				<div>
					<span class="block text-xs font-bold text-[#4F4532] mb-1.5">Pilih Kategori Kendaraan Anda</span>
					<div class="grid grid-cols-3 gap-2">
						<button
							type="button"
							onclick={() => (simVehicleType = 'sepeda')}
							class="p-3 rounded-lg border text-left transition-all btn-interactive flex items-center gap-2.5 {simVehicleType === 'sepeda' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-1 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45] hover:bg-[#F4EFE7]'}"
						>
							<div class="w-8 h-8 rounded bg-white text-[#71856A] flex items-center justify-center shrink-0 border border-[#DFE5DC]">
								<Icon name="bike" size={16} />
							</div>
							<div>
								<div class="font-bold text-xs">Sepeda / Motor</div>
								<div class="text-[10px] text-[#71856A]">Garasi S (Rp 20.000/hr)</div>
							</div>
						</button>

						<button
							type="button"
							onclick={() => (simVehicleType = 'mobil')}
							class="p-3 rounded-lg border text-left transition-all btn-interactive flex items-center gap-2.5 {simVehicleType === 'mobil' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-1 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45] hover:bg-[#F4EFE7]'}"
						>
							<div class="w-8 h-8 rounded bg-white text-[#877758] flex items-center justify-center shrink-0 border border-[#DFE5DC]">
								<Icon name="car" size={16} />
							</div>
							<div>
								<div class="font-bold text-xs">Mobil Bensin</div>
								<div class="text-[10px] text-[#877758]">Garasi C (Rp 50.000/hr)</div>
							</div>
						</button>

						<button
							type="button"
							onclick={() => (simVehicleType = 'mobil_listrik')}
							class="p-3 rounded-lg border text-left transition-all btn-interactive flex items-center gap-2.5 {simVehicleType === 'mobil_listrik' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-1 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45] hover:bg-[#F4EFE7]'}"
						>
							<div class="w-8 h-8 rounded bg-white text-[#596A53] flex items-center justify-center shrink-0 border border-[#DFE5DC]">
								<Icon name="zap" size={16} />
							</div>
							<div>
								<div class="font-bold text-xs">Mobil Listrik (EV)</div>
								<div class="text-[10px] text-[#596A53]">Garasi E (Rp 75.000/hr)</div>
							</div>
						</button>
					</div>
				</div>

				<!-- Rental Type Toggle & Duration Slider -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<span class="block text-xs font-bold text-[#4F4532] mb-1.5">Tipe Durasi Sewa</span>
						<div class="grid grid-cols-2 gap-2 bg-[#FAF8F4] p-1 rounded-lg border border-[#DFD5C2]">
							<button
								type="button"
								onclick={() => {
									simRentalType = 'harian';
									if (simDuration > 30) simDuration = 7;
								}}
								class="py-1.5 rounded-md text-xs font-bold transition-all {simRentalType === 'harian' ? 'bg-[#71856A] text-white shadow-xs' : 'text-[#6B5E45] hover:text-[#383123]'}"
							>
								Harian (1-30 Hari)
							</button>
							<button
								type="button"
								onclick={() => {
									simRentalType = 'bulanan';
									if (simDuration > 12) simDuration = 1;
								}}
								class="py-1.5 rounded-md text-xs font-bold transition-all {simRentalType === 'bulanan' ? 'bg-[#71856A] text-white shadow-xs' : 'text-[#6B5E45] hover:text-[#383123]'}"
							>
								Bulanan (Hemat 25x)
							</button>
						</div>
					</div>

					<div>
						<div class="flex justify-between items-center mb-1.5">
							<span class="text-xs font-bold text-[#4F4532]">
								Durasi: <span class="font-mono text-[#71856A]">{simDuration} {simRentalType === 'harian' ? 'Hari' : 'Bulan'}</span>
							</span>
							<span class="text-[11px] text-[#A08F6E]">
								{simRentalType === 'harian' ? 'Maksimal 30 hari' : 'Pilihan 1-12 bulan'}
							</span>
						</div>
						<input
							type="range"
							min="1"
							max={simRentalType === 'harian' ? 30 : 12}
							bind:value={simDuration}
							aria-label="Durasi simulasi sewa"
							class="w-full accent-[#71856A] cursor-pointer"
						/>
					</div>
				</div>

				<!-- EV Battery Capacity (Conditional) -->
				{#if simVehicleType === 'mobil_listrik'}
					<div class="p-4 bg-[#EFF3ED] rounded-lg border border-[#C2CCBC] space-y-2">
						<div class="flex items-center justify-between">
							<label class="text-xs font-bold text-[#2E382A] flex items-center gap-1.5">
								<Icon name="zap" size={13} class="text-[#71856A]" />
								<span>Kapasitas Baterai Kendaraan Listrik: <span class="font-mono text-[#596A53]">{simBatteryKwh} kWh</span> (Wajib Diisi Penuh)</span>
							</label>
							<span class="text-[11px] font-mono font-bold text-[#596A53] bg-white px-2 py-0.5 rounded border border-[#DFE5DC]">
								Tarif Cas: Rp 2.500 / kWh
							</span>
						</div>
						<input
							type="range"
							min="10"
							max="120"
							step="5"
							bind:value={simBatteryKwh}
							class="w-full accent-[#71856A] cursor-pointer"
						/>
						<p class="text-[11px] text-[#596A53]">
							Peraturan Sistem: Mobil listrik di garasi mobil listrik wajib mengisi baterai sampai 100% penuh (Kapasitas kWh x Rp 2.500).
						</p>
					</div>
				{/if}
			</div>

			<!-- Live Calculation Result Card -->
			<div class="bg-[#FAF8F4] p-5 rounded-xl border border-[#DFD5C2] flex flex-col justify-between shadow-xs">
				<div class="space-y-3">
					<div class="text-xs font-bold text-[#4F4532] uppercase tracking-wide border-b border-[#EAE3D4] pb-2">
						Rincian Estimasi Biaya
					</div>

					<div class="space-y-2 text-xs">
						<div class="flex justify-between text-[#6B5E45]">
							<span>Tarif Dasar Garasi:</span>
							<span class="font-mono font-semibold text-[#383123]">
								{formatRupiah(simRentalType === 'harian' ? simResult.dailyRate : simResult.monthlyRate)}
							</span>
						</div>
						<div class="flex justify-between text-[#6B5E45]">
							<span>Durasi Sewa:</span>
							<span class="font-mono font-semibold text-[#383123]">
								{simDuration} {simRentalType === 'harian' ? 'hari' : 'bulan'}
							</span>
						</div>
						<div class="flex justify-between text-[#6B5E45]">
							<span>Subtotal Sewa Garasi:</span>
							<span class="font-mono font-semibold text-[#383123]">
								{formatRupiah(simResult.baseCost)}
							</span>
						</div>

						{#if simVehicleType === 'mobil_listrik'}
							<div class="flex justify-between text-[#596A53] pt-1 border-t border-[#EAE3D4]">
								<span>Cas Baterai Full ({simBatteryKwh} kWh):</span>
								<span class="font-mono font-semibold">
									{formatRupiah(simResult.electricityCost)}
								</span>
							</div>
						{/if}
					</div>
				</div>

				<div class="pt-4 border-t border-[#DFD5C2] mt-4">
					<div class="text-[11px] font-bold text-[#6B5E45] uppercase tracking-wide">Total Estimasi Tagihan</div>
					<div class="text-2xl font-extrabold font-mono text-[#596A53] mt-1">
						{formatRupiah(simResult.totalCost)}
					</div>
					<a
						href="/penyewa/sewa-baru"
						class="mt-3 w-full py-2 bg-[#71856A] hover:bg-[#596A53] text-white text-xs font-bold rounded-lg text-center block transition-all shadow-xs btn-interactive"
					>
						Sewa Slot Garasi Sekarang
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Prosedur Operasional Standar Sesuai Soal Uji Praktik -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs">
		<h3 class="text-xs font-bold text-[#4F4532] uppercase tracking-wider mb-4 flex items-center gap-2">
			<Icon name="file-text" size={15} class="text-[#71856A]" />
			<span>Alur Operasional Penyewaan Garasi Sesuai Spesifikasi Soal</span>
		</h3>

		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
			<div class="p-4 bg-[#FAF8F4] rounded-lg border border-[#DFD5C2]/80 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-[#71856A] text-white flex items-center justify-center font-bold text-xs mb-2">
					1
				</div>
				<div class="font-bold text-[#383123]">Pendaftaran Penyewa Baru</div>
				<p class="text-[#6B5E45] leading-relaxed text-[11px]">
					Calon penyewa mendaftar dengan NIK (16 digit), Nama Lengkap, Nomor Telepon, Email (sebagai username), dan Password.
				</p>
			</div>

			<div class="p-4 bg-[#FAF8F4] rounded-lg border border-[#DFD5C2]/80 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-[#71856A] text-white flex items-center justify-center font-bold text-xs mb-2">
					2
				</div>
				<div class="font-bold text-[#383123]">Verifikasi KTP Admin</div>
				<p class="text-[#6B5E45] leading-relaxed text-[11px]">
					Setelah memeriksa validitas KTP, Administrator menyetujui (ACC) atau menolak akun pendaftar penyewa baru.
				</p>
			</div>

			<div class="p-4 bg-[#FAF8F4] rounded-lg border border-[#DFD5C2]/80 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-[#71856A] text-white flex items-center justify-center font-bold text-xs mb-2">
					3
				</div>
				<div class="font-bold text-[#383123]">Penyewaan Garasi & Detail Kendaraan</div>
				<p class="text-[#6B5E45] leading-relaxed text-[11px]">
					Penyewa memasukkan merek/tipe kendaraan, nomor plat (kecuali sepeda), kapasitas kWh listrik, durasi sewa, dan memilih slot garasi kosong.
				</p>
			</div>

			<div class="p-4 bg-[#FAF8F4] rounded-lg border border-[#DFD5C2]/80 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-[#71856A] text-white flex items-center justify-center font-bold text-xs mb-2">
					4
				</div>
				<div class="font-bold text-[#383123]">Pelunasan & Perpanjangan</div>
				<p class="text-[#6B5E45] leading-relaxed text-[11px]">
					Upload bukti bayar untuk pelunasan sewa. Status garasi otomatis menjadi <em>used</em>. Kontrak dapat diperpanjang jika belum ada booking bentrok.
				</p>
			</div>
		</div>
	</div>
</div>