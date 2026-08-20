# KPI Performance Management Studio

> **Enterprise-grade Engineering KPI & Performance Evaluation Platform**  
> Bridging Jira execution artifacts (commits, cycle times, bug ratios, pull requests) into mathematical, explainable, and audit-proof performance evaluations with role-based workflows and calibration mechanics.

---

## 🚀 Live Demo & Overview
- **Live Preview Application**: Runs in Vite SPA mode (`appType: "spa"`).
- **Dual-Theme Engine**: Built-in 1-click switcher between **Architectural Light** and **Obsidian Deep Slate**.
- **No Mock Black-Boxes**: 100% deterministic calculation engine with full Jira artifact attribution and step-by-step mathematical score traces.

---

## 🌟 Key Features

### 1. Multi-Role Hierarchy & Workflows
- **MEMBER (Engineer)**:
  - Deep-dive into personal KPI score breakdown and interactive formula tree.
  - Inspect Jira issue snapshots directly tied to calculated metrics.
  - View individual historical velocity and trajectory trends.
- **LEADER (Engineering Manager / Team Lead)**:
  - Review auto-calculated scores with confidence indicators (`HIGH`, `MEDIUM`, `LOW`, `REVIEW_REQUIRED`).
  - Apply bounded manual adjustments with mandatory audit reason logging.
  - Monitor team-wide data quality anomalies (unestimated stories, missing due dates).
- **HEAD (Department Head / VP of Engineering)**:
  - Calibrate department rank distributions (A+, A, B, C, D) against target Gaussian quotas.
  - Approve significant score deltas and finalize evaluation cycles.
  - Enforce immutable period locks (`LOCKED` status).
- **ADMIN (Platform Administrator / HR Ops)**:
  - Configure reusable KPI Templates & Dynamic Metric Library.
  - Define custom Rank Schemes & Grade thresholds.
  - Inspect tamper-evident append-only Audit Logs.

### 2. Built-in Metric Library
- **On-Time Delivery Rate**: Percentage of delivered issues/story points completed on or before `dueDate`.
- **Bug & Defect Leakage Ratio**: Escaped production defects vs. delivered feature stories.
- **Cycle Time & Lead Time**: Average days from `In Progress` to `Resolved`.
- **Code Review Turnaround**: Average response time for PR reviews and approvals.
- **Documentation & Technical Debt**: Architecture RFCs, tech debt reduction tickets resolved.

### 3. Mathematical Explainability & Provenance
- Click on any criterion score to reveal a full breakdown:
  - Raw metric calculation formula with assigned Jira issues.
  - Threshold step evaluation vs. linear range interpolation.
  - Weight factor application on a standardized 0–10.0 scale.
  - Direct links to inspect immutable Jira ticket snapshots.

---

## 🛠️ Tech Stack & Prerequisites

- **Frontend**: React 18+, TypeScript, Vite
- **Styling**: Tailwind CSS, CSS Cascading Variables
- **Icons**: `lucide-react`
- **Charts**: `recharts`
- **State Management**: Reactive Observer Pattern (`src/services/stateStorage.ts` + `useStore.ts`) with durable `localStorage` persistence and snapshot import/export.

---

## 📦 Quick Start & Development

### 1. Clone & Install
```bash
git clone https://github.com/your-org/kpi-performance-studio.git
cd kpi-performance-studio
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```
Generates production-ready static assets in the `dist/` directory.

### 4. Type Check & Linting
```bash
npm run lint
```

---

## 📖 Comprehensive Documentation Map

For in-depth guides and developer specifications, refer to:
- **[`AGENTS.md`](./AGENTS.md)**: AI Agent handover instructions, domain rules, and extension checklist.
- **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**: System design, calculation engine pipeline, and mathematical formulas.
- **[`API_CONTRACTS.md`](./API_CONTRACTS.md)**: TypeScript domain models, schema definitions, and event interfaces.
- **[`DEVELOPMENT.md`](./DEVELOPMENT.md)**: Local workflow, testing scenarios, state management, and troubleshooting.

---

## 🔒 Security & Audit Guarantees
- All score adjustments record immutable metadata: `actorId`, `actorRole`, `timestamp`, `beforeScore`, `afterScore`, and `reasonText`.
- Periods marked `LOCKED` become strictly read-only to safeguard historical evaluation integrity.
