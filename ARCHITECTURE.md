# ARCHITECTURE.md - System Architecture & Technical Specifications

This document outlines the architectural patterns, calculation mechanics, data pipelines, and UI layer structures of **KPI Performance Management Studio**.

---

## 1. High-Level Architecture Overview

```
                      ┌────────────────────────────────────────────────┐
                      │             React 18 SPA (Vite)                │
                      │   - App Shell & Navigation Router (App.tsx)    │
                      │   - Dual Theme Engine (Light / Dark Obsidian)  │
                      └───────────────────────┬────────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
          ┌─────────▼───────────┐                             ┌─────────▼───────────┐
          │  UI Presentation    │                             │  State Management   │
          │  - Dashboards       │                             │  - stateStorage.ts  │
          │  - Evaluation Views │ <────────────────────────── │  - useStore Hook    │
          │  - Governance & Org │       (Observer Pattern)    │  - LocalStorage DB  │
          └─────────┬───────────┘                             └─────────┬───────────┘
                    │                                                   │
                    │                                                   │
                    └─────────────────────────┬─────────────────────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │   kpiEngine.ts      │
                                   │ - Jira Evaluator    │
                                   │ - Metric Calculator │
                                   │ - Explainability    │
                                   │ - Rank Classifier   │
                                   └─────────────────────┘
```

---

## 2. Calculation Engine Specification (`src/services/kpiEngine.ts`)

### 2.1 The 5-Phase Evaluation Pipeline

```text
[ Jira Artifacts ] ──> [ 1. Date & Attribution Filter ]
                              │
                              ▼
                      [ 2. Metric Computation ]
                              │
                              ▼
                      [ 3. Scoring Rules / Thresholds ]
                              │
                              ▼
                      [ 4. Weight Aggregation & Confidence ]
                              │
                              ▼
                      [ 5. Grade & Rank Assignment ]
```

### 2.2 Core Math Formulas

#### A. On-Time Delivery Rate (`DELIVERY_ON_TIME_RATE`)
$$\text{Delivery Rate (\%)} = \left( \frac{N_{\text{done\_on\_time}}}{N_{\text{total\_done}}} \right) \times 100$$
- Where $N_{\text{done\_on\_time}}$ is the number of issues with `resolvedDate <= dueDate`.
- If story-point weighted: $\text{Rate} = \left( \frac{\sum SP_{\text{on\_time}}}{\sum SP_{\text{total\_done}}} \right) \times 100$.

#### B. Defect / Bug Leakage Ratio (`QUALITY_BUG_LEAKAGE`)
$$\text{Bug Leakage (\%)} = \left( \frac{N_{\text{bugs}}}{N_{\text{total\_delivered\_features}}} \right) \times 100$$

#### C. Score Normalization & Threshold Interpolation
For a given criterion with $M_{\text{max}}$ score and metric value $V$:
- **Step Threshold Rule**: Evaluates the highest matched condition (e.g. $V \ge 90\% \implies S = 4.0$; $V \ge 80\% \implies S = 3.2$).
- **Linear Formula Rule**:
$$S = \min\left(M_{\text{max}}, \max\left(0, \frac{V - V_{\min}}{V_{\max} - V_{\min}} \times M_{\text{max}}\right)\right)$$

#### D. Total Member Score
$$\text{Total Score} = \sum_{i=1}^{k} S_i \quad \text{where } \sum_{i=1}^{k} M_{\max, i} = 10.0$$

---

## 3. Data Flow & State Synchronization Pattern

### Centralized Reactive Store (`stateStorage.ts`)
The application uses a singleton **Observer Observable** pattern:

```typescript
class StateStorageService {
  private state: AppState;
  private listeners: Array<() => void> = [];

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }
}
```

- Every mutation (e.g. `saveEvaluation`, `updateMember`, `toggleTheme`, `importStateSnapshot`) persists state directly to `localStorage['kpi_studio_state_v1']` and calls `notify()`.
- React components listen seamlessly via the lightweight `useStore()` hook without requiring heavyweight external dependencies like Redux or Zustand.

---

## 4. Dual Theme Token Architecture (`src/index.css`)

The design system implements a **CSS Class Cascading Light/Dark architecture**:

| Token Domain | Obsidian Dark (`html.dark`) | Light Architectural (`html.light`) |
| :--- | :--- | :--- |
| **Canvas Background** | `#020617` (Deep Obsidian Slate) | `#f8fafc` (Architectural Off-white) |
| **Bento Surface** | `#0f172a` (`bg-slate-900`) | `#ffffff` + `shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]` |
| **Sub-panel Surface** | `#1e293b` (`bg-slate-800`) | `#f1f5f9` (`bg-slate-100`) |
| **Border / Stroke** | `#334155` (`border-slate-800`) | `#e2e8f0` (`border-slate-200`) |
| **Primary Typography**| `#ffffff` / `#f8fafc` | `#0f172a` (High Contrast Black-Slate) |
| **Secondary Mono** | `#94a3b8` (Slate 400) | `#64748b` (Slate 500) |
| **Accent Primary** | `#6366f1` (Indigo 500) | `#4f46e5` (Indigo 600) |

---

## 5. Security, Audit Immutability & Calibration Guarantees

1. **Audit Logs Immutability**: Every score adjustment by a Leader or Head of Department records:
   - `actorId`, `actorRole`, `timestamp` (ISO 8601), `previousScore`, `newScore`, `reasonText`.
   - Audit logs are append-only.
2. **Leader Adjustment Thresholds**: Leaders cannot adjust scores beyond `maxDeltaAllowedWithoutReason` (default $\pm 1.0$) without triggering `REVIEW_REQUIRED` flagging for Department Head approval.
3. **Head Calibration & Quota Tracking**: Visualizes Gaussian distributions across ranks (A+, A, B, C, D) against target department quotas (e.g., A+ $\le 10\%$, A $\le 25\%$, B $\approx 50\%$, C/D $\ge 15\%$).
