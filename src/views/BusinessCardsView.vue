<script setup lang="ts">
import { computed } from 'vue'
import VisualInsightCard from '@/components/business/VisualInsightCard.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const cards = computed(() => appStore.businessVisualCards)
const commandCards = computed(() => cards.value.filter(card => card.routeName === 'businessCards' || card.category === 'investment' || card.category === 'general'))
const routedCards = computed(() => cards.value.filter(card => card.routeName !== 'businessCards' && card.category !== 'investment' && card.category !== 'general'))
const visualMix = computed(() => {
  const counts = commandCards.value.reduce<Record<string, number>>((acc, card) => {
    acc[card.visualType] = (acc[card.visualType] || 0) + 1
    return acc
  }, {})
  return Object.entries(counts).map(([type, count]) => ({ type, count }))
})

function routeLabel(routeName: string) {
  if (routeName === 'marketAnalysis') return 'Market Analysis'
  if (routeName === 'competitors') return 'Competitors'
  if (routeName === 'businessCards') return 'Business Cards'
  return routeName
}

function accentForCard(category: string) {
  if (category === 'investment') return 'gold'
  if (category === 'market') return 'cyan'
  if (category === 'competitor') return 'red'
  return 'purple'
}
</script>

<template>
  <div class="business-cards-page">
    <section class="card hero-card">
      <div>
        <p class="eyebrow">VISUAL BUSINESS COMMAND CENTER</p>
        <h2>Chat answers now become human-readable visual intelligence cards</h2>
        <p>
          This tab is no longer a text bucket. It classifies every unmatched business command into executive cards with KPI tiles, visual signal charts, risk lights, matrices, evidence labels, and next-action panels.
        </p>
      </div>
      <div class="stats">
        <span class="badge badge-ok">{{ cards.length }} total visual cards</span>
        <span class="badge badge-gold">{{ commandCards.length }} business/fallback</span>
        <span class="badge badge-info">{{ routedCards.length }} routed mirrors</span>
      </div>
    </section>

    <section class="card visual-system-card">
      <div class="card-header">
        <h3>🧠 Visual Classification System</h3>
        <span class="badge badge-info">Research-backed layout</span>
      </div>
      <div class="system-grid">
        <div class="system-tile">
          <strong>1</strong>
          <span>Classify</span>
          <p>Market, competitor, investment, procurement, risk, or general business.</p>
        </div>
        <div class="system-tile">
          <strong>2</strong>
          <span>Visualize</span>
          <p>KPI cards, chart bars, decision matrices, and risk boards instead of raw text.</p>
        </div>
        <div class="system-tile">
          <strong>3</strong>
          <span>Act</span>
          <p>Every card ends with evidence status, confidence, and a next action.</p>
        </div>
      </div>
      <div v-if="visualMix.length" class="visual-mix">
        <div v-for="item in visualMix" :key="item.type" class="mix-pill">
          <span>{{ item.type }}</span>
          <strong>{{ item.count }}</strong>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <h3>🧩 Business Command Visual Cards</h3>
        <span class="badge badge-gold">{{ commandCards.length }} card{{ commandCards.length === 1 ? '' : 's' }}</span>
      </div>
      <div v-if="commandCards.length === 0" class="empty-state">
        No visual business cards yet. Ask Chat a feasibility, investment, plant, supplier, strategy, or general business question. Use <b>@business</b> to force this tab.
      </div>
      <div class="visual-grid vivid-grid">
        <VisualInsightCard
          v-for="card in commandCards"
          :key="card.id"
          :card="card"
          :accent="accentForCard(card.category)"
          removable
          @remove="appStore.removeBusinessVisualCard"
        />
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <h3>🔁 Visual Cards Also Routed to Specialist Tabs</h3>
        <span class="badge badge-ok">Market / Competitor mirrors</span>
      </div>
      <div v-if="routedCards.length === 0" class="empty-state">
        No specialist routed cards yet. Ask Chat about market size, pricing, competitors, positioning, or comparison.
      </div>
      <div class="compact-list">
        <div v-for="card in routedCards" :key="card.id" class="compact-row">
          <span class="badge badge-info">{{ routeLabel(card.routeName) }}</span>
          <span class="compact-title">{{ card.title }}</span>
          <span class="confidence">{{ card.visualType }} · {{ card.confidence }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.business-cards-page { max-width: 1240px; display: flex; flex-direction: column; gap: 20px; }
.hero-card { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; background: radial-gradient(circle at top right, rgba($accent-gold, .13), transparent 34%), $bg-card; }
.eyebrow { color: $accent-gold; font-size: 11px; font-weight: 900; letter-spacing: .11em; margin-bottom: 6px; }
.hero-card h2 { color: $text-primary; font-size: 24px; margin-bottom: 8px; line-height: 1.25; }
.hero-card p { color: $text-secondary; line-height: 1.6; max-width: 780px; }
.stats { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.visual-system-card { background: linear-gradient(135deg, rgba($accent-cyan, .08), rgba($accent-gold, .05)), $bg-card; }
.system-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.system-tile { border: 1px solid rgba($border-color-light, .65); border-radius: $radius-lg; background: rgba(255,255,255,.035); padding: 14px; }
.system-tile strong { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 999px; background: rgba($accent-gold, .14); color: $accent-gold; margin-bottom: 10px; }
.system-tile span { display: block; color: $text-primary; font-weight: 800; margin-bottom: 6px; }
.system-tile p { color: $text-secondary; font-size: 12px; line-height: 1.5; }
.visual-mix { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.mix-pill { display: flex; gap: 8px; align-items: center; border: 1px solid rgba($border-color-light, .6); border-radius: 999px; padding: 7px 10px; color: $text-secondary; font-size: 11px; }
.mix-pill strong { color: $accent-gold; }
.visual-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; }
.compact-list { display: flex; flex-direction: column; gap: 8px; }
.compact-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 0; border-bottom: 1px solid rgba($border-color, .5); }
.compact-title { flex: 1; color: $text-primary; font-size: 13px; }
.confidence { color: $text-muted; font-size: 12px; }
.empty-state { text-align: center; padding: 32px; color: $text-muted; font-size: 13px; }
@media (max-width: 860px) { .hero-card { flex-direction: column; } .stats { justify-content: flex-start; } .system-grid, .visual-grid { grid-template-columns: 1fr; } }
</style>
