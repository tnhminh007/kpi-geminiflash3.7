import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sliders,
} from 'lucide-react';

interface TeamDashboardProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
  onOpenTicket: (ticketKey: string) => void;
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({
  onNavigate,
}) => {
  const state = useStore();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    state.selectedTeamId || state.teams[0]?.id || ''
  );

  const activeTeam = state.teams.find((t) => t.id === selectedTeamId) || state.teams[0];
  const currentPeriod = state.periods.find((p) => p.code === state.currentPeriodCode);

  const teamEvals = state.evaluations.filter(
    (e) => e.teamId === activeTeam.id && e.periodId === state.currentPeriodCode
  );

  const validScores = teamEvals
    .map((e) => e.finalKpi ?? e.leaderKpi ?? e.systemKpi ?? 0)
    .filter((s) => s > 0);

  const avgTeamScore =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
      : '0.00';

  const activeTpl =
    state.kpiTemplates.find((t) => t.teamId === activeTeam.id && t.status === 'PUBLISHED') ||
    state.kpiTemplates.find((t) => t.teamId === activeTeam.id) ||
    state.kpiTemplates[0];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Bento Tile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-indigo-400 text-xs font-bold tracking-widest uppercase font-mono">
              SQUAD ANALYTICS
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-xs font-mono">
              CYCLE {currentPeriod?.code} {currentPeriod?.isLocked ? '🔒' : ''}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <select
              value={activeTeam.id}
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                store.setSelectedTeam(e.target.value);
              }}
              className="text-2xl font-bold text-white bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5 focus:outline-hidden cursor-pointer"
            >
              {state.teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100 font-sans">
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {activeTeam.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('leader-review')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5 font-mono"
          >
            <span>Review Squad Evals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Squad Telemetry Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Squad Average Score
          </span>
          <div className="text-3xl font-bold text-white font-mono mt-2">
            {avgTeamScore} <span className="text-xs text-slate-500 font-normal">/ 10.0 pts</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium font-mono mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target Benchmark: 8.50 pts</span>
          </div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Active Scheme
          </span>
          <div className="text-base font-bold text-indigo-400 truncate mt-2 font-mono">
            {activeTpl?.name || 'Default Template'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Version: {activeTpl?.version || 'v1.0'} ({activeTpl?.criteria.length} Criteria)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Review Status
          </span>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {teamEvals.filter((e) => e.status === 'LEADER_REVIEWED' || e.status === 'HEAD_CALIBRATED' || e.status === 'FINALIZED' || e.status === 'LOCKED').length} / {teamEvals.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Lead: <strong className="text-slate-200">{activeTeam.leaderName}</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
            Total Workload Delivered
          </span>
          <div className="text-3xl font-bold text-indigo-400 font-mono mt-2">
            {teamEvals.reduce((acc, e) => acc + (e.workloadSummary.completedSP || 0), 0)}
            <span className="text-xs text-slate-500 font-normal font-sans ml-1">SP</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium font-mono mt-2">
            92.4% On-time Completion
          </div>
        </div>
      </div>

      {/* Member Roster Bento Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Member Performance Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Individual scores, evidence confidence, and review status.</p>
          </div>
          <span className="text-xs font-mono text-indigo-400 font-bold px-2.5 py-1 bg-indigo-950/80 border border-indigo-800/80 rounded-xl">
            {teamEvals.length} MEMBERS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <tr>
                <th className="py-3.5 px-5">Member</th>
                <th className="py-3.5 px-3">Role / Level</th>
                <th className="py-3.5 px-3">System Score</th>
                <th className="py-3.5 px-3">Leader Score</th>
                <th className="py-3.5 px-3">Final Score</th>
                <th className="py-3.5 px-3">Rank</th>
                <th className="py-3.5 px-3">Confidence</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {teamEvals.map((ev) => {
                const memberObj = state.members.find((m) => m.id === ev.memberId);
                return (
                  <tr key={ev.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => {
                          store.setSelectedMember(ev.memberId);
                          onNavigate('my-performance');
                        }}
                        className="font-bold text-slate-100 hover:text-indigo-400 text-left cursor-pointer font-sans block text-sm"
                      >
                        {ev.memberName}
                      </button>
                      <div className="text-[11px] text-slate-500 font-mono">@{memberObj?.jiraUsername || 'user'}</div>
                    </td>
                    <td className="py-4 px-3 text-slate-300 font-sans">
                      <div>{ev.memberTitle}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{memberObj?.level || 'Engineer'}</div>
                    </td>
                    <td className="py-4 px-3 text-slate-400">
                      {ev.systemKpi?.toFixed(2)} pts
                    </td>
                    <td className="py-4 px-3 font-semibold text-indigo-400">
                      {ev.leaderKpi?.toFixed(2)} pts
                    </td>
                    <td className="py-4 px-3 font-bold text-sm text-white">
                      {(ev.finalKpi ?? ev.headKpi ?? ev.leaderKpi ?? ev.systemKpi ?? 0).toFixed(2)} pts
                    </td>
                    <td className="py-4 px-3">
                      <span className="px-2.5 py-1 rounded-xl font-bold text-xs bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
                        {ev.rank || 'B'}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <ConfidenceBadge level={ev.confidence} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          store.setSelectedMember(ev.memberId);
                          onNavigate('my-performance');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-semibold rounded-xl text-xs transition-all cursor-pointer font-mono"
                      >
                        Trace →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
