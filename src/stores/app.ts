import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface ChatInsight {
  id: number
  time: string
  topic: string
  category: 'market' | 'competitor' | 'investment' | 'general'
  routeName: string
  reason?: string
}

export interface Briefing {
  id: number
  time: string
  category: 'market' | 'competitor' | 'investment' | 'general'
  question: string
  summary: string
  routeName: string
}

import { BRIDGE_URL } from '../bridge-config'

const CHAT_INSIGHTS_STORAGE_KEY = 'chemicon.chatInsights.v2'
const BRIEFINGS_STORAGE_KEY = 'chemicon.briefings.v2'

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
  let insightCounter = Math.max(
    0,
    ...chatInsights.value.map(i => i.id || 0),
    ...briefings.value.map(b => b.id || 0),
  )

  watch(chatInsights, value => saveStoredArray(CHAT_INSIGHTS_STORAGE_KEY, value), { deep: true })
  watch(briefings, value => saveStoredArray(BRIEFINGS_STORAGE_KEY, value), { deep: true })

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

  function getBriefingsByCategory(category: Briefing['category']) {
    return briefings.value.filter(b => b.category === category)
  }

  function removeBriefing(id: number) {
    briefings.value = briefings.value.filter(b => b.id !== id)
  }

  function getInsightsByCategory(category: ChatInsight['category']) {
    return chatInsights.value.filter(i => i.category === category)
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
    toggleSidebar,
    setTitle,
    usageLoading,
    usageError,
    fetchStatus,
    fetchUsage,
    fetchHealth,
  }
})
