<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface CurrentModel {
  model: string
  provider: string
}

interface ModelsResponse {
  current: CurrentModel | null
  available: string[]
  providers_with_keys: string[]
}

import { BRIDGE_FETCH_HEADERS, BRIDGE_URL } from '../bridge-config'

const currentModel = ref<CurrentModel | null>(null)
const availableModels = ref<string[]>([])
const providersWithKeys = ref<string[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchModels() {
  loading.value = true
  error.value = null
  try {
    const resp = await fetch(`${BRIDGE_URL}/api/hermes/models`, { headers: BRIDGE_FETCH_HEADERS })
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }
    const data: ModelsResponse = await resp.json()
    currentModel.value = data.current ?? null
    availableModels.value = data.available ?? []
    providersWithKeys.value = data.providers_with_keys ?? []
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch models'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchModels()
})
</script>

<template>
  <div class="page">
    <!-- ── Header Card ── -->
    <div class="card">
      <div class="card-header">
        <h3>🧠 Models</h3>
        <span v-if="!loading && currentModel" class="badge badge-ok">
          {{ currentModel.model }}
        </span>
        <span v-else-if="!loading && !currentModel" class="badge badge-warn">
          No model
        </span>
        <span v-else class="badge badge-info">Loading…</span>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="stub-content">
        <p class="stub-text">Fetching model data from Hermes agent bridge…</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="stub-content">
        <p class="stub-text text-red">⚠️ {{ error }}</p>
        <button class="retry-btn" @click="fetchModels()">Retry</button>
      </div>

      <!-- Data state -->
      <div v-else class="models-body">
        <!-- Current Model -->
        <div class="section">
          <h4 class="section-title">Current Model</h4>
          <div v-if="currentModel" class="current-model-card">
            <div class="model-primary">{{ currentModel.model }}</div>
            <div class="model-provider">
              <span class="label">Provider</span>
              <span class="badge badge-gold">{{ currentModel.provider }}</span>
            </div>
          </div>
          <p v-else class="empty-text">No active model configured.</p>
        </div>

        <!-- Available Models -->
        <div class="section">
          <h4 class="section-title">Available Models</h4>
          <ul v-if="availableModels.length" class="model-list">
            <li v-for="m in availableModels" :key="m" class="model-item">
              <span class="dot" />
              <code>{{ m }}</code>
              <span v-if="currentModel && m === currentModel.model" class="badge badge-ok badge-sm">active</span>
            </li>
          </ul>
          <p v-else class="empty-text">No available models found.</p>
        </div>

        <!-- Providers with Keys -->
        <div class="section">
          <h4 class="section-title">Providers with API Keys</h4>
          <ul v-if="providersWithKeys.length" class="provider-list">
            <li v-for="p in providersWithKeys" :key="p" class="provider-item">
              <span class="dot dot-green" />
              <span>{{ p }}</span>
            </li>
          </ul>
          <p v-else class="empty-text">No providers configured with API keys.</p>
        </div>

        <!-- Refresh -->
        <div class="refresh-area">
          <button class="retry-btn" @click="fetchModels()">🔄 Refresh</button>
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

.models-body {
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
  }
}

// ── Current Model ──
.current-model-card {
  background: $bg-card-hover;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .model-primary {
    font-size: 16px;
    font-weight: 700;
    color: $text-primary;
    font-family: $font-code;
  }

  .model-provider {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      font-size: 11px;
      color: $text-muted;
      text-transform: uppercase;
      font-weight: 600;
    }
  }
}

// ── Lists ──
.model-list,
.provider-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.model-item,
.provider-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: $bg-input;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  font-size: 13px;
  color: $text-secondary;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $accent-cyan;
    flex-shrink: 0;
  }

  .dot-green {
    background: $accent-green;
  }

  code {
    font-family: $font-code;
    font-size: 12px;
    color: $text-primary;
    background: transparent;
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
