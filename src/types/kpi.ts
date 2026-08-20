// KPI Performance Management Studio - Domain Types

export type UserRole = 'MEMBER' | 'LEADER' | 'HEAD' | 'ADMIN';

export type EvaluationMethod = 'AUTO' | 'ASSISTED' | 'MANUAL';

export type EvidenceSourceType = 'JIRA' | 'MANUAL_EVIDENCE' | 'CUSTOM_SOURCE' | 'CONFLUENCE_DOCS';

export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'IN_USE' | 'RETIRED';

export type PeriodStatus = 
  | 'UPCOMING'
  | 'COLLECTING'
  | 'SYSTEM_EVALUATED'
  | 'LEADER_REVIEW'
  | 'HEAD_REVIEW'
  | 'FINALIZED'
  | 'LOCKED';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'REVIEW_REQUIRED';

export type ScoringRuleType = 'THRESHOLD' | 'RANGE' | 'FORMULA' | 'HYBRID';

export interface ScoringThresholdItem {
  id: string;
  operator: '>=' | '>' | '<=' | '<' | '==' | 'BETWEEN';
  value: number;
  value2?: number; // for BETWEEN
  score: number;
  label?: string;
}

export interface ScoringRuleConfig {
  type: ScoringRuleType;
  thresholds: ScoringThresholdItem[];
  formulaExpression?: string; // e.g. "min(maxScore, (metricValue / 100) * maxScore)"
  fallbackScore: number;
  description?: string;
}

export interface MetricDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'DELIVERY' | 'QUALITY' | 'INCIDENT' | 'PRODUCTIVITY' | 'INNOVATION' | 'CUSTOM';
  unit: '%' | 'SP' | 'COUNT' | 'HOURS' | 'DAYS' | 'SCORE';
  formulaSummary: string;
  requiredFields: string[];
  supportedIssueTypes: string[];
  dataQualityRequirements: string;
  usageCount: number;
}

export interface MetricConfiguration {
  metricId: string;
  metricKey: string;
  metricName: string;
  includedIssueTypes: string[];
  completionStatuses: string[];
  deadlineField: string;
  periodAttribution: 'RESOLVED_DATE' | 'CREATED_DATE' | 'SPRINT_END' | 'STRICT_PERIOD';
  storyPointWeighted: boolean;
  excludeCancelled: boolean;
  customParameters?: Record<string, any>;
}

export interface Criterion {
  id: string;
  name: string;
  code: string;
  description: string;
  maxScore: number; // e.g., 4.0, 3.0, etc. (Sum of criteria usually = 10.0)
  evaluationMethod: EvaluationMethod;
  evidenceSource: EvidenceSourceType;
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
  teamId?: string; // If team-specific, otherwise general
  version: string; // e.g. "v1.0", "v2.0"
  versionNumber: number;
  status: TemplateStatus;
  criteria: Criterion[];
  totalScore: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  changeLog?: string;
  effectiveFromPeriod?: string; // e.g. "2026-07"
  effectiveToPeriod?: string;
  clonedFromId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headId: string;
  headName: string;
  description: string;
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

export interface TeamMembership {
  id: string;
  memberId: string;
  teamId: string;
  teamName: string;
  period: string; // e.g. "2026-08", "2026-09"
  isPrimary: boolean;
  roleInTeam: 'LEADER' | 'MEMBER';
}

export interface Member {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  title: string;
  level: string; // e.g. "Senior Engineer", "Staff Engineer", "Middle"
  currentTeamId: string;
  jiraAccountId: string;
  jiraUsername: string;
  status: 'ACTIVE' | 'LEAVE' | 'PROBATION';
  joinedDate: string;
}

export interface JiraIssue {
  key: string;
  summary: string;
  assigneeId: string;
  assigneeName: string;
  status: 'Done' | 'In Progress' | 'Open' | 'Closed' | 'Cancelled' | 'Reopened';
  storyPoints: number | null; // Missing SP = null
  sprint: string;
  issueType: 'Story' | 'Task' | 'Bug' | 'Incident' | 'Improvement' | 'Support';
  priority: 'Highest' | 'High' | 'Medium' | 'Low';
  createdDate: string; // YYYY-MM-DD
  deadlineDate: string | null; // Missing deadline = null
  resolvedDate: string | null;
  isBug: boolean;
  isIncident: boolean;
  isSupport: boolean;
  reopenCount: number;
  isCarryOver: boolean;
  carryOverFromSprint?: string;
  periodAttribution: string; // e.g. "2026-08"
  attributionReason: string;
  currentJiraStoryPoints?: number; // for showing snapshot difference demo
  hasDataChangedSinceLock?: boolean;
}

export interface JiraFactSnapshot {
  issueKey: string;
  summary: string;
  storyPointsSnapshot: number | null;
  statusSnapshot: string;
  resolvedDateSnapshot: string | null;
  deadlineSnapshot: string | null;
  reopenCountSnapshot: number;
  isCarryOverSnapshot: boolean;
  snapshotTimestamp: string;
}

export interface ScoreExplanationTrace {
  inputSummary: Record<string, any>; // e.g. { committedSP: 50, completedSP: 46, onTimeSP: 44, lateCount: 2 }
  metricValue: number;
  metricFormatted: string; // e.g. "88%"
  ruleAppliedDescription: string; // e.g. "85% <= On-Time < 90% -> 2.5 pts"
  suggestedScore: number;
  maxScore: number;
  confidence: ConfidenceLevel;
  confidenceReasons: string[];
  evidenceCount: number;
  evidenceSummary: string;
  ticketKeys: string[];
}

export interface CriterionEvaluation {
  criterionId: string;
  criterionName: string;
  criterionCode: string;
  maxScore: number;
  evaluationMethod: EvaluationMethod;
  
  // Metric Calculation
  metricKey?: string;
  metricValue?: number;
  metricFormatted?: string;
  
  // Scores
  systemScore: number | null;
  leaderScore: number | null;
  headScore: number | null;
  finalScore: number | null; // null if NOT_EVALUATED
  
  // Explanation & Confidence
  trace: ScoreExplanationTrace;
  confidence: ConfidenceLevel;
  
  // Adjustments & Comments
  leaderAdjustmentReason?: string;
  headAdjustmentReason?: string;
  isLeaderAdjusted: boolean;
  isHeadAdjusted: boolean;
  
  // Evidence Snapshot
  evidenceTickets: string[]; // Jira issue keys
  factSnapshots?: JiraFactSnapshot[];
  manualEvidenceNotes?: string;
}

export interface MemberEvaluation {
  id: string;
  periodId: string;
  periodName: string; // "2026-09"
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  memberTitle: string;
  teamId: string;
  teamName: string;
  kpiTemplateId: string;
  kpiVersion: string;
  
  status: 'PENDING_SYSTEM' | 'SYSTEM_EVALUATED' | 'LEADER_REVIEWED' | 'HEAD_CALIBRATED' | 'FINALIZED' | 'LOCKED' | 'NOT_EVALUATED';
  
  // Aggregated Scores
  systemKpi: number | null;
  leaderKpi: number | null;
  headKpi: number | null;
  finalKpi: number | null;
  
  // Rank & Coefficient (resolved from finalKpi)
  rank: string | null; // A+, A, B+, B, C, D, E
  coefficient: number | null; // 1.4, 1.3, 1.2, etc.
  
  confidence: ConfidenceLevel;
  dataQualityFlags: string[];
  
  criteriaEvaluations: CriterionEvaluation[];
  
  // Reviewer notes
  leaderComment?: string;
  leaderReviewedAt?: string;
  leaderReviewedBy?: string;
  
  headComment?: string;
  headCalibratedAt?: string;
  headCalibratedBy?: string;
  
  finalizedAt?: string;
  lockedAt?: string;
  
  // Workload summary
  workloadSummary: {
    totalTickets: number;
    committedSP: number;
    completedSP: number;
    onTimeSP: number;
    bugCount: number;
    incidentCount: number;
    carryOverCount: number;
  };
  
  // Smart Attention Flags
  attentionFlags?: {
    isKpiDropped: boolean;
    dropAmount?: number;
    largeLeaderDelta: boolean;
    largeHeadDelta: boolean;
    missingSPCount: number;
    missingDeadlineCount: number;
    highCarryOver: boolean;
    highReopenRate: boolean;
    underlyingDataChanged: boolean;
  };
}

export interface EvaluationPeriod {
  id: string;
  code: string; // "2026-09"
  name: string; // "September 2026"
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  totalMembers: number;
  systemEvaluatedCount: number;
  leaderReviewedCount: number;
  headCalibratedCount: number;
  finalizedCount: number;
  lowConfidenceCount: number;
  dataQualityScore: number; // e.g. 94%
}

export interface RankTier {
  id: string;
  rank: string; // "A+", "A", "B+", "B", "C", "D", "E"
  minScore: number;
  maxScore: number; // e.g. 10.0
  coefficient: number; // e.g. 1.4
  description: string;
  color: string;
}

export interface RankScheme {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  tiers: RankTier[];
  description: string;
}

export interface DataQualityIssue {
  id: string;
  memberId: string;
  memberName: string;
  teamName: string;
  issueKey?: string;
  issueType: 'MISSING_SP' | 'MISSING_DEADLINE' | 'UNMAPPED_JIRA' | 'MISSING_EVIDENCE' | 'DATA_MUTATED_AFTER_LOCK' | 'INCOMPLETE_HISTORY';
  description: string;
  affectedMetric: string;
  affectedCriterion: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  suggestedAction: string;
  resolved: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string; // e.g. "LEADER_ADJUSTED_SCORE", "PERIOD_LOCKED", "KPI_PUBLISHED"
  entityType: 'TEAM' | 'MEMBER' | 'KPI_TEMPLATE' | 'CRITERION' | 'EVALUATION' | 'PERIOD' | 'JIRA_SYNC';
  entityId: string;
  entityName: string;
  beforeValue?: string;
  afterValue?: string;
  reason?: string;
  ipAddress?: string;
}

export interface JiraConnectionConfig {
  workspaceUrl: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING' | 'ERROR';
  lastSyncTimestamp: string;
  syncedIssuesCount: number;
  mappedMembersCount: number;
  unmappedMembersCount: number;
  autoSyncIntervalMinutes: number;
}

export interface PeriodAttributionRule {
  id: string;
  name: string;
  policy: 'RESOLVED_IN_PERIOD' | 'SPRINT_CLOSE_IN_PERIOD' | 'STRICT_CREATED_AND_RESOLVED';
  carryOverPolicy: 'ATTRIBUTE_TO_COMPLETION_MONTH' | 'SPLIT_PROPORTIONAL' | 'ATTRIBUTE_TO_ORIGIN_MONTH';
  reopenPolicy: 'COUNT_AS_NEW_IN_REOPEN_MONTH' | 'ATTACH_TO_ORIGINAL_TICKET';
  spChangePolicy: 'USE_SNAPSHOT_AT_PERIOD_END' | 'TRACK_DIFF_WARNING';
  description: string;
}
