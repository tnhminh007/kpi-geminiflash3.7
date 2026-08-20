import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { GitCompare, ArrowRight, CheckCircle2, Sliders, ShieldCheck, AlertCircle, Plus, Minus, RefreshCw } from 'lucide-react';

interface VersionCompareViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const VersionCompareView: React.FC<VersionCompareViewProps> = ({ onNavigate }) => {
  const state = useStore();

  const [v1Id, setV1Id] = useState<string>(
    state.kpiTemplates.find((t) => t.code.includes('API') && t.version === 'v1.0')?.id ||
    state.kpiTemplates[0]?.id
  );
  const [v2Id, setV2Id] = useState<string>(
    state.kpiTemplates.find((t) => t.code.includes('API') && t.version === 'v2.0')?.id ||
    state.kpiTemplates[1]?.id ||
    state.kpiTemplates[0]?.id
  );

  const tpl1 = state.kpiTemplates.find((t) => t.id === v1Id) || state.kpiTemplates[0];
  const tpl2 = state.kpiTemplates.find((t) => t.id === v2Id) || state.kpiTemplates[1] || tpl1;

  // Compare criteria
  const tpl1CriteriaMap = new Map(tpl1.criteria.map((c) => [c.code, c]));
  const tpl2CriteriaMap = new Map(tpl2.criteria.map((c) => [c.code, c]));

  const allCodes = Array.from(new Set([...tpl1CriteriaMap.keys(), ...tpl2CriteriaMap.keys()]));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <span>Governance & Version Control</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            KPI Version Diff & Evolution Inspector
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare criteria weights, metric mapping, and scoring rules side-by-side between any two KPI revisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('kpi-simulation')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Simulate Version Impact</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Version Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Baseline Version (A):</label>
          <select
            value={v1Id}
            onChange={(e) => setV1Id(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
          >
            {state.kpiTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.version}) - {t.status}
              </option>
            ))}
          </select>
          <div className="text-xs text-slate-500 flex justify-between font-mono pt-1">
            <span>Criteria: {tpl1.criteria.length}</span>
            <span>Total Max: {tpl1.criteria.reduce((a, b) => a + b.maxScore, 0).toFixed(1)} pts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Candidate Revision (B):</label>
          <select
            value={v2Id}
            onChange={(e) => setV2Id(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
          >
            {state.kpiTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.version}) - {t.status}
              </option>
            ))}
          </select>
          <div className="text-xs text-slate-500 flex justify-between font-mono pt-1">
            <span>Criteria: {tpl2.criteria.length}</span>
            <span>Total Max: {tpl2.criteria.reduce((a, b) => a + b.maxScore, 0).toFixed(1)} pts</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Criteria Diff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Criteria & Weight Comparison</h2>
          <span className="text-xs font-mono text-slate-500">{allCodes.length} Distinct Criteria</span>
        </div>

        <div className="divide-y divide-slate-100">
          {allCodes.map((code) => {
            const c1 = tpl1CriteriaMap.get(code);
            const c2 = tpl2CriteriaMap.get(code);

            const isNew = !c1 && !!c2;
            const isRemoved = !!c1 && !c2;
            const isModified = !!c1 && !!c2 && (c1.maxScore !== c2.maxScore || c1.name !== c2.name);

            return (
              <div key={code} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Baseline Left */}
                <div
                  className={`p-3 rounded-xl border ${
                    c1
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-rose-50/50 border-rose-200 text-rose-700 italic flex items-center justify-center'
                  }`}
                >
                  {c1 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{c1.name}</span>
                        <span className="font-mono text-blue-700">{c1.maxScore.toFixed(1)} pts</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{c1.description}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Method: {c1.evaluationMethod} • Source: {c1.evidenceSource}
                      </div>
                    </div>
                  ) : (
                    <span>Criterion not present in Baseline</span>
                  )}
                </div>

                {/* Candidate Right */}
                <div
                  className={`p-3 rounded-xl border ${
                    isNew
                      ? 'bg-emerald-50 border-emerald-300'
                      : isModified
                      ? 'bg-amber-50 border-amber-300'
                      : c2
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-100 border-slate-200 text-slate-400 italic flex items-center justify-center'
                  }`}
                >
                  {c2 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          {c2.name}
                          {isNew && (
                            <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded text-[9px] font-bold">
                              NEW
                            </span>
                          )}
                          {isModified && (
                            <span className="px-1.5 py-0.2 bg-amber-200 text-amber-800 rounded text-[9px] font-bold">
                              MODIFIED
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-bold text-blue-700">{c2.maxScore.toFixed(1)} pts</span>
                      </div>
                      <div className="text-[11px] text-slate-600">{c2.description}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Method: {c2.evaluationMethod} • Source: {c2.evidenceSource}
                      </div>
                    </div>
                  ) : (
                    <span>Removed in Revision</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
