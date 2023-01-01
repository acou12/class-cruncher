<script lang="ts">
	import { schedules } from '$lib/stores';
	import type { Meeting, Schedule } from '$lib/schedule';
	import { humanTime, unique } from '$lib/util';
	import ScheduleComponent from '../../components/ScheduleComponent.svelte';

	let selectedMeeting: Meeting;

	export let data: { id: string };
	const schedule = $schedules!.find((schedule) => schedule.id === data.id)!;
</script>

<div class="fullscreen">
	<a class="close" href="/"> Back </a>
	<div class="grid">
		<div class="schedule-wrapper">
			<ScheduleComponent {schedule} bind:selectedMeeting interactable />
		</div>
		<div class="sidebar">
			<h2>Legend</h2>
			<div class="section-grid">
				{#each schedule.sections as section}
					<div>
						<span class="circle" style="background-color: #{section.parentCourse.color};" />
						{section.parentCourse.name}
					</div>
				{/each}
			</div>
			<h2>Schedule Stats</h2>
			<div class="stat">
				<strong>Hours</strong> - {schedule.totalHours()} credit hours
			</div>
			<div class="stat">
				<strong>Total Gaps</strong> - {schedule.totalGaps()} minutes {schedule.minimallyGapped()
					? '(MINIMALLY GAPPED!)'
					: ''}
			</div>
			<div class="stat">
				<strong>Average Gap</strong> - {schedule.averageGaps().toFixed(1)} minutes
			</div>

			<div class="stat">
				<strong>Last Time</strong> - {humanTime(schedule.maxEndTime())}
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
	@import '../../assets/style.scss';

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
