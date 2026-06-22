<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

import { BRIDGE_FETCH_HEADERS, BRIDGE_URL } from '../bridge-config'

const appStore = useAppStore()

// Additional stats from bridge that may not be in the store yet
const extraStats = ref<Record<string, number>>({})

onMounted(() => {
  loadUsage()
})

async function loadUsage() {
  await appStore.fetchUsage()
  // Optionally do a direct fetch for any extra fields the bridge returns
  // that aren't mapped to store properties
  try {
    const res = await fetch(`${BRIDGE_URL}/api/hermes/usage`, { headers: BRIDGE_FETCH_HEADERS })
    if (res.ok) {
      const data = await res.json()
      // Collect any numeric fields beyond tokenCount/tokens and sessions/activeSessions
      const known = new Set(['tokenCount', 'tokens', 'sessions', 'activeSessions'])
      for (const [k, v] of Object.entries(data)) {
        if (!known.has(k) && typeof v === 'number') {
          extraStats.value[k] = v
        }
      }
    }
  } catch {
    // Non-critical — store.loadUsage() already did the heavy lifting
  }
}

function refresh() {
  loadUsage()
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="card">
      <div class="card-header">
        <h3>🔢 Token — Usage</h3>
        <button class="refresh-btn" :disabled="appStore.usageLoading" @click="refresh">
          <span v-if="appStore.usageLoading" class="spinner"></span>
          <span v-else>↻</span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="appStore.usageError" class="error-banner">
      ⚠️ Failed to load usage data: {{ appStore.usageError }}
    </div>

    <!-- Loading state -->
    <div v-if="appStore.usageLoading && appStore.tokenCount === 0" class="card loading-card">
      <div class="stub-content">
        <div class="spinner large"></div>
        <p class="stub-text">Fetching usage data from Hermes agent bridge…</p>
      </div>
    </div>

    <!-- KPI Grid -->
    <div v-else class="kpi-grid">
      <div class="kpi-card card">
        <div class="kpi-label">Total Tokens</div>
        <div class="kpi-value text-cyan">{{ appStore.tokenCount.toLocaleString() }}</div>
        <div class="kpi-note">Lifetime token usage</div>
      </div>

      <div class="kpi-card card">
        <div class="kpi-label">Active Sessions</div>
        <div class="kpi-value text-green">{{ appStore.activeSessions }}</div>
        <div class="kpi-note">{{ appStore.activeSessions === 1 ? 'session' : 'sessions' }} running</div>
      </div>

      <div
        v-for="(value, key) in extraStats"
        :key="key"
        class="kpi-card card"
      >
        <div class="kpi-label">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</div>
        <div class="kpi-value text-cyan">{{ value.toLocaleString() }}</div>
        <div class="kpi-note">Live from bridge</div>
      </div>
    </div>

    <!-- Empty state when no data yet -->
    <div v-if="!appStore.usageLoading && appStore.tokenCount === 0 && !appStore.usageError" class="card">
      <div class="stub-content">
        <p class="stub-text">
          No usage data available yet. Click Refresh to try again.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.page {
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-banner {
  padding: 12px 16px;
  background: rgba($accent-red, 0.1);
  border: 1px solid rgba($accent-red, 0.3);
  border-radius: $radius-md;
  color: $accent-red;
  font-size: 13px;
}

.loading-card {
  text-align: center;
}

.stub-content {
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.stub-text {
  color: $text-muted;
  font-size: 14px;
  text-align: center;
}

// KPI Grid
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.kpi-card {
  text-align: center;
  padding: 24px 20px;

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

// Refresh button
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: $bg-card-hover;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  color: $text-secondary;
  font-size: 12px;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover:not(:disabled) {
    border-color: $accent-gold;
    color: $accent-gold;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Simple CSS spinner
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid $border-color;
  border-top-color: $accent-gold;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  &.large {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
