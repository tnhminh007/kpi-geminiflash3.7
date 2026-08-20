import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import {
  Award,
  CheckCircle2,
  Lock,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CalibrationViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
  onOpenTicket: (ticketKey: string) => void;
}

export const CalibrationView: React.FC<CalibrationViewProps> = ({
  onNavigate,
}) => {
  const state = useStore();
  const currentPeriod = state.periods.find((p) => p.code === state.currentPeriodCode);
  const periodEvals = state.evaluations.filter((e) => e.periodId === state.currentPeriodCode);

  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calibration Drawer / Modal
  const [calibratingEvalId, setCalibratingEvalId] = useState<string | null>(null);
  const [tempHeadScore, setTempHeadScore] = useState<number>(0);
  const [tempHeadReason, setTempHeadReason] = useState<string>('');

  const activeEvalForCalib = periodEvals.find((e) => e.id === calibratingEvalId);
  const isLight = state.theme === 'light';

  // Filtered evaluations
  const filteredEvals = periodEvals.filter((ev) => {
    const matchesTeam = selectedTeamFilter === 'ALL' || ev.teamId === selectedTeamFilter;
    const matchesSearch =
      ev.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  // Calculate actual distribution
  const rankCounts: Record<string, number> = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 };
  periodEvals.forEach((e) => {
    if (e.rank && rankCounts[e.rank] !== undefined) {
      rankCounts[e.rank]++;
    } else {
      rankCounts['B']++;
    }
  });

  const chartData = Object.entries(rankCounts).map(([rank, count]) => {
    const targetPct =
      rank === 'A+' ? 15 : rank === 'A' ? 25 : rank === 'B+' ? 30 : rank === 'B' ? 20 : rank === 'C' ? 10 : 0;
    return {
      rank,
      actual: count,
      target: Math.round((targetPct / 100) * periodEvals.length),
    };
  });

  const handleStartCalibrate = (evId: string) => {
    const ev = periodEvals.find((e) => e.id === evId);
    if (!ev) return;
    setCalibratingEvalId(evId);
    setTempHeadScore(ev.headKpi ?? ev.leaderKpi ?? ev.systemKpi ?? 0);
    setTempHeadReason(ev.headComment || '');
  };

  const handleSaveCalibration = () => {
    if (!calibratingEvalId) return;
    if (!tempHeadReason.trim()) {
      alert('Department Head calibration requires a justification reason.');
      return;
    }
    store.calibrateDepartmentHead(calibratingEvalId, tempHeadScore, tempHeadReason);
    setCalibratingEvalId(null);
  };

  const handleFinalizeAll = () => {
    if (window.confirm(`Finalize all member evaluations for period ${state.currentPeriodCode}?`)) {
      store.finalizePeriodEvaluations(state.currentPeriodCode);
      alert('All evaluations successfully finalized!');
    }
  };

  const handleLockPeriod = () => {
    if (window.confirm(`LOCK period ${state.currentPeriodCode}? Once locked, historical snapshot data becomes immutable and cannot be altered by Jira changes.`)) {
      store.lockPeriod(state.currentPeriodCode);
      alert(`Period ${state.currentPeriodCode} is now LOCKED and IMMUTABLE.`);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest font-mono">
              DEPARTMENT HEAD CALIBRATION
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-xs font-mono">{currentPeriod?.name}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Cross-Team Calibration & Grade Distribution
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Balance rating curves across team leaders and enforce department-level consistency before final lock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!currentPeriod?.isLocked ? (
            <>
              <button
                type="button"
                onClick={handleFinalizeAll}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Finalize Evaluations</span>
              </button>

              <button
                type="button"
                onClick={handleLockPeriod}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
              >
                <Lock className="w-4 h-4" />
                <span>Lock Historical Period</span>
              </button>
            </>
          ) : (
            <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 rounded-2xl text-xs font-mono font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PERIOD LOCKED & IMMUTABLE</span>
            </div>
          )}
        </div>
      </div>

      {/* Distribution Curve Bento Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest block">
                DISTRIBUTION CURVE
              </span>
              <h2 className="text-sm font-bold text-white mt-0.5">Grade Spread & Quota Alignment</h2>
            </div>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e2e8f0' : '#1e293b'} />
                <XAxis dataKey="rank" tick={{ fontSize: 11, fill: isLight ? '#475569' : '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: isLight ? '#475569' : '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className={`text-xs p-3 rounded-2xl border shadow-xl font-mono ${
                          isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-950 text-white border-slate-800'
                        }`}>
                          <div className="font-bold text-indigo-500">{d.rank} Rank</div>
                          <div>Actual: {d.actual} staff</div>
                          <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>Target Quota: {d.target} staff</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="actual" fill="#6366f1" name="Actual" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" fill={isLight ? '#cbd5e1' : '#334155'} name="Target" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calibration Rules Bento Card */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest block">
              CALIBRATION PROTOCOL
            </span>
            <h2 className="text-sm font-bold text-white">Cross-Team Normalization</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ensure high performers in tough teams aren't penalized by harsher leader grading. Head calibration offsets score at the member level with audit logging.
            </p>
          </div>

          <div className="p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-2xl space-y-1 text-xs text-indigo-200 font-mono">
            <span className="font-bold block text-indigo-300">Contest Scenario 6 Demo:</span>
            <span className="text-[11px] text-indigo-200/80">
              Nguyen Thi Huong was calibrated from 9.20 to 8.70 to fit the department top 15% quota.
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Layer Evolution Matrix Bento Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Filters */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Squads ({state.teams.length})</option>
              {state.teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
                  {t.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search engineer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Showing {filteredEvals.length} of {periodEvals.length} evaluations
          </span>
        </div>

        {/* Evolution Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <tr>
                <th className="py-3.5 px-5">Member</th>
                <th className="py-3.5 px-3">Squad</th>
                <th className="py-3.5 px-3">1. System Suggested</th>
                <th className="py-3.5 px-3">2. Leader Reviewed</th>
                <th className="py-3.5 px-3">3. Head Calibrated</th>
                <th className="py-3.5 px-3">4. Final Locked</th>
                <th className="py-3.5 px-3">Rank</th>
                <th className="py-3.5 px-3">Confidence</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEvals.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-4 px-5">
                    <button
                      type="button"
                      onClick={() => {
                        store.setSelectedMember(ev.memberId);
                        onNavigate('my-performance');
                      }}
                      className="font-bold text-slate-100 hover:text-indigo-400 text-left font-sans block text-sm cursor-pointer"
                    >
                      {ev.memberName}
                    </button>
                    <div className="text-[11px] text-slate-500 font-mono">{ev.memberTitle}</div>
                  </td>
                  <td className="py-4 px-3 text-slate-300 font-sans">{ev.teamName}</td>
                  <td className="py-4 px-3 text-slate-400">{ev.systemKpi?.toFixed(2)}</td>
                  <td className="py-4 px-3 text-indigo-400 font-semibold">{ev.leaderKpi?.toFixed(2)}</td>
                  <td className="py-4 px-3 text-purple-400 font-bold">
                    {ev.headKpi ? (
                      <span>{ev.headKpi.toFixed(2)}</span>
                    ) : (
                      <span className="text-slate-600 font-normal">--</span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-white font-bold text-sm">
                    {(ev.finalKpi ?? ev.headKpi ?? ev.leaderKpi ?? ev.systemKpi ?? 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-3">
                    <span className="px-2.5 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 rounded-xl font-bold text-xs">
                      {ev.rank || 'B'}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <ConfidenceBadge level={ev.confidence} showText={false} />
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleStartCalibrate(ev.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer font-mono"
                    >
                      Calibrate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Head Calibration Modal */}
      {calibratingEvalId && activeEvalForCalib && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-black animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono tracking-widest block">
                  CALIBRATION DIALOG
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Calibrate {activeEvalForCalib.memberName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCalibratingEvalId(null)}
                className="text-slate-400 hover:text-white text-xs font-mono font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block uppercase">Leader Score</span>
                  <span className="text-base font-bold text-indigo-400">{activeEvalForCalib.leaderKpi?.toFixed(2)} pts</span>
                </div>
                <div>
                  <label className="text-slate-300 text-[10px] font-bold block mb-1 uppercase">
                    New Head Score (0-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={tempHeadScore}
                    onChange={(e) => setTempHeadScore(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-2xl text-white font-bold font-mono focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-[10px] font-bold block mb-1 uppercase">
                  Mandatory Calibration Justification *
                </label>
                <textarea
                  rows={3}
                  value={tempHeadReason}
                  onChange={(e) => setTempHeadReason(e.target.value)}
                  placeholder="Explain cross-team quota or curve adjustment rationale..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-2xl text-slate-200 text-xs font-sans placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCalibratingEvalId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-2xl text-xs font-bold transition-colors cursor-pointer font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCalibration}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer font-mono"
              >
                Commit Calibration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
