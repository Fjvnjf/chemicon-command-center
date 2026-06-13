<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import type { Briefing } from '@/stores/app'

interface MarketData {
  segment: string
  size: string
  growth: string
  opportunity: string
  chemiconFit: 'Strong' | 'Moderate' | 'Emerging'
  priority: 'High' | 'Medium' | 'Low'
}

const appStore = useAppStore()

const marketSegments = ref<MarketData[]>([
  { segment: 'Textile Auxiliaries (China)', size: '$12.8B', growth: '6.2% CAGR', opportunity: 'Domestic softener demand growing 8%+', chemiconFit: 'Strong', priority: 'High' },
  { segment: 'Esterquat (Global)', size: '$2.4B', growth: '7.8% CAGR', opportunity: 'Replacing DTDMAC, bio-based trend', chemiconFit: 'Strong', priority: 'High' },
  { segment: 'Silicone Softeners', size: '$1.8B', growth: '5.4% CAGR', opportunity: 'Premium segment, high margin', chemiconFit: 'Moderate', priority: 'Medium' },
  { segment: 'Home Care Surfactants', size: '$4.2B', growth: '4.1% CAGR', opportunity: 'Adjacent market, cross-sell', chemiconFit: 'Moderate', priority: 'Medium' },
  { segment: 'SE Asia Textile Chemicals', size: '$3.6B', growth: '7.1% CAGR', opportunity: 'Export from China WFOE', chemiconFit: 'Emerging', priority: 'Low' },
])

// Price trend data (simulated)
const priceTrends = ref([
  { month: 'Jan', fattyAcid: 1250, esterquat: 2200 },
  { month: 'Feb', fattyAcid: 1280, esterquat: 2250 },
  { month: 'Mar', fattyAcid: 1320, esterquat: 2300 },
  { month: 'Apr', fattyAcid: 1300, esterquat: 2280 },
  { month: 'May', fattyAcid: 1350, esterquat: 2350 },
  { month: 'Jun', fattyAcid: 1380, esterquat: 2400 },
])

// Import/Export analysis
const tradeData = ref([
  { country: 'Bangladesh', imports: '125,000 mt', value: '$278M', growth: '+12%' },
  { country: 'Vietnam', imports: '98,000 mt', value: '$210M', growth: '+9%' },
  { country: 'Indonesia', imports: '85,000 mt', value: '$185M', growth: '+7%' },
  { country: 'India', imports: '210,000 mt', value: '$445M', growth: '+15%' },
  { country: 'Pakistan', imports: '72,000 mt', value: '$155M', growth: '+8%' },
])

// Chat intelligence feed
const chatInsights = computed(() => appStore.getInsightsByCategory('market'))
const marketBriefings = computed(() => appStore.getBriefingsByCategory('market'))
const expandedBriefing = ref<number | null>(null)

function toggleBriefing(id: number) {
  expandedBriefing.value = expandedBriefing.value === id ? null : id
}

const priorityBadge = (p: string) => p === 'High' ? 'badge-ok' : p === 'Medium' ? 'badge-warn' : 'badge-info'
const fitBadge = (f: string) => f === 'Strong' ? 'badge-ok' : f === 'Moderate' ? 'badge-warn' : 'badge-info'
</script>

<template>
  <div class="market-page">
    <!-- Market Segments Table -->
    <div class="card">
      <div class="card-header">
        <h3>📈 Market Segments — Textile Chemical Opportunity</h3>
        <span class="badge badge-ok">Live Data</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Market Size</th>
              <th>Growth</th>
              <th>Opportunity</th>
              <th>Chemicon Fit</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in marketSegments" :key="row.segment">
              <td class="fw-600">{{ row.segment }}</td>
              <td class="text-gold">{{ row.size }}</td>
              <td>{{ row.growth }}</td>
              <td>{{ row.opportunity }}</td>
              <td><span class="badge" :class="fitBadge(row.chemiconFit)">{{ row.chemiconFit }}</span></td>
              <td><span class="badge" :class="priorityBadge(row.priority)">{{ row.priority }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Two-column: Price Trends + Trade Data -->
    <div class="two-col">
      <!-- Price Trends -->
      <div class="card">
        <div class="card-header">
          <h3>💲 Raw Material Price Trends</h3>
          <span class="text-muted" style="font-size:11px">$/mt FOB China</span>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Fatty Acid</th>
                <th>Esterquat EQ90</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in priceTrends" :key="row.month">
                <td>{{ row.month }}</td>
                <td>${{ row.fattyAcid.toLocaleString() }}</td>
                <td class="text-gold">${{ row.esterquat.toLocaleString() }}</td>
                <td class="text-green">${{ (row.esterquat - row.fattyAcid).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Import Markets -->
      <div class="card">
        <div class="card-header">
          <h3>🌏 Key Import Markets — Textile Auxiliaries</h3>
          <span class="badge badge-info">HS 3809.91</span>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Volume</th>
                <th>Value</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tradeData" :key="row.country">
                <td class="fw-600">{{ row.country }}</td>
                <td>{{ row.imports }}</td>
                <td class="text-gold">{{ row.value }}</td>
                <td class="text-green">{{ row.growth }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Dynamic Briefings from Chat -->
    <div v-if="marketBriefings.length > 0" class="card">
      <div class="card-header">
        <h3>📝 Market Briefings from Chat</h3>
        <span class="badge badge-ok">{{ marketBriefings.length }} briefing{{ marketBriefings.length > 1 ? 's' : '' }}</span>
      </div>
      <div class="briefing-list">
        <div v-for="b in marketBriefings" :key="b.id" class="briefing-card" :class="{ expanded: expandedBriefing === b.id }">
          <div class="briefing-header" @click="toggleBriefing(b.id)">
            <span class="briefing-arrow">{{ expandedBriefing === b.id ? '▾' : '▸' }}</span>
            <span class="briefing-time">{{ b.time }}</span>
            <span class="briefing-question">{{ b.question.slice(0, 100) }}{{ b.question.length > 100 ? '...' : '' }}</span>
            <button class="briefing-dismiss" @click.stop="appStore.removeBriefing(b.id)" title="Remove">×</button>
          </div>
          <div v-if="expandedBriefing === b.id" class="briefing-body">
            <div class="briefing-summary" v-html="b.summary" />
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Intelligence Feed -->
    <div class="card">
      <div class="card-header">
        <h3>🔄 Recent Intelligence from Chat</h3>
        <span class="text-muted" style="font-size:11px">Auto-routed from AI conversations</span>
      </div>
      <div v-if="chatInsights.length === 0" class="empty-state">
        No market intelligence captured yet. Start a chat and mention markets, pricing, or industry trends.
      </div>
      <div v-for="insight in chatInsights" :key="insight.time" class="insight-row">
        <span class="insight-time">{{ insight.time }}</span>
        <span class="insight-topic">{{ insight.topic }}</span>
        <span class="badge badge-cyan">Market</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.market-page {
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th {
    text-align: left;
    padding: 10px 12px;
    color: $text-muted;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.05em;
    border-bottom: 1px solid $border-color;
    background: rgba($border-color, 0.3);
  }

  td {
    padding: 10px 12px;
    color: $text-secondary;
    border-bottom: 1px solid rgba($border-color, 0.5);
  }

  tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.fw-600 { font-weight: 600; color: $text-primary; }

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
.briefing-list { display: flex; flex-direction: column; gap: 8px; }
.briefing-card {
  border: 1px solid $border-color; border-radius: $radius-sm; overflow: hidden;
  transition: border-color $transition-fast;
  &:hover { border-color: rgba($accent-gold, 0.25); }
  &.expanded { border-color: $accent-gold; }
}
.briefing-header {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  cursor: pointer; background: $bg-card-hover;
  &:hover { background: rgba($accent-gold, 0.05); }
}
.briefing-arrow { color: $accent-gold; font-size: 14px; min-width: 16px; }
.briefing-time { font-size: 11px; color: $text-muted; font-family: $font-code; min-width: 85px; }
.briefing-question { flex: 1; font-size: 13px; color: $text-primary; font-weight: 600; }
.briefing-dismiss {
  background: none; border: none; color: $text-muted; font-size: 18px;
  cursor: pointer; padding: 0 4px; line-height: 1;
  &:hover { color: $accent-red; }
}
.briefing-body { padding: 14px; border-top: 1px solid $border-color; background: rgba(0,0,0,0.15); }
.briefing-summary { font-size: 13px; color: $text-secondary; line-height: 1.7; }
</style>
