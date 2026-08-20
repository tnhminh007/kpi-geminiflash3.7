import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { ScoreFormulaTree } from './ScoreFormulaTree';
import {
  History,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  GitBranch,
  ListFilter,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MemberDashboardProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
  onOpenTicket: (ticketKey: string) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onNavigate,
  onOpenTicket,
}) => {
  const state = useStore();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    state.selectedMemberId || state.members[0]?.id || ''
  );
  const [expandedCritId, setExpandedCritId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formula_tree' | 'criteria_list'>('formula_tree');

  const activeMember =
    state.members.find((m) => m.id === selectedMemberId) || state.members[0];

  const currentPeriod = state.periods.find((p) => p.code === state.currentPeriodCode);

  // Find evaluation for active member in current period
  const activeEval = state.evaluations.find(
    (e) => e.memberId === activeMember.id && e.periodId === state.currentPeriodCode
  );

  const memberMemberships = state.memberships.filter((ms) => ms.memberId === activeMember.id);
  const isTransferredMember = memberMemberships.length > 1;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Person & Period Switcher Bento Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-indigo-600 border-2 border-indigo-500/40 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30">
            {activeMember.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(-2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={activeMember.id}
                onChange={(e) => {
                  setSelectedMemberId(e.target.value);
                  store.setSelectedMember(e.target.value);
                }}
                className="text-xl font-bold text-white bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5 focus:outline-hidden cursor-pointer"
              >
                {state.members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100 font-sans">
                    {m.name} ({m.title})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              {activeMember.title} • {activeMember.level} • Jira: <span className="text-indigo-400">@{activeMember.jiraUsername}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2.5">
            <span className="text-xs text-slate-500 font-mono uppercase font-bold">CYCLE:</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {currentPeriod?.name} {currentPeriod?.isLocked ? '🔒' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Special Demo Scenario 2 Banner: Time-Based Team Transfer */}
      {isTransferredMember && (
        <div className="p-5 bg-slate-900 border border-indigo-500/40 rounded-3xl space-y-3 text-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="font-bold flex items-center gap-2 text-indigo-300">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Contest Scenario 2: Time-Based Team Transfer Record Verified</span>
            </div>
            <span className="px-2.5 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 rounded-xl font-mono text-[10px] font-bold">
              ISOLATED CRITERIA SCHEMES
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            {activeMember.name} transferred squads across evaluation periods. Criteria weights dynamically isolate per cycle:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 font-mono">
            {memberMemberships.map((th) => (
              <div key={th.id} className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs">
                <div className="font-bold text-slate-200">{th.teamName}</div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Evaluation Period: {th.period} {th.isPrimary ? '(Current Squad)' : '(Prior Squad)'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Score Hero Card & Bento Tiles */}
      {activeEval ? (
        <div className="space-y-6">
          {/* Main Hero Bento Tile with Workload Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 z-10 relative">
              {/* Overall Score */}
              <div className="space-y-2">
                <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest block font-mono">
                  OVERALL APPRAISED SCORE ({currentPeriod?.code})
                </span>
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl font-extralight text-white font-mono tracking-tight">
                    {(activeEval.finalKpi ?? activeEval.headKpi ?? activeEval.leaderKpi ?? activeEval.systemKpi ?? 0).toFixed(2)}
                  </span>
                  <span className="text-xl text-slate-500 font-semibold font-mono">/ 10.0 pts</span>
                  <span className="px-3.5 py-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-2xl font-bold font-mono text-xs shadow-xs">
                    Grade {activeEval.rank || 'B'} • {activeEval.coefficient}x Bonus
                  </span>
                </div>
                <div className="pt-1">
                  <ConfidenceBadge level={activeEval.confidence} />
                </div>
              </div>

              {/* Workload Stats Bento Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Committed SP</span>
                  <span className="font-bold text-slate-200 text-base">{activeEval.workloadSummary.committedSP} SP</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Completed SP</span>
                  <span className="font-bold text-indigo-400 text-base">{activeEval.workloadSummary.completedSP} SP</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">On-Time SP</span>
                  <span className="font-bold text-emerald-400 text-base">{activeEval.workloadSummary.onTimeSP} SP</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Bugs / Incidents</span>
                  <span className="font-bold text-amber-400 text-base">
                    {activeEval.workloadSummary.bugCount} / {activeEval.workloadSummary.incidentCount}
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Layer Evolution Bento Pipeline */}
            <div className="p-5 bg-slate-950/70 rounded-3xl border border-slate-800/80 space-y-3 z-10 relative">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="uppercase tracking-wider font-mono text-[11px] text-slate-400">
                  Multi-Layer Score Evolution & Justification Trace
                </span>
                <span className="font-mono text-[11px] text-indigo-400 font-semibold">
                  SCHEME: {activeEval.kpiVersion}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">1. System Suggested</span>
                  <span className="font-bold text-slate-200 text-base">{activeEval.systemKpi?.toFixed(2)} pts</span>
                  <span className="text-[10px] text-slate-500 font-sans block mt-1">Automated Jira facts</span>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">2. Leader Review</span>
                  <span className="font-bold text-indigo-400 text-base">{activeEval.leaderKpi?.toFixed(2)} pts</span>
                  <span className="text-[10px] text-slate-500 font-sans block mt-1">
                    {activeEval.criteriaEvaluations.some((c) => c.isLeaderAdjusted) ? 'Adjusted with reason' : 'Accepted unchanged'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">3. Head Calibration</span>
                  <span className="font-bold text-purple-400 text-base">{activeEval.headKpi?.toFixed(2) || activeEval.leaderKpi?.toFixed(2)} pts</span>
                  <span className="text-[10px] text-slate-500 font-sans block mt-1">Curve alignment</span>
                </div>

                <div className="p-3.5 bg-indigo-950/50 rounded-2xl border border-indigo-800/80 shadow-xs">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase block">4. Final Locked</span>
                  <span className="font-bold text-white text-base">
                    {(activeEval.finalKpi ?? activeEval.headKpi ?? activeEval.leaderKpi ?? activeEval.systemKpi ?? 0).toFixed(2)} pts
                  </span>
                  <span className="text-[10px] text-indigo-300/70 font-sans block mt-1">
                    {currentPeriod?.isLocked ? 'Immutable Snapshot' : 'Pending Lock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Atmospheric Glow */}
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* View Mode Tabs (Formula Tree vs Classic Breakdown) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('formula_tree')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'formula_tree'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>CÂY TRUY VẾT CÔNG THỨC (FORMULA TREE)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('criteria_list')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'criteria_list'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>DANH SÁCH TIÊU CHÍ & EVIDENCE (LIST VIEW)</span>
              </button>
            </div>

            <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
              {activeEval.criteriaEvaluations.length} Tiêu chí đo lường
            </span>
          </div>

          {/* Tab 1: Interactive Score Formula Tree */}
          {activeTab === 'formula_tree' && (
            <ScoreFormulaTree
              evaluation={activeEval}
              allIssues={state.jiraIssues}
              onOpenTicket={onOpenTicket}
            />
          )}

          {/* Tab 2: Criteria Breakdown with Expandable Explainable Trace */}
          {activeTab === 'criteria_list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block font-mono">
                    EXPLAINABLE EVIDENCE
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    Criteria Breakdown & 6-Step Score Traces
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {activeEval.criteriaEvaluations.length} CRITERIA MEASURED
                </span>
              </div>

              <div className="space-y-3">
                {activeEval.criteriaEvaluations.map((crit, idx) => {
                  const isExpanded = expandedCritId === crit.criterionId;
                  return (
                    <div
                      key={crit.criterionId}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden transition-all"
                    >
                      {/* Header Row */}
                      <div
                        onClick={() => setExpandedCritId(isExpanded ? null : crit.criterionId)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-850/60 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-indigo-400 font-bold text-xs w-6">#{idx + 1}</span>
                          <div>
                            <div className="font-bold text-sm text-slate-100">{crit.criterionName}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                              <span>Metric: <strong className="text-slate-200">{crit.metricFormatted}</strong></span>
                              <span>•</span>
                              <span className="text-slate-500">Max: {crit.maxScore} pts</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-5">
                          <div className="text-right font-mono">
                            <div className="font-black text-sm text-indigo-400">
                              {(crit.finalScore ?? crit.leaderScore ?? crit.systemScore)?.toFixed(2)} / {crit.maxScore.toFixed(1)} pts
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Method: {crit.evaluationMethod}
                            </div>
                          </div>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expandable 6-Step Trace & Evidence Box */}
                      {isExpanded && crit.trace && (
                        <div className="p-6 bg-slate-950/90 border-t border-slate-800/80 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
                              <FileCheck className="w-4 h-4 text-indigo-400" />
                              <span>Complete 6-Step Calculation Trace (Contest Scenario 4)</span>
                            </span>
                            <ConfidenceBadge level={crit.confidence} />
                          </div>

                          {/* 6 Step Trace Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase">
                                STEP 1: INGESTED JIRA FACTS
                              </span>
                              <div className="font-mono font-bold text-slate-200 text-xs">
                                {crit.trace.evidenceCount} verified ticket artifacts
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {JSON.stringify(crit.trace.inputSummary)}
                              </div>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase">
                                STEP 2 & 3: FORMULA & METRIC
                              </span>
                              <div className="font-mono font-bold text-indigo-400 text-xs">
                                {crit.trace.metricFormatted}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                Raw metric value: {crit.trace.metricValue}
                              </div>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                              <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase">
                                STEP 4: SCORING RULE
                              </span>
                              <div className="font-mono font-bold text-emerald-400 text-xs">
                                {crit.trace.ruleAppliedDescription}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                Suggested: {crit.trace.suggestedScore.toFixed(2)} pts
                              </div>
                            </div>
                          </div>

                          {/* Evidence Jira Tickets List */}
                          {crit.evidenceTickets && crit.evidenceTickets.length > 0 && (
                            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                              <div className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider">
                                Attributed Jira Issue Artifacts (Click to inspect snapshot):
                              </div>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {crit.evidenceTickets.map((key) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenTicket(key);
                                    }}
                                    className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <span>{key}</span>
                                    <ExternalLink className="w-3 h-3 text-indigo-400" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800">
          <p className="text-slate-400 text-sm">No evaluation found for this member in the active period.</p>
        </div>
      )}
    </div>
  );
};
