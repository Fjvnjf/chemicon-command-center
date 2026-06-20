<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { BRIDGE_URL } from '../bridge-config'
import { routeChatCommand, summarizeRouteTargets } from '@/utils/chatRouting'

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


type ChatFeatureStatus = 'Live' | 'Partial' | 'Staged'

interface ChatFeatureItem {
  title: string
  status: ChatFeatureStatus
  detail: string
}

const chatFeatures: ChatFeatureItem[] = [
  { title: 'Same-origin Hermes chat bridge', status: 'Live', detail: 'Workshop sends messages through /api/chemicon-chat to Hermes using the WeChat-safe same-origin tunnel.' },
  { title: 'Dashboard tab routing', status: 'Live', detail: 'Commands can be saved to Market Analysis, Competitors, or both sections using business keywords or @market/@competitors/@both.' },
  { title: 'Markdown answers', status: 'Partial', detail: 'Basic bold and line-break rendering is live. Full upstream markdown/code block renderer is staged.' },
  { title: 'Session history sidebar', status: 'Staged', detail: 'Upstream ChatPanel has session list, active session switching, unread/completed markers, open-in-new-tab, and profile filters.' },
  { title: 'Session search modal', status: 'Staged', detail: 'Upstream includes global session search and history session routes; Workshop currently stores routed insight cards locally.' },
  { title: 'Session rename/export/delete', status: 'Staged', detail: 'Upstream supports rename, export, and batch-delete controls. These are not exposed in Workshop yet.' },
  { title: 'Continue/resume sessions', status: 'Staged', detail: 'Upstream supports /hermes/session/:sessionId continuation. Workshop currently starts a fresh bridge request per message.' },
  { title: 'Model/provider selector', status: 'Staged', detail: 'Upstream chat can use available model groups and profile-aware settings. Workshop displays the active backend model only through responses.' },
  { title: 'Agent/coding-agent mode', status: 'Staged', detail: 'Upstream can switch chat/live modes and infer coding-agent API mode for Codex/Claude-style runs.' },
  { title: 'File attachments & drag-drop', status: 'Staged', detail: 'Upstream ChatInput supports file drag/drop and upload plumbing. Workshop chat text input does not upload files yet.' },
  { title: 'Files side panel', status: 'Staged', detail: 'Upstream ChatPanel has a resizable FilesPanel for browsing related files during chat.' },
  { title: 'Terminal side panel', status: 'Staged', detail: 'Upstream ChatPanel has a resizable TerminalPanel tied to the chat workspace.' },
  { title: 'Conversation outline', status: 'Staged', detail: 'Upstream includes an OutlinePanel for navigating long responses and anchors.' },
  { title: 'Tool-call display', status: 'Staged', detail: 'Upstream MessageList/MessageItem surfaces tool calls and progress. Workshop only appends API-call count today.' },
  { title: 'Thinking/progress monitor', status: 'Staged', detail: 'Upstream ConversationMonitorPane shows runtime progress. Workshop only shows a simple Thinking indicator.' },
  { title: 'Virtualized long message list', status: 'Staged', detail: 'Upstream has VirtualMessageList for long sessions; Workshop uses a normal scroll area.' },
  { title: 'Voice dialogue controls', status: 'Staged', detail: 'Upstream includes VoiceDialogueControls and VoiceTranscriptOverlay components.' },
  { title: 'Workspace/folder picker', status: 'Staged', detail: 'Upstream includes FolderPicker and session workspace assignment. Workshop does not bind chat to a workspace folder yet.' },
  { title: 'Copy/open utilities', status: 'Staged', detail: 'Upstream supports clipboard and session utility actions. Workshop has no message action toolbar yet.' },
]

function featureBadgeClass(status: ChatFeatureStatus) {
  if (status === 'Live') return 'badge-ok'
  if (status === 'Partial') return 'badge-info'
  return 'badge-warn'
}

function scrollToBottom() {
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.scrollTop = chatArea.value.scrollHeight
    }
  })
}

// ── Bridge API ──

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

  // Detect one or more dashboard sections for tab routing.
  // Supports explicit commands like "@market", "@competitors", or "both sections".
  const routeTargets = routeChatCommand(text)
  const routedTo = summarizeRouteTargets(routeTargets)

  // Push to shared store immediately so the command appears in the relevant tab(s),
  // even if the agent response is slow or the tunnel times out.
  for (const target of routeTargets) {
    appStore.addChatInsight(
      text.slice(0, 100) + (text.length > 100 ? '...' : ''),
      target.category,
      target.routeName,
      target.reason,
    )
  }

  try {
    const resp = await fetch(`${BRIDGE_URL}/api/chemicon-chat`, {
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
      // Save as briefing card for every matched intelligence tab.
      const intelligenceTargets = routeTargets.filter(target => target.category !== 'general')
      for (const target of intelligenceTargets) {
        appStore.addBriefing(text, data.response, target.category, target.routeName)
      }
      if (intelligenceTargets.length > 0) {
        reply += `\n\n---\n*Saved to: ${routedTo}*`
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
    <section class="chat-feature-coverage card">
      <div class="coverage-head">
        <div>
          <p class="eyebrow">EKKO Chat Function Coverage</p>
          <h2>All upstream chat functions mapped into Workshop</h2>
          <p class="coverage-note">
            Live means usable now in this Workshop. Partial/Staged means visible here for parity tracking, but not falsely claimed as fully wired.
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

.chat-card {
  display: flex;
  flex-direction: column;
  min-height: 520px;
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
