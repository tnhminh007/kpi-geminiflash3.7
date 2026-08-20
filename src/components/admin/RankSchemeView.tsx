import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { RankTier } from '../../types/kpi';
import { Award, Save, Plus, Trash2, RotateCcw, CheckCircle2 } from 'lucide-react';

export const RankSchemeView: React.FC = () => {
  const state = useStore();
  const [tiers, setTiers] = useState<RankTier[]>(state.rankScheme.tiers);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateRank = (index: number, field: keyof RankTier, val: any) => {
    const copy = [...tiers];
    copy[index] = { ...copy[index], [field]: val };
    setTiers(copy);
  };

  const handleAddTier = () => {
    const newTier: RankTier = {
      id: `tier-${Date.now()}`,
      rank: 'A+',
      minScore: 8.8,
      maxScore: 9.2,
      coefficient: 1.35,
      description: 'Exceptional Engineering Performance & Strategic Impact',
      color: '#6366f1',
    };
    setTiers([...tiers, newTier]);
  };

  const handleDeleteTier = (index: number) => {
    if (tiers.length <= 2) return;
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    store.updateRankScheme(tiers);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto w-full text-slate-100">
      {/* Header Bento */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Governance & Compensation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Performance Rank Scheme & Bonus Multipliers
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Configure mathematical score cut-offs, grade labels, and financial reward multipliers mapped to finalized KPI scores.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={handleAddTier}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Grade Tier</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Changes Applied!' : 'Save Scheme'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-mono animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Rank scheme saved! All staff evaluations across periods have been instantly re-evaluated with updated grade coefficients.</span>
        </div>
      )}

      {/* Ranks Bento Table Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Active Rating Cut-off Tiers</h2>
            <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-400 border border-indigo-800/50 rounded font-mono text-[10px] font-bold">
              {tiers.length} Tiers
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">Base Scale: 0.00 → 10.00 pts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Grade Rank</th>
                <th className="py-3.5 px-4">Min Score</th>
                <th className="py-3.5 px-4">Max Score</th>
                <th className="py-3.5 px-4">Bonus Coefficient</th>
                <th className="py-3.5 px-4">Policy Description</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {tiers.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-4 px-5">
                    <input
                      type="text"
                      value={r.rank}
                      onChange={(e) => handleUpdateRank(idx, 'rank', e.target.value)}
                      className="w-16 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-extrabold text-sm text-indigo-400 text-center uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      step="0.05"
                      value={r.minScore}
                      onChange={(e) => handleUpdateRank(idx, 'minScore', parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      step="0.05"
                      value={r.maxScore}
                      onChange={(e) => handleUpdateRank(idx, 'maxScore', parseFloat(e.target.value) || 10)}
                      className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.05"
                        value={r.coefficient}
                        onChange={(e) => handleUpdateRank(idx, 'coefficient', parseFloat(e.target.value) || 1.0)}
                        className="w-24 px-3 py-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded-xl font-bold text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-slate-500">x Base</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-sans">
                    <input
                      type="text"
                      value={r.description}
                      onChange={(e) => handleUpdateRank(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      disabled={tiers.length <= 2}
                      onClick={() => handleDeleteTier(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Delete Tier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
