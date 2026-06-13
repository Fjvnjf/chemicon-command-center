<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { BRIDGE_URL } from '../bridge-config'

interface MemoryEntry {
  title: string
  preview: string
}

const entries = ref<MemoryEntry[]>([])
const count = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const expandedIndex = ref<number | null>(null)

async function fetchMemory() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${BRIDGE_URL}/api/hermes/memory`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    entries.value = data.entries ?? []
    count.value = data.count ?? 0
  } catch (e: any) {
    error.value = e.message || 'Failed to fetch memory'
  } finally {
    loading.value = false
  }
}

function toggleExpand(index: number) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

onMounted(() => {
  fetchMemory()
})
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="card-header">
        <h3>Agent — Memory</h3>
        <span class="badge" :class="loading ? 'badge-info' : 'badge-ok'">
          {{ loading ? 'Loading...' : `${count} entries` }}
        </span>
      </div>

      <!-- Error state -->
      <div v-if="error" class="stub-content">
        <p class="stub-text error-text">⚠️ {{ error }}</p>
        <button class="retry-btn" @click="fetchMemory">Retry</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && entries.length === 0" class="stub-content">
        <p class="stub-text">No memory entries available.</p>
      </div>

      <!-- Memory entries list -->
      <div v-else class="memory-list">
        <div
          v-for="(entry, index) in entries"
          :key="index"
          class="memory-entry"
          :class="{ expanded: expandedIndex === index }"
        >
          <div class="entry-header" @click="toggleExpand(index)">
            <div class="entry-title">
              <span class="entry-index">#{{ index + 1 }}</span>
              <span class="entry-title-text">{{ entry.title }}</span>
            </div>
            <span class="expand-icon">{{ expandedIndex === index ? '▾' : '▸' }}</span>
          </div>
          <div v-if="expandedIndex === index" class="entry-preview">
            <p>{{ entry.preview }}</p>
          </div>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.stub-text {
  color: $text-muted;
  font-size: 14px;
  text-align: center;
}

.error-text {
  color: $accent-red;
}

.retry-btn {
  padding: 8px 20px;
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
  }
}

.memory-list {
  display: flex;
  flex-direction: column;
}

.memory-entry {
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  transition: background $transition-fast;
  user-select: none;

  &:hover {
    background: $bg-card-hover;
  }
}

.entry-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.entry-index {
  color: $text-muted;
  font-family: $font-code;
  font-size: 11px;
  min-width: 28px;
}

.entry-title-text {
  color: $text-primary;
  font-size: 14px;
  font-weight: 500;
}

.expand-icon {
  color: $text-muted;
  font-size: 14px;
  transition: transform $transition-fast;
}

.entry-preview {
  padding: 0 20px 16px 54px;

  p {
    color: $text-secondary;
    font-size: 13px;
    line-height: 1.6;
    margin: 0;
    padding: 12px 16px;
    background: $bg-root;
    border-radius: $radius-sm;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
