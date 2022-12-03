<script lang="ts">
  import type { Meeting, Schedule } from '../schedule'

  export let schedule: Schedule
  export let selectedMeeting: Meeting | undefined = undefined

  const fitToHeight = (x: number) => {
    return (x / (60 * 24)) * 200 - 50
  }
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
          class:selected={selectedMeeting === meeting}
          style={`
                  height: ${fitToHeight(meeting.endTime) - fitToHeight(meeting.startTime)}%;
                  top: ${fitToHeight(meeting.startTime)}%;
                  background-color: #${meeting.parentSection.parentCourse.color};
                `}
          on:mouseover={() => (selectedMeeting = meeting)}
          on:focus={() => (selectedMeeting = meeting)}
        />
      {/each}
    </div>
  {/each}
</div>

<style>
  .selected {
    border: solid black 3px;
    z-index: 10 !important;
  }
</style>
