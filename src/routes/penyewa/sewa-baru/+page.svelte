<script lang="ts">
	import type { PageData, ActionData } from './$types';

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
		data.availableGarages.filter((g) => compatibleGarageTypes.includes(g.type))
	);

	// Auto-select garasi pertama jika garasi yang dipilih sebelumnya tidak ada di daftar filter
	$effect(() => {
		if (filteredGarages.length > 0) {
			const exists = filteredGarages.some((g) => g.id === selectedGarageId);
			if (!exists) {
				selectedGarageId = filteredGarages[0].id;
			}
		} else {
			selectedGarageId = null;
		}
	});

	let selectedGarage = $derived(
		data.availableGarages.find((g) => g.id === selectedGarageId) ?? null
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
	<title>Sewa Baru Garasi - GARASI.ID</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-4 space-y-6">
	<!-- Header -->
	<div class="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-2xl p-6 shadow-md">
		<h1 class="text-2xl font-bold flex items-center gap-2">
			<span>📝</span> Formulir Sewa Baru Garasi Kendaraan
		</h1>
		<p class="text-xs text-indigo-200 mt-1">
			Pilih jenis kendaraan, durasi sewa, dan garasi yang tersedia sesuai kriteria sistem.
		</p>
	</div>

	{#if data.notApproved}
		<div class="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-center space-y-3">
			<div class="text-3xl">⏳</div>
			<h2 class="text-lg font-bold text-amber-900">Akun Belum Aktif</h2>
			<p class="text-sm text-amber-800 max-w-md mx-auto">
				Status akun Anda saat ini: <strong class="uppercase font-mono">{data.userStatus}</strong>.
				Admin perlu memverifikasi kesesuaian KTP Anda terlebih dahulu sebelum Anda dapat melakukan transaksi penyewaan garasi.
			</p>
			<a
				href="/"
				class="inline-block mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
			>
				Kembali ke Beranda
			</a>
		</div>
	{:else}
		{#if form?.error}
			<div class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
				<span>⚠️</span> {form.error}
			</div>
		{/if}

		<form method="POST" action="?/submitRental" enctype="multipart/form-data" class="space-y-6">
			<!-- Section 1: Informasi Kendaraan -->
			<div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
				<h2 class="text-base font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
					<span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">1</span>
					Detail Kendaraan
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="vehicleType" class="block text-xs font-semibold text-slate-700 mb-1">
							Tipe Kendaraan <span class="text-rose-500">*</span>
						</label>
						<select
							id="vehicleType"
							name="vehicleType"
							bind:value={vehicleType}
							class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
						>
							<option value="sepeda">Sepeda (Gowes)</option>
							<option value="sepeda_motor">Sepeda Motor</option>
							<option value="mobil">Mobil Konvensional (Bensin/Diesel)</option>
							<option value="mobil_listrik">Mobil Listrik (EV)</option>
						</select>
						<p class="text-[11px] text-slate-400 mt-1">
							{#if vehicleType === 'sepeda' || vehicleType === 'sepeda_motor'}
								Hanya dapat menempati Garasi Sepeda.
							{:else if vehicleType === 'mobil'}
								Hanya dapat menempati Garasi Mobil.
							{:else}
								Dapat menempati Garasi Mobil atau Garasi Mobil Listrik.
							{/if}
						</p>
					</div>

					<div>
						<label for="vehicleBrandModel" class="block text-xs font-semibold text-slate-700 mb-1">
							Merek dan Tipe Kendaraan <span class="text-rose-500">*</span>
						</label>
						<input
							type="text"
							id="vehicleBrandModel"
							name="vehicleBrandModel"
							bind:value={vehicleBrandModel}
							required
							placeholder="Contoh: Polygon / Honda Vario / Toyota Avanza / Ioniq 5"
							class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					<div>
						<label for="licensePlate" class="block text-xs font-semibold text-slate-700 mb-1">
							Nomor Plat Kendaraan {#if vehicleType === 'sepeda'}<span class="text-slate-400 font-normal">(Opsional untuk Sepeda)</span>{:else}<span class="text-rose-500">*Wajib</span>{/if}
						</label>
						<input
							type="text"
							id="licensePlate"
							name="licensePlate"
							bind:value={licensePlate}
							disabled={vehicleType === 'sepeda'}
							required={vehicleType !== 'sepeda'}
							placeholder={vehicleType === 'sepeda' ? 'Tidak wajib untuk sepeda' : 'Contoh: B 1234 ABC'}
							class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 uppercase font-mono"
						/>
					</div>

					{#if vehicleType === 'mobil_listrik'}
						<div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
							<label for="batteryCapacity" class="block text-xs font-bold text-emerald-900 mb-1">
								⚡ Kapasitas Baterai (kWh) <span class="text-rose-500">*Wajib</span>
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
									placeholder="Contoh: 60"
									class="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
								/>
								<span class="text-xs font-bold text-emerald-800">kWh</span>
							</div>
							<p class="text-[11px] text-emerald-700 mt-1">
								Catatan: Jika memilih Garasi Mobil Listrik, baterai wajib diisi 100% penuh.
							</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Section 2: Tipe Sewa & Durasi -->
			<div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
				<h2 class="text-base font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
					<span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">2</span>
					Periode & Tipe Sewa
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="rentalType" class="block text-xs font-semibold text-slate-700 mb-1">
							Tipe Sewa <span class="text-rose-500">*</span>
						</label>
						<select
							id="rentalType"
							name="rentalType"
							bind:value={rentalType}
							class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
						>
							<option value="harian">Sewa Harian (Maks. 30 Hari)</option>
							<option value="bulanan">Sewa Bulanan (Tarif = 25 x Harian)</option>
						</select>
					</div>

					<div>
						<label for="duration" class="block text-xs font-semibold text-slate-700 mb-1">
							{#if rentalType === 'harian'}
								Jumlah Hari (Maksimal 30 Hari) <span class="text-rose-500">*</span>
							{:else}
								Jumlah Bulan <span class="text-rose-500">*</span>
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
							class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
						/>
						<p class="text-[11px] text-slate-400 mt-1">
							{rentalType === 'harian' ? 'Maksimal 30 hari sesuai aturan' : 'Hitungan bulanan penuh'}
						</p>
					</div>

					<div class="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col justify-center text-xs space-y-1">
						<div class="flex justify-between">
							<span class="text-slate-500">Mulai Sewa:</span>
							<span class="font-bold text-slate-800">{data.today} (Hari ini)</span>
						</div>
						<div class="flex justify-between border-t border-slate-200 pt-1">
							<span class="text-slate-500">Selesai Sewa:</span>
							<span class="font-bold text-indigo-700">{calculatedEndDate}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Section 3: Pilih Garasi Tersedia -->
			<div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
				<div class="flex items-center justify-between border-b border-slate-100 pb-2">
					<h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
						<span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">3</span>
						Pilih Garasi yang Tersedia (Hari Ini)
					</h2>
					<span class="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
						{filteredGarages.length} garasi cocok
					</span>
				</div>

				{#if filteredGarages.length === 0}
					<div class="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-sm">
						❌ Maaf, tidak ada garasi tipe yang sesuai ({compatibleGarageTypes.join(', ')}) yang berstatus tersedia (available) saat ini.
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each filteredGarages as garage (garage.id)}
							<label
								class="relative border rounded-xl p-4 cursor-pointer transition flex flex-col justify-between {selectedGarageId === garage.id ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500' : 'border-slate-200 hover:border-slate-300 bg-white'}"
							>
								<div class="flex items-start justify-between">
									<div class="flex items-center gap-2">
										<input
											type="radio"
											name="garageId"
											value={garage.id}
											bind:group={selectedGarageId}
											class="text-indigo-600 focus:ring-indigo-500"
										/>
										<span class="font-mono font-extrabold text-base text-slate-900">{garage.code}</span>
									</div>
									<span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded {garage.type === 'mobil_listrik' ? 'bg-emerald-100 text-emerald-800' : garage.type === 'mobil' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}">
										{garage.type.replace('_', ' ')}
									</span>
								</div>

								<div class="mt-3 text-xs space-y-1 text-slate-600 border-t border-slate-100 pt-2">
									<div class="flex justify-between">
										<span>Tarif Harian:</span>
										<span class="font-bold text-slate-800">Rp {garage.daily_price.toLocaleString('id-ID')}</span>
									</div>
									<div class="flex justify-between">
										<span>Tarif Bulanan:</span>
										<span class="font-bold text-indigo-600">Rp {(garage.daily_price * 25).toLocaleString('id-ID')}</span>
									</div>
									{#if garage.type === 'mobil_listrik'}
										<div class="flex justify-between text-emerald-700 font-medium">
											<span>Tarif Listrik:</span>
											<span>Rp {garage.electricity_price_kwh.toLocaleString('id-ID')} / kWh</span>
										</div>
									{/if}
								</div>
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Section 4: Bukti Pembayaran & Rincian Total -->
			<div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
				<h2 class="text-base font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
					<span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">4</span>
					Bukti Pelunasan & Total Biaya
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
					<div>
						<label for="paymentProof" class="block text-xs font-semibold text-slate-700 mb-1">
							Unggah Bukti Pelunasan Biaya (Foto / Struk Transfer) <span class="text-rose-500">*</span>
						</label>
						<input
							type="file"
							id="paymentProof"
							name="paymentProof"
							accept="image/*"
							class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-lg p-1"
						/>
						<p class="text-[11px] text-slate-400 mt-1">
							Format gambar (JPG, PNG, WebP). Dapat menggunakan sampel gambar untuk pengujian.
						</p>
					</div>

					<!-- Rincian Biaya Real-time -->
					<div class="bg-slate-900 text-white rounded-xl p-4 space-y-2 text-xs">
						<div class="text-slate-400 font-semibold border-b border-slate-800 pb-1">
							Rincian Perhitungan Sistem
						</div>
						<div class="flex justify-between">
							<span class="text-slate-300">Biaya Sewa Pokok:</span>
							<span class="font-mono">Rp {costCalculation.baseCost.toLocaleString('id-ID')}</span>
						</div>
						{#if costCalculation.electricityCost > 0}
							<div class="flex justify-between text-emerald-400">
								<span>Pengisian Listrik Penuh ({batteryCapacity} kWh):</span>
								<span class="font-mono">+ Rp {costCalculation.electricityCost.toLocaleString('id-ID')}</span>
							</div>
						{/if}
						<div class="flex justify-between text-base font-bold border-t border-slate-800 pt-2 text-amber-300">
							<span>Total Biaya Sewa:</span>
							<span class="font-mono">Rp {costCalculation.totalCost.toLocaleString('id-ID')}</span>
						</div>
					</div>
				</div>

				<div class="pt-4">
					<button
						type="submit"
						disabled={!selectedGarageId}
						class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
					>
						<span>💾</span> Simpan & Selesaikan Penyewaan Garasi
					</button>
				</div>
			</div>
		</form>
	{/if}
</div>
