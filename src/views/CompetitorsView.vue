<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import type { Briefing } from '@/stores/app'

interface CompetitorCard {
  company: string
  headquarters: string
  revenue: string
  products: string
  strengths: string
  weaknesses: string
  threatLevel: 'High' | 'Medium' | 'Low'
  marketShare: string
}

const appStore = useAppStore()

const competitors = ref<CompetitorCard[]>([
  {
    company: 'Evonik Industries',
    headquarters: 'Germany',
    revenue: '$18.5B',
    products: 'TEGO softeners, organomodified silicones',
    strengths: 'Global R&D, brand reputation, full portfolio',
    weaknesses: 'Premium pricing, slow local support in Asia',
    threatLevel: 'High',
    marketShare: '~18%',
  },
  {
    company: 'Solvay (Syensqo)',
    headquarters: 'Belgium',
    revenue: '$15.2B',
    products: 'Rhodasurf, specialty surfactants',
    strengths: 'Broad chemical platform, China manufacturing',
    weaknesses: 'Textile not core focus, complex product codes',
    threatLevel: 'High',
    marketShare: '~12%',
  },
  {
    company: 'Zhejiang Transfar',
    headquarters: 'China (Hangzhou)',
    revenue: '$2.1B',
    products: 'Full textile aux range, esterquats',
    strengths: 'China distribution network, competitive pricing',
    weaknesses: 'Quality inconsistency, limited export capability',
    threatLevel: 'High',
    marketShare: '~15%',
  },
  {
    company: 'Guangdong Demei',
    headquarters: 'China (Guangdong)',
    revenue: '$800M',
    products: 'Cationic softeners, silicone emulsions',
    strengths: 'Low cost, fast delivery in South China',
    weaknesses: 'No R&D, limited technical service, copycat formulations',
    threatLevel: 'Medium',
    marketShare: '~8%',
  },
  {
    company: 'Kao Corporation',
    headquarters: 'Japan',
    revenue: '$13.8B',
    products: 'KAOWAX, specialty esterquats',
    strengths: 'Japanese quality, long history in surfactants',
    weaknesses: 'Conservative approach to China market, high price',
    threatLevel: 'Medium',
    marketShare: '~6%',
  },
])

const marketShareData = ref([
  { company: 'Evonik', share: 18 },
  { company: 'Zhejiang Transfar', share: 15 },
  { company: 'Solvay', share: 12 },
  { company: 'Guangdong Demei', share: 8 },
  { company: 'Kao', share: 6 },
  { company: 'Chemicon (target)', share: 5 },
  { company: 'Others', share: 36 },
])

// Chat intelligence — from shared store
const chatInsights = computed(() => appStore.getInsightsByCategory('competitor'))
const competitorBriefings = computed(() => appStore.getBriefingsByCategory('competitor'))
const expandedBriefing = ref<number | null>(null)

function toggleBriefing(id: number) {
  expandedBriefing.value = expandedBriefing.value === id ? null : id
}

function threatBadge(level: string) {
  return level === 'High' ? 'badge-danger' : level === 'Medium' ? 'badge-warn' : 'badge-info'
}
</script>

<template>
  <div class="competitors-page">
    <!-- Competitor Cards -->
    <div class="card">
      <div class="card-header">
        <h3>⚔️ Competitor Landscape — China Textile Softener Market</h3>
        <span class="badge badge-ok">5 Tracked</span>
      </div>

      <div class="competitor-grid">
        <div v-for="comp in competitors" :key="comp.company" class="comp-card">
          <div class="comp-header">
            <h4>{{ comp.company }}</h4>
            <span class="badge" :class="threatBadge(comp.threatLevel)">{{ comp.threatLevel }} Threat</span>
          </div>
          <div class="comp-meta">
            <div class="meta-row">
              <span class="meta-label">HQ</span>
              <span class="meta-value">{{ comp.headquarters }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Revenue</span>
              <span class="meta-value text-gold">{{ comp.revenue }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Market Share</span>
              <span class="meta-value">{{ comp.marketShare }}</span>
            </div>
          </div>
          <div class="comp-detail">
            <div class="detail-section">
              <span class="detail-label">Products</span>
              <p>{{ comp.products }}</p>
            </div>
            <div class="comp-strengths-weakness">
              <div class="sw-box strengths">
                <span class="sw-label text-green">💪 Strengths</span>
                <p>{{ comp.strengths }}</p>
              </div>
              <div class="sw-box weaknesses">
                <span class="sw-label text-red">🎯 Weaknesses</span>
                <p>{{ comp.weaknesses }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dynamic Briefings from Chat -->
    <div v-if="competitorBriefings.length > 0" class="card">
      <div class="card-header">
        <h3>📝 Briefings from Chat</h3>
        <span class="badge badge-ok">{{ competitorBriefings.length }} briefing{{ competitorBriefings.length > 1 ? 's' : '' }}</span>
      </div>
      <div class="briefing-list">
        <div v-for="b in competitorBriefings" :key="b.id" class="briefing-card" :class="{ expanded: expandedBriefing === b.id }">
          <div class="briefing-header" @click="toggleBriefing(b.id)">
            <span class="briefing-arrow">{{ expandedBriefing === b.id ? '▾' : '▸' }}</span>
            <span class="briefing-time">{{ b.time }}</span>
            <span class="briefing-question">{{ b.question.slice(0, 100) }}{{ b.question.length > 100 ? '...' : '' }}</span>
            <button class="briefing-dismiss" @click.stop="appStore.removeBriefing(b.id)" title="Remove">×</button>
          </div>
          <div v-if="expandedBriefing === b.id" class="briefing-body">
            <div class="briefing-summary" v-html="b.summary.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>').replace(/\\n/g, '<br>')" />
          </div>
        </div>
      </div>
    </div>

    <!-- Market Share + Chat Insights -->
    <div class="two-col">
      <!-- Market Share -->
      <div class="card">
        <div class="card-header">
          <h3>📊 Estimated Market Share — China Softener</h3>
        </div>
        <div class="share-list">
          <div v-for="item in marketShareData" :key="item.company" class="share-row">
            <span class="share-name" :class="{ 'text-gold': item.company === 'Chemicon (target)' }">
              {{ item.company }}
            </span>
            <div class="share-bar-track">
              <div class="share-bar-fill" :style="{ width: item.share + '%' }" />
            </div>
            <span class="share-pct">{{ item.share }}%</span>
          </div>
        </div>
      </div>

      <!-- Chat Intelligence Feed -->
      <div class="card">
        <div class="card-header">
          <h3>🔄 Recent Intelligence from Chat</h3>
          <span class="text-muted" style="font-size:11px">Auto-routed competitor mentions</span>
        </div>
        <div v-if="chatInsights.length === 0" class="empty-state">
          No competitor intelligence captured yet. Mention competitors in chat to auto-populate.
        </div>
        <div v-for="insight in chatInsights" :key="insight.time" class="insight-row">
          <span class="insight-time">{{ insight.time }}</span>
          <span class="insight-topic">{{ insight.topic }}</span>
          <span class="badge badge-danger" style="font-size:10px">Competitor</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.competitors-page {
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.competitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.comp-card {
  background: $bg-card-hover;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  padding: 16px;
  transition: border-color $transition-fast;

  &:hover {
    border-color: rgba($accent-gold, 0.3);
  }
}

.comp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h4 {
    font-size: 14px;
    font-weight: 700;
    color: $text-primary;
  }
}

.comp-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid $border-color;
}

.meta-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 9px;
  text-transform: uppercase;
  color: $text-muted;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: 13px;
  color: $text-secondary;
  font-weight: 600;
}

.comp-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-section {
  .detail-label {
    font-size: 10px;
    text-transform: uppercase;
    color: $text-muted;
    display: block;
    margin-bottom: 4px;
  }

  p {
    font-size: 12px;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.comp-strengths-weakness {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.sw-box {
  padding: 8px;
  border-radius: $radius-sm;
  background: rgba(255, 255, 255, 0.02);

  .sw-label {
    font-size: 10px;
    font-weight: 700;
    display: block;
    margin-bottom: 4px;
  }

  p {
    font-size: 11px;
    color: $text-secondary;
    line-height: 1.4;
  }
}

// ── Market Share ──
.share-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.share-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.share-name {
  font-size: 12px;
  color: $text-secondary;
  min-width: 120px;
  font-weight: 600;
}

.share-bar-track {
  flex: 1;
  height: 8px;
  background: $border-color;
  border-radius: 4px;
  overflow: hidden;
}

.share-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, $accent-cyan, $accent-gold);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.share-pct {
  font-size: 12px;
  color: $text-muted;
  font-family: $font-code;
  min-width: 36px;
  text-align: right;
}

// ── Two col ──
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

// ── Chat insights ──
.insight-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba($border-color, 0.5);

  &:last-child { border-bottom: none; }

  .insight-time {
    font-size: 11px;
    color: $text-muted;
    font-family: $font-code;
    min-width: 90px;
  }

  .insight-topic {
    flex: 1;
    font-size: 13px;
    color: $text-primary;
  }
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: $text-muted;
  font-size: 13px;
}

// ── Briefing cards ──
.briefing-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.briefing-card {
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  overflow: hidden;
  transition: border-color $transition-fast;

  &:hover { border-color: rgba($accent-gold, 0.25); }
  &.expanded { border-color: $accent-gold; }
}

.briefing-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  background: $bg-card-hover;
  transition: background $transition-fast;

  &:hover { background: rgba($accent-gold, 0.05); }
}

.briefing-arrow {
  color: $accent-gold;
  font-size: 14px;
  min-width: 16px;
}

.briefing-time {
  font-size: 11px;
  color: $text-muted;
  font-family: $font-code;
  min-width: 85px;
}

.briefing-question {
  flex: 1;
  font-size: 13px;
  color: $text-primary;
  font-weight: 600;
}

.briefing-dismiss {
  background: none;
  border: none;
  color: $text-muted;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;

  &:hover { color: $accent-red; }
}

.briefing-body {
  padding: 14px;
  border-top: 1px solid $border-color;
  background: rgba(0,0,0,0.15);
}

.briefing-summary {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.7;
}
</style>
