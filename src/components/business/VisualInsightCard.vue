<script setup lang="ts">
import type { BusinessVisualCard, ChartSegment, MatrixRow, RiskItem, VisualMetric } from '@/stores/app'

const props = defineProps<{
  card: BusinessVisualCard
  accent?: 'gold' | 'cyan' | 'red' | 'green' | 'purple'
  removable?: boolean
}>()

const emit = defineEmits<{
  remove: [id: number]
}>()

const accentClass = () => `accent-${props.accent || accentForCategory(props.card.category)}`

function accentForCategory(category: string) {
  if (category === 'market') return 'cyan'
  if (category === 'competitor') return 'red'
  if (category === 'investment') return 'gold'
  return 'purple'
}

function confidenceClass(confidence: string) {
  if (confidence.includes('Critical')) return 'risk-critical'
  if (confidence.includes('Low')) return 'risk-low'
  if (confidence.includes('Higher')) return 'risk-good'
  return 'risk-medium'
}

function metricClass(metric: VisualMetric) {
  return `metric-${metric.tone || 'neutral'}`
}

function segmentStyle(segment: ChartSegment, index: number) {
  const palette = ['#c9a84c', '#4fc3f7', '#34d399', '#fb923c', '#a78bfa', '#f87171']
  return {
    width: `${Math.max(6, Math.min(100, segment.value))}%`,
    background: segment.color || palette[index % palette.length],
  }
}

function donutStyle(segments: ChartSegment[]) {
  if (!segments.length) return {}
  const palette = ['#c9a84c', '#4fc3f7', '#34d399', '#fb923c', '#a78bfa', '#f87171']
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0) || 1
  let cursor = 0
  const stops = segments.map((segment, index) => {
    const start = cursor
    const end = cursor + (Math.max(0, segment.value) / total) * 100
    cursor = end
    const color = segment.color || palette[index % palette.length]
    return `${color} ${start.toFixed(2)}% ${end.toFixed(2)}%`
  })
  return { background: `conic-gradient(${stops.join(', ')})` }
}

function rowToneClass(row: MatrixRow) {
  return `row-${row.tone || 'neutral'}`
}

function riskClass(risk: RiskItem) {
  if (risk.severity === 'Critical') return 'risk-critical'
  if (risk.severity === 'High') return 'risk-low'
  if (risk.severity === 'Low') return 'risk-good'
  return 'risk-medium'
}
</script>

<template>
  <article class="visual-insight-card" :class="accentClass()">
    <div class="visual-card-head">
      <div>
        <p class="eyebrow">{{ card.classification.domain }} · {{ card.visualType }}</p>
        <h4>{{ card.title }}</h4>
      </div>
      <button v-if="removable" class="remove-btn" title="Remove visual card" @click="emit('remove', card.id)">×</button>
    </div>

    <div class="classification-row">
      <span class="pill route-pill">{{ card.classification.format }}</span>
      <span class="pill" :class="confidenceClass(card.confidence)">{{ card.confidence }}</span>
      <span class="pill evidence-pill">{{ card.evidenceStatus }}</span>
      <span class="time-pill">{{ card.time }}</span>
    </div>

    <p class="human-summary">{{ card.summary }}</p>

    <div v-if="card.metrics.length" class="metric-grid">
      <div v-for="metric in card.metrics" :key="metric.label + metric.value" class="metric-tile" :class="metricClass(metric)">
        <span class="metric-label">{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small v-if="metric.detail">{{ metric.detail }}</small>
      </div>
    </div>

    <div v-if="card.chartSegments.length" class="chart-zone">
      <div class="donut" :style="donutStyle(card.chartSegments)">
        <div class="donut-hole">{{ card.chartSegments.length }} signals</div>
      </div>
      <div class="bar-list">
        <div v-for="(segment, index) in card.chartSegments" :key="segment.label" class="bar-row">
          <div class="bar-label">
            <span>{{ segment.label }}</span>
            <strong>{{ segment.value }}%</strong>
          </div>
          <div class="bar-track"><div class="bar-fill" :style="segmentStyle(segment, index)" /></div>
        </div>
      </div>
    </div>

    <div v-if="card.matrixRows.length" class="matrix-box">
      <div class="matrix-row matrix-head">
        <span>Classification</span>
        <span>Human-readable insight</span>
        <span>Status</span>
      </div>
      <div v-for="row in card.matrixRows" :key="row.label + row.value" class="matrix-row" :class="rowToneClass(row)">
        <span class="matrix-label">{{ row.label }}</span>
        <span>{{ row.value }}</span>
        <span>{{ row.status || 'Review' }}</span>
      </div>
    </div>

    <div v-if="card.riskItems.length" class="risk-board">
      <div v-for="risk in card.riskItems" :key="risk.risk" class="risk-item" :class="riskClass(risk)">
        <div class="risk-title">
          <strong>{{ risk.risk }}</strong>
          <span>{{ risk.severity }}</span>
        </div>
        <p>{{ risk.mitigation }}</p>
        <small>{{ risk.probability }} probability</small>
      </div>
    </div>

    <div class="insight-bullets">
      <div v-for="bullet in card.bullets.slice(0, 4)" :key="bullet" class="bullet-chip">
        <span>◆</span>
        <p>{{ bullet }}</p>
      </div>
    </div>

    <div class="action-panel">
      <span>Next action</span>
      <strong>{{ card.nextAction }}</strong>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.visual-insight-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba($border-color-light, .72);
  border-radius: 18px;
  padding: 18px;
  background:
    radial-gradient(circle at top right, rgba($accent-cyan, .13), transparent 32%),
    linear-gradient(145deg, rgba(20, 30, 48, .98), rgba(8, 13, 24, .98));
  box-shadow: 0 18px 44px rgba(0, 0, 0, .32);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.visual-insight-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: $accent-cyan;
}

.accent-gold::before { background: $accent-gold; }
.accent-cyan::before { background: $accent-cyan; }
.accent-red::before { background: $accent-red; }
.accent-green::before { background: $accent-green; }
.accent-purple::before { background: $accent-purple; }
.accent-gold { background: radial-gradient(circle at top right, rgba($accent-gold, .15), transparent 34%), linear-gradient(145deg, rgba(24, 27, 36, .98), rgba(8, 13, 24, .98)); }
.accent-red { background: radial-gradient(circle at top right, rgba($accent-red, .13), transparent 34%), linear-gradient(145deg, rgba(25, 24, 34, .98), rgba(8, 13, 24, .98)); }
.accent-purple { background: radial-gradient(circle at top right, rgba($accent-purple, .14), transparent 34%), linear-gradient(145deg, rgba(21, 24, 42, .98), rgba(8, 13, 24, .98)); }

.visual-card-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.eyebrow { color: $accent-gold; font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 6px; }
h4 { color: $text-primary; font-size: 16px; line-height: 1.3; margin: 0; }
.remove-btn { border: 1px solid rgba($border-color-light, .7); color: $text-muted; background: rgba(255,255,255,.03); border-radius: 999px; width: 28px; height: 28px; cursor: pointer; }
.remove-btn:hover { color: $accent-red; border-color: rgba($accent-red, .55); }

.classification-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.pill, .time-pill { border: 1px solid rgba($border-color-light, .65); border-radius: 999px; padding: 5px 9px; font-size: 10px; color: $text-secondary; background: rgba(255,255,255,.035); }
.route-pill { color: $accent-cyan; }
.evidence-pill { color: $accent-gold; }
.risk-good { color: $accent-green; border-color: rgba($accent-green, .35); background: rgba($accent-green, .08); }
.risk-medium { color: $accent-gold; border-color: rgba($accent-gold, .35); background: rgba($accent-gold, .08); }
.risk-low { color: $accent-orange; border-color: rgba($accent-orange, .4); background: rgba($accent-orange, .08); }
.risk-critical { color: $accent-red; border-color: rgba($accent-red, .45); background: rgba($accent-red, .08); }

.human-summary { color: $text-secondary; line-height: 1.55; font-size: 13px; margin: 0; }

.metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.metric-tile { border: 1px solid rgba($border-color-light, .55); border-radius: 14px; background: rgba(255,255,255,.035); padding: 11px; min-height: 76px; }
.metric-label { display: block; color: $text-muted; font-size: 10px; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 5px; }
.metric-tile strong { display: block; color: $text-primary; font-size: 17px; line-height: 1.2; }
.metric-tile small { display: block; margin-top: 4px; color: $text-muted; font-size: 10px; line-height: 1.3; }
.metric-positive strong { color: $accent-green; }
.metric-warning strong { color: $accent-orange; }
.metric-danger strong { color: $accent-red; }
.metric-opportunity strong { color: $accent-gold; }

.chart-zone { display: grid; grid-template-columns: 108px 1fr; gap: 14px; align-items: center; }
.donut { width: 96px; height: 96px; border-radius: 50%; display: grid; place-items: center; box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); }
.donut-hole { width: 62px; height: 62px; border-radius: 50%; display: grid; place-items: center; text-align: center; color: $text-secondary; background: $bg-card; font-size: 10px; padding: 8px; }
.bar-list { display: flex; flex-direction: column; gap: 8px; }
.bar-label { display: flex; justify-content: space-between; gap: 10px; color: $text-secondary; font-size: 11px; }
.bar-label strong { color: $text-primary; }
.bar-track { height: 8px; border-radius: 99px; background: rgba($border-color-light, .65); overflow: hidden; }
.bar-fill { height: 100%; border-radius: inherit; }

.matrix-box { border: 1px solid rgba($border-color-light, .55); border-radius: 14px; overflow: hidden; }
.matrix-row { display: grid; grid-template-columns: minmax(86px, .75fr) 1.6fr minmax(70px, .55fr); gap: 10px; padding: 9px 11px; border-bottom: 1px solid rgba($border-color, .7); color: $text-secondary; font-size: 11px; }
.matrix-row:last-child { border-bottom: none; }
.matrix-head { color: $text-muted; background: rgba(255,255,255,.035); text-transform: uppercase; letter-spacing: .06em; font-size: 9px; font-weight: 800; }
.matrix-label { color: $text-primary; font-weight: 700; }
.row-positive .matrix-label { color: $accent-green; }
.row-warning .matrix-label { color: $accent-orange; }
.row-danger .matrix-label { color: $accent-red; }

.risk-board { display: grid; gap: 8px; }
.risk-item { border: 1px solid rgba($accent-orange, .35); border-radius: 12px; padding: 10px; background: rgba($accent-orange, .06); }
.risk-title { display: flex; justify-content: space-between; gap: 8px; color: $text-primary; font-size: 12px; }
.risk-item p { margin: 5px 0; color: $text-secondary; font-size: 11px; line-height: 1.45; }
.risk-item small { color: $text-muted; font-size: 10px; }

.insight-bullets { display: grid; gap: 8px; }
.bullet-chip { display: grid; grid-template-columns: 16px 1fr; gap: 7px; color: $text-secondary; font-size: 12px; line-height: 1.45; }
.bullet-chip span { color: $accent-cyan; font-size: 10px; margin-top: 3px; }
.bullet-chip p { margin: 0; }

.action-panel { border: 1px solid rgba($accent-gold, .35); background: linear-gradient(135deg, rgba($accent-gold, .13), rgba($accent-cyan, .06)); border-radius: 14px; padding: 12px; }
.action-panel span { display: block; color: $accent-gold; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 5px; }
.action-panel strong { color: $text-primary; font-size: 12px; line-height: 1.45; }

@media (max-width: 720px) {
  .metric-grid { grid-template-columns: 1fr; }
  .chart-zone { grid-template-columns: 1fr; }
  .matrix-row { grid-template-columns: 1fr; }
}
</style>
