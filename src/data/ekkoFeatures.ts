export type FeatureStatus = 'Live' | 'Partial' | 'Staged'

export interface EkkoCapability {
  title: string
  detail: string
}

export interface EkkoFeature {
  key: string
  title: string
  icon: string
  status: FeatureStatus
  source: string
  workshopStatus: string
  endpoint?: string
  actions: string[]
  capabilities: EkkoCapability[]
}

export const ekkoFeatures: Record<string, EkkoFeature> = {
  globalAgent: {
    key: 'globalAgent',
    title: 'Global Agent',
    icon: '🌐',
    status: 'Staged',
    source: 'EKKOLearnAI Hermes Studio route: /hermes/global-agent',
    workshopStatus: 'Workshop has standard chat. Global cross-session agent workspace is staged here for integration.',
    endpoint: '/api/chemicon-chat',
    actions: ['Route global instructions to Hermes chat bridge', 'Add persistent global-agent session index', 'Expose source/channel grouping'],
    capabilities: [
      { title: 'Cross-session workspace', detail: 'A single agent workspace for global commands and long-running work.' },
      { title: 'Session continuation', detail: 'Upstream supports /hermes/global-agent/session/:sessionId style continuation.' },
      { title: 'Workshop adaptation', detail: 'Use this page for commands that affect all Workshop intelligence areas.' },
    ],
  },
  kanban: {
    key: 'kanban',
    title: 'Kanban Board',
    icon: '📌',
    status: 'Staged',
    source: 'EKKOLearnAI Hermes Studio route: /hermes/kanban',
    workshopStatus: 'Workshop has Tasks. Kanban board parity is staged as a dedicated route.',
    actions: ['Map existing Tasks to board lanes', 'Persist lane movement locally or via Hermes state', 'Allow Hermes-created tasks from chat'],
    capabilities: [
      { title: 'Profile-aware board', detail: 'Plan and track agent work by lane/status.' },
      { title: 'Task movement', detail: 'Create, update and move tasks from the dashboard.' },
      { title: 'Agent planning', detail: 'Use for Codex/Hermes workstreams and Workshop implementation backlog.' },
    ],
  },
  codingAgents: {
    key: 'codingAgents',
    title: 'Coding Agents',
    icon: '🧑‍💻',
    status: 'Staged',
    source: 'EKKOLearnAI Hermes Studio route: /hermes/coding-agents',
    workshopStatus: 'Codex/Claude Code launch and monitoring is not yet wired into Workshop UI.',
    actions: ['Show active Codex/Claude sessions', 'Store agent output metadata', 'Add safe run controls'],
    capabilities: [
      { title: 'Launch coding sessions', detail: 'Start Codex or Claude Code agent tasks from the dashboard.' },
      { title: 'Monitor output', detail: 'Display live logs, reasoning metadata and final artifacts.' },
      { title: 'Workshop safety', detail: 'Require explicit scope, repo path and verification gates before executing.' },
    ],
  },
  devices: {
    key: 'devices',
    title: 'Devices',
    icon: '📱',
    status: 'Staged',
    source: 'EKKOLearnAI Hermes Studio route: /hermes/devices',
    workshopStatus: 'Device/LAN discovery is staged; Workshop currently verifies the same-origin tunnel and API health.',
    actions: ['Add LAN peer discovery display', 'Show tunnel/server endpoint health', 'Expose WeChat/browser compatibility checks'],
    capabilities: [
      { title: 'Local device visibility', detail: 'Show devices and LAN peers available to Hermes Studio.' },
      { title: 'Runtime endpoint awareness', detail: 'Track local, tunnel and platform connectivity.' },
    ],
  },
  mcp: {
    key: 'mcp',
    title: 'MCP Manager',
    icon: '🔌',
    status: 'Staged',
    source: 'EKKOLearnAI Hermes Studio route: /hermes/mcp',
    workshopStatus: 'Workshop has Plugins/MCP Tools basic page. Dedicated MCP manager parity is staged.',
    actions: ['List configured MCP servers', 'Show server status', 'Surface profile injection status'],
    capabilities: [
      { title: 'Managed MCP server', detail: 'Configure and inspect the hermes-studio MCP bridge.' },
      { title: 'Tool discovery', detail: 'Show available tools and profile-specific injection.' },
    ],
  },
  skillsUsage: {
    key: 'skillsUsage',
    title: 'Skills Usage',
    icon: '📈',
    status: 'Staged',
    source: 'EKKOLearnAI Hermes Studio route: /hermes/skills-usage',
    workshopStatus: 'Workshop has Skills. Usage analytics for skills is staged separately.',
    actions: ['Count skill usage by session', 'Show most-used skills', 'Identify missing/outdated skills'],
    capabilities: [
      { title: 'Skill analytics', detail: 'Track which procedural skills are used and when.' },
      { title: 'Quality feedback', detail: 'Find stale skills and maintenance candidates.' },
    ],
  },
  versionPreview: {
    key: 'versionPreview',
    title: 'Version Preview',
    icon: '🧪',
    status: 'Staged',
    source: 'EKKOLearnAI Hermes Studio route: /hermes/version-preview',
    workshopStatus: 'Workshop build/deploy verification exists manually; version preview UI is staged.',
    actions: ['Display current Workshop asset hash', 'Compare deployed vs source build', 'Preview candidate builds safely'],
    capabilities: [
      { title: 'Runtime versioning', detail: 'Test newer builds in isolation before promoting.' },
      { title: 'Cache defense', detail: 'Expose live asset hashes to avoid stale browser/CDN mistakes.' },
    ],
  },
  voice: {
    key: 'voice',
    title: 'Voice / TTS / STT',
    icon: '🎙',
    status: 'Staged',
    source: 'EKKOLearnAI Hermes Studio README Voice / TTS / STT section',
    workshopStatus: 'Voice playback/input is not yet wired in Workshop.',
    actions: ['Add voice settings panel', 'Connect TTS synth endpoint when available', 'Add chat microphone turn workflow'],
    capabilities: [
      { title: 'Assistant read-aloud', detail: 'Read chat and group-chat replies aloud.' },
      { title: 'Voice input', detail: 'Transcribe spoken turns into the chat input.' },
      { title: 'Provider support', detail: 'Browser speech, Edge TTS, OpenAI-compatible TTS, custom endpoints and MiMo in upstream.' },
    ],
  },
  authSecurity: {
    key: 'authSecurity',
    title: 'Auth & Security',
    icon: '🔐',
    status: 'Staged',
    source: 'EKKOLearnAI Hermes Studio README Authentication section',
    workshopStatus: 'Workshop is a same-origin operational dashboard. Full user/profile binding parity is staged.',
    actions: ['Add access-role model if Workshop gets multiple users', 'Show security state', 'Avoid exposing secrets in browser'],
    capabilities: [
      { title: 'Token and username/password auth', detail: 'Upstream supports token auth and account management.' },
      { title: 'Profile bindings', detail: 'Super admins manage users and profile access.' },
    ],
  },
  voiceSettings: {
    key: 'voiceSettings',
    title: 'Voice Settings',
    icon: '🔊',
    status: 'Staged',
    source: 'EKKOLearnAI Hermes Studio Settings + Voice sections',
    workshopStatus: 'Dedicated voice provider settings are staged.',
    actions: ['Mask provider secrets', 'Store provider configuration server-side', 'Expose browser-safe status only'],
    capabilities: [
      { title: 'Provider settings', detail: 'Configure TTS/STT providers without leaking secrets.' },
      { title: 'Playback controls', detail: 'Shared stop/pause state for in-flight audio.' },
    ],
  },
}

export const ekkoFeatureList = Object.values(ekkoFeatures)
