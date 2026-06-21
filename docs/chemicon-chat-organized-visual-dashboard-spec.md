# Chemicon Chat-Organized Visual Dashboard Specification

Research date: 2026-06-21

## Research basis

Sources reviewed through web search and direct page retrieval:

- Tableau, **Best Practices for Effective Dashboards**: dashboards need clear purpose/audience, main view in upper-left, design for final display size, limit clutter, speed decision-making.
- Tableau Blueprint, **Visual Best Practices**: successful dashboards are easy to use to derive answers; interactive elements should be discoverable/predictable; layout must be logical and simplified; include context such as titles, captions, units, and commentary.
- Google Material Design 3 Cards search result/guideline summary: cards display content and actions about a single subject; cards can include headline, subhead, supporting text, and actions.
- NN/g chatbot/UI search results: conversational UIs must introduce capabilities clearly, reduce ambiguity, and avoid users having to guess what the system can do.
- Current dashboard UI trend search results across AI dashboards/conversational analytics: AI dashboards are moving toward natural-language prompts, generated insight cards, embedded recommendations, cross-platform responsive layouts, and action-oriented executive summaries.
- Design system reference skill: Linear/Vercel/Sentry/Cohere/Stripe-style dashboards favor dense but calm layouts, high-contrast hierarchy, restrained accent colors, crisp cards, and clear status tokens.

## Core product decision

Chemicon Command Center should not behave like a normal chat app. It should behave like a **chat-driven business command center**:

1. User asks in chat.
2. System classifies the command into the right business domain.
3. Chat returns concise answer.
4. Dashboard creates visual cards in the correct tab.
5. Cards are grouped by the chat command/thread so the user can review the whole scenario visually.
6. If the question does not fit an existing tab, a new tab/section should be created when useful.

## UI structure

### 1. Global layout

- Left sidebar: stable tabs by business domain.
- Top header: current tab, command context, quick metrics.
- Main workspace: card grid + detail panels.
- Right drawer / expandable panel: selected chat thread, sources, assumptions, actions.
- Bottom or inline chat composer: command input with route chips.

### 2. Chat organization model

Every command creates a **Command Thread**:

- Command title
- Original user question
- AI answer summary
- Routed tabs
- Created cards
- Evidence status: Verified / User Provided / Assumption / To Verify
- Confidence: 🔴 Low / 🟠 Medium-Low / 🟡 Medium / 🟢 Higher
- Next action
- Last updated timestamp

Each tab should show cards grouped by command thread, not just random independent cards.

### 3. Recommended tabs

Existing / required:

- AI Chat
- Market Analysis
- Competitors
- Business Cards fallback
- Supplier / Procurement Intelligence
- Financial / Investment Model
- Product Portfolio
- Factory / Operations
- Regulatory / EHS
- Customer Validation
- Research Library / Sources
- Action Board / Next Steps

Add a new tab only when the command repeatedly produces a category that does not fit these.

## Visual card types

### A. Executive summary card

Use for every command.

Fields:
- One-line conclusion
- Why it matters
- Confidence/risk color
- Evidence label
- Next action

### B. KPI strip

Use for quantitative answers.

Examples:
- Market size
- Demand growth
- Gross margin
- CAPEX
- Payback
- Price range
- Supplier count

### C. Scenario card

Use for feasibility/investment.

Layout:
- Base case
- Upside case
- Downside case
- Trigger conditions
- Go / No-go recommendation

### D. Competitor matrix

Use for competitor questions.

Columns:
- Company
- Product strength
- Geography
- Pricing posture
- Distribution strength
- Weakness
- Chemicon attack angle

### E. Supplier scorecard

Use for procurement.

Columns:
- Supplier
- Location
- Product
- Indicative price
- MOQ
- Certifications
- Risk
- Next action

### F. Market map

Use for market analysis.

Cards/visuals:
- Segment size
- Customer clusters
- geography heatmap placeholder
- channel map
- price band chart
- growth/risk quadrant

### G. Risk register card

Use for regulatory, plant, EHS, investment.

Fields:
- Risk
- Severity
- Probability
- Evidence status
- Mitigation
- Owner/next action

### H. Decision card

Use when user asks “should we do this?”

Fields:
- Recommendation: Proceed / Wait / Reject / Verify first
- Minimum proof needed
- Biggest blocker
- Fastest next step

## Visual style direction

Recommended style: **dark executive industrial dashboard**.

- Background: deep navy / near-black.
- Primary cards: slightly lighter navy glass panels.
- Accent: Chemicon gold for executive value, cyan for live intelligence, red/orange for risk.
- Typography: Inter/Geist style, clean and serious.
- Spacing: dense but not cluttered.
- Use one primary accent per card; avoid rainbow dashboard mess.
- Use traffic-light confidence colors consistently.
- Charts should be simple: bars, line trends, quadrants, tables, scorecards. Avoid decorative charts unless they improve decision-making.

## Command routing rules

- `@market` or market/demand/price/customer keywords → Market Analysis.
- `@competitors` or competitor/compare/benchmark/vs keywords → Competitors.
- `@business` or investment/strategy/finance/general business → Business Cards.
- procurement/supplier/raw material/RFQ → Supplier / Procurement tab.
- CAPEX/OPEX/ROI/payback → Financial / Investment Model tab.
- plant/factory/process/equipment → Factory / Operations tab.
- SDS/DMS/permit/EHS/regulatory → Regulatory / EHS tab.
- customer/trial/validation/distributor → Customer Validation tab.
- source/research/paper/link → Research Library.
- next action/task/follow-up → Action Board.

If multiple domains appear, create multiple linked cards under the same command thread.

## Implementation recommendation

### Phase 1 — already partly implemented

- Chat routes to Market Analysis, Competitors, Business Cards.
- Cards persisted in localStorage.
- Sidebar has Business Cards fallback tab.

### Phase 2 — next build

- Replace plain card list with command-thread grouped cards.
- Add richer card schemas: KPI, scenario, risk, matrix, source, action.
- Add visual card renderer component reused by all tabs.
- Add tabs for Procurement, Financial Model, Factory/Ops, Regulatory/EHS, Customer Validation, Research Library, Action Board.
- Add evidence/confidence badges everywhere.

### Phase 3 — production quality

- Persist cards server-side / SQLite or bridge backend.
- Add source citations table.
- Add export to XLSX/PDF.
- Add card edit/approve workflow.
- Add browser-safe cache-busted deployment verification.

## Non-negotiable UX principles

- Do not dump long paragraphs into cards.
- Every card must answer: **So what? What next? How confident are we?**
- Use visuals first, prose second.
- Separate Verified / User Provided / Assumption / To Verify.
- Keep the chat answer concise, but make the dashboard card rich.
- One command = one organized visual scenario, not scattered notes.
