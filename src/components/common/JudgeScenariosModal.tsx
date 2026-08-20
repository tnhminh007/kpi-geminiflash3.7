import React from 'react';
import { X, Sparkles, ArrowRight, ShieldCheck, History, Sliders, Users, Database, Scale } from 'lucide-react';

interface JudgeScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunScenario: (scenarioId: string) => void;
}

export const JudgeScenariosModal: React.FC<JudgeScenariosModalProps> = ({
  isOpen,
  onClose,
  onRunScenario,
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'SCENARIO_NEW_TEAM',
      title: 'Scenario 1: Arbitrary Team Creation (Video Platform)',
      desc: 'Create "Video Platform" team with custom criteria: Delivery (4), Quality (3), Incident (2), Knowledge Sharing (1) = 10 pts. No code changes required.',
      icon: Users,
      badge: 'P0 Core Goal',
      actionLabel: 'Launch Wizard',
    },
    {
      id: 'SCENARIO_TEAM_TRANSFER',
      title: 'Scenario 2: Time-Based Team Transfer (Pham Minh Tuan)',
      desc: 'Member A was in API in August (evaluated with API criteria) and Payment in September (evaluated with Payment criteria). Historical periods remain isolated.',
      icon: History,
      badge: 'Historical Isolation',
      actionLabel: 'View Member History',
    },
    {
      id: 'SCENARIO_LOCKED_SNAPSHOT',
      title: 'Scenario 3: Locked Snapshot vs Live Jira Mutation',
      desc: 'July 2026 is LOCKED. Ticket API-842 has 5 SP snapshot. Current Jira was modified to 8 SP later. The locked score never rewrites history.',
      icon: ShieldCheck,
      badge: 'Immutable Snapshots',
      actionLabel: 'Inspect Snapshot Diff',
    },
    {
      id: 'SCENARIO_EXPLAINABLE_TRACE',
      title: 'Scenario 4: 6-Step Score Explanation Trace',
      desc: 'Input Facts -> Calculated Metric -> Configured Rule -> Suggested Score -> Confidence -> Evidence Tickets. No mysterious black-box numbers.',
      icon: Sliders,
      badge: 'Explainable AI',
      actionLabel: 'Open 6-Step Trace',
    },
    {
      id: 'SCENARIO_LEADER_ADJUSTMENT',
      title: 'Scenario 5: Leader Review with Mandatory Reason',
      desc: 'Leader adjusted Dang Van Lam from 7.80 to 8.60 with mandatory justification: "Recognized emergency weekend fix of P1 gRPC leak".',
      icon: Scale,
      badge: 'Human Calibration',
      actionLabel: 'Inspect Leader Review',
    },
    {
      id: 'SCENARIO_HEAD_CALIBRATION',
      title: 'Scenario 6: Department Head Calibration & Rank Curve',
      desc: 'Department Head calibrates Nguyen Thi Huong (9.20 -> 8.70) to align cross-team distribution. Exposes full System -> Leader -> Head -> Final evolution.',
      icon: Scale,
      badge: 'Curve Alignment',
      actionLabel: 'Open Calibration',
    },
    {
      id: 'SCENARIO_KPI_SIMULATION',
      title: 'Scenario 7: KPI Version Simulation on Historical Data',
      desc: 'Simulate applying API-v2 (with On-Time SLA and Carry-Over rules) against 2026-08 data to preview member score delta distribution before publishing.',
      icon: Sparkles,
      badge: 'Sandbox Test',
      actionLabel: 'Run Simulation',
    },
    {
      id: 'SCENARIO_DATA_QUALITY',
      title: 'Scenario 8: Missing Data != Zero Score (Low Confidence)',
      desc: 'Hoang Duc Nam has missing target deadlines and Nguyen Bao Anh has missing Story Points. Flagged with Low/Medium Confidence rather than unfair zero penalty.',
      icon: Database,
      badge: 'Evidence Quality',
      actionLabel: 'View Data Health',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl shadow-2xl shadow-black border border-slate-800 z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/70 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-widest">
                VERIFICATION PROTOCOL
              </div>
              <h2 className="text-lg font-extrabold text-white">Judge Acceptance Scenarios</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="p-6 overflow-y-auto space-y-3">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                className="p-4 bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400 mt-0.5 flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-xs font-sans">{sc.title}</span>
                      <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 rounded-lg text-[10px] font-mono font-bold">
                        {sc.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.desc}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onRunScenario(sc.id);
                    onClose();
                  }}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer font-mono whitespace-nowrap"
                >
                  <span>{sc.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>CORE GOVERNANCE SUITE</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-2xl font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
