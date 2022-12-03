<script lang="ts">
  import ScheduleComponent from './components/ScheduleComponent.svelte'
  import { allSchedules } from './schedule'

  allSchedules.sort((x, y) => x.totalGaps() - y.totalGaps())
  allSchedules.sort((x, y) => x.maxEndTime() - y.maxEndTime())
</script>

<div class="grid">
  {#each allSchedules.slice(0, 300) as schedule}
    <div class="schedule-wrapper">
      <ScheduleComponent {schedule} />
    </div>
  {/each}
  <div class="info">
    <!-- {#each schedule.courses as course}
      <div>
        <span class="circle" style="background-color: #{course.color};" />{course.name}
      </div>
    {/each} -->
  </div>
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
</style>
