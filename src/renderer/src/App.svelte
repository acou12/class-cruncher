<script lang="ts">
  import { onMount } from 'svelte'
  import ScheduleComponent from './components/ScheduleComponent.svelte'
  import { allSchedules, initialize, Meeting } from './schedule'

  let schedules = allSchedules

  let focused: number | undefined
  $: focusedSchedule = focused === undefined ? undefined : allSchedules[focused]

  let selectedMeeting: Meeting | undefined = undefined

  onMount(async () => {
    await window.api.loadHeaders(`THIS IS WHERE THE HEADERS GO. :)`)
    initialize(
      (await window.api.getCourses([
        '9082989',
        '9083052',
        '9083053',
        '9082979',
        '9127882',
        '9310643',
        '9127835',
        '9378697',
        '9403335',
        '9082980',
        '9310700',
        '9310744',
        '9127840',
        '9310670',
        '9343191',
        '9083072',
        '9310747'
      ])) as any
    )
    schedules = allSchedules
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        focused = undefined
      }
    })
  })
</script>

<div class="grid">
  {#if focused !== undefined}
    <div class="fullscreen">
      <div class="grid">
        <ScheduleComponent bind:schedule={focusedSchedule} bind:selectedMeeting interactable />
        <div class="sidebar">
          <h1>Schedule Stats</h1>
          <div class="section-grid">
            {#each focusedSchedule.sections as section}
              <div>
                <span class="circle" style="background-color: #{section.parentCourse.color};" />
                {section.parentCourse.name}
              </div>
            {/each}
          </div>
          <div class="stat">
            <strong>Gaps</strong> - {focusedSchedule.totalGaps()} minutes {focusedSchedule.minimallyGapped()
              ? '(MINIMALLY GAPPED!)'
              : ''}
          </div>
          <div class="stat">
            <strong>Hours</strong> - {focusedSchedule.totalHours()} credit hours
          </div>
          <div class="sections">
            {#each focusedSchedule.sections as section}
              {#each section.meetings as meeting}
                <div class="section" class:highlight={selectedMeeting === meeting}>
                  {section.parentCourse.name}: {meeting.startTime} - {meeting.endTime} ({meeting.day})
                </div>
              {/each}
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}
  {#each schedules.slice(0, 100) as schedule, i}
    <div class="schedule-wrapper" on:keydown={() => (focused = i)} on:click={() => (focused = i)}>
      <ScheduleComponent {schedule} />
    </div>
  {/each}
  <div class="info" />
</div>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    padding: 100px 0;
  }

  .schedule-wrapper {
    padding: 10px;
    aspect-ratio: 1/1;
  }

  .fullscreen {
    position: fixed;
    left: 0vw;
    top: 0vh;
    width: 100vw;
    z-index: 1;
    background-color: white;
    overflow: scroll;
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

  .highlight {
    background-color: yellow;
  }

  .section-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
</style>
