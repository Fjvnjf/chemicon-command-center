import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/home' },

    // ── WORKSPACE ──
    { path: '/home', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/chat', name: 'chat', component: () => import('@/views/ChatView.vue') },
    { path: '/chat/:sessionId', name: 'chatSession', component: () => import('@/views/ChatView.vue') },
    { path: '/history', name: 'history', component: () => import('@/views/HistoryView.vue') },
    { path: '/tasks', name: 'tasks', component: () => import('@/views/TasksView.vue') },
    { path: '/projects', name: 'projects', component: () => import('@/views/ProjectsView.vue') },
    { path: '/files', name: 'files', component: () => import('@/views/FilesView.vue') },
    { path: '/terminal', name: 'terminal', component: () => import('@/views/TerminalView.vue') },

    // ── INTELLIGENCE ──
    { path: '/market-analysis', name: 'marketAnalysis', component: () => import('@/views/MarketAnalysisView.vue') },
    { path: '/competitors', name: 'competitors', component: () => import('@/views/CompetitorsView.vue') },

    // ── HERMES AGENT ──
    { path: '/memory', name: 'memory', component: () => import('@/views/MemoryView.vue') },
    { path: '/skills', name: 'skills', component: () => import('@/views/SkillsView.vue') },
    { path: '/plugins', name: 'plugins', component: () => import('@/views/PluginsView.vue') },
    { path: '/group-chat', name: 'groupChat', component: () => import('@/views/GroupChatView.vue') },

    // ── OPERATIONS ──
    { path: '/jobs', name: 'jobs', component: () => import('@/views/JobsView.vue') },
    { path: '/channels', name: 'channels', component: () => import('@/views/ChannelsView.vue') },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },

    // ── SYSTEM ──
    { path: '/models', name: 'models', component: () => import('@/views/ModelsView.vue') },
    { path: '/profiles', name: 'profiles', component: () => import('@/views/ProfilesView.vue') },
    { path: '/logs', name: 'logs', component: () => import('@/views/LogsView.vue') },
    { path: '/usage', name: 'usage', component: () => import('@/views/UsageView.vue') },
    { path: '/performance', name: 'performance', component: () => import('@/views/PerformanceView.vue') },

    // Catch-all
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
})

export default router
