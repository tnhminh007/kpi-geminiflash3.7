import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { CriterionEvaluation } from '../../types/kpi';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { ScoreExplanationTrace } from '../common/ScoreExplanationTrace';
import {
  CheckSquare,
  CheckCircle2,
  Search,
  ChevronRight,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface LeaderReviewViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
  onOpenTicket: (ticketKey: string) => void;
}

export const LeaderReviewView: React.FC<LeaderReviewViewProps> = ({
  onNavigate,
  onOpenTicket,
}) => {
  const state = useStore();
  const periodEvals = state.evaluations.filter((e) => e.periodId === state.currentPeriodCode);

  const [selectedEvalId, setSelectedEvalId] = useState<string>(
    state.selectedMemberId
      ? periodEvals.find((e) => e.memberId === state.selectedMemberId)?.id || periodEvals[0]?.id
      : periodEvals[0]?.id
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'ALL' | 'PENDING' | 'LOW_CONFIDENCE' | 'ADJUSTED'>('ALL');

  // Active Evaluation
  const activeEval = periodEvals.find((e) => e.id === selectedEvalId) || periodEvals[0];

  // Active Criterion for inspector panel
  const [selectedCritId, setSelectedCritId] = useState<string>(
    activeEval?.criteriaEvaluations[0]?.criterionId || ''
  );

  const activeCrit =
    activeEval?.criteriaEvaluations.find((c) => c.criterionId === selectedCritId) ||
    activeEval?.criteriaEvaluations[0];

  // Adjustment Modal/Inline Form State
  const [adjustingCritId, setAdjustingCritId] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState<number>(0);
  const [tempReason, setTempReason] = useState<string>('');

  // Filter queue
  const filteredQueue = periodEvals.filter((ev) => {
    const matchesSearch =
      ev.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.teamName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterState === 'PENDING') return ev.status === 'SYSTEM_EVALUATED';
    if (filterState === 'LOW_CONFIDENCE') return ev.confidence === 'LOW' || ev.confidence === 'REVIEW_REQUIRED';
    if (filterState === 'ADJUSTED') return ev.criteriaEvaluations.some((c) => c.isLeaderAdjusted);
    return true;
  });

  const handleStartAdjust = (crit: CriterionEvaluation) => {
    setAdjustingCritId(crit.criterionId);
    setTempScore(crit.leaderScore ?? crit.systemScore ?? 0);
    setTempReason(crit.leaderAdjustmentReason || '');
  };

  const handleSaveAdjustment = () => {
    if (!adjustingCritId || !activeEval) return;
    if (!tempReason.trim()) {
      alert('A justification reason is required when adjusting scores.');
      return;
    }
    store.updateLeaderReview(activeEval.id, adjustingCritId, tempScore, tempReason);
    setAdjustingCritId(null);
  };

  const handleAcceptAllUnchanged = () => {
    if (!activeEval) return;
    store.acceptAllUnchangedLeader(activeEval.id);
  };

  const handleBatchAcceptTeam = () => {
    if (!activeEval) return;
    if (window.confirm(`Accept system suggested scores for all members in ${activeEval.teamName}?`)) {
      store.batchAcceptAllForTeam(activeEval.teamId, state.currentPeriodCode);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Toolbar */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-600/30">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">
              EVALUATION PIPELINE
            </div>
            <h1 className="text-lg font-extrabold text-white leading-none mt-0.5">
              Team Leader Review & Calibration
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBatchAcceptTeam}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-2xl text-xs font-bold transition-colors cursor-pointer font-mono"
          >
            Batch Approve Team
          </button>

          <button
            type="button"
            onClick={handleAcceptAllUnchanged}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-colors cursor-pointer font-mono"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept Member Unchanged</span>
          </button>
        </div>
      </div>

      {/* 3-Panel Review Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT PANEL: Member Review Queue (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
          {/* Search & Filter */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search engineer or squad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto text-[11px] font-mono">
              {(['ALL', 'PENDING', 'LOW_CONFIDENCE', 'ADJUSTED'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterState(f)}
                  className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer text-[10px] ${
                    filterState === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {f === 'LOW_CONFIDENCE' ? 'Low Conf.' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredQueue.map((ev) => {
              const isSelected = ev.id === activeEval?.id;
              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEvalId(ev.id);
                    setSelectedCritId(ev.criteriaEvaluations[0]?.criterionId || '');
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-100">{ev.memberName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{ev.teamName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-indigo-400">
                        {ev.leaderKpi?.toFixed(2) ?? ev.systemKpi?.toFixed(2)} pts
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Sys: {ev.systemKpi?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                    <ConfidenceBadge level={ev.confidence} showText={false} />
                    <span
                      className={`px-2 py-0.5 rounded-lg font-bold ${
                        ev.status === 'LEADER_REVIEWED' || ev.status === 'HEAD_CALIBRATED'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                      }`}
                    >
                      {ev.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER PANEL: Member Review & Criteria Table (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border-r border-slate-800 flex flex-col h-full overflow-y-auto">
          {activeEval ? (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Member Summary Bento Header */}
              <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        store.setSelectedMember(activeEval.memberId);
                        onNavigate('my-performance');
                      }}
                      className="text-base font-bold text-white hover:text-indigo-400 text-left transition-colors flex items-center gap-2 cursor-pointer group"
                      title="Mở xem Cây truy vết công thức đầy đủ của nhân sự"
                    >
                      <span>{activeEval.memberName}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                    </button>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {activeEval.memberTitle} • {activeEval.teamName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        store.setSelectedMember(activeEval.memberId);
                        onNavigate('my-performance');
                      }}
                      className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-[11px] font-mono font-bold border border-indigo-500/40 transition-all cursor-pointer"
                    >
                      Formula Tree
                    </button>
                    <span className="px-3 py-1 bg-indigo-950/80 text-indigo-300 text-xs font-mono font-bold rounded-xl border border-indigo-800/80">
                      {activeEval.kpiVersion}
                    </span>
                  </div>
                </div>

                {/* Score Comparison Banner */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono pt-3 border-t border-slate-800">
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">System Suggested</span>
                    <span className="font-bold text-slate-200 text-sm mt-0.5 block">{activeEval.systemKpi?.toFixed(2)} pts</span>
                  </div>
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">Leader Score</span>
                    <span className="font-bold text-indigo-400 text-sm mt-0.5 block">{activeEval.leaderKpi?.toFixed(2)} pts</span>
                  </div>
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block">Delta</span>
                    <span
                      className={`font-bold text-sm mt-0.5 block ${
                        (activeEval.leaderKpi ?? 0) - (activeEval.systemKpi ?? 0) >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {((activeEval.leaderKpi ?? 0) - (activeEval.systemKpi ?? 0) >= 0 ? '+' : '')}
                      {((activeEval.leaderKpi ?? 0) - (activeEval.systemKpi ?? 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Criteria Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                    Criteria Breakdown & Adjustments
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Click row to inspect trace</span>
                </div>

                <div className="space-y-2.5">
                  {activeEval.criteriaEvaluations.map((crit) => {
                    const isSelected = crit.criterionId === selectedCritId;
                    const delta = (crit.leaderScore ?? crit.systemScore ?? 0) - (crit.systemScore ?? 0);
                    return (
                      <div
                        key={crit.criterionId}
                        onClick={() => setSelectedCritId(crit.criterionId)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-slate-100">{crit.criterionName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                              Metric: <span className="text-slate-200">{crit.metricFormatted}</span>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <div className="font-bold text-xs text-indigo-400">
                              {(crit.leaderScore ?? crit.systemScore)?.toFixed(2)} / {crit.maxScore} pts
                            </div>
                            {crit.isLeaderAdjusted && (
                              <span className="text-[10px] text-purple-400 font-semibold">
                                (Adjusted {delta >= 0 ? '+' : ''}{delta.toFixed(2)})
                              </span>
                            )}
                          </div>
                        </div>

                        {crit.isLeaderAdjusted && crit.leaderAdjustmentReason && (
                          <div className="mt-2.5 p-2.5 bg-purple-950/40 rounded-xl border border-purple-800/60 text-[11px] text-purple-200">
                            <span className="font-bold font-mono">REASON:</span> {crit.leaderAdjustmentReason}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                          <ConfidenceBadge level={crit.confidence} />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartAdjust(crit);
                            }}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer font-mono"
                          >
                            {crit.isLeaderAdjusted ? 'Edit Adjustment' : 'Adjust Score'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Adjustment Modal / Form */}
              {adjustingCritId && (
                <div className="p-5 bg-slate-900 border border-purple-500/50 rounded-3xl space-y-3.5 animate-in fade-in">
                  <div className="flex justify-between items-center text-xs font-bold text-purple-300 font-mono">
                    <span>CRITERION SCORE ADJUSTMENT</span>
                    <button
                      type="button"
                      onClick={() => setAdjustingCritId(null)}
                      className="text-purple-400 hover:text-purple-300 font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1 font-mono">
                        New Score Point
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max={activeCrit?.maxScore || 10}
                        value={tempScore}
                        onChange={(e) => setTempScore(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono font-bold text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1 font-mono">
                        Max Allowed
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${activeCrit?.maxScore || 10} pts`}
                        className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl font-mono text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1 font-mono">
                      Mandatory Justification Reason *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explain why this score was adjusted (e.g. Recognized emergency weekend fix)..."
                      value={tempReason}
                      onChange={(e) => setTempReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAdjustment}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer font-mono"
                  >
                    Save & Record In Audit Trail
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              No member evaluation selected.
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Evidence Inspector & Jira Facts (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 flex flex-col h-full overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="font-bold text-xs text-slate-200 uppercase tracking-widest flex items-center gap-2 font-mono">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Evidence Inspector</span>
            </div>
            <span className="text-xs text-indigo-400 font-mono font-bold">
              {activeCrit?.criterionCode}
            </span>
          </div>

          {activeCrit ? (
            <div className="space-y-4">
              <ScoreExplanationTrace
                trace={activeCrit.trace}
                criterionName={activeCrit.criterionName}
                onViewTicket={onOpenTicket}
                compact={true}
              />

              {/* Verified Jira Tickets List */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                <div className="font-bold text-slate-200 flex justify-between font-mono">
                  <span>Linked Jira Artifacts</span>
                  <span className="text-indigo-400 font-mono">
                    {activeCrit.evidenceTickets.length} Tickets
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {Array.from(new Set(activeCrit.evidenceTickets)).map((key, idx) => (
                    <button
                      key={`${key}-${idx}`}
                      type="button"
                      onClick={() => onOpenTicket(key)}
                      className="w-full text-left p-2.5 bg-slate-900 hover:bg-indigo-950/50 hover:border-indigo-500/50 rounded-xl border border-slate-800 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-mono font-bold text-indigo-400 text-[11px]">{key}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              Select a criterion to view evidence trace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
