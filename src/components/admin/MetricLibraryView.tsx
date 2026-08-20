import React, { useState } from 'react';
import { SYSTEM_METRIC_LIBRARY } from '../../services/metricLibrary';
import { Library, CheckCircle2, Sliders, Database, ArrowRight, Search, Zap, Filter } from 'lucide-react';

interface MetricLibraryViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const MetricLibraryView: React.FC<MetricLibraryViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(SYSTEM_METRIC_LIBRARY.map((m) => m.category)))];

  const filteredMetrics = SYSTEM_METRIC_LIBRARY.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full text-slate-100">
      {/* Header Bento */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
            <Library className="w-3.5 h-3.5" />
            <span>Telemetry Catalog & Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Standard Metric Library & Telemetry Catalog
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Pre-built, deterministic metric extractors verified against Jira Cloud REST API endpoints and GitHub telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => onNavigate('kpi-builder')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Open in KPI Builder</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search metrics by name, formula, or field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="font-bold text-slate-200">{filteredMetrics.length}</span> / {SYSTEM_METRIC_LIBRARY.length} Standard Calculators
        </div>
      </div>

      {/* Metric Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between space-y-5 hover:border-slate-700 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-indigo-950/80 text-indigo-400 border border-indigo-800/50 rounded-lg font-mono text-[10px] font-bold">
                  {metric.category}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400 px-2.5 py-0.5 bg-slate-800/60 rounded-lg border border-slate-700/50">
                  Unit: {metric.unit}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                {metric.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                {metric.description}
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/60 text-xs space-y-2.5 font-mono">
              <div>
                <span className="text-slate-500 font-sans text-[11px] block mb-1">Target Issue Types:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {metric.supportedIssueTypes.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded-md border border-slate-800 text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-sans">Jira API Fields:</span>
                <span className="text-indigo-400 font-bold truncate max-w-[240px]" title={metric.requiredFields.join(', ')}>
                  {metric.requiredFields.join(', ')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onNavigate('kpi-builder')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Add to Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
