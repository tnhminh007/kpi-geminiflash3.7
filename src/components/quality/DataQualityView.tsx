import React from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { ShieldAlert, AlertTriangle, CheckCircle2, Database, ArrowRight, FileCheck, HelpCircle } from 'lucide-react';

interface DataQualityViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
  onOpenTicket: (ticketKey: string) => void;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({
  onNavigate,
  onOpenTicket,
}) => {
  const state = useStore();
  const periodEvals = state.evaluations.filter((e) => e.periodId === state.currentPeriodCode);

  const lowConfidenceEvals = periodEvals.filter(
    (e) => e.confidence === 'LOW' || e.confidence === 'REVIEW_REQUIRED' || e.confidence === 'MEDIUM'
  );

  const missingSpIssues = state.jiraIssues.filter((i) => i.storyPoints === null);
  const missingDeadlineIssues = state.jiraIssues.filter((i) => !i.deadlineDate);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
            <span>Evidence Health & Quality Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Data Quality & Confidence Diagnostics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ensure engineers are never unfairly penalized with zero points when raw Jira evidence is incomplete.
          </p>
        </div>
      </div>

      {/* Philosophy Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-xs text-blue-950">
        <div className="font-bold flex items-center gap-1.5 text-sm">
          <HelpCircle className="w-4 h-4 text-blue-700" />
          <span>Core Governance Policy: Missing Evidence ≠ Zero Score</span>
        </div>
        <p className="leading-relaxed">
          If a Jira ticket lacks a target deadline or story point estimate, the evaluation engine flags the evaluation with <strong>LOW / MEDIUM Confidence</strong> and recommends manual leader review with fallback baseline scoring, rather than unfairly failing the engineer.
        </p>
      </div>

      {/* Quality Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Overall Data Health</div>
          <div className="text-3xl font-bold text-emerald-600 font-mono mt-1">94.8%</div>
          <div className="text-[11px] text-emerald-700 mt-1">Verified Jira Signals</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Low Confidence Cases</div>
          <div className="text-3xl font-bold text-amber-600 font-mono mt-1">
            {lowConfidenceEvals.length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">Flagged for Leader Check</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Tickets Missing SP</div>
          <div className="text-3xl font-bold text-slate-800 font-mono mt-1">
            {missingSpIssues.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Unestimated Tasks</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Tickets Missing Deadline</div>
          <div className="text-3xl font-bold text-slate-800 font-mono mt-1">
            {missingDeadlineIssues.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Unscheduled Tasks</div>
        </div>
      </div>

      {/* Flagged Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Flagged Evidence Audits</h2>
          <span className="text-xs font-mono text-slate-500">{lowConfidenceEvals.length} Members</span>
        </div>

        <div className="divide-y divide-slate-100">
          {lowConfidenceEvals.map((ev) => (
            <div key={ev.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{ev.memberName}</span>
                  <span className="text-xs text-slate-400">({ev.teamName})</span>
                  <ConfidenceBadge level={ev.confidence} />
                </div>
                <div className="text-xs text-amber-800 font-medium">
                  Flag: {ev.dataQualityFlags.join('; ') || 'Jira ticket metadata incomplete'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  store.setSelectedMember(ev.memberId);
                  onNavigate('my-performance');
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Inspect Trace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
