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
	let simBatteryKwh = $state<number>(60);

	// Interactive calculation based on real market rates
	let simResult = $derived.by(() => {
		let dailyRate = 650000;
		let evRatePerKwh = 0;

		if (simVehicleType === 'sepeda') {
			dailyRate = 125000;
		} else if (simVehicleType === 'mobil') {
			dailyRate = 650000;
		} else if (simVehicleType === 'mobil_listrik') {
			dailyRate = 750000;
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
</script>

<svelte:head>
	<title>Portal Persewaan Garasi - SIM-GARASI</title>
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
					Sistem Informasi Persewaan Garasi Kendaraan & Ekosistem EV
				</h1>
				<p class="text-xs sm:text-sm text-[#6B5E45] leading-relaxed">
					Platform operasional terstandarisasi untuk pengelolaan unit garasi sewa roda dua, kendaraan roda empat konvensional, serta integrasi garasi pintar kendaraan listrik (EV) dengan pengisian daya baterai terverifikasi.
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-3 shrink-0">
				<a
					href="/penyewa/sewa-baru"
					class="px-5 py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white font-semibold rounded-lg text-xs transition-all shadow-sm flex items-center gap-2 btn-interactive"
				>
					<Icon name="plus" size={14} />
					<span>Sewa Garasi Baru</span>
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
					<span class="text-[11px] font-bold text-[#6B5E45] uppercase tracking-wider">Total Kapasitas</span>
					<div class="w-7 h-7 rounded-md bg-[#FAF8F4] border border-[#DFD5C2] text-[#4F4532] flex items-center justify-center">
						<Icon name="building" size={15} />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-extrabold font-mono text-[#383123] mt-2">{data.totalCount} Unit</div>
			</div>
			<div class="text-[11px] text-[#A08F6E] mt-3 pt-2 border-t border-[#F4EFE7]">
				Seluruh unit garasi terdaftar
			</div>
		</div>

		<div class="bg-white p-5 rounded-xl border border-[#C2CCBC] shadow-xs card-hover flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between">
					<span class="text-[11px] font-bold text-[#596A53] uppercase tracking-wider">Unit Tersedia</span>
					<div class="w-7 h-7 rounded-md bg-[#EFF3ED] border border-[#DFE5DC] text-[#71856A] flex items-center justify-center">
						<Icon name="check" size={15} />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-extrabold font-mono text-[#596A53] mt-2">{data.availableCount} Unit</div>
			</div>
			<div class="text-[11px] text-[#71856A] mt-3 pt-2 border-t border-[#EFF3ED]">
				Siap disewa langsung saat ini
			</div>
		</div>

		<div class="bg-white p-5 rounded-xl border border-[#E6D9B8] shadow-xs card-hover flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between">
					<span class="text-[11px] font-bold text-[#8A7545] uppercase tracking-wider">Unit Terisi (Used)</span>
					<div class="w-7 h-7 rounded-md bg-[#FDFBF7] border border-[#DAC99B] text-[#B0975C] flex items-center justify-center">
						<Icon name="clock" size={15} />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-extrabold font-mono text-[#8A7545] mt-2">{data.totalCount - data.availableCount} Unit</div>
			</div>
			<div class="text-[11px] text-[#B0975C] mt-3 pt-2 border-t border-[#F8F4E8]">
				Sedang dalam kontrak aktif
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

	<!-- Interactive Live Cost Estimator (Simulasi Biaya Real-time) -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs card-hover">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F4EFE7] gap-2">
			<div>
				<span class="text-[11px] font-bold uppercase tracking-wider text-[#71856A] flex items-center gap-1.5">
					<Icon name="zap" size={14} />
					<span>Kalkulator Simulasi Tarif Persewaan Realistis</span>
				</span>
				<h2 class="text-lg font-bold text-[#383123] mt-0.5">Estimasi Biaya Sewa Garasi Indonesia</h2>
			</div>
			<span class="text-xs text-[#877758] font-mono bg-[#FAF8F4] px-3 py-1 rounded-full border border-[#EAE3D4]">
				Formula Teruji: Harian (≤30 hari) & Bulanan (25x)
			</span>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
			<!-- Interactive Form Controls -->
			<div class="lg:col-span-2 space-y-4">
				<!-- Vehicle Selector Pills -->
				<div>
					<span class="block text-xs font-bold text-[#4F4532] mb-1.5">Pilih Kategori Kendaraan</span>
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
								<div class="text-[10px] text-[#71856A]">Garasi S (Rp 125k/hr)</div>
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
								<div class="font-bold text-xs">Mobil (City/MPV/SUV)</div>
								<div class="text-[10px] text-[#877758]">Garasi C (500rb - 1jt)</div>
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
								<div class="text-[10px] text-[#596A53]">Garasi E (750rb - 1jt)</div>
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
								<span>Kapasitas Baterai EV: <span class="font-mono text-[#596A53]">{simBatteryKwh} kWh</span> (Wajib 100% Full)</span>
							</label>
							<span class="text-[11px] font-mono font-bold text-[#596A53] bg-white px-2 py-0.5 rounded border border-[#DFE5DC]">
								Tarif: Rp 2.500 / kWh
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
							Contoh: Wuling AirEV (18-27 kWh), Hyundai Ioniq 5 (58-72 kWh), BYD Seal (61-82 kWh).
						</p>
					</div>
				{/if}
			</div>

			<!-- Live Calculation Result Card -->
			<div class="bg-[#FAF8F4] p-5 rounded-xl border border-[#DFD5C2] flex flex-col justify-between shadow-xs">
				<div class="space-y-3">
					<div class="text-xs font-bold text-[#4F4532] uppercase tracking-wide border-b border-[#EAE3D4] pb-2">
						Rincian Perhitungan
					</div>

					<div class="space-y-2 text-xs">
						<div class="flex justify-between text-[#6B5E45]">
							<span>Tarif Dasar:</span>
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
								<span>Biaya Charge ({simBatteryKwh} kWh):</span>
								<span class="font-mono font-semibold">
									{formatRupiah(simResult.electricityCost)}
								</span>
							</div>
						{/if}
					</div>
				</div>

				<div class="pt-4 border-t border-[#DFD5C2] mt-4">
					<div class="text-[11px] font-bold text-[#6B5E45] uppercase tracking-wide">Total Estimasi Biaya</div>
					<div class="text-2xl font-extrabold font-mono text-[#596A53] mt-1">
						{formatRupiah(simResult.totalCost)}
					</div>
					<a
						href="/penyewa/sewa-baru"
						class="mt-3 w-full py-2 bg-[#71856A] hover:bg-[#596A53] text-white text-xs font-bold rounded-lg text-center block transition-all shadow-xs btn-interactive"
					>
						Lanjutkan ke Form Sewa
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Klasifikasi & Spesifikasi Tipe Garasi Indonesia -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h2 class="text-xs font-bold text-[#4F4532] uppercase tracking-wider flex items-center gap-2">
				<Icon name="building" size={15} class="text-[#71856A]" />
				<span>Spesifikasi Unit Garasi & Standar Operasional</span>
			</h2>
			<span class="text-xs text-[#877758] font-mono">Kode Standar: S, C, E</span>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
			<!-- Tipe Sepeda -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-5 shadow-xs flex flex-col justify-between card-hover">
				<div>
					<div class="flex items-center justify-between pb-3 border-b border-[#F4EFE7]">
						<div class="flex items-center gap-2.5">
							<div class="w-9 h-9 rounded-lg bg-[#EFF3ED] text-[#71856A] flex items-center justify-center border border-[#DFE5DC]">
								<Icon name="bike" size={18} />
							</div>
							<div>
								<span class="font-bold text-sm text-[#383123] block leading-tight">Garasi Sepeda</span>
								<span class="text-[10px] text-[#A08F6E]">Sepeda & Sepeda Motor</span>
							</div>
						</div>
						<span class="font-mono text-xs font-bold text-[#596A53] bg-[#EFF3ED] px-2.5 py-1 rounded-md border border-[#DFE5DC]">
							Prefix: S
						</span>
					</div>

					<p class="text-xs text-[#6B5E45] mt-3 leading-relaxed">
						Peruntukan penyimpanan terstandarisasi untuk sepeda konvensional, road bike, maupun sepeda motor dengan akses gembok individual dan kanopi terlindung cuaca.
					</p>

					<div class="mt-4 space-y-2 text-xs">
						<div class="flex justify-between py-1 border-b border-[#F8F5EC]">
							<span class="text-[#877758]">Tarif Harian:</span>
							<span class="font-mono font-bold text-[#383123]">Rp 125.000 / hari</span>
						</div>
						<div class="flex justify-between py-1 border-b border-[#F8F5EC]">
							<span class="text-[#877758]">Tarif Bulanan:</span>
							<span class="font-mono font-bold text-[#71856A]">Rp 3.125.000 / bulan</span>
						</div>
						<div class="flex justify-between py-1">
							<span class="text-[#877758]">Ketentuan Plat:</span>
							<span class="text-[#4F4532]">Opsional (sepeda gowes) / Wajib plat (motor)</span>
						</div>
					</div>
				</div>

				<div class="mt-5 pt-3 border-t border-[#F4EFE7] flex items-center justify-between text-[11px] text-[#A08F6E]">
					<span class="font-mono">Unit: S001, S002, S003</span>
					<span class="text-[#71856A] font-semibold">Tersedia</span>
				</div>
			</div>

			<!-- Tipe Mobil Konvensional -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-5 shadow-xs flex flex-col justify-between card-hover">
				<div>
					<div class="flex items-center justify-between pb-3 border-b border-[#F4EFE7]">
						<div class="flex items-center gap-2.5">
							<div class="w-9 h-9 rounded-lg bg-[#FAF8F4] text-[#877758] flex items-center justify-center border border-[#DFD5C2]">
								<Icon name="car" size={18} />
							</div>
							<div>
								<span class="font-bold text-sm text-[#383123] block leading-tight">Garasi Mobil</span>
								<span class="text-[10px] text-[#A08F6E]">City Car, MPV, SUV, Sedan</span>
							</div>
						</div>
						<span class="font-mono text-xs font-bold text-[#877758] bg-[#FAF8F4] px-2.5 py-1 rounded-md border border-[#DFD5C2]">
							Prefix: C
						</span>
					</div>

					<p class="text-xs text-[#6B5E45] mt-3 leading-relaxed">
						Peruntukan kendaraan roda empat standar (City Car, MPV, SUV, Sedan) berbahan bakar bensin/diesel atau EV tanpa charging.
					</p>

					<div class="mt-4 space-y-2 text-xs">
						<div class="flex justify-between py-1 border-b border-[#F8F5EC]">
							<span class="text-[#877758]">Tarif Harian:</span>
							<span class="font-mono font-bold text-[#383123]">Rp 500.000 - Rp 1.000.000</span>
						</div>
						<div class="flex justify-between py-1 border-b border-[#F8F5EC]">
							<span class="text-[#877758]">Tarif Bulanan:</span>
							<span class="font-mono font-bold text-[#71856A]">Mulai Rp 12.500.000 / bulan</span>
						</div>
						<div class="flex justify-between py-1">
							<span class="text-[#877758]">Ketentuan Plat:</span>
							<span class="text-[#4F4532]">Wajib Plat Nomor Resmi</span>
						</div>
					</div>
				</div>

				<div class="mt-5 pt-3 border-t border-[#F4EFE7] flex items-center justify-between text-[11px] text-[#A08F6E]">
					<span class="font-mono">Unit: C001, C002, C010</span>
					<span class="text-[#71856A] font-semibold">Tersedia</span>
				</div>
			</div>

			<!-- Tipe Mobil Listrik EV -->
			<div class="bg-white rounded-xl border border-[#C2CCBC] p-5 shadow-xs flex flex-col justify-between card-hover">
				<div>
					<div class="flex items-center justify-between pb-3 border-b border-[#EFF3ED]">
						<div class="flex items-center gap-2.5">
							<div class="w-9 h-9 rounded-lg bg-[#EFF3ED] text-[#596A53] flex items-center justify-center border border-[#DFE5DC]">
								<Icon name="zap" size={18} />
							</div>
							<div>
								<span class="font-bold text-sm text-[#383123] block leading-tight">Garasi Mobil Listrik</span>
								<span class="text-[10px] text-[#596A53]">Dedicated EV Wallbox Station</span>
							</div>
						</div>
						<span class="font-mono text-xs font-bold text-[#596A53] bg-[#EFF3ED] px-2.5 py-1 rounded-md border border-[#DFE5DC]">
							Prefix: E
						</span>
					</div>

					<p class="text-xs text-[#6B5E45] mt-3 leading-relaxed">
						Dilengkapi AC Wallbox Charger Type 2. Penyewa kendaraan listrik wajib membayar pengisian daya baterai penuh (100% capacity) sesuai kapasitas kWh terdaftar.
					</p>

					<div class="mt-4 space-y-2 text-xs">
						<div class="flex justify-between py-1 border-b border-[#F8F5EC]">
							<span class="text-[#877758]">Tarif Garasi:</span>
							<span class="font-mono font-bold text-[#383123]">Rp 75.000 / hari</span>
						</div>
						<div class="flex justify-between py-1 border-b border-[#F8F5EC]">
							<span class="text-[#877758]">Tarif Listrik:</span>
							<span class="font-mono font-bold text-[#596A53]">Rp 2.500 / kWh</span>
						</div>
						<div class="flex justify-between py-1">
							<span class="text-[#877758]">Kewajiban Charge:</span>
							<span class="text-[#596A53] font-semibold">100% Full Capacity</span>
						</div>
					</div>
				</div>

				<div class="mt-5 pt-3 border-t border-[#EFF3ED] flex items-center justify-between text-[11px] text-[#596A53]">
					<span class="font-mono">Unit: E001, E002, E003</span>
					<span class="font-semibold">Fast Charging Ready</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Prosedur Operasional Standar (SOP) -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs">
		<h3 class="text-xs font-bold text-[#4F4532] uppercase tracking-wider mb-4 flex items-center gap-2">
			<Icon name="file-text" size={15} class="text-[#71856A]" />
			<span>Alur Operasional & Standar Pengujian Sistem</span>
		</h3>

		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
			<div class="p-4 bg-[#FAF8F4] rounded-lg border border-[#DFD5C2]/80 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-[#71856A] text-white flex items-center justify-center font-bold text-xs mb-2">
					1
				</div>
				<div class="font-bold text-[#383123]">Registrasi NIK 16 Digit</div>
				<p class="text-[#6B5E45] leading-relaxed text-[11px]">
					Calon penyewa mendaftar dengan NIK KTP resmi 16 angka, email, nomor HP aktif, dan password. Status awal akun adalah <em>pending</em>.
				</p>
			</div>

			<div class="p-4 bg-[#FAF8F4] rounded-lg border border-[#DFD5C2]/80 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-[#71856A] text-white flex items-center justify-center font-bold text-xs mb-2">
					2
				</div>
				<div class="font-bold text-[#383123]">Verifikasi Admin</div>
				<p class="text-[#6B5E45] leading-relaxed text-[11px]">
					Administrator memeriksa dan memvalidasi identitas calon penyewa sebelum memberikan hak akses (approve) untuk menyewa unit garasi.
				</p>
			</div>

			<div class="p-4 bg-[#FAF8F4] rounded-lg border border-[#DFD5C2]/80 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-[#71856A] text-white flex items-center justify-center font-bold text-xs mb-2">
					3
				</div>
				<div class="font-bold text-[#383123]">Transaksi & Kompatibilitas</div>
				<p class="text-[#6B5E45] leading-relaxed text-[11px]">
					Sistem memfilter garasi sesuai tipe kendaraan: Sepeda (S), Mobil Bensin (C), Mobil Listrik (C/E). Kalkulasi biaya sewa & tagihan kWh instan.
				</p>
			</div>

			<div class="p-4 bg-[#FAF8F4] rounded-lg border border-[#DFD5C2]/80 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-[#71856A] text-white flex items-center justify-center font-bold text-xs mb-2">
					4
				</div>
				<div class="font-bold text-[#383123]">Perpanjangan & Audit</div>
				<p class="text-[#6B5E45] leading-relaxed text-[11px]">
					Admin memperpanjang tanggal selesai sewa aktif dengan menghitung selisih hari & biaya tambahan secara otomatis serta pencatatan audit.
				</p>
			</div>
		</div>
	</div>
</div>