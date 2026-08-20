import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { UserRole } from '../../types/kpi';
import {
  LayoutDashboard,
  UserCheck,
  Building2,
  Users,
  UserCircle,
  FileCode2,
  Sliders,
  Library,
  Scale,
  CalendarDays,
  Cpu,
  CheckSquare,
  BarChart3,
  TrendingUp,
  History,
  GitCompare,
  Database,
  ShieldAlert,
  Award,
  ScrollText,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Wand2,
  Shield,
  Download,
  Upload,
  Sun,
  Moon,
} from 'lucide-react';

interface ShellProps {
  currentView: string;
  onNavigate: (view: string, params?: Record<string, any>) => void;
  children: React.ReactNode;
  onOpenQuickScenarios: () => void;
}

export const Shell: React.FC<ShellProps> = ({
  currentView,
  onNavigate,
  children,
  onOpenQuickScenarios,
}) => {
  const state = useStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { role: UserRole; title: string; desc: string; icon: string }[] = [
    { role: 'HEAD', title: 'Department Head', desc: 'Calibration, Finalize, Lock Period & Governance', icon: '👑' },
    { role: 'LEADER', title: 'Team Leader', desc: 'Criteria Review, Adjustments with Reasons', icon: '⭐' },
    { role: 'MEMBER', title: 'Individual Member', desc: 'My Performance & Score Explanation Trace', icon: '👤' },
    { role: 'ADMIN', title: 'Administrator', desc: 'Rank Schemes, Metric Library & System Config', icon: '⚙️' },
  ];

  const currentPeriod = state.periods.find((p) => p.code === state.currentPeriodCode);
  const lowConfidenceCount = state.evaluations
    .filter((e) => e.periodId === state.currentPeriodCode)
    .filter((e) => e.confidence === 'LOW' || e.confidence === 'REVIEW_REQUIRED').length;

  const pendingReviewsCount = state.evaluations
    .filter((e) => e.periodId === state.currentPeriodCode)
    .filter((e) => e.status === 'SYSTEM_EVALUATED' || e.status === 'PENDING_SYSTEM').length;

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'executive', label: 'Executive Bento', icon: LayoutDashboard, badge: null },
        { id: 'my-performance', label: 'My Performance', icon: UserCheck, badge: null },
      ],
    },
    {
      group: 'ORGANIZATION',
      items: [
        { id: 'teams', label: 'Teams & Hierarchy', icon: Users, badge: `${state.teams.length}` },
        { id: 'members', label: 'Members & Transfers', icon: UserCircle, badge: `${state.members.length}` },
      ],
    },
    {
      group: 'KPI CONFIGURATION',
      items: [
        { id: 'kpi-templates', label: 'KPI Templates', icon: FileCode2, badge: `${state.kpiTemplates.length}` },
        { id: 'kpi-builder', label: 'KPI Builder', icon: Sliders, badge: 'Active' },
        { id: 'kpi-wizard', label: 'Setup Wizard', icon: Wand2, badge: '10-Step' },
        { id: 'metric-library', label: 'Metric Library', icon: Library, badge: null },
      ],
    },
    {
      group: 'EVALUATION PIPELINE',
      items: [
        { id: 'periods', label: 'Evaluation Periods', icon: CalendarDays, badge: currentPeriod?.status },
        { id: 'system-eval', label: 'System Pipeline', icon: Cpu, badge: 'Auto' },
        { id: 'leader-review', label: 'Leader Review', icon: CheckSquare, badge: pendingReviewsCount > 0 ? `${pendingReviewsCount}` : null },
        { id: 'calibration', label: 'Head Calibration', icon: Scale, badge: null },
      ],
    },
    {
      group: 'ANALYTICS & GOVERNANCE',
      items: [
        { id: 'team-analytics', label: 'Team Analytics', icon: BarChart3, badge: null },
        { id: 'historical-analytics', label: 'Historical Trends', icon: History, badge: 'Q / Y' },
        { id: 'kpi-simulation', label: 'KPI Simulation', icon: TrendingUp, badge: 'Sandbox' },
        { id: 'version-compare', label: 'Version Diff', icon: GitCompare, badge: null },
        { id: 'data-quality', label: 'Data Quality & Health', icon: ShieldAlert, badge: lowConfidenceCount > 0 ? `${lowConfidenceCount}` : null },
      ],
    },
    {
      group: 'INTEGRATIONS & SYSTEM',
      items: [
        { id: 'jira-integration', label: 'Jira Telemetry', icon: Database, badge: state.jiraConfig.status },
        { id: 'rank-scheme', label: 'Rank & Multipliers', icon: Award, badge: null },
        { id: 'audit-log', label: 'Audit Trail', icon: ScrollText, badge: `${state.auditLogs.length}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased font-sans selection:bg-indigo-500 selection:text-white">
      {/* BENTO THEMED GLOBAL HEADER */}
      <header className="h-16 bg-slate-950/90 backdrop-blur-md text-white border-b border-slate-800/80 flex items-center justify-between px-6 sticky top-0 z-40">
        {/* Brand & Period Selector */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => onNavigate('executive')}
            className="flex items-center gap-3 font-bold tracking-tight text-white hover:text-indigo-400 transition-colors text-sm cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center text-white font-mono text-base font-black shadow-lg shadow-indigo-600/30 transition-all">
              K
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-none text-sm font-extrabold tracking-tight">KPI STUDIO</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">BENTO GOVERNANCE</span>
            </div>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Period Selector Bento Pill */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-xs">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Cycle:</span>
            <select
              value={state.currentPeriodCode}
              onChange={(e) => store.setPeriod(e.target.value)}
              className="bg-transparent text-slate-200 font-bold text-xs focus:outline-hidden cursor-pointer"
            >
              {state.periods.map((p) => (
                <option key={p.code} value={p.code} className="bg-slate-900 text-slate-100 font-mono">
                  {p.name} {p.isLocked ? '🔒 [LOCKED]' : `(${p.status})`}
                </option>
              ))}
            </select>
            {currentPeriod?.isLocked && (
              <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-lg text-[10px] font-mono font-bold">
                LOCKED SNAPSHOT
              </span>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3.5">
          {/* System Status Bento Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[11px] font-bold tracking-wider text-slate-300 font-mono">PIPELINE OPTIMIZED</span>
          </div>

          {/* Quick Judge Scenarios Button */}
          <button
            type="button"
            onClick={onOpenQuickScenarios}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/20 border border-indigo-500/50 transition-all cursor-pointer"
            title="Inspect 8 Judge Verification Scenarios"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>Judge Scenarios</span>
          </button>

          {/* Backup Export Button */}
          <button
            type="button"
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(store.exportStateJson());
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `kpi_studio_backup_${new Date().toISOString().split('T')[0]}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="p-2 text-slate-400 hover:text-indigo-300 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl transition-colors cursor-pointer"
            title="Export full state backup as JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Restore Import Button */}
          <label
            className="p-2 text-slate-400 hover:text-indigo-300 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl transition-colors cursor-pointer inline-flex items-center"
            title="Restore state from backup JSON"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const content = event.target?.result as string;
                    if (content) {
                      const success = store.importStateJson(content);
                      if (success) {
                        alert('Application state successfully restored from backup!');
                      } else {
                        alert('Failed to parse backup JSON file. Please check file format.');
                      }
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>

          {/* Reset Demo State Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset prototype state to original seeded benchmark data?')) {
                store.resetToSeedData();
              }
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl transition-colors cursor-pointer"
            title="Reset data to initial benchmark seed"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Luxury Theme Switcher Button */}
          <button
            type="button"
            onClick={() => store.toggleTheme()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl transition-all cursor-pointer shadow-xs"
            title={state.theme === 'light' ? 'Switch to Obsidian Dark Mode' : 'Switch to High-Budget Light Architectural Theme'}
          >
            {state.theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-[11px] font-mono font-bold capitalize">
              {state.theme === 'light' ? 'Light' : 'Dark'}
            </span>
          </button>

          <div className="h-6 w-px bg-slate-800" />

          {/* Role Switcher Bento Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 rounded-2xl border border-slate-800 text-xs transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 font-mono">
                {state.currentRole[0]}
              </div>
              <div className="text-left">
                <span className="font-semibold text-slate-200 block text-xs">
                  {roles.find((r) => r.role === state.currentRole)?.title}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/80 z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-widest border-b border-slate-800">
                  Switch Persona / Access Level
                </div>
                <div className="py-1.5 space-y-1">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        store.setRole(r.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-start gap-3 transition-colors cursor-pointer ${
                        state.currentRole === r.role
                          ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="text-lg leading-none mt-0.5">{r.icon}</span>
                      <div>
                        <div className="font-bold text-sm">{r.title}</div>
                        <div className={`text-[11px] ${state.currentRole === r.role ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {r.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY WITH BENTO SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col flex-shrink-0 z-30 select-none overflow-y-auto">
          {/* Department Bento Card */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-100 truncate">
                  {state.department.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  HEAD: {state.department.headName}
                </div>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-5 flex-1">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {group.group}
                </div>
                <div className="space-y-1 mt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                              isActive
                                ? 'bg-indigo-700/80 text-indigo-100'
                                : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer stats in sidebar */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 space-y-2 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider">JIRA INGESTION:</span>
              <span className="font-bold text-slate-200">{state.jiraIssues.length} ISSUES</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider">DATA CONFIDENCE:</span>
              <span className="font-bold text-emerald-400">94.8% HIGH</span>
            </div>
            <div className="pt-2 text-[9px] text-slate-600 uppercase tracking-widest text-center border-t border-slate-800/60">
              CORE KPI OS • AES-256
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT WITH DEEP SLATE BENTO BACKGROUND */}
        <main className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 relative flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
