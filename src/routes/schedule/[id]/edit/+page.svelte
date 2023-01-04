<script lang="ts">
	import { schedules } from '$lib/stores';
	import { Meeting, Schedule, scheduleFromSections, Section } from '$lib/schedule';
	import { onDataLoaded } from '$lib/util';
	import ScheduleComponent from '../../../components/ScheduleComponent.svelte';
	import { goto } from '$app/navigation';
	import SectionComponent from '../../../components/SectionComponent.svelte';

	let selectedMeeting: Meeting;

	export let data: { id: string };
	let schedule: Schedule;

	const exit = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			goto(`/schedule/${data.id}`);
		}
	};

	const swapSection = (section: Section) => {
		const currentSection = selectedMeeting.parentSection;
		const index = $schedules!.indexOf(schedule);
		console.log(index);
		schedule = scheduleFromSections(
			schedule.sections.filter((section) => section !== currentSection).concat(section)
		);
		selectedMeeting = section.meetings[0];
		// todo: ...
		schedules.set($schedules!.map((s, i) => (index === i ? schedule : s)));
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
		<a class="close" href="/schedule/{data.id}">Back</a>
		<div class="grid">
			<div class="schedule-wrapper">
				<ScheduleComponent {schedule} bind:selectedMeeting interactable />
			</div>
			<div class="sidebar">
				<h2>Edit Mode</h2>
				{#if selectedMeeting === undefined}
					<p>Select a section to begin.</p>
				{:else}
					<div class="section-options">
						{#each selectedMeeting.parentSection.parentCourse.sections as section}
							<div
								class="schedule"
								class:selected={schedule.sections.includes(section)}
								on:keyup={() => swapSection(section)}
								on:click={() => swapSection(section)}
							>
								<SectionComponent {section} />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	@import '../../../assets/button.scss'; // todo: scss $lib

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

	.section-options {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		.schedule {
			aspect-ratio: 1/1;
			margin: 10px;
			padding: 10px;
			&.selected {
				outline: solid gray 4px;
			}
		}
	}
</style>
