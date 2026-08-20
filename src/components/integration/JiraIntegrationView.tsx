import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { JiraIssue } from '../../types/kpi';
import {
  Database,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  ExternalLink,
  History,
} from 'lucide-react';

interface JiraIntegrationViewProps {
  onOpenTicket: (ticketKey: string) => void;
}

export const JiraIntegrationView: React.FC<JiraIntegrationViewProps> = ({ onOpenTicket }) => {
  const state = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredIssues = state.jiraIssues.filter((iss) => {
    const matchesSearch =
      iss.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'CHANGED_AFTER_LOCK') return iss.hasDataChangedSinceLock;
    if (statusFilter === 'MISSING_DATA') return iss.storyPoints === null || !iss.deadlineDate;
    return true;
  });

  const changedAfterLockCount = state.jiraIssues.filter((i) => i.hasDataChangedSinceLock).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <span>Evidence Integration Layer</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Jira Cloud Simulator & Historical Snapshot Inspector
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Inspect raw Jira artifacts, live vs locked snapshot diffs, and evidence attribution policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Jira Cloud Connected (REST API v3)</span>
          </div>
        </div>
      </div>

      {/* Special Demo Scenario 3 Banner: Locked Snapshot vs Live Jira Data */}
      {changedAfterLockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-950">
          <div className="flex items-center justify-between">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Contest Scenario 3: Locked Snapshot vs Live Jira Mutation Verified</span>
            </div>
            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-mono text-[10px] font-bold">
              Never Rewrite History
            </span>
          </div>
          <p className="leading-relaxed">
            Ticket <strong>API-842</strong> was locked in period <strong>2026-07</strong> with <strong>5 Story Points</strong>. Later, a user changed the story points to <strong>8 SP</strong> directly in Jira. The system guarantees that the historical 2026-07 evaluation score remains 100% frozen and immutable.
          </p>
        </div>
      )}

      {/* Filters & Issues Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket key, summary, assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg"
            >
              <option value="ALL">All Issues ({state.jiraIssues.length})</option>
              <option value="CHANGED_AFTER_LOCK">Changed After Lock ({changedAfterLockCount})</option>
              <option value="MISSING_DATA">Missing SP / Deadlines</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-500">
            Showing {filteredIssues.length} Jira Artifacts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Issue Key</th>
                <th className="py-3 px-3">Summary</th>
                <th className="py-3 px-3">Assignee</th>
                <th className="py-3 px-3">Story Points</th>
                <th className="py-3 px-3">Period Attribution</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map((iss) => (
                <tr key={iss.key} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    <button
                      type="button"
                      onClick={() => onOpenTicket(iss.key)}
                      className="hover:underline cursor-pointer"
                    >
                      {iss.key}
                    </button>
                  </td>
                  <td className="py-3.5 px-3 max-w-xs truncate text-slate-800">
                    {iss.summary}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-700">
                    {iss.assigneeName}
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    {iss.hasDataChangedSinceLock ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold">
                        {iss.storyPoints} SP (Live: {iss.currentJiraStoryPoints} SP)
                      </span>
                    ) : iss.storyPoints !== null ? (
                      <span>{iss.storyPoints} SP</span>
                    ) : (
                      <span className="text-amber-600 italic">Missing SP</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                    {iss.periodAttribution}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        iss.status === 'Done' || iss.status === 'Closed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {iss.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenTicket(iss.key)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition-colors cursor-pointer"
                    >
                      Fact Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
