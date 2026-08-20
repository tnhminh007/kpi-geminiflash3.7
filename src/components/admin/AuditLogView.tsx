import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { ShieldCheck, Search, ScrollText, Download, Filter, FileText } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const state = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const actionTypes = ['ALL', ...Array.from(new Set(state.auditLogs.map((l) => l.action)))];

  const filteredLogs = state.auditLogs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Action', 'Actor', 'ActorRole', 'EntityType', 'EntityId', 'EntityName', 'Reason'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.actor}"`,
      `"${l.actorRole}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.entityName}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full text-slate-100">
      {/* Header Bento */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
            <ScrollText className="w-3.5 h-3.5" />
            <span>Governance & Security Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Immutable Audit Trail & Governance Logs
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Tamper-evident logs of all leader adjustments, head calibrations, scheme publications, and period freeze snapshots.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit CSV</span>
          </button>

          <span className="px-4 py-2.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Active</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search audit trail by actor, reason, entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {actionTypes.map((a) => (
              <option key={a} value={a}>
                {a === 'ALL' ? 'All Actions' : a}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="font-bold text-slate-200">{filteredLogs.length}</span> events
        </div>
      </div>

      {/* Logs Bento Table Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Cryptographic Audit Sequence</h2>
            <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-400 border border-indigo-800/50 rounded font-mono text-[10px] font-bold">
              Append-Only
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">Total: {state.auditLogs.length} Records</span>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-5 space-y-2 hover:bg-slate-850/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-800 text-indigo-300 border border-slate-700 rounded-lg font-mono text-[10px] font-bold">
                    {log.action}
                  </span>
                  <span className="font-bold text-slate-200 font-sans">{log.actor}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({log.actorRole})</span>
                </div>

                <span className="font-mono text-[11px] text-slate-400">
                  Target: <span className="text-indigo-400 font-semibold">{log.entityType}</span> #{log.entityId} ({log.entityName})
                </span>
              </div>

              {log.reason && (
                <div className="p-3.5 bg-slate-950/80 border border-indigo-900/40 rounded-2xl text-slate-300 text-xs leading-relaxed font-sans">
                  <strong className="text-indigo-400 font-mono text-[11px] block mb-0.5">Mandatory Governance Justification:</strong>
                  "{log.reason}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
