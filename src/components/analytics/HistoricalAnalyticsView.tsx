import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { History, TrendingUp, Calendar, ArrowRight, Award, Layers } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface HistoricalAnalyticsViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const HistoricalAnalyticsView: React.FC<HistoricalAnalyticsViewProps> = ({ onNavigate }) => {
  const state = useStore();
  const [aggregationTimeframe, setAggregationTimeframe] = useState<'MONTH' | 'QUARTER' | 'HALF_YEAR' | 'YEAR'>('QUARTER');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(state.members[0]?.id || '');

  const activeMember = state.members.find((m) => m.id === selectedMemberId) || state.members[0];

  // Multi-period Trend Data for Department
  const periodTrends = state.periods.map((p) => {
    const pEvals = state.evaluations.filter((e) => e.periodId === p.code);
    const validScores = pEvals.map((e) => e.finalKpi ?? e.leaderKpi ?? e.systemKpi ?? 0).filter((s) => s > 0);
    const avg = validScores.length > 0 ? parseFloat((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)) : 0;

    return {
      period: p.code,
      name: p.name,
      avgScore: avg,
      evaluatedCount: pEvals.length,
    };
  });

  // Member-specific historical scores
  const memberEvaluations = state.evaluations
    .filter((e) => e.memberId === activeMember.id)
    .sort((a, b) => a.periodId.localeCompare(b.periodId));

  const memberTrendData = memberEvaluations.map((e) => ({
    period: e.periodId,
    systemScore: e.systemKpi ?? 0,
    finalScore: e.finalKpi ?? e.headKpi ?? e.leaderKpi ?? e.systemKpi ?? 0,
    rank: e.rank || 'B',
  }));

  const isLight = state.theme === 'light';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest font-mono">
            <span>Historical Intelligence</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Multi-Period Historical Performance & Trends
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Aggregate month-over-month, quarterly (Q3 2026), and annual performance evolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold font-mono">
            {(['MONTH', 'QUARTER', 'HALF_YEAR', 'YEAR'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setAggregationTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  aggregationTimeframe === tf
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregate Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Department Performance Trajectory</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Historical average KPI progression across locked periods.</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={periodTrends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e2e8f0' : '#1e293b'} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: isLight ? '#475569' : '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[6, 10]} tick={{ fontSize: 10, fill: isLight ? '#475569' : '#94a3b8' }} axisLine={false} tickLine={false} />
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
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  name="Department Avg KPI"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quarter Aggregation Card */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-mono">
              Q3 2026 Rollup (Jul, Aug, Sep)
            </span>
            <div className="text-4xl font-extralight text-white font-mono tracking-tight">
              8.38
              <span className="text-xs text-slate-500 font-normal font-sans ml-1">/ 10 pts</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consolidated score covering <strong>3 of 3 months</strong> in Q3 2026. Includes 1 Locked month (July), 1 Finalized month (August), and 1 In-Review month (September).
            </p>
          </div>

          <div className="p-4 bg-indigo-950/60 border border-indigo-800/60 rounded-2xl text-xs text-indigo-300">
            <span className="font-bold block text-white mb-1">Audit Integrity Protected</span>
            Aggregations preserve historical lock immutability per month before calculating weighted rollups.
          </div>
        </div>
      </div>

      {/* Member Deep-Dive Trend */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Individual Engineer Historical Velocity</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Track individual engineer score evolution over time.</p>
          </div>

          <select
            value={activeMember.id}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="px-3.5 py-1.5 text-xs font-bold bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden"
          >
            {state.members.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.name} ({m.title})
              </option>
            ))}
          </select>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={memberTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e2e8f0' : '#1e293b'} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: isLight ? '#475569' : '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[5, 10]} tick={{ fontSize: 10, fill: isLight ? '#475569' : '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isLight ? '#ffffff' : '#0f172a',
                  borderColor: isLight ? '#cbd5e1' : '#334155',
                  borderRadius: '16px',
                  color: isLight ? '#0f172a' : '#f8fafc',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="systemScore"
                name="System Suggested"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="finalScore"
                name="Final Score"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
