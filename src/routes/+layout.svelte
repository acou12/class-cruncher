<script lang="ts">
	import './assets/style.scss';
	import { goto } from '$app/navigation';
	import { serialize, type SerializedSchedule, deserialize, initialize } from '$lib/schedule';
	import { schedules } from '$lib/stores';
	import { onMount } from 'svelte';
	import sections from './assets/data.json?raw';
	import coordinates from './assets/coordinates.json?raw';

	onMount(() => {
		initialize(JSON.parse(sections), JSON.parse(coordinates));
		const savedSchedulesString = localStorage.getItem('data') as null;
		if (savedSchedulesString === null) {
			goto('/');
		} else {
			const savedSchedules: { schedules: SerializedSchedule[] } = JSON.parse(savedSchedulesString);
			schedules.set(savedSchedules.schedules.map(deserialize));
		}
	});
</script>

<slot />
