# DEVELOPMENT.md - Developer & Contributor Guide

This guide provides practical instructions for engineers and AI agents working on **KPI Studio**.

---

## 1. Development Workflow

### Starting the Environment
```bash
# Install dependencies
npm install

# Run the dev server on port 3000
npm run dev

# Run TypeScript type check
npm run lint

# Build production bundle
npm run build
```

---

## 2. Testing Scenarios & Judge Demos

The platform includes built-in scenario presets located in the **Judge Scenarios Modal** (`src/components/common/JudgeScenariosModal.tsx`):

1. **Scenario 1: High Performer with Edge-Case Late Delivery**:
   - Demonstrates a Senior Engineer delivering 95% on-time with 1 high-priority production bug.
   - Shows step-by-step mathematical breakdown and evidence inspection.
2. **Scenario 2: Team Leader Score Adjustment & Audit Trail**:
   - Demonstrates a Leader applying a manual adjustment of $+0.5$ with mandatory audit reasoning.
   - Demonstrates automatic recording in `AuditLogView.tsx`.
3. **Scenario 3: Department Head Rank Calibration**:
   - Demonstrates forced ranking and quota balancing (A+, A, B, C, D) across 4 engineering teams.
   - Shows real-time warnings when A+ quota exceeds target limit ($> 10\%$).
4. **Scenario 4: Locked Period Immutability**:
   - Demonstrates attempting changes in locked historical periods (July 2026) and confirms strict read-only enforcement.

To reset the database back to clean seed data at any time:
- Click the **Reset Seed Data** button in the header or invoke `stateStorage.resetToDefault()`.

---

## 3. State Management Best Practices

### Reading State
Always consume the reactive hook in React components:
```tsx
import { useStore } from '../../hooks/useStore';

export const MyComponent = () => {
  const state = useStore();
  const isLight = state.theme === 'light';
  // ...
};
```

### Mutating State
Never mutate `stateStorage.state` directly. Use explicit store methods:
```tsx
import { stateStorage } from '../../services/stateStorage';

// Example: Updating evaluation
stateStorage.updateMemberEvaluation(updatedEval);

// Example: Adding an audit log
stateStorage.logAudit({
  actorId: state.currentMemberId,
  actorName: 'John Doe',
  actorRole: state.currentRole,
  action: 'SCORE_ADJUSTED',
  targetType: 'MEMBER_EVALUATION',
  targetId: evaluation.id,
  details: 'Adjusted On-Time score due to external dependency delay',
});
```

---

## 4. UI/UX & Component Guidelines

### Styling & Theming
- Use Tailwind CSS utility classes.
- Always verify contrast in both Light and Dark themes.
- For charts (Recharts), dynamically pass theme-aware stroke and background colors:
```tsx
const isLight = state.theme === 'light';

<CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} />
<Tooltip contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }} />
```

### Component Structure
- Place domain views in `src/components/<domain>/`.
- Define shared types in `src/types/kpi.ts`.
- Ensure all interactive controls have descriptive `id` attributes.

---

## 5. Pre-Commit Checklist
Before submitting a PR or finishing an AI turn:
- [ ] Run `npm run lint` (`tsc --noEmit`) to ensure zero type errors.
- [ ] Run `npm run build` (`vite build`) to verify the production bundle.
- [ ] Verify that Jira ticket keys in lists are deduplicated.
- [ ] Verify that UI components render correctly in both Light and Dark mode.
