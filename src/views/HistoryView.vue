<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { BRIDGE_FETCH_HEADERS, BRIDGE_URL } from '../bridge-config'

interface Session {
  id: string
  file?: string
}

const sessions = ref<Session[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(() => {
  fetchSessions()
})

async function fetchSessions() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${BRIDGE_URL}/api/hermes/sessions`, { headers: BRIDGE_FETCH_HEADERS })
    if (!res.ok) {
      error.value = `HTTP ${res.status}: ${res.statusText}`
      return
    }
    const data = await res.json()
    // Response shape: {"ok":true} or {"sessions":[...], "count":N}
    if (data.sessions && Array.isArray(data.sessions)) {
      sessions.value = data.sessions
    } else {
      // {"ok":true} — no sessions key, treat as empty
      sessions.value = []
    }
  } catch (e: any) {
    error.value = e?.message ?? 'Network error'
  } finally {
    loading.value = false
  }
}

function refresh() {
  fetchSessions()
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="card">
      <div class="card-header">
        <h3>📜 Sessions — History</h3>
        <button class="refresh-btn" :disabled="loading" @click="refresh">
          <span v-if="loading" class="spinner"></span>
          <span v-else>↻</span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="error" class="error-banner">
      ⚠️ Failed to load sessions: {{ error }}
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="card loading-card">
      <div class="stub-content">
        <div class="spinner large"></div>
        <p class="stub-text">Fetching sessions from Hermes agent bridge…</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="sessions.length === 0" class="card">
      <div class="stub-content">
        <p class="stub-text">No sessions found. Start a conversation to see history here.</p>
      </div>
    </div>

    <!-- Session list -->
    <div v-else class="card">
      <div class="session-count">
        <span class="count-badge">{{ sessions.length }} session{{ sessions.length === 1 ? '' : 's' }}</span>
      </div>
      <div class="session-table-wrapper">
        <table class="session-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sessions" :key="s.id">
              <td class="session-id">{{ s.id }}</td>
              <td class="session-file">{{ s.file || '—' }}</td>
            </tr>
          </tbody>
        </table>
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

// Error banner
.error-banner {
  padding: 12px 16px;
  background: rgba($accent-red, 0.1);
  border: 1px solid rgba($accent-red, 0.3);
  border-radius: $radius-md;
  color: $accent-red;
  font-size: 13px;
}

// Loading card
.loading-card {
  text-align: center;
}

// Stub / empty state
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

// Session count
.session-count {
  padding: 0 0 12px;
}

.count-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba($accent-cyan, 0.1);
  border: 1px solid rgba($accent-cyan, 0.2);
  border-radius: $radius-sm;
  color: $accent-cyan;
  font-size: 12px;
  font-family: $font-code;
}

// Session table
.session-table-wrapper {
  overflow-x: auto;
}

.session-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead {
    th {
      text-align: left;
      padding: 10px 14px;
      color: $text-muted;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      border-bottom: 1px solid $border-color;
    }
  }

  tbody {
    tr {
      transition: background $transition-fast;

      &:hover {
        background: $bg-card-hover;
      }

      &:not(:last-child) td {
        border-bottom: 1px solid rgba($border-color, 0.5);
      }
    }

    td {
      padding: 12px 14px;
      color: $text-secondary;
    }
  }

  .session-id {
    font-family: $font-code;
    color: $accent-cyan;
    font-size: 12px;
  }

  .session-file {
    font-family: $font-code;
    font-size: 12px;
    color: $text-secondary;
  }
}

// Spinner
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
