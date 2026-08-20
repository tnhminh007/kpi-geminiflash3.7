import React from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Scale,
  Clock,
  Sparkles,
  Zap,
  Sliders,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface ExecutiveDashboardProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
  onOpenTicket: (ticketKey: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onNavigate,
  onOpenTicket,
}) => {
  const state = useStore();
  const currentPeriod = state.periods.find((p) => p.code === state.currentPeriodCode);
  const periodEvals = state.evaluations.filter((e) => e.periodId === state.currentPeriodCode);
  const isLight = state.theme === 'light';

  // Department Aggregate Metrics
  const evaluatedCount = periodEvals.length;
  const finalizedCount = periodEvals.filter((e) => e.status === 'FINALIZED' || e.status === 'LOCKED').length;
  const leaderReviewedCount = periodEvals.filter(
    (e) =>
      e.status === 'LEADER_REVIEWED' ||
      e.status === 'HEAD_CALIBRATED' ||
      e.status === 'FINALIZED' ||
      e.status === 'LOCKED'
  ).length;
  const headReviewedCount = periodEvals.filter(
    (e) => e.status === 'HEAD_CALIBRATED' || e.status === 'FINALIZED' || e.status === 'LOCKED'
  ).length;

  const validScores = periodEvals.map((e) => e.finalKpi ?? e.systemKpi ?? 0).filter((s) => s > 0);
  const avgDepartmentKpi =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
      : '0.00';

  const highConfidenceCount = periodEvals.filter((e) => e.confidence === 'HIGH').length;
  const lowConfidenceEvals = periodEvals.filter(
    (e) => e.confidence === 'LOW' || e.confidence === 'REVIEW_REQUIRED'
  );

  // Rank Distribution Data for Recharts
  const rankCounts: Record<string, number> = {
    'A+': 0,
    'A': 0,
    'B+': 0,
    'B': 0,
    'C': 0,
    'D': 0,
    'E': 0,
  };
  periodEvals.forEach((e) => {
    if (e.rank && rankCounts[e.rank] !== undefined) {
      rankCounts[e.rank]++;
    } else {
      rankCounts['B']++;
    }
  });

  const rankChartData = Object.entries(rankCounts).map(([rank, count]) => ({
    rank,
    count,
    color:
      rank === 'A+'
        ? '#34d399'
        : rank === 'A'
        ? '#10b981'
        : rank === 'B+'
        ? '#6366f1'
        : rank === 'B'
        ? '#38bdf8'
        : rank === 'C'
        ? '#fbbf24'
        : rank === 'D'
        ? '#fb923c'
        : '#f43f5e',
  }));

  // Team Summaries
  const teamSummaries = state.teams.map((team) => {
    const teamEvals = periodEvals.filter((e) => e.teamId === team.id);
    const teamFinalScores = teamEvals.map((e) => e.finalKpi ?? e.systemKpi ?? 0).filter((s) => s > 0);
    const avgScore =
      teamFinalScores.length > 0
        ? (teamFinalScores.reduce((a, b) => a + b, 0) / teamFinalScores.length).toFixed(2)
        : 'N/A';

    const systemScores = teamEvals.map((e) => e.systemKpi ?? 0).filter((s) => s > 0);
    const avgSystem =
      systemScores.length > 0
        ? (systemScores.reduce((a, b) => a + b, 0) / systemScores.length).toFixed(2)
        : 'N/A';

    const leaderDone = teamEvals.filter(
      (e) => e.status !== 'SYSTEM_EVALUATED' && e.status !== 'PENDING_SYSTEM'
    ).length;
    const isCompleted = leaderDone === teamEvals.length && teamEvals.length > 0;

    return {
      team,
      memberCount: teamEvals.length,
      avgScore,
      avgSystem,
      leaderDone,
      totalCount: teamEvals.length,
      isCompleted,
    };
  });

  // Smart Attention Alerts
  const attentionItems: {
    id: string;
    memberId: string;
    memberName: string;
    teamName: string;
    type: 'DROP' | 'LEADER_DELTA' | 'HEAD_DELTA' | 'LOW_CONFIDENCE' | 'CARRYOVER';
    title: string;
    description: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
  }[] = [];

  periodEvals.forEach((ev) => {
    if (ev.attentionFlags?.isKpiDropped) {
      attentionItems.push({
        id: `drop-${ev.id}`,
        memberId: ev.memberId,
        memberName: ev.memberName,
        teamName: ev.teamName,
        type: 'DROP',
        title: `KPI Dropped by -${ev.attentionFlags.dropAmount} pts`,
        description: `Performance decreased compared to previous period due to task carryover.`,
        severity: 'WARNING',
      });
    }

    if (ev.attentionFlags?.largeLeaderDelta) {
      const delta = (ev.leaderKpi ?? 0) - (ev.systemKpi ?? 0);
      attentionItems.push({
        id: `delta-lead-${ev.id}`,
        memberId: ev.memberId,
        memberName: ev.memberName,
        teamName: ev.teamName,
        type: 'LEADER_DELTA',
        title: `Large Leader Adjustment (${delta >= 0 ? '+' : ''}${delta.toFixed(2)})`,
        description: `Leader adjusted score: "${
          ev.criteriaEvaluations.find((c) => c.isLeaderAdjusted)?.leaderAdjustmentReason ||
          'Emergency weekend deployment recognition'
        }"`,
        severity: 'INFO',
      });
    }

    if (ev.attentionFlags?.largeHeadDelta) {
      const delta = (ev.headKpi ?? 0) - (ev.leaderKpi ?? 0);
      attentionItems.push({
        id: `delta-head-${ev.id}`,
        memberId: ev.memberId,
        memberName: ev.memberName,
        teamName: ev.teamName,
        type: 'HEAD_DELTA',
        title: `Head Calibration Offset (${delta >= 0 ? '+' : ''}${delta.toFixed(2)})`,
        description: `Cross-team rating curve calibrated by Department Head.`,
        severity: 'INFO',
      });
    }

    if (ev.confidence === 'LOW' || ev.confidence === 'REVIEW_REQUIRED') {
      attentionItems.push({
        id: `conf-${ev.id}`,
        memberId: ev.memberId,
        memberName: ev.memberName,
        teamName: ev.teamName,
        type: 'LOW_CONFIDENCE',
        title: `Evidence Anomaly (${ev.confidence})`,
        description: `Tickets lack estimated Story Points or due dates. Leader rubric required.`,
        severity: 'CRITICAL',
      });
    }
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full">
      {/* BENTO GRID HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-indigo-400 text-xs font-bold tracking-widest uppercase">
              {state.department.code} EXECUTIVE OVERVIEW
            </span>
            <span className="text-slate-600 font-mono text-xs">•</span>
            <span className="text-slate-400 text-xs font-mono">
              CYCLE {currentPeriod?.code} {currentPeriod?.isLocked ? '(LOCKED)' : '(ACTIVE)'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight mt-1">
            Department Performance Bento
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-bold font-mono tracking-wider text-slate-300">
              {state.jiraConfig.syncedIssuesCount} JIRA ARTIFACTS
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('calibration')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Scale className="w-4 h-4" />
            <span>Open Calibration</span>
          </button>
        </div>
      </div>

      {/* PRIMARY BENTO GRID (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BENTO TILE 1: Large Hero Score Module (2 Cols x 2 Rows) */}
        <div className="lg:col-span-2 lg:row-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="z-10 space-y-3">
            <span className="text-indigo-400 text-xs font-bold tracking-widest uppercase block">
              Aggregate Department KPI
            </span>
            <div className="flex items-baseline gap-4">
              <h2 className="text-6xl font-extralight text-white font-mono tracking-tight">
                {avgDepartmentKpi}
              </h2>
              <span className="text-xl text-slate-500 font-semibold font-mono">/ 10.0 pts</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Target Baseline: 8.50 pts • Department Benchmark Grade: <strong className="text-emerald-400">B+ (1.15x Bonus)</strong>
            </p>
          </div>

          <div className="z-10 grid grid-cols-3 gap-3 my-6 pt-4 border-t border-slate-800/80 font-mono">
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Engineers</span>
              <span className="text-xl font-bold text-slate-200">{evaluatedCount}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Finalized</span>
              <span className="text-xl font-bold text-indigo-400">{finalizedCount} / {evaluatedCount}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">High Confidence</span>
              <span className="text-xl font-bold text-emerald-400">{highConfidenceCount}</span>
            </div>
          </div>

          <div className="z-10 flex flex-wrap gap-2.5 mt-auto">
            <button
              type="button"
              onClick={() => onNavigate('system-eval')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>RUN PIPELINE</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('kpi-simulation')}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-5 py-2.5 rounded-2xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>SIMULATE V2</span>
            </button>
          </div>

          {/* Atmospheric Glow */}
          <div className="absolute -right-12 -top-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* BENTO TILE 2: Review Stage Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Review Pipeline
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold text-white font-mono">
              {leaderReviewedCount} / {evaluatedCount}
            </h3>
            <p className="text-slate-400 text-xs mt-1">Leader appraisals complete</p>
          </div>
          <div className="mt-auto pt-2">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${evaluatedCount > 0 ? (leaderReviewedCount / evaluatedCount) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
              <span>LEADERS: {leaderReviewedCount}</span>
              <span>HEAD: {headReviewedCount}</span>
            </div>
          </div>
        </div>

        {/* BENTO TILE 3: Data Quality & Evidence Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Evidence Health
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold text-emerald-400 font-mono">
              {((highConfidenceCount / (evaluatedCount || 1)) * 100).toFixed(1)}%
            </h3>
            <p className="text-slate-400 text-xs mt-1">High confidence telemetry</p>
          </div>
          <div className="mt-auto">
            <button
              type="button"
              onClick={() => onNavigate('data-quality')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer font-mono"
            >
              <span>{lowConfidenceEvals.length} Anomaly Alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* BENTO TILE 4: Rank Distribution Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block">
                Rank Bell Curve Distribution
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Bonus Tier Grading</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('rank-scheme')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-bold cursor-pointer"
            >
              Scheme Config →
            </button>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
                <XAxis dataKey="rank" stroke={isLight ? '#94a3b8' : '#64748b'} tick={{ fill: isLight ? '#475569' : '#94a3b8', fontSize: 11 }} />
                <YAxis stroke={isLight ? '#94a3b8' : '#64748b'} tick={{ fill: isLight ? '#475569' : '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#0f172a',
                    borderColor: isLight ? '#cbd5e1' : '#334155',
                    borderRadius: '16px',
                    color: isLight ? '#0f172a' : '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxShadow: isLight ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  cursor={{ fill: isLight ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {rankChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BENTO TILE 5: Finalization & Snapshot Protocol Banner (2 Cols) */}
        <div className="lg:col-span-2 bg-indigo-600 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-2xl shadow-indigo-500/20 relative overflow-hidden gap-4">
          <div className="z-10 space-y-1">
            <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider font-mono">
              GOVERNANCE PROTOCOL
            </span>
            <h3 className="text-xl font-extrabold text-white">
              {currentPeriod?.isLocked ? 'Cycle Locked & Immutable' : 'Finalize & Lock Period Cycle'}
            </h3>
            <p className="text-indigo-100/80 text-xs max-w-sm">
              {currentPeriod?.isLocked
                ? 'Official records are frozen in an immutable snapshot. Protected from Jira changes.'
                : 'Execute final calibration curve, calculate bonuses, and freeze historical snapshot.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('periods')}
            className="z-10 bg-white hover:bg-indigo-50 text-indigo-900 font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            {currentPeriod?.isLocked ? 'View Snapshots' : 'Execute Lock'}
          </button>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* SECONDARY BENTO ROW: Team Squads & Smart Attention Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Squad Performance Bento Tiles (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                Functional Squads
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Domain Teams & Review Progress
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('teams')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-bold cursor-pointer"
            >
              Manage Teams →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            {teamSummaries.map((ts) => (
              <div
                key={ts.team.id}
                onClick={() => {
                  store.setSelectedTeam(ts.team.id);
                  onNavigate('team-analytics');
                }}
                className="p-4 bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800/60 rounded-lg text-[10px] font-bold">
                      {ts.team.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mt-1 font-sans">
                      {ts.team.name}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">{ts.memberCount} Staff</span>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-500 font-sans">Avg Score:</span>
                  <span className="text-base font-black text-indigo-400">{ts.avgScore} pts</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans">
                  <span>Lead: {ts.team.leaderName}</span>
                  <span className={ts.isCompleted ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {ts.leaderDone}/{ts.totalCount} Reviewed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Attention Bento Tile (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                Governance Alerts
              </span>
              <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-800/80 rounded-lg text-[10px] font-mono font-bold">
                {attentionItems.length} Flagged
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">Smart Anomaly Radar</h2>
            <p className="text-xs text-slate-500 mt-1">
              Auto-flagged score drops, large leader offsets, and confidence anomalies.
            </p>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
            {attentionItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  store.setSelectedMember(item.memberId);
                  onNavigate('my-performance');
                }}
                className="p-3 bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-2xl text-xs space-y-1 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-slate-200">{item.memberName}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                        : item.severity === 'WARNING'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                        : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
                <div className="font-semibold text-slate-300 text-[11px]">{item.title}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1">{item.description}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('leader-review')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-2xl text-xs font-bold font-mono transition-colors cursor-pointer text-center"
          >
            Review Discrepancies →
          </button>
        </div>
      </div>
    </div>
  );
};
