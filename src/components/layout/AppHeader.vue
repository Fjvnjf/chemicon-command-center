<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const appStore = useAppStore()
const route = useRoute()

defineEmits<{ toggleSidebar: [] }>()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    home: 'Command Center',
    chat: 'AI Chat',
    chatSession: 'AI Chat',
    history: 'Sessions',
    tasks: 'Kanban Board',
    projects: 'Projects',
    files: 'Files',
    terminal: 'Terminal',
    ekkoFunctions: 'EKKO Functions',
    ekkoChatSessions: 'Agent Chat & Sessions',
    marketAnalysis: 'Market Analysis',
    competitors: 'Competitors',
    memory: 'Agent Memory',
    skills: 'Skills Library',
    plugins: 'Plugins & MCP',
    groupChat: 'Group Chat',
    ekkoGroupChat: 'Group Chat Parity',
    globalAgent: 'Global Agent',
    kanban: 'Kanban',
    codingAgents: 'Coding Agents',
    mcpManager: 'MCP Manager',
    skillsUsage: 'Skills Usage',
    ekkoSkillsMemory: 'Skills & Memory',
    jobs: 'Cron Jobs',
    ekkoJobs: 'Scheduled Jobs Parity',
    channels: 'Channels',
    ekkoChannels: 'Platform Channels Parity',
    devices: 'Devices',
    runtimeAdmin: 'Admin & Runtime',
    versionPreview: 'Version Preview',
    voice: 'Voice / TTS / STT',
    voiceSettings: 'Voice Settings',
    authSecurity: 'Auth & Security',
    settings: 'Settings',
    ekkoSettings: 'Settings Parity',
    distribution: 'Distribution & Updates',
    models: 'Models',
    ekkoModels: 'Model Management Parity',
    profiles: 'Profiles',
    ekkoProfiles: 'Multi-Profile Parity',
    logs: 'Activity Logs',
    ekkoLogs: 'Logs & Activity Parity',
    usage: 'Token Usage',
    ekkoUsageAnalytics: 'Usage Analytics Parity',
    performance: 'System Health',
    ekkoFiles: 'File Browser Parity',
    ekkoTerminal: 'Web Terminal Parity',
  }
  return titles[route.name as string] || 'Command Center'
})
</script>

<template>
  <header class="header">
    <!-- Left: hamburger + title -->
    <div class="header-left">
      <button class="hamburger" @click="$emit('toggleSidebar')" aria-label="Toggle sidebar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <h1 class="header-title">{{ pageTitle }}</h1>
    </div>

    <!-- Center: status badges -->
    <div class="header-center">
      <span class="badge badge-ok">Platforms: {{ appStore.platformCount }}</span>
      <span class="badge" :class="appStore.agentStatus === 'online' ? 'badge-ok' : 'badge-danger'">
        {{ appStore.agentModel }}
      </span>
      <span class="badge badge-info">Tokens: {{ appStore.tokenCount.toLocaleString() }}</span>
    </div>

    <!-- Right: version -->
    <div class="header-right">
      <span class="version-label">HERMES OPS v{{ appStore.version }}</span>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.header {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: $bg-sidebar;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  background: $bg-card;
  color: $text-muted;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    color: $accent-gold;
    border-color: $accent-gold;
  }
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: $text-primary;
}

.header-center {
  display: flex;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
}

.version-label {
  font-size: 11px;
  color: $text-muted;
  font-family: $font-code;
}
</style>
