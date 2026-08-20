import React from 'react';
import { ScoreExplanationTrace as TraceType } from '../../types/kpi';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Database, Calculator, GitCommit, FileText, CheckCircle2 } from 'lucide-react';

interface ScoreExplanationTraceProps {
  trace: TraceType;
  criterionName: string;
  criterionCode?: string;
  onViewTicket?: (ticketKey: string) => void;
  compact?: boolean;
}

export const ScoreExplanationTrace: React.FC<ScoreExplanationTraceProps> = ({
  trace,
  criterionName,
  onViewTicket,
  compact = false,
}) => {
  if (!trace) return null;

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl ${compact ? 'p-4' : 'p-6'} text-slate-200 text-xs shadow-xl`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="font-bold text-white text-sm">{criterionName}</span>
          <span className="text-slate-500 font-mono text-[11px] uppercase tracking-wider">Score Trace</span>
        </div>
        <ConfidenceBadge level={trace.confidence} reasons={trace.confidenceReasons} />
      </div>

      {/* 5-Step Visual Trace Pipeline Bento Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch relative">
        {/* Step 1: Raw Input Facts */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase font-mono mb-2">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>1. Input Facts</span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
              {Object.entries(trace.inputSummary).map(([key, value]) => {
                if (Array.isArray(value)) return null;
                return (
                  <div key={key} className="flex justify-between items-center py-0.5 border-b border-slate-850 last:border-0">
                    <span className="text-slate-500 text-[10px] capitalize font-sans">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="font-bold text-slate-200">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
            Jira Raw Fact Snapshot
          </div>
        </div>

        {/* Step 2: Metric Computation */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase font-mono mb-2">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Metric Calc</span>
            </div>
            <div className="mt-1">
              <div className="text-xl font-bold text-white font-mono tracking-tight">
                {trace.metricFormatted || `${trace.metricValue}`}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Normalized: <span className="font-bold text-indigo-400">{trace.metricValue}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-bold">
            <CheckCircle2 className="w-3 h-3" /> Standard Rule
          </div>
        </div>

        {/* Step 3: Scoring Rule Matched */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase font-mono mb-2">
              <GitCommit className="w-3.5 h-3.5 text-purple-400" />
              <span>3. Matched Rule</span>
            </div>
            <div className="p-2 bg-purple-950/40 rounded-xl border border-purple-800/60 font-mono text-[11px] text-purple-200 font-semibold leading-relaxed">
              {trace.ruleAppliedDescription}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
            Configurable Engine
          </div>
        </div>

        {/* Step 4: Suggested Score Result */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[10px] uppercase font-mono mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>4. Suggested Score</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-white font-mono">
                {trace.suggestedScore.toFixed(1)}
              </span>
              <span className="text-slate-500 font-mono text-xs">/ {trace.maxScore.toFixed(1)} pts</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-indigo-400 font-mono font-bold">
            System Automated
          </div>
        </div>

        {/* Step 5: Evidence Artifacts */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase font-mono mb-2">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>5. Evidence Artifacts</span>
            </div>
            <div className="text-[11px] text-slate-300 font-bold font-mono mb-1.5">
              {trace.evidenceCount} Linked Tickets
            </div>
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1 font-mono">
              {trace.ticketKeys && trace.ticketKeys.length > 0 ? (
                trace.ticketKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onViewTicket?.(key)}
                    className="px-2 py-0.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[10px] font-bold rounded-lg border border-indigo-800/80 transition-colors cursor-pointer"
                  >
                    {key}
                  </button>
                ))
              ) : (
                <span className="text-slate-500 text-[10px] italic">Manual rubric</span>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-amber-400 font-mono">
            Click ticket for facts
          </div>
        </div>
      </div>

      {trace.confidenceReasons && trace.confidenceReasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-[11px] text-amber-300 bg-amber-950/40 p-3 rounded-2xl border border-amber-800/60 font-mono">
          <span className="font-bold text-amber-400 uppercase">Data Quality Note:</span>
          <span>{trace.confidenceReasons.join(' ')}</span>
        </div>
      )}
    </div>
  );
};
