# EKKOLearnAI Hermes Studio → Workshop Feature Extraction

## Vocabulary / Scope

- **EKKOLearnAI / Hermes AI dashboard / Hermes Studio** = separate upstream GitHub product.
  - GitHub sources checked:
    - `https://github.com/EKKOLearnAI/hermes-studio`
    - `https://github.com/EKKOLearnAI/hermes-web-ui`
  - These are the source of truth for Hermes AI dashboard feature extraction.

- **Workshop** = the current Chemicon dashboard we are working on.
  - Repo: `https://github.com/Fjvnjf/chemicon-command-center`
  - Local path: `/home/ubuntu/chemicondb`
  - Current verified size:
    - 22 routes
    - 21 sidebar items
  - Workshop is separate. It is NOT the same entity as EKKOLearnAI/Hermes Studio.

## Extracted EKKOLearnAI / Hermes Studio core capabilities from GitHub README

Source: `EKKOLearnAI/hermes-studio` README, GitHub clone checked locally at `/tmp/ekko-hermes-feature-extract/hermes-studio`.

### 1. Agent Chat

- Real-time chat streaming over Socket.IO `/chat-run`.
- Hermes Agent bridge execution.
- Multi-session management: create, rename, delete, switch sessions.
- Local SQLite Web UI session database.
- Session grouping by source: Telegram, Discord, Slack, etc.
- Active session indicator.
- Sessions sorted by latest message time.
- Markdown rendering with syntax highlighting and code copy.
- Tool call detail expansion: arguments and result.
- Profile-scoped file uploads.
- File download support for uploaded and agent-generated files.
- Session search with Ctrl+K.
- Profile-aware model selector.
- Per-session model badge and context token usage.

### 2. Platform Channels

Unified configuration for 8 platforms:

- Telegram
- Discord
- Slack
- WhatsApp
- Matrix
- Feishu / Lark
- WeChat
- WeCom

Features:

- Credential management writes to `~/.hermes/.env`.
- Channel behavior writes to `~/.hermes/config.yaml`.
- Per-platform configured/unconfigured status detection.

### 3. Usage Analytics

- Total token usage breakdown: input/output.
- Session count and daily average.
- Estimated cost tracking.
- Cache hit rate.
- Model usage distribution chart.
- 30-day daily trend chart and table.

### 4. Scheduled Jobs

- Create cron jobs.
- Edit jobs.
- Pause/resume jobs.
- Delete jobs.
- Trigger immediate execution.
- Cron expression quick presets.

### 5. Kanban

- Profile-aware Kanban board.
- Task creation and updates.
- Status movement from dashboard.
- Shared local Web UI state and authentication model.

### 6. Model Management

- Auto-discover models from credential pool in `~/.hermes/auth.json`.
- Fetch models from provider `/v1/models` endpoints.
- Add/update/delete providers.
- Preset and custom OpenAI-compatible providers.
- OpenAI Codex OAuth and Nous Portal OAuth login.
- Provider URL auto-detection for non-v1 API versions.
- Provider-level grouping.
- Default model switching.

### 7. Multi-Profile

- Create profiles.
- Rename profiles.
- Delete profiles.
- Switch profiles.
- Clone profile.
- Import from `.tar.gz` archive.
- Export profile for backup/sharing.
- Profile-scoped config, cache, uploads, sessions, jobs, usage, memory, skills, plugins, providers, model visibility.
- Account-bound profile access.

### 8. File Browser

- Browse local/Docker/SSH/Singularity backend files.
- Upload files.
- Download files.
- Rename/copy/move/delete files.
- Create directories.
- View file content with syntax highlighting.

### 9. Group Chat

- Multi-agent chat rooms with Socket.IO real-time messaging.
- @mention routing to trigger contextual replies.
- Context compression when history exceeds threshold.
- Typing status and reply progress indicators.
- Room creation/deletion/invite code management.
- Agent management: add/remove agents with per-agent profiles.
- SQLite message persistence.
- Mobile responsive collapsible sidebar.

### 10. Coding Agents

- Launch and monitor local coding-agent sessions from dashboard.
- Dedicated proxy routes for Codex and Claude Code integrations.
- Store agent output and reasoning metadata for inspection.

### 11. Skills & Memory

- Browse/search installed skills.
- View skill details.
- View attached skill files.
- User notes and profile management.

### 12. Logs

- View agent/server/error logs.
- Filter by log level.
- Filter by log file.
- Keyword filtering.
- Structured log parsing.
- HTTP access log highlighting.

### 13. Admin & Runtime Management

- Device and LAN peer views.
- MCP manager for managed `hermes-studio` MCP server and profile injection.
- Runtime version/version-preview tooling.
- Performance monitor views for super administrators.

### 14. Authentication

- Token-based auth.
- Username/password login.
- Account management in Settings.
- Default bootstrap credential prompt/change workflow.
- Super administrators manage users and profile bindings.
- Regular administrators manage own account details.
- CLI maintenance commands:
  - `hermes-web-ui clear-login-locks`
  - `hermes-web-ui clear-login-locks --restart`
  - `hermes-web-ui reset-default-login`

### 15. Settings

- Display settings: streaming, compact mode, reasoning, cost display.
- Agent settings: max turns, timeout, tool enforcement.
- Memory settings: enable/disable, char limits.
- Session reset: idle timeout, scheduled reset.
- Privacy: PII redaction.
- Model settings: default model/provider.
- Profile/provider configuration.

### 16. Voice / TTS / STT

- Read assistant replies aloud from chat/group-chat.
- Providers:
  - browser Web Speech
  - Edge TTS
  - OpenAI-compatible `/audio/speech`
  - custom OpenAI-compatible TTS
  - MiMo
- MiMo preset voices, voice design prompts, voice clone reference audio.
- Unified backend endpoint: `/api/hermes/tts/synthesize`.
- Provider secrets stored server-side with masked status in browser.
- Voice input/STT from chat mic control.
- Barge-in stops playback before new voice turn.

### 17. Web Terminal

- Integrated terminal using node-pty and xterm.
- Multi-session terminal support.
- Real-time keyboard input and PTY output through WebSocket.
- Window resize support.

### 18. Desktop App & Distribution

- Native Electron shell for Windows/macOS/Linux.
- Bundles Web UI runtime and starts local Hermes Studio server.
- Cloudflare update feed first, GitHub Releases fallback.
- npm package: `hermes-web-ui`.
- Docker image support.

## Extracted EKKOLearnAI / Hermes Studio routes from GitHub source

Source: `packages/client/src/router/index.ts` from upstream GitHub clone.

- `/hermes/chat` → `hermes.chat`
- `/hermes/session/:sessionId` → `hermes.session`
- `/hermes/history` → `hermes.history`
- `/hermes/history/session/:sessionId` → `hermes.historySession`
- `/hermes/global-agent` → `hermes.globalAgent`
- `/hermes/global-agent/session/:sessionId` → `hermes.globalAgentSession`
- `/hermes/jobs` → `hermes.jobs`
- `/hermes/kanban` → `hermes.kanban`
- `/hermes/models` → `hermes.models`
- `/hermes/profiles` → `hermes.profiles`
- `/hermes/logs` → `hermes.logs`
- `/hermes/usage` → `hermes.usage`
- `/hermes/performance` → `hermes.performance`
- `/hermes/skills-usage` → `hermes.skillsUsage`
- `/hermes/skills` → `hermes.skills`
- `/hermes/plugins` → `hermes.plugins`
- `/hermes/memory` → `hermes.memory`
- `/hermes/settings` → `hermes.settings`
- `/hermes/channels` → `hermes.channels`
- `/hermes/terminal` → `hermes.terminal`
- `/hermes/devices` → `hermes.devices`
- `/hermes/group-chat` → `hermes.groupChat`
- `/hermes/group-chat/room/:roomId` → `hermes.groupChatRoom`
- `/hermes/files` → `hermes.files`
- `/hermes/coding-agents` → `hermes.codingAgents`
- `/hermes/version-preview` → `hermes.versionPreview`
- `/hermes/mcp` → `hermes.mcp`

## Upstream Hermes Studio view files extracted

- `LoginView.vue`
- `ChannelsView.vue`
- `ChatView.vue`
- `CodingAgentsView.vue`
- `DevicesView.vue`
- `FilesView.vue`
- `GlobalAgentView.vue`
- `GroupChatView.vue`
- `HistoryView.vue`
- `JobsView.vue`
- `KanbanView.vue`
- `LogsView.vue`
- `McpManagerView.vue`
- `MemoryView.vue`
- `ModelsView.vue`
- `PerformanceView.vue`
- `PluginsView.vue`
- `ProfilesView.vue`
- `SettingsView.vue`
- `SkillsUsageView.vue`
- `SkillsView.vue`
- `TerminalView.vue`
- `UsageView.vue`
- `VersionPreviewView.vue`

## Workshop current feature baseline

Workshop currently has these routes:

- `home`
- `chat`
- `chatSession`
- `history`
- `tasks`
- `projects`
- `files`
- `terminal`
- `marketAnalysis`
- `competitors`
- `memory`
- `skills`
- `plugins`
- `groupChat`
- `jobs`
- `channels`
- `settings`
- `models`
- `profiles`
- `logs`
- `usage`
- `performance`

Workshop currently has these sidebar areas:

- Workspace
- Intelligence
- Hermes Agent
- Operations
- System

## Correct next comparison task

Compare **GitHub-extracted EKKOLearnAI/Hermes Studio features** against **Workshop current features**.

Do not use Chemicon business pages from other forks as the EKKOLearnAI source of truth.
Do not assume EKKOLearnAI/Hermes Studio is connected to Workshop.
Do not implement until the feature mapping is approved.
