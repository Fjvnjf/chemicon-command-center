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
    { path: '/ekko-functions', name: 'ekkoFunctions', component: () => import('@/views/EkkoFunctionsView.vue') },

    // ── INTELLIGENCE ──
    { path: '/market-analysis', name: 'marketAnalysis', component: () => import('@/views/MarketAnalysisView.vue') },
    { path: '/competitors', name: 'competitors', component: () => import('@/views/CompetitorsView.vue') },
    { path: '/business-cards', name: 'businessCards', component: () => import('@/views/BusinessCardsView.vue') },

    // ── HERMES AGENT ──
    { path: '/ekko-chat-sessions', name: 'ekkoChatSessions', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'chatSessions' } },
    { path: '/memory', name: 'memory', component: () => import('@/views/MemoryView.vue') },
    { path: '/skills', name: 'skills', component: () => import('@/views/SkillsView.vue') },
    { path: '/plugins', name: 'plugins', component: () => import('@/views/PluginsView.vue') },
    { path: '/group-chat', name: 'groupChat', component: () => import('@/views/GroupChatView.vue') },
    { path: '/ekko-group-chat', name: 'ekkoGroupChat', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'groupChat' } },
    { path: '/global-agent', name: 'globalAgent', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'globalAgent' } },
    { path: '/ekko-global-agent', name: 'ekkoGlobalAgent', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'globalAgent' } },
    { path: '/kanban', name: 'kanban', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'kanban' } },
    { path: '/coding-agents', name: 'codingAgents', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'codingAgents' } },
    { path: '/mcp-manager', name: 'mcpManager', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'runtimeAdmin' } },
    { path: '/skills-usage', name: 'skillsUsage', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'usageAnalytics' } },
    { path: '/ekko-skills-memory', name: 'ekkoSkillsMemory', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'skillsMemory' } },

    // ── OPERATIONS ──
    { path: '/jobs', name: 'jobs', component: () => import('@/views/JobsView.vue') },
    { path: '/ekko-jobs', name: 'ekkoJobs', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'jobs' } },
    { path: '/channels', name: 'channels', component: () => import('@/views/ChannelsView.vue') },
    { path: '/ekko-channels', name: 'ekkoChannels', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'channels' } },
    { path: '/devices', name: 'devices', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'runtimeAdmin' } },
    { path: '/version-preview', name: 'versionPreview', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'runtimeAdmin' } },
    { path: '/runtime-admin', name: 'runtimeAdmin', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'runtimeAdmin' } },
    { path: '/voice', name: 'voice', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'voice' } },
    { path: '/voice-settings', name: 'voiceSettings', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'voice' } },
    { path: '/auth-security', name: 'authSecurity', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'authSecurity' } },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/ekko-settings', name: 'ekkoSettings', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'settings' } },
    { path: '/distribution', name: 'distribution', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'distribution' } },

    // ── SYSTEM ──
    { path: '/models', name: 'models', component: () => import('@/views/ModelsView.vue') },
    { path: '/ekko-models', name: 'ekkoModels', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'models' } },
    { path: '/profiles', name: 'profiles', component: () => import('@/views/ProfilesView.vue') },
    { path: '/ekko-profiles', name: 'ekkoProfiles', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'profiles' } },
    { path: '/logs', name: 'logs', component: () => import('@/views/LogsView.vue') },
    { path: '/ekko-logs', name: 'ekkoLogs', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'logs' } },
    { path: '/usage', name: 'usage', component: () => import('@/views/UsageView.vue') },
    { path: '/ekko-usage-analytics', name: 'ekkoUsageAnalytics', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'usageAnalytics' } },
    { path: '/performance', name: 'performance', component: () => import('@/views/PerformanceView.vue') },
    { path: '/ekko-files', name: 'ekkoFiles', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'files' } },
    { path: '/ekko-terminal', name: 'ekkoTerminal', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'terminal' } },

    // Catch-all
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
})

export default router
