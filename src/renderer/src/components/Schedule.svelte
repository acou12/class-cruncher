<script lang="ts">
  import { onMount } from 'svelte'
  import { randomSchedule, type Schedule } from '../schedule'

  export let schedule: Schedule

  onMount(() => {
    document.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        schedule = randomSchedule()
      }
    })
  })

  const fitToHeight = (x: number) => {
    return (x / (60 * 24)) * 200 - 50
  }
</script>

<div class="week">
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
