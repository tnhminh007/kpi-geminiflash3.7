import {
  Department,
  Team,
  Member,
  TeamMembership,
  KpiTemplate,
  EvaluationPeriod,
  RankScheme,
  JiraIssue,
  MemberEvaluation,
  DataQualityIssue,
  AuditEvent,
  JiraConnectionConfig,
  UserRole,
  Criterion,
} from '../types/kpi';

import {
  SEED_DEPARTMENT,
  SEED_TEAMS,
  SEED_MEMBERS,
  SEED_MEMBERSHIPS,
  SEED_KPI_TEMPLATES,
  SEED_PERIODS,
  SEED_RANK_SCHEME,
  SEED_JIRA_CONFIG,
  SEED_DATA_QUALITY_ISSUES,
  SEED_AUDIT_LOG,
  generateSeedJiraIssues,
} from './seedData';

import { evaluateMember } from './kpiEngine';

export interface AppState {
  currentRole: UserRole;
  currentPeriodCode: string;
  selectedTeamId: string | null;
  selectedMemberId: string | null;
  
  department: Department;
  teams: Team[];
  members: Member[];
  memberships: TeamMembership[];
  kpiTemplates: KpiTemplate[];
  periods: EvaluationPeriod[];
  rankScheme: RankScheme;
  jiraConfig: JiraConnectionConfig;
  jiraIssues: JiraIssue[];
  evaluations: MemberEvaluation[];
  dataQualityIssues: DataQualityIssue[];
  auditLogs: AuditEvent[];
  
  // UI State
  theme: 'dark' | 'light';
  isSyncingJira: boolean;
  lastEvaluationRunTimestamp: string | null;
}

const STORAGE_KEY = 'kpi_studio_v1_store';

function buildInitialEvaluations(
  members: Member[],
  teams: Team[],
  memberships: TeamMembership[],
  templates: KpiTemplate[],
  periods: EvaluationPeriod[],
  issues: JiraIssue[],
  rankScheme: RankScheme
): MemberEvaluation[] {
  const evals: MemberEvaluation[] = [];

  periods.forEach((period) => {
    members.forEach((member) => {
      // 1. Resolve Primary Team for this specific period
      const membership = memberships.find(
        (m) => m.memberId === member.id && m.period === period.code && m.isPrimary
      ) || memberships.find((m) => m.memberId === member.id && m.isPrimary);

      const teamId = membership?.teamId || member.currentTeamId;
      const team = teams.find((t) => t.id === teamId) || teams[0];

      // 2. Resolve KPI Version for this team and period
      let template: KpiTemplate | undefined;
      if (team.id === 'team-api') {
        if (period.code === '2026-07' || period.code === '2026-08') {
          template = templates.find((t) => t.id === 'tpl-api-v1');
        } else {
          template = templates.find((t) => t.id === 'tpl-api-v2');
        }
      } else {
        template = templates.find((t) => t.id === team.activeTemplateId) || templates[0];
      }

      if (!template) template = templates[0];

      // 3. Compute baseline evaluation
      const evaluated = evaluateMember(
        member,
        team,
        template,
        period.code,
        period.name,
        issues,
        rankScheme
      );

      // Apply seeded scenario states
      if (period.code === '2026-07') {
        evaluated.status = 'LOCKED';
        evaluated.finalizedAt = '2026-08-04T10:00:00Z';
        evaluated.lockedAt = '2026-08-05T14:30:00Z';
      } else if (period.code === '2026-08') {
        evaluated.status = 'FINALIZED';
        evaluated.finalizedAt = '2026-09-02T11:00:00Z';
      } else if (period.code === '2026-09') {
        // Active period specific cases
        if (member.id === 'm-lam') {
          // Dang Van Lam: Leader adjusted +0.8
          evaluated.criteriaEvaluations.forEach((crit) => {
            if (crit.criterionCode === 'INCIDENT_SLA' || crit.criterionCode === 'ON_TIME_DELIVERY') {
              crit.isLeaderAdjusted = true;
              crit.leaderScore = crit.maxScore;
              crit.leaderAdjustmentReason = 'Heroic emergency fix on Sunday prevented 150k RPS payment failure.';
            }
          });
          evaluated.status = 'LEADER_REVIEWED';
          evaluated.leaderKpi = 8.60;
          evaluated.finalKpi = 8.60;
        } else if (member.id === 'm-huong') {
          // Nguyen Thi Huong: Head calibrated
          evaluated.status = 'HEAD_CALIBRATED';
          evaluated.leaderKpi = 9.20;
          evaluated.headKpi = 8.70;
          evaluated.finalKpi = 8.70;
          evaluated.headComment = 'Calibrated across backend teams to maintain rating curve.';
        } else if (member.id === 'm-dung') {
          // Bui Tien Dung: Dropped KPI due to carryovers
          evaluated.status = 'LEADER_REVIEWED';
        }
      }

      evals.push(evaluated);
    });
  });

  return evals;
}

export function getInitialState(): AppState {
  const issues = generateSeedJiraIssues();
  const evals = buildInitialEvaluations(
    SEED_MEMBERS,
    SEED_TEAMS,
    SEED_MEMBERSHIPS,
    SEED_KPI_TEMPLATES,
    SEED_PERIODS,
    issues,
    SEED_RANK_SCHEME
  );

  return {
    currentRole: 'HEAD',
    currentPeriodCode: '2026-09',
    selectedTeamId: 'team-api',
    selectedMemberId: 'm-tuan',
    department: SEED_DEPARTMENT,
    teams: SEED_TEAMS,
    members: SEED_MEMBERS,
    memberships: SEED_MEMBERSHIPS,
    kpiTemplates: SEED_KPI_TEMPLATES,
    periods: SEED_PERIODS,
    rankScheme: SEED_RANK_SCHEME,
    jiraConfig: SEED_JIRA_CONFIG,
    jiraIssues: issues,
    evaluations: evals,
    dataQualityIssues: SEED_DATA_QUALITY_ISSUES,
    auditLogs: SEED_AUDIT_LOG,
    theme: 'dark',
    isSyncingJira: false,
    lastEvaluationRunTimestamp: '2026-09-15T08:45:12Z',
  };
}

class StateStore {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
    if (!this.state.theme) {
      this.state.theme = 'dark';
    }
    this.applyThemeToDom();
  }

  public toggleTheme() {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    this.applyThemeToDom();
    this.saveState();
  }

  public setTheme(theme: 'dark' | 'light') {
    this.state.theme = theme;
    this.applyThemeToDom();
    this.saveState();
  }

  public applyThemeToDom() {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (this.state.theme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
      }
    }
  }

  private loadState(): AppState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate required fields
        if (parsed.teams && parsed.members && parsed.evaluations) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return getInitialState();
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  public getState(): AppState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private addAudit(
    action: string,
    entityType: AuditEvent['entityType'],
    entityId: string,
    entityName: string,
    beforeValue?: string,
    afterValue?: string,
    reason?: string
  ) {
    const actorName =
      this.state.currentRole === 'HEAD'
        ? 'Dr. Tuan Nguyen (Department Head)'
        : this.state.currentRole === 'LEADER'
        ? 'Nguyen Van Minh (Team Lead)'
        : this.state.currentRole === 'ADMIN'
        ? 'Administrator'
        : 'Member';

    const event: AuditEvent = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actor: actorName,
      actorRole: this.state.currentRole,
      action,
      entityType,
      entityId,
      entityName,
      beforeValue,
      afterValue,
      reason,
      ipAddress: '10.240.12.88',
    };

    this.state.auditLogs = [event, ...this.state.auditLogs];
  }

  // --- ACTIONS ---

  public setRole(role: UserRole) {
    this.state.currentRole = role;
    this.saveState();
  }

  public setPeriod(periodCode: string) {
    this.state.currentPeriodCode = periodCode;
    this.saveState();
  }

  public setSelectedTeam(teamId: string | null) {
    this.state.selectedTeamId = teamId;
    this.saveState();
  }

  public setSelectedMember(memberId: string | null) {
    this.state.selectedMemberId = memberId;
    this.saveState();
  }

  public resetToDemo() {
    this.state = getInitialState();
    this.saveState();
  }

  // Organization Mutations
  public createTeam(teamData: {
    name: string;
    code: string;
    description: string;
    leaderId: string;
    leaderName: string;
    criteriaList?: Criterion[];
  }): Team {
    const newTeamId = `team-${teamData.code.toLowerCase()}-${Date.now()}`;
    const newTemplateId = `tpl-${teamData.code.toLowerCase()}-v1`;

    let createdTemplate: KpiTemplate | undefined;

    if (teamData.criteriaList && teamData.criteriaList.length > 0) {
      createdTemplate = {
        id: newTemplateId,
        code: `${teamData.code}_KPI_V1`,
        name: `${teamData.name} KPI v1.0`,
        departmentId: this.state.department.id,
        teamId: newTeamId,
        version: 'v1.0',
        versionNumber: 1,
        status: 'PUBLISHED',
        totalScore: teamData.criteriaList.reduce((acc, c) => acc + c.maxScore, 0),
        createdBy: teamData.leaderName,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        publishedAt: new Date().toISOString().split('T')[0],
        effectiveFromPeriod: this.state.currentPeriodCode,
        criteria: teamData.criteriaList,
      };
      this.state.kpiTemplates.push(createdTemplate);
    }

    const newTeam: Team = {
      id: newTeamId,
      departmentId: this.state.department.id,
      name: teamData.name,
      code: teamData.code.toUpperCase(),
      leaderId: teamData.leaderId,
      leaderName: teamData.leaderName,
      description: teamData.description,
      status: 'ACTIVE',
      activeTemplateId: createdTemplate?.id,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.state.teams.push(newTeam);

    this.addAudit(
      'TEAM_CREATED',
      'TEAM',
      newTeam.id,
      newTeam.name,
      undefined,
      `Leader: ${newTeam.leaderName}, Code: ${newTeam.code}`,
      'Created via Team Management'
    );

    this.saveState();
    return newTeam;
  }

  public addMemberToTeam(memberData: {
    name: string;
    email: string;
    title: string;
    level: string;
    teamId: string;
    jiraUsername: string;
  }): Member {
    const newMemberId = `m-${Date.now()}`;
    const newMember: Member = {
      id: newMemberId,
      employeeId: `EMP-${100 + this.state.members.length}`,
      name: memberData.name,
      email: memberData.email,
      title: memberData.title,
      level: memberData.level,
      currentTeamId: memberData.teamId,
      jiraAccountId: `jira-${memberData.jiraUsername}`,
      jiraUsername: memberData.jiraUsername,
      status: 'ACTIVE',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    this.state.members.push(newMember);

    // Add membership for all active periods
    const team = this.state.teams.find((t) => t.id === memberData.teamId);
    this.state.periods.forEach((p) => {
      this.state.memberships.push({
        id: `tms-${newMember.id}-${p.code}`,
        memberId: newMember.id,
        teamId: memberData.teamId,
        teamName: team?.name || 'Assigned Team',
        period: p.code,
        isPrimary: true,
        roleInTeam: 'MEMBER',
      });
    });

    this.addAudit(
      'MEMBER_ADDED',
      'MEMBER',
      newMember.id,
      newMember.name,
      undefined,
      `Team: ${team?.name}, Title: ${newMember.title}`,
      'New hire onboarding'
    );

    // Trigger evaluation recalculation for current period
    this.runSystemEvaluation(this.state.currentPeriodCode);

    this.saveState();
    return newMember;
  }

  public moveMember(
    memberId: string,
    newTeamId: string,
    effectivePeriod: string,
    reason: string
  ) {
    const member = this.state.members.find((m) => m.id === memberId);
    const newTeam = this.state.teams.find((t) => t.id === newTeamId);
    if (!member || !newTeam) return;

    const oldTeam = this.state.teams.find((t) => t.id === member.currentTeamId);

    // Update current team
    member.currentTeamId = newTeamId;

    // Update or insert membership for effectivePeriod and forward
    let found = false;
    this.state.memberships = this.state.memberships.map((m) => {
      if (m.memberId === memberId && m.period === effectivePeriod) {
        found = true;
        return {
          ...m,
          teamId: newTeamId,
          teamName: newTeam.name,
        };
      }
      return m;
    });

    if (!found) {
      this.state.memberships.push({
        id: `tms-${memberId}-${effectivePeriod}`,
        memberId,
        teamId: newTeamId,
        teamName: newTeam.name,
        period: effectivePeriod,
        isPrimary: true,
        roleInTeam: 'MEMBER',
      });
    }

    this.addAudit(
      'MEMBER_MOVED',
      'MEMBER',
      member.id,
      member.name,
      `Primary Team: ${oldTeam?.name}`,
      `Primary Team: ${newTeam.name} (Effective ${effectivePeriod})`,
      reason
    );

    // Re-evaluate period
    this.runSystemEvaluation(effectivePeriod);

    this.saveState();
  }

  // Template Management
  public createKpiTemplate(template: KpiTemplate) {
    this.state.kpiTemplates.push(template);
    this.addAudit(
      'KPI_DRAFT_CREATED',
      'KPI_TEMPLATE',
      template.id,
      template.name,
      undefined,
      `Version: ${template.version}, Total Criteria: ${template.criteria.length}`,
      'Created in KPI Builder'
    );
    this.saveState();
  }

  public cloneKpiTemplate(sourceId: string, newVersionStr?: string): KpiTemplate | null {
    const source = this.state.kpiTemplates.find((t) => t.id === sourceId);
    if (!source) return null;

    const nextVerNum = source.versionNumber + 1;
    const nextVerStr = newVersionStr || `v${nextVerNum}.0`;

    const cloned: KpiTemplate = {
      ...source,
      id: `tpl-${source.teamId || 'custom'}-${Date.now()}`,
      version: nextVerStr,
      versionNumber: nextVerNum,
      name: `${source.name.split(' v')[0]} ${nextVerStr} (Draft)`,
      status: 'DRAFT',
      clonedFromId: source.id,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      publishedAt: undefined,
      criteria: JSON.parse(JSON.stringify(source.criteria)),
    };

    this.state.kpiTemplates.push(cloned);
    this.addAudit(
      'KPI_TEMPLATE_CLONED',
      'KPI_TEMPLATE',
      cloned.id,
      cloned.name,
      `Cloned from ${source.name} (${source.version})`,
      `New Draft ${cloned.version}`,
      'Cloned as new version'
    );

    this.saveState();
    return cloned;
  }

  public updateKpiTemplate(templateId: string, updates: Partial<KpiTemplate>) {
    this.state.kpiTemplates = this.state.kpiTemplates.map((t) => {
      if (t.id === templateId) {
        const updated = { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] };
        if (updates.criteria) {
          updated.totalScore = updates.criteria.reduce((acc, c) => acc + c.maxScore, 0);
        }
        return updated;
      }
      return t;
    });
    this.saveState();
  }

  public publishKpiTemplate(templateId: string, effectivePeriod: string) {
    const template = this.state.kpiTemplates.find((t) => t.id === templateId);
    if (!template) return;

    template.status = 'PUBLISHED';
    template.publishedAt = new Date().toISOString().split('T')[0];
    template.effectiveFromPeriod = effectivePeriod;

    // If attached to a team, update team's active template
    if (template.teamId) {
      const team = this.state.teams.find((t) => t.id === template.teamId);
      if (team) {
        team.activeTemplateId = template.id;
      }
    }

    this.addAudit(
      'KPI_PUBLISHED',
      'KPI_TEMPLATE',
      template.id,
      template.name,
      'Status: DRAFT / PENDING',
      `Status: PUBLISHED (Effective ${effectivePeriod})`,
      'Approved for production evaluations'
    );

    this.saveState();
  }

  // Leader Review Actions
  public updateLeaderReview(
    evalId: string,
    criterionId: string,
    newScore: number,
    reason: string
  ) {
    const evaluation = this.state.evaluations.find((e) => e.id === evalId);
    if (!evaluation) return;

    const crit = evaluation.criteriaEvaluations.find((c) => c.criterionId === criterionId);
    if (!crit) return;

    const oldScore = crit.leaderScore ?? crit.systemScore ?? 0;
    crit.isLeaderAdjusted = true;
    crit.leaderScore = Number(newScore.toFixed(2));
    crit.leaderAdjustmentReason = reason;

    // Recalculate leader total KPI
    const rawLeaderSum = evaluation.criteriaEvaluations.reduce(
      (acc, c) => acc + (c.leaderScore ?? c.systemScore ?? 0),
      0
    );
    const totalMax = evaluation.criteriaEvaluations.reduce((acc, c) => acc + c.maxScore, 0) || 10;
    const scale = 10 / totalMax;
    evaluation.leaderKpi = Number((rawLeaderSum * scale).toFixed(2));
    evaluation.headKpi = evaluation.leaderKpi; // cascade default
    evaluation.finalKpi = evaluation.leaderKpi;
    evaluation.status = 'LEADER_REVIEWED';
    evaluation.leaderReviewedAt = new Date().toISOString();

    const { rank, coefficient } = resolveRank(evaluation.finalKpi, this.state.rankScheme);
    evaluation.rank = rank;
    evaluation.coefficient = coefficient;

    this.addAudit(
      'LEADER_ADJUSTED_SCORE',
      'EVALUATION',
      evalId,
      `${evaluation.memberName} (${crit.criterionName})`,
      `Score: ${oldScore.toFixed(2)}`,
      `Score: ${newScore.toFixed(2)} (Delta: ${(newScore - oldScore >= 0 ? '+' : '') + (newScore - oldScore).toFixed(2)})`,
      reason
    );

    this.saveState();
  }

  public acceptAllUnchangedLeader(evalId: string) {
    const evaluation = this.state.evaluations.find((e) => e.id === evalId);
    if (!evaluation) return;

    evaluation.criteriaEvaluations.forEach((c) => {
      if (!c.isLeaderAdjusted) {
        c.leaderScore = c.systemScore;
      }
    });

    evaluation.leaderKpi = evaluation.systemKpi;
    evaluation.headKpi = evaluation.leaderKpi;
    evaluation.finalKpi = evaluation.leaderKpi;
    evaluation.status = 'LEADER_REVIEWED';
    evaluation.leaderReviewedAt = new Date().toISOString();

    const { rank, coefficient } = resolveRank(evaluation.finalKpi, this.state.rankScheme);
    evaluation.rank = rank;
    evaluation.coefficient = coefficient;

    this.addAudit(
      'LEADER_ACCEPTED_ALL_SUGGESTED',
      'EVALUATION',
      evalId,
      evaluation.memberName,
      'Status: SYSTEM_EVALUATED',
      `Leader KPI: ${evaluation.leaderKpi} (Accepted System Suggested)`,
      'Bulk approval by Team Leader'
    );

    this.saveState();
  }

  public batchAcceptAllForTeam(teamId: string, periodCode: string) {
    const teamEvals = this.state.evaluations.filter(
      (e) => e.teamId === teamId && e.periodId === periodCode
    );
    teamEvals.forEach((ev) => this.acceptAllUnchangedLeader(ev.id));
    this.saveState();
  }

  // Department Head Calibration Actions
  public updateHeadCalibration(
    evalId: string,
    criterionId: string,
    newScore: number,
    reason: string
  ) {
    const evaluation = this.state.evaluations.find((e) => e.id === evalId);
    if (!evaluation) return;

    const crit = evaluation.criteriaEvaluations.find((c) => c.criterionId === criterionId);
    if (!crit) return;

    const oldScore = crit.headScore ?? crit.leaderScore ?? crit.systemScore ?? 0;
    crit.isHeadAdjusted = true;
    crit.headScore = Number(newScore.toFixed(2));
    crit.headAdjustmentReason = reason;

    // Recalculate head total KPI
    const rawHeadSum = evaluation.criteriaEvaluations.reduce(
      (acc, c) => acc + (c.headScore ?? c.leaderScore ?? c.systemScore ?? 0),
      0
    );
    const totalMax = evaluation.criteriaEvaluations.reduce((acc, c) => acc + c.maxScore, 0) || 10;
    const scale = 10 / totalMax;
    evaluation.headKpi = Number((rawHeadSum * scale).toFixed(2));
    evaluation.finalKpi = evaluation.headKpi;
    evaluation.status = 'HEAD_CALIBRATED';
    evaluation.headCalibratedAt = new Date().toISOString();

    const { rank, coefficient } = resolveRank(evaluation.finalKpi, this.state.rankScheme);
    evaluation.rank = rank;
    evaluation.coefficient = coefficient;

    this.addAudit(
      'HEAD_CALIBRATED_SCORE',
      'EVALUATION',
      evalId,
      `${evaluation.memberName} (${crit.criterionName})`,
      `Score: ${oldScore.toFixed(2)}`,
      `Score: ${newScore.toFixed(2)}`,
      reason
    );

    this.saveState();
  }

  public finalizeEvaluation(evalId: string) {
    const evaluation = this.state.evaluations.find((e) => e.id === evalId);
    if (!evaluation) return;

    evaluation.status = 'FINALIZED';
    evaluation.finalizedAt = new Date().toISOString();
    this.saveState();
  }

  public batchFinalizeAll(periodCode: string) {
    this.state.evaluations
      .filter((e) => e.periodId === periodCode)
      .forEach((e) => {
        e.status = 'FINALIZED';
        e.finalizedAt = new Date().toISOString();
      });

    const period = this.state.periods.find((p) => p.code === periodCode);
    if (period) {
      period.status = 'FINALIZED';
      period.finalizedCount = period.totalMembers;
    }

    this.addAudit(
      'PERIOD_FINALIZED_ALL',
      'PERIOD',
      periodCode,
      `Evaluation Period ${periodCode}`,
      'Status: HEAD_REVIEW / CALIBRATION',
      'Status: FINALIZED (All 26 members calibrated)',
      'Final calibration approved by Department Head'
    );

    this.saveState();
  }

  public lockPeriod(periodCode: string, lockedBy: string = 'Nguyen Van Truong (Department Head)') {
    const period = this.state.periods.find((p) => p.code === periodCode);
    if (!period) return;

    period.status = 'LOCKED';
    period.isLocked = true;
    period.lockedAt = new Date().toISOString();
    period.lockedBy = lockedBy;

    this.state.evaluations
      .filter((e) => e.periodId === periodCode)
      .forEach((e) => {
        e.status = 'LOCKED';
        e.lockedAt = new Date().toISOString();
      });

    this.addAudit(
      'PERIOD_LOCKED',
      'PERIOD',
      periodCode,
      `Evaluation Period ${periodCode}`,
      'Status: FINALIZED',
      'Status: LOCKED (Permanent Immutable Snapshot)',
      `Locked by ${lockedBy}. Results frozen for official enterprise performance logs.`
    );

    this.saveState();
  }

  // System Evaluation Pipeline Run
  public runSystemEvaluation(periodCode: string) {
    const period = this.state.periods.find((p) => p.code === periodCode);
    if (!period) return;

    const existingEvals = this.state.evaluations.filter((e) => e.periodId === periodCode);

    this.state.members.forEach((member) => {
      // 1. Resolve membership for period
      const membership = this.state.memberships.find(
        (m) => m.memberId === member.id && m.period === periodCode && m.isPrimary
      ) || this.state.memberships.find((m) => m.memberId === member.id && m.isPrimary);

      const teamId = membership?.teamId || member.currentTeamId;
      const team = this.state.teams.find((t) => t.id === teamId) || this.state.teams[0];

      // 2. Resolve template
      let template: KpiTemplate | undefined;
      if (team.id === 'team-api') {
        if (periodCode === '2026-07' || periodCode === '2026-08') {
          template = this.state.kpiTemplates.find((t) => t.id === 'tpl-api-v1');
        } else {
          template = this.state.kpiTemplates.find((t) => t.id === 'tpl-api-v2');
        }
      } else {
        template = this.state.kpiTemplates.find((t) => t.id === team.activeTemplateId) || this.state.kpiTemplates[0];
      }

      if (!template) template = this.state.kpiTemplates[0];

      const existing = existingEvals.find((e) => e.memberId === member.id);

      // Do NOT recalculate locked periods!
      if (existing?.status === 'LOCKED') return;

      const newEval = evaluateMember(
        member,
        team,
        template,
        periodCode,
        period.name,
        this.state.jiraIssues,
        this.state.rankScheme,
        existing
      );

      // Update in array
      const idx = this.state.evaluations.findIndex((e) => e.id === newEval.id);
      if (idx >= 0) {
        this.state.evaluations[idx] = newEval;
      } else {
        this.state.evaluations.push(newEval);
      }
    });

    this.state.lastEvaluationRunTimestamp = new Date().toISOString();

    this.addAudit(
      'SYSTEM_EVALUATION_RUN',
      'PERIOD',
      periodCode,
      `Evaluation Period ${periodCode}`,
      undefined,
      `Calculated 26 members across ${this.state.teams.length} teams`,
      'Automated pipeline calculation'
    );

    this.saveState();
  }

  // Jira Mutations (for testing recalculation and snapshot demo)
  public mutateJiraTicket(issueKey: string, newStoryPoints: number) {
    const issue = this.state.jiraIssues.find((i) => i.key === issueKey);
    if (!issue) return;

    const oldSP = issue.storyPoints;
    issue.currentJiraStoryPoints = newStoryPoints;
    issue.hasDataChangedSinceLock = true;

    this.addAudit(
      'JIRA_DATA_CHANGED',
      'JIRA_SYNC',
      issueKey,
      `Jira Issue ${issueKey}`,
      `Story Points: ${oldSP}`,
      `Story Points: ${newStoryPoints}`,
      'Demonstrating historical locked snapshot immutability vs current Jira live data'
    );

    this.saveState();
  }

  // Aliases for component convenience
  public mutateJiraIssueSp(issueKey: string, newStoryPoints: number) {
    this.mutateJiraTicket(issueKey, newStoryPoints);
  }

  public runSystemEvaluations(periodCode: string) {
    this.runSystemEvaluation(periodCode);
  }

  public calibrateDepartmentHead(
    evalId: string,
    critOrScore: string | number,
    scoreOrReason: number | string,
    reason?: string
  ) {
    if (typeof critOrScore === 'number' && typeof scoreOrReason === 'string') {
      // Direct total evaluation score calibration
      const evaluation = this.state.evaluations.find((e) => e.id === evalId);
      if (!evaluation) return;

      const oldScore = evaluation.headKpi ?? evaluation.leaderKpi ?? evaluation.systemKpi ?? 0;
      const newScore = Number(critOrScore.toFixed(2));
      evaluation.headKpi = newScore;
      evaluation.finalKpi = newScore;
      evaluation.headComment = scoreOrReason;
      evaluation.status = 'HEAD_CALIBRATED';
      evaluation.headCalibratedAt = new Date().toISOString();

      const { rank, coefficient } = resolveRank(evaluation.finalKpi, this.state.rankScheme);
      evaluation.rank = rank;
      evaluation.coefficient = coefficient;

      this.addAudit(
        'HEAD_CALIBRATED_SCORE',
        'EVALUATION',
        evalId,
        evaluation.memberName,
        `Score: ${oldScore.toFixed(2)}`,
        `Score: ${newScore.toFixed(2)}`,
        scoreOrReason
      );

      this.saveState();
    } else if (typeof critOrScore === 'string' && typeof scoreOrReason === 'number') {
      this.updateHeadCalibration(evalId, critOrScore, scoreOrReason, reason || '');
    }
  }

  public finalizePeriodEvaluations(periodCode: string) {
    this.batchFinalizeAll(periodCode);
  }

  public transferMember(
    memberId: string,
    newTeamId: string,
    effectivePeriod: string,
    reason: string = 'Reassigned during organizational restructuring'
  ) {
    this.moveMember(memberId, newTeamId, effectivePeriod, reason);
  }

  public updateRankScheme(tiers: any[]) {
    this.state.rankScheme.tiers = tiers;
    // Recalculate ranks across all evaluations
    this.state.evaluations.forEach((ev) => {
      const { rank, coefficient } = resolveRank(ev.finalKpi, this.state.rankScheme);
      ev.rank = rank;
      ev.coefficient = coefficient;
    });
    this.saveState();
  }

  public updateTeam(teamId: string, updates: Partial<Team>) {
    this.state.teams = this.state.teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t));
    this.addAudit('TEAM_UPDATED', 'TEAM', teamId, updates.name || teamId, undefined, JSON.stringify(updates), 'Updated team information');
    this.saveState();
  }

  public updateMember(memberId: string, updates: Partial<Member>) {
    this.state.members = this.state.members.map((m) => (m.id === memberId ? { ...m, ...updates } : m));
    this.addAudit('MEMBER_UPDATED', 'MEMBER', memberId, updates.name || memberId, undefined, JSON.stringify(updates), 'Updated engineer profile');
    this.saveState();
  }

  public addPeriod(period: EvaluationPeriod) {
    this.state.periods.push(period);
    // Build evaluations for the new period
    this.state.members.forEach((member) => {
      const team = this.state.teams.find((t) => t.id === member.currentTeamId) || this.state.teams[0];
      const template = this.state.kpiTemplates.find((t) => t.teamId === team.id && t.status === 'PUBLISHED') || this.state.kpiTemplates[0];
      const evaluated = evaluateMember(
        member,
        team,
        template,
        period.code,
        period.name,
        this.state.jiraIssues,
        this.state.rankScheme
      );
      this.state.evaluations.push(evaluated);
    });
    this.addAudit('PERIOD_CREATED', 'PERIOD', period.code, period.name, undefined, `Period: ${period.code}`, 'New evaluation cycle launched');
    this.saveState();
  }

  public updatePeriod(code: string, updates: Partial<EvaluationPeriod>) {
    this.state.periods = this.state.periods.map((p) => (p.code === code ? { ...p, ...updates } : p));
    this.saveState();
  }

  public addJiraIssue(issue: JiraIssue) {
    this.state.jiraIssues.push(issue);
    this.addAudit('JIRA_ISSUE_CREATED', 'JIRA_SYNC', issue.key, issue.summary, undefined, `SP: ${issue.storyPoints}`, 'Manual test telemetry artifact created');
    this.saveState();
  }

  public resetToSeedData() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = getInitialState();
    this.saveState();
  }

  public exportStateJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importStateJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.members && parsed.teams && parsed.kpiTemplates) {
        this.state = parsed;
        this.saveState();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

function resolveRank(
  score: number | null,
  scheme: RankScheme
): { rank: string | null; coefficient: number | null } {
  if (score === null || isNaN(score)) return { rank: null, coefficient: null };
  const rounded = Number(score.toFixed(2));
  for (const tier of scheme.tiers) {
    if (rounded >= tier.minScore && rounded <= tier.maxScore) {
      return { rank: tier.rank, coefficient: tier.coefficient };
    }
  }
  const last = scheme.tiers[scheme.tiers.length - 1];
  return { rank: last?.rank ?? 'E', coefficient: last?.coefficient ?? 0.6 };
}

export const store = new StateStore();
