<script lang="ts">
	import type { Meeting, Schedule } from '$lib/schedule';
	import { humanTime, unique } from '$lib/util';
	import ScheduleComponent from './ScheduleComponent.svelte';

	export let focused: number | undefined;
	export let focusedSchedule: Schedule;
	let selectedMeeting: Meeting;
</script>

<div class="fullscreen">
	<button
		class="close"
		on:click={() => (focused = undefined)}
		on:keydown={() => (focused = undefined)}
	>
		Back
	</button>
	<div class="grid">
		<ScheduleComponent bind:schedule={focusedSchedule} bind:selectedMeeting interactable />
		<div class="sidebar">
			<h2>Legend</h2>
			<div class="section-grid">
				{#each focusedSchedule.sections as section}
					<div>
						<span class="circle" style="background-color: #{section.parentCourse.color};" />
						{section.parentCourse.name}
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

<style lang="scss">
	.fullscreen {
		position: fixed;
		left: 0vw;
		top: 0vh;
		width: 100vw;
		z-index: 1;
		background-color: white;
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
