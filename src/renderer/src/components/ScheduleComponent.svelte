<script lang="ts">
  import type { Schedule } from '../schedule'

  export let schedule: Schedule

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
          style={`
                  height: ${fitToHeight(meeting.endTime) - fitToHeight(meeting.startTime)}%;
                  top: ${fitToHeight(meeting.startTime)}%;
                  background-color: #${meeting.course.color};
                `}
        />
      {/each}
    </div>
  {/each}
</div>
