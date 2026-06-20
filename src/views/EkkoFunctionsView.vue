<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ekkoFeatureList } from '@/data/ekkoFeatures'

const totals = computed(() => ({
  all: ekkoFeatureList.length,
  live: ekkoFeatureList.filter((f) => f.status === 'Live').length,
  partial: ekkoFeatureList.filter((f) => f.status === 'Partial').length,
  staged: ekkoFeatureList.filter((f) => f.status === 'Staged').length,
}))

const routeByFeature: Record<string, string> = {
  chatSessions: 'ekkoChatSessions',
  globalAgent: 'globalAgent',
  channels: 'ekkoChannels',
  usageAnalytics: 'ekkoUsageAnalytics',
  jobs: 'ekkoJobs',
  kanban: 'kanban',
  models: 'ekkoModels',
  profiles: 'ekkoProfiles',
  files: 'ekkoFiles',
  groupChat: 'ekkoGroupChat',
  codingAgents: 'codingAgents',
  skillsMemory: 'ekkoSkillsMemory',
  logs: 'ekkoLogs',
  runtimeAdmin: 'runtimeAdmin',
  authSecurity: 'authSecurity',
  settings: 'ekkoSettings',
  voice: 'voice',
  terminal: 'ekkoTerminal',
  distribution: 'distribution',
}

function statusClass(status: string) {
  if (status === 'Live') return 'badge-ok'
  if (status === 'Partial') return 'badge-info'
  return 'badge-warn'
}
</script>

<template>
  <div class="ekko-overview">
    <section class="hero-card">
      <div class="hero-icon">🧬</div>
      <div>
        <p class="eyebrow">EKKOLearnAI / Hermes Studio feature parity</p>
        <h1>All EKKOL Functions in Workshop</h1>
        <p class="subtitle">
          This is the full upstream feature inventory mapped into the Chemicon Workshop UI. Items marked Partial or Staged are visible honestly; they are not claimed as fully wired until backend/API parity is tested live.
        </p>
        <div class="stats">
          <span class="badge badge-muted">{{ totals.all }} total classes</span>
          <span class="badge badge-ok">{{ totals.live }} live</span>
          <span class="badge badge-info">{{ totals.partial }} partial</span>
          <span class="badge badge-warn">{{ totals.staged }} staged</span>
        </div>
      </div>
    </section>

    <section class="feature-grid">
      <RouterLink
        v-for="feature in ekkoFeatureList"
        :key="feature.key"
        class="feature-card"
        :to="{ name: routeByFeature[feature.key] || 'ekkoFunctions' }"
      >
        <div class="card-top">
          <span class="feature-icon">{{ feature.icon }}</span>
          <span class="badge" :class="statusClass(feature.status)">{{ feature.status }}</span>
        </div>
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.workshopStatus }}</p>
        <div class="meta-row">
          <span>{{ feature.upstreamRoutes.length }} routes</span>
          <span>{{ feature.upstreamViews.length }} views</span>
          <span>{{ feature.capabilities.length }} capabilities</span>
        </div>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.ekko-overview { padding: 24px; max-width: 1360px; margin: 0 auto; }
.hero-card, .feature-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 16px;
  box-shadow: $shadow-md;
}
.hero-card { display: flex; gap: 18px; padding: 24px; margin-bottom: 18px; }
.hero-icon { font-size: 42px; width: 64px; height: 64px; border-radius: 18px; display: grid; place-items: center; background: rgba($accent-cyan, 0.12); }
.eyebrow { margin: 0 0 6px; color: $accent-cyan; text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: .08em; }
h1 { margin: 0 0 8px; color: $text-primary; font-size: 28px; }
h2 { margin: 10px 0 8px; color: $text-primary; font-size: 16px; }
.subtitle, p { color: $text-secondary; line-height: 1.55; }
.stats { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; border: 1px solid transparent; }
.badge-ok { color: $accent-green; background: rgba($accent-green, .12); border-color: rgba($accent-green, .35); }
.badge-info { color: $accent-cyan; background: rgba($accent-cyan, .12); border-color: rgba($accent-cyan, .35); }
.badge-warn { color: $accent-orange; background: rgba($accent-orange, .12); border-color: rgba($accent-orange, .35); }
.badge-muted { color: $text-muted; background: rgba($border-color, .35); border-color: $border-color; }
.feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.feature-card { padding: 16px; text-decoration: none; transition: transform .15s ease, border-color .15s ease; }
.feature-card:hover { transform: translateY(-2px); border-color: rgba($accent-gold, .45); }
.card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.feature-icon { font-size: 28px; }
.feature-card p { min-height: 68px; margin: 0 0 12px; font-size: 13px; }
.meta-row { display: flex; flex-wrap: wrap; gap: 8px; color: $text-muted; font-size: 11px; }
.meta-row span { border: 1px solid $border-color; border-radius: 999px; padding: 3px 8px; background: $bg-card-hover; }
@media (max-width: 1100px) { .feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) { .feature-grid { grid-template-columns: 1fr; } .hero-card { flex-direction: column; } }
</style>
