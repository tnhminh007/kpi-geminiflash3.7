# AGENTS.md - KPI Performance Management Studio Agent Handover Guide

> **Target Audience**: AI Agents (Antigravity, Gemini, Claude, Cursor, Copilot) & Software Engineers taking over this codebase.

## 1. Executive Summary & Domain Mission
**KPI Studio** is a multi-role, self-service enterprise Performance Management & Evaluation platform for engineering organizations. It bridges Jira execution artifacts (issues, PRs, cycle times, bug ratios) into objective, audit-proof, and configurable KPI evaluations with mathematical explainability, role-based workflows (MEMBER, LEADER, HEAD, ADMIN), and calibration mechanics.

---

## 2. Technology Stack & Runtime Standards
- **Framework**: React 18+ with TypeScript & Vite SPA mode (`appType: "spa"`).
- **Styling**: Tailwind CSS with architectural design system (Dual Theme: Light Architectural & Obsidian Dark Slate).
- **Icons**: `lucide-react` (Strict standard: **DO NOT** use raw SVGs or other icon libraries).
- **Charts / Visuals**: `recharts` for metrics distribution, historical velocity, and rank calibration quotas.
- **State Management & Persistence**: Reactive Observer store pattern (`/src/services/stateStorage.ts` + `/src/hooks/useStore.ts`) with durable `localStorage` sync and snapshot export/import.
- **Engine**: Pure TypeScript Deterministic Calculation Engine (`/src/services/kpiEngine.ts`).

---

## 3. Directory Layout & Architecture Map

```text
/
├── AGENTS.md                  # Handover & Operational instructions for AI agents (This file)
├── ARCHITECTURE.md            # In-depth architectural design, data models, and math formulas
├── API_CONTRACTS.md           # Domain contracts, schema interfaces, and event models
├── metadata.json              # Platform metadata & runtime capabilities
├── vite.config.ts             # Vite configuration
├── src/
│   ├── main.tsx               # Application bootstrap
│   ├── App.tsx                # Main Router / View Switcher
│   ├── index.css              # Global styles, typography & dual-theme tokens
│   ├── types/
│   │   └── kpi.ts             # Comprehensive TypeScript domain types (100% type-safe)
│   ├── services/
│   │   ├── kpiEngine.ts       # Core evaluation math, metric calculators, explainability trace
│   │   ├── metricLibrary.ts   # Catalog of built-in metrics (On-time Delivery, Bug leakage, etc.)
│   │   ├── seedData.ts        # Enterprise mock datasets (Jira issues, Teams, Periods, Evals)
│   │   └── stateStorage.ts    # Central reactive store & persistence engine
│   ├── hooks/
│   │   └── useStore.ts        # React hook subscribing to stateStorage changes
│   └── components/
│       ├── layout/            # App Shell, Header, Sidebar, Navigation, Role/Period Switchers
│       ├── dashboard/         # Executive, Member, and Team dashboards + ScoreFormulaTree
│       ├── evaluation/        # Leader review, Head calibration, Period workflows, System eval
│       ├── builder/           # KPI Template Builder with real-time math validation
│       ├── wizard/            # 4-step Quick Template Setup Wizard
│       ├── governance/        # Version Compare, Policy Simulation, Template Management
│       ├── organization/      # Department, Team, and Member roster management
│       ├── integration/       # Jira field mapping, sync simulation, and issue inspector
│       ├── analytics/         # Historical trends, MoM/QoQ velocity, and member trajectories
│       ├── quality/           # Data quality anomalies, missing story points, unmapped issues
│       ├── admin/             # Metric Library, Rank Scheme configuration, Immutability Audit Logs
│       └── common/            # Modals, ScoreExplanationTrace, TicketSnapshot, Scenarios
```

---

## 4. Key Domain Concepts & Invariants

### A. Role Hierarchy & Access Matrix
- **`MEMBER`**: Views personal KPI breakdown, Jira evidence provenance, score breakdown tree, and historical velocity.
- **`LEADER`**: Manages team evaluations, reviews auto-calculated scores, applies bounded manual adjustments with mandatory audit reasoning, inspects data quality.
- **`HEAD`**: Calibrates department-wide rank distributions (Forced Ranking / Quota enforcement), approves significant score deltas, finalizes/locks evaluation periods.
- **`ADMIN`**: Configures KPI templates, metric library, rank schemes, Jira integration settings, and inspects tamper-evident audit logs.

### B. Evaluation Lifecycle States
```text
UPCOMING ──> COLLECTING ──> SYSTEM_EVALUATED ──> LEADER_REVIEW ──> HEAD_REVIEW ──> FINALIZED ──> LOCKED
```
- **Immutability Invariant**: When a period is in `LOCKED` status, **no evaluations, criteria scores, or weights may be altered**. Any aggregation in `HistoricalAnalyticsView` must respect locked historical snapshots.

### C. The Deterministic KPI Calculation Flow (`kpiEngine.ts`)
1. **Filter Jira Artifacts**: Find issues assigned to member within the active period window (`resolvedDate` vs period start/end).
2. **Metric Computation**: Calculate value for each criterion metric (e.g. `% On-Time Delivery = (onTime / totalDone) * 100`).
3. **Scoring Rule Application**: Evaluate thresholds/formulas against `maxScore` to yield `systemScore` + `ConfidenceLevel`.
4. **Weighted Rollup**: Sum all criteria scores to generate `totalScore` (0–10 scale) and auto-assign grade `rank` (A+, A, B, C, D) using `RankScheme`.
5. **Trace Generation**: Compute step-by-step math explainability breakdown (`ScoreExplanationTrace`) and attach unique deduplicated `evidenceTickets`.

---

## 5. Strict Code Quality & Extension Rules for Agents

1. **Unique Evidence Ticket Rule**:
   - Never push duplicate Jira keys to `evidenceTickets` or `ticketKeys`. Always wrap with `Array.from(new Set(...))`.
   - When rendering ticket lists in React, use `key={`${key}-${index}`}` or guaranteed unique IDs.

2. **Dual-Theme Compatibility**:
   - Never hardcode light-only or dark-only text without supporting Tailwind utility classes or theme CSS classes. Use the design system tokens defined in `src/index.css`.
   - Recharts tooltip and grid colors must consume `state.theme === 'light'` dynamic values.

3. **State Mutation Pattern**:
   - Always trigger updates through `stateStorage.updateMemberEvaluation(...)`, `stateStorage.addTemplate(...)`, or dedicated store methods to ensure reactive dispatching across all active UI components.
   - Do NOT mutate `stateStorage.state` directly without calling `saveState()`.

4. **Preserve Id Attributes**:
   - All interactive controls (buttons, inputs, dropdowns, cards) must maintain descriptive `id` attributes for automated testing and DOM targeting.

---

## 6. How to Implement New Features (Examples)

### Adding a New Built-in Metric:
1. Open `/src/services/metricLibrary.ts`.
2. Add a new `MetricDefinition` entry to `BUILTIN_METRIC_DEFINITIONS`.
3. Open `/src/services/kpiEngine.ts` and add a handler case in `calculateCriterionMetric(...)` to evaluate Jira issues into metric values.
4. Run `npm run lint` and `npm run build` to verify type safety.

### Adding a New Governance or Audit Action:
1. Log an event to `stateStorage.logAudit(...)` with actor, role, target, and before/after metadata.
2. The event will automatically appear in `AuditLogView.tsx`.
