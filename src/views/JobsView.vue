<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface CronJob {
  id?: string
  name?: string
  schedule?: string
  command?: string
  enabled?: boolean
  next_run?: string
  last_run?: string
  status?: string
  [key: string]: any
}

interface CronResponseOk {
  ok: true
  text: string
  jobs?: never
}

interface CronResponseJobs {
  jobs: CronJob[]
  ok?: never
}

type CronResponse = CronResponseOk | CronResponseJobs

import { BRIDGE_URL } from '../bridge-config'

const jobs = ref<CronJob[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const rawText = ref<string | null>(null)   // for the "text" (table) format

// Computed counts
const totalJobs = computed(() => jobs.value.length)
const enabledJobs = computed(() => jobs.value.filter(j => j.enabled !== false).length)

function parseTableText(text: string): CronJob[] {
  // Try to parse a markdown/plain table string into job objects
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Find header row and divider
  let headerIdx = -1
  let dividerIdx = -1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes('|') && !line.startsWith('|---') && !line.startsWith('|--')) {
      // Check if it looks like a header (contains typical column names)
      const lower = line.toLowerCase()
      if (
        lower.includes('name') ||
        lower.includes('schedule') ||
        lower.includes('command') ||
        lower.includes('enabled') ||
        lower.includes('id')
      ) {
        if (headerIdx === -1) {
          headerIdx = i
        }
      }
    }
  }

  if (headerIdx === -1) {
    // No parseable table found, treat as single info text
    return []
  }

  const headerLine = lines[headerIdx]
  const headers = headerLine
    .split('|')
    .map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'))
    .filter(Boolean)

  // Skip header and divider, parse data rows
  const parsed: CronJob[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.includes('|')) continue
    if (line.startsWith('|---') || line.startsWith('|--')) continue

    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length === 0) continue

    const job: CronJob = {}
    for (let j = 0; j < Math.min(headers.length, cells.length); j++) {
      let value: any = cells[j]
      // Parse booleans
      if (value === 'true' || value === 'True' || value === '✅') value = true
      else if (value === 'false' || value === 'False' || value === '❌') value = false
      job[headers[j]] = value
    }
    parsed.push(job)
  }

  return parsed
}

async function fetchCronJobs() {
  loading.value = true
  error.value = null
  rawText.value = null
  try {
    const resp = await fetch(`${BRIDGE_URL}/api/hermes/cron`)
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }
    const data: CronResponse = await resp.json()

    if (data.ok && data.text) {
      // Text (table) format
      rawText.value = data.text
      const parsed = parseTableText(data.text)
      if (parsed.length > 0) {
        jobs.value = parsed
      } else {
        jobs.value = []
      }
    } else if (data.jobs) {
      // Structured jobs array
      jobs.value = data.jobs
      rawText.value = null
    } else {
      jobs.value = []
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load cron jobs'
    jobs.value = []
    rawText.value = null
  } finally {
    loading.value = false
  }
}

// Columns to display in the table (derived from actual job keys)
const displayColumns = computed(() => {
  if (jobs.value.length === 0) return []
  const first = jobs.value[0]
  const preferred = ['name', 'schedule', 'command', 'enabled', 'next_run', 'last_run', 'status']
  // Start with preferred columns that exist in data, then append any extra keys
  const seen = new Set<string>()
  const cols: string[] = []
  for (const p of preferred) {
    if (p in first) {
      cols.push(p)
      seen.add(p)
    }
  }
  for (const key of Object.keys(first)) {
    if (!seen.has(key)) {
      cols.push(key)
      seen.add(key)
    }
  }
  return cols
})

function formatColumnValue(value: any): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? '✅' : '❌'
  return String(value)
}

function columnLabel(col: string): string {
  return col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

onMounted(() => {
  fetchCronJobs()
})
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="card-header">
        <h3>Cron Jobs</h3>
        <div class="header-badges">
          <span v-if="loading" class="badge badge-warn">Loading...</span>
          <span v-else-if="error" class="badge badge-warn">Error</span>
          <span v-else class="badge badge-ok">{{ totalJobs }} job<span v-if="totalJobs !== 1">s</span></span>
          <span v-if="!loading && !error && enabledJobs > 0" class="badge badge-info">{{ enabledJobs }} active</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="stub-content">
        <p class="stub-text">Loading cron jobs from agent bridge...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="stub-content">
        <p class="stub-text error-text">⚠️ {{ error }}</p>
        <button class="btn-retry" @click="fetchCronJobs">Retry</button>
      </div>

      <!-- Empty -->
      <div v-else-if="jobs.length === 0 && !rawText" class="stub-content">
        <p class="stub-text">No cron jobs configured.</p>
      </div>

      <!-- Raw text fallback (when table couldn't be parsed) -->
      <div v-else-if="jobs.length === 0 && rawText" class="raw-text-block">
        <pre class="raw-pre">{{ rawText }}</pre>
      </div>

      <!-- Jobs table -->
      <div v-else class="jobs-table-wrapper">
        <table class="jobs-table">
          <thead>
            <tr>
              <th v-for="col in displayColumns" :key="col" :class="`col-${col}`">
                {{ columnLabel(col) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(job, idx) in jobs" :key="job.id || idx" :class="{ 'row-disabled': job.enabled === false }">
              <td v-for="col in displayColumns" :key="col" :class="`col-${col}`">
                <span v-if="col === 'enabled'" class="enabled-badge" :class="{ on: job.enabled !== false, off: job.enabled === false }">
                  {{ job.enabled !== false ? 'Active' : 'Paused' }}
                </span>
                <span v-else-if="col === 'status'" class="status-badge" :class="job.status">
                  {{ formatColumnValue(job[col]) }}
                </span>
                <code v-else-if="col === 'command' || col === 'schedule'" class="code-cell">{{ formatColumnValue(job[col]) }}</code>
                <span v-else>{{ formatColumnValue(job[col]) }}</span>
              </td>
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
  max-width: 1100px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-badges {
    display: flex;
    gap: 8px;
  }
}

// ── Stub states ──
.stub-content {
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.stub-text {
  color: $text-muted;
  font-size: 14px;
  text-align: center;

  &.error-text {
    color: $accent-red;
  }
}

.btn-retry {
  margin-top: 8px;
  padding: 6px 20px;
  background: rgba($accent-gold, 0.12);
  border: 1px solid rgba($accent-gold, 0.25);
  border-radius: $radius-md;
  color: $accent-gold;
  font-size: 13px;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: rgba($accent-gold, 0.2);
  }
}

// ── Raw text fallback ──
.raw-text-block {
  padding: 16px 0;
}

.raw-pre {
  background: $bg-input;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  padding: 16px;
  color: $text-secondary;
  font-family: $font-code;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

// ── Jobs table ──
.jobs-table-wrapper {
  overflow-x: auto;
  padding: 8px 0;
}

.jobs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead {
    th {
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: $text-muted;
      border-bottom: 2px solid $border-color;
      white-space: nowrap;
      user-select: none;
    }
  }

  tbody {
    tr {
      transition: background $transition-fast;

      &:hover {
        background: $bg-card-hover;
      }

      &.row-disabled {
        opacity: 0.5;
      }

      td {
        padding: 10px 12px;
        border-bottom: 1px solid $border-color;
        color: $text-primary;
        white-space: nowrap;

        // Name column gets more weight
        &.col-name {
          font-weight: 600;
          color: $text-primary;
          font-family: $font-code;
        }
      }
    }
  }
}

.code-cell {
  font-family: $font-code;
  font-size: 12px;
  color: $accent-cyan;
  background: $bg-input;
  padding: 3px 8px;
  border-radius: $radius-sm;
}

.enabled-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: $radius-sm;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;

  &.on {
    background: rgba($accent-green, 0.15);
    color: $accent-green;
  }

  &.off {
    background: rgba($accent-orange, 0.15);
    color: $accent-orange;
  }
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: $radius-sm;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;

  &.running,
  &.active {
    background: rgba($accent-green, 0.15);
    color: $accent-green;
  }

  &.failed,
  &.error {
    background: rgba($accent-red, 0.15);
    color: $accent-red;
  }

  &.pending,
  &.scheduled {
    background: rgba($accent-cyan, 0.15);
    color: $accent-cyan;
  }
}
</style>
