<script lang="ts">
	// todo: combine with ScheduleComponent
	import type { Section } from '../../lib/schedule';

	export let section: Section;

	const fitToHeight = (x: number) => {
		return (x / (60 * 24)) * 175 - 50;
	};
</script>

<div class="week">
	{#each [...Array(12).keys()].slice(1) as y}
		<div class="hour-divider" style="top: {(y / 12) * 100}%;" />
	{/each}
	{#each 'MTWRF' as day}
		<div class="day">
			{#each section.meetings.filter((meeting) => meeting.day === day) as meeting}
				<div
					class="meeting"
					style={`
                  height: ${fitToHeight(meeting.endTime) - fitToHeight(meeting.startTime)}%;
                  top: ${fitToHeight(meeting.startTime)}%;
                  background-color: #${meeting.parentSection.parentCourse.color};
                `}
				/>
			{/each}
		</div>
	{/each}
</div>
