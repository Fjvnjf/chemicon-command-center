import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ChatInsight {
  id: number
  time: string
  topic: string
  category: 'market' | 'competitor' | 'investment' | 'general'
  routeName: string
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
  const chatInsights = ref<ChatInsight[]>([])
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

  function getInsightsByCategory(category: ChatInsight['category']) {
    return chatInsights.value.filter(i => i.category === category)
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setTitle(t: string) {
    title.value = t
  }

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
    toggleSidebar,
    setTitle,
  }
})
