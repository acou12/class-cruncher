<script lang="ts">
	import { schedules } from '$lib/stores';
	import { serialize, type Meeting, type Schedule } from '$lib/schedule';
	import { humanTime, onDataLoaded } from '$lib/util';
	import ScheduleComponent from '../../components/ScheduleComponent.svelte';
	import { goto } from '$app/navigation';

	let selectedMeeting: Meeting;

	export let data: { id: string };
	let schedule: Schedule;

	const exit = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			goto('/');
		}
	};

	const copyLink = (event: MouseEvent) => {
		const link = `https://cruncher.surge.sh/schedule/share/${JSON.stringify(serialize(schedule))}`;
		try {
			navigator.clipboard.writeText(link);
			(event.target as HTMLButtonElement).animate(
				[
					{
						color: 'green',
						outlineColor: 'green'
					},
					{
						color: 'orange',
						outlineColor: 'orange'
					}
				],
				{ duration: 200 }
			);
		} catch (e) {
			(event.target as HTMLButtonElement).animate(
				[
					{
						color: 'red',
						outlineColor: 'red'
					},
					{
						color: 'orange',
						outlineColor: 'orange'
					}
				],
				{ duration: 200 }
			);
		}
	};

	onDataLoaded(
		() => {
			document.addEventListener('keydown', exit);
			schedule = $schedules![parseInt(data.id)];
		},
		() => {
			document.removeEventListener('keydown', exit);
		}
	);
</script>

{#if schedule !== undefined}
	<div class="fullscreen">
		<a class="close" href="/">Back</a>
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
							{meeting.day} at {humanTime(meeting.startTime)} to {humanTime(meeting.endTime)} at {meeting
								.location.name}
							{meeting.location.coords !== undefined
								? `(${meeting.location.coords.lat}, ${meeting.location.coords.lng})`
								: ``}
						</div>
					{/each}
				{/if}
				<button on:click={copyLink}>Copy Sharable Link</button>
				<a class="edit" href="/schedule/{data.id}/edit">Edit Schedule</a>
			</div>
		</div>
		{#each schedule.days as day, i}
			<h2>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i]} Route</h2>
			{#if day.generateIFrameLink() === ''}
				No classes today.
			{:else}
				<iframe
					width="100%"
					height="500px"
					title="Route of the selected schedule"
					loading="lazy"
					allowfullscreen
					referrerpolicy="no-referrer-when-downgrade"
					src={day.generateIFrameLink()}
				/>
			{/if}
		{/each}
	</div>
{/if}

<style lang="scss">
	@import '../../assets/button.scss';

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
</style>
