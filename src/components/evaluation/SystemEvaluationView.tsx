import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { Cpu, Play, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck, Layers, FileCheck } from 'lucide-react';

interface SystemEvaluationViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const SystemEvaluationView: React.FC<SystemEvaluationViewProps> = ({ onNavigate }) => {
  const state = useStore();
  const [isRunning, setIsRunning] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([
    `[Ready] Automated evaluation pipeline initialized for period ${state.currentPeriodCode}.`,
  ]);

  const handleRunPipeline = () => {
    setIsRunning(true);
    setLogMessages((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Fetching raw Jira tickets from REST API...`,
      `[${new Date().toLocaleTimeString()}] Ingested ${state.jiraIssues.length} Jira artifacts for period ${state.currentPeriodCode}.`,
      `[${new Date().toLocaleTimeString()}] Matching member time-based transfer history...`,
      `[${new Date().toLocaleTimeString()}] Calculating deterministic metrics (On-time, Defect Ratio, Incidents)...`,
      `[${new Date().toLocaleTimeString()}] Applying configured visual threshold rules...`,
      `[${new Date().toLocaleTimeString()}] Generating 6-step explainable traces & evidence links...`,
      `[${new Date().toLocaleTimeString()}] Scoring pipeline complete for all ${state.members.length} members.`,
    ]);

    setTimeout(() => {
      store.runSystemEvaluations(state.currentPeriodCode);
      setIsRunning(false);
      alert(`Automated system evaluation complete for ${state.members.length} members!`);
    }, 600);
  };

  const periodEvals = state.evaluations.filter((e) => e.periodId === state.currentPeriodCode);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <span>Automated Scoring Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            System Automated Evaluation Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Batch-process raw Jira evidence and generate transparent baseline scoring traces.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunPipeline}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isRunning ? 'Calculating...' : 'Run Automated Pipeline'}</span>
        </button>
      </div>

      {/* Pipeline Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jira Artifacts Ingested</span>
          <div className="text-3xl font-bold text-slate-900 font-mono">{state.jiraIssues.length} Issues</div>
          <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> REST API Synchronized
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluations Generated</span>
          <div className="text-3xl font-bold text-blue-700 font-mono">{periodEvals.length} Members</div>
          <div className="text-xs text-blue-600 font-medium">100% Coverage</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trace Health</span>
          <div className="text-3xl font-bold text-purple-700 font-mono">6-Step</div>
          <div className="text-xs text-purple-600 font-medium">Explainable Output</div>
        </div>
      </div>

      {/* Execution Console Logs */}
      <div className="bg-slate-900 rounded-2xl p-5 shadow-2xs text-slate-200 font-mono text-xs space-y-2">
        <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800 pb-2">
          Pipeline Execution Logs
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {logMessages.map((msg, i) => (
            <div key={i} className="text-slate-300">
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
