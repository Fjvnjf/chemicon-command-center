<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import type { BusinessVisualCardPatch, ChartSegment, MatrixRow, RiskItem, VisualCardType, VisualMetric } from '@/stores/app'
import { BRIDGE_URL } from '../bridge-config'
import { routeChatCommand, summarizeRouteTargets } from '@/utils/chatRouting'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
}

interface CurrentModel {
  model: string
  provider: string
}

interface ModelsResponse {
  current: CurrentModel | null
  available: string[]
  providers_with_keys: string[]
}

type ChatFeatureStatus = 'Live' | 'Partial' | 'Staged'
type ReasoningEffort = 'auto' | 'low' | 'medium' | 'high'
type ChatMode = 'chat' | 'research' | 'coding' | 'agent'

interface ChatFeatureItem {
  title: string
  status: ChatFeatureStatus
  detail: string
}

interface AttachmentPreview {
  id: string
  name: string
  type: string
  size: number
}

type ActivityStatus = 'queued' | 'running' | 'done' | 'error'
type ActivityKind = 'route' | 'bridge' | 'reasoning' | 'web' | 'terminal' | 'tool' | 'card' | 'result'

interface ActivityEvent {
  id: string
  kind: ActivityKind
  status: ActivityStatus
  title: string
  detail: string
  time: string
}

const appStore = useAppStore()
const CHAT_MESSAGES_STORAGE_KEY = 'chemicon.chatMessages.v2'
const CHAT_SESSION_STORAGE_KEY = 'chemicon.chatSessionId.v2'

function defaultMessages(): ChatMessage[] {
  return [
    {
      role: 'system',
      content: 'Welcome to Chemicon Command Center. I am your AI strategist. Every substantial dashboard chat now gets a chat reply plus visual cards in the correct tabs: Market Analysis, Competitors, or Business Cards.',
      time: new Date().toLocaleTimeString(),
    },
  ]
}

function loadStoredMessages(): ChatMessage[] {
  if (typeof localStorage === 'undefined') return defaultMessages()
  try {
    const raw = localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY)
    if (!raw) return defaultMessages()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultMessages()
    return parsed.filter((message: Partial<ChatMessage>) =>
      ['user', 'assistant', 'system'].includes(message.role || '') && typeof message.content === 'string',
    ).slice(-80) as ChatMessage[]
  } catch {
    return defaultMessages()
  }
}

function loadStoredSessionId() {
  if (typeof localStorage === 'undefined') return `chemicon-${Date.now().toString(36)}`
  const stored = localStorage.getItem(CHAT_SESSION_STORAGE_KEY)
  return stored || `chemicon-${Date.now().toString(36)}`
}

const messages = ref<ChatMessage[]>(loadStoredMessages())

const input = ref('')
const sending = ref(false)
const chatArea = ref<HTMLDivElement>()
const fileInput = ref<HTMLInputElement>()
const currentModel = ref<CurrentModel | null>(null)
const availableModels = ref<string[]>([])
const providersWithKeys = ref<string[]>([])
const modelLoadError = ref<string | null>(null)
const selectedModel = ref('')
const selectedProvider = ref('')
const selectedReasoning = ref<ReasoningEffort>('auto')
const selectedMode = ref<ChatMode>('chat')
const visualResearch = ref(true)
const sourceBacked = ref(true)
const toolTrace = ref(true)
const autoSpeech = ref(false)
const showModelMenu = ref(true)
const showSessionsPanel = ref(false)
const showFilesPanel = ref(false)
const showTerminalPanel = ref(false)
const showOutlinePanel = ref(false)
const attachments = ref<AttachmentPreview[]>([])
const sessionId = ref(loadStoredSessionId())
const activityEvents = ref<ActivityEvent[]>([])
const activeRequestId = ref('')

const reasoningOptions: Array<{ value: ReasoningEffort; label: string; detail: string }> = [
  { value: 'auto', label: 'Auto', detail: 'Let Hermes choose the effort.' },
  { value: 'low', label: 'Low', detail: 'Fast, simple answers.' },
  { value: 'medium', label: 'Medium', detail: 'Balanced business reasoning.' },
  { value: 'high', label: 'High', detail: 'Deep feasibility / strategy reasoning.' },
]

const chatModes: Array<{ value: ChatMode; label: string; detail: string }> = [
  { value: 'chat', label: 'Chat', detail: 'General Chemicon assistant.' },
  { value: 'research', label: 'Research', detail: 'Source-backed market/supplier work.' },
  { value: 'coding', label: 'Coding', detail: 'Dashboard/code/debug style answers.' },
  { value: 'agent', label: 'Agent', detail: 'Multi-step task execution style.' },
]

const commandChips = [
  { label: '/usage', insert: '/usage ', title: 'Usage/status command' },
  { label: '/status', insert: '/status ', title: 'Bridge status command' },
  { label: '/plan', insert: '/plan ', title: 'Ask for a plan first' },
  { label: '/goal', insert: '/goal ', title: 'Create or inspect a goal' },
  { label: '@market', insert: '@market ', title: 'Route result to Market Analysis' },
  { label: '@competitors', insert: '@competitors ', title: 'Route result to Competitors' },
  { label: '@business', insert: '@business ', title: 'Route result to Business Cards fallback tab' },
  { label: '@both', insert: '@both ', title: 'Route result to both tabs' },
]

const utilityButtons = [
  { key: 'sessions', label: 'Sessions', icon: '☰' },
  { key: 'files', label: 'Files', icon: '📂' },
  { key: 'terminal', label: 'Terminal', icon: '⌘' },
  { key: 'outline', label: 'Outline', icon: '☷' },
  { key: 'capture', label: 'Review & Capture', icon: '✓' },
  { key: 'refresh', label: 'Refresh', icon: '↻' },
]

const chatFeatures: ChatFeatureItem[] = [
  { title: 'Same-origin Hermes chat bridge', status: 'Live', detail: 'Workshop sends messages through /api/chemicon-chat to Hermes using the WeChat-safe same-origin tunnel.' },
  { title: 'Dashboard tab routing', status: 'Live', detail: 'Business answers are routed into visual cards in Market Analysis, Competitors, or the new Business Cards tab using keywords or @market/@competitors/@business/@both.' },
  { title: 'Model/provider selector', status: 'Live', detail: 'AI tab now has an EKKO-style model button, current model badge, model list, provider badge, refresh, and manual provider/model override fields.' },
  { title: 'Reasoning selector', status: 'Live', detail: 'Auto/Low/Medium/High reasoning effort is visible and sent as request instructions so answers match the selected work depth.' },
  { title: 'Mode selector', status: 'Live', detail: 'Chat, Research, Coding, and Agent modes are exposed and sent as mode-specific instructions.' },
  { title: 'Visual research presets', status: 'Live', detail: 'Country table, supplier scorecard, competitor matrix, chart-ready, and feasibility preset buttons are built into the input toolbar.' },
  { title: 'Source-backed toggle', status: 'Live', detail: 'When enabled, the prompt asks for Verified/User Provided/Assumption/To Verify separation.' },
  { title: 'Tool-call display toggle', status: 'Live', detail: 'Tool trace preference is visible and the assistant footer still reports API-call count when returned by bridge.' },
  { title: 'File attachments & drag/drop surface', status: 'Partial', detail: 'Attach button and attachment chips are live in the UI; file names/types are included in the prompt. Binary upload to Hermes remains staged.' },
  { title: 'Session history sidebar', status: 'Partial', detail: 'Session drawer/action surface is visible with active session ID; full upstream session switching/export/delete remains staged.' },
  { title: 'Session search / slash commands', status: 'Partial', detail: 'Common slash/route chips are exposed and inserted into the composer. Full upstream searchable command palette remains staged.' },
  { title: 'Files side panel', status: 'Partial', detail: 'Files panel action and placeholder drawer are exposed. Full upstream live file browser remains staged for Workshop.' },
  { title: 'Terminal side panel', status: 'Partial', detail: 'Terminal panel action and placeholder drawer are exposed. Full upstream terminal binding remains staged for Workshop.' },
  { title: 'Conversation outline', status: 'Partial', detail: 'Outline action and panel are exposed with message count; full upstream anchor navigation remains staged.' },
  { title: 'Voice dialogue controls', status: 'Partial', detail: 'Auto speech toggle is exposed. Full upstream voice transcript/voice bubble controls remain staged.' },
  { title: 'Review & Capture', status: 'Partial', detail: 'Capture button and prompt path are visible. Full upstream capture drawer remains staged inside Workshop.' },
]

const selectedReasoningLabel = computed(() => reasoningOptions.find(option => option.value === selectedReasoning.value)?.label || 'Auto')
const selectedModeLabel = computed(() => chatModes.find(option => option.value === selectedMode.value)?.label || 'Chat')
const modelChoices = computed(() => Array.from(new Set([
  selectedModel.value,
  currentModel.value?.model,
  ...availableModels.value,
  'gpt-5.5',
  'gpt-5',
  'claude-sonnet-4',
  'deepseek-v4-pro',
].filter(Boolean))) as string[])
const providerChoices = computed(() => Array.from(new Set([
  selectedProvider.value,
  currentModel.value?.provider,
  ...providersWithKeys.value,
  'openai-codex',
  'openrouter',
  'anthropic',
  'deepseek',
].filter(Boolean))) as string[])
const activeModelLabel = computed(() => selectedModel.value || currentModel.value?.model || 'Loading model…')
const activeProviderLabel = computed(() => selectedProvider.value || currentModel.value?.provider || 'provider')
const isGithubPages = computed(() => typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
const isGithubStaticBackup = computed(() => isGithubPages.value && !BRIDGE_URL)
const bridgeStatusLabel = computed(() => {
  if (isGithubStaticBackup.value) return 'GitHub static backup'
  if (currentModel.value) return isGithubPages.value ? 'GitHub + live bridge' : 'Bridge connected'
  if (isGithubPages.value && BRIDGE_URL) return 'Checking GitHub bridge'
  if (modelLoadError.value) return 'Bridge offline'
  return 'Checking bridge'
})
const bridgeStatusClass = computed(() => currentModel.value && !isGithubStaticBackup.value ? 'badge-ok' : 'badge-warn')

function featureBadgeClass(status: ChatFeatureStatus) {
  if (status === 'Live') return 'badge-ok'
  if (status === 'Partial') return 'badge-info'
  return 'badge-warn'
}

function scrollToBottom() {
  nextTick(() => {
    if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight
  })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatMessage(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function insertChip(text: string) {
  const spacer = input.value && !input.value.endsWith(' ') && !input.value.endsWith('\n') ? ' ' : ''
  input.value = `${input.value}${spacer}${text}`
}

function insertPreset(kind: string) {
  const presets: Record<string, string> = {
    country: 'Create a country comparison table with source/evidence status columns for ',
    supplier: 'Build a supplier scorecard with price, MOQ, risk, confidence, and next action for ',
    competitor: 'Create a competitor matrix with positioning, product overlap, evidence status, and gaps for ',
    chart: 'Return chart-ready data, assumptions, and a concise interpretation for ',
    feasibility: 'Do a brutally honest feasibility review with Verified/User Provided/Assumption/To Verify sections for ',
  }
  insertChip(presets[kind] || '')
}

function triggerAttach() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  for (const file of files) {
    attachments.value.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      type: file.type || 'unknown',
      size: file.size,
    })
  }
  target.value = ''
}

function removeAttachment(id: string) {
  attachments.value = attachments.value.filter(item => item.id !== id)
}

function toggleUtility(key: string) {
  if (key === 'sessions') showSessionsPanel.value = !showSessionsPanel.value
  if (key === 'files') showFilesPanel.value = !showFilesPanel.value
  if (key === 'terminal') showTerminalPanel.value = !showTerminalPanel.value
  if (key === 'outline') showOutlinePanel.value = !showOutlinePanel.value
  if (key === 'capture') insertChip('Review and capture the key durable notes, evidence gaps, and next actions from this answer. ')
  if (key === 'refresh') fetchModels()
}

function addActivity(kind: ActivityKind, status: ActivityStatus, title: string, detail: string) {
  const event: ActivityEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind,
    status,
    title,
    detail,
    time: new Date().toLocaleTimeString(),
  }
  activityEvents.value = [event, ...activityEvents.value].slice(0, 24)
  return event.id
}

function updateActivity(id: string, status: ActivityStatus, detail?: string) {
  const event = activityEvents.value.find(item => item.id === id)
  if (!event) return
  event.status = status
  if (detail) event.detail = detail
  event.time = new Date().toLocaleTimeString()
}

function statusIcon(status: ActivityStatus) {
  if (status === 'done') return '✓'
  if (status === 'error') return '!'
  if (status === 'running') return '…'
  return '•'
}

function activityIcon(kind: ActivityKind) {
  const icons: Record<ActivityKind, string> = {
    route: '🧭',
    bridge: '🔌',
    reasoning: '🧠',
    web: '🌐',
    terminal: '⌘',
    tool: '🛠',
    card: '🧩',
    result: '📤',
  }
  return icons[kind]
}

function summarizeToolCall(call: any): string {
  if (!call || typeof call !== 'object') return String(call || 'tool call')
  const name = call.name || call.tool || call.type || call.function || call.action || 'tool'
  const input = call.input || call.args || call.arguments || call.query || call.command || call.url || ''
  const status = call.status || call.result?.status || call.error || ''
  const inputText = typeof input === 'string' ? input : JSON.stringify(input).slice(0, 160)
  return [name, inputText, status].filter(Boolean).join(' · ').slice(0, 220)
}

function classifyToolKind(call: any): ActivityKind {
  const text = JSON.stringify(call || {}).toLowerCase()
  if (/terminal|shell|bash|command|process/.test(text)) return 'terminal'
  if (/web_search|web_extract|browser|url|http|search|crawl/.test(text)) return 'web'
  return 'tool'
}

const VALID_VISUAL_TYPES = new Set<VisualCardType>(['Executive', 'KPI', 'Scenario', 'Matrix', 'Risk', 'Decision', 'Supplier', 'Chart', 'Table', 'Pie', 'Bar', 'Line'])

function asString(value: unknown, fallback = '') {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

function asArray<T>(value: unknown, mapper: (item: any, index: number) => T | null, max = 8): T[] {
  if (!Array.isArray(value)) return []
  return value.map(mapper).filter(Boolean).slice(0, max) as T[]
}

function normalizeMetric(item: any): VisualMetric | null {
  const label = asString(item?.label || item?.metric || item?.name)
  const unit = asString(item?.unit)
  const period = asString(item?.period)
  const value = [asString(item?.value), unit].filter(Boolean).join(' ')
  if (!label || !value) return null
  const tone = ['positive', 'warning', 'danger', 'neutral', 'opportunity'].includes(item?.tone) ? item.tone : 'neutral'
  const detail = asString(item?.detail || [item?.source, item?.evidenceLabel, period].filter(Boolean).join(' · '), 'Research-derived signal')
  return { label, value, detail, tone }
}

function normalizeSegment(item: any, index: number): ChartSegment | null {
  const label = asString(item?.label)
  const numeric = Number(item?.value)
  if (!label || !Number.isFinite(numeric)) return null
  const colors = ['#4fc3f7', '#34d399', '#c9a84c', '#fb923c', '#f87171', '#a78bfa']
  return { label, value: Math.max(0, Math.min(100, numeric)), color: asString(item?.color, colors[index % colors.length]) }
}

function normalizeMatrixRow(item: any): MatrixRow | null {
  const label = asString(item?.label || item?.factor || item?.item || item?.country || item?.supplier || item?.competitor)
  const value = asString(item?.value || item?.signal || item?.meaning || item?.finding || item?.evidenceLabel)
  if (!label || !value) return null
  const statusText = asString(item?.status, 'Review')
  const tone = ['positive', 'warning', 'danger', 'neutral'].includes(item?.tone)
    ? item.tone
    : /positive|opportunity|verified|strong/i.test(statusText)
      ? 'positive'
      : /risk|weak|verify|assumption|gap/i.test(statusText)
        ? 'warning'
        : 'neutral'
  return { label, value, status: statusText, tone }
}

function normalizeRiskItem(item: any): RiskItem | null {
  const risk = asString(item?.risk || item?.issue || item?.gap)
  if (!risk) return null
  const severity = ['Low', 'Medium', 'High', 'Critical'].includes(item?.severity) ? item.severity : 'Medium'
  const probability = ['Low', 'Medium', 'High'].includes(item?.probability) ? item.probability : severity === 'High' || severity === 'Critical' ? 'High' : 'Medium'
  const mitigation = asString(item?.mitigation || item?.action || item?.evidenceLabel, 'Verify source evidence and assign owner before decision.')
  return { risk, severity, probability, mitigation }
}

function normalizeVisualType(value: unknown): VisualCardType | undefined {
  const raw = asString(value)
  if (!raw) return undefined
  const exact = raw as VisualCardType
  if (VALID_VISUAL_TYPES.has(exact)) return exact
  const lower = raw.toLowerCase().replace(/[_-]+/g, ' ')
  if (/pie|donut/.test(lower)) return 'Pie'
  if (/bar|ranking|score/.test(lower)) return 'Bar'
  if (/line|trend|forecast|growth/.test(lower)) return 'Line'
  if (/table|country list|comparison list/.test(lower)) return 'Table'
  if (/matrix|competitor|decision grid/.test(lower)) return 'Matrix'
  if (/risk|ehs|hazard|permit/.test(lower)) return 'Risk'
  if (/supplier|vendor|source/.test(lower)) return 'Supplier'
  if (/scenario|case/.test(lower)) return 'Scenario'
  if (/kpi|metric|capex|opex|financial/.test(lower)) return 'KPI'
  if (/decision|recommend/.test(lower)) return 'Decision'
  if (/chart|graph/.test(lower)) return 'Chart'
  return 'Executive'
}

function normalizeEvidenceStatus(value: unknown): BusinessVisualCardPatch['evidenceStatus'] | undefined {
  const lower = asString(value).toLowerCase()
  if (!lower) return undefined
  if (lower.includes('mixed') || (lower.includes('assumption') && lower.includes('verify'))) return 'Mixed'
  if (lower.includes('verified')) return 'Verified'
  if (lower.includes('user')) return 'User Provided'
  if (lower.includes('assumption')) return 'Assumption'
  if (lower.includes('verify') || lower.includes('unverified')) return 'To Verify'
  return undefined
}

function normalizeConfidence(value: unknown): BusinessVisualCardPatch['confidence'] | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value >= 0.75) return '🟢 Higher'
    if (value >= 0.5) return '🟡 Medium'
    if (value >= 0.25) return '🟠 Low'
    return '🔴 Critical'
  }
  const raw = asString(value)
  if (['🟢 Higher', '🟡 Medium', '🟠 Low', '🔴 Critical'].includes(raw)) return raw as BusinessVisualCardPatch['confidence']
  const lower = raw.toLowerCase()
  if (/high|higher|strong/.test(lower)) return '🟢 Higher'
  if (/medium|moderate|0\.5|55|60|65|70/.test(lower)) return '🟡 Medium'
  if (/low|weak|0\.2|0\.3|0\.4/.test(lower)) return '🟠 Low'
  if (/critical|red/.test(lower)) return '🔴 Critical'
  return undefined
}

function extractVisualJsonPayload(response: string): { displayText: string; patch: BusinessVisualCardPatch | null; parseNote: string } {
  const patterns = [
    /```(?:VISUAL_CARD_JSON|visual_card_json|json)\s*([\s\S]*?"metrics"[\s\S]*?)```/i,
    /VISUAL_CARD_JSON\s*:?\s*({[\s\S]*})\s*$/i,
  ]
  for (const pattern of patterns) {
    const match = response.match(pattern)
    if (!match) continue
    const raw = match[1].trim()
    try {
      const parsed = JSON.parse(raw)
      const patch: BusinessVisualCardPatch = {
        title: asString(parsed.title) || undefined,
        summary: asString(parsed.summary) || undefined,
        visualType: normalizeVisualType(parsed.visualType || parsed.type || parsed.format),
        evidenceStatus: normalizeEvidenceStatus(parsed.evidenceStatus || parsed.evidence || parsed.status),
        confidence: normalizeConfidence(parsed.confidence || parsed.confidenceScore),
        metrics: asArray(parsed.metrics, normalizeMetric, 8),
        chartSegments: asArray(parsed.chartSegments || parsed.segments, normalizeSegment, 8),
        matrixRows: asArray(parsed.matrixRows || parsed.rows, normalizeMatrixRow, 8),
        riskItems: asArray(parsed.riskItems || parsed.risks, normalizeRiskItem, 6),
        nextAction: asString(parsed.nextAction || parsed.action) || undefined,
      }
      const displayText = response.replace(match[0], '').trim()
      return { displayText: displayText || response, patch, parseNote: 'Structured visual card JSON parsed from Hermes response.' }
    } catch (error: any) {
      return { displayText: response, patch: null, parseNote: `VISUAL_CARD_JSON was present but could not be parsed: ${error.message || error}` }
    }
  }
  return { displayText: response, patch: null, parseNote: 'No VISUAL_CARD_JSON block returned; card used fallback extraction from answer text.' }
}

function buildInstructions(): string {
  const modeDetail = chatModes.find(mode => mode.value === selectedMode.value)?.detail || ''
  const reasoningDetail = reasoningOptions.find(option => option.value === selectedReasoning.value)?.detail || ''
  return [
    `Chemicon Workshop AI tab controls selected by user: mode=${selectedMode.value} (${modeDetail}); reasoning=${selectedReasoning.value} (${reasoningDetail}); requested_provider=${activeProviderLabel.value}; requested_model=${activeModelLabel.value}.`,
    visualResearch.value ? 'For every substantial user message, first understand the real work requested, research/think through the answer, then choose the best presentation format for the result: table for comparisons/country lists, matrix for competitors/decisions, pie chart for share/split/mix, line/trend graph for growth/forecast over time, bar chart for rankings/scores, KPI tiles for numeric business signals, risk register for hazards/permits/EHS, supplier scorecard for sourcing, or executive card for qualitative strategy.' : '',
    'For Chemicon business questions, do NOT answer as a wall of text. Do real research/reasoning first, then produce a lucrative executive answer with actual data/signals and evidence labels. The dashboard card must not be a fixed template: every KPI, matrix row, chart segment, risk, and next action should come from the research answer or explicitly be marked To Verify/Assumption. Route market topics to Market Analysis, competitor topics to Competitors, and unrelated/general business topics to Business Cards.',
    'At the END of every business/dashboard answer, include a fenced JSON block labeled VISUAL_CARD_JSON. The JSON must have this shape: {"title":"...","summary":"...","visualType":"Executive|KPI|Scenario|Matrix|Risk|Decision|Supplier|Chart|Table|Pie|Bar|Line","evidenceStatus":"Verified|User Provided|Assumption|To Verify|Mixed","confidence":"🟢 Higher|🟡 Medium|🟠 Low|🔴 Critical","metrics":[{"label":"...","value":"...","detail":"...","tone":"positive|warning|danger|neutral|opportunity"}],"chartSegments":[{"label":"...","value":67,"color":"#4fc3f7"}],"matrixRows":[{"label":"...","value":"...","status":"...","tone":"positive|warning|danger|neutral"}],"riskItems":[{"risk":"...","severity":"Low|Medium|High|Critical","probability":"Low|Medium|High","mitigation":"..."}],"nextAction":"..."}. Replace every example value with figures derived from the research answer, source names, dates, suppliers, countries, prices, capacities, percentages, or document gaps wherever available; never fill generic placeholders.',
    sourceBacked.value ? 'Separate claims into Verified / User Provided / Assumption / To Verify. Do not present unverified market, regulatory, customer, or supplier data as fact.' : '',
    toolTrace.value ? 'Expose tool/API-call summary when available, including web search, browser, terminal, file, and bridge steps. If tools were used, summarize what was called and why.' : 'Keep tool-call details minimized unless needed.',
    selectedReasoning.value === 'high' ? 'Use deeper feasibility reasoning and call out weaknesses bluntly.' : '',
  ].filter(Boolean).join('\n')
}

function buildOutgoingMessage(text: string): string {
  const attachmentNote = attachments.value.length
    ? `\n\nAttached file references from UI: ${attachments.value.map(item => `${item.name} (${item.type}, ${formatSize(item.size)})`).join('; ')}. If binary content is needed, ask for the file content because Workshop binary upload is not fully wired yet.`
    : ''
  return `${text}${attachmentNote}`
}

type JsonResponse<T> = T

async function fetchJson<T>(url: string, options?: RequestInit): Promise<JsonResponse<T>> {
  const resp = await fetch(url, options)
  const text = await resp.text()
  const contentType = resp.headers.get('content-type') || ''
  if (!resp.ok) {
    const preview = text.replace(/\s+/g, ' ').slice(0, 180)
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}${preview ? ` — ${preview}` : ''}`)
  }
  if (!contentType.includes('application/json')) {
    const preview = text.replace(/\s+/g, ' ').slice(0, 180)
    throw new Error(`Expected JSON from bridge but received ${contentType || 'unknown content type'}${preview ? ` — ${preview}` : ''}`)
  }
  try {
    return JSON.parse(text) as T
  } catch (error: any) {
    throw new Error(`Invalid JSON from bridge: ${error.message || error}`)
  }
}

async function fetchModels() {
  modelLoadError.value = null
  if (isGithubStaticBackup.value) {
    currentModel.value = null
    availableModels.value = []
    providersWithKeys.value = []
    if (!selectedModel.value) selectedModel.value = 'gpt-5.5'
    if (!selectedProvider.value) selectedProvider.value = 'openai-codex'
    modelLoadError.value = 'GitHub Pages is running as a static dashboard. No Cloudflare bridge is configured.'
    return
  }
  try {
    const data = await fetchJson<ModelsResponse>(`${BRIDGE_URL}/api/hermes/models`)
    currentModel.value = data.current ?? null
    availableModels.value = data.available ?? []
    providersWithKeys.value = data.providers_with_keys ?? []
    if (!selectedModel.value && currentModel.value?.model) selectedModel.value = currentModel.value.model
    if (!selectedProvider.value && currentModel.value?.provider) selectedProvider.value = currentModel.value.provider
  } catch (err: any) {
    modelLoadError.value = err.message || 'Failed to fetch models'
    if (!selectedModel.value) selectedModel.value = 'gpt-5.5'
    if (!selectedProvider.value) selectedProvider.value = 'openai-codex'
  }
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text && attachments.value.length === 0) return

  const outgoingText = buildOutgoingMessage(text || 'Analyze the attached file references.')
  messages.value.push({ role: 'user', content: outgoingText, time: new Date().toLocaleTimeString() })

  input.value = ''
  attachments.value = []
  sending.value = true
  activeRequestId.value = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  const progressTimers: number[] = []
  addActivity('reasoning', 'queued', 'Request accepted', `Session ${sessionId.value} · ${selectedModeLabel.value} mode · ${selectedReasoningLabel.value} reasoning`)
  scrollToBottom()

  const routeTargets = routeChatCommand(outgoingText)
  const routedTo = summarizeRouteTargets(routeTargets)
  const intelligenceTargets = routeTargets.filter(target => target.routeName !== 'chat')
  addActivity('route', 'done', 'Command classified', `Targets: ${routedTo}. Route count: ${routeTargets.length}.`)
  const cardActivityId = intelligenceTargets.length
    ? addActivity('card', 'running', 'Routed visual work items created', `Preparing ${intelligenceTargets.length} routed dashboard card(s) for hydration from the Hermes research response.`)
    : ''

  for (const target of routeTargets) {
    appStore.addChatInsight(
      outgoingText.slice(0, 100) + (outgoingText.length > 100 ? '...' : ''),
      target.category,
      target.routeName,
      target.reason,
    )
  }

  const pendingCards = intelligenceTargets.map(target => {
    const card = appStore.addBusinessVisualCard(
      outgoingText,
      `⏳ Working on this command with ${selectedReasoningLabel.value} reasoning. I am choosing the best visual presentation for this specific request — table, matrix, pie, trend graph, bar chart, KPI tiles, risk register, supplier scorecard, or executive card — then the chat reply will update this routed card with evidence status and next action. Routed because: ${target.reason}.`,
      target.category,
      target.routeName,
      `Working: ${target.label} · ${outgoingText.slice(0, 44)}`,
    )
    return { target, cardId: card.id }
  })

  if (intelligenceTargets.length > 0) {
    messages.value.push({
      role: 'assistant',
      content: `📌 **Routing & adaptive visual work started**\n- I understood this as: ${outgoingText.slice(0, 120)}${outgoingText.length > 120 ? '…' : ''}\n- Chat reply: in this session\n- Visual cards: ${pendingCards.map(item => `${item.target.label} #${item.cardId}`).join(', ')}\n- Saved to: ${routedTo}\n\nI will choose the best format for the result — table, matrix, graph, chart, pie, KPI card, risk board, or supplier scorecard — and update the related tab instead of leaving it as plain text.`,
      time: new Date().toLocaleTimeString(),
    })
    scrollToBottom()
  }

  if (isGithubStaticBackup.value) {
    const staticDetail = 'GitHub Pages static mode: no Cloudflare tunnel is used. The command and routed visual cards were saved locally in this browser; live Hermes execution requires a stable HTTPS API bridge configured later.'
    addActivity('bridge', 'done', 'GitHub static backup', 'Skipped live bridge call by design — no Cloudflare URL is configured or used.')
    addActivity('card', 'done', 'Visual cards captured locally', `Saved to ${routedTo}. Cards can be opened in the routed dashboard tab.`)
    addActivity('result', 'done', 'Static capture complete', staticDetail)
    pendingCards.forEach(item => appStore.updateBusinessVisualCard(item.cardId, {
      title: `GitHub static capture: ${item.target.label} · ${outgoingText.slice(0, 42)}`,
      summary: `${staticDetail} Original request: ${outgoingText}`,
      evidenceStatus: 'To Verify',
      confidence: '🟡 Medium',
      nextAction: 'Use the saved visual card as a work item, or configure a stable non-Cloudflare HTTPS bridge in localStorage.chemicon.bridgeUrl when live Hermes execution is needed.',
    }))
    messages.value.push({
      role: 'assistant',
      content: `✅ **GitHub static capture complete**\n\nNo Cloudflare bridge was called. Your request was saved in this browser and routed visual cards were captured in: ${routedTo}.\n\nGitHub Pages can host the dashboard UI, but it cannot run the Hermes agent/API by itself. For now this GitHub deployment will keep the dashboard and visual-card routing stable without showing a broken Cloudflare connection.`,
      time: new Date().toLocaleTimeString(),
    })
    sending.value = false
    scrollToBottom()
    return
  }

  const bridgeActivityId = addActivity('bridge', 'running', 'Calling Hermes bridge', `${BRIDGE_URL || 'same-origin'}/api/chemicon-chat · model ${activeProviderLabel.value}/${activeModelLabel.value}`)
  const reasoningActivityId = addActivity('reasoning', 'running', 'Hermes is working', 'Waiting for final response. If Hermes searches the web or runs terminal/tools, returned tool calls will appear here.')
  const waitActivityIds: string[] = []
  progressTimers.push(window.setTimeout(() => {
    waitActivityIds.push(addActivity('tool', 'running', 'Still waiting for Hermes', 'Longer tasks may include research, browser, file, or terminal work behind the bridge.'))
  }, 7000))
  progressTimers.push(window.setTimeout(() => {
    waitActivityIds.push(addActivity('bridge', 'running', 'Bridge request still open', 'Configured bridge is still waiting for Hermes. Routed visual work items are already saved.'))
  }, 16000))

  try {
    const data = await fetchJson<any>(`${BRIDGE_URL}/api/chemicon-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: outgoingText,
        session_id: sessionId.value,
        provider: selectedProvider.value,
        model: selectedModel.value,
        reasoning_effort: selectedReasoning.value,
        mode: selectedMode.value,
        instructions: buildInstructions(),
      }),
    })
    progressTimers.forEach(timer => window.clearTimeout(timer))
    waitActivityIds.forEach(id => updateActivity(id, 'done', 'Resolved: Hermes returned a final response through the bridge.'))
    updateActivity(bridgeActivityId, 'done', `Bridge returned JSON. API calls reported: ${data.api_calls ?? 0}.`)
    updateActivity(reasoningActivityId, 'done', data.response ? `Response received: ${String(data.response).slice(0, 120)}${String(data.response).length > 120 ? '…' : ''}` : 'Hermes returned without response text.')
    if (Array.isArray(data.tool_calls) && data.tool_calls.length) {
      data.tool_calls.slice(0, 12).forEach((call: any, index: number) => {
        addActivity(classifyToolKind(call), 'done', `Tool call ${index + 1}`, summarizeToolCall(call))
      })
    } else if (toolTrace.value) {
      addActivity('tool', 'done', 'Tool trace', 'No detailed tool calls were returned by the current bridge response; only final API-call count is available.')
    }

    let reply: string
    if (data.ok && data.response) {
      const visualPayload = extractVisualJsonPayload(String(data.response))
      if (visualPayload.patch) addActivity('card', 'done', 'Structured card data parsed', visualPayload.parseNote)
      else addActivity('card', 'running', 'Card parser fallback', visualPayload.parseNote)
      reply = visualPayload.displayText
      const footerParts = [
        data.api_calls ? `${data.api_calls} API calls` : '',
        data.model || selectedModel.value || 'agent',
        selectedReasoning.value !== 'auto' ? `${selectedReasoning.value} reasoning` : 'auto reasoning',
        selectedMode.value,
      ].filter(Boolean)
      reply += `\n\n---\n*(${footerParts.join(' · ')})*`
      const cardLinks: string[] = []
      for (const item of pendingCards) {
        appStore.addBriefing(outgoingText, data.response, item.target.category, item.target.routeName)
        const structuredPatch = visualPayload.patch || {}
        const updated = appStore.updateBusinessVisualCard(item.cardId, {
          ...structuredPatch,
          title: structuredPatch.title || `${item.target.label}: ${outgoingText.slice(0, 52)}`,
          summary: structuredPatch.summary || reply,
        })
        cardLinks.push(`${item.target.label} visual card #${updated?.id || item.cardId}`)
      }
      if (intelligenceTargets.length > 0) {
        if (cardActivityId) updateActivity(cardActivityId, 'done', cardLinks.join('; '))
        else addActivity('card', 'done', 'Visual cards updated', cardLinks.join('; '))
        reply += `\n\n---\n**Visual cards updated**\n${cardLinks.map(link => `- ${link}`).join('\n')}\n\n*Saved to: ${routedTo}. Open the matching dashboard tab to see the best-fit presentation for your command: table/matrix, chart/graph/pie, KPI tiles, risk lights, evidence status, and next action.*`
      }
      addActivity('result', 'done', 'Answer delivered', `${footerParts.join(' · ')} · saved to ${routedTo}`)
    } else if (data.ok && data.error) {
      reply = `⚠️ Agent error: ${data.error}\n\n*Bridge connected — API token may need refresh. The pipeline is live.*`
      pendingCards.forEach(item => appStore.updateBusinessVisualCard(item.cardId, {
        title: `Needs retry: ${item.target.label} · ${outgoingText.slice(0, 42)}`,
        summary: `The question was captured and routed to ${item.target.label}, but Hermes returned an agent error: ${data.error}. The card remains here so the work is not lost; retry after refreshing the API token/session.`,
        evidenceStatus: 'To Verify',
        confidence: '🔴 Critical',
        nextAction: 'Refresh the agent/API session, resend this command, and replace this retry card with the final visual answer.',
      }))
    } else {
      reply = `⚠️ Bridge error: ${data.error || 'Unknown'}`
      pendingCards.forEach(item => appStore.updateBusinessVisualCard(item.cardId, {
        title: `Bridge issue: ${item.target.label} · ${outgoingText.slice(0, 42)}`,
        summary: `The question was captured and routed to ${item.target.label}, but the bridge returned an error: ${data.error || 'Unknown'}. The visual card remains visible as a work item instead of disappearing.`,
        evidenceStatus: 'To Verify',
        confidence: '🔴 Critical',
        nextAction: 'Check /api/chemicon-chat bridge health, then retry this command.',
      }))
    }

    messages.value.push({ role: 'assistant', content: reply, time: new Date().toLocaleTimeString() })
  } catch (err: any) {
    progressTimers.forEach(timer => window.clearTimeout(timer))
    waitActivityIds.forEach(id => updateActivity(id, 'error', 'The bridge failed before Hermes returned a final response.'))
    if (cardActivityId) updateActivity(cardActivityId, 'error', 'The routed visual work item is still saved, but final hydration failed because the bridge request failed.')
    updateActivity(bridgeActivityId, 'error', err.message || 'Bridge unreachable')
    updateActivity(reasoningActivityId, 'error', 'Hermes did not return a completed response through the browser bridge.')
    addActivity('result', 'error', 'Request failed visibly', `The routed card remains saved. Error: ${err.message || 'Bridge unreachable'}`)
    pendingCards.forEach(item => appStore.updateBusinessVisualCard(item.cardId, {
      title: `Connection issue: ${item.target.label} · ${outgoingText.slice(0, 42)}`,
      summary: `The question was captured and routed to ${item.target.label}, but the browser could not reach the bridge: ${err.message || 'Bridge unreachable'}. This saved work item prevents the request from disappearing; retry once the connection is healthy.`,
      evidenceStatus: 'To Verify',
      confidence: '🔴 Critical',
      nextAction: 'Verify same-origin or stable HTTPS API connectivity, then resend the chat command.',
    }))
    messages.value.push({
      role: 'assistant',
      content: `🔌 Connection error: ${err.message || 'Bridge unreachable'}\n\nThe configured agent bridge at ${BRIDGE_URL || 'same-origin /api'} is not responding. Your routed visual cards were still captured in: ${routedTo}.`,
      time: new Date().toLocaleTimeString(),
    })
  } finally {
    progressTimers.forEach(timer => window.clearTimeout(timer))
    sending.value = false
    scrollToBottom()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

watch(messages, value => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, JSON.stringify(value.slice(-80)))
  } catch {
    // Ignore browser storage errors; live in-memory chat still works.
  }
}, { deep: true })

watch(sessionId, value => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CHAT_SESSION_STORAGE_KEY, value)
  } catch {
    // Ignore browser storage errors.
  }
}, { immediate: true })

onMounted(() => {
  fetchModels()
  scrollToBottom()
})
</script>

<template>
  <div class="chat-page">
    <section class="chat-feature-coverage card">
      <div class="coverage-head">
        <div>
          <p class="eyebrow">EKKO Chat Function Coverage</p>
          <h2>AI Chat tab now mirrors EKKO dashboard controls</h2>
          <p class="coverage-note">
            Model selection, reasoning effort, modes, attachments, slash commands, side panels, capture, tool traces, and research presets are now visible in the chat surface. Partial items are labeled honestly where the Workshop bridge still lacks full upstream backend wiring.
          </p>
        </div>
        <div class="coverage-stats">
          <span class="badge badge-muted">{{ chatFeatures.length }} chat functions</span>
          <span class="badge badge-ok">{{ chatFeatures.filter(feature => feature.status === 'Live').length }} live</span>
          <span class="badge badge-info">{{ chatFeatures.filter(feature => feature.status === 'Partial').length }} partial</span>
          <span class="badge badge-warn">{{ chatFeatures.filter(feature => feature.status === 'Staged').length }} staged</span>
        </div>
      </div>

      <div class="coverage-grid">
        <article v-for="feature in chatFeatures" :key="feature.title" class="coverage-item">
          <div class="coverage-item-top">
            <h3>{{ feature.title }}</h3>
            <span class="badge" :class="featureBadgeClass(feature.status)">{{ feature.status }}</span>
          </div>
          <p>{{ feature.detail }}</p>
        </article>
      </div>
    </section>

    <div class="chat-card card">
      <div class="card-header chat-header-rich">
        <div>
          <h3>💬 AI Chat</h3>
          <div class="header-subline">
            <span class="badge" :class="bridgeStatusClass">{{ bridgeStatusLabel }}</span>
            <span class="badge badge-info">{{ activeProviderLabel }}</span>
            <span class="badge badge-muted">{{ activeModelLabel }}</span>
            <span class="badge badge-gold">{{ selectedModeLabel }}</span>
            <span class="badge badge-info">Reasoning: {{ selectedReasoningLabel }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="tool-btn primary" @click="showModelMenu = !showModelMenu">🧠 Model</button>
          <button
            v-for="utility in utilityButtons"
            :key="utility.key"
            class="tool-btn"
            type="button"
            @click="toggleUtility(utility.key)"
          >
            <span>{{ utility.icon }}</span> {{ utility.label }}
          </button>
        </div>
      </div>

      <div class="control-toolbar">
        <label class="control-group">
          <span>Mode</span>
          <select v-model="selectedMode">
            <option v-for="mode in chatModes" :key="mode.value" :value="mode.value">{{ mode.label }}</option>
          </select>
        </label>
        <label class="control-group">
          <span>Reasoning</span>
          <select v-model="selectedReasoning">
            <option v-for="option in reasoningOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <label class="toggle-chip" :class="{ active: visualResearch }">
          <input v-model="visualResearch" type="checkbox" /> Visual research
        </label>
        <label class="toggle-chip" :class="{ active: sourceBacked }">
          <input v-model="sourceBacked" type="checkbox" /> Source-backed
        </label>
        <label class="toggle-chip" :class="{ active: toolTrace }">
          <input v-model="toolTrace" type="checkbox" /> Tool traces
        </label>
        <label class="toggle-chip" :class="{ active: autoSpeech }">
          <input v-model="autoSpeech" type="checkbox" /> Auto speech
        </label>
      </div>

      <div v-if="showModelMenu" class="model-panel">
        <div class="model-panel-head">
          <div>
            <strong>Model selection</strong>
            <p>Current bridge model: {{ currentModel?.provider || 'unknown' }} / {{ currentModel?.model || 'unknown' }}</p>
            <p v-if="isGithubPages && BRIDGE_URL" class="text-gold">GitHub Pages is serving the dashboard. Live Hermes replies are sent to <code>{{ BRIDGE_URL }}</code>. You can replace it with a more stable HTTPS bridge by setting <code>localStorage.chemicon.bridgeUrl</code>.</p>
            <p v-else-if="isGithubPages" class="text-gold">GitHub Pages is a durable static deployment. Live Hermes API replies require a stable HTTPS bridge configured in <code>localStorage.chemicon.bridgeUrl</code>.</p>
            <p v-if="modelLoadError" class="text-red">⚠️ {{ modelLoadError }}</p>
          </div>
          <button class="retry-btn" @click="fetchModels">Refresh models</button>
        </div>
        <div class="model-fields">
          <label>
            <span>Provider</span>
            <select v-model="selectedProvider">
              <option v-for="provider in providerChoices" :key="provider" :value="provider">{{ provider }}</option>
            </select>
          </label>
          <label>
            <span>Model</span>
            <select v-model="selectedModel">
              <option v-for="model in modelChoices" :key="model" :value="model">{{ model }}</option>
            </select>
          </label>
          <label>
            <span>Manual provider</span>
            <input v-model="selectedProvider" placeholder="provider" />
          </label>
          <label>
            <span>Manual model</span>
            <input v-model="selectedModel" placeholder="model name" />
          </label>
        </div>
      </div>

      <div class="panel-row">
        <aside v-if="showSessionsPanel" class="mini-panel">
          <strong>Sessions</strong>
          <p>Active Workshop session: <code>{{ sessionId }}</code></p>
          <button class="retry-btn" @click="sessionId = `chemicon-${Date.now().toString(36)}`">New chat session</button>
        </aside>
        <aside v-if="showFilesPanel" class="mini-panel">
          <strong>Files</strong>
          <p>Attach button is live. Full upstream file browser is staged for Workshop.</p>
        </aside>
        <aside v-if="showTerminalPanel" class="mini-panel">
          <strong>Terminal</strong>
          <p>Terminal action is visible. Full terminal execution remains in upstream EKKO/Hermes dashboard.</p>
        </aside>
        <aside v-if="showOutlinePanel" class="mini-panel">
          <strong>Outline</strong>
          <p>{{ messages.length }} messages in this conversation.</p>
        </aside>
      </div>

      <section v-if="activityEvents.length" class="activity-panel">
        <div class="activity-head">
          <div>
            <strong>Hermes live activity</strong>
            <p>Visible route, bridge, tool, terminal/search, card, and result events for the current chat session.</p>
          </div>
          <button class="retry-btn" type="button" @click="activityEvents = []">Clear activity</button>
        </div>
        <div class="activity-stream">
          <article
            v-for="event in activityEvents"
            :key="event.id"
            class="activity-event"
            :class="[`activity-${event.kind}`, `status-${event.status}`]"
          >
            <span class="activity-kind">{{ activityIcon(event.kind) }}</span>
            <div>
              <div class="activity-title">
                <span>{{ statusIcon(event.status) }}</span>
                <strong>{{ event.title }}</strong>
                <small>{{ event.time }}</small>
              </div>
              <p>{{ event.detail }}</p>
            </div>
          </article>
        </div>
      </section>

      <div ref="chatArea" class="chat-messages">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="chat-bubble"
          :class="msg.role"
        >
          <div class="bubble-meta">
            <span class="bubble-role">{{ msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'Hermes' }}</span>
            <span class="bubble-time">{{ msg.time }}</span>
          </div>
          <div class="bubble-content" v-html="formatMessage(msg.content)" />
        </div>

        <div v-if="sending" class="chat-bubble assistant">
          <div class="bubble-meta">
            <span class="bubble-role">Hermes</span>
          </div>
          <div class="bubble-content typing">Working visibly with {{ selectedReasoningLabel }} reasoning in {{ selectedModeLabel }} mode — check the Hermes live activity panel for bridge/tool/card events...</div>
        </div>
      </div>

      <div class="preset-row">
        <button class="preset-chip" @click="insertPreset('country')">🌏 Country table</button>
        <button class="preset-chip" @click="insertPreset('supplier')">🏭 Supplier scorecard</button>
        <button class="preset-chip" @click="insertPreset('competitor')">⚔️ Competitor matrix</button>
        <button class="preset-chip" @click="insertPreset('chart')">📊 Chart-ready</button>
        <button class="preset-chip" @click="insertPreset('feasibility')">🧪 Feasibility</button>
      </div>

      <div class="command-row">
        <button
          v-for="chip in commandChips"
          :key="chip.label"
          class="command-chip"
          type="button"
          :title="chip.title"
          @click="insertChip(chip.insert)"
        >
          {{ chip.label }}
        </button>
      </div>

      <div v-if="attachments.length" class="attachment-row">
        <span v-for="item in attachments" :key="item.id" class="attachment-chip">
          📎 {{ item.name }} <small>{{ formatSize(item.size) }}</small>
          <button @click="removeAttachment(item.id)">×</button>
        </span>
      </div>

      <div class="chat-input-area">
        <input ref="fileInput" class="hidden-file" type="file" multiple @change="handleFileChange" />
        <button class="attach-btn" type="button" title="Attach files" @click="triggerAttach">📎</button>
        <textarea
          v-model="input"
          class="chat-input"
          placeholder="Ask about markets, competitors, investments, feasibility, suppliers, coding, or use /commands and @routing..."
          rows="2"
          :disabled="sending"
          @keydown="handleKeydown"
        />
        <button class="chat-send" @click="sendMessage" :disabled="sending || (!input.trim() && attachments.length === 0)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '@/styles/variables' as *;

.chat-page {
  max-width: 1120px;
  margin: 0 auto;
  min-height: calc(100vh - #{$header-height} - 48px);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.chat-feature-coverage {
  padding: 18px;
  border: 1px solid rgba($accent-cyan, 0.18);
  background: linear-gradient(135deg, rgba($accent-cyan, 0.06), rgba($bg-card, 0.96));
}

.coverage-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 16px;

  h2 {
    margin: 4px 0 6px;
    color: $text-primary;
    font-size: 18px;
  }
}

.eyebrow {
  margin: 0;
  color: $accent-cyan;
  font-family: $font-code;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.coverage-note {
  margin: 0;
  color: $text-secondary;
  font-size: 12px;
  line-height: 1.5;
}

.coverage-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  min-width: 260px;
}

.coverage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 10px;
}

.coverage-item {
  padding: 12px;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  background: rgba($bg-card-hover, .55);

  p {
    margin: 8px 0 0;
    color: $text-secondary;
    font-size: 12px;
    line-height: 1.5;
  }
}

.coverage-item-top {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: space-between;

  h3 {
    margin: 0;
    color: $text-primary;
    font-size: 13px;
  }
}

.badge-info { color: $accent-cyan; background: rgba($accent-cyan, .12); border-color: rgba($accent-cyan, .35); }
.badge-warn { color: $accent-orange; background: rgba($accent-orange, .12); border-color: rgba($accent-orange, .35); }
.badge-muted { color: $text-muted; background: rgba($border-color, .35); border-color: $border-color; }
.badge-gold { color: $accent-gold; background: rgba($accent-gold, .12); border-color: rgba($accent-gold, .35); }

.chat-card {
  display: flex;
  flex-direction: column;
  min-height: 640px;
}

.chat-header-rich {
  align-items: flex-start;
  gap: 14px;
}

.header-subline,
.header-actions,
.control-toolbar,
.preset-row,
.command-row,
.attachment-row,
.panel-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.header-subline { margin-top: 8px; }
.header-actions { justify-content: flex-end; }

.tool-btn,
.preset-chip,
.command-chip,
.attach-btn,
.retry-btn {
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  background: $bg-input;
  color: $text-secondary;
  padding: 7px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover:not(:disabled) {
    border-color: rgba($accent-gold, .55);
    color: $text-primary;
    background: rgba($accent-gold, .08);
  }

  &.primary {
    color: $accent-gold;
    border-color: rgba($accent-gold, .45);
  }
}

.control-toolbar {
  align-items: center;
  padding: 12px;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  background: rgba($bg-input, .65);
  margin-bottom: 12px;
}

.control-group,
.model-fields label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: $text-muted;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;

  select,
  input {
    min-width: 150px;
    padding: 7px 9px;
    border: 1px solid $border-color;
    border-radius: $radius-sm;
    background: $bg-root;
    color: $text-primary;
    outline: none;
  }
}

.toggle-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  color: $text-secondary;
  font-size: 12px;
  cursor: pointer;

  input { accent-color: $accent-gold; }

  &.active {
    color: $accent-cyan;
    border-color: rgba($accent-cyan, .38);
    background: rgba($accent-cyan, .08);
  }
}

.model-panel,
.mini-panel {
  border: 1px solid rgba($accent-cyan, .25);
  border-radius: $radius-md;
  background: rgba($accent-cyan, .06);
  padding: 12px;
  margin-bottom: 12px;
}

.model-panel-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  p {
    margin: 5px 0 0;
    color: $text-muted;
    font-size: 12px;
  }
}

.model-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.panel-row {
  margin-bottom: 10px;
}

.mini-panel {
  flex: 1 1 210px;
  margin-bottom: 0;

  p {
    color: $text-secondary;
    font-size: 12px;
    margin: 8px 0 0;
  }
}

.activity-panel {
  margin: 0 0 14px;
  padding: 14px;
  border: 1px solid rgba($accent-cyan, .22);
  border-radius: $radius-md;
  background: linear-gradient(135deg, rgba($accent-cyan, .06), rgba($bg-card-hover, .72));
}

.activity-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;

  strong { color: $accent-gold; }
  p {
    margin: 4px 0 0;
    color: $text-secondary;
    font-size: 12px;
  }
}

.activity-stream {
  display: grid;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
}

.activity-event {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 10px;
  padding: 10px;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  background: rgba($bg-card, .62);

  &.status-running { border-color: rgba($accent-gold, .34); }
  &.status-done { border-color: rgba($accent-green, .28); }
  &.status-error { border-color: rgba($accent-red, .42); }

  p {
    margin: 4px 0 0;
    color: $text-secondary;
    font-size: 12px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }
}

.activity-kind {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba($accent-cyan, .12);
}

.activity-title {
  display: flex;
  gap: 8px;
  align-items: center;
  color: $text-primary;

  small {
    margin-left: auto;
    color: $text-muted;
    font-family: $font-code;
    font-size: 10px;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: $radius-md;
  font-size: 13px;
  line-height: 1.6;

  &.user {
    align-self: flex-end;
    background: rgba($accent-gold, 0.12);
    border: 1px solid rgba($accent-gold, 0.2);
  }

  &.assistant {
    align-self: flex-start;
    background: $bg-card-hover;
    border: 1px solid $border-color;
  }

  &.system {
    align-self: center;
    max-width: 90%;
    background: rgba($accent-cyan, 0.08);
    border: 1px solid rgba($accent-cyan, 0.15);
    text-align: center;
    color: $text-secondary;
    font-size: 12px;
  }
}

.bubble-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;

  .bubble-role {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: $text-muted;
  }

  .bubble-time {
    font-size: 10px;
    color: $text-muted;
    font-family: $font-code;
  }
}

.bubble-content {
  color: $text-primary;

  :deep(strong) {
    color: $accent-gold;
  }
}

.typing {
  color: $text-muted;
  font-style: italic;
}

.preset-row,
.command-row,
.attachment-row {
  padding: 10px 0 0;
}

.preset-chip { color: $accent-cyan; }
.command-chip { font-family: $font-code; }

.attachment-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border: 1px solid rgba($accent-cyan, .28);
  border-radius: $radius-sm;
  background: rgba($accent-cyan, .06);
  color: $text-primary;
  font-size: 12px;

  small { color: $text-muted; }
  button {
    border: none;
    background: transparent;
    color: $text-muted;
    cursor: pointer;
  }
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 16px 0 0;
  border-top: 1px solid $border-color;
  margin-top: 16px;
}

.hidden-file { display: none; }

.attach-btn {
  width: 44px;
  height: 44px;
  align-self: flex-end;
  padding: 0;
}

.chat-input {
  flex: 1;
  padding: 12px 14px;
  background: $bg-input;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
  font-family: $font-sans;
  font-size: 13px;
  resize: vertical;
  min-height: 44px;
  outline: none;

  &:focus {
    border-color: $accent-gold;
  }

  &::placeholder {
    color: $text-muted;
  }
}

.chat-send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  align-self: flex-end;
  background: $accent-gold;
  border: none;
  border-radius: $radius-md;
  color: $bg-root;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover:not(:disabled) {
    background: color.adjust($accent-gold, $lightness: 10%);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.text-red { color: $accent-red; }

@media (max-width: 760px) {
  .coverage-head,
  .model-panel-head {
    flex-direction: column;
  }

  .coverage-stats {
    justify-content: flex-start;
    min-width: 0;
  }

  .chat-bubble { max-width: 96%; }
}
</style>
