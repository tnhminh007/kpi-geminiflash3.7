import React from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { FileCode2, Plus, Copy, Sliders, CheckCircle2, History, Send, Layers, ArrowRight } from 'lucide-react';

interface KpiTemplateManagementProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const KpiTemplateManagement: React.FC<KpiTemplateManagementProps> = ({ onNavigate }) => {
  const state = useStore();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <span>Governance & Templates</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            KPI Template Management & Version Lifecycle
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, version, clone, and publish KPI schemas across engineering teams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('kpi-wizard')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New KPI Scheme (Wizard)</span>
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.kpiTemplates.map((tpl) => {
          const totalScore = tpl.criteria.reduce((a, b) => a + b.maxScore, 0);
          const team = state.teams.find((t) => t.id === tpl.teamId);

          return (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {team ? team.name : 'Universal Department Template'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{tpl.name}</h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      tpl.status === 'PUBLISHED' || tpl.status === 'IN_USE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : tpl.status === 'DRAFT'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tpl.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {tpl.description}
                </p>

                {/* Criteria Pills */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 flex justify-between">
                    <span>Criteria ({tpl.criteria.length})</span>
                    <span className="font-mono text-slate-800 font-bold">{totalScore.toFixed(1)} / 10.0 pts</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {tpl.criteria.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-700"
                      >
                        {c.name.split(' ')[0]} ({c.maxScore}p)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-400">Ver: {tpl.version}</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cloned = store.cloneKpiTemplate(tpl.id);
                      if (cloned) alert(`Cloned as ${cloned.name}!`);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    title="Clone Version"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('kpi-builder', { templateId: tpl.id })}
                    className="px-3 py-1 bg-slate-900 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Configure</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
