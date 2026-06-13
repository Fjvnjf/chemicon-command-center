<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface PlatformInfo {
  name: string
}

interface PlatformsResponse {
  platforms: string[]
  gateway_running: boolean
}

const BRIDGE_URL = 'https://theater-ratios-cet-commission.trycloudflare.com'

const platforms = ref<PlatformInfo[]>([])
const gatewayRunning = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchPlatforms() {
  loading.value = true
  error.value = null
  try {
    const resp = await fetch(`${BRIDGE_URL}/api/hermes/platforms`)
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }
    const data: PlatformsResponse = await resp.json()
    platforms.value = (data.platforms ?? []).map((name: string) => ({ name }))
    gatewayRunning.value = data.gateway_running ?? false
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch platforms'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPlatforms()
})
</script>

<template>
  <div class="page">
    <!-- ── Header Card ── -->
    <div class="card">
      <div class="card-header">
        <h3>🛰️ Channels</h3>
        <span v-if="!loading && gatewayRunning" class="badge badge-ok">
          Gateway Online
        </span>
        <span v-else-if="!loading && !gatewayRunning" class="badge badge-warn">
          Gateway Offline
        </span>
        <span v-else class="badge badge-info">Loading…</span>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="stub-content">
        <p class="stub-text">Fetching platform data from Hermes agent bridge…</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="stub-content">
        <p class="stub-text text-red">⚠️ {{ error }}</p>
        <button class="retry-btn" @click="fetchPlatforms()">Retry</button>
      </div>

      <!-- Data state -->
      <div v-else class="channels-body">
        <!-- Gateway Status -->
        <div class="section">
          <h4 class="section-title">Gateway</h4>
          <div class="gateway-card" :class="{ online: gatewayRunning, offline: !gatewayRunning }">
            <span class="status-dot" :class="{ online: gatewayRunning, offline: !gatewayRunning }" />
            <span class="gateway-label">{{ gatewayRunning ? 'Running' : 'Stopped' }}</span>
          </div>
        </div>

        <!-- Platform List -->
        <div class="section">
          <h4 class="section-title">
            Connected Platforms
            <span class="count-badge">{{ platforms.length }}</span>
          </h4>
          <div v-if="platforms.length" class="platform-grid">
            <div
              v-for="p in platforms"
              :key="p.name"
              class="platform-card"
              :class="{ connected: gatewayRunning, disconnected: !gatewayRunning }"
            >
              <span class="platform-dot" :class="{ connected: gatewayRunning, disconnected: !gatewayRunning }" />
              <code class="platform-name">{{ p.name }}</code>
              <span v-if="gatewayRunning" class="badge badge-ok badge-sm">online</span>
              <span v-else class="badge badge-warn badge-sm">offline</span>
            </div>
          </div>
          <p v-else class="empty-text">No platforms connected.</p>
        </div>

        <!-- Refresh -->
        <div class="refresh-area">
          <button class="retry-btn" @click="fetchPlatforms()">🔄 Refresh</button>
        </div>
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

.text-red {
  color: $accent-red;
}

.channels-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 8px;
}

.section {
  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: $text-muted;
    letter-spacing: 0.05em;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 700;
  color: $text-primary;
  background: $bg-input;
  border: 1px solid $border-color;
  border-radius: 999px;
}

// ── Gateway Card ──
.gateway-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  background: $bg-card-hover;

  &.online {
    border-color: rgba($accent-green, 0.25);
  }

  &.offline {
    border-color: rgba($accent-red, 0.25);
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;

    &.online {
      background: $accent-green;
      box-shadow: 0 0 8px rgba($accent-green, 0.5);
    }

    &.offline {
      background: $accent-red;
      box-shadow: 0 0 8px rgba($accent-red, 0.4);
    }
  }

  .gateway-label {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }
}

// ── Platform Grid ──
.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.platform-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: $bg-input;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  transition: border-color $transition-fast;

  &.connected {
    border-color: rgba($accent-green, 0.2);
  }

  &.disconnected {
    border-color: rgba($accent-red, 0.15);
    opacity: 0.7;
  }

  .platform-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &.connected {
      background: $accent-green;
    }

    &.disconnected {
      background: $accent-red;
    }
  }

  .platform-name {
    font-family: $font-code;
    font-size: 13px;
    color: $text-primary;
    background: transparent;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.badge-sm {
  font-size: 10px;
  padding: 1px 6px;
}

// ── Empty ──
.empty-text {
  color: $text-muted;
  font-size: 13px;
  font-style: italic;
}

// ── Refresh ──
.refresh-area {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.retry-btn {
  padding: 6px 16px;
  background: $bg-input;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  color: $text-secondary;
  font-size: 12px;
  font-family: $font-sans;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $accent-cyan;
    color: $accent-cyan;
  }
}
</style>
