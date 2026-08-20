import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { simulateKpiTemplateOnHistoricalData } from '../../services/kpiEngine';
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Sliders,
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

interface KpiSimulationViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const KpiSimulationView: React.FC<KpiSimulationViewProps> = ({ onNavigate }) => {
  const state = useStore();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    state.kpiTemplates.find((t) => t.status === 'DRAFT')?.id || state.kpiTemplates[0]?.id
  );
  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>('2026-08');
  const [isSimulated, setIsSimulated] = useState<boolean>(true);

  const selectedTemplate =
    state.kpiTemplates.find((t) => t.id === selectedTemplateId) || state.kpiTemplates[0];

  // Run simulation
  const simulationResults = selectedTemplate
    ? simulateKpiTemplateOnHistoricalData(
        selectedTemplate,
        selectedPeriodCode,
        state.jiraIssues,
        state.evaluations
      )
    : [];

  const positiveDeltas = simulationResults.filter((r) => r.delta > 0.05).length;
  const negativeDeltas = simulationResults.filter((r) => r.delta < -0.05).length;
  const neutralDeltas = simulationResults.filter((r) => Math.abs(r.delta) <= 0.05).length;

  const avgHistorical = simulationResults.length > 0
    ? (simulationResults.reduce((a, b) => a + b.historicalScore, 0) / simulationResults.length).toFixed(2)
    : '0.00';

  const avgSimulated = simulationResults.length > 0
    ? (simulationResults.reduce((a, b) => a + b.simulatedScore, 0) / simulationResults.length).toFixed(2)
    : '0.00';

  const avgDelta = (parseFloat(avgSimulated) - parseFloat(avgHistorical)).toFixed(2);

  const chartData = [
    { category: 'Score Increase (+)', count: positiveDeltas, fill: '#10b981' },
    { category: 'Unchanged (±0.05)', count: neutralDeltas, fill: '#64748b' },
    { category: 'Score Decrease (-)', count: negativeDeltas, fill: '#f43f5e' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <span>Governance & Sandbox Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            KPI Version Impact Simulation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Test and simulate candidate KPI rules against real historical Jira dataset to preview impact before roll-out.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('kpi-builder', { templateId: selectedTemplate.id })}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Edit in KPI Builder</span>
          </button>
        </div>
      </div>

      {/* Simulator Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Select Candidate KPI Template:
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
            >
              {state.kpiTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.version}) - [{t.status}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Historical Target Period:
            </label>
            <select
              value={selectedPeriodCode}
              onChange={(e) => setSelectedPeriodCode(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
            >
              {state.periods.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSimulated(true);
            alert(`Simulation re-calculated against ${state.jiraIssues.length} Jira tickets in ${selectedPeriodCode}!`);
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Execute Sandbox Simulation</span>
        </button>
      </div>

      {/* Aggregate Impact Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Historical Avg Score</div>
          <div className="text-2xl font-bold text-slate-800 font-mono mt-1">
            {avgHistorical} pts
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Original Evaluation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Simulated Avg Score</div>
          <div className="text-2xl font-bold text-blue-700 font-mono mt-1">
            {avgSimulated} pts
          </div>
          <div className="text-[11px] text-blue-600 mt-1">Under New Candidate Rules</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Average Score Shift</div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              parseFloat(avgDelta) >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {parseFloat(avgDelta) >= 0 ? '+' : ''}
            {avgDelta} pts
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Macro Variance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Members Impacted</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {simulationResults.length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            {positiveDeltas} Gain • {negativeDeltas} Drop
          </div>
        </div>
      </div>

      {/* Delta Distribution & Results Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Score Impact Distribution</h2>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member-by-Member Simulation Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Member Impact Simulation</h2>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              {simulationResults.length} Evaluated
            </span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Member</th>
                  <th className="py-2.5 px-3">Historical Score</th>
                  <th className="py-2.5 px-3">Simulated Score</th>
                  <th className="py-2.5 px-3">Delta Impact</th>
                  <th className="py-2.5 px-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {simulationResults.map((r) => (
                  <tr key={r.memberId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.memberName}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {r.historicalScore.toFixed(2)} pts
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {r.simulatedScore.toFixed(2)} pts
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          r.delta > 0.05
                            ? 'bg-emerald-50 text-emerald-700'
                            : r.delta < -0.05
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.delta >= 0 ? '+' : ''}
                        {r.delta.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {r.confidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
