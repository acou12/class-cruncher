<script lang="ts">
	import './assets/style.scss';
	import { onMount } from 'svelte';
	import { fixedTime, humanTime, unique } from '$lib/util';
	import ScheduleComponent from './components/ScheduleComponent.svelte';
	import FullscreenComponent from './components/FullscreenComponent.svelte';
	import sections from './assets/data.json?raw';
	import {
		deserialize,
		generateSchedules,
		initialize,
		Meeting,
		randomSchedule,
		Schedule,
		sortingHeuristics,
		type SerializedSchedule
	} from '$lib/schedule';
	import type { Input as GenerateSchedulesInput } from '$lib/workers/generateSchedules';
	import Spinner from './components/Spinner.svelte';

	let schedules: Schedule[] | undefined = undefined;

	let focused: number | undefined;
	$: focusedSchedule = focused === undefined ? undefined : schedules![focused];

	let schedulesWorkers: Worker;

	let progress: number = 0;
	let finalProgressTimeout: NodeJS.Timeout;

	onMount(async () => {
		initialize(JSON.parse(sections));
		generate();
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				focused = undefined;
			}
		});
	});

	const sort = () => {
		if (schedules === undefined) return;

		const heuristic: (schedule: Schedule) => number = sortingHeuristics.find(
			(sh) => sh.name === sortSelect.value
		)!.sort;

		schedules.sort((x, y) => heuristic(x) - heuristic(y));
		schedules = schedules;
	};

	type SmartBreak = {
		name: string;
		days: string;
		options: {
			startTime: number;
			endTime: number;
		}[];
	};

	const breaks: SmartBreak[] = [
		// {
		// 	name: 'lunch',
		// 	days: 'MTWRF',
		// 	options: [
		// 		...[...Array(3).keys()]
		// 			.map((n) => [
		// 				{
		// 					startTime: fixedTime(1100 + 100 * n),
		// 					endTime: fixedTime(1100 + 100 * n + 30)
		// 				},
		// 				{
		// 					startTime: fixedTime(1130 + 100 * n),
		// 					endTime: fixedTime(1130 + 100 * n + 30)
		// 				}
		// 			])
		// 			.flat()
		// 	]
		// },
		// {
		// 	name: 'cpc',
		// 	days: 'W',
		// 	options: [
		// 		{
		// 			startTime: fixedTime(1730),
		// 			endTime: fixedTime(1800)
		// 		}
		// 	]
		// }
	];

	const generate = async () => {
		progress = 0;
		schedules = undefined;
		schedulesWorkers = new (await import('$lib/workers/generateSchedules?worker')).default();
		schedulesWorkers.onmessage = (e) => {
			switch (e.data.type) {
				case 'progress':
					progress = e.data.n;
					break;
				case 'schedules':
					progress = 1;
					finalProgressTimeout = setTimeout(() => {
						schedules = (e.data.schedules as SerializedSchedule[]).map(deserialize);
						schedules = schedules.filter((schedule) =>
							breaks.every((smartBreak) =>
								smartBreak.options.some(
									(option) =>
										![...smartBreak.days].some((day) =>
											schedule.days[[...'MTWRF'].indexOf(day)].meetings.some(
												// todo: timeslot class with `intersects` method
												(meeting) =>
													(meeting.startTime <= option.startTime &&
														option.startTime <= meeting.endTime) ||
													(meeting.startTime <= option.endTime &&
														option.endTime <= meeting.endTime) ||
													(option.startTime <= meeting.startTime &&
														meeting.startTime <= option.endTime) ||
													(option.startTime <= meeting.endTime && meeting.endTime <= option.endTime)
											)
										)
								)
							)
						);
					}, 200);
					break;
			}
		};
		schedulesWorkers.postMessage({
			total: parseInt(totalInput.value),
			hours: parseInt(hoursInput.value),
			sort: sortSelect.value
		} as GenerateSchedulesInput);
		// sort();
	};

	const cancel = () => {
		// todo: possible performance issues with consistent termination of threads
		schedulesWorkers.terminate();
		schedules = [];
		clearTimeout(finalProgressTimeout);
	};

	let sortSelect: HTMLSelectElement;
	let hoursInput: HTMLInputElement;
	let totalInput: HTMLInputElement;
</script>

<header>
	<h1>Class Cruncher <button class="generate" on:click={generate}>GENERATE</button></h1>
	<div class="options">
		<div class="option">
			Sort algorithm: <select name="sort" bind:this={sortSelect} on:input={sort} value="Gaps">
				{#each sortingHeuristics as sort}
					<option value={sort.name}>{sort.name}</option>
				{/each}
			</select>
		</div>

		<div>
			Preferred credit hours: <input
				type="text"
				placeholder="e.g., 18"
				value={18}
				bind:this={hoursInput}
			/>
		</div>

		<div>
			Total generated: <input
				type="text"
				placeholder="e.g., 3000"
				value={3000}
				bind:this={totalInput}
			/>
		</div>

		<div>
			Smart breaks: {#each breaks as b}
				<span class="break">{b.name}</span>
			{/each}
		</div>
	</div>
</header>

{#if schedules !== undefined}
	<div class="grid">
		{#if focused !== undefined && focusedSchedule !== undefined}
			<FullscreenComponent bind:focused bind:focusedSchedule />
		{/if}
		{#each schedules.slice(0, 100) as schedule, i}
			<div class="schedule-wrapper" on:keydown={() => (focused = i)} on:click={() => (focused = i)}>
				<ScheduleComponent {schedule} />
			</div>
		{/each}
		<div class="info" />
	</div>
{:else}
	<div class="centered">
		<Spinner />
	</div>
	<div class="centered">
		<div class="outer-progress-bar">
			<div class="progress-bar" style={`width:${progress * 200}px`} />
		</div>
	</div>
	<div class="centered">
		<button on:click={cancel}>cancel</button>
	</div>
{/if}

<style lang="scss">
	header {
		display: flex;
		* {
			flex: 1;
		}
		.options {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
	}

	.schedule-wrapper {
		padding: 10px;
		aspect-ratio: 1/1;
		border-radius: 10px;
		&:hover {
			background-color: rgb(242, 242, 242);
		}
	}

	.centered {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.outer-progress-bar {
		outline: solid 2px orange;
		border-radius: 6px;
		margin-top: 30px;
		margin-bottom: 10px;
		width: 200px;
		overflow: clip;
	}

	.progress-bar {
		height: 30px;
		background-color: orange;
		/* transition: width 1s linear; */
	}
</style>
