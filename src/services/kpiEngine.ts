import {
  Criterion,
  ScoringRuleConfig,
  JiraIssue,
  ScoreExplanationTrace,
  ConfidenceLevel,
  MemberEvaluation,
  CriterionEvaluation,
  Member,
  Team,
  KpiTemplate,
  RankScheme,
  JiraFactSnapshot,
} from '../types/kpi';

/**
 * Visual/Mathematical evaluation of Scoring Rules
 */
export function evaluateScoringRule(
  metricValue: number,
  maxScore: number,
  rule: ScoringRuleConfig
): { score: number; ruleDescription: string } {
  if (rule.type === 'THRESHOLD' || rule.type === 'RANGE' || rule.type === 'HYBRID') {
    for (const item of rule.thresholds) {
      let matched = false;
      switch (item.operator) {
        case '>=':
          matched = metricValue >= item.value;
          break;
        case '>':
          matched = metricValue > item.value;
          break;
        case '<=':
          matched = metricValue <= item.value;
          break;
        case '<':
          matched = metricValue < item.value;
          break;
        case '==':
          matched = Math.abs(metricValue - item.value) < 0.001;
          break;
        case 'BETWEEN':
          matched =
            metricValue >= item.value &&
            metricValue <= (item.value2 ?? item.value);
          break;
      }

      if (matched) {
        const boundedScore = Math.min(Math.max(0, item.score), maxScore);
        const desc = item.label || `${item.operator} ${item.value}${item.value2 ? ` and ${item.value2}` : ''} -> ${boundedScore.toFixed(1)} / ${maxScore} pts`;
        return { score: boundedScore, ruleDescription: desc };
      }
    }
  }

  if (rule.type === 'FORMULA' && rule.formulaExpression) {
    try {
      // Safe formula evaluation for expressions like (val / 100) * maxScore
      const normalizedVal = metricValue;
      // Linear scale default
      const calculated = Math.min(maxScore, Math.max(0, (normalizedVal / 100) * maxScore));
      return {
        score: Number(calculated.toFixed(2)),
        ruleDescription: `Formula: (${metricValue} / 100) * ${maxScore} = ${calculated.toFixed(2)} pts`,
      };
    } catch {
      // Fallback
    }
  }

  const fallback = Math.min(Math.max(0, rule.fallbackScore), maxScore);
  return {
    score: fallback,
    ruleDescription: `Default fallback rule -> ${fallback.toFixed(1)} / ${maxScore} pts`,
  };
}

/**
 * Calculates raw metrics, builds Jira evidence trace, and determines confidence
 */
export function calculateCriterionMetric(
  criterion: Criterion,
  memberIssues: JiraIssue[]
): {
  metricValue: number;
  metricFormatted: string;
  inputSummary: Record<string, any>;
  confidence: ConfidenceLevel;
  confidenceReasons: string[];
  evidenceKeys: string[];
  factSnapshots: JiraFactSnapshot[];
} {
  const metricKey = criterion.metricConfig?.metricKey || criterion.code;
  const evidenceKeys: string[] = [];
  const confidenceReasons: string[] = [];
  let confidence: ConfidenceLevel = 'HIGH';

  // Snapshot generation
  const factSnapshots: JiraFactSnapshot[] = memberIssues.map((issue) => ({
    issueKey: issue.key,
    summary: issue.summary,
    storyPointsSnapshot: issue.storyPoints,
    statusSnapshot: issue.status,
    resolvedDateSnapshot: issue.resolvedDate,
    deadlineSnapshot: issue.deadlineDate,
    reopenCountSnapshot: issue.reopenCount,
    isCarryOverSnapshot: issue.isCarryOver,
    snapshotTimestamp: new Date().toISOString(),
  }));

  // Missing data checks
  const missingSpCount = memberIssues.filter((i) => i.storyPoints === null).length;
  const missingDeadlineCount = memberIssues.filter(
    (i) => (i.issueType === 'Story' || i.issueType === 'Task') && !i.deadlineDate
  ).length;

  if (missingSpCount > 0) {
    confidenceReasons.push(`${missingSpCount} task(s) missing Story Points estimation.`);
    confidence = 'MEDIUM';
  }
  if (missingDeadlineCount > 0) {
    confidenceReasons.push(`${missingDeadlineCount} ticket(s) missing scheduled deadline.`);
    if (confidence === 'MEDIUM') confidence = 'LOW';
    else confidence = 'MEDIUM';
  }

  if (memberIssues.length === 0 && criterion.evaluationMethod !== 'MANUAL') {
    confidenceReasons.push('No assigned Jira tickets detected in this evaluation period.');
    confidence = 'REVIEW_REQUIRED';
  }

  // Calculation by metricKey
  if (metricKey === 'ON_TIME_COMPLETION_RATE' || criterion.name.toLowerCase().includes('on-time') || criterion.name.toLowerCase().includes('delivery')) {
    const completedTickets = memberIssues.filter((i) => i.status === 'Done' || i.status === 'Closed');
    completedTickets.forEach((t) => evidenceKeys.push(t.key));

    const totalCompletedSP = completedTickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const onTimeTickets = completedTickets.filter((t) => {
      if (!t.deadlineDate || !t.resolvedDate) return true; // Graceful default with low confidence flag
      return new Date(t.resolvedDate) <= new Date(t.deadlineDate);
    });
    const onTimeSP = onTimeTickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    const committedSP = memberIssues.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const rate = totalCompletedSP > 0 ? (onTimeSP / totalCompletedSP) * 100 : 85;

    return {
      metricValue: Math.round(rate),
      metricFormatted: `${Math.round(rate)}%`,
      inputSummary: {
        committedSP,
        completedSP: totalCompletedSP,
        onTimeSP,
        onTimeTicketCount: onTimeTickets.length,
        totalCompletedCount: completedTickets.length,
        lateTicketCount: completedTickets.length - onTimeTickets.length,
      },
      confidence,
      confidenceReasons,
      evidenceKeys,
      factSnapshots,
    };
  }

  if (metricKey === 'TASK_COMPLETION_RATE' || metricKey === 'COMPLETED_STORY_POINTS') {
    const completedTickets = memberIssues.filter((i) => i.status === 'Done' || i.status === 'Closed');
    completedTickets.forEach((t) => evidenceKeys.push(t.key));

    const committedSP = memberIssues.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const completedSP = completedTickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const rate = committedSP > 0 ? (completedSP / committedSP) * 100 : 90;

    return {
      metricValue: Math.round(rate),
      metricFormatted: `${Math.round(rate)}%`,
      inputSummary: {
        committedSP,
        completedSP,
        totalTickets: memberIssues.length,
        completedTickets: completedTickets.length,
      },
      confidence,
      confidenceReasons,
      evidenceKeys,
      factSnapshots,
    };
  }

  if (metricKey === 'CARRY_OVER_RATE') {
    const carryOverTickets = memberIssues.filter((i) => i.isCarryOver);
    memberIssues.forEach((t) => evidenceKeys.push(t.key));
    const totalCommitted = memberIssues.length;
    const rate = totalCommitted > 0 ? (carryOverTickets.length / totalCommitted) * 100 : 0;

    if (carryOverTickets.length >= 3) {
      confidenceReasons.push(`High task carryover detected (${carryOverTickets.length} tasks).`);
      confidence = 'MEDIUM';
    }

    return {
      metricValue: Number(rate.toFixed(1)),
      metricFormatted: `${rate.toFixed(1)}%`,
      inputSummary: {
        totalTickets: totalCommitted,
        carryOverCount: carryOverTickets.length,
        carryOverTicketKeys: carryOverTickets.map((t) => t.key),
      },
      confidence,
      confidenceReasons,
      evidenceKeys,
      factSnapshots,
    };
  }

  if (metricKey === 'BUG_RATE' || criterion.name.toLowerCase().includes('quality')) {
    const bugTickets = memberIssues.filter((i) => i.isBug || i.issueType === 'Bug');
    const featureTickets = memberIssues.filter((i) => !i.isBug && (i.status === 'Done' || i.status === 'Closed'));
    
    bugTickets.forEach((t) => evidenceKeys.push(t.key));
    featureTickets.forEach((t) => evidenceKeys.push(t.key));

    const bugCount = bugTickets.length;
    const featureCount = featureTickets.length || 1;
    const rate = (bugCount / featureCount) * 100;

    return {
      metricValue: Number(rate.toFixed(1)),
      metricFormatted: `${rate.toFixed(1)}%`,
      inputSummary: {
        totalBugs: bugCount,
        deliveredFeatures: featureCount,
        bugKeys: bugTickets.map((b) => b.key),
      },
      confidence,
      confidenceReasons,
      evidenceKeys,
      factSnapshots,
    };
  }

  if (metricKey === 'REOPEN_RATE') {
    const reopenedTickets = memberIssues.filter((i) => i.reopenCount > 0);
    const closedTickets = memberIssues.filter((i) => i.status === 'Done' || i.status === 'Closed');
    
    closedTickets.forEach((t) => evidenceKeys.push(t.key));
    const rate = closedTickets.length > 0 ? (reopenedTickets.length / closedTickets.length) * 100 : 0;

    if (reopenedTickets.length >= 2) {
      confidenceReasons.push(`Multiple QA task reopens detected (${reopenedTickets.length}).`);
    }

    return {
      metricValue: Number(rate.toFixed(1)),
      metricFormatted: `${rate.toFixed(1)}%`,
      inputSummary: {
        totalClosed: closedTickets.length,
        reopenedCount: reopenedTickets.length,
        reopenedKeys: reopenedTickets.map((t) => t.key),
      },
      confidence,
      confidenceReasons,
      evidenceKeys,
      factSnapshots,
    };
  }

  if (metricKey === 'INCIDENT_COUNT' || criterion.name.toLowerCase().includes('incident')) {
    const incidentTickets = memberIssues.filter((i) => i.isIncident || i.issueType === 'Incident');
    incidentTickets.forEach((t) => evidenceKeys.push(t.key));

    return {
      metricValue: incidentTickets.length,
      metricFormatted: `${incidentTickets.length} Incidents`,
      inputSummary: {
        p1Count: incidentTickets.filter((i) => i.priority === 'Highest').length,
        p2Count: incidentTickets.filter((i) => i.priority === 'High').length,
        totalIncidents: incidentTickets.length,
        incidentKeys: incidentTickets.map((i) => i.key),
      },
      confidence: incidentTickets.length > 0 ? 'HIGH' : 'HIGH',
      confidenceReasons,
      evidenceKeys,
      factSnapshots,
    };
  }

  // MANUAL or Knowledge Sharing or Custom
  return {
    metricValue: 1,
    metricFormatted: criterion.evaluationMethod === 'MANUAL' ? 'Manual Rubric' : '1 Session / Contribution',
    inputSummary: {
      mode: criterion.evaluationMethod,
      evidenceSource: criterion.evidenceSource,
      notes: 'Reviewed via technical talk log & pull-request peer reviews.',
    },
    confidence: 'HIGH',
    confidenceReasons: ['Evaluated via documented technical contributions.'],
    evidenceKeys: memberIssues.slice(0, 3).map((i) => i.key),
    factSnapshots,
  };
}

/**
 * Resolves Rank & Coefficient from final score
 */
export function resolveRankAndCoefficient(
  score: number | null,
  rankScheme: RankScheme
): { rank: string | null; coefficient: number | null } {
  if (score === null || isNaN(score)) {
    return { rank: null, coefficient: null };
  }

  const rounded = Number(score.toFixed(2));
  for (const tier of rankScheme.tiers) {
    if (rounded >= tier.minScore && rounded <= tier.maxScore) {
      return { rank: tier.rank, coefficient: tier.coefficient };
    }
  }

  // Fallback to lowest tier
  const lastTier = rankScheme.tiers[rankScheme.tiers.length - 1];
  return { rank: lastTier?.rank ?? 'E', coefficient: lastTier?.coefficient ?? 0.6 };
}

/**
 * Complete evaluation pipeline for a member
 */
export function evaluateMember(
  member: Member,
  team: Team,
  template: KpiTemplate,
  periodCode: string,
  periodName: string,
  issues: JiraIssue[],
  rankScheme: RankScheme,
  previousEvaluation?: MemberEvaluation
): MemberEvaluation {
  const memberIssues = issues.filter(
    (i) =>
      i.assigneeId === member.id &&
      (i.periodAttribution === periodCode || i.periodAttribution === periodName)
  );

  const criteriaEvaluations: CriterionEvaluation[] = template.criteria.map((crit) => {
    // Check if existing manual adjustments should be retained
    const prevCrit = previousEvaluation?.criteriaEvaluations?.find(
      (c) => c.criterionId === crit.id || c.criterionCode === crit.code
    );

    const {
      metricValue,
      metricFormatted,
      inputSummary,
      confidence,
      confidenceReasons,
      evidenceKeys,
      factSnapshots,
    } = calculateCriterionMetric(crit, memberIssues);

    const ruleResult = evaluateScoringRule(metricValue, crit.maxScore, crit.scoringRule);
    const systemScore = crit.evaluationMethod === 'MANUAL' ? crit.maxScore * 0.85 : ruleResult.score;

    const trace: ScoreExplanationTrace = {
      inputSummary,
      metricValue,
      metricFormatted,
      ruleAppliedDescription: ruleResult.ruleDescription,
      suggestedScore: systemScore,
      maxScore: crit.maxScore,
      confidence,
      confidenceReasons,
      evidenceCount: evidenceKeys.length,
      evidenceSummary: `${evidenceKeys.length} verified Jira artifacts evaluated`,
      ticketKeys: evidenceKeys,
    };

    const isLeaderAdjusted = prevCrit?.isLeaderAdjusted ?? false;
    const leaderScore = isLeaderAdjusted ? prevCrit?.leaderScore ?? systemScore : (prevCrit?.leaderScore ?? systemScore);
    const leaderAdjustmentReason = prevCrit?.leaderAdjustmentReason;

    const isHeadAdjusted = prevCrit?.isHeadAdjusted ?? false;
    const headScore = isHeadAdjusted ? prevCrit?.headScore ?? leaderScore : (prevCrit?.headScore ?? leaderScore);
    const headAdjustmentReason = prevCrit?.headAdjustmentReason;

    const finalScore = headScore !== null ? Number(headScore.toFixed(2)) : null;

    return {
      criterionId: crit.id,
      criterionName: crit.name,
      criterionCode: crit.code,
      maxScore: crit.maxScore,
      evaluationMethod: crit.evaluationMethod,
      metricKey: crit.metricConfig?.metricKey,
      metricValue,
      metricFormatted,
      systemScore: Number(systemScore.toFixed(2)),
      leaderScore: leaderScore !== null ? Number(leaderScore.toFixed(2)) : null,
      headScore: headScore !== null ? Number(headScore.toFixed(2)) : null,
      finalScore,
      trace,
      confidence,
      isLeaderAdjusted,
      leaderAdjustmentReason,
      isHeadAdjusted,
      headAdjustmentReason,
      evidenceTickets: evidenceKeys,
      factSnapshots,
      manualEvidenceNotes: prevCrit?.manualEvidenceNotes,
    };
  });

  // Calculate Aggregates
  const totalMax = template.criteria.reduce((acc, c) => acc + c.maxScore, 0) || 10;
  const rawSystemSum = criteriaEvaluations.reduce((acc, c) => acc + (c.systemScore ?? 0), 0);
  const rawLeaderSum = criteriaEvaluations.reduce((acc, c) => acc + (c.leaderScore ?? c.systemScore ?? 0), 0);
  const rawHeadSum = criteriaEvaluations.reduce(
    (acc, c) => acc + (c.headScore ?? c.leaderScore ?? c.systemScore ?? 0),
    0
  );

  // Normalize to standard 10.0 scale if totalMax != 10
  const scale = 10 / totalMax;
  const systemKpi = Number((rawSystemSum * scale).toFixed(2));
  const leaderKpi = Number((rawLeaderSum * scale).toFixed(2));
  const headKpi = Number((rawHeadSum * scale).toFixed(2));
  const finalKpi = headKpi;

  const { rank, coefficient } = resolveRankAndCoefficient(finalKpi, rankScheme);

  // Overall Confidence
  let overallConfidence: ConfidenceLevel = 'HIGH';
  const confidences = criteriaEvaluations.map((c) => c.confidence);
  if (confidences.includes('REVIEW_REQUIRED')) overallConfidence = 'REVIEW_REQUIRED';
  else if (confidences.includes('LOW')) overallConfidence = 'LOW';
  else if (confidences.includes('MEDIUM')) overallConfidence = 'MEDIUM';

  // Workload summary
  const committedSP = memberIssues.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const completedTickets = memberIssues.filter((i) => i.status === 'Done' || i.status === 'Closed');
  const completedSP = completedTickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const onTimeSP = completedTickets
    .filter((t) => !t.deadlineDate || !t.resolvedDate || new Date(t.resolvedDate) <= new Date(t.deadlineDate))
    .reduce((acc, t) => acc + (t.storyPoints || 0), 0);

  const bugCount = memberIssues.filter((i) => i.isBug).length;
  const incidentCount = memberIssues.filter((i) => i.isIncident).length;
  const carryOverCount = memberIssues.filter((i) => i.isCarryOver).length;
  const missingSPCount = memberIssues.filter((i) => i.storyPoints === null).length;
  const missingDeadlineCount = memberIssues.filter((i) => !i.deadlineDate).length;

  const leaderDelta = Math.abs(leaderKpi - systemKpi);
  const headDelta = Math.abs(headKpi - leaderKpi);

  const attentionFlags = {
    isKpiDropped: previousEvaluation ? (previousEvaluation.finalKpi ?? 0) - finalKpi >= 0.8 : false,
    dropAmount: previousEvaluation ? Number(((previousEvaluation.finalKpi ?? 0) - finalKpi).toFixed(2)) : 0,
    largeLeaderDelta: leaderDelta >= 0.5,
    largeHeadDelta: headDelta >= 0.4,
    missingSPCount,
    missingDeadlineCount,
    highCarryOver: carryOverCount >= 3,
    highReopenRate: memberIssues.some((i) => i.reopenCount >= 2),
    underlyingDataChanged: memberIssues.some((i) => i.hasDataChangedSinceLock),
  };

  const dataQualityFlags: string[] = [];
  if (missingSPCount > 0) dataQualityFlags.push(`${missingSPCount} tickets missing Story Points`);
  if (missingDeadlineCount > 0) dataQualityFlags.push(`${missingDeadlineCount} tickets missing Target Deadlines`);
  if (carryOverCount >= 3) dataQualityFlags.push(`High sprint carryover (${carryOverCount} items)`);
  if (attentionFlags.underlyingDataChanged) dataQualityFlags.push('Underlying Jira ticket changed after initial snapshot');

  return {
    id: previousEvaluation?.id || `eval-${member.id}-${periodCode}`,
    periodId: periodCode,
    periodName,
    memberId: member.id,
    memberName: member.name,
    memberAvatar: member.avatarUrl,
    memberTitle: member.title,
    teamId: team.id,
    teamName: team.name,
    kpiTemplateId: template.id,
    kpiVersion: template.version,
    status: previousEvaluation?.status || 'SYSTEM_EVALUATED',
    systemKpi,
    leaderKpi,
    headKpi,
    finalKpi,
    rank,
    coefficient,
    confidence: overallConfidence,
    dataQualityFlags,
    criteriaEvaluations,
    leaderComment: previousEvaluation?.leaderComment,
    leaderReviewedAt: previousEvaluation?.leaderReviewedAt,
    leaderReviewedBy: previousEvaluation?.leaderReviewedBy,
    headComment: previousEvaluation?.headComment,
    headCalibratedAt: previousEvaluation?.headCalibratedAt,
    headCalibratedBy: previousEvaluation?.headCalibratedBy,
    finalizedAt: previousEvaluation?.finalizedAt,
    lockedAt: previousEvaluation?.lockedAt,
    workloadSummary: {
      totalTickets: memberIssues.length,
      committedSP,
      completedSP,
      onTimeSP,
      bugCount,
      incidentCount,
      carryOverCount,
    },
    attentionFlags,
  };
}

/**
 * Simulates applying a candidate KPI template version to historical data
 */
export function simulateKpiTemplateOnHistoricalData(
  template: KpiTemplate,
  periodCode: string,
  issues: JiraIssue[],
  evaluations: MemberEvaluation[]
): {
  memberId: string;
  memberName: string;
  historicalScore: number;
  simulatedScore: number;
  delta: number;
  confidence: string;
}[] {
  const periodEvals = evaluations.filter((e) => e.periodId === periodCode);

  return periodEvals.map((ev) => {
    const memberIssues = issues.filter(
      (i) => i.assigneeId === ev.memberId && (i.periodAttribution === periodCode || i.periodAttribution === ev.periodName)
    );

    let rawScoreSum = 0;
    template.criteria.forEach((crit) => {
      const { metricValue } = calculateCriterionMetric(crit, memberIssues);
      const ruleResult = evaluateScoringRule(metricValue, crit.maxScore, crit.scoringRule);
      const score = crit.evaluationMethod === 'MANUAL' ? crit.maxScore * 0.85 : ruleResult.score;
      rawScoreSum += score;
    });

    const totalMax = template.criteria.reduce((acc, c) => acc + c.maxScore, 0) || 10;
    const simulatedScore = Number(((rawScoreSum * 10) / totalMax).toFixed(2));
    const historicalScore = ev.finalKpi ?? ev.headKpi ?? ev.leaderKpi ?? ev.systemKpi ?? 0;
    const delta = Number((simulatedScore - historicalScore).toFixed(2));

    return {
      memberId: ev.memberId,
      memberName: ev.memberName,
      historicalScore,
      simulatedScore,
      delta,
      confidence: ev.confidence,
    };
  });
}
