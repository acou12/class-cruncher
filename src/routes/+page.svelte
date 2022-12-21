<script lang="ts">
	import './assets/style.scss';
	import { onMount } from 'svelte';
	import { fixedTime, humanTime, unique } from '../lib/util';
	import ScheduleComponent from './components/ScheduleComponent.svelte';
	import { generateSchedules, initialize, Meeting, Schedule } from './schedule';
	import sections from './assets/data.json?raw';

	let schedules: Schedule[] | undefined = undefined;

	let focused: number | undefined;
	$: focusedSchedule = focused === undefined ? undefined : schedules![focused];

	let selectedMeeting: Meeting | undefined = undefined;

	onMount(async () => {
		initialize(JSON.parse(sections));
		generate();
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				focused = undefined;
			}
		});
	});

	const sortingHeuristics: {
		name: string;
		sort(schedule: Schedule): number;
	}[] = [
		{
			name: 'Random',
			sort(_schedule: Schedule) {
				return Math.random();
			}
		},
		{
			name: 'Gaps',
			sort(schedule: Schedule) {
				return schedule.totalGaps();
			}
		},
		{
			name: 'Last Time',
			sort(schedule: Schedule) {
				return schedule.maxEndTime();
			}
		},
		{
			name: 'Friday',
			sort(schedule: Schedule) {
				return schedule.fridayLast();
			}
		},
		{
			name: 'Variance',
			sort(schedule: Schedule) {
				return -schedule.deviation();
			}
		},
		{
			name: 'Cohesivity',
			sort(schedule: Schedule) {
				return schedule.cohesivity();
			}
		},
		{
			name: 'Hours',
			sort(schedule: Schedule) {
				return -schedule.totalHours();
			}
		}
	];

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

	const generate = () => {
		schedules = undefined;
		setTimeout(async () => {
			schedules = await generateSchedules(parseInt(totalInput.value), parseInt(hoursInput.value));
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
										(meeting.startTime <= option.endTime && option.endTime <= meeting.endTime) ||
										(option.startTime <= meeting.startTime &&
											meeting.startTime <= option.endTime) ||
										(option.startTime <= meeting.endTime && meeting.endTime <= option.endTime)
								)
							)
					)
				)
			);
			sort();
		}, 1);
	};

	let sortSelect: HTMLSelectElement;
	let hoursInput: HTMLInputElement;
	let totalInput: HTMLInputElement;
</script>

<header>
	<h1>Class Cruncher <button class="generate" on:click={generate}>GENERATE</button></h1>
	<div class="options">
		<div class="option">
			Sort algorithm: <select name="sort" bind:this={sortSelect} on:input={sort}>
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

<div class="grid">
	{#if focused !== undefined && focusedSchedule !== undefined}
		<div class="fullscreen">
			<div class="grid">
				<ScheduleComponent bind:schedule={focusedSchedule} bind:selectedMeeting interactable />
				<div class="sidebar">
					<h2>Legend</h2>
					<div class="section-grid">
						{#each focusedSchedule.sections as section}
							<div>
								<span class="circle" style="background-color: #{section.parentCourse.color};" />
								{section.parentCourse.name} ({unique(
									section.meetings.map((meeting) => meeting.day)
								).join('')})
							</div>
						{/each}
					</div>
					<h2>Schedule Stats</h2>
					<div class="stat">
						<strong>Hours</strong> - {focusedSchedule.totalHours()} credit hours
					</div>
					<div class="stat">
						<strong>Total Gaps</strong> - {focusedSchedule.totalGaps()} minutes {focusedSchedule.minimallyGapped()
							? '(MINIMALLY GAPPED!)'
							: ''}
					</div>
					<div class="stat">
						<strong>Average Gap</strong> - {focusedSchedule.averageGaps().toFixed(1)} minutes
					</div>

					<div class="stat">
						<strong>Last Time</strong> - {humanTime(focusedSchedule.maxEndTime())}
					</div>
					{#if selectedMeeting !== undefined}
						<h2>Selected Section - {selectedMeeting.parentSection.parentCourse.name}</h2>
						{#each selectedMeeting.parentSection.meetings as meeting}
							<div>
								{meeting.day} at {humanTime(meeting.startTime)} to {humanTime(meeting.endTime)}
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	{/if}
	{#if schedules !== undefined}
		{#each schedules.slice(0, 100) as schedule, i}
			<div class="schedule-wrapper" on:keydown={() => (focused = i)} on:click={() => (focused = i)}>
				<ScheduleComponent {schedule} />
			</div>
		{/each}
	{:else}
		<p>Loading schedules...</p>
	{/if}
	<div class="info" />
</div>

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

	.fullscreen {
		position: fixed;
		left: 0vw;
		top: 0vh;
		width: 100vw;
		z-index: 1;
		background-color: white;
		overflow: scroll;
		.grid {
			padding: 0;
			display: grid;
			margin: 5vh 5vw;
			width: 90vw;
			height: 90vh;
			grid-template-columns: 3fr 2fr;
			.sidebar {
				padding: 0px 30px;
			}
		}
	}

	.section-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}
</style>
