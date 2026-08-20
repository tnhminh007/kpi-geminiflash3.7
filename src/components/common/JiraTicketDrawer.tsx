import React from 'react';
import { JiraIssue } from '../../types/kpi';
import { X, Calendar, AlertTriangle, CheckCircle2, History } from 'lucide-react';

interface JiraTicketDrawerProps {
  issue: JiraIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onMutateSpForDemo?: (key: string, newSp: number) => void;
}

export const JiraTicketDrawer: React.FC<JiraTicketDrawerProps> = ({
  issue,
  isOpen,
  onClose,
  onMutateSpForDemo,
}) => {
  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative w-full max-w-lg bg-slate-900 shadow-2xl shadow-black border-l border-slate-800 z-10 flex flex-col h-full overflow-y-auto text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-950/80 text-indigo-300 font-mono text-xs font-bold rounded-xl border border-indigo-800/80">
              {issue.key}
            </span>
            <span
              className={`px-3 py-1 text-xs font-bold font-mono rounded-xl border ${
                issue.status === 'Done' || issue.status === 'Closed'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
              }`}
            >
              {issue.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Title & Summary */}
          <div className="p-4 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
              TELEMETRY ARTIFACT SUMMARY
            </div>
            <h3 className="text-base font-bold text-white leading-snug">
              {issue.summary}
            </h3>
          </div>

          {/* Special Demo: Locked Snapshot vs Live Jira Data Difference Banner */}
          {issue.hasDataChangedSinceLock && (
            <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-3xl space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Historical Snapshot Integrity Verified</span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                This Jira issue was modified in Jira after evaluation period lock.
                The system strictly preserves the immutable snapshot facts used at calculation time.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono">
                <div className="bg-slate-900 p-3 rounded-2xl border border-amber-800/80">
                  <div className="text-[10px] text-slate-400 font-sans">Evaluation Snapshot</div>
                  <div className="text-sm font-bold text-white">{issue.storyPoints} SP</div>
                  <div className="text-[10px] text-emerald-400 font-sans flex items-center gap-1 mt-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Locked Score
                  </div>
                </div>
                <div className="bg-slate-900 p-3 rounded-2xl border border-amber-800/80">
                  <div className="text-[10px] text-slate-400 font-sans">Current Jira Live</div>
                  <div className="text-sm font-bold text-amber-400">{issue.currentJiraStoryPoints} SP</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-1">
                    Live Modified
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Assignee</span>
              <span className="font-bold text-slate-200">{issue.assigneeName}</span>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Story Points</span>
              <span className="font-bold text-indigo-400">
                {issue.storyPoints !== null ? `${issue.storyPoints} SP` : (
                  <span className="text-amber-400 italic">Not Estimated (Missing)</span>
                )}
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Sprint</span>
              <span className="font-semibold text-slate-300">{issue.sprint}</span>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Type / Priority</span>
              <span className="font-semibold text-slate-300">{issue.issueType} • {issue.priority}</span>
            </div>
          </div>

          {/* Timeline & Timestamps */}
          <div className="p-5 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-slate-200 flex items-center gap-2 font-mono">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Timestamps & Delivery Lifecycle</span>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-500 font-sans">Created Date</span>
                <span className="text-slate-300">{issue.createdDate}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-500 font-sans">Target Deadline</span>
                <span className={issue.deadlineDate ? 'text-slate-300' : 'text-amber-400 font-sans italic'}>
                  {issue.deadlineDate || 'Missing Deadline'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-500 font-sans">Resolved Date</span>
                <span className={issue.resolvedDate ? 'text-slate-300' : 'text-slate-500'}>
                  {issue.resolvedDate || 'In Progress'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 font-sans">Attribution Period</span>
                <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 rounded-lg font-bold text-[11px]">
                  {issue.periodAttribution}
                </span>
              </div>
            </div>
          </div>

          {/* Attribution Reason */}
          <div className="text-xs bg-indigo-950/30 p-4 rounded-2xl border border-indigo-800/60 text-indigo-200 leading-relaxed font-sans">
            <span className="font-bold font-mono block mb-1 text-indigo-400">PERIOD ATTRIBUTION POLICY:</span>
            {issue.attributionReason}
          </div>

          {/* Interactive Demo Action: Mutate Jira SP */}
          {onMutateSpForDemo && !issue.hasDataChangedSinceLock && (
            <div className="p-4 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 font-mono">
                <History className="w-4 h-4 text-purple-400" />
                <span>Simulate Jira Live Modification</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Demonstrates how changing live Jira data impacts active evaluation cycles vs preserved locked historical snapshots.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onMutateSpForDemo(issue.key, (issue.storyPoints || 3) + 3)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer font-mono"
                >
                  Simulate SP Edit in Jira ({(issue.storyPoints || 3) + 3} SP)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>SOURCE: JIRA TELEMETRY CONNECTOR</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-2xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
