<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const isOpen = computed(() => appStore.sidebarCollapsed ? false : true)

// ── Section definitions ──
interface SidebarItem {
  label: string
  icon: string
  routeName: string
  activeNames?: string[]
}

interface SidebarSection {
  key: string
  title: string
  icon: string
  items: SidebarItem[]
}

const sections: SidebarSection[] = [
  {
    key: 'workspace',
    title: 'WORKSPACE',
    icon: '📋',
    items: [
      { label: 'Home', icon: '🏠', routeName: 'home' },
      { label: 'Chat', icon: '💬', routeName: 'chat', activeNames: ['chatSession'] },
      { label: 'History', icon: '📚', routeName: 'history' },
      { label: 'Tasks', icon: '📌', routeName: 'tasks' },
      { label: 'Projects', icon: '📁', routeName: 'projects' },
      { label: 'Files', icon: '📂', routeName: 'files' },
      { label: 'Terminal', icon: '🖥', routeName: 'terminal' },
      { label: 'EKKOL Functions', icon: '🧬', routeName: 'ekkoFunctions' },
    ],
  },
  {
    key: 'intelligence',
    title: 'INTELLIGENCE',
    icon: '🧠',
    items: [
      { label: 'Market Analysis', icon: '📈', routeName: 'marketAnalysis' },
      { label: 'Competitors', icon: '⚔️', routeName: 'competitors' },
    ],
  },
  {
    key: 'hermesAgent',
    title: 'HERMES AGENT',
    icon: '🤖',
    items: [
      { label: 'Memory', icon: '🧠', routeName: 'memory' },
      { label: 'Skills', icon: '🛠', routeName: 'skills' },
      { label: 'Plugins', icon: '🔌', routeName: 'plugins' },
      { label: 'Group Chat', icon: '👥', routeName: 'groupChat' },
      { label: 'Global Agent', icon: '🌐', routeName: 'globalAgent' },
      { label: 'Kanban', icon: '📌', routeName: 'kanban' },
      { label: 'Coding Agents', icon: '🧑‍💻', routeName: 'codingAgents' },
      { label: 'MCP Manager', icon: '🔌', routeName: 'mcpManager' },
      { label: 'Skills Usage', icon: '📈', routeName: 'skillsUsage' },
    ],
  },
  {
    key: 'operations',
    title: 'OPERATIONS',
    icon: '⚡',
    items: [
      { label: 'Jobs', icon: '⏰', routeName: 'jobs' },
      { label: 'Channels', icon: '📡', routeName: 'channels' },
      { label: 'Devices', icon: '📱', routeName: 'devices' },
      { label: 'Version Preview', icon: '🧪', routeName: 'versionPreview' },
      { label: 'Voice', icon: '🎙', routeName: 'voice' },
      { label: 'Voice Settings', icon: '🔊', routeName: 'voiceSettings' },
      { label: 'Auth & Security', icon: '🔐', routeName: 'authSecurity' },
      { label: 'Settings', icon: '⚙', routeName: 'settings' },
    ],
  },
  {
    key: 'system',
    title: 'SYSTEM',
    icon: '🔧',
    items: [
      { label: 'Models', icon: '🧩', routeName: 'models' },
      { label: 'Profiles', icon: '👤', routeName: 'profiles' },
      { label: 'Logs', icon: '📋', routeName: 'logs' },
      { label: 'Usage', icon: '📊', routeName: 'usage' },
      { label: 'Health', icon: '💚', routeName: 'performance' },
    ],
  },
]

const collapsedSections = computed(() => {
  const stored: Record<string, boolean> = {}
  for (const s of sections) stored[s.key] = false
  return stored
})

function navigateTo(name: string) {
  void router.push({ name })
}

function isActive(item: SidebarItem) {
  const rn = route.name as string
  return rn === item.routeName || (item.activeNames || []).includes(rn)
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: !isOpen }">
    <!-- Brand -->
    <div class="sidebar-brand" @click="navigateTo('home')">
      <span class="brand-icon">🧠</span>
      <span v-show="isOpen" class="brand-text">CHEMICON</span>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <div v-for="section in sections" :key="section.key" class="nav-section">
        <div class="section-header">
          <span class="section-icon">{{ section.icon }}</span>
          <span v-show="isOpen" class="section-title">{{ section.title }}</span>
        </div>
        <div class="section-items">
          <a
            v-for="item in section.items"
            :key="item.routeName"
            class="sidebar-item"
            :class="{ active: isActive(item) }"
            :href="`#/${item.routeName}`"
            @click.prevent="navigateTo(item.routeName)"
          >
            <span class="item-icon">{{ item.icon }}</span>
            <span v-show="isOpen" class="item-label">{{ item.label }}</span>
            <span v-if="isOpen && isActive(item)" class="active-bar" />
          </a>
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <span v-show="isOpen" class="footer-version">v{{ appStore.version }}</span>
    </div>
  </aside>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.sidebar {
  position: relative;
  width: $sidebar-width;
  height: 100%;
  background: $bg-sidebar;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width $transition-normal;
  box-shadow: $shadow-lg;
  overflow: hidden;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 20px;
  cursor: pointer;
  flex-shrink: 0;

  .collapsed & {
    justify-content: center;
    padding: 16px 0 20px;
  }
}

.brand-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.brand-text {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: $accent-gold;
  text-transform: uppercase;
  white-space: nowrap;
}

// ── Nav ──
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
}

.nav-section {
  margin-bottom: 4px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 6px;
  color: $text-muted;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  user-select: none;

  .collapsed & {
    justify-content: center;
    padding: 14px 0 6px;
  }
}

.section-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.section-title {
  white-space: nowrap;
}

// ── Items ──
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 8px 20px;
  border-left: 3px solid transparent;
  color: $text-muted;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: all $transition-fast;
  position: relative;

  .collapsed & {
    justify-content: center;
    padding: 10px 0;
    border-left: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    color: $text-primary;
  }

  &.active {
    background: linear-gradient(90deg, rgba(201, 168, 76, 0.10), transparent);
    border-left-color: $accent-gold;
    color: $accent-gold;
  }
}

.item-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.item-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-bar {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  border-radius: 2px 0 0 2px;
  background: $accent-gold;
}

// ── Footer ──
.sidebar-footer {
  padding: 10px 16px 14px;
  border-top: 1px solid $border-color;
  flex-shrink: 0;

  .collapsed & {
    padding: 10px 0 14px;
    text-align: center;
  }
}

.footer-version {
  font-size: 10px;
  color: $text-muted;
  font-family: $font-code;
}
</style>
