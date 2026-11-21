<!-- src/routes/penyewa/sewa-baru/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Form State
	let vehicleType = $state<'sepeda' | 'sepeda_motor' | 'mobil' | 'mobil_listrik'>('mobil');
	let vehicleBrandModel = $state('Toyota Avanza 1.5G');
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

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:head>
	<title>Formulir Sewa Baru - SIM-GARASI</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-2 space-y-6">
	<!-- Page Header with Earthy Palette -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs card-hover flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="file-text" size={14} />
				<span>Modul Transaksi Penyewa Terverifikasi</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Formulir Sewa Garasi Baru</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Sistem akan menyaring garasi yang kompatibel secara otomatis dan menghitung biaya sesuai regulasi bisnis.
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
			<!-- Bagian 1: Data Kendaraan & Visual Selector -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs space-y-5 card-hover">
				<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="car" size={15} class="text-[#71856A]" />
						<span>1. Identitas & Jenis Kendaraan</span>
					</h2>
					<span class="text-[11px] text-[#A08F6E]">Validasi Kompatibilitas Otomatis</span>
				</div>

				<!-- Interactive Vehicle Category Selector Cards -->
				<div>
					<span class="block text-xs font-bold text-[#4F4532] mb-2">
						Pilih Jenis Kendaraan <span class="text-rose-600">*</span>
					</span>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
						<button
							type="button"
							onclick={() => {
								vehicleType = 'sepeda';
								vehicleBrandModel = 'Polygon Cascade 4';
								licensePlate = '';
							}}
							class="p-3.5 rounded-xl border text-left transition-all btn-interactive flex flex-col justify-between {vehicleType === 'sepeda' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45] hover:bg-[#F4EFE7]'}"
						>
							<div class="w-8 h-8 rounded-lg bg-white text-[#71856A] flex items-center justify-center border border-[#DFE5DC]">
								<Icon name="bike" size={16} />
							</div>
							<div class="mt-2">
								<div class="font-bold text-xs">Sepeda (Gowes)</div>
								<div class="text-[10px] text-[#71856A]">Garasi S (Bebas Plat)</div>
							</div>
						</button>

						<button
							type="button"
							onclick={() => {
								vehicleType = 'sepeda_motor';
								vehicleBrandModel = 'Honda Vario 160';
								if (!licensePlate) licensePlate = 'L 4567 CD';
							}}
							class="p-3.5 rounded-xl border text-left transition-all btn-interactive flex flex-col justify-between {vehicleType === 'sepeda_motor' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45] hover:bg-[#F4EFE7]'}"
						>
							<div class="w-8 h-8 rounded-lg bg-white text-[#71856A] flex items-center justify-center border border-[#DFE5DC]">
								<Icon name="bike" size={16} />
							</div>
							<div class="mt-2">
								<div class="font-bold text-xs">Sepeda Motor</div>
								<div class="text-[10px] text-[#71856A]">Garasi S (Wajib Plat)</div>
							</div>
						</button>

						<button
							type="button"
							onclick={() => {
								vehicleType = 'mobil';
								vehicleBrandModel = 'Toyota Avanza 1.5G';
								if (!licensePlate) licensePlate = 'B 1234 ABC';
							}}
							class="p-3.5 rounded-xl border text-left transition-all btn-interactive flex flex-col justify-between {vehicleType === 'mobil' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45] hover:bg-[#F4EFE7]'}"
						>
							<div class="w-8 h-8 rounded-lg bg-white text-[#877758] flex items-center justify-center border border-[#DFE5DC]">
								<Icon name="car" size={16} />
							</div>
							<div class="mt-2">
								<div class="font-bold text-xs">Mobil Bensin</div>
								<div class="text-[10px] text-[#877758]">Garasi C (Wajib Plat)</div>
							</div>
						</button>

						<button
							type="button"
							onclick={() => {
								vehicleType = 'mobil_listrik';
								vehicleBrandModel = 'Hyundai Ioniq 5 Signature';
								if (!licensePlate) licensePlate = 'B 5678 EV';
								if (!batteryCapacity) batteryCapacity = 60;
							}}
							class="p-3.5 rounded-xl border text-left transition-all btn-interactive flex flex-col justify-between {vehicleType === 'mobil_listrik' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45] hover:bg-[#F4EFE7]'}"
						>
							<div class="w-8 h-8 rounded-lg bg-white text-[#596A53] flex items-center justify-center border border-[#DFE5DC]">
								<Icon name="zap" size={16} />
							</div>
							<div class="mt-2">
								<div class="font-bold text-xs">Mobil Listrik (EV)</div>
								<div class="text-[10px] text-[#596A53]">Garasi C atau E</div>
							</div>
						</button>
					</div>

					<input type="hidden" name="vehicleType" value={vehicleType} />
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
					<div>
						<label for="vehicleBrandModel" class="block text-xs font-bold text-[#4F4532] mb-1">
							Merek dan Tipe Kendaraan <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="vehicleBrandModel"
							name="vehicleBrandModel"
							bind:value={vehicleBrandModel}
							required
							placeholder="Contoh: Toyota Avanza / Polygon Cascade / Ioniq 5"
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						/>
					</div>

					<div>
						<label for="licensePlate" class="block text-xs font-bold text-[#4F4532] mb-1">
							Nomor Plat Polisi {#if vehicleType === 'sepeda'}<span class="text-[#A08F6E] font-normal">(Tidak wajib untuk sepeda)</span>{:else}<span class="text-rose-600">* Wajib</span>{/if}
						</label>
						<input
							type="text"
							id="licensePlate"
							name="licensePlate"
							bind:value={licensePlate}
							disabled={vehicleType === 'sepeda'}
							required={vehicleType !== 'sepeda'}
							placeholder={vehicleType === 'sepeda' ? 'Bebas tanpa plat polisi' : 'Contoh: B 1234 ABC'}
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus disabled:bg-[#FAF8F4] disabled:text-[#BEB092] font-mono uppercase bg-[#FCFAF4] font-medium"
						/>
					</div>

					{#if vehicleType === 'mobil_listrik'}
						<div class="md:col-span-2 bg-[#EFF3ED] border border-[#C2CCBC] p-4 rounded-xl space-y-2">
							<div class="flex items-center justify-between">
								<label for="batteryCapacity" class="block text-xs font-bold text-[#2E382A]">
									Kapasitas Baterai Listrik (kWh) <span class="text-rose-600">*</span>
								</label>
								<span class="text-[11px] font-mono font-bold text-[#596A53] bg-white px-2.5 py-0.5 rounded-md border border-[#DFE5DC]">
									Wajib 100% Full Charge di Garasi E
								</span>
							</div>
							<div class="flex items-center gap-3">
								<input
									type="number"
									id="batteryCapacity"
									name="batteryCapacity"
									bind:value={batteryCapacity}
									min="1"
									max="200"
									step="0.5"
									required
									class="w-32 px-3 py-1.5 text-xs border border-[#71856A] rounded-lg bg-white font-mono font-bold text-[#2E382A]"
								/>
								<span class="text-xs font-bold text-[#596A53]">kWh</span>
								<div class="flex gap-2">
									<button
										type="button"
										onclick={() => (batteryCapacity = 26.7)}
										class="px-2 py-1 text-[10px] bg-white rounded border border-[#DFE5DC] text-[#4F4532] hover:bg-[#F4EFE7]"
									>
										Air EV (26.7 kWh)
									</button>
									<button
										type="button"
										onclick={() => (batteryCapacity = 58)}
										class="px-2 py-1 text-[10px] bg-white rounded border border-[#DFE5DC] text-[#4F4532] hover:bg-[#F4EFE7]"
									>
										Ioniq 5 (58 kWh)
									</button>
									<button
										type="button"
										onclick={() => (batteryCapacity = 82)}
										class="px-2 py-1 text-[10px] bg-white rounded border border-[#DFE5DC] text-[#4F4532] hover:bg-[#F4EFE7]"
									>
										BYD Seal (82 kWh)
									</button>
								</div>
							</div>
							<p class="text-[11px] text-[#596A53]">
								Sesuai aturan SKKNI: Jika memilih unit Garasi E (Mobil Listrik), sistem otomatis menagih biaya pengisian baterai 100% kapasitas dikalikan tarif kWh garasi.
							</p>
						</div>
					{/if}
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

			<!-- Bagian 3: Pilih Garasi yang Kompatibel & Tersedia -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs space-y-4 card-hover">
				<div class="flex items-center justify-between border-b border-[#F4EFE7] pb-3">
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="building" size={15} class="text-[#71856A]" />
						<span>3. Pilih Unit Garasi Tersedia</span>
					</h2>
					<span class="text-xs font-mono font-bold text-[#71856A] bg-[#EFF3ED] px-2.5 py-0.5 rounded-full border border-[#DFE5DC]">
						{filteredGarages.length} Unit Siap Pakai
					</span>
				</div>

				{#if filteredGarages.length === 0}
					<div class="p-8 bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl text-center text-[#877758] text-xs">
						Tidak ada unit garasi yang cocok ({compatibleGarageTypes.join(', ')}) dengan status tersedia (available) saat ini.
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						{#each filteredGarages as garage (garage.id)}
							<label
								class="border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between btn-interactive {selectedGarageId === garage.id ? 'border-[#71856A] bg-[#EFF3ED] ring-2 ring-[#71856A] shadow-sm' : 'border-[#DFD5C2] hover:border-[#BEB092] bg-[#FAF8F4]'}"
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2.5">
										<input
											type="radio"
											name="garageId"
											value={garage.id}
											bind:group={selectedGarageId}
											class="text-[#71856A] focus:ring-[#71856A] accent-[#71856A]"
										/>
										<span class="font-mono font-extrabold text-base text-[#383123]">{garage.code}</span>
									</div>
									<span class="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-white text-[#4F4532] border border-[#DFE5DC]">
										{garage.type.replace('_', ' ')}
									</span>
								</div>

								{#if garage.car_type}
									<div class="mt-2 text-[11px] font-sans font-semibold text-[#4F4532]">
										{garage.car_type}
									</div>
								{/if}

								<div class="mt-4 text-xs space-y-1.5 text-[#6B5E45] border-t border-[#EAE3D4] pt-3 font-mono">
									<div class="flex justify-between">
										<span class="text-[#877758] font-sans">Tarif Harian:</span>
										<span class="font-bold text-[#383123]">{formatRupiah(garage.daily_price)}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-[#877758] font-sans">Tarif Bulanan:</span>
										<span class="font-bold text-[#71856A]">{formatRupiah(garage.daily_price * 25)}</span>
									</div>
									{#if garage.type === 'mobil_listrik'}
										<div class="flex justify-between text-[#596A53] font-semibold pt-1 border-t border-[#DFE5DC]">
											<span class="font-sans flex items-center gap-1">
												<Icon name="zap" size={11} /> Listrik:
											</span>
											<span>{formatRupiah(garage.electricity_price_kwh)} / kWh</span>
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
						<span>4. Pelunasan & Rincian Transaksi Sesuai Standar</span>
					</h2>
					<span class="text-[11px] text-[#71856A] font-semibold">Struk Resmi Tercatat</span>
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
							Format bukti transfer didukung: JPG, PNG, WebP (Maks. 5 MB)
						</p>
					</div>

					<!-- Rincian Biaya Bersih Sesuai Domain Calculator -->
					<div class="bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl p-5 space-y-2.5 text-xs shadow-xs">
						<div class="text-[#4F4532] font-bold border-b border-[#EAE3D4] pb-2 flex items-center justify-between">
							<span>Kalkulasi Otomatis Sistem</span>
							<span class="text-[10px] text-[#71856A] uppercase font-mono">Verified Formula</span>
						</div>
						<div class="flex justify-between text-[#6B5E45]">
							<span>Biaya Sewa Unit Garasi:</span>
							<span class="font-mono font-bold text-[#383123]">{formatRupiah(costCalculation.baseCost)}</span>
						</div>
						{#if costCalculation.electricityCost > 0}
							<div class="flex justify-between text-[#596A53] pt-1 border-t border-[#EAE3D4]">
								<span>Charge Baterai ({batteryCapacity} kWh × {formatRupiah(selectedGarage?.electricity_price_kwh || 0)}):</span>
								<span class="font-mono font-bold">+ {formatRupiah(costCalculation.electricityCost)}</span>
							</div>
						{/if}
						<div class="flex justify-between text-base font-extrabold border-t-2 border-[#DFD5C2] pt-3 text-[#383123]">
							<span>Total Tagihan Lunas:</span>
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
						<span>Simpan dan Konfirmasi Sewa Garasi</span>
					</button>
				</div>
			</div>
		</form>
	{/if}
</div>