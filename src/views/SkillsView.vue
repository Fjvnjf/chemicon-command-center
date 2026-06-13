<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

interface Skill {
  name: string
  category: string
  path: string
}

interface SkillsResponse {
  count: number
  skills: Skill[]
}

const appStore = useAppStore()

const skills = ref<Skill[]>([])
const totalCount = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)

const BRIDGE_URL = 'https://salon-brisbane-refused-tennis.trycloudflare.com'

// Group skills by category
const skillsByCategory = computed(() => {
  const groups: Record<string, Skill[]> = {}
  for (const skill of skills.value) {
    const cat = skill.category || 'Uncategorized'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(skill)
  }
  // Sort categories alphabetically
  const sorted: Record<string, Skill[]> = {}
  Object.keys(groups)
    .sort()
    .forEach(key => {
      sorted[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name))
    })
  return sorted
})

async function fetchSkills() {
  loading.value = true
  error.value = null
  try {
    const resp = await fetch(`${BRIDGE_URL}/api/hermes/skills`)
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }
    const data: SkillsResponse = await resp.json()
    skills.value = data.skills ?? []
    totalCount.value = data.count ?? data.skills?.length ?? 0
  } catch (err: any) {
    error.value = err.message || 'Failed to load skills'
    skills.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSkills()
})
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="card-header">
        <h3>Skills</h3>
        <div class="header-badges">
          <span v-if="loading" class="badge badge-warn">Loading...</span>
          <span v-else-if="error" class="badge badge-warn">Error</span>
          <span v-else class="badge badge-ok">{{ totalCount }} skill<span v-if="totalCount !== 1">s</span></span>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="stub-content">
        <p class="stub-text">Loading skills from agent bridge...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="stub-content">
        <p class="stub-text error-text">⚠️ {{ error }}</p>
        <button class="btn-retry" @click="fetchSkills">Retry</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="skills.length === 0" class="stub-content">
        <p class="stub-text">No skills found.</p>
      </div>

      <!-- Skills list grouped by category -->
      <div v-else class="skills-list">
        <div
          v-for="(catSkills, category) in skillsByCategory"
          :key="category"
          class="skill-group"
        >
          <div class="group-header">
            <h4 class="group-title">{{ category }}</h4>
            <span class="group-count">{{ catSkills.length }}</span>
          </div>
          <ul class="group-items">
            <li v-for="skill in catSkills" :key="skill.name" class="skill-item">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-path" :title="skill.path">{{ skill.path }}</span>
            </li>
          </ul>
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-badges {
    display: flex;
    gap: 8px;
  }
}

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

.skills-list {
  padding: 8px 0;
}

.skill-group {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 0 4px;

  .group-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: $accent-cyan;
    margin: 0;
  }

  .group-count {
    font-size: 11px;
    font-family: $font-code;
    color: $text-muted;
    background: $bg-input;
    padding: 2px 8px;
    border-radius: $radius-sm;
  }
}

.group-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.skill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: $radius-md;
  transition: background $transition-fast;

  &:hover {
    background: $bg-card-hover;
  }

  .skill-name {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    font-family: $font-code;
  }

  .skill-path {
    font-size: 12px;
    color: $text-muted;
    font-family: $font-code;
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    direction: rtl;
    text-align: left;
  }
}
</style>
