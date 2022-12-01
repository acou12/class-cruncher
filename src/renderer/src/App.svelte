<script lang="ts">
  import Schedule from './components/Schedule.svelte'
  import { schedule } from './schedule'
</script>

<div class="grid">
  <div class="schedule-wrapper">
    <Schedule {schedule} />
  </div>
  <div class="info">
    {#each schedule.courses as course}
      <div>
        <span class="circle" style="background-color: #{course.color};" />{course.name}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    padding: 100px 0;
  }

  .schedule-wrapper {
    height: 80vh;
  }
</style>
