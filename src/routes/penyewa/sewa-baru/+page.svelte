<!-- src/routes/penyewa/sewa-baru/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Form State
	let vehicleType = $state<'sepeda' | 'sepeda_motor' | 'mobil' | 'mobil_listrik'>('mobil');
	let vehicleBrandModel = $state('Toyota Avanza');
	let licensePlate = $state('B 1234 ABC');
	let batteryCapacity = $state<number>(60);
	let rentalType = $state<'harian' | 'bulanan'>('harian');
	let duration = $state<number>(3);
	let selectedGarageId = $state<number | null>(null);

	// Logika filter garasi yang kompatibel dengan kendaraan
	let compatibleGarageTypes = $derived.by(() => {
		if (vehicleType === 'sepeda' || vehicleType === 'sepeda_motor') {
			return ['sepeda'];
		}
		if (vehicleType === 'mobil') {
			return ['mobil'];
		}
		if (vehicleType === 'mobil_listrik') {
			return ['mobil', 'mobil_listrik'];
		}
		return [];
	});

	// Garasi yang kompatibel & tersedia
	let filteredGarages = $derived(
		data.availableGarages.filter((g: any) => compatibleGarageTypes.includes(g.type))
	);

	// Auto-select garasi pertama jika garasi yang dipilih sebelumnya tidak ada di daftar filter
	$effect(() => {
		if (filteredGarages.length > 0) {
			const exists = filteredGarages.some((g: any) => g.id === selectedGarageId);
			if (!exists) {
				selectedGarageId = filteredGarages[0].id;
			}
		} else {
			selectedGarageId = null;
		}
	});

	let selectedGarage = $derived(
		data.availableGarages.find((g: any) => g.id === selectedGarageId) ?? null
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

	// Hitung Biaya Real-time
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
			const kwh = Math.max(0, batteryCapacity || 0);
			electricityCost = kwh * (selectedGarage.electricity_price_kwh || 0);
		}

		return {
			baseCost,
			electricityCost,
			totalCost: baseCost + electricityCost
		};
	});
</script>

<svelte:head>
	<title>Formulir Sewa Baru - SIM-GARASI</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-2 space-y-6">
	<!-- Page Header -->
	<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
		<div class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
			<Icon name="file-text" size={14} class="text-blue-600" />
			<span>Modul Transaksi Penyewa</span>
		</div>
		<h1 class="text-lg font-bold text-slate-900 mt-1">Formulir Permohonan Sewa Garasi Baru</h1>
		<p class="text-xs text-slate-500 mt-0.5">
			Silakan isi data kendaraan dan pilih durasi sewa. Sistem akan menyaring garasi yang sesuai secara otomatis.
		</p>
	</div>

	{#if data.notApproved}
		<div class="bg-white border border-amber-200 rounded-lg p-6 text-center space-y-3">
			<div class="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
				<Icon name="clock" size={20} />
			</div>
			<h2 class="text-sm font-bold text-slate-800">Status Akun Belum Terverifikasi</h2>
			<p class="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
				Akun Anda saat ini berstatus <span class="font-mono font-semibold uppercase text-amber-700">{data.userStatus}</span>.
				Admin wajib memverifikasi kesesuaian dokumen KTP terlebih dahulu sebelum transaksi sewa dapat dilakukan.
			</p>
			<div>
				<a
					href="/"
					class="inline-block px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium border border-slate-300"
				>
					Kembali ke Beranda
				</a>
			</div>
		</div>
	{:else}
		{#if form?.error}
			<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-medium flex items-center gap-2">
				<Icon name="alert" size={14} class="text-rose-600 shrink-0" />
				<span>{form.error}</span>
			</div>
		{/if}

		<form method="POST" action="?/submitRental" enctype="multipart/form-data" class="space-y-5">
			<!-- Bagian 1: Data Kendaraan -->
			<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
				<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-2">
					<Icon name="car" size={14} class="text-slate-500" />
					<span>1. Identitas Kendaraan</span>
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="vehicleType" class="block text-xs font-semibold text-slate-700 mb-1">
							Tipe Kendaraan <span class="text-rose-600">*</span>
						</label>
						<select
							id="vehicleType"
							name="vehicleType"
							bind:value={vehicleType}
							class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 bg-white"
						>
							<option value="sepeda">Sepeda (Gowes)</option>
							<option value="sepeda_motor">Sepeda Motor</option>
							<option value="mobil">Mobil Konvensional (Bensin / Diesel)</option>
							<option value="mobil_listrik">Mobil Listrik (EV)</option>
						</select>
						<span class="text-[11px] text-slate-500 mt-1 block">
							{#if vehicleType === 'sepeda' || vehicleType === 'sepeda_motor'}
								Kompatibel hanya dengan Garasi Sepeda (Kode S).
							{:else if vehicleType === 'mobil'}
								Kompatibel hanya dengan Garasi Mobil (Kode C).
							{:else}
								Dapat menempati Garasi Mobil (C) atau Garasi Mobil Listrik (E).
							{/if}
						</span>
					</div>

					<div>
						<label for="vehicleBrandModel" class="block text-xs font-semibold text-slate-700 mb-1">
							Merek dan Tipe Kendaraan <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="vehicleBrandModel"
							name="vehicleBrandModel"
							bind:value={vehicleBrandModel}
							required
							placeholder="Contoh: Toyota Avanza 1.5G / Polygon Cascade / Ioniq 5"
							class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
						/>
					</div>

					<div>
						<label for="licensePlate" class="block text-xs font-semibold text-slate-700 mb-1">
							Nomor Plat Polisi {#if vehicleType === 'sepeda'}<span class="text-slate-400 font-normal">(Opsional)</span>{:else}<span class="text-rose-600">*Wajib</span>{/if}
						</label>
						<input
							type="text"
							id="licensePlate"
							name="licensePlate"
							bind:value={licensePlate}
							disabled={vehicleType === 'sepeda'}
							required={vehicleType !== 'sepeda'}
							placeholder={vehicleType === 'sepeda' ? 'Bebas nomor plat' : 'Contoh: L 1234 AB'}
							class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-400 font-mono uppercase"
						/>
					</div>

					{#if vehicleType === 'mobil_listrik'}
						<div class="bg-blue-50/60 border border-blue-200 p-3 rounded">
							<label for="batteryCapacity" class="block text-xs font-bold text-blue-900 mb-1">
								Kapasitas Baterai Listrik (kWh) <span class="text-rose-600">*</span>
							</label>
							<div class="flex items-center gap-2">
								<input
									type="number"
									id="batteryCapacity"
									name="batteryCapacity"
									bind:value={batteryCapacity}
									min="1"
									max="200"
									step="0.5"
									required
									placeholder="60"
									class="w-full px-3 py-1.5 text-xs border border-blue-300 rounded bg-white font-mono"
								/>
								<span class="text-xs font-bold text-blue-900 shrink-0">kWh</span>
							</div>
							<p class="text-[11px] text-blue-800 mt-1">
								Aturan sistem: Garasi mobil listrik mewajibkan pengisian daya 100% penuh.
							</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Bagian 2: Tipe Sewa & Durasi -->
			<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
				<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-2">
					<Icon name="calendar" size={14} class="text-slate-500" />
					<span>2. Periode dan Durasi Sewa</span>
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="rentalType" class="block text-xs font-semibold text-slate-700 mb-1">
							Kategori Sewa <span class="text-rose-600">*</span>
						</label>
						<select
							id="rentalType"
							name="rentalType"
							bind:value={rentalType}
							class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 bg-white"
						>
							<option value="harian">Sewa Harian (Maks. 30 Hari)</option>
							<option value="bulanan">Sewa Bulanan (Tarif = 25 x Harian)</option>
						</select>
					</div>

					<div>
						<label for="duration" class="block text-xs font-semibold text-slate-700 mb-1">
							{#if rentalType === 'harian'}
								Jumlah Hari Sewa <span class="text-rose-600">*(1 - 30 hari)</span>
							{:else}
								Jumlah Bulan Sewa <span class="text-rose-600">*</span>
							{/if}
						</label>
						<input
							type="number"
							id="duration"
							name="duration"
							bind:value={duration}
							min="1"
							max={rentalType === 'harian' ? 30 : 12}
							required
							class="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-600 font-mono"
						/>
					</div>

					<div class="bg-slate-50 border border-slate-200 p-3 rounded flex flex-col justify-center text-xs space-y-1">
						<div class="flex justify-between">
							<span class="text-slate-500">Tanggal Mulai:</span>
							<span class="font-mono font-semibold text-slate-800">{data.today}</span>
						</div>
						<div class="flex justify-between border-t border-slate-200 pt-1">
							<span class="text-slate-500">Tanggal Selesai:</span>
							<span class="font-mono font-bold text-blue-700">{calculatedEndDate}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Bagian 3: Pilih Garasi yang Tersedia -->
			<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
				<div class="flex items-center justify-between border-b border-slate-100 pb-2">
					<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
						<Icon name="building" size={14} class="text-slate-500" />
						<span>3. Pilih Unit Garasi Tersedia (Hari Ini)</span>
					</h2>
					<span class="text-xs text-slate-500 font-mono">
						Tersedia: {filteredGarages.length} Unit
					</span>
				</div>

				{#if filteredGarages.length === 0}
					<div class="p-6 bg-slate-50 border border-slate-200 rounded text-center text-slate-500 text-xs">
						Tidak ada unit garasi tipe ({compatibleGarageTypes.join(', ')}) yang berstatus tersedia (available) pada hari ini.
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
						{#each filteredGarages as garage (garage.id)}
							<label
								class="border rounded p-3.5 cursor-pointer transition flex flex-col justify-between {selectedGarageId === garage.id ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' : 'border-slate-200 hover:border-slate-300 bg-white'}"
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<input
											type="radio"
											name="garageId"
											value={garage.id}
											bind:group={selectedGarageId}
											class="text-blue-600 focus:ring-blue-600"
										/>
										<span class="font-mono font-bold text-sm text-slate-900">{garage.code}</span>
									</div>
									<span class="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
										{garage.type.replace('_', ' ')}
									</span>
								</div>

								<div class="mt-3 text-xs space-y-1 text-slate-600 border-t border-slate-100 pt-2 font-mono">
									<div class="flex justify-between">
										<span class="text-slate-500 font-sans">Tarif Harian:</span>
										<span class="font-semibold text-slate-800">Rp {garage.daily_price.toLocaleString('id-ID')}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-slate-500 font-sans">Tarif Bulanan:</span>
										<span class="font-semibold text-blue-700">Rp {(garage.daily_price * 25).toLocaleString('id-ID')}</span>
									</div>
									{#if garage.type === 'mobil_listrik'}
										<div class="flex justify-between text-blue-800 font-medium">
											<span class="font-sans">Tarif Listrik:</span>
											<span>Rp {garage.electricity_price_kwh.toLocaleString('id-ID')} / kWh</span>
										</div>
									{/if}
								</div>
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Bagian 4: Pembayaran & Rincian Total -->
			<div class="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
				<h2 class="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-2">
					<Icon name="upload" size={14} class="text-slate-500" />
					<span>4. Pelunasan Biaya & Dokumen Pembayaran</span>
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
					<div>
						<label for="paymentProof" class="block text-xs font-semibold text-slate-700 mb-1">
							Unggah Bukti Pelunasan Pembayaran <span class="text-rose-600">*</span>
						</label>
						<input
							type="file"
							id="paymentProof"
							name="paymentProof"
							accept="image/*"
							class="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 rounded p-1"
						/>
						<p class="text-[11px] text-slate-400 mt-1">
							Format file yang didukung: JPG, PNG, WebP (Struk transfer/bukti lunas)
						</p>
					</div>

					<!-- Rincian Biaya Bersih -->
					<div class="bg-slate-50 border border-slate-200 rounded p-4 space-y-2 text-xs">
						<div class="text-slate-600 font-semibold border-b border-slate-200 pb-1.5">
							Kalkulasi Sistem Sesuai Spesifikasi Bisnis
						</div>
						<div class="flex justify-between">
							<span class="text-slate-500">Biaya Sewa Garasi:</span>
							<span class="font-mono font-medium text-slate-800">Rp {costCalculation.baseCost.toLocaleString('id-ID')}</span>
						</div>
						{#if costCalculation.electricityCost > 0}
							<div class="flex justify-between text-blue-700">
								<span>Pengisian Daya Baterai ({batteryCapacity} kWh):</span>
								<span class="font-mono font-medium">+ Rp {costCalculation.electricityCost.toLocaleString('id-ID')}</span>
							</div>
						{/if}
						<div class="flex justify-between text-sm font-bold border-t border-slate-200 pt-2 text-slate-900">
							<span>Total Biaya Pelunasan:</span>
							<span class="font-mono text-blue-700">Rp {costCalculation.totalCost.toLocaleString('id-ID')}</span>
						</div>
					</div>
				</div>

				<div class="pt-3 border-t border-slate-100">
					<button
						type="submit"
						disabled={!selectedGarageId}
						class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded text-xs transition shadow-xs flex items-center justify-center gap-1.5"
					>
						<Icon name="check" size={14} />
						<span>Simpan dan Konfirmasi Transaksi Sewa</span>
					</button>
				</div>
			</div>
		</form>
	{/if}
</div>
