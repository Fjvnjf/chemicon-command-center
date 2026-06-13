<script setup lang="ts">
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="card-header">
        <h3>Cron — Jobs</h3>
        <span class="badge badge-info">Coming Soon</span>
      </div>
      <div class="stub-content">
        <p class="stub-text">
          Cron jobs scheduler — this view will be populated with live data from the Hermes agent bridge.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.page {
  max-width: 960px;
}

.stub-content {
  padding: 32px 0;
}

.stub-text {
  color: $text-muted;
  font-size: 14px;
  text-align: center;
}
</style>
