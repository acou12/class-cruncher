<script lang="ts">
	import type { Meeting, Schedule } from '../../lib/schedule';

	export let interactable: boolean = false;
	export let showText: boolean = false;
	export let schedule: Schedule;
	export let selectedMeeting: Meeting | undefined = undefined;

	const fitToHeight = (x: number) => {
		return (x / (60 * 24)) * 175 - 50;
	};
</script>

<div class="week">
	{#each [...Array(12).keys()].slice(1) as y}
		<div class="hour-divider" style="top: {(y / 12) * 100}%;" />
	{/each}
	{#each schedule.days as day}
		<div class="day">
			{#each day.meetings as meeting}
				<div
					class="meeting"
					class:selected={selectedMeeting !== undefined &&
						selectedMeeting.parentSection.meetings.includes(meeting)}
					style={`
                  height: ${fitToHeight(meeting.endTime) - fitToHeight(meeting.startTime)}%;
                  top: ${fitToHeight(meeting.startTime)}%;
                  background-color: #${meeting.parentSection.parentCourse.color};
                `}
					on:click={() => interactable && (selectedMeeting = meeting)}
					on:keydown={() => interactable && (selectedMeeting = meeting)}
				>
					{#if showText}
						<div>
							{meeting.parentSection.parentCourse.name}, {meeting.location.name.split(' ')[0]}
						</div>
					{/if}
				</div>
			{/each}
			<!-- {#if otherOptions !== undefined}
        {#each otherOptions as section}
          <div class="section-group">
            {#each section.meetings
              .filter((meeting) => meeting.day === 'MTWRF'.split('')[dayIndex])
              .filter((meeting) => schedule.days
                    .flatMap((day) => day.meetings)
                    .find((other) => other.startTime === meeting.startTime && other.parentSection.parentCourse === meeting.parentSection.parentCourse) === undefined) as meeting}
              <div
                class="meeting alternate"
                style={`
                  height: ${fitToHeight(meeting.endTime) - fitToHeight(meeting.startTime)}%;
                  top: ${fitToHeight(meeting.startTime)}%;
                `}
                on:click={() => {
                  schedule = scheduleFromSections([
                    ...schedule.sections.filter((it) => it.parentCourse !== section.parentCourse),
                    section
                  ])
                  selectedMeeting = undefined
                }}
              />
            {/each}
          </div>
        {/each}
      {/if} -->
		</div>
	{/each}
</div>

<style lang="scss">
	.selected {
		outline: solid black 3px;
		z-index: 10 !important;
	}
</style>
