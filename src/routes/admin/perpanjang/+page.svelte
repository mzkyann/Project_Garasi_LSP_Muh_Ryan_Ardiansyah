<!-- src/routes/admin/perpanjang/+page.svelte -->
<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
</script>

<svelte:head>
	<title>Perpanjang Sewa - SIM-GARASI</title>
</svelte:head>

<div class="max-w-md mx-auto my-12 p-8 bg-white rounded-xl border border-[#DFD5C2] shadow-xs text-center space-y-4">
	<div class="w-12 h-12 rounded-full bg-[#EFF3ED] text-[#71856A] flex items-center justify-center mx-auto border border-[#DFE5DC]">
		<Icon name="clock" size={22} />
	</div>
	<h2 class="text-base font-bold text-[#383123]">Pusat Persetujuan & Perpanjangan Sewa</h2>
	<p class="text-xs text-[#6B5E45] leading-relaxed">
		Seluruh permohonan perpanjangan dan persetujuan sewa kini dikelola langsung melalui halaman Persetujuan Sewa (ACC).
	</p>
	<div class="pt-2">
		<a
			href="/admin/persetujuan"
			class="inline-flex items-center gap-2 px-4 py-2 bg-[#71856A] hover:bg-[#596A53] text-white text-xs font-bold rounded-lg transition btn-interactive"
		>
			<span>Buka Halaman Persetujuan & ACC</span>
			<Icon name="arrow-right" size={13} />
		</a>
	</div>
</div>
