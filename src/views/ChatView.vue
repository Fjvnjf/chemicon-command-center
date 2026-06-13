<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useAppStore, type ChatInsight } from '@/stores/app'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
}

const appStore = useAppStore()

const messages = ref<ChatMessage[]>([
  {
    role: 'system',
    content: 'Welcome to Chemicon Command Center. I am your AI strategist. Ask me about market analysis, competitor intelligence, investment analysis, or any business question.',
    time: new Date().toLocaleTimeString(),
  },
])

const input = ref('')
const sending = ref(false)
const chatArea = ref<HTMLDivElement>()

function scrollToBottom() {
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.scrollTop = chatArea.value.scrollHeight
    }
  })
}

// ── Bridge API ──
const BRIDGE_URL = 'https://kept-capability-freight-accuracy.trycloudflare.com'

async function sendMessage() {
  const text = input.value.trim()
  if (!text) return

  messages.value.push({
    role: 'user',
    content: text,
    time: new Date().toLocaleTimeString(),
  })

  input.value = ''
  sending.value = true
  scrollToBottom()

  // Detect category for tab routing
  const lower = text.toLowerCase()
  let category: ChatInsight['category'] = 'general'
  let routeName = 'chat'

  if (lower.includes('competitor') || lower.includes('competition') || lower.includes('rival') || lower.includes('comparison') || lower.includes('compare') || lower.includes(' vs ') || lower.includes('versus')) {
    category = 'competitor'
    routeName = 'competitors'
  } else if (lower.includes('invest') || lower.includes('financial') || lower.includes('roi') || lower.includes('breakeven') || lower.includes('npv') || lower.includes('payback')) {
    category = 'investment'
    routeName = 'marketAnalysis'
  } else if (lower.includes('market') || lower.includes('industry') || lower.includes('pricing') || lower.includes('demand') || lower.includes('supply') || lower.includes('margin')) {
    category = 'market'
    routeName = 'marketAnalysis'
  }

  // Push to shared store
  appStore.addChatInsight(text.slice(0, 80) + (text.length > 80 ? '...' : ''), category, routeName)

  try {
    const resp = await fetch(`${BRIDGE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })
    const data = await resp.json()

    let reply: string
    if (data.ok && data.response) {
      reply = data.response
      if (data.api_calls) {
        reply += `\n\n---\n*(${data.api_calls} API calls · ${data.model || 'agent'})*`
      }
    } else if (data.ok && data.error) {
      reply = `⚠️ Agent error: ${data.error}\n\n*Bridge connected — API token may need refresh. The pipeline is live.*`
    } else {
      reply = `⚠️ Bridge error: ${data.error || 'Unknown'}`
    }

    messages.value.push({
      role: 'assistant',
      content: reply,
      time: new Date().toLocaleTimeString(),
    })
  } catch (err: any) {
    messages.value.push({
      role: 'assistant',
      content: `🔌 Connection error: ${err.message || 'Bridge unreachable'}\n\nThe agent bridge at ${BRIDGE_URL} is not responding.`,
      time: new Date().toLocaleTimeString(),
    })
  } finally {
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

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="chat-page">
    <div class="chat-card card">
      <div class="card-header">
        <h3>💬 AI Chat</h3>
        <span class="badge badge-ok">Connected</span>
      </div>

      <!-- Messages -->
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
          <div class="bubble-content" v-html="msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')" />
        </div>

        <div v-if="sending" class="chat-bubble assistant">
          <div class="bubble-meta">
            <span class="bubble-role">Hermes</span>
          </div>
          <div class="bubble-content typing">Thinking...</div>
        </div>
      </div>

      <!-- Input -->
      <div class="chat-input-area">
        <textarea
          v-model="input"
          class="chat-input"
          placeholder="Ask about markets, competitors, investments, or anything..."
          rows="2"
          @keydown="handleKeydown"
          :disabled="sending"
        />
        <button class="chat-send" @click="sendMessage" :disabled="sending || !input.trim()">
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
@use '@/styles/variables' as *;

.chat-page {
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - #{$header-height} - 48px);
}

.chat-card {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 16px 0 0;
  border-top: 1px solid $border-color;
  margin-top: 16px;
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
  resize: none;
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
    background: lighten($accent-gold, 10%);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
