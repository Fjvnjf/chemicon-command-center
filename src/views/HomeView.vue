<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const kpis = [
  { label: 'Active Sessions', value: '1', note: '1 running', tone: 'ok' },
  { label: 'Scheduled Jobs', value: '24', note: '24 total', tone: 'info' },
  { label: 'Skills Loaded', value: '46', note: '46 ready', tone: 'ok' },
  { label: 'Platforms Online', value: '2', note: 'weixin, local', tone: 'ok' },
]

function goTo(route: string) {
  router.push({ name: route })
}
</script>

<template>
  <div class="home-page">
    <div class="welcome-card card">
      <div class="card-header">
        <h3>🧠 CHEMICON COMMAND CENTER</h3>
        <span class="badge badge-ok">Operational</span>
      </div>
      <p class="welcome-text">
        Your AI-powered chemical business intelligence dashboard. Access market analysis,
        competitor tracking, and all Hermes agent capabilities from one place.
      </p>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card card">
        <div class="kpi-label">{{ kpi.label }}</div>
        <div class="kpi-value" :class="`text-${kpi.tone === 'ok' ? 'green' : 'cyan'}`">
          {{ kpi.value }}
        </div>
        <div class="kpi-note">{{ kpi.note }}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <div class="card-header">
        <h3>⚡ Quick Actions</h3>
      </div>
      <div class="action-grid">
        <button class="action-btn" @click="goTo('chat')">
          <span class="action-icon">💬</span>
          <span>New Chat</span>
        </button>
        <button class="action-btn" @click="goTo('marketAnalysis')">
          <span class="action-icon">📈</span>
          <span>Market Analysis</span>
        </button>
        <button class="action-btn" @click="goTo('competitors')">
          <span class="action-icon">⚔️</span>
          <span>Competitors</span>
        </button>
        <button class="action-btn" @click="goTo('tasks')">
          <span class="action-icon">📌</span>
          <span>Tasks</span>
        </button>
        <button class="action-btn" @click="goTo('terminal')">
          <span class="action-icon">🖥</span>
          <span>Terminal</span>
        </button>
        <button class="action-btn" @click="goTo('files')">
          <span class="action-icon">📂</span>
          <span>Files</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.home-page {
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-card {
  .welcome-text {
    color: $text-secondary;
    font-size: 14px;
    line-height: 1.6;
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.kpi-card {
  text-align: center;
  padding: 20px;

  .kpi-label {
    font-size: 11px;
    text-transform: uppercase;
    color: $text-muted;
    margin-bottom: 8px;
  }

  .kpi-value {
    font-size: 32px;
    font-weight: 800;
    font-family: $font-code;
    margin-bottom: 4px;
  }

  .kpi-note {
    font-size: 11px;
    color: $text-muted;
  }
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: $bg-card-hover;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-secondary;
  font-size: 13px;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $accent-gold;
    color: $accent-gold;
    background: rgba($accent-gold, 0.08);
  }

  .action-icon {
    font-size: 18px;
  }
}
</style>
