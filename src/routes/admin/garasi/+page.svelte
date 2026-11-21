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
	let viewMode = $state<'table' | 'grid'>('grid');

	// Form State Tambah 1 Slot Garasi (Auto-Generate Kode)
	let singleType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let singleCode = $state('');
	let singleDailyPrice = $state<number>(50000);
	let singleElectricityPrice = $state<number>(2500);

	// Auto generate kode dan nilai awal saat kategori garasi diganti
	$effect(() => {
		const prefix = singleType === 'sepeda' ? 'S' : singleType === 'mobil' ? 'C' : 'E';
		const nextSeq = (data.sequences[singleType] || 0) + 1;
		singleCode = `${prefix}${String(nextSeq).padStart(3, '0')}`;

		if (singleType === 'sepeda') {
			singleDailyPrice = 20000;
			singleElectricityPrice = 0;
		} else if (singleType === 'mobil') {
			singleDailyPrice = 50000;
			singleElectricityPrice = 0;
		} else {
			singleDailyPrice = 75000;
			singleElectricityPrice = 2500;
		}
	});

	// Form State Batch (Tambah Banyak Slot Garasi Sekaligus)
	let batchType = $state<'sepeda' | 'mobil' | 'mobil_listrik'>('mobil');
	let batchCount = $state<number>(5);
	let batchDailyPrice = $state<number>(50000);
	let batchElectricityPrice = $state<number>(2500);

	$effect(() => {
		if (batchType === 'sepeda') {
			batchDailyPrice = 20000;
			batchElectricityPrice = 0;
		} else if (batchType === 'mobil') {
			batchDailyPrice = 50000;
			batchElectricityPrice = 0;
		} else {
			batchDailyPrice = 75000;
			batchElectricityPrice = 2500;
		}
	});

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

	// Modal Edit Tarif State (HANYA BISA MENGEDIT TARIF)
	let editGarage = $state<any | null>(null);
	let editDailyPrice = $state<number>(50000);
	let editElectricityPrice = $state<number>(0);

	function openEditModal(g: any) {
		editGarage = g;
		editDailyPrice = g.daily_price;
		editElectricityPrice = g.electricity_price_kwh || 0;
	}

	function closeEditModal() {
		editGarage = null;
	}

	// Modal Review Sewa State (READ-ONLY)
	let reviewRental = $state<any | null>(null);
	let reviewGarage = $state<any | null>(null);
	let isReviewingNextBooking = $state<boolean>(false);

	function openReviewModal(g: any, isNext = false) {
		reviewGarage = g;
		isReviewingNextBooking = isNext;
		reviewRental = isNext ? g.next_booking : (g.current_rental || g.next_booking);
	}

	function closeReviewModal() {
		reviewRental = null;
		reviewGarage = null;
		isReviewingNextBooking = false;
	}

	// Modal Konfirmasi Selesaikan Sewa
	let completeTarget = $state<any | null>(null);

	function openCompleteModal(rental: any, garage: any) {
		completeTarget = {
			rental,
			garage
		};
	}

	function closeCompleteModal() {
		completeTarget = null;
	}

	// Modal Delete State
	let deleteGarageTarget = $state<any | null>(null);

	function openDeleteModal(g: any) {
		deleteGarageTarget = g;
	}

	function closeDeleteModal() {
		deleteGarageTarget = null;
	}

	// Format jenis kendaraan agar tepat (motor tampil sebagai Sepeda Motor, bukan Mobil Listrik)
	function getVehicleTypeLabel(type: string) {
		if (!type) return '-';
		const t = type.toLowerCase();
		if (t === 'sepeda') return 'Sepeda (Gowes)';
		if (t === 'sepeda_motor' || t === 'motor') return 'Sepeda Motor';
		if (t === 'mobil') return 'Mobil Bensin';
		if (t === 'mobil_listrik' || t === 'ev') return 'Mobil Listrik (EV)';
		return type;
	}

	// Filtered list slot garasi
	let filteredGarages = $derived.by(() => {
		return data.garages.filter((g: any) => {
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				!q ||
				g.code.toLowerCase().includes(q) ||
				(g.car_type && g.car_type.toLowerCase().includes(q)) ||
				(g.current_rental?.tenant_name && g.current_rental.tenant_name.toLowerCase().includes(q)) ||
				(g.current_rental?.vehicle_brand_model && g.current_rental.vehicle_brand_model.toLowerCase().includes(q)) ||
				(g.current_rental?.license_plate && g.current_rental.license_plate.toLowerCase().includes(q)) ||
				(g.next_booking?.tenant_name && g.next_booking.tenant_name.toLowerCase().includes(q)) ||
				(g.next_booking?.vehicle_brand_model && g.next_booking.vehicle_brand_model.toLowerCase().includes(q));

			const matchesType = filterType === 'all' || g.type === filterType;
			const isRented = Boolean(g.current_rental);
			const matchesStatus =
				filterStatus === 'all' ||
				(filterStatus === 'available' && !isRented) ||
				(filterStatus === 'used' && isRented);

			return matchesSearch && matchesType && matchesStatus;
		});
	});

	// Summary KPI Kapasitas Garasi
	let totalUnits = $derived(data.garages.length);
	let rentedUnits = $derived(data.garages.filter((g: any) => Boolean(g.current_rental)).length);
	let availableUnits = $derived(Math.max(0, totalUnits - rentedUnits));

	function formatRupiah(num: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
	}

	function formatDateIndo(dateStr: string) {
		if (!dateStr) return '-';
		const parts = dateStr.split('T')[0].split('-');
		if (parts.length !== 3) return dateStr;
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
		return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
	}
</script>

<svelte:head>
	<title>Kelola Kapasitas Slot Garasi - Admin GARTA Takalar</title>
</svelte:head>

<div class="space-y-6 py-2">
	<!-- Admin Header -->
	<div class="bg-white rounded-xl border border-[#DFD5C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover">
		<div>
			<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
				<Icon name="shield" size={14} />
				<span>Panel Administrasi GARTA Takalar</span>
			</div>
			<h1 class="text-xl font-extrabold text-[#383123] mt-1">Kelola Slot Garasi & Pengaturan Kapasitas</h1>
			<p class="text-xs text-[#6B5E45] mt-0.5 leading-relaxed">
				Kelola kapasitas slot tempat parkir/garasi, atur tarif sewa, pantau penyewa yang sedang parkir hari ini, cek booking berikutnya, serta selesaikan masa sewa kapan saja.
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
				<span>Daftar Slot Garasi ({totalUnits})</span>
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'create-single')}
				class="px-4 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'create-single' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="plus" size={14} />
				<span>+ Tambah 1 Slot</span>
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'create-batch')}
				class="px-3.5 py-2 text-xs font-bold rounded-lg border transition-all btn-interactive flex items-center gap-1.5 {activeTab === 'create-batch' ? 'bg-[#71856A] text-white border-[#71856A] shadow-xs' : 'bg-[#FAF8F4] text-[#4F4532] border-[#DFD5C2] hover:bg-[#EFE8D6]'}"
			>
				<Icon name="filter" size={13} />
				<span>Tambah Batch (Maks. 999)</span>
			</button>
		</div>
	</div>

	<!-- Alert Messages -->
	{#if form?.success}
		<div class="p-4 bg-[#EFF3ED] border border-[#C2CCBC] text-[#2E382A] rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="check" size={16} class="text-[#71856A] shrink-0" />
			<span>{form.message}</span>
		</div>
	{:else if form?.error}
		<div class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
			<Icon name="alert" size={16} class="text-rose-600 shrink-0" />
			<span>{form.error}</span>
		</div>
	{/if}

	<!-- 4 BENTO KPI STAT CARDS (DRIBBLE MODERN SAAS STYLE) -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="bg-white p-5 rounded-2xl border border-[#DFD5C2] shadow-xs card-hover flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold text-[#877758] uppercase tracking-wider">Total Kapasitas</span>
				<div class="w-8 h-8 rounded-lg bg-[#FAF8F4] border border-[#DFD5C2] text-[#4F4532] flex items-center justify-center">
					<Icon name="building" size={16} />
				</div>
			</div>
			<div class="mt-2">
				<div class="text-2xl font-extrabold font-mono text-[#383123]">{totalUnits} Slot</div>
				<span class="text-[10px] text-[#A08F6E] mt-0.5 block">Kapasitas garasi terdaftar</span>
			</div>
		</div>

		<div class="bg-white p-5 rounded-2xl border border-[#C2CCBC] shadow-xs card-hover flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold text-[#596A53] uppercase tracking-wider">Slot Siap Sewa</span>
				<div class="w-8 h-8 rounded-lg bg-[#EFF3ED] border border-[#DFE5DC] text-[#71856A] flex items-center justify-center">
					<Icon name="check" size={16} />
				</div>
			</div>
			<div class="mt-2">
				<div class="text-2xl font-extrabold font-mono text-[#596A53] flex items-center gap-1.5">
					<span>{availableUnits}</span>
					<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
				</div>
				<span class="text-[10px] text-[#71856A] mt-0.5 block">Kosong & siap dipakai</span>
			</div>
		</div>

		<div class="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs card-hover flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Sedang Terparkir</span>
				<div class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
					<Icon name="clock" size={16} />
				</div>
			</div>
			<div class="mt-2">
				<div class="text-2xl font-extrabold font-mono text-rose-700 flex items-center gap-1.5">
					<span>{rentedUnits}</span>
					{#if rentedUnits > 0}
						<span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
					{/if}
				</div>
				<span class="text-[10px] text-rose-600 mt-0.5 block">Digunakan penyewa hari ini</span>
			</div>
		</div>

		<div class="bg-white p-5 rounded-2xl border border-[#DFD5C2] shadow-xs card-hover flex flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-bold text-[#71856A] uppercase tracking-wider">Kategori Unit</span>
				<div class="w-8 h-8 rounded-lg bg-[#FAF8F4] border border-[#DFD5C2] text-[#71856A] flex items-center justify-center">
					<Icon name="filter" size={16} />
				</div>
			</div>
			<div class="mt-2 flex items-center gap-2 font-mono text-xs font-bold text-[#383123]">
				<span class="px-2 py-0.5 rounded bg-[#FAF8F4] border border-[#DFD5C2]" title="Roda Dua">{data.sequences.sepeda || 0} S</span>
				<span class="px-2 py-0.5 rounded bg-[#FAF8F4] border border-[#DFD5C2]" title="Mobil Bensin">{data.sequences.mobil || 0} C</span>
				<span class="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300" title="Listrik EV">{data.sequences.mobil_listrik || 0} E</span>
			</div>
		</div>
	</div>

	<!-- TAB 1: LIST DAFTAR SLOT GARASI, REVIEW SEWA, SELESAIKAN SEWA -->
	{#if activeTab === 'list'}
		<div class="space-y-4">
			<!-- Search & Filter Bar -->
			<div class="bg-white rounded-xl border border-[#DFD5C2] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 card-hover">
				<div class="flex-1 w-full md:w-auto">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari kode slot (S001, C001, E001), penyewa saat ini, booking berikutnya, plat nomor..."
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
					/>
				</div>

				<div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
					<select
						bind:value={filterType}
						class="px-3 py-2 text-xs border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus font-medium"
					>
						<option value="all">Semua Tipe Garasi</option>
						<option value="sepeda">Sepeda & Motor (Kode S)</option>
						<option value="mobil">Mobil Bensin (Kode C)</option>
						<option value="mobil_listrik">Mobil Listrik & SPKLU (Kode E)</option>
					</select>

					<select
						bind:value={filterStatus}
						class="px-3 py-2 text-xs border border-[#DFD5C2] rounded-lg bg-[#FCFAF4] input-focus font-medium"
					>
						<option value="all">Semua Status Slot</option>
						<option value="available">Tersedia (Bisa Disewa)</option>
						<option value="used">Sedang Disewa (Terisi)</option>
					</select>

					<!-- View Switcher -->
					<div class="flex items-center border border-[#DFD5C2] rounded-xl p-0.5 bg-[#FAF8F4]">
						<button
							type="button"
							onclick={() => (viewMode = 'grid')}
							class="px-2.5 py-1 text-xs font-bold rounded-lg transition {viewMode === 'grid' ? 'bg-[#383123] text-white shadow-xs' : 'text-[#6B5E45] hover:text-[#383123]'}"
							title="Tampilan Grid Parkir"
						>
							Grid
						</button>
						<button
							type="button"
							onclick={() => (viewMode = 'table')}
							class="px-2.5 py-1 text-xs font-bold rounded-lg transition {viewMode === 'table' ? 'bg-[#383123] text-white shadow-xs' : 'text-[#6B5E45] hover:text-[#383123]'}"
							title="Tampilan Tabel Rinci"
						>
							Tabel
						</button>
					</div>

					<button
						type="button"
						onclick={() => (activeTab = 'create-single')}
						class="px-3.5 py-2 bg-[#71856A] hover:bg-[#596A53] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 btn-interactive ml-auto md:ml-0"
					>
						<Icon name="plus" size={13} />
						<span>Tambah Slot</span>
					</button>
				</div>
			</div>

			{#if viewMode === 'grid'}
				<!-- GRID PARKIR VISUAL (DRIBBLE MODERN BAYS) -->
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{#if filteredGarages.length === 0}
						<div class="col-span-full bg-white rounded-2xl p-10 text-center text-[#A08F6E] border border-[#DFD5C2]">
							Tidak ada slot garasi yang sesuai dengan filter pencarian.
						</div>
					{:else}
						{#each filteredGarages as garage (garage.id)}
							{@const currentRental = garage.current_rental}
							{@const nextBooking = garage.next_booking}
							{@const isRented = Boolean(currentRental)}

							<div class="bg-white rounded-2xl border {isRented ? 'border-rose-300' : 'border-[#DFD5C2]'} shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden card-hover">
								<!-- Top Bar: Code, Type, Live Indicator -->
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="font-mono font-extrabold text-sm px-2.5 py-1 bg-[#242D21] text-white rounded-xl shadow-xs">
											{garage.code}
										</span>
										<span class="text-[10px] uppercase font-bold text-[#877758]">
											{garage.type === 'sepeda' ? 'Roda Dua' : garage.type === 'mobil' ? 'Mobil Bensin' : 'EV + SPKLU'}
										</span>
									</div>

									{#if isRented}
										<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
											<span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
											<span>Digunakan</span>
										</span>
									{:else}
										<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#EFF3ED] text-[#2E382A] border border-[#C2CCBC]">
											<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
											<span>Tersedia</span>
										</span>
									{/if}
								</div>

								<!-- Middle Area: Details & Tenant Card -->
								<div class="space-y-2">
									{#if isRented && currentRental}
										<div class="p-3.5 bg-[#FCFAF4] rounded-xl border border-[#DFD5C2] space-y-1.5">
											<div class="text-[9px] text-[#877758] uppercase font-bold tracking-wider">Penyewa Sekarang:</div>
											<div class="font-extrabold text-xs text-[#383123] truncate">{currentRental.tenant_name}</div>
											<div class="text-xs text-[#6B5E45] font-semibold flex items-center justify-between">
												<span>{currentRental.vehicle_brand_model}</span>
												{#if currentRental.license_plate}
													<span class="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#DFD5C2] font-bold text-[#242D21]">
														{currentRental.license_plate}
													</span>
												{/if}
											</div>
											<div class="text-[10px] font-mono text-rose-700 pt-1 border-t border-[#DFD5C2]/60">
												Sewa: s/d {formatDateIndo(currentRental.end_date)}
											</div>
										</div>
									{:else}
										<div class="p-3.5 bg-[#EFF3ED]/40 rounded-xl border border-[#DFE5DC] text-center space-y-1">
											<span class="text-xs font-bold text-[#596A53] block">Slot Kosong Siap Sewa</span>
											<div class="font-mono text-xs font-extrabold text-[#2E382A]">
												{formatRupiah(garage.daily_price)} / hari
											</div>
											<span class="text-[10px] text-[#877758] block">Bulanan: {formatRupiah(garage.daily_price * 25)}</span>
										</div>
									{/if}

									{#if nextBooking}
										<div class="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 leading-tight space-y-0.5">
											<span class="font-bold flex items-center gap-1">
												<Icon name="clock" size={11} />
												<span>Booking Selanjutnya:</span>
											</span>
											<div>{nextBooking.tenant_name} ({nextBooking.vehicle_brand_model})</div>
											<div class="font-mono text-amber-800">Mulai: {formatDateIndo(nextBooking.start_date)}</div>
										</div>
									{/if}
								</div>

								<!-- Bottom Actions Row -->
								<div class="pt-3 border-t border-[#F4EFE7] flex items-center justify-between gap-1.5">
									{#if isRented && currentRental}
										<button
											type="button"
											onclick={() => openReviewModal(garage, false)}
											class="px-2.5 py-1.5 bg-[#383123] hover:bg-[#4F4532] text-white rounded-lg font-bold text-[10px] transition flex items-center gap-1 shadow-xs btn-interactive"
											title="Review Data Sewa"
										>
											<Icon name="search" size={11} />
											<span>Review</span>
										</button>

										<button
											type="button"
											onclick={() => openCompleteModal(currentRental, garage)}
											class="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] transition flex items-center gap-1 shadow-xs btn-interactive"
											title="Selesaikan Masa Sewa"
										>
											<Icon name="check" size={11} />
											<span>Selesai</span>
										</button>
									{:else if nextBooking}
										<button
											type="button"
											onclick={() => openReviewModal(garage, true)}
											class="px-2.5 py-1.5 bg-[#FAF8F4] hover:bg-[#EAE3D4] text-[#383123] rounded-lg font-bold text-[10px] border border-[#DFD5C2] transition"
										>
											Booking
										</button>
									{/if}

									<button
										type="button"
										onclick={() => openEditModal(garage)}
										class="px-2.5 py-1.5 bg-[#FAF8F4] hover:bg-[#EAE3D4] text-[#383123] rounded-lg font-bold text-[10px] border border-[#DFD5C2] transition ml-auto"
									>
										Edit Tarif
									</button>

									{#if !isRented && !nextBooking}
										<button
											type="button"
											onclick={() => openDeleteModal(garage)}
											class="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[10px] border border-rose-200 transition"
											title="Hapus Slot"
										>
											✕
										</button>
									{/if}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			{:else}
				<!-- Main Table -->
				<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs overflow-hidden card-hover">
					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs">
							<thead class="bg-[#FAF8F4] text-[#6B5E45] border-b border-[#DFD5C2] uppercase font-bold text-[11px]">
								<tr>
									<th class="py-3.5 px-4">Kode Slot & Kategori</th>
									<th class="py-3.5 px-4">Identifikasi Garasi</th>
									<th class="py-3.5 px-4 text-right">Tarif Harian</th>
									<th class="py-3.5 px-4 text-right">Tarif Bulanan</th>
									<th class="py-3.5 px-4">Status & Keterisian Slot</th>
									<th class="py-3.5 px-4 text-center">Tindakan Admin</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-[#F4EFE7]">
								{#if filteredGarages.length === 0}
									<tr>
										<td colspan="6" class="p-8 text-center text-[#A08F6E] font-medium">
											Tidak ada slot garasi yang sesuai dengan filter pencarian.
										</td>
									</tr>
								{:else}
									{#each filteredGarages as garage (garage.id)}
										{@const currentRental = garage.current_rental}
										{@const nextBooking = garage.next_booking}
										{@const isRented = Boolean(currentRental)}
										<tr class="hover:bg-[#FAF8F4] transition">
											<!-- Kode Slot & Kategori -->
											<td class="py-3 px-4">
												<div class="flex items-center gap-2.5">
													<span class="font-mono font-extrabold text-xs px-2.5 py-1 bg-[#383123] text-white rounded-md border border-[#4F4532]">
														{garage.code}
													</span>
													<div>
														<span class="text-xs font-bold text-[#383123] block">
															{garage.type === 'sepeda' ? 'Garasi Sepeda / Motor' : garage.type === 'mobil' ? 'Garasi Mobil Bensin' : 'Garasi Mobil Listrik'}
														</span>
														<span class="text-[10px] uppercase font-bold text-[#877758]">
															{garage.car_type || 'Slot Standar'}
														</span>
													</div>
												</div>
											</td>

											<!-- Identifikasi Garasi / Fasilitas -->
											<td class="py-3 px-4">
												<div class="font-medium text-[#383123] text-xs">
													{garage.vehicle_name || `Slot Garasi ${garage.code}`}
												</div>
												{#if garage.type === 'mobil_listrik'}
													<div class="text-[10px] text-[#596A53] font-semibold flex items-center gap-1 mt-0.5">
														<Icon name="zap" size={11} />
														<span>Fasilitas SPKLU Wallbox ({formatRupiah(garage.electricity_price_kwh || 2500)}/kWh)</span>
													</div>
												{/if}
											</td>

											<!-- Tarif Harian -->
											<td class="py-3 px-4 text-right font-mono font-bold text-[#383123]">
												{formatRupiah(garage.daily_price)}
											</td>

											<!-- Tarif Bulanan -->
											<td class="py-3 px-4 text-right font-mono font-bold text-[#71856A]">
												{formatRupiah(garage.daily_price * 25)}
											</td>

											<!-- Status & Keterisian Slot: Penyewa Sekarang & Booking Selanjutnya -->
											<td class="py-3 px-4">
												{#if isRented && currentRental}
													<div class="space-y-1.5">
														<!-- Badge Status Parkir Aktif Hari Ini -->
														<div class="flex items-center gap-1.5">
															<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
																⛔ Sedang Digunakan (Aktif)
															</span>
														</div>
														
														<!-- Data Penyewa Hari Ini (Akurat) -->
														<div class="text-[11px] text-[#383123] font-bold">
															{currentRental.vehicle_brand_model}
															<span class="font-mono text-[#71856A] ml-1">({currentRental.license_plate || 'Bebas Plat'})</span>
															<span class="text-[10px] text-[#877758] block font-normal mt-0.2">
																Jenis: <strong class="text-[#383123]">{getVehicleTypeLabel(currentRental.vehicle_type)}</strong>
															</span>
														</div>
														<div class="text-[10px] text-[#6B5E45]">
															Penyewa Sekarang: <strong class="text-[#383123]">{currentRental.tenant_name}</strong>
															<span class="font-mono text-rose-700 block">s/d {formatDateIndo(currentRental.end_date)}</span>
														</div>

														<!-- Info Booking Selanjutnya jika ada -->
														{#if nextBooking}
															<div class="p-2 bg-[#FDFBF7] border border-[#DAC99B] rounded-lg text-[10px] text-[#8A7545] space-y-0.5 mt-1">
																<div class="font-bold flex items-center gap-1">
																	<Icon name="clock" size={11} />
																	<span>Booking Selanjutnya:</span>
																</div>
																<div>
																	<strong>{nextBooking.tenant_name}</strong> ({nextBooking.vehicle_brand_model})
																</div>
																<div class="font-mono text-[#877758]">
																	Mulai: {formatDateIndo(nextBooking.start_date)} s/d {formatDateIndo(nextBooking.end_date)}
																</div>
															</div>
														{/if}
													</div>
												{:else}
													<div class="space-y-1.5">
														<!-- Badge Status Kosong / Siap Pakai -->
														<span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EFF3ED] text-[#596A53] border border-[#DFE5DC]">
															● Tersedia (Siap Sewa)
														</span>

														<!-- Info Booking Masa Depan jika ada -->
														{#if nextBooking}
															<div class="p-2 bg-[#FAF8F4] border border-[#DFD5C2] rounded-lg text-[10px] text-[#6B5E45] space-y-0.5">
																<div class="font-bold text-[#877758] flex items-center gap-1">
																	<Icon name="calendar" size={11} />
																	<span>Jadwal Booking Berikutnya:</span>
																</div>
																<div>
																	<strong>{nextBooking.tenant_name}</strong> ({nextBooking.vehicle_brand_model})
																</div>
																<div class="font-mono text-[#71856A] font-semibold">
																	Mulai: {formatDateIndo(nextBooking.start_date)} s/d {formatDateIndo(nextBooking.end_date)}
																</div>
															</div>
														{/if}
													</div>
												{/if}
											</td>

											<!-- Tindakan Admin -->
											<td class="py-3 px-4 text-center">
												<div class="inline-flex flex-col sm:flex-row items-center gap-1.5">
													{#if isRented && currentRental}
														<!-- Tombol Review Penyewa Sekarang (Read-Only) -->
														<button
															type="button"
															onclick={() => openReviewModal(garage, false)}
															class="px-2.5 py-1 bg-[#383123] hover:bg-[#4F4532] text-white rounded-md font-bold text-[11px] transition btn-interactive flex items-center gap-1 shadow-xs"
															title="Review Detail Penyewa Hari Ini (Read-Only)"
														>
															<Icon name="search" size={11} />
															<span>Review</span>
														</button>

														<!-- Tombol Selesaikan Sewa (Check-out oleh Admin) -->
														<button
															type="button"
															onclick={() => openCompleteModal(currentRental, garage)}
															class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-[11px] transition btn-interactive flex items-center gap-1 shadow-xs"
															title="Selesaikan masa sewa penyewa sekarang (Check-out)"
														>
															<Icon name="check" size={11} />
															<span>Selesaikan</span>
														</button>
													{:else if nextBooking}
														<!-- Tombol Review Booking Berikutnya -->
														<button
															type="button"
															onclick={() => openReviewModal(garage, true)}
															class="px-2 py-1 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] rounded-md font-bold text-[11px] border border-[#DFD5C2] transition flex items-center gap-1"
															title="Review Detail Booking Selanjutnya"
														>
															<Icon name="calendar" size={11} />
															<span>Review Booking</span>
														</button>
													{/if}

													<!-- Tombol Edit Tarif Slot Garasi -->
													<button
														type="button"
														onclick={() => openEditModal(garage)}
														class="px-2.5 py-1 bg-[#EFF3ED] hover:bg-[#DFE5DC] text-[#2E382A] rounded-md font-bold text-[11px] border border-[#C2CCBC] transition btn-interactive flex items-center gap-1"
														title="Edit Tarif Sewa Garasi"
													>
														<span>Edit Tarif</span>
													</button>

													<!-- Tombol Hapus (Hanya jika tidak ada sewa/booking sama sekali) -->
													{#if !isRented && !nextBooking}
														<button
															type="button"
															onclick={() => openDeleteModal(garage)}
															class="px-2 py-1 bg-[#FAF8F4] hover:bg-rose-50 text-[#877758] hover:text-rose-700 rounded-md font-bold text-[11px] border border-[#DFD5C2] hover:border-rose-300 transition btn-interactive"
															title="Hapus Slot Garasi"
														>
															✕
														</button>
													{/if}
												</div>
											</td>
										</tr>
									{/each}
								{/if}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- TAB 2: TAMBAH 1 SLOT GARASI -->
	{#if activeTab === 'create-single'}
		<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs p-6 space-y-6 card-hover">
			<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
				<div>
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="plus" size={15} class="text-[#71856A]" />
						<span>Formulir Penambahan Slot Garasi Baru</span>
					</h2>
					<p class="text-[11px] text-[#6B5E45] mt-0.5">
						Menambah kapasitas slot tempat parkir/garasi. Kode slot digenerate otomatis berurutan secara unik dan terkunci dari sistem.
					</p>
				</div>
				<button
					type="button"
					onclick={() => (activeTab = 'list')}
					class="text-xs text-[#71856A] font-bold hover:underline"
				>
					← Kembali ke Daftar Slot
				</button>
			</div>

			<form method="POST" action="?/createGarage" class="space-y-5">
				<div>
					<span class="block text-xs font-bold text-[#4F4532] mb-2">
						Pilih Kategori Slot Garasi Yang Ingin Ditambahkan <span class="text-rose-600">*</span>
					</span>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<button
							type="button"
							onclick={() => (singleType = 'sepeda')}
							class="p-4 rounded-xl border text-left transition-all btn-interactive {singleType === 'sepeda' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="font-bold text-xs flex items-center justify-between">
								<span>Garasi Sepeda & Motor</span>
								<span class="font-mono text-[10px] px-2 py-0.5 bg-white rounded border border-[#DFD5C2]">Prefix S</span>
							</div>
							<div class="text-[11px] text-[#71856A] mt-1">Tarif Standar: Rp 20.000 / hari (Rp 500rb/bln)</div>
						</button>

						<button
							type="button"
							onclick={() => (singleType = 'mobil')}
							class="p-4 rounded-xl border text-left transition-all btn-interactive {singleType === 'mobil' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="font-bold text-xs flex items-center justify-between">
								<span>Garasi Mobil Bensin</span>
								<span class="font-mono text-[10px] px-2 py-0.5 bg-white rounded border border-[#DFD5C2]">Prefix C</span>
							</div>
							<div class="text-[11px] text-[#877758] mt-1">Tarif Standar: Rp 50.000 / hari (Rp 1,25jt/bln)</div>
						</button>

						<button
							type="button"
							onclick={() => (singleType = 'mobil_listrik')}
							class="p-4 rounded-xl border text-left transition-all btn-interactive {singleType === 'mobil_listrik' ? 'bg-[#EFF3ED] border-[#71856A] text-[#2E382A] ring-2 ring-[#71856A]' : 'bg-[#FAF8F4] border-[#DFD5C2] text-[#6B5E45]'}"
						>
							<div class="font-bold text-xs flex items-center justify-between">
								<span>Garasi Mobil Listrik & SPKLU</span>
								<span class="font-mono text-[10px] px-2 py-0.5 bg-white rounded border border-[#DFD5C2]">Prefix E</span>
							</div>
							<div class="text-[11px] text-[#596A53] mt-1">Tarif Standar: Rp 75.000 / hari + Cas Listrik</div>
						</button>
					</div>
					<input type="hidden" name="type" value={singleType} />
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-[#FAF8F4] rounded-xl border border-[#DFD5C2]">
					<div>
						<label for="singleCode" class="block text-xs font-bold text-[#4F4532] mb-1">
							Kode Slot Garasi (Auto-Generate dari Sistem)
						</label>
						<div class="relative">
							<input
								type="text"
								id="singleCode"
								value={singleCode}
								readonly
								class="w-full px-3.5 py-2.5 text-sm border border-[#DFD5C2] rounded-lg bg-[#EFE8D6] text-[#383123] font-mono font-extrabold tracking-wider cursor-not-allowed select-none"
							/>
							<span class="absolute right-2.5 top-2.5 px-2 py-0.5 bg-[#71856A] text-white text-[10px] font-bold rounded">
								Auto Locked
							</span>
						</div>
					</div>

					<div>
						<label for="singleDailyPrice" class="block text-xs font-bold text-[#4F4532] mb-1">
							Tarif Sewa Garasi Harian (Rp) <span class="text-rose-600">*</span>
						</label>
						<input
							type="number"
							id="singleDailyPrice"
							name="dailyPrice"
							bind:value={singleDailyPrice}
							min="5000"
							step="5000"
							required
							class="w-full px-3.5 py-2.5 text-sm border border-[#DFD5C2] rounded-lg input-focus bg-white font-mono font-bold"
						/>
						<span class="text-[11px] text-[#71856A] font-mono mt-1 block">
							Estimasi Tarif Bulanan: <strong>{formatRupiah(singleDailyPrice * 25)}</strong>
						</span>
					</div>

					{#if singleType === 'mobil_listrik'}
						<div class="md:col-span-2 bg-[#EFF3ED] border border-[#C2CCBC] p-4 rounded-xl">
							<label for="singleElectricityPrice" class="block text-xs font-bold text-[#2E382A] mb-1">
								Tarif Pengisian Listrik SPKLU Wallbox per kWh (Rp) <span class="text-rose-600">*</span>
							</label>
							<input
								type="number"
								id="singleElectricityPrice"
								name="electricityPrice"
								bind:value={singleElectricityPrice}
								min="0"
								step="100"
								required
								class="w-full max-w-xs px-3 py-2 text-xs border border-[#71856A] rounded-lg bg-white font-mono font-bold"
							/>
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
						<span>Simpan Slot Garasi Baru</span>
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- TAB 3: BATCH GENERATION -->
	{#if activeTab === 'create-batch'}
		<div class="bg-white rounded-xl border border-[#DFD5C2] shadow-xs p-6 space-y-5 card-hover">
			<div class="border-b border-[#F4EFE7] pb-3 flex items-center justify-between">
				<div>
					<h2 class="text-xs font-bold text-[#383123] uppercase tracking-wider flex items-center gap-2">
						<Icon name="filter" size={15} class="text-[#71856A]" />
						<span>Penambahan Banyak Slot Garasi Sekaligus (Batch)</span>
					</h2>
					<p class="text-[11px] text-[#6B5E45] mt-0.5">
						Membuat banyak kapasitas slot garasi sekaligus (1 s/d 999 slot) dengan penomoran kode otomatis bertambah.
					</p>
				</div>
				<button
					type="button"
					onclick={() => (activeTab = 'list')}
					class="text-xs text-[#71856A] font-bold hover:underline"
				>
					← Kembali ke Daftar Slot
				</button>
			</div>

			<form method="POST" action="?/createBatchGarages" class="space-y-5">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="batchType" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Kategori Tipe Garasi <span class="text-rose-600">*</span>
						</label>
						<select
							id="batchType"
							name="type"
							bind:value={batchType}
							class="w-full px-3.5 py-2.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-medium"
						>
							<option value="sepeda">Sepeda & Motor (Kode S)</option>
							<option value="mobil">Mobil Bensin (Kode C)</option>
							<option value="mobil_listrik">Mobil Listrik & SPKLU (Kode E)</option>
						</select>
					</div>

					<div>
						<label for="batchCount" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Jumlah Slot Garasi <span class="text-rose-600">*(1 - 999 Slot)</span>
						</label>
						<input
							type="number"
							id="batchCount"
							name="count"
							bind:value={batchCount}
							min="1"
							max="999"
							required
							class="w-full px-3.5 py-2.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
						/>
					</div>

					<div>
						<label for="batchDailyPrice" class="block text-xs font-bold text-[#4F4532] mb-1.5">
							Tarif Harian per Slot (Rp) <span class="text-rose-600">*</span>
						</label>
						<input
							type="number"
							id="batchDailyPrice"
							name="dailyPrice"
							bind:value={batchDailyPrice}
							min="5000"
							step="5000"
							required
							class="w-full px-3.5 py-2.5 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
						/>
					</div>

					{#if batchType === 'mobil_listrik'}
						<div class="md:col-span-3 bg-[#EFF3ED] border border-[#C2CCBC] p-4 rounded-xl">
							<label for="batchElectricityPrice" class="block text-xs font-bold text-[#2E382A] mb-1">
								Tarif Listrik SPKLU per kWh (Rp) <span class="text-rose-600">*</span>
							</label>
							<input
								type="number"
								id="batchElectricityPrice"
								name="electricityPrice"
								bind:value={batchElectricityPrice}
								min="0"
								step="100"
								required
								class="w-full max-w-xs px-3 py-2 text-xs border border-[#71856A] rounded-lg bg-white font-mono font-bold"
							/>
						</div>
					{/if}
				</div>

				<div class="bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
					<div>
						<span class="text-[#877758] font-medium">Estimasi Kode Slot Garasi Dihasilkan:</span>
						<span class="ml-2 font-mono font-extrabold text-[#383123] bg-white px-3 py-1 rounded-md border border-[#DFD5C2] shadow-xs">
							{nextBatchPreview}
						</span>
					</div>
					<button
						type="submit"
						class="px-5 py-2.5 bg-[#71856A] hover:bg-[#596A53] text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-2 btn-interactive"
					>
						<Icon name="plus" size={14} />
						<span>Generate & Simpan Batch Slot</span>
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>

<!-- ================= MODAL EDIT: HANYA MENGEDIT TARIF GARASI ================= -->
{#if editGarage}
	<div class="fixed inset-0 z-50 bg-[#252016]/50 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl border border-[#DFD5C2] max-w-md w-full p-6 space-y-5 shadow-xl animate-in fade-in zoom-in-95">
			<div class="flex items-center justify-between border-b border-[#F4EFE7] pb-3">
				<div>
					<h3 class="text-sm font-extrabold text-[#383123] flex items-center gap-2">
						<Icon name="building" size={16} class="text-[#71856A]" />
						<span>Edit Tarif Slot Garasi {editGarage.code}</span>
					</h3>
					<p class="text-[11px] text-[#6B5E45] mt-0.5">
						Sesuai ketentuan, Anda hanya dapat mengubah tarif sewa garasi.
					</p>
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

				<div class="p-3 bg-[#FAF8F4] rounded-xl border border-[#DFD5C2] flex items-center justify-between text-xs">
					<div>
						<span class="text-[#877758] block text-[10px] uppercase font-bold">Kode Slot</span>
						<span class="font-mono font-extrabold text-sm text-[#383123]">{editGarage.code}</span>
					</div>
					<div class="text-right">
						<span class="text-[#877758] block text-[10px] uppercase font-bold">Kategori Garasi</span>
						<span class="font-bold text-[#71856A] uppercase text-xs">{editGarage.type.replace('_', ' ')}</span>
					</div>
				</div>

				<div>
					<label for="editDailyPrice" class="block text-xs font-bold text-[#4F4532] mb-1">
						Tarif Sewa Harian (Rp) <span class="text-rose-600">*</span>
					</label>
					<input
						type="number"
						id="editDailyPrice"
						name="dailyPrice"
						bind:value={editDailyPrice}
						min="5000"
						step="5000"
						required
						class="w-full px-3.5 py-2 text-xs border border-[#DFD5C2] rounded-lg input-focus bg-[#FCFAF4] font-mono font-bold"
					/>
					<span class="text-[11px] text-[#71856A] font-mono mt-1 block">
						Estimasi Bulanan: {formatRupiah(editDailyPrice * 25)}
					</span>
				</div>

				{#if editGarage.type === 'mobil_listrik'}
					<div class="bg-[#EFF3ED] border border-[#C2CCBC] p-3 rounded-xl">
						<label for="editElectricityPrice" class="block text-xs font-bold text-[#2E382A] mb-1">
							Tarif Cas Listrik SPKLU / kWh (Rp) <span class="text-rose-600">*</span>
						</label>
						<input
							type="number"
							id="editElectricityPrice"
							name="electricityPrice"
							bind:value={editElectricityPrice}
							min="0"
							step="100"
							required
							class="w-full px-3 py-1.5 text-xs border border-[#71856A] rounded-lg bg-white font-mono font-bold"
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
						<span>Simpan Tarif</span>
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ================= MODAL SELESAIKAN SEWA (CHECK-OUT ADMIN) ================= -->
{#if completeTarget}
	<div class="fixed inset-0 z-50 bg-[#252016]/50 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl border border-amber-300 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
					<Icon name="check" size={20} />
				</div>
				<div>
					<h3 class="text-sm font-extrabold text-[#383123]">Konfirmasi Selesaikan Sewa Garasi</h3>
					<p class="text-xs text-[#6B5E45]">Apakah Anda ingin menyelesaikan masa sewa slot garasi ini sekarang?</p>
				</div>
			</div>

			<div class="p-3.5 bg-[#FAF8F4] rounded-xl border border-[#DFD5C2] space-y-1.5 text-xs">
				<div class="flex justify-between font-mono">
					<span class="text-[#877758]">Kode Slot:</span>
					<span class="font-bold text-[#383123]">{completeTarget.garage.code}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#877758]">Penyewa:</span>
					<span class="font-extrabold text-[#383123]">{completeTarget.rental.tenant_name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#877758]">Kendaraan:</span>
					<span class="font-semibold text-[#71856A]">{completeTarget.rental.vehicle_brand_model} ({completeTarget.rental.license_plate || 'Bebas Plat'})</span>
				</div>
				<div class="flex justify-between font-mono">
					<span class="text-[#877758]">Periode Selesai:</span>
					<span class="font-bold text-rose-700">{formatDateIndo(completeTarget.rental.end_date)}</span>
				</div>
			</div>

			{#if completeTarget.garage.next_booking}
				<div class="p-3 bg-[#EFF3ED] border border-[#C2CCBC] text-[#2E382A] rounded-lg text-xs space-y-1">
					<div class="font-bold flex items-center gap-1 text-[#54674E]">
						<Icon name="calendar" size={13} />
						<span>Antrean Booking Berikutnya Terdeteksi:</span>
					</div>
					<div>
						Penyewa berikutnya: <strong>{completeTarget.garage.next_booking.tenant_name}</strong> ({completeTarget.garage.next_booking.vehicle_brand_model})
					</div>
					<div class="text-[11px] text-[#6B5E45]">
						Mulai tanggal {formatDateIndo(completeTarget.garage.next_booking.start_date)}. Setelah Anda selesaikan, slot ini siap untuk penyewa tersebut.
					</div>
				</div>
			{:else}
				<p class="text-[11px] text-[#6B5E45] italic">
					* Setelah diselesaikan, slot garasi akan langsung berstatus kosong (tersedia) untuk disewa kembali oleh customer lain.
				</p>
			{/if}

			<form method="POST" action="?/completeRental" class="pt-2 flex justify-end gap-2.5">
				<input type="hidden" name="rentalId" value={completeTarget.rental.rental_id} />
				<button
					type="button"
					onclick={closeCompleteModal}
					class="px-4 py-2 bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] font-bold rounded-lg text-xs border border-[#DFD5C2]"
				>
					Batal
				</button>
				<button
					type="submit"
					class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-1.5 btn-interactive"
				>
					<Icon name="check" size={14} />
					<span>Ya, Selesaikan Sewa</span>
				</button>
			</form>
		</div>
	</div>
{/if}

<!-- ================= MODAL REVIEW SEWA (READ-ONLY) ================= -->
{#if reviewRental && reviewGarage}
	<div class="fixed inset-0 z-50 bg-[#252016]/50 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl border border-[#DFD5C2] max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
			<!-- Header Modal Review -->
			<div class="flex items-center justify-between border-b border-[#F4EFE7] pb-3">
				<div>
					<div class="flex items-center gap-2">
						<span class="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-[#383123] text-white">
							{reviewGarage.code}
						</span>
						{#if isReviewingNextBooking}
							<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
								📅 Jadwal Booking Selanjutnya
							</span>
						{:else}
							<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
								🔒 Review Penyewa Sedang Parkir (Read-Only)
							</span>
						{/if}
					</div>
					<h3 class="text-base font-extrabold text-[#383123] mt-1">
						{isReviewingNextBooking ? 'Detail Antrean Booking Berikutnya' : 'Detail Kontrak Sewa Slot Garasi'}
					</h3>
					<p class="text-[11px] text-[#6B5E45]">
						Informasi lengkap identitas penyewa, kendaraan yang dititipkan, serta rincian pembayaran.
					</p>
				</div>
				<button
					type="button"
					onclick={closeReviewModal}
					class="w-7 h-7 rounded-lg bg-[#FAF8F4] hover:bg-[#EFE8D6] text-[#4F4532] flex items-center justify-center font-bold text-xs"
				>
					✕
				</button>
			</div>

			<!-- 1. DATA PENYEWA -->
			<div class="bg-[#FAF8F4] border border-[#DFD5C2] rounded-xl p-4 space-y-2.5">
				<div class="flex items-center gap-2 text-xs font-bold text-[#877758] uppercase tracking-wider">
					<Icon name="user" size={14} />
					<span>1. Identitas Penyewa</span>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
					<div>
						<span class="text-[#877758] text-[10px] block">Nama Lengkap</span>
						<span class="font-extrabold text-[#383123] text-sm">{reviewRental.tenant_name}</span>
					</div>
					<div>
						<span class="text-[#877758] text-[10px] block">Nomor Induk Kependudukan (NIK)</span>
						<span class="font-mono font-bold text-[#383123]">{reviewRental.tenant_nik || '-'}</span>
					</div>
					<div>
						<span class="text-[#877758] text-[10px] block">Nomor Telepon / WhatsApp</span>
						<span class="font-mono font-bold text-[#71856A]">{reviewRental.tenant_phone || '-'}</span>
					</div>
					<div>
						<span class="text-[#877758] text-[10px] block">Email Terdaftar</span>
						<span class="font-mono text-[#383123]">{reviewRental.tenant_email}</span>
					</div>
				</div>
			</div>

			<!-- 2. DATA KENDARAAN PENYEWA (PERBAIKAN TIPE KENDARAAN MOTOR) -->
			<div class="bg-white border border-[#DFD5C2] rounded-xl p-4 space-y-2.5 shadow-xs">
				<div class="flex items-center gap-2 text-xs font-bold text-[#71856A] uppercase tracking-wider">
					<Icon name="shield" size={14} />
					<span>2. Detail Kendaraan di Garasi</span>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
					<div>
						<span class="text-[#877758] text-[10px] block">Jenis Kendaraan</span>
						<span class="font-bold text-[#383123] uppercase">
							{getVehicleTypeLabel(reviewRental.vehicle_type)}
						</span>
					</div>
					<div>
						<span class="text-[#877758] text-[10px] block">Merek & Tipe Kendaraan</span>
						<span class="font-bold text-[#383123] text-sm">{reviewRental.vehicle_brand_model}</span>
					</div>
					<div>
						<span class="text-[#877758] text-[10px] block">Nomor Plat Polisi</span>
						<span class="inline-block px-3 py-1 bg-[#383123] text-white font-mono font-extrabold rounded-md text-xs mt-0.5">
							{reviewRental.license_plate || 'BEBAS PLAT'}
						</span>
					</div>
					{#if reviewRental.battery_capacity_kwh > 0}
						<div>
							<span class="text-[#877758] text-[10px] block">Kapasitas Baterai Listrik</span>
							<span class="font-mono font-bold text-[#596A53]">{reviewRental.battery_capacity_kwh} kWh</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- 3. PERIODE DAN RINCIAN BIAYA -->
			<div class="bg-[#EFF3ED] border border-[#C2CCBC] rounded-xl p-4 space-y-2.5">
				<div class="flex items-center gap-2 text-xs font-bold text-[#2E382A] uppercase tracking-wider">
					<Icon name="clock" size={14} />
					<span>3. Periode & Finansial Sewa</span>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
					<div>
						<span class="text-[#596A53] text-[10px] block">Tanggal Mulai Sewa</span>
						<span class="font-mono font-bold text-[#2E382A]">{formatDateIndo(reviewRental.start_date)}</span>
					</div>
					<div>
						<span class="text-[#596A53] text-[10px] block">Tanggal Selesai (Batas Akhir)</span>
						<span class="font-mono font-bold text-rose-700">{formatDateIndo(reviewRental.end_date)}</span>
					</div>
					<div>
						<span class="text-[#596A53] text-[10px] block">Durasi Masa Sewa</span>
						<span class="font-bold text-[#2E382A]">{reviewRental.duration_days} Hari</span>
					</div>
					<div>
						<span class="text-[#596A53] text-[10px] block">Total Pembayaran Sewa</span>
						<span class="font-mono font-extrabold text-base text-[#2E382A]">
							{formatRupiah(reviewRental.total_cost)}
						</span>
					</div>
				</div>

				{#if reviewRental.payment_proof}
					<div class="mt-3 pt-3 border-t border-[#C2CCBC]">
						<span class="text-[#2E382A] text-xs font-bold block mb-2">Pratinjau Bukti Pembayaran:</span>
						<div class="border border-[#71856A] rounded-lg overflow-hidden max-w-xs bg-white">
							<img
								src={reviewRental.payment_proof}
								alt="Bukti Pembayaran"
								class="w-full h-auto max-h-48 object-contain"
							/>
						</div>
					</div>
				{/if}
			</div>

			<!-- 4. KARTU INFORMASI BOOKING BERIKUTNYA (JIKA ADA) -->
			{#if !isReviewingNextBooking && reviewGarage.next_booking}
				<div class="p-3.5 bg-[#FDFBF7] border border-[#DAC99B] rounded-xl text-xs space-y-1">
					<div class="font-bold text-[#8A7545] flex items-center gap-1.5">
						<Icon name="calendar" size={13} />
						<span>Antrean Booking Berikutnya Pada Slot Ini:</span>
					</div>
					<div class="text-[#383123]">
						Dipesan oleh: <strong>{reviewGarage.next_booking.tenant_name}</strong> ({reviewGarage.next_booking.vehicle_brand_model} - {reviewGarage.next_booking.license_plate || 'Bebas Plat'})
					</div>
					<div class="font-mono text-[#877758]">
						Jadwal: {formatDateIndo(reviewGarage.next_booking.start_date)} s/d {formatDateIndo(reviewGarage.next_booking.end_date)}
					</div>
				</div>
			{/if}

			<!-- Footer Modal: Hanya Tombol Tutup (Read-Only) -->
			<div class="pt-3 border-t border-[#F4EFE7] flex items-center justify-between">
				<span class="text-[11px] text-[#877758] italic flex items-center gap-1">
					<Icon name="shield" size={12} />
					<span>Data hanya dapat dilihat (read-only).</span>
				</span>
				<button
					type="button"
					onclick={closeReviewModal}
					class="px-5 py-2 bg-[#383123] hover:bg-[#4F4532] text-white font-bold rounded-lg text-xs transition shadow-xs btn-interactive"
				>
					Tutup Review
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- ================= DELETE MODAL ================= -->
{#if deleteGarageTarget}
	<div class="fixed inset-0 z-50 bg-[#252016]/50 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl border border-rose-200 max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
					<Icon name="alert" size={20} />
				</div>
				<div>
					<h3 class="text-sm font-extrabold text-[#383123]">Konfirmasi Hapus Slot Garasi</h3>
					<p class="text-xs text-[#6B5E45]">Apakah Anda yakin ingin menghapus slot garasi ini?</p>
				</div>
			</div>

			<div class="p-3.5 bg-[#FAF8F4] rounded-xl border border-[#DFD5C2] space-y-1 text-xs font-mono">
				<div class="flex justify-between">
					<span class="text-[#877758]">Kode Slot:</span>
					<span class="font-bold text-[#383123]">{deleteGarageTarget.code}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#877758]">Kategori:</span>
					<span class="font-semibold text-[#383123]">{deleteGarageTarget.car_type || deleteGarageTarget.type}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#877758]">Tarif Harian:</span>
					<span class="font-bold text-[#71856A]">{formatRupiah(deleteGarageTarget.daily_price)}</span>
				</div>
			</div>

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
					class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-1.5 btn-interactive"
				>
					<Icon name="x" size={13} />
					<span>Ya, Hapus Slot</span>
				</button>
			</form>
		</div>
	</div>
{/if}
