<!-- src/routes/admin/garasi/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Tab navigasi admin
	let activeTab = $state<'list' | 'create-single' | 'create-batch'>('list');

	// Filter & Pencarian
	let searchQuery = $state('');
	let filterType = $state<string>('all');
	let filterStatus = $state<string>('all');

	// Form State Tambah 1 Unit
	let singleCode = $state('');
	let singleType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let singleVehicleName = $state('Toyota Avanza 1.5G');
	let singleLicensePlate = $state('B 1234 ABC');
	let singleCarType = $state('MPV Keluarga');
	let singleDailyPrice = $state<number>(650000);
	let singleElectricityPrice = $state<number>(2500);
	let singleBatteryCapacity = $state<number>(58);
	let singleStatus = $state<'available' | 'used'>('available');

	// Auto generate kode dan nilai awal saat kategori diganti
	$effect(() => {
		const prefix = singleType === 'sepeda' ? 'S' : singleType === 'mobil' ? 'C' : 'E';
		const nextSeq = (data.sequences[singleType] || 0) + 1;
		singleCode = `${prefix}${String(nextSeq).padStart(3, '0')}`;

		if (singleType === 'sepeda') {
			singleVehicleName = 'Honda Vario 160 ABS';
			singleLicensePlate = 'B 4567 NMX';
			singleCarType = 'Sepeda Motor Matic';
			singleDailyPrice = 125000;
			singleElectricityPrice = 0;
			singleBatteryCapacity = 0;
		} else if (singleType === 'mobil') {
			singleVehicleName = 'Toyota Avanza 1.5G';
			singleLicensePlate = 'B 1234 ABC';
			singleCarType = 'MPV Keluarga';
			singleDailyPrice = 650000;
			singleElectricityPrice = 0;
			singleBatteryCapacity = 0;
		} else {
			singleVehicleName = 'Hyundai Ioniq 5 Signature';
			singleLicensePlate = 'B 5678 EV';
			singleCarType = 'Crossover EV';
			singleDailyPrice = 750000;
			singleElectricityPrice = 2500;
			singleBatteryCapacity = 58;
		}
	});

	// Form State Batch
	let batchType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let batchVehicleName = $state('Toyota Avanza 1.5G');
	let batchCarType = $state('MPV Keluarga');
	let batchCount = $state<number>(3);
	let batchDailyPrice = $state<number>(650000);
	let batchElectricityPrice = $state<number>(2500);

	// Preview kode batch
	let nextBatchPreview = $derived.by(() => {
		const currentCount = data.sequences[batchType] || 0;
		const nextStart = currentCount + 1;
		const nextEnd = nextStart + Math.max(1, batchCount || 1) - 1;
		const prefix = batchType === 'sepeda' ? 'S' : batchType === 'mobil' ? 'C' : 'E';
		const startStr = `${prefix}${String(nextStart).padStart(3, '0')}`;
		const endStr = `${prefix}${String(nextEnd).padStart(3, '0')}`;
		return batchCount === 1 ? startStr : `${startStr} s/d ${endStr}`;
	});

	// Modal Edit State
	let editGarage = $state<any | null>(null);
	let editCode = $state('');
	let editType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let editVehicleName = $state('');
	let editLicensePlate = $state('');
	let editCarType = $state('');
	let editDailyPrice = $state<number>(500000);
	let editElectricityPrice = $state<number>(0);
	let editBatteryCapacity = $state<number>(0);
	let editStatus = $state<'available' | 'used'>('available');

	function openEditModal(g: any) {
		editGarage = g;
		editCode = g.code;
		editType = g.type;
		editVehicleName = g.vehicle_name || '';
		editLicensePlate = g.license_plate || '';
		editCarType = g.car_type || 'Standar';
		editDailyPrice = g.daily_price;
		editElectricityPrice = g.electricity_price_kwh || 0;
		editBatteryCapacity = g.battery_capacity_kwh || 0;
		editStatus = g.status;
	}

	function closeEditModal() {
		editGarage = null;
	}

	// Modal Delete State
	let deleteGarageTarget = $state<any | null>(null);

	function openDeleteModal(g: any) {
		deleteGarageTarget = g;
	}

	function closeDeleteModal() {
		deleteGarageTarget = null;
	}

	// Filtered list
	let filteredGarages = $derived.by(() => {
		return data.garages.filter((g: any) => {
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				!q ||
				g.code.toLowerCase().includes(q) ||
				(g.vehicle_name && g.vehicle_name.toLowerCase().includes(q)) ||
				(g.license_plate && g.license_plate.toLowerCase().includes(q)) ||
				(g.car_type && g.car_type.toLowerCase().includes(q));

			const matchesType = filterType === 'all' || g.type === filterType;
			const matchesStatus = filterStatus === 'all' || g.status === filterStatus;
			return matchesSearch && matchesType && matchesStatus;
		});
	});

	// Summary KPI
	let totalUnits = $derived(data.garages.length);
	let availableUnits = $derived(data.garages.filter((g: any) => g.status === 'available').length);
	let rentedUnits = $derived(data.garages.filter((g: any) => g.status === 'used').length);

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:head>
	<title>Kelola Kendaraan & Garasi - Admin SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Admin Header -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="shield" size={14} />
				<span>Panel Administrasi</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Kelola Kendaraan & Unit Garasi</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Daftar armada mobil dan sepeda motor sewa beserta jadwal sewa aktif yang tercatat di sistem.
			</p>
		</div>

		<!-- Action Buttons Switcher -->
		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={() => (activeTab = 'list')}
				class="px-4 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'list' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="building" size={14} />
				<span>Daftar Armada ({totalUnits})</span>
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'create-single')}
				class="px-4 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'create-single' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="plus" size={14} />
				<span>+ Tambah Mobil / Motor</span>
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'create-batch')}
				class="px-3.5 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'create-batch' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="filter" size={13} />
				<span>Batch Unit Massal</span>
			</button>
		</div>
	</div>

	<!-- Alert Messages -->
	{#if form?.success}
		<div class="p-4 bg-[#EFF3ED] border border-[#C2CCBC] text-[#2E382A] rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="check" size={16} class="text-[#71856A]" />
			<span>{form.message}</span>
		</div>
	{:else if form?.error}
		<div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="alert" size={16} class="text-rose-600" />
			<span>{form.error}</span>
		</div>
	{/if}

	<!-- 3 KPI STAT CARDS (Clear Overview for Admin) -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-white p-5 rounded-xl border border-[#DFD5C2] shadow-xs card-hover flex items-center justify-between">
			<div>
				<span class="text-xs font-bold text-[#877758] uppercase tracking-wider block">Total Armada</span>
				<div class="text-2xl font-extrabold font-mono text-[#383123] mt-1">{totalUnits} Unit</div>
				<span class="text-[11px] text-[#A08F6E] mt-0.5 block">Motor & Mobil terdaftar</span>
			</div>
			<div class="w-10 h-10 rounded-xl bg-[#FAF8F4] border border-[#DFD5C2] text-[#4F4532] flex items-center justify-center">
				<Icon name="building" size={20} />
			</div>
		</div>

		<div class="bg-white p-5 rounded-xl border border-[#C2CCBC] shadow-xs card-hover flex items-center justify-between">
			<div>
				<span class="text-xs font-bold text-[#596A53] uppercase tracking-wider block">Unit Tersedia (Siap Sewa)</span>
				<div class="text-2xl font-extrabold font-mono text-[#596A53] mt-1">{availableUnits} Unit</div>
				<span class="text-[11px] text-[#71856A] mt-0.5 block">Bisa disewa langsung oleh penyewa</span>
			</div>
			<div class="w-10 h-10 rounded-xl bg-[#EFF3ED] border border-[#DFE5DC] text-[#71856A] flex items-center justify-center">
				<Icon name="check" size={20} />
			</div>
		</div>

		<div class="bg-white p-5 rounded-xl border border-[#DAC99B] shadow-xs card-hover flex items-center justify-between">
			<div>
				<span class="text-xs font-bold text-[#8A7545] uppercase tracking-wider block">Unit Sedang Dirental</span>
				<div class="text-2xl font-extrabold font-mono text-[#8A7545] mt-1">{rentedUnits} Unit</div>
				<span class="text-[11px] text-[#B0975C] mt-0.5 block">Dalam masa sewa aktif saat ini</span>
			</div>
			<div class="w-10 h-10 rounded-xl bg-[#FDFBF7] border border-[#DAC99B] text-[#B0975C] flex items-center justify-center">
				<Icon name="clock" size={20} />
			</div>
		</div>
	</div>

	<!-- TAB 1: LIST TABLE (CLEAN, INTUITIVE, PROFESSIONAL UX) -->
	{#if activeTab === 'list'}
		<div class="space-y-4">
			<!-- Search & Filter Bar -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 card-hover">
				<div class="flex-1 w-full md:w-auto">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari berdasarkan nama kendaraan (Avanza, Vario), plat nomor, atau kode unit..."
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
					/>
				</div>

				<div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
					<select
						bind:value={filterType}
						class="px-3 py-2 text-xs border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus font-medium"
					>
						<option value="all">Semua Kategori</option>
						<option value="sepeda">Sepeda Motor (125rb)</option>
						<option value="mobil">Mobil Bensin (500rb - 1jt)</option>
						<option value="mobil_listrik">Mobil Listrik (EV)</option>
					</select>

					<select
						bind:value={filterStatus}
						class="px-3 py-2 text-xs border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus font-medium"
					>
						<option value="all">Semua Status</option>
						<option value="available">Tersedia (Bisa Sewa)</option>
						<option value="used">Sedang Dirental</option>
					</select>

					<button
						type="button"
						onclick={() => (activeTab = 'create-single')}
						class="px-3.5 py-2 bg-[#71856A] hover:bg-[#596A53] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 btn-interactive ml-auto md:ml-0"
					>
						<Icon name="plus" size={13} />
						<span>Tambah Unit</span>
					</button>
				</div>
			</div>

			<!-- Main Table -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
				<div class="overflow-x-auto">
					<table class="w-full text-left text-xs">
						<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
							<tr>
								<th class="py-3.5 px-4">Unit & Plat</th>
								<th class="py-3.5 px-4">Nama & Model Kendaraan</th>
								<th class="py-3.5 px-4 text-right">Tarif Harian</th>
								<th class="py-3.5 px-4 text-right">Tarif Bulanan</th>
								<th class="py-3.5 px-4">Status & Jadwal Sewa</th>
								<th class="py-3.5 px-4 text-center">Tindakan</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-[#F4EFE7]">
							{#if filteredGarages.length === 0}
								<tr>
									<td colspan="6" class="p-8 text-center text-[#A08F6E] font-medium">
										Tidak ada kendaraan yang sesuai dengan filter pencarian.
									</td>
								</tr>
							{:else}
								{#each filteredGarages as garage (garage.id)}
									{@const isRented = garage.status === 'used' || Boolean(garage.active_end_date)}
									<tr class="hover:bg-[#FAF8F4] transition">
										<!-- Unit & Plat -->
										<td class="py-3 px-4">
											<div class="flex items-center gap-2">
												<span class="font-mono font-extrabold text-xs px-2.5 py-1 bg-[#383123] text-white rounded-md border border-[#4F4532]">
													{garage.code}
												</span>
												<div>
													<span class="font-mono font-bold text-xs text-[#383123] block">
														{garage.license_plate || 'Bebas Plat'}
													</span>
													<span class="text-[10px] uppercase font-bold text-[#877758]">
														{garage.type.replace('_', ' ')}
													</span>
												</div>
											</div>
										</td>

										<!-- Nama & Model Kendaraan -->
										<td class="py-3 px-4">
											<div class="font-bold text-[#383123] text-sm">
												{garage.vehicle_name || 'Kendaraan'}
											</div>
											<div class="text-[11px] text-[#6B5E45] flex items-center gap-2 mt-0.5">
												<span>Tipe: <strong>{garage.car_type || 'Standar'}</strong></span>
												{#if garage.type === 'mobil_listrik'}
													<span class="text-[#596A53] font-semibold flex items-center gap-0.5">
														<Icon name="zap" size={11} />
														<span>{garage.battery_capacity_kwh || 58} kWh</span>
													</span>
												{/if}
											</div>
										</td>

										<!-- Tarif Harian -->
										<td class="py-3 px-4 text-right font-mono font-bold text-[#383123]">
											{formatRupiah(garage.daily_price)}
										</td>

										<!-- Tarif Bulanan -->
										<td class="py-3 px-4 text-right font-mono font-bold text-[#71856A]">
											{formatRupiah(garage.daily_price * 25)}
										</td>

										<!-- Status & Jadwal Sewa Aktif -->
										<td class="py-3 px-4">
											{#if isRented}
												<div class="space-y-0.5">
													<span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
														⛔ Sedang Dirental
													</span>
													{#if garage.active_start_date && garage.active_end_date}
														<div class="text-[11px] font-mono text-rose-700 font-bold">
															{garage.active_start_date} (Kembali: {garage.active_end_date})
														</div>
													{/if}
													{#if garage.active_tenant_name}
														<div class="text-[10px] text-[#6B5E45]">
															Oleh: <strong>{garage.active_tenant_name}</strong>
														</div>
													{/if}
												</div>
											{:else}
												<div>
													<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]">
														● Tersedia (Siap Sewa)
													</span>
												</div>
											{/if}
										</td>

										<!-- Tindakan (Edit & Hapus) -->
										<td class="py-3 px-4 text-center">
											<div class="inline-flex items-center gap-1.5">
												<button
													type="button"
													onclick={() => openEditModal(garage)}
													class="px-2.5 py-1 bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md font-bold text-[11px] border border-[#C2CCBC] transition btn-interactive"
												>
													Edit
												</button>
												<button
													type="button"
													onclick={() => openDeleteModal(garage)}
													class="px-2.5 py-1 bg-[#FAF8F4] hover:bg-rose-50 text-[#877758] hover:text-rose-700 rounded-md font-bold text-[11px] border border-[#DFD5C2] hover:border-rose-300 transition btn-interactive"
												>
													Hapus
												</button>
											</div>
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}

	<!-- TAB 2: TAMBAH 1 UNIT KENDARAAN (FORM SEDERHANA & MUDAH) -->
	{#if activeTab === 'create-single'}
		<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs p-6 space-y-6 card-hover">
			<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
				<div>
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="plus" size={15} class="text-[#71856A]" />
						<span>Formulir Tambah Kendaraan / Mobil Baru</span>
					</h2>
					<p class="text-[11px] text-[#6B5E45] mt-0.5">
						Masukkan detail armada sewa. Data ini akan langsung muncul otomatis pada pilihan unit penyewa.
					</p>
				</div>
				<button
					type="button"
					onclick={() => (activeTab = 'list')}
					class="text-xs text-[#71856A] font-bold hover:underline"
				>
					← Kembali ke Daftar
				</button>
			</div>

			<form method="POST" action="?/createGarage" class="space-y-5">
				<!-- Kategori Utama -->
				<div>
					<span class="block text-xs font-bold text-[#4F4532] mb-2">Pilih Jenis Kendaraan <span class="text-rose-600">*</span></span>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<button
							type="button"
							onclick={() => (singleType = 'sepeda')}
							class="p-3.5 rounded-xl border text-left transition-all btn-interactive {singleType === 'sepeda' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="font-bold text-xs">Sepeda Motor</div>
							<div class="text-[11px] text-[#71856A] mt-0.5">Tarif Standar: Rp 125.000 / hari</div>
						</button>

						<button
							type="button"
							onclick={() => (singleType = 'mobil')}
							class="p-3.5 rounded-xl border text-left transition-all btn-interactive {singleType === 'mobil' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="font-bold text-xs">Mobil (Bensin / Diesel)</div>
							<div class="text-[11px] text-[#877758] mt-0.5">Tarif: Rp 500.000 - Rp 1.000.000 / hari</div>
						</button>

						<button
							type="button"
							onclick={() => (singleType = 'mobil_listrik')}
							class="p-3.5 rounded-xl border text-left transition-all btn-interactive {singleType === 'mobil_listrik' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="font-bold text-xs">Mobil Listrik (EV)</div>
							<div class="text-[11px] text-[#596A53] mt-0.5">Tarif: Rp 750.000 - Rp 1.000.000 / hari</div>
						</button>
					</div>
					<input type="hidden" name="type" value={singleType} />
				</div>

				<!-- Detail Kendaraan -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="singleCode" class="block text-xs font-bold text-[#4F4532] mb-1">
							Kode Unit Garasi <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="singleCode"
							name="code"
							bind:value={singleCode}
							required
							placeholder="C005 / S004 / E004"
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold uppercase"
						/>
					</div>

					<div>
						<label for="singleVehicleName" class="block text-xs font-bold text-[#4F4532] mb-1">
							Nama & Merek Kendaraan <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="singleVehicleName"
							name="vehicleName"
							bind:value={singleVehicleName}
							required
							placeholder="Contoh: Toyota Avanza 1.5G / Honda Vario 160"
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						/>
					</div>

					<div>
						<label for="singleLicensePlate" class="block text-xs font-bold text-[#4F4532] mb-1">
							Nomor Plat Polisi <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="singleLicensePlate"
							name="licensePlate"
							bind:value={singleLicensePlate}
							required={singleType !== 'sepeda'}
							placeholder="Contoh: B 1234 ABC"
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold uppercase"
						/>
					</div>

					<div>
						<label for="singleCarType" class="block text-xs font-bold text-[#4F4532] mb-1">
							Tipe Mobil / Model <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="singleCarType"
							name="carType"
							bind:value={singleCarType}
							required
							placeholder="MPV Keluarga / City Car / SUV / Sedan"
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						/>
					</div>

					<div>
						<label for="singleDailyPrice" class="block text-xs font-bold text-[#4F4532] mb-1">
							Tarif Sewa Harian (Rp) <span class="text-rose-600">*</span>
						</label>
						<input
							type="number"
							id="singleDailyPrice"
							name="dailyPrice"
							bind:value={singleDailyPrice}
							min="10000"
							step="10000"
							required
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
						/>
						<span class="text-[11px] text-[#71856A] font-mono mt-0.5 block">
							Bulanan: {formatRupiah(singleDailyPrice * 25)}
						</span>
					</div>

					<div>
						<label for="singleStatus" class="block text-xs font-bold text-[#4F4532] mb-1">
							Status Awal <span class="text-rose-600">*</span>
						</label>
						<select
							id="singleStatus"
							name="status"
							bind:value={singleStatus}
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						>
							<option value="available">Tersedia (Bisa Disewa)</option>
							<option value="used">Sedang Terpakai / Disewa</option>
						</select>
					</div>

					{#if singleType === 'mobil_listrik'}
						<div class="md:col-span-3 bg-[#EFF3ED] border border-[#C2CCBC] p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label for="singleBatteryCapacity" class="block text-xs font-bold text-[#2E382A] mb-1">
									Kapasitas Baterai Listrik (kWh) <span class="text-rose-600">*</span>
								</label>
								<input
									type="number"
									id="singleBatteryCapacity"
									name="batteryCapacity"
									bind:value={singleBatteryCapacity}
									min="1"
									step="0.5"
									required
									class="w-full px-3 py-1.5 text-xs border border-[#71856A] rounded-lg bg-white font-mono font-bold"
								/>
							</div>

							<div>
								<label for="singleElectricityPrice" class="block text-xs font-bold text-[#2E382A] mb-1">
									Tarif Listrik SPKLU / kWh (Rp) <span class="text-rose-600">*</span>
								</label>
								<input
									type="number"
									id="singleElectricityPrice"
									name="electricityPrice"
									bind:value={singleElectricityPrice}
									min="0"
									step="100"
									required
									class="w-full px-3 py-1.5 text-xs border border-[#71856A] rounded-lg bg-white font-mono font-bold"
								/>
							</div>
						</div>
					{/if}
				</div>

				<div class="pt-3 border-t border-[#F4EFE7] flex justify-end gap-3">
					<button
						type="button"
						onclick={() => (activeTab = 'list')}
						class="px-4 py-2 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] font-bold rounded-lg text-xs border border-[#DFD5C2]"
					>
						Batal
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-1.5 btn-interactive"
					>
						<Icon name="check" size={14} />
						<span>Simpan Kendaraan Baru</span>
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- TAB 3: BATCH GENERATION (PEMBUATAN MASSAL) -->
	{#if activeTab === 'create-batch'}
		<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs p-6 space-y-5 card-hover">
			<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
				<div>
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="filter" size={15} class="text-[#71856A]" />
						<span>Pembuatan Massal Unit Kendaraan / Garasi</span>
					</h2>
					<p class="text-[11px] text-[#6B5E45] mt-0.5">
						Membuat banyak unit sekaligus dengan kode incremental otomatis.
					</p>
				</div>
				<button
					type="button"
					onclick={() => (activeTab = 'list')}
					class="text-xs text-[#71856A] font-bold hover:underline"
				>
					← Kembali ke Daftar
				</button>
			</div>

			<form method="POST" action="?/createBatchGarages" class="space-y-5">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div>
						<label for="batchType" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Kategori Garasi <span class="text-rose-600">*</span>
						</label>
						<select
							id="batchType"
							name="type"
							bind:value={batchType}
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						>
							<option value="sepeda">Sepeda Motor (Kode S)</option>
							<option value="mobil">Mobil Bensin (Kode C)</option>
							<option value="mobil_listrik">Mobil Listrik (Kode E)</option>
						</select>
					</div>

					<div>
						<label for="batchCount" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Jumlah Unit <span class="text-rose-600">*(1-999)</span>
						</label>
						<input
							type="number"
							id="batchCount"
							name="count"
							bind:value={batchCount}
							min="1"
							max="999"
							required
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
						/>
					</div>

					<div>
						<label for="batchVehicleName" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Nama Kendaraan <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="batchVehicleName"
							name="vehicleName"
							bind:value={batchVehicleName}
							required
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						/>
					</div>

					<div>
						<label for="batchDailyPrice" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Tarif Harian (Rp) <span class="text-rose-600">*</span>
						</label>
						<input
							type="number"
							id="batchDailyPrice"
							name="dailyPrice"
							bind:value={batchDailyPrice}
							min="1000"
							step="1000"
							required
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
						/>
					</div>
				</div>

				<div class="bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
					<div>
						<span class="text-[#877758] font-medium">Estimasi Kode Unit Dihasilkan:</span>
						<span class="ml-2 font-mono font-extrabold text-[#383123] bg-white px-3 py-1 rounded-md border border-[#DFD5C2] shadow-xs">
							{nextBatchPreview}
						</span>
					</div>
					<button
						type="submit"
						class="px-5 py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-2 btn-interactive"
					>
						<Icon name="plus" size={14} />
						<span>Generate & Simpan Batch</span>
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>

<!-- ================= EDIT MODAL (UPDATE) ================= -->
{#if editGarage}
	<div class="fixed inset-0 z-50 bg-[#252016]/50 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl border border-[#DFD5C2] max-w-lg w-full p-6 space-y-5 shadow-xl animate-in fade-in zoom-in-95">
			<div class="flex items-center justify-between border-b border-[#F4EFE7] pb-3">
				<div>
					<h3 class="text-sm font-extrabold text-[#383123] flex items-center gap-2">
						<Icon name="building" size={16} class="text-[#71856A]" />
						<span>Edit Data Unit {editCode}</span>
					</h3>
					<p class="text-[11px] text-[#6B5E45] mt-0.5">Perbarui informasi kendaraan, plat, dan tarif sewa</p>
				</div>
				<button
					type="button"
					onclick={closeEditModal}
					class="w-7 h-7 rounded-lg bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] flex items-center justify-center font-bold text-xs"
				>
					✕
				</button>
			</div>

			<form method="POST" action="?/updateGarage" class="space-y-4">
				<input type="hidden" name="id" value={editGarage.id} />

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="editCode" class="block text-xs font-bold text-[#4F4532] mb-1">
							Kode Unit <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="editCode"
							name="code"
							bind:value={editCode}
							required
							class="w-full px-3 py-1.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold uppercase"
						/>
					</div>

					<div>
						<label for="editType" class="block text-xs font-bold text-[#4F4532] mb-1">
							Kategori <span class="text-rose-600">*</span>
						</label>
						<select
							id="editType"
							name="type"
							bind:value={editType}
							class="w-full px-3 py-1.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						>
							<option value="sepeda">Sepeda Motor (S)</option>
							<option value="mobil">Mobil Bensin (C)</option>
							<option value="mobil_listrik">Mobil Listrik (E)</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="editVehicleName" class="block text-xs font-bold text-[#4F4532] mb-1">
							Nama Kendaraan <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="editVehicleName"
							name="vehicleName"
							bind:value={editVehicleName}
							required
							class="w-full px-3 py-1.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						/>
					</div>

					<div>
						<label for="editLicensePlate" class="block text-xs font-bold text-[#4F4532] mb-1">
							Nomor Plat Polisi
						</label>
						<input
							type="text"
							id="editLicensePlate"
							name="licensePlate"
							bind:value={editLicensePlate}
							class="w-full px-3 py-1.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold uppercase"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="editCarType" class="block text-xs font-bold text-[#4F4532] mb-1">
							Tipe Mobil / Model <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="editCarType"
							name="carType"
							bind:value={editCarType}
							required
							class="w-full px-3 py-1.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						/>
					</div>

					<div>
						<label for="editDailyPrice" class="block text-xs font-bold text-[#4F4532] mb-1">
							Tarif Harian (Rp) <span class="text-rose-600">*</span>
						</label>
						<input
							type="number"
							id="editDailyPrice"
							name="dailyPrice"
							bind:value={editDailyPrice}
							min="1000"
							step="1000"
							required
							class="w-full px-3 py-1.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="editStatus" class="block text-xs font-bold text-[#4F4532] mb-1">
							Status Operasional <span class="text-rose-600">*</span>
						</label>
						<select
							id="editStatus"
							name="status"
							bind:value={editStatus}
							class="w-full px-3 py-1.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						>
							<option value="available">Tersedia (Bisa Disewa)</option>
							<option value="used">Sedang Dirental</option>
						</select>
					</div>

					{#if editType === 'mobil_listrik'}
						<div>
							<label for="editBatteryCapacity" class="block text-xs font-bold text-[#4F4532] mb-1">
								Kapasitas Baterai (kWh)
							</label>
							<input
								type="number"
								id="editBatteryCapacity"
								name="batteryCapacity"
								bind:value={editBatteryCapacity}
								min="0"
								step="0.5"
								class="w-full px-3 py-1.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
							/>
						</div>
					{/if}
				</div>

				<div class="pt-3 border-t border-[#F4EFE7] flex justify-end gap-2.5">
					<button
						type="button"
						onclick={closeEditModal}
						class="px-4 py-2 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] font-bold rounded-lg text-xs border border-[#DFD5C2]"
					>
						Batal
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-1.5 btn-interactive"
					>
						<Icon name="check" size={13} />
						<span>Simpan Perubahan</span>
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ================= DELETE MODAL (DELETE CONFIRMATION) ================= -->
{#if deleteGarageTarget}
	<div class="fixed inset-0 z-50 bg-[#252016]/50 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl border border-rose-200 max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
					<Icon name="alert" size={20} />
				</div>
				<div>
					<h3 class="text-sm font-extrabold text-[#383123]">Konfirmasi Hapus Unit</h3>
					<p class="text-xs text-[#6B5E45]">Apakah Anda yakin ingin menghapus unit kendaraan ini?</p>
				</div>
			</div>

			<div class="p-3.5 bg-[#FAF8F4] rounded-xl border border-[#DFD5C2] space-y-1 text-xs font-mono">
				<div class="flex justify-between">
					<span class="text-[#877758]">Kode Unit:</span>
					<span class="font-bold text-[#383123]">{deleteGarageTarget.code}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#877758]">Nama / Merek:</span>
					<span class="font-semibold text-[#383123]">{deleteGarageTarget.vehicle_name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#877758]">Plat Nomor:</span>
					<span class="font-bold text-[#71856A]">{deleteGarageTarget.license_plate || 'Bebas Plat'}</span>
				</div>
			</div>

			{#if deleteGarageTarget.active_rentals > 0}
				<div class="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
					⚠️ Unit ini memiliki kontrak sewa aktif dan TIDAK BISA dihapus saat ini.
				</div>
			{/if}

			<form method="POST" action="?/deleteGarage" class="pt-2 flex justify-end gap-2.5">
				<input type="hidden" name="id" value={deleteGarageTarget.id} />
				<button
					type="button"
					onclick={closeDeleteModal}
					class="px-4 py-2 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] font-bold rounded-lg text-xs border border-[#DFD5C2]"
				>
					Batal
				</button>
				<button
					type="submit"
					disabled={deleteGarageTarget.active_rentals > 0}
					class="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-1.5 btn-interactive"
				>
					<Icon name="x" size={13} />
					<span>Ya, Hapus Unit</span>
				</button>
			</form>
		</div>
	</div>
{/if}
