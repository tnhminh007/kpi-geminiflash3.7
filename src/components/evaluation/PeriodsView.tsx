import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { EvaluationPeriod } from '../../types/kpi';
import { CalendarDays, Lock, CheckCircle2, ShieldCheck, Plus, ArrowRight, X, AlertTriangle } from 'lucide-react';

interface PeriodsViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const PeriodsView: React.FC<PeriodsViewProps> = ({ onNavigate }) => {
  const state = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [periodCode, setPeriodCode] = useState('');
  const [periodName, setPeriodName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleLock = (code: string) => {
    store.lockPeriod(code);
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodCode || !periodName || !startDate || !endDate) return;

    const newPeriod: EvaluationPeriod = {
      id: `period-${periodCode.toLowerCase()}`,
      code: periodCode.trim(),
      name: periodName.trim(),
      startDate,
      endDate,
      status: 'COLLECTING',
      isLocked: false,
      totalMembers: state.members.length,
      systemEvaluatedCount: state.members.length,
      leaderReviewedCount: 0,
      headCalibratedCount: 0,
      finalizedCount: 0,
      lowConfidenceCount: 0,
      dataQualityScore: 98,
    };

    store.addPeriod(newPeriod);
    store.setPeriod(newPeriod.code);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full text-slate-100">
      {/* Header Bento */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Appraisal Governance Cycles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Evaluation Periods & Snapshot Immutability
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Launch appraisal cycles, monitor workflow completion, and enforce tamper-proof cryptographic snapshots.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
              const code = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
              const monthName = nextMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
              setPeriodCode(code);
              setPeriodName(`${monthName} Appraisal Cycle`);
              setStartDate(`${code}-01`);
              const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
              setEndDate(`${code}-${lastDay}`);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch New Cycle</span>
          </button>
        </div>
      </div>

      {/* Periods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.periods.map((period) => {
          const evals = state.evaluations.filter((e) => e.periodId === period.code);
          const isCurrentActive = state.currentPeriodCode === period.code;

          return (
            <div
              key={period.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between space-y-5 transition-all duration-300 ${
                isCurrentActive
                  ? 'bg-slate-900/90 border-indigo-500/60 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/60 backdrop-blur-md border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-indigo-400">{period.code}</span>
                    {isCurrentActive && (
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full font-mono text-[9px] font-bold">
                        ACTIVE VIEW
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border ${
                      period.isLocked
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                        : period.status === 'FINALIZED'
                        ? 'bg-blue-950/60 text-blue-300 border-blue-800/50'
                        : 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                    }`}
                  >
                    {period.isLocked ? 'LOCKED SNAPSHOT' : period.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{period.name}</h3>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/60 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-sans text-[11px]">Duration:</span>
                    <span className="text-slate-300 font-bold">{period.startDate} → {period.endDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-sans text-[11px]">Evaluations:</span>
                    <span className="text-slate-200 font-bold">{evals.length} Staff Snapshots</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/50">
                    <span className="font-sans text-[11px]">Governance Status:</span>
                    <span className="text-indigo-300">
                      {period.isLocked ? 'Immutable & Frozen' : 'Open for Calibration'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    store.setPeriod(period.code);
                    onNavigate('executive');
                  }}
                  className={`text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isCurrentActive ? 'text-indigo-300' : 'text-slate-400 hover:text-indigo-400'
                  }`}
                >
                  <span>{isCurrentActive ? 'Currently Selected' : 'Switch Period'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {!period.isLocked ? (
                  <button
                    type="button"
                    onClick={() => handleLock(period.code)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Lock Cycle</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Frozen</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Period Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Launch Evaluation Period</h3>
                <p className="text-xs text-slate-400">Create a new appraisal cycle and initialize baseline evaluations</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Period Code * (YYYY-MM)</label>
                  <input
                    type="text"
                    required
                    placeholder="2026-10"
                    value={periodCode}
                    onChange={(e) => setPeriodCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Display Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="October 2026 Appraisal"
                    value={periodName}
                    onChange={(e) => setPeriodName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl text-indigo-200 text-xs leading-relaxed">
                <strong>Automatic Provisioning:</strong> Initializing this period will instantly compute baseline telemetry evaluations for all <strong>{state.members.length} engineers</strong> across <strong>{state.teams.length} squads</strong> based on active KPI schemes.
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30"
                >
                  Launch Appraisal Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
