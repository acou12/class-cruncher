<script lang="ts">
	import { goto } from '$app/navigation';
	import { deserialize } from '$lib/schedule';
	import { schedules } from '$lib/stores';
	import { onMount } from 'svelte';

	export let data: { code: string };

	onMount(() => {
		const schedule = deserialize(JSON.parse(data.code));
		$schedules = [schedule, ...$schedules!];
		goto('/schedule/0');
	});
</script>
