<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ekkoFeatures } from '@/data/ekkoFeatures'

const route = useRoute()
const feature = computed(() => {
  const key = String(route.meta.featureKey || '')
  return ekkoFeatures[key]
})

const statusClass = computed(() => {
  if (!feature.value) return 'badge-warn'
  if (feature.value.status === 'Live') return 'badge-ok'
  if (feature.value.status === 'Partial') return 'badge-info'
  return 'badge-warn'
})
</script>

<template>
  <div v-if="feature" class="ekko-page">
    <section class="hero-card">
      <div class="hero-icon">{{ feature.icon }}</div>
      <div>
        <p class="eyebrow">EKKOLearnAI / Hermes Studio integration</p>
        <h1>{{ feature.title }}</h1>
        <p class="subtitle">{{ feature.workshopStatus }}</p>
        <div class="badges">
          <span class="badge" :class="statusClass">{{ feature.status }}</span>
          <span class="badge badge-info">Workshop route active</span>
          <span v-if="feature.endpoint" class="badge badge-muted">{{ feature.endpoint }}</span>
        </div>
      </div>
    </section>

    <section class="grid">
      <article class="card">
        <h2>Source of truth</h2>
        <p>{{ feature.source }}</p>
        <p class="note">This page is adapted from upstream EKKOLearnAI/Hermes Studio feature extraction. It is separate from Chemicon business intelligence unless explicitly connected.</p>
      </article>

      <article class="card">
        <h2>Next Hermes actions</h2>
        <ul>
          <li v-for="action in feature.actions" :key="action">{{ action }}</li>
        </ul>
      </article>
    </section>

    <section class="card">
      <h2>Capability map</h2>
      <div class="capability-list">
        <div v-for="item in feature.capabilities" :key="item.title" class="capability">
          <strong>{{ item.title }}</strong>
          <span>{{ item.detail }}</span>
        </div>
      </div>
    </section>

    <section class="card warning-card">
      <h2>Integration discipline</h2>
      <p>No fake live backend is claimed here. If a capability is not wired yet, it stays marked as staged until tested against Workshop's live same-origin deployment.</p>
      <div class="quick-links">
        <RouterLink :to="{ name: 'chat' }">Open Chat</RouterLink>
        <RouterLink :to="{ name: 'settings' }">Open Settings</RouterLink>
        <RouterLink :to="{ name: 'performance' }">Open Health</RouterLink>
      </div>
    </section>
  </div>

  <div v-else class="ekko-page">
    <section class="hero-card">
      <div class="hero-icon">⚠️</div>
      <div>
        <h1>Unknown EKKOLearnAI Feature</h1>
        <p class="subtitle">This route is registered, but no feature metadata was found.</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.ekko-page { padding: 24px; max-width: 1180px; margin: 0 auto; }
.hero-card, .card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 16px;
  box-shadow: $shadow-md;
}
.hero-card { display: flex; gap: 18px; padding: 24px; margin-bottom: 18px; }
.hero-icon { font-size: 42px; width: 64px; height: 64px; border-radius: 18px; display: grid; place-items: center; background: rgba($accent-cyan, 0.12); }
.eyebrow { margin: 0 0 6px; color: $accent-cyan; text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: .08em; }
h1 { margin: 0 0 8px; color: $text-primary; font-size: 28px; }
h2 { margin: 0 0 12px; color: $text-primary; font-size: 16px; }
.subtitle, p, li { color: $text-secondary; line-height: 1.55; }
.badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; border: 1px solid transparent; }
.badge-ok { color: $accent-green; background: rgba($accent-green, .12); border-color: rgba($accent-green, .35); }
.badge-info { color: $accent-cyan; background: rgba($accent-cyan, .12); border-color: rgba($accent-cyan, .35); }
.badge-warn { color: $accent-orange; background: rgba($accent-orange, .12); border-color: rgba($accent-orange, .35); }
.badge-muted { color: $text-muted; background: rgba($border-color, .35); border-color: $border-color; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-bottom: 18px; }
.card { padding: 20px; margin-bottom: 18px; }
.note { margin-top: 12px; color: $text-muted; font-size: 13px; }
ul { padding-left: 18px; margin: 0; }
.capability-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.capability { padding: 14px; border: 1px solid $border-color; border-radius: 12px; background: $bg-card-hover; display: flex; flex-direction: column; gap: 6px; }
.capability strong { color: $accent-gold; }
.capability span { color: $text-secondary; font-size: 13px; line-height: 1.45; }
.warning-card { border-color: rgba($accent-orange, .35); }
.quick-links { display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
.quick-links a { color: $accent-cyan; font-weight: 700; text-decoration: none; }
.quick-links a:hover { text-decoration: underline; }
@media (max-width: 900px) { .grid, .capability-list { grid-template-columns: 1fr; } .hero-card { flex-direction: column; } }
</style>
