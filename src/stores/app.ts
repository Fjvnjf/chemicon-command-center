import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ChatInsight {
  id: number
  time: string
  topic: string
  category: 'market' | 'competitor' | 'investment' | 'general'
  routeName: string
}

export interface Briefing {
  id: number
  time: string
  category: 'market' | 'competitor' | 'investment' | 'general'
  question: string
  summary: string
  routeName: string
}

const BRIDGE_URL = 'https://households-brooks-combination-thumb.trycloudflare.com'

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
  const chatInsights = ref<ChatInsight[]>([])
  const briefings = ref<Briefing[]>([])
  let insightCounter = 0

  function addChatInsight(topic: string, category: ChatInsight['category'], routeName: string) {
    insightCounter++
    chatInsights.value.unshift({
      id: insightCounter,
      time: new Date().toLocaleTimeString(),
      topic,
      category,
      routeName,
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
