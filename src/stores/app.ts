import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { BRIDGE_URL } from '../bridge-config'

export type BusinessCategory = 'market' | 'competitor' | 'investment' | 'general'
export type EvidenceStatus = 'Verified' | 'User Provided' | 'Assumption' | 'To Verify' | 'Mixed'
export type ConfidenceLevel = '🟢 Higher' | '🟡 Medium' | '🟠 Low' | '🔴 Critical'
export type VisualCardType = 'Executive' | 'KPI' | 'Scenario' | 'Matrix' | 'Risk' | 'Decision' | 'Supplier' | 'Chart' | 'Table' | 'Pie' | 'Bar' | 'Line'

export interface ChatInsight {
  id: number
  time: string
  topic: string
  category: BusinessCategory
  routeName: string
  reason?: string
}

export interface Briefing {
  id: number
  time: string
  category: BusinessCategory
  question: string
  summary: string
  routeName: string
}

export interface VisualMetric {
  label: string
  value: string
  detail?: string
  tone?: 'positive' | 'warning' | 'danger' | 'neutral' | 'opportunity'
}

export interface ChartSegment {
  label: string
  value: number
  color?: string
}

export interface MatrixRow {
  label: string
  value: string
  status?: string
  tone?: 'positive' | 'warning' | 'danger' | 'neutral'
}

export interface RiskItem {
  risk: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  probability: 'Low' | 'Medium' | 'High'
  mitigation: string
}

export interface BusinessVisualCard {
  id: number
  time: string
  category: BusinessCategory
  routeName: string
  title: string
  threadTitle: string
  question: string
  summary: string
  bullets: string[]
  evidenceStatus: EvidenceStatus
  confidence: ConfidenceLevel
  nextAction: string
  visualType: VisualCardType
  classification: {
    domain: string
    format: string
    priority: 'High' | 'Medium' | 'Low'
  }
  metrics: VisualMetric[]
  chartSegments: ChartSegment[]
  matrixRows: MatrixRow[]
  riskItems: RiskItem[]
}

export interface BusinessVisualCardPatch {
  title?: string
  threadTitle?: string
  summary?: string
  bullets?: string[]
  evidenceStatus?: EvidenceStatus
  confidence?: ConfidenceLevel
  nextAction?: string
  visualType?: VisualCardType
  metrics?: VisualMetric[]
  chartSegments?: ChartSegment[]
  matrixRows?: MatrixRow[]
  riskItems?: RiskItem[]
}

const CHAT_INSIGHTS_STORAGE_KEY = 'chemicon.chatInsights.v2'
const BRIEFINGS_STORAGE_KEY = 'chemicon.briefings.v2'
const BUSINESS_CARDS_STORAGE_KEY = 'chemicon.businessVisualCards.v2'
const LEGACY_BUSINESS_CARDS_STORAGE_KEYS = ['chemicon.businessVisualCards.v1', 'chemicon-business-visual-cards', 'chemicon_business_cards']

function loadStoredArray<T>(key: string): T[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveStoredArray<T>(key: string, value: T[]) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota/private-browser failures; the live in-memory dashboard still works.
  }
}

function stripMarkdown(text: string) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[_#>*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstSentence(text: string, fallback: string) {
  const cleaned = stripMarkdown(text)
  const sentence = cleaned.split(/(?<=[.!?])\s+/).find(line => line.length > 18)
  return (sentence || fallback).slice(0, 280)
}

function inferEvidenceStatus(text: string): EvidenceStatus {
  const lowered = text.toLowerCase()
  if (lowered.includes('to verify') || lowered.includes('unverified') || lowered.includes('needs verification')) return 'To Verify'
  if (lowered.includes('assumption') || lowered.includes('assume')) return 'Assumption'
  if (lowered.includes('user provided')) return 'User Provided'
  if (lowered.includes('verified') || lowered.includes('source-backed')) return 'Verified'
  return 'Mixed'
}

function inferConfidence(text: string): ConfidenceLevel {
  const lowered = text.toLowerCase()
  if (lowered.includes('critical') || lowered.includes('blocker') || lowered.includes('high risk') || lowered.includes('do not proceed')) return '🔴 Critical'
  if (lowered.includes('low confidence') || lowered.includes('weak evidence') || lowered.includes('to verify') || lowered.includes('unverified')) return '🟠 Low'
  if (lowered.includes('verified') || lowered.includes('high confidence') || lowered.includes('confirmed')) return '🟢 Higher'
  return '🟡 Medium'
}

function makeBullets(summary: string) {
  const cleaned = stripMarkdown(summary)
  const lineBullets = summary
    .split(/\n+/)
    .map(line => stripMarkdown(line.replace(/^[-*•\d.)\s]+/, '')))
    .filter(line => line.length > 24 && !/^[-—]+$/.test(line))
  if (lineBullets.length) return lineBullets.slice(0, 6)
  return cleaned
    .split(/(?<=[.!?])\s+/)
    .map(line => line.trim())
    .filter(line => line.length > 24)
    .slice(0, 6)
}

function domainLabel(category: BusinessCategory, routeName: string) {
  if (routeName === 'marketAnalysis' || category === 'market') return 'Market intelligence'
  if (routeName === 'competitors' || category === 'competitor') return 'Competitor intelligence'
  if (category === 'investment') return 'Investment / feasibility'
  return 'Business command'
}

function inferVisualType(question: string, summary: string, category: BusinessCategory): VisualCardType {
  const text = `${question} ${summary}`.toLowerCase()
  // Explicit presentation requests win first.
  if (/pie|share split|market split|portfolio split|percentage split|mix\b/.test(text)) return 'Pie'
  if (/line chart|trend graph|trendline|timeline|over time|forecast|cagr|growth trend|monthly|yearly|annual/.test(text)) return 'Line'
  if (/bar chart|rank|ranking|top \d+|scorecard|compare bars|histogram/.test(text)) return 'Bar'
  if (/table|country table|data table|columns?|spreadsheet|tabular/.test(text)) return 'Table'
  if (/supplier|procure|rfq|raw material|vendor|source|coa|tds|sds/.test(text)) return 'Supplier'
  if (/risk|ehs|permit|regulatory|dms|toxic|hazard|blocker/.test(text)) return 'Risk'
  if (/compare|competitor|versus| vs |benchmark|matrix/.test(text) || category === 'competitor') return 'Matrix'
  if (/roi|irr|npv|payback|capex|opex|financial|investment|feasibility|scenario/.test(text)) return 'Scenario'
  if (/market share|share|split|segment|chart|graph|trend|growth|cagr/.test(text)) return 'Chart'
  if (/should|go\/no-go|go no-go|decision|recommend/.test(text)) return 'Decision'
  if (/\$|usd|%|mt|tons?|kg|cagr|revenue|margin|capacity/.test(text)) return 'KPI'
  return 'Executive'
}

function presentationFormat(visualType: VisualCardType) {
  if (visualType === 'Table') return 'Research table'
  if (visualType === 'Pie') return 'Pie chart'
  if (visualType === 'Line') return 'Trend graph'
  if (visualType === 'Bar') return 'Bar chart'
  if (visualType === 'Matrix') return 'Comparison matrix'
  if (visualType === 'Supplier') return 'Supplier scorecard'
  if (visualType === 'Scenario') return 'Scenario model'
  if (visualType === 'Risk') return 'Risk register'
  if (visualType === 'Decision') return 'Decision board'
  if (visualType === 'KPI') return 'KPI tiles'
  return 'Executive card'
}

function metricTone(label: string, value: string): VisualMetric['tone'] {
  const text = `${label} ${value}`.toLowerCase()
  if (/risk|blocker|to verify|unverified|critical/.test(text)) return 'danger'
  if (/cost|capex|opex|warning|low/.test(text)) return 'warning'
  if (/growth|profit|margin|opportunity|revenue|saving|upside/.test(text)) return 'positive'
  if (/market|capacity|demand|price|payback|roi/.test(text)) return 'opportunity'
  return 'neutral'
}

function topicKeywords(question: string, summary = ''): string[] {
  const stop = new Set(['chemicon', 'china', 'market', 'business', 'visual', 'card', 'give', 'make', 'show', 'please', 'short', 'quick', 'analysis', 'signal', 'risk', 'and', 'the', 'for', 'with', 'from', 'this', 'that', 'into'])
  const words = stripMarkdown(`${question} ${summary}`)
    .toLowerCase()
    .match(/[a-z][a-z0-9-]{3,}|[\u4e00-\u9fff]{2,}/g) || []
  const counts = new Map<string, number>()
  words.forEach(word => {
    if (!stop.has(word)) counts.set(word, (counts.get(word) || 0) + 1)
  })
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([word]) => word).slice(0, 6)
}

function commandProfile(question: string, summary: string, category: BusinessCategory, visualType: VisualCardType) {
  const text = `${question} ${summary}`.toLowerCase()
  const keywords = topicKeywords(question, summary)
  const topic = keywords.slice(0, 3).map(word => word.replace(/-/g, ' ')).join(' / ') || domainLabel(category, '')
  if (visualType === 'Pie' || /pie|share split|market split|portfolio split|mix\b|percentage split/.test(text)) {
    return {
      topic,
      metricLabels: ['Main slice', 'Second slice', 'Evidence depth', 'Unverified share', 'Decision signal', 'Next data point'],
      segmentLabels: ['Primary share', 'Secondary share', 'Opportunity share', 'Unknown / verify'],
      matrixLabels: ['Slice', 'Meaning', 'Evidence', 'Risk', 'Action'],
      colors: ['#c9a84c', '#4fc3f7', '#34d399', '#fb923c'],
    }
  }
  if (visualType === 'Line' || /line chart|trend graph|trendline|timeline|over time|forecast|cagr|growth trend|monthly|yearly|annual/.test(text)) {
    return {
      topic,
      metricLabels: ['Trend direction', 'Growth clue', 'Inflection point', 'Forecast risk', 'Evidence depth', 'Next datapoint'],
      segmentLabels: ['Now', 'Near-term', 'Mid-term', 'Verify gap'],
      matrixLabels: ['Period', 'Signal', 'Business meaning', 'Risk', 'Action'],
      colors: ['#4fc3f7', '#34d399', '#c9a84c', '#f87171'],
    }
  }
  if (visualType === 'Bar' || /bar chart|rank|ranking|top \d+|compare bars|histogram/.test(text)) {
    return {
      topic,
      metricLabels: ['Top factor', 'Runner-up', 'Score basis', 'Evidence depth', 'Gap', 'Next check'],
      segmentLabels: ['Top option', 'Second option', 'Third option', 'Verify gap'],
      matrixLabels: ['Rank', 'Option', 'Score reason', 'Risk', 'Action'],
      colors: ['#34d399', '#4fc3f7', '#c9a84c', '#fb923c'],
    }
  }
  if (visualType === 'Table' || /country|countries|region|table|tabular|column|spreadsheet/.test(text)) {
    return {
      topic,
      metricLabels: ['Best-fit table', 'Rows to compare', 'Evidence depth', 'Data gaps', 'Decision column', 'Next research'],
      segmentLabels: ['Verified rows', 'Assumption rows', 'Evidence gaps', 'Actionable rows'],
      matrixLabels: ['Item / country', 'Best evidence', 'Business meaning', 'Gap', 'Action'],
      colors: ['#4fc3f7', '#34d399', '#fb923c', '#c9a84c'],
    }
  }
  if (/capex|capacity|plant|factory|investment|feasibility|roi|payback|opex|irr|npv/.test(text)) {
    return {
      topic,
      metricLabels: ['Capacity target', 'CAPEX signal', 'Utilization gate', 'Payback watch', 'Decision quality', 'Evidence depth'],
      segmentLabels: ['CAPEX pressure', 'Utilization risk', 'Customer validation', 'Permit/EHS readiness'],
      matrixLabels: ['Capacity case', 'CAPEX exposure', 'Demand proof', 'EHS / permit', 'Decision gate'],
      colors: ['#c9a84c', '#fb923c', '#4fc3f7', '#f87171'],
    }
  }
  if (/supplier|vendor|source|rfq|procure|raw material|coa|tds|sds/.test(text) || visualType === 'Supplier') {
    return {
      topic,
      metricLabels: ['Supplier fit', 'Price/MOQ signal', 'Document readiness', 'Lead-time risk', 'Sample gate', 'Negotiation leverage'],
      segmentLabels: ['Supplier fit', 'Price risk', 'Document gap', 'Sample priority'],
      matrixLabels: ['Supplier', 'Product fit', 'Documents', 'Commercial risk', 'Next RFQ'],
      colors: ['#34d399', '#c9a84c', '#4fc3f7', '#fb923c'],
    }
  }
  if (/competitor|compare|benchmark|versus|\bvs\b|alternative|rival/.test(text) || category === 'competitor') {
    return {
      topic,
      metricLabels: ['Position gap', 'Attack angle', 'Price pressure', 'Quality proof', 'Switching barrier', 'Evidence depth'],
      segmentLabels: ['Chemicon edge', 'Competitor strength', 'Switching friction', 'Proof gap'],
      matrixLabels: ['Competitor', 'Chemicon edge', 'Weakness', 'Proof needed', 'Attack move'],
      colors: ['#a78bfa', '#f87171', '#c9a84c', '#4fc3f7'],
    }
  }
  if (/price|demand|segment|growth|cagr|share|forecast|customer|textile|auxiliary/.test(text) || category === 'market') {
    return {
      topic,
      metricLabels: ['Demand signal', 'Growth/price clue', 'Segment pull', 'Customer proof', 'Evidence depth', 'Action window'],
      segmentLabels: ['Demand pull', 'Price pressure', 'Segment fit', 'Evidence gap'],
      matrixLabels: ['Demand', 'Price', 'Customer segment', 'Evidence', 'Market action'],
      colors: ['#4fc3f7', '#34d399', '#c9a84c', '#fb923c'],
    }
  }
  if (/should|decision|go\/no-go|recommend|priority|choose/.test(text) || visualType === 'Decision') {
    return {
      topic,
      metricLabels: ['Decision lean', 'Upside', 'Downside', 'Evidence depth', 'Timing', 'Owner action'],
      segmentLabels: ['Go signal', 'No-go risk', 'Evidence gap', 'Next action'],
      matrixLabels: ['Option', 'Upside', 'Risk', 'Evidence', 'Decision'],
      colors: ['#34d399', '#f87171', '#fb923c', '#c9a84c'],
    }
  }
  return {
    topic,
    metricLabels: ['Main finding', 'Business impact', 'Evidence depth', 'Risk signal', 'Action window', 'Owner action'],
    segmentLabels: ['Opportunity', 'Risk', 'Evidence gap', 'Actionability'],
    matrixLabels: ['Finding', 'Implication', 'Risk', 'Evidence', 'Action'],
    colors: ['#34d399', '#fb923c', '#f87171', '#c9a84c'],
  }
}

function extractMetrics(question: string, summary: string, category: BusinessCategory, visualType: VisualCardType): VisualMetric[] {
  const text = stripMarkdown(`${question}. ${summary}`)
  const profile = commandProfile(question, summary, category, visualType)
  const patterns = [
    /(?:US\$|USD|\$)\s?[\d,.]+\s?(?:B|M|K|bn|mn|million|billion)?/gi,
    /[\d,.]+\s?%/g,
    /[\d,.]+\s?(?:MT\/yr|mt\/yr|MT|mt|tons?|tonnes?|kg|kWh|m³|m3)/gi,
    /[\d,.]+\s?(?:years?|months?)/gi,
  ]
  const found: string[] = []
  patterns.forEach(pattern => {
    for (const match of text.matchAll(pattern)) {
      const value = match[0].trim()
      if (!found.includes(value) && found.length < 6) found.push(value)
    }
  })
  const metrics = found.map((value, index) => ({
    label: profile.metricLabels[index] || `Signal ${index + 1}`,
    value,
    detail: `${profile.topic} · extracted from answer`,
    tone: metricTone(profile.metricLabels[index] || '', value),
  }))
  if (metrics.length) return metrics
  const bullets = makeBullets(summary)
  const fallbackValues = [
    profile.topic || visualType,
    bullets[0]?.slice(0, 38) || category,
    inferEvidenceStatus(summary),
  ]
  return fallbackValues.map((value, index) => ({
    label: profile.metricLabels[index] || `Signal ${index + 1}`,
    value,
    detail: index === 2 ? 'Auto-classified evidence status' : 'Command-specific visual field',
    tone: index === 2 && value === 'To Verify' ? 'warning' : metricTone(profile.metricLabels[index] || '', value),
  }))
}

function commandScore(text: string, positive: RegExp, negative?: RegExp) {
  let score = positive.test(text) ? 42 : 24
  if (negative?.test(text)) score -= 10
  return Math.max(8, Math.min(82, score))
}

function makeChartSegments(question: string, summary: string, category: BusinessCategory, visualType: VisualCardType): ChartSegment[] {
  const lowered = `${question} ${summary}`.toLowerCase()
  const profile = commandProfile(question, summary, category, visualType)
  const values = [
    commandScore(lowered, /opportunity|growth|profit|win|strong|advantage|demand|go|fit|ready/, /weak|low|blocker/),
    commandScore(lowered, /risk|blocker|weak|hazard|unverified|to verify|capex|permit|price pressure/, /verified|confirmed/),
    commandScore(lowered, /verified|source|customer|rfq|sample|coa|tds|sds|evidence/, /unknown|unverified/),
    commandScore(lowered, /next|action|decide|prepare|shortlist|validate|call|quote|scenario/, /wait|blocked/),
  ]
  return profile.segmentLabels.map((label, index) => ({
    label,
    value: values[index] || 20,
    color: profile.colors[index % profile.colors.length],
  })).sort((a, b) => b.value - a.value).slice(0, 4)
}

function makeMatrixRows(question: string, bullets: string[], category: BusinessCategory, visualType: VisualCardType): MatrixRow[] {
  const profile = commandProfile(question, bullets.join(' '), category, visualType)
  const rows = bullets.slice(0, 5).map((bullet, index) => {
    const lowered = bullet.toLowerCase()
    const tone: MatrixRow['tone'] = /risk|blocker|weak|hazard|problem|to verify|unverified/.test(lowered)
      ? 'danger'
      : /opportunity|strong|advantage|growth|profit|win|ready|verified/.test(lowered)
        ? 'positive'
        : /assumption|maybe|could|should|need|estimate|appears/.test(lowered)
          ? 'warning'
          : 'neutral'
    return {
      label: profile.matrixLabels[index] || `Point ${index + 1}`,
      value: bullet.slice(0, 180),
      status: tone === 'danger' ? 'Verify' : tone === 'positive' ? 'Useful' : 'Review',
      tone,
    }
  })
  return rows.length ? rows : [{ label: profile.matrixLabels[0] || 'Summary', value: `${profile.topic}: no clean bullet structure found. Review original chat answer.`, status: 'Review', tone: 'warning' }]
}

function makeRiskItems(summary: string, evidenceStatus: EvidenceStatus, confidence: ConfidenceLevel): RiskItem[] {
  const bullets = makeBullets(summary)
  const riskLines = bullets.filter(line => /risk|blocker|verify|unverified|assumption|hazard|permit|regulatory|weak|unknown|not confirmed/i.test(line))
  const selected = (riskLines.length ? riskLines : bullets.slice(0, 2)).slice(0, 3)
  return selected.map(line => {
    const lowered = line.toLowerCase()
    const severity: RiskItem['severity'] = confidence.includes('Critical') || /critical|blocker|hazard|toxic|permit/.test(lowered)
      ? 'Critical'
      : /risk|weak|unverified|to verify/.test(lowered)
        ? 'High'
        : evidenceStatus === 'Assumption' || evidenceStatus === 'To Verify'
          ? 'Medium'
          : 'Low'
    return {
      risk: line.slice(0, 90),
      severity,
      probability: severity === 'Critical' || severity === 'High' ? 'High' : severity === 'Medium' ? 'Medium' : 'Low',
      mitigation: evidenceStatus === 'Verified'
        ? 'Keep monitoring and attach source evidence to the card.'
        : 'Confirm with source documents, RFQs, permits, customer samples, or vendor data before using in decisions.',
    }
  })
}

function makeNextAction(bullets: string[], visualType: VisualCardType, evidenceStatus: EvidenceStatus) {
  const explicitAction = bullets.find(line => /next|action|verify|confirm|rfq|sample|call|prepare|compare|decide/i.test(line))
  if (explicitAction) return explicitAction.slice(0, 150)
  if (evidenceStatus === 'To Verify' || evidenceStatus === 'Assumption') return 'Verify the key assumptions with source documents, supplier RFQs, customer samples, or regulatory confirmation.'
  if (visualType === 'Supplier') return 'Shortlist suppliers, request COA/TDS/SDS, confirm MOQ, price basis, lead time, and Incoterm.'
  if (visualType === 'Scenario') return 'Convert this into base/upside/downside financial scenarios and confirm the decision gate.'
  if (visualType === 'Matrix') return 'Use the matrix to select the strongest Chemicon attack angle and verify evidence gaps.'
  return 'Review the visual card, confirm evidence status, and choose the next business action.'
}

function normalizeLegacyCard(card: Partial<BusinessVisualCard>): BusinessVisualCard {
  const category = card.category || 'general'
  const routeName = card.routeName || (category === 'market' ? 'marketAnalysis' : category === 'competitor' ? 'competitors' : 'businessCards')
  const question = card.question || card.title || 'Business question'
  const summaryText = card.summary || card.bullets?.join(' ') || 'Saved business answer.'
  const bullets = card.bullets?.length ? card.bullets : makeBullets(summaryText)
  const evidenceStatus = card.evidenceStatus || inferEvidenceStatus(summaryText)
  const confidence = card.confidence || inferConfidence(summaryText)
  const visualType = card.visualType || inferVisualType(question, summaryText, category)
  return {
    id: card.id || Date.now(),
    time: card.time || new Date().toLocaleTimeString(),
    category,
    routeName,
    title: card.title || question.replace(/[@/#]/g, '').trim().slice(0, 86) || 'Business intelligence card',
    threadTitle: card.threadTitle || question.replace(/[@/#]/g, '').trim().slice(0, 72) || 'Command thread',
    question,
    summary: firstSentence(summaryText, 'Chat answer converted into a visual card.'),
    bullets,
    evidenceStatus,
    confidence,
    nextAction: card.nextAction || makeNextAction(bullets, visualType, evidenceStatus),
    visualType,
    classification: card.classification || {
      domain: domainLabel(category, routeName),
      format: presentationFormat(visualType),
      priority: confidence.includes('Critical') || category === 'investment' ? 'High' : 'Medium',
    },
    metrics: card.metrics?.length ? card.metrics : extractMetrics(question, summaryText, category, visualType),
    chartSegments: card.chartSegments?.length ? card.chartSegments : makeChartSegments(question, summaryText, category, visualType),
    matrixRows: card.matrixRows?.length ? card.matrixRows : makeMatrixRows(question, bullets, category, visualType),
    riskItems: card.riskItems?.length ? card.riskItems : makeRiskItems(summaryText, evidenceStatus, confidence),
  }
}

function loadBusinessCards() {
  const current = loadStoredArray<Partial<BusinessVisualCard>>(BUSINESS_CARDS_STORAGE_KEY)
  const legacy = LEGACY_BUSINESS_CARDS_STORAGE_KEYS.flatMap(key => loadStoredArray<Partial<BusinessVisualCard>>(key))
  const deduped = new Map<number | string, BusinessVisualCard>()
  ;[...current, ...legacy].forEach((card, index) => {
    const normalized = normalizeLegacyCard(card)
    deduped.set(card.id || `${normalized.question}-${index}`, normalized)
  })
  return Array.from(deduped.values()).sort((a, b) => b.id - a.id).slice(0, 60)
}

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const title = ref('CHEMICON COMMAND CENTER')
  const version = ref('1.0.0')

  // Simulated agent status
  const agentModel = ref('DeepSeek V4 Pro')
  const agentStatus = ref<'online' | 'offline' | 'busy'>('online')
  const platformCount = ref(2)
  const tokenCount = ref(0)
  const activeSessions = ref(1)

  // Chat-to-tab intelligence feed
  const chatInsights = ref<ChatInsight[]>(loadStoredArray<ChatInsight>(CHAT_INSIGHTS_STORAGE_KEY))
  const briefings = ref<Briefing[]>(loadStoredArray<Briefing>(BRIEFINGS_STORAGE_KEY))
  const businessVisualCards = ref<BusinessVisualCard[]>(loadBusinessCards())
  let insightCounter = Math.max(
    0,
    ...chatInsights.value.map(i => i.id || 0),
    ...briefings.value.map(b => b.id || 0),
    ...businessVisualCards.value.map(card => card.id || 0),
  )

  watch(chatInsights, value => saveStoredArray(CHAT_INSIGHTS_STORAGE_KEY, value), { deep: true })
  watch(briefings, value => saveStoredArray(BRIEFINGS_STORAGE_KEY, value), { deep: true })
  watch(businessVisualCards, value => saveStoredArray(BUSINESS_CARDS_STORAGE_KEY, value), { deep: true, immediate: true })

  function addChatInsight(topic: string, category: ChatInsight['category'], routeName: string, reason?: string) {
    insightCounter++
    chatInsights.value.unshift({
      id: insightCounter,
      time: new Date().toLocaleTimeString(),
      topic,
      category,
      routeName,
      reason,
    })
    // Keep max 20 insights
    if (chatInsights.value.length > 20) {
      chatInsights.value = chatInsights.value.slice(0, 20)
    }
  }

  function addBriefing(question: string, summary: string, category: Briefing['category'], routeName: string) {
    insightCounter++
    const b: Briefing = {
      id: insightCounter,
      time: new Date().toLocaleTimeString(),
      category,
      question,
      summary,
      routeName,
    }
    briefings.value.unshift(b)
    if (briefings.value.length > 30) {
      briefings.value = briefings.value.slice(0, 30)
    }
  }

  function addBusinessVisualCard(question: string, summary: string, category: BusinessVisualCard['category'], routeName: string, title?: string) {
    insightCounter++
    const bullets = makeBullets(summary)
    const evidenceStatus = inferEvidenceStatus(summary)
    const confidence = inferConfidence(summary)
    const visualType = inferVisualType(question, summary, category)
    const card = normalizeLegacyCard({
      id: insightCounter,
      time: new Date().toLocaleTimeString(),
      category,
      routeName,
      title: title || question.replace(/[@/#]/g, '').trim().slice(0, 86) || 'Business intelligence card',
      threadTitle: question.replace(/[@/#]/g, '').trim().slice(0, 72) || 'Command thread',
      question,
      summary,
      bullets,
      evidenceStatus,
      confidence,
      visualType,
      nextAction: makeNextAction(bullets, visualType, evidenceStatus),
    })
    businessVisualCards.value.unshift(card)
    if (businessVisualCards.value.length > 60) businessVisualCards.value = businessVisualCards.value.slice(0, 60)
    return card
  }

  function updateBusinessVisualCard(id: number, patch: BusinessVisualCardPatch) {
    const index = businessVisualCards.value.findIndex(card => card.id === id)
    if (index === -1) return null
    const current = businessVisualCards.value[index]
    const summaryText = patch.summary || current.summary
    const bullets = patch.bullets?.length ? patch.bullets : makeBullets(summaryText)
    const evidenceStatus = patch.evidenceStatus || inferEvidenceStatus(summaryText)
    const confidence = patch.confidence || inferConfidence(summaryText)
    const visualType = patch.visualType || inferVisualType(current.question, summaryText, current.category)
    const updated = normalizeLegacyCard({
      ...current,
      ...patch,
      summary: summaryText,
      bullets,
      evidenceStatus,
      confidence,
      visualType,
      nextAction: patch.nextAction || makeNextAction(bullets, visualType, evidenceStatus),
      metrics: patch.metrics,
      chartSegments: patch.chartSegments,
      matrixRows: patch.matrixRows,
      riskItems: patch.riskItems,
    })
    businessVisualCards.value[index] = updated
    return updated
  }

  function getBriefingsByCategory(category: Briefing['category']) {
    return briefings.value.filter(b => b.category === category)
  }

  function removeBriefing(id: number) {
    briefings.value = briefings.value.filter(b => b.id !== id)
  }

  function getInsightsByCategory(category: ChatInsight['category']) {
    return chatInsights.value.filter(i => i.category === category)
  }

  function getBusinessCardsByCategory(category: BusinessVisualCard['category']) {
    return businessVisualCards.value.filter(card => card.category === category || (category === 'general' && card.routeName === 'businessCards'))
  }

  function removeBusinessVisualCard(id: number) {
    businessVisualCards.value = businessVisualCards.value.filter(card => card.id !== id)
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setTitle(t: string) {
    title.value = t
  }

  // Bridge API integration
  async function fetchStatus() {
    try {
      const res = await fetch(`${BRIDGE_URL}/api/hermes/status`)
      if (!res.ok) return
      const data = await res.json()
      agentModel.value = data.model ?? data.agentModel ?? agentModel.value
      agentStatus.value = (data.provider && data.model) ? 'online' : 'offline'
      platformCount.value = data.platform_count ?? data.platformCount ?? platformCount.value
    } catch {
      // Swallow errors — keep existing defaults
    }
  }

  const usageLoading = ref(false)
  const usageError = ref<string | null>(null)

  async function fetchUsage() {
    usageLoading.value = true
    usageError.value = null
    try {
      const res = await fetch(`${BRIDGE_URL}/api/hermes/usage`)
      if (!res.ok) {
        usageError.value = `HTTP ${res.status}`
        return
      }
      const data = await res.json()
      tokenCount.value = data.tokenCount ?? data.tokens ?? tokenCount.value
      activeSessions.value = data.sessions ?? data.activeSessions ?? activeSessions.value
    } catch (e: any) {
      usageError.value = e?.message ?? 'Network error'
    } finally {
      usageLoading.value = false
    }
  }

  async function fetchHealth() {
    const res = await fetch(`${BRIDGE_URL}/api/hermes/health`)
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
    return res.json()
  }

  // Auto-fetch status on store init
  fetchStatus()

  return {
    sidebarCollapsed,
    title,
    version,
    agentModel,
    agentStatus,
    platformCount,
    tokenCount,
    activeSessions,
    chatInsights,
    addChatInsight,
    getInsightsByCategory,
    briefings,
    addBriefing,
    getBriefingsByCategory,
    removeBriefing,
    businessVisualCards,
    addBusinessVisualCard,
    updateBusinessVisualCard,
    getBusinessCardsByCategory,
    removeBusinessVisualCard,
    toggleSidebar,
    setTitle,
    usageLoading,
    usageError,
    fetchStatus,
    fetchUsage,
    fetchHealth,
  }
})
