<!-- src/routes/penyewa/sewa-baru/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Kategori filter kendaraan
	let vehicleCategory = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let rentalType = $state<'harian' | 'bulanan'>('harian');
	let duration = $state<number>(3);
	let selectedGarageId = $state<number | null>(null);

	// Filter unit garasi sesuai kategori kendaraan yang dipilih
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

	// Auto-select unit pertama yang berstatus 'available' saat kategori berubah
	$effect(() => {
		const availableUnits = filteredGarages.filter((g: any) => g.status === 'available');
		if (availableUnits.length > 0) {
			const currentSelected = availableUnits.find((g: any) => g.id === selectedGarageId);
			if (!currentSelected) {
				selectedGarageId = availableUnits[0].id;
			}
		} else {
			selectedGarageId = null;
		}
	});

	let selectedGarage = $derived(
		data.garages.find((g: any) => g.id === selectedGarageId) ?? null
	);

	// Hitung Tanggal Selesai otomatis
	let calculatedEndDate = $derived.by(() => {
		if (!data.today) return '';
		const start = new Date(data.today);
		const end = new Date(start);
		const dur = Math.max(1, duration || 1);

		if (rentalType === 'harian') {
			end.setDate(end.getDate() + dur);
		} else {
			end.setMonth(end.getMonth() + dur);
		}
		return end.toISOString().split('T')[0];
	});

	// Hitung Biaya Real-time sesuai tarif unit yang dipilih
	let costCalculation = $derived.by(() => {
		if (!selectedGarage) {
			return { baseCost: 0, electricityCost: 0, totalCost: 0 };
		}

		const dur = Math.max(1, duration || 1);
		const dailyPrice = selectedGarage.daily_price;
		const monthlyPrice = 25 * dailyPrice;

		const baseCost = rentalType === 'harian' ? dur * dailyPrice : dur * monthlyPrice;

		let electricityCost = 0;
		if (selectedGarage.type === 'mobil_listrik') {
			const kwh = Math.max(0, selectedGarage.battery_capacity_kwh || 58);
			electricityCost = kwh * (selectedGarage.electricity_price_kwh || 2500);
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
	<title>Sewa Kendaraan & Garasi - SIM-GARASI</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-2 space-y-6">
	<!-- Page Header with Earthy Palette -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs card-hover flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="file-text" size={14} />
				<span>Modul Pemesanan Sewa Kendaraan</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Formulir Sewa Mobil & Motor</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Pilih kategori kendaraan, tentukan durasi, dan pilih unit mobil/motor yang siap dirental dari garasi kami.
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
			<!-- Bagian 1: Pilih Kategori Kendaraan -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs space-y-4 card-hover">
				<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="car" size={15} class="text-[#71856A]" />
						<span>1. Pilih Kategori Kendaraan</span>
					</h2>
					<span class="text-[11px] text-[#A08F6E]">Data Unit Otomatis Terhubung dari Admin</span>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<button
						type="button"
						onclick={() => (vehicleCategory = 'sepeda')}
						class="p-4 rounded-xl border text-left transition-all btn-interactive flex items-center gap-3 {vehicleCategory === 'sepeda' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45] hover:bg-[#F4EFE7]'}"
					>
						<div class="w-10 h-10 rounded-lg bg-white text-[#71856A] flex items-center justify-center border border-[#DFE5DC] shrink-0">
							<Icon name="bike" size={20} />
						</div>
						<div>
							<div class="font-bold text-xs sm:text-sm">Sepeda & Sepeda Motor</div>
							<div class="text-[11px] text-[#71856A] font-semibold mt-0.5">Mulai Rp 125.000 / hari</div>
						</div>
					</button>

					<button
						type="button"
						onclick={() => (vehicleCategory = 'mobil')}
						class="p-4 rounded-xl border text-left transition-all btn-interactive flex items-center gap-3 {vehicleCategory === 'mobil' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45] hover:bg-[#F4EFE7]'}"
					>
						<div class="w-10 h-10 rounded-lg bg-white text-[#877758] flex items-center justify-center border border-[#DFE5DC] shrink-0">
							<Icon name="car" size={20} />
						</div>
						<div>
							<div class="font-bold text-xs sm:text-sm">Mobil (Bensin / Diesel)</div>
							<div class="text-[11px] text-[#877758] font-semibold mt-0.5">Rp 500.000 - Rp 1.000.000 / hari</div>
						</div>
					</button>

					<button
						type="button"
						onclick={() => (vehicleCategory = 'mobil_listrik')}
						class="p-4 rounded-xl border text-left transition-all btn-interactive flex items-center gap-3 {vehicleCategory === 'mobil_listrik' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45] hover:bg-[#F4EFE7]'}"
					>
						<div class="w-10 h-10 rounded-lg bg-white text-[#596A53] flex items-center justify-center border border-[#DFE5DC] shrink-0">
							<Icon name="zap" size={20} />
						</div>
						<div>
							<div class="font-bold text-xs sm:text-sm">Mobil Listrik (EV)</div>
							<div class="text-[11px] text-[#596A53] font-semibold mt-0.5">Rp 750.000 - Rp 1.000.000 / hari</div>
						</div>
					</button>
				</div>
			</div>

			<!-- Bagian 2: Tipe Sewa & Durasi -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs space-y-4 card-hover">
				<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="calendar" size={15} class="text-[#71856A]" />
						<span>2. Periode dan Durasi Sewa</span>
					</h2>
					<span class="text-[11px] text-[#A08F6E]">Kalkulasi Tanggal Otomatis</span>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
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
										onclick={() => (duration = 3)}
										class="px-2 py-1 text-[11px] bg-[#FAF8F4] hover:bg-[#EFE8D6] rounded border border-[#DFD5C2] font-mono"
									>3h</button>
									<button
										type="button"
										onclick={() => (duration = 7)}
										class="px-2 py-1 text-[11px] bg-[#FAF8F4] hover:bg-[#EFE8D6] rounded border border-[#DFD5C2] font-mono"
									>7h</button>
									<button
										type="button"
										onclick={() => (duration = 30)}
										class="px-2 py-1 text-[11px] bg-[#FAF8F4] hover:bg-[#EFE8D6] rounded border border-[#DFD5C2] font-mono"
									>30h</button>
								{:else}
									<button
										type="button"
										onclick={() => (duration = 1)}
										class="px-2 py-1 text-[11px] bg-[#FAF8F4] hover:bg-[#EFE8D6] rounded border border-[#DFD5C2] font-mono"
									>1bln</button>
									<button
										type="button"
										onclick={() => (duration = 3)}
										class="px-2 py-1 text-[11px] bg-[#FAF8F4] hover:bg-[#EFE8D6] rounded border border-[#DFD5C2] font-mono"
									>3bln</button>
								{/if}
							</div>
						</div>
					</div>

					<div class="bg-[#FAF8F4] border border-[#DFD5C2] p-3 rounded-xl flex flex-col justify-center text-xs space-y-1.5">
						<div class="flex justify-between">
							<span class="text-[#877758]">Tanggal Mulai:</span>
							<span class="font-mono font-bold text-[#383123]">{data.today}</span>
						</div>
						<div class="flex justify-between border-t border-[#EAE3D4] pt-1">
							<span class="text-[#877758]">Tanggal Selesai:</span>
							<span class="font-mono font-extrabold text-[#71856A]">{calculatedEndDate}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Bagian 3: PILIH UNIT KENDARAAN DI GARASI (OTOMATIS DARI ADMIN) -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs space-y-4 card-hover">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F4EFE7] pb-3 gap-2">
					<div>
						<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
							<Icon name="building" size={15} class="text-[#71856A]" />
							<span>3. Pilih Unit Kendaraan & Garasi</span>
						</h2>
						<p class="text-[11px] text-[#6B5E45] mt-0.5">
							Merek kendaraan dan nomor plat polisi sudah terdaftar otomatis oleh admin. Unit yang sedang dirental tidak dapat dipilih.
						</p>
					</div>
					<span class="text-xs font-mono font-bold text-[#71856A] bg-[#EFF3ED] px-2.5 py-0.5 rounded-full border border-[#DFE5DC] self-start sm:self-auto">
						{filteredGarages.filter((g: any) => g.status === 'available').length} Unit Tersedia
					</span>
				</div>

				{#if filteredGarages.length === 0}
					<div class="p-8 bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl text-center text-[#877758] text-xs">
						Tidak ada unit kendaraan pada kategori ini.
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each filteredGarages as garage (garage.id)}
							{@const isRented = garage.status === 'used' || (garage.active_end_date && garage.active_end_date >= data.today)}
							<label
								class="border rounded-xl p-4.5 transition-all flex flex-col justify-between {isRented ? 'bg-[#FDFBF7] border-[#EAE3D4] opacity-75 cursor-not-allowed' : selectedGarageId === garage.id ? 'border-[#71856A] bg-[#EFF3ED] ring-2 ring-[#71856A] shadow-sm cursor-pointer' : 'border-[#DFD5C2] hover:border-[#BEB092] bg-[#FAF8F4] cursor-pointer'}"
							>
								<div>
									<!-- Top Row: Radio + Code + Status Badge -->
									<div class="flex items-start justify-between gap-2">
										<div class="flex items-center gap-2.5">
											<input
												type="radio"
												name="garageId"
												value={garage.id}
												bind:group={selectedGarageId}
												disabled={isRented}
												class="text-[#71856A] focus:ring-[#71856A] accent-[#71856A] disabled:opacity-50"
											/>
											<div>
												<span class="font-mono font-extrabold text-base text-[#383123]">{garage.code}</span>
												<span class="text-[11px] font-mono text-[#877758] bg-white px-2 py-0.5 rounded border border-[#DFE5DC] ml-1.5 font-bold">
													{garage.license_plate || 'Bebas Plat'}
												</span>
											</div>
										</div>

										<!-- Status Badge: Available vs Rented with Dates -->
										{#if isRented}
											<div class="text-right">
												<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 block">
													⛔ Sudah Dirental
												</span>
												<span class="text-[10px] text-rose-600 font-mono mt-0.5 block">
													{garage.active_start_date} s/d {garage.active_end_date}
												</span>
											</div>
										{:else}
											<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]">
												✓ Siap Dirental
											</span>
										{/if}
									</div>

									<!-- Middle: Vehicle Brand & Model + Type -->
									<div class="mt-3 bg-white p-3 rounded-lg border border-[#F4EFE7]">
										<div class="font-bold text-sm text-[#383123]">
											{garage.vehicle_name || `${garage.car_type || 'Kendaraan'} ${garage.code}`}
										</div>
										<div class="text-xs text-[#6B5E45] mt-0.5 flex items-center justify-between">
											<span>Tipe: <strong class="text-[#383123]">{garage.car_type || 'Standar'}</strong></span>
											<span class="capitalize text-[11px] text-[#A08F6E]">{garage.type.replace('_', ' ')}</span>
										</div>
										{#if garage.type === 'mobil_listrik'}
											<div class="text-[11px] text-[#596A53] font-semibold mt-1 flex items-center gap-1">
												<Icon name="zap" size={12} />
												<span>Kapasitas Baterai: {garage.battery_capacity_kwh || 58} kWh (Full Charge Ready)</span>
											</div>
										{/if}
									</div>
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
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Bagian 4: Pembayaran & Rincian Total -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs space-y-5 card-hover">
				<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="upload" size={15} class="text-[#71856A]" />
						<span>4. Pelunasan & Rincian Transaksi</span>
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
							class="w-full text-xs text-[#4F4532] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#EFF3ED] file:text-[#2E382A] hover:file:bg-[#DFE5DC] border border-[#DFD5C2] rounded-xl p-1.5 bg-[#FAF8F4]"
						/>
						<p class="text-[11px] text-[#A08F6E] mt-1.5">
							Format file: JPG, PNG, WebP (Struk transfer bank / QRIS)
						</p>
					</div>

					<!-- Rincian Biaya Bersih -->
					<div class="bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl p-5 space-y-2.5 text-xs shadow-xs">
						<div class="text-[#4F4532] font-bold border-b border-[#EAE3D4] pb-2 flex items-center justify-between">
							<span>Unit Pilihan Anda</span>
							<span class="text-[10px] text-[#71856A] uppercase font-mono font-bold">
								{selectedGarage ? selectedGarage.code : 'Belum dipilih'}
							</span>
						</div>
						{#if selectedGarage}
							<div class="text-xs text-[#383123] font-bold">
								{selectedGarage.vehicle_name} <span class="text-[#877758] font-normal font-mono">({selectedGarage.license_plate || 'Bebas Plat'})</span>
							</div>
						{/if}
						<div class="flex justify-between text-[#6B5E45]">
							<span>Biaya Sewa ({duration} {rentalType === 'harian' ? 'hari' : 'bulan'}):</span>
							<span class="font-mono font-bold text-[#383123]">{formatRupiah(costCalculation.baseCost)}</span>
						</div>
						{#if costCalculation.electricityCost > 0}
							<div class="flex justify-between text-[#596A53] pt-1 border-t border-[#EAE3D4]">
								<span>Charge EV 100% ({selectedGarage?.battery_capacity_kwh || 58} kWh):</span>
								<span class="font-mono font-bold">+ {formatRupiah(costCalculation.electricityCost)}</span>
							</div>
						{/if}
						<div class="flex justify-between text-base font-extrabold border-t-2 border-[#DFD5C2] pt-3 text-[#383123]">
							<span>Total Tagihan Pelunasan:</span>
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
						<span>Konfirmasi & Ajukan Sewa Mobil / Motor</span>
					</button>
				</div>
			</div>
		</form>
	{/if}
</div>
