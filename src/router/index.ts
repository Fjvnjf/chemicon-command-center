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
    { path: '/ekkol-functions', name: 'ekkoFunctions', component: () => import('@/views/EkkoFunctionsView.vue') },
    { path: '/ekko-functions', redirect: '/ekkol-functions' },

    // ── INTELLIGENCE ──
    { path: '/market-analysis', name: 'marketAnalysis', component: () => import('@/views/MarketAnalysisView.vue') },
    { path: '/competitors', name: 'competitors', component: () => import('@/views/CompetitorsView.vue') },

    // ── HERMES AGENT ──
    { path: '/ekkol-chat-sessions', name: 'ekkoChatSessions', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'chatSessions' } },
    { path: '/ekko-chat-sessions', redirect: '/ekkol-chat-sessions' },
    { path: '/memory', name: 'memory', component: () => import('@/views/MemoryView.vue') },
    { path: '/skills', name: 'skills', component: () => import('@/views/SkillsView.vue') },
    { path: '/plugins', name: 'plugins', component: () => import('@/views/PluginsView.vue') },
    { path: '/group-chat', name: 'groupChat', component: () => import('@/views/GroupChatView.vue') },
    { path: '/ekkol-group-chat', name: 'ekkoGroupChat', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'groupChat' } },
    { path: '/ekko-group-chat', redirect: '/ekkol-group-chat' },
    { path: '/global-agent', name: 'globalAgent', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'globalAgent' } },
    { path: '/kanban', name: 'kanban', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'kanban' } },
    { path: '/coding-agents', name: 'codingAgents', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'codingAgents' } },
    { path: '/mcp-manager', name: 'mcpManager', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'runtimeAdmin' } },
    { path: '/skills-usage', name: 'skillsUsage', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'usageAnalytics' } },
    { path: '/ekkol-skills-memory', name: 'ekkoSkillsMemory', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'skillsMemory' } },
    { path: '/ekko-skills-memory', redirect: '/ekkol-skills-memory' },

    // ── OPERATIONS ──
    { path: '/jobs', name: 'jobs', component: () => import('@/views/JobsView.vue') },
    { path: '/ekkol-jobs', name: 'ekkoJobs', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'jobs' } },
    { path: '/ekko-jobs', redirect: '/ekkol-jobs' },
    { path: '/channels', name: 'channels', component: () => import('@/views/ChannelsView.vue') },
    { path: '/ekkol-channels', name: 'ekkoChannels', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'channels' } },
    { path: '/ekko-channels', redirect: '/ekkol-channels' },
    { path: '/devices', name: 'devices', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'runtimeAdmin' } },
    { path: '/version-preview', name: 'versionPreview', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'runtimeAdmin' } },
    { path: '/runtime-admin', name: 'runtimeAdmin', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'runtimeAdmin' } },
    { path: '/voice', name: 'voice', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'voice' } },
    { path: '/voice-settings', name: 'voiceSettings', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'voice' } },
    { path: '/auth-security', name: 'authSecurity', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'authSecurity' } },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/ekkol-settings', name: 'ekkoSettings', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'settings' } },
    { path: '/ekko-settings', redirect: '/ekkol-settings' },
    { path: '/distribution', name: 'distribution', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'distribution' } },

    // ── SYSTEM ──
    { path: '/models', name: 'models', component: () => import('@/views/ModelsView.vue') },
    { path: '/ekkol-models', name: 'ekkoModels', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'models' } },
    { path: '/ekko-models', redirect: '/ekkol-models' },
    { path: '/profiles', name: 'profiles', component: () => import('@/views/ProfilesView.vue') },
    { path: '/ekkol-profiles', name: 'ekkoProfiles', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'profiles' } },
    { path: '/ekko-profiles', redirect: '/ekkol-profiles' },
    { path: '/logs', name: 'logs', component: () => import('@/views/LogsView.vue') },
    { path: '/ekkol-logs', name: 'ekkoLogs', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'logs' } },
    { path: '/ekko-logs', redirect: '/ekkol-logs' },
    { path: '/usage', name: 'usage', component: () => import('@/views/UsageView.vue') },
    { path: '/ekkol-usage-analytics', name: 'ekkoUsageAnalytics', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'usageAnalytics' } },
    { path: '/ekko-usage-analytics', redirect: '/ekkol-usage-analytics' },
    { path: '/performance', name: 'performance', component: () => import('@/views/PerformanceView.vue') },
    { path: '/ekkol-files', name: 'ekkoFiles', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'files' } },
    { path: '/ekko-files', redirect: '/ekkol-files' },
    { path: '/ekkol-terminal', name: 'ekkoTerminal', component: () => import('@/views/EkkoFeatureView.vue'), meta: { featureKey: 'terminal' } },
    { path: '/ekko-terminal', redirect: '/ekkol-terminal' },

    // Catch-all
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
})

export default router
