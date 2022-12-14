<script lang="ts">
	import type { Meeting, Schedule } from '$lib/schedule';
	import { humanTime, unique } from '$lib/util';
	import ScheduleComponent from './ScheduleComponent.svelte';

	export let focusedSchedule: Schedule;
	let selectedMeeting: Meeting;
</script>

<div class="fullscreen">
	<a class="close" href="/"> Back </a>
	<div class="grid">
		<div class="schedule-wrapper">
			<ScheduleComponent bind:schedule={focusedSchedule} bind:selectedMeeting interactable />
		</div>
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
	@import '../assets/style.scss';

	.fullscreen {
		background-color: white;
		.grid {
			padding: 0;
			display: grid;
			margin: 5vh 5vw;
			width: 90vw;
			overflow: auto;
			grid-template-columns: 3fr 2fr;
			.schedule-wrapper {
				height: 100vh;
			}
			.sidebar {
				padding: 0px 30px;
				/* overflow: auto; */
			}
		}
	}

	.section-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}

	.back {
		@include button(blue);
	}
</style>
