<script lang="ts">
	import { goto } from '$app/navigation';
	import { deserialize } from '$lib/schedule';
	import { schedules } from '$lib/stores';
	import { onDataLoaded } from '$lib/util';
	import { onMount } from 'svelte';

	export let data: { code: string };

	onDataLoaded(() => {
		const schedule = deserialize(JSON.parse(data.code));
		schedules.set([schedule, ...$schedules!]);
		goto('/schedule/0');
	});
</script>
