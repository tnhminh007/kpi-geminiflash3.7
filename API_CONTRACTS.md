# API_CONTRACTS.md - Domain Contracts & Data Model Schemas

This document defines the core domain types, schemas, event models, and state contracts used across **KPI Studio**.

---

## 1. Domain Entities (`src/types/kpi.ts`)

### 1.1 User & Organization Model

```typescript
export type UserRole = 'MEMBER' | 'LEADER' | 'HEAD' | 'ADMIN';

export interface Member {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  title: string;
  level: string; // e.g. "Senior Software Engineer"
  currentTeamId: string;
  jiraAccountId: string;
  jiraUsername: string;
  status: 'ACTIVE' | 'LEAVE' | 'PROBATION';
  joinedDate: string;
}

export interface Team {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  leaderId: string;
  leaderName: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  activeTemplateId?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headId: string;
  headName: string;
  description: string;
}
```

---

## 2. KPI Template & Metric Schema

```typescript
export interface ScoringThresholdItem {
  id: string;
  operator: '>=' | '>' | '<=' | '<' | '==' | 'BETWEEN';
  value: number;
  value2?: number; // for BETWEEN
  score: number;
  label?: string;
}

export interface ScoringRuleConfig {
  type: 'THRESHOLD' | 'RANGE' | 'FORMULA' | 'HYBRID';
  thresholds: ScoringThresholdItem[];
  formulaExpression?: string;
  fallbackScore: number;
  description?: string;
}

export interface Criterion {
  id: string;
  name: string;
  code: string;
  description: string;
  maxScore: number; // Sum of criteria in template = 10.0
  evaluationMethod: 'AUTO' | 'ASSISTED' | 'MANUAL';
  evidenceSource: 'JIRA' | 'MANUAL_EVIDENCE' | 'CUSTOM_SOURCE' | 'CONFLUENCE_DOCS';
  metricConfig?: MetricConfiguration;
  scoringRule: ScoringRuleConfig;
  reviewRequired: boolean;
  requiredEvidenceTypes?: string[];
  adjustmentPolicy?: {
    maxDeltaAllowedWithoutReason?: number;
    requiresHeadApprovalIfDeltaExceeds?: number;
  };
}

export interface KpiTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  departmentId: string;
  teamId?: string;
  version: string; // "v1.0", "v2.0"
  versionNumber: number;
  status: 'DRAFT' | 'PUBLISHED' | 'IN_USE' | 'RETIRED';
  criteria: Criterion[];
  totalScore: number; // Always 10.0
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Evaluation & Provenance Schema

```typescript
export interface CriterionEvaluation {
  criterionId: string;
  criterionName: string;
  criterionCode: string;
  maxScore: number;
  metricValue: number;
  metricFormatted: string;
  systemScore: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'REVIEW_REQUIRED';
  confidenceReasons: string[];
  trace: ScoreExplanationTrace;
  
  // Leadership Adjustments
  isLeaderAdjusted: boolean;
  leaderScore?: number;
  leaderAdjustmentReason?: string;
  isHeadAdjusted: boolean;
  headScore?: number;
  headAdjustmentReason?: string;
  
  // Jira Evidence Provenance
  evidenceTickets: string[]; // Deduplicated array of Jira issue keys e.g. ["BED-1021", "BED-1033"]
  factSnapshots?: Record<string, any>;
  manualEvidenceNotes?: string;
}

export interface MemberEvaluation {
  id: string;
  memberId: string;
  memberName: string;
  memberTitle: string;
  teamId: string;
  teamName: string;
  periodId: string; // e.g. "2026-08"
  templateId: string;
  templateVersion: string;
  
  // Aggregate Scores
  systemTotalScore: number;
  leaderTotalScore?: number;
  headTotalScore?: number;
  finalScore: number;
  rank: 'A+' | 'A' | 'B' | 'C' | 'D';
  
  status: 'SYSTEM_CALCULATED' | 'LEADER_REVIEWED' | 'HEAD_CALIBRATED' | 'LOCKED';
  criteriaEvaluations: CriterionEvaluation[];
  overallLeaderNotes?: string;
  overallHeadNotes?: string;
  updatedAt: string;
}
```

---

## 4. Jira Integration Artifact Schema

```typescript
export interface JiraIssue {
  key: string;               // e.g. "BED-1049"
  summary: string;           // "Refactor User Authentication Flow"
  assigneeId: string;
  assigneeName: string;
  status: 'Done' | 'In Progress' | 'Open' | 'Closed' | 'Cancelled' | 'Reopened';
  issueType: 'Story' | 'Bug' | 'Task' | 'Incident' | 'Epic';
  priority: 'Highest' | 'High' | 'Medium' | 'Low';
  storyPoints?: number;
  createdDate: string;       // ISO 8601
  dueDate?: string;          // ISO 8601
  resolvedDate?: string;     // ISO 8601
  cycleTimeDays?: number;
  pullRequestCount?: number;
  codeReviewTurnaroundHours?: number;
  defectFoundInStage?: 'QA' | 'STAGING' | 'PRODUCTION';
  rootCauseCategory?: 'LOGIC_ERROR' | 'MISSING_REQUIREMENT' | 'INTEGRATION';
}
```

---

## 5. Audit Event Schema

```typescript
export interface AuditEvent {
  id: string;
  timestamp: string; // ISO 8601
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 
    | 'SCORE_ADJUSTED'
    | 'TEMPLATE_PUBLISHED'
    | 'TEMPLATE_CLONED'
    | 'PERIOD_LOCKED'
    | 'PERIOD_EVALUATED'
    | 'CALIBRATION_APPLIED'
    | 'DATA_SYNC_JIRA'
    | 'RULE_OVERRIDE';
  targetType: 'MEMBER_EVALUATION' | 'TEMPLATE' | 'PERIOD' | 'INTEGRATION';
  targetId: string;
  details: string;
  beforeSnapshot?: any;
  afterSnapshot?: any;
}
```
