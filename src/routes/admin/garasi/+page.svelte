<!-- src/routes/admin/garasi/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '#lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Active tab: 'list' | 'create-single' | 'create-batch'
	let activeTab = $state<'list' | 'create-single' | 'create-batch'>('list');

	// Search & Filter state
	let searchQuery = $state('');
	let filterType = $state<string>('all');
	let filterStatus = $state<string>('all');

	// State Tambah Single Garasi
	let singleCode = $state('');
	let singleType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let singleCarType = $state('MPV Keluarga (Toyota Avanza, Xpander)');
	let singleDailyPrice = $state<number>(650000);
	let singleElectricityPrice = $state<number>(2500);
	let singleStatus = $state<'available' | 'used'>('available');

	// Auto generate suggested single code
	$effect(() => {
		const prefix = singleType === 'sepeda' ? 'S' : singleType === 'mobil' ? 'C' : 'E';
		const nextSeq = (data.sequences[singleType] || 0) + 1;
		singleCode = `${prefix}${String(nextSeq).padStart(3, '0')}`;

		if (singleType === 'sepeda') {
			singleCarType = 'Sepeda Motor Bebek / Matic (125cc-160cc)';
			singleDailyPrice = 125000;
		} else if (singleType === 'mobil') {
			singleCarType = 'MPV Keluarga (Toyota Avanza, Xpander)';
			singleDailyPrice = 650000;
		} else {
			singleCarType = 'Crossover EV (Hyundai Ioniq 5, Kona)';
			singleDailyPrice = 750000;
		}
	});

	// State Batch Garasi
	let batchType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let batchCarType = $state('MPV / Sedan Standar');
	let batchCount = $state<number>(5);
	let batchDailyPrice = $state<number>(500000);
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

	// State Edit Modal
	let editGarage = $state<any | null>(null);
	let editCode = $state('');
	let editType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let editCarType = $state('');
	let editDailyPrice = $state<number>(500000);
	let editElectricityPrice = $state<number>(0);
	let editStatus = $state<'available' | 'used'>('available');

	function openEditModal(g: any) {
		editGarage = g;
		editCode = g.code;
		editType = g.type;
		editCarType = g.car_type || 'Standar';
		editDailyPrice = g.daily_price;
		editElectricityPrice = g.electricity_price_kwh || 0;
		editStatus = g.status;
	}

	function closeEditModal() {
		editGarage = null;
	}

	// State Delete Modal
	let deleteGarageTarget = $state<any | null>(null);

	function openDeleteModal(g: any) {
		deleteGarageTarget = g;
	}

	function closeDeleteModal() {
		deleteGarageTarget = null;
	}

	// Filtered garages for table
	let filteredGarages = $derived.by(() => {
		return data.garages.filter((g: any) => {
			const matchesSearch =
				g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(g.car_type && g.car_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
				g.type.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesType = filterType === 'all' || g.type === filterType;
			const matchesStatus = filterStatus === 'all' || g.status === filterStatus;
			return matchesSearch && matchesType && matchesStatus;
		});
	});

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}
</script>

<svelte:head>
	<title>Sistem CRUD Garasi & Kendaraan - SIM-GARASI</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Page Header with Earthy Palette -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="shield" size={14} />
				<span>Panel Administrasi SIM-GARASI</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Sistem CRUD Kelola Garasi & Tipe Mobil</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Manajemen lengkap (Create, Read, Update, Delete) unit garasi: Sepeda Motor (125rb/hari), Mobil (500rb - 1jt/hari), dan Mobil Listrik.
			</p>
		</div>

		<!-- Action Tabs Toggle -->
		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={() => (activeTab = 'list')}
				class="px-3.5 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'list' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="building" size={13} />
				<span>Daftar Garasi ({data.garages.length})</span>
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'create-single')}
				class="px-3.5 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'create-single' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="plus" size={13} />
				<span>+ Tambah Garasi Baru</span>
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'create-batch')}
				class="px-3.5 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'create-batch' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="filter" size={13} />
				<span>Batch Generation</span>
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

	<!-- TAB 1: LIST / READ + UPDATE + DELETE TABLE -->
	{#if activeTab === 'list'}
		<div class="space-y-4">
			<!-- Search & Filter Controls -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 card-hover">
				<div class="flex-1 w-full md:w-auto relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari kode unit (C001, E001, S001) atau tipe mobil..."
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
					/>
				</div>

				<div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
					<select
						bind:value={filterType}
						class="px-3 py-2 text-xs border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus font-medium"
					>
						<option value="all">Semua Kategori</option>
						<option value="sepeda">Sepeda & Motor (Kode S)</option>
						<option value="mobil">Mobil Bensin (Kode C)</option>
						<option value="mobil_listrik">Mobil Listrik (Kode E)</option>
					</select>

					<select
						bind:value={filterStatus}
						class="px-3 py-2 text-xs border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus font-medium"
					>
						<option value="all">Semua Status</option>
						<option value="available">Tersedia (Available)</option>
						<option value="used">Terpakai (Used)</option>
					</select>

					<span class="text-xs font-mono font-bold text-[#71856A] bg-[#EFF3ED] px-2.5 py-2 rounded-lg border border-[#DFE5DC]">
						{filteredGarages.length} Unit
					</span>
				</div>
			</div>

			<!-- Main CRUD Table -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
				<div class="overflow-x-auto">
					<table class="w-full text-left text-xs">
						<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
							<tr>
								<th class="py-3.5 px-4">Kode Unit</th>
								<th class="py-3.5 px-4">Kategori Garasi</th>
								<th class="py-3.5 px-4">Tipe Mobil / Spesifikasi</th>
								<th class="py-3.5 px-4 text-right">Tarif Harian</th>
								<th class="py-3.5 px-4 text-right">Tarif Bulanan (25x)</th>
								<th class="py-3.5 px-4 text-right">Tarif Listrik EV</th>
								<th class="py-3.5 px-4">Status</th>
								<th class="py-3.5 px-4 text-center">Aksi CRUD</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-[#F4EFE7] font-mono">
							{#if filteredGarages.length === 0}
								<tr>
									<td colspan="8" class="p-8 text-center text-[#A08F6E] font-sans">
										Tidak ada unit garasi yang cocok dengan kriteria pencarian.
									</td>
								</tr>
							{:else}
								{#each filteredGarages as garage (garage.id)}
									<tr class="hover:bg-[#FAF8F4] transition">
										<td class="py-3 px-4 font-bold text-sm text-[#383123]">
											<span class="px-2.5 py-1 bg-[#383123] text-white rounded-md border border-[#4F4532]">
												{garage.code}
											</span>
										</td>
										<td class="py-3 px-4 font-sans capitalize">
											<span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold {garage.type === 'mobil_listrik' ? 'bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]' : garage.type === 'mobil' ? 'bg-[#FAF8F4] text-[#877758] border border-[#DFD5C2]' : 'bg-[#EFF3ED] text-[#71856A] border border-[#DFE5DC]'}">
												{garage.type.replace('_', ' ')}
											</span>
										</td>
										<td class="py-3 px-4 font-sans text-[#383123] font-medium">
											{garage.car_type || 'Standar'}
										</td>
										<td class="py-3 px-4 text-right font-bold text-[#383123]">
											{formatRupiah(garage.daily_price)}
										</td>
										<td class="py-3 px-4 text-right font-bold text-[#71856A]">
											{formatRupiah(garage.daily_price * 25)}
										</td>
										<td class="py-3 px-4 text-right font-semibold text-[#596A53]">
											{garage.type === 'mobil_listrik' ? `${formatRupiah(garage.electricity_price_kwh)}/kWh` : '-'}
										</td>
										<td class="py-3 px-4 font-sans">
											<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase {garage.status === 'available' ? 'bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]' : 'bg-[#FDFBF7] text-[#8A7545] border border-[#DAC99B]'}">
												{garage.status === 'available' ? '● Tersedia' : '▲ Terpakai'}
											</span>
										</td>
										<td class="py-3 px-4 text-center font-sans">
											<div class="inline-flex items-center gap-1.5">
												<button
													type="button"
													onclick={() => openEditModal(garage)}
													class="px-2.5 py-1 bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md font-bold text-[11px] border border-[#C2CCBC] transition btn-interactive"
													title="Edit data garasi"
												>
													Edit
												</button>
												<button
													type="button"
													onclick={() => openDeleteModal(garage)}
													class="px-2.5 py-1 bg-[#FAF8F4] hover:bg-rose-50 text-[#877758] hover:text-rose-700 rounded-md font-bold text-[11px] border border-[#DFD5C2] hover:border-rose-300 transition btn-interactive"
													title="Hapus unit garasi"
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

	<!-- TAB 2: CREATE SINGLE GARASI (CREATE INDIVIDUAL) -->
	{#if activeTab === 'create-single'}
		<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs p-6 space-y-5 card-hover">
			<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
				<div>
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="plus" size={15} class="text-[#71856A]" />
						<span>Formulir Tambah 1 Unit Garasi Baru</span>
					</h2>
					<p class="text-[11px] text-[#6B5E45] mt-0.5">
						Input individual dengan kode mobil/sepeda unik, penentuan tipe mobil spesifik, dan preset harga.
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
				<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
					<div>
						<label for="singleCode" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Kode Garasi / Kode Mobil <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="singleCode"
							name="code"
							bind:value={singleCode}
							required
							placeholder="Contoh: C005 / E004 / S004"
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold uppercase"
						/>
						<span class="text-[11px] text-[#A08F6E] mt-1 block">Format: S (Sepeda/Motor), C (Mobil), E (EV)</span>
					</div>

					<div>
						<label for="singleType" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Kategori Garasi <span class="text-rose-600">*</span>
						</label>
						<select
							id="singleType"
							name="type"
							bind:value={singleType}
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						>
							<option value="sepeda">Garasi Sepeda & Motor (Kode S)</option>
							<option value="mobil">Garasi Mobil (Kode C)</option>
							<option value="mobil_listrik">Garasi Mobil Listrik (Kode E)</option>
						</select>
					</div>

					<div>
						<label for="singleStatus" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Status Operasional <span class="text-rose-600">*</span>
						</label>
						<select
							id="singleStatus"
							name="status"
							bind:value={singleStatus}
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						>
							<option value="available">Tersedia (Available)</option>
							<option value="used">Terpakai (Used)</option>
						</select>
					</div>
				</div>

				<!-- Tipe Mobil / Spesifikasi Kendaraan -->
				<div>
					<label for="singleCarType" class="block text-xs font-bold text-[#4F4532] mb-1.5">
						Tipe Mobil / Spesifikasi Kendaraan yang Didukung <span class="text-rose-600">*</span>
					</label>
					<input
						type="text"
						id="singleCarType"
						name="carType"
						bind:value={singleCarType}
						required
						placeholder="Contoh: MPV Keluarga (Toyota Avanza, Xpander) / City Car / SUV"
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
					/>
					<div class="flex flex-wrap gap-1.5 mt-2">
						{#if singleType === 'sepeda'}
							<button
								type="button"
								onclick={() => {
									singleCarType = 'Sepeda Motor Bebek / Matic (125cc-160cc)';
									singleDailyPrice = 125000;
								}}
								class="px-2.5 py-1 text-[10px] font-bold bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md border border-[#C2CCBC]"
							>
								Sepeda Motor Matic (125rb)
							</button>
							<button
								type="button"
								onclick={() => {
									singleCarType = 'Sepeda Motor Sport / Maxi (NMax, CBR250)';
									singleDailyPrice = 125000;
								}}
								class="px-2.5 py-1 text-[10px] font-bold bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md border border-[#C2CCBC]"
							>
								Sepeda Motor Sport (125rb)
							</button>
						{:else if singleType === 'mobil'}
							<button
								type="button"
								onclick={() => {
									singleCarType = 'City Car / Compact Hatchback (Honda Brio, Yaris)';
									singleDailyPrice = 500000;
								}}
								class="px-2.5 py-1 text-[10px] font-bold bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md border border-[#C2CCBC]"
							>
								City Car (500rb)
							</button>
							<button
								type="button"
								onclick={() => {
									singleCarType = 'MPV Keluarga (Toyota Avanza, Xpander)';
									singleDailyPrice = 650000;
								}}
								class="px-2.5 py-1 text-[10px] font-bold bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md border border-[#C2CCBC]"
							>
								MPV Keluarga (650rb)
							</button>
							<button
								type="button"
								onclick={() => {
									singleCarType = 'Medium SUV / Crossover (Honda HR-V, Creta)';
									singleDailyPrice = 750000;
								}}
								class="px-2.5 py-1 text-[10px] font-bold bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md border border-[#C2CCBC]"
							>
								Medium SUV (750rb)
							</button>
							<button
								type="button"
								onclick={() => {
									singleCarType = 'Executive Sedan / Luxury SUV (Toyota Camry, Fortuner)';
									singleDailyPrice = 1000000;
								}}
								class="px-2.5 py-1 text-[10px] font-bold bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md border border-[#C2CCBC]"
							>
								Executive Sedan (1 Juta)
							</button>
						{:else}
							<button
								type="button"
								onclick={() => {
									singleCarType = 'Crossover EV (Hyundai Ioniq 5, Kona)';
									singleDailyPrice = 750000;
								}}
								class="px-2.5 py-1 text-[10px] font-bold bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md border border-[#C2CCBC]"
							>
								Crossover EV (750rb)
							</button>
							<button
								type="button"
								onclick={() => {
									singleCarType = 'Performance EV Sedan (BYD Seal Performance)';
									singleDailyPrice = 850000;
								}}
								class="px-2.5 py-1 text-[10px] font-bold bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md border border-[#C2CCBC]"
							>
								EV Sedan (850rb)
							</button>
							<button
								type="button"
								onclick={() => {
									singleCarType = 'Flagship Luxury EV (Kia EV9, BMW iX)';
									singleDailyPrice = 1000000;
								}}
								class="px-2.5 py-1 text-[10px] font-bold bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md border border-[#C2CCBC]"
							>
								Flagship EV (1 Juta)
							</button>
						{/if}
					</div>
				</div>

				<!-- Tarif Harian & Listrik -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div>
						<label for="singleDailyPrice" class="block text-xs font-bold text-[#4F4532] mb-1.5">
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
						<span class="text-[11px] text-[#71856A] mt-1 block font-mono">
							Tarif Bulanan Otomatis (25x): {formatRupiah(singleDailyPrice * 25)}
						</span>
					</div>

					{#if singleType === 'mobil_listrik'}
						<div class="bg-[#EFF3ED] border border-[#C2CCBC] p-4 rounded-xl space-y-1">
							<label for="singleElectricityPrice" class="block text-xs font-bold text-[#2E382A]">
								Tarif Listrik SPKLU AC Wallbox (Rp / kWh) <span class="text-rose-600">*</span>
							</label>
							<input
								type="number"
								id="singleElectricityPrice"
								name="electricityPrice"
								bind:value={singleElectricityPrice}
								min="0"
								step="100"
								required
								class="w-full px-3.5 py-1.5 text-xs border border-[#71856A] rounded-lg bg-white font-mono font-bold text-[#2E382A]"
							/>
							<span class="text-[10px] text-[#596A53] block">Standar Pengisian Daya: Rp 2.500 / kWh</span>
						</div>
					{:else}
						<div class="bg-[#FAF8F4] border border-[#DFD5C2] p-4 rounded-xl flex items-center text-xs text-[#6B5E45]">
							Unit ini tidak memerlukan fasilitas pengisian daya listrik.
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
						<span>Simpan Unit Garasi Baru</span>
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- TAB 3: CREATE BATCH GARASI (BATCH GENERATION) -->
	{#if activeTab === 'create-batch'}
		<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs p-6 space-y-5 card-hover">
			<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
				<div>
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="filter" size={15} class="text-[#71856A]" />
						<span>Formulir Batch Generation Garasi Berkelompok</span>
					</h2>
					<p class="text-[11px] text-[#6B5E45] mt-0.5">
						Pembuatan massal dengan penomoran otomatis bertahap (S001.., C001.., E001..).
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
							Tipe Garasi <span class="text-rose-600">*</span>
						</label>
						<select
							id="batchType"
							name="type"
							bind:value={batchType}
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						>
							<option value="sepeda">Garasi Sepeda & Motor (Kode S)</option>
							<option value="mobil">Garasi Mobil (Kode C)</option>
							<option value="mobil_listrik">Garasi Mobil Listrik (Kode E)</option>
						</select>
						<span class="text-[11px] text-[#A08F6E] mt-1 block font-mono">
							Saat ini terdaftar: {data.sequences[batchType]} unit
						</span>
					</div>

					<div>
						<label for="batchCount" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Jumlah Unit Dibuat <span class="text-rose-600">*(1-999)</span>
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
						<label for="batchCarType" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Tipe Mobil / Spesifikasi <span class="text-rose-600">*</span>
						</label>
						<input
							type="text"
							id="batchCarType"
							name="carType"
							bind:value={batchCarType}
							required
							placeholder="Contoh: MPV Keluarga / City Car"
							class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						/>
					</div>

					<div>
						<label for="batchDailyPrice" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Tarif Sewa Harian (Rp) <span class="text-rose-600">*</span>
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
						<span class="text-[11px] text-[#71856A] mt-1 block font-mono">
							Bulanan (25x): {formatRupiah(batchDailyPrice * 25)}
						</span>
					</div>
				</div>

				{#if batchType === 'mobil_listrik'}
					<div class="bg-[#EFF3ED] border border-[#C2CCBC] p-4 rounded-xl space-y-1">
						<label for="batchElectricityPrice" class="block text-xs font-bold text-[#2E382A]">
							Tarif Listrik SPKLU AC Wallbox (Rp / kWh) <span class="text-rose-600">*</span>
						</label>
						<input
							type="number"
							id="batchElectricityPrice"
							name="electricityPrice"
							bind:value={batchElectricityPrice}
							min="0"
							step="100"
							required
							class="w-full px-3 py-1.5 text-xs border border-[#71856A] rounded-lg bg-white font-mono font-bold text-[#2E382A]"
						/>
					</div>
				{/if}

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
						<span>Generate & Simpan Batch Garasi</span>
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
						<span>Edit Data Unit Garasi {editCode}</span>
					</h3>
					<p class="text-[11px] text-[#6B5E45] mt-0.5">Perbarui spesifikasi dan tarif unit garasi</p>
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
							Kode Garasi / Mobil <span class="text-rose-600">*</span>
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
							Kategori Garasi <span class="text-rose-600">*</span>
						</label>
						<select
							id="editType"
							name="type"
							bind:value={editType}
							class="w-full px-3 py-1.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						>
							<option value="sepeda">Sepeda & Motor (S)</option>
							<option value="mobil">Mobil Bensin (C)</option>
							<option value="mobil_listrik">Mobil Listrik (E)</option>
						</select>
					</div>
				</div>

				<div>
					<label for="editCarType" class="block text-xs font-bold text-[#4F4532] mb-1">
						Tipe Mobil / Spesifikasi Kendaraan <span class="text-rose-600">*</span>
					</label>
					<input
						type="text"
						id="editCarType"
						name="carType"
						bind:value={editCarType}
						required
						placeholder="Contoh: MPV Keluarga (Avanza, Xpander)"
						class="w-full px-3 py-1.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
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
						<span class="text-[10px] text-[#71856A] font-mono mt-0.5 block">
							Bulanan: {formatRupiah(editDailyPrice * 25)}
						</span>
					</div>

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
							<option value="available">Tersedia (Available)</option>
							<option value="used">Terpakai (Used)</option>
						</select>
					</div>
				</div>

				{#if editType === 'mobil_listrik'}
					<div class="bg-[#EFF3ED] border border-[#C2CCBC] p-3 rounded-xl space-y-1">
						<label for="editElectricityPrice" class="block text-xs font-bold text-[#2E382A]">
							Tarif Listrik EV / kWh (Rp) <span class="text-rose-600">*</span>
						</label>
						<input
							type="number"
							id="editElectricityPrice"
							name="electricityPrice"
							bind:value={editElectricityPrice}
							min="0"
							step="100"
							required
							class="w-full px-3 py-1.5 text-xs border border-[#71856A] rounded-lg bg-white font-mono font-bold text-[#2E382A]"
						/>
					</div>
				{/if}

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

<!-- ================= DELETE CONFIRMATION MODAL (DELETE) ================= -->
{#if deleteGarageTarget}
	<div class="fixed inset-0 z-50 bg-[#252016]/50 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl border border-rose-200 max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
					<Icon name="alert" size={20} />
				</div>
				<div>
					<h3 class="text-sm font-extrabold text-[#383123]">Konfirmasi Hapus Garasi</h3>
					<p class="text-xs text-[#6B5E45]">Apakah Anda yakin ingin menghapus unit garasi ini?</p>
				</div>
			</div>

			<div class="p-3.5 bg-[#FAF8F4] rounded-xl border border-[#DFD5C2] space-y-1 text-xs font-mono">
				<div class="flex justify-between">
					<span class="text-[#877758]">Kode Garasi:</span>
					<span class="font-bold text-[#383123]">{deleteGarageTarget.code}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#877758]">Kategori / Tipe:</span>
					<span class="font-semibold text-[#383123]">{deleteGarageTarget.car_type || deleteGarageTarget.type}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#877758]">Tarif Harian:</span>
					<span class="font-bold text-[#71856A]">{formatRupiah(deleteGarageTarget.daily_price)}</span>
				</div>
			</div>

			{#if deleteGarageTarget.active_rentals > 0}
				<div class="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold">
					⚠️ Peringatan: Garasi ini memiliki {deleteGarageTarget.active_rentals} kontrak sewa yang sedang aktif. Sistem akan menolak penghapusan untuk melindungi integritas transaksi.
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
