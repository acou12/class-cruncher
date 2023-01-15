<script lang="ts">
	import './assets/style.scss';
	import { goto } from '$app/navigation';
	import {
		type SerializedSchedule,
		deserialize,
		initialize,
		serialize,
		courses,
		Course
	} from '$lib/schedule';
	import { schedules, selectedCourses } from '$lib/stores';
	import { onMount } from 'svelte';
	import sections from './assets/data.json?raw';
	import coordinates from './assets/coordinates.json?raw';

	import { fade } from 'svelte/transition';

	let loaded = false;
	let takingLongerThanUsual = false;

	onMount(() => {
		setTimeout(() => {
			if (!loaded) {
				takingLongerThanUsual = true;
			}
		}, 3000);
		initialize(JSON.parse(sections), JSON.parse(coordinates));

		const savedSchedulesString = localStorage.getItem('schedules');
		if (savedSchedulesString === null) {
			goto('/');
		} else {
			const savedSchedules: SerializedSchedule[] = JSON.parse(savedSchedulesString);
			$schedules = savedSchedules.map(deserialize);
		}
		schedules.subscribe(() => {
			if ($schedules !== undefined) {
				localStorage.setItem('schedules', JSON.stringify($schedules.map(serialize)));
			}
		});

		const savedCourseStrings = localStorage.getItem('courses');
		if (savedCourseStrings === null) {
			goto('/');
		} else {
			const savedCourses: Course[] = (JSON.parse(savedCourseStrings) as string[])
				.map((name) => courses.find((course) => course.name === name))
				.map((course) => course!);
			$selectedCourses = savedCourses;
		}
		selectedCourses.subscribe(() => {
			localStorage.setItem(
				'courses',
				JSON.stringify($selectedCourses.map((course) => course.name))
			);
		});

		loaded = true;
	});
</script>

{#if loaded}
	<slot />
{:else if takingLongerThanUsual}
	<div in:fade>
		<p>Loading...</p>
		<p>Sorry, this is taking longer than usual.</p>
	</div>
{/if}
