# EKKO → Chemicon Workshop Extensive Integration Audit

Last audited: 2026-06-21
Live target: `https://fjvnjf.github.io/chemicon-command-center/` via non-Cloudflare bridge `https://tough-panther-41.loca.lt`
Source repo: `/home/ubuntu/chemicondb`
Upstream source: `EKKOLearnAI/hermes-studio` local extraction at `/tmp/ekko-hermes-feature-extract/hermes-studio`, commit `4c4625e`

## Bottom line

The Workshop now exposes the full upstream EKKO/Hermes Studio function inventory required for Phase 1 UI parity:

- 19 EKKO function classes are visible on `#/ekko-functions`.
- Every function card opens a Workshop route/detail page.
- Detail pages show status, upstream routes/views, capability map, next integration actions, and access/control/manage/use guidance.
- Chat has its own `EKKO Chat Function Coverage` matrix covering 19 upstream chat functions.
- The live same-origin API `/api/chemicon-chat` is healthy and reports model `gpt-5.5`.
- The 15-minute watchdog checks build, live assets, routes, API, EKKO labels, chat coverage tokens, and control-surface tokens.

Important honesty note: this is not a fake “all backend features are live” claim. The UI shows all features and marks them as `Partial` or `Staged` where backend parity is not yet implemented. That is the correct safe state until real backend integration is explicitly approved and tested.

## Upstream inventory audited

Machine audit extracted:

- Upstream routes: 29
- Upstream Hermes views: 23
- Upstream chat components: 17
- Upstream server API route declarations sampled: 276

Primary upstream chat components included `ChatPanel.vue` and related chat/session/files/terminal/voice/tool components.

## Workshop inventory required and verified

The minimum 19 class-level EKKO function groups are present:

1. Agent Chat & Sessions
2. Global Agent
3. Platform Channels
4. Usage Analytics
5. Scheduled Jobs
6. Kanban Board
7. Model Management
8. Multi-Profile Management
9. File Browser
10. Group Chat
11. Coding Agents
12. Skills & Memory
13. Logs & Activity
14. Admin & Runtime
15. Auth & Security
16. Settings
17. Voice / TTS / STT
18. Web Terminal
19. Distribution & Updates

## Workshop routes verified in source/live assets

- `/ekko-functions`
- `/ekko-chat-sessions`
- `/ekko-global-agent`
- `/ekko-channels`
- `/ekko-usage-analytics`
- `/ekko-jobs`
- `/kanban`
- `/ekko-models`
- `/ekko-profiles`
- `/ekko-files`
- `/ekko-group-chat`
- `/coding-agents`
- `/ekko-skills-memory`
- `/ekko-logs`
- `/runtime-admin`
- `/auth-security`
- `/ekko-settings`
- `/voice`
- `/ekko-terminal`
- `/distribution`

## Chat-specific function coverage verified

The Chat page exposes these upstream chat functions with honest status labels:

1. Same-origin Hermes chat bridge
2. Dashboard tab routing
3. Markdown answers / rich rendering
4. Session history sidebar
5. Session search modal
6. Session rename/export/delete
7. Continue/resume sessions
8. Model/provider selector
9. Agent/coding-agent mode
10. File attachments and drag/drop upload
11. Files side panel
12. Terminal side panel
13. Conversation outline
14. Tool-call display
15. Thinking/progress monitor
16. Virtualized long message list
17. Voice dialogue controls / transcript overlay
18. Workspace/folder picker
19. Copy/open utilities

## Access, control, manage, use surfaces

The UI now includes explicit user-facing control surfaces:

- Overview page: `Use now`, `Manage`, `Control`, and `Open in Workshop` labels.
- Detail pages: `Workshop status`, `Next integration actions`, `Access, control, manage, use`, and quick links to Workshop/Chat/Settings/Health.
- Staged capabilities are visible but intentionally not presented as clickable live backend actions.

## Verification evidence

Latest source parity audit:

- Checks passed: 73
- Checks failed: 0

Build:

- `npm run build` passed.
- Only Sass deprecation warnings were emitted from pre-existing style usage; no build failure.

Live verification:

- `#/ekko-functions` rendered all 19 function cards.
- `#/ekko-global-agent` rendered the detail page and new control/action section.
- Browser console after live render: 0 messages, 0 JS errors.
- `/api/chemicon-chat` returned:
  - `ok: true`
  - `response: pong`
  - `model: gpt-5.5`

Watchdog:

- `/home/ubuntu/.hermes/scripts/audit-chemicon-ekko-workshop.sh` returned `audit_exit=0`.
- Cron job `20a83a35d2ab` remains enabled every 15 minutes.
- The watchdog is silent on success and alerts this WeChat chat on failure.

## Current limits / not yet fully live backend parity

The following are intentionally marked `Staged` or `Partial` unless/until backend integration is explicitly implemented:

- Full Global Agent cross-session backend
- Full jobs CRUD UI parity
- Full model/provider switching UI
- Full profile lifecycle controls
- Full file operations across local/Docker/SSH/Singularity
- Full group chat room/invite/@mention backend parity
- Coding agent launch/monitoring controls
- Voice STT/TTS controls inside Workshop
- Web terminal multi-session xterm/node-pty parity
- Distribution/update feed management

## Fix loop policy

The current watchdog is part of the fix loop:

1. Every 15 minutes it rebuilds/audits source and checks live deployed assets/API.
2. If any required token/route/API check fails, it reports here.
3. On failure, the next action is to patch the specific missing route/UI/API/watchdog check, rebuild, deploy to `/chemicon/`, rerun audit, browser-check, and commit only intended files.

## Files changed by this audit pass

- `src/router/index.ts` — added `/ekko-global-agent` alias route.
- `src/views/EkkoFunctionsView.vue` — added explicit use/manage/control labels and `Open in Workshop` card action.
- `src/views/EkkoFeatureView.vue` — added Workshop status, next integration actions wording, access/control/manage/use panel, and Workshop quick link.
- `/home/ubuntu/.hermes/scripts/audit-chemicon-ekko-workshop.sh` — strengthened live watchdog checks for `/ekko-global-agent` and control-surface tokens.

Preserved and not committed unless explicitly requested:

- `src/views/CompetitorsView.vue`
- `src/views/MarketAnalysisView.vue`
