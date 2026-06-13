<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface HealthCheck {
  ok: boolean
}

interface HealthResponse {
  ok: boolean
  checks: Record<string, HealthCheck>
}

const BRIDGE_URL = 'https://theater-ratios-cet-commission.trycloudflare.com'

const checks = ref<Record<string, HealthCheck>>({})
const overallOk = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchHealth() {
  loading.value = true
  error.value = null
  try {
    const resp = await fetch(`${BRIDGE_URL}/api/hermes/health`)
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }
    const data: HealthResponse = await resp.json()
    checks.value = data.checks ?? {}
    overallOk.value = data.ok
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch health status'
    checks.value = {}
    overallOk.value = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHealth()
})

function componentName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="card-header">
        <h3>🫀 System — Performance</h3>
        <span v-if="!loading && overallOk" class="badge badge-ok">Healthy</span>
        <span v-else-if="!loading && !overallOk" class="badge badge-warn">Degraded</span>
        <span v-else class="badge badge-info">Checking…</span>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-banner">
        ⚠️ {{ error }}
      </div>

      <!-- Health Check Grid -->
      <div v-if="!loading && !error" class="health-grid">
        <div
          v-for="(check, key) in checks"
          :key="key"
          class="health-tile"
          :class="{ ok: check.ok, fail: !check.ok }"
        >
          <span class="health-icon">{{ check.ok ? '✅' : '❌' }}</span>
          <span class="health-name">{{ componentName(key) }}</span>
          <span class="health-status">{{ check.ok ? 'OK' : 'FAIL' }}</span>
        </div>
        <div v-if="Object.keys(checks).length === 0" class="stub-content">
          <p class="stub-text">No component health data available.</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="stub-content">
        <p class="stub-text">Fetching health status…</p>
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

.error-banner {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: $radius-sm;
  background: rgba($accent-red, 0.12);
  color: $accent-red;
  font-size: 13px;
  border: 1px solid rgba($accent-red, 0.25);
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.health-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 12px;
  border-radius: $radius-md;
  border: 1px solid $border-color;
  background: $bg-card;
  transition: border-color $transition-fast, box-shadow $transition-fast;

  &.ok {
    border-color: rgba($accent-green, 0.3);
    box-shadow: 0 0 12px rgba($accent-green, 0.08);
  }

  &.fail {
    border-color: rgba($accent-red, 0.3);
    box-shadow: 0 0 12px rgba($accent-red, 0.08);
  }
}

.health-icon {
  font-size: 24px;
}

.health-name {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
  text-transform: capitalize;
}

.health-status {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .ok & {
    color: $accent-green;
  }

  .fail & {
    color: $accent-red;
  }
}
</style>
