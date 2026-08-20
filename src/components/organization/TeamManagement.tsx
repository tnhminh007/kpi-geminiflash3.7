import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { Team } from '../../types/kpi';
import { Plus, ArrowRight, Edit3, Users, Shield, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface TeamManagementProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ onNavigate }) => {
  const state = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const filteredTeams = state.teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setTeamName('');
    setTeamCode('');
    setLeaderName('');
    setDescription('');
    setSelectedTemplateId(state.kpiTemplates[0]?.id || '');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamCode(team.code);
    setLeaderName(team.leaderName);
    setDescription(team.description);
    setSelectedTemplateId(team.activeTemplateId || state.kpiTemplates[0]?.id || '');
  };

  const handleSaveNewTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamCode || !leaderName) return;

    store.createTeam({
      name: teamName,
      code: teamCode.toUpperCase(),
      leaderId: `user-${teamCode.toLowerCase()}-lead`,
      leaderName: leaderName,
      description: description || `Squad responsible for ${teamName} domain engineering.`,
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEditTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !teamName) return;

    store.updateTeam(editingTeam.id, {
      name: teamName,
      code: teamCode.toUpperCase(),
      leaderName: leaderName,
      description: description,
      activeTemplateId: selectedTemplateId || undefined,
    });

    setEditingTeam(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full text-slate-100">
      {/* Header Bento */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Organization Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Engineering Teams & Domain Squads
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Configure functional engineering squads, team leads, and bind dynamic KPI scoring schemes across the department.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Squad</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('kpi-wizard')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Scheme Wizard</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Search teams by name, code or lead..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="font-bold text-slate-200">{filteredTeams.length}</span> squads
        </div>
      </div>

      {/* Teams Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => {
          const members = state.members.filter((m) => m.currentTeamId === team.id);
          const activeTpl =
            state.kpiTemplates.find((t) => t.id === team.activeTemplateId) ||
            state.kpiTemplates.find((t) => t.teamId === team.id && t.status === 'PUBLISHED') ||
            state.kpiTemplates.find((t) => t.teamId === team.id) ||
            state.kpiTemplates[0];

          return (
            <div
              key={team.id}
              className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between space-y-5 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 bg-indigo-950/80 text-indigo-400 border border-indigo-800/50 rounded-lg font-mono text-[10px] font-bold">
                      {team.code}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                      {team.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/60 rounded-xl text-xs font-mono text-slate-300 border border-slate-700/50">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{members.length}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[32px]">
                  {team.description}
                </p>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/60 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans text-[11px]">Team Leader:</span>
                    <span className="font-semibold text-slate-200">{team.leaderName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans text-[11px]">Active Scheme:</span>
                    <span className="text-indigo-400 font-semibold truncate max-w-[150px]" title={activeTpl?.name}>
                      {activeTpl?.name || 'Default Scheme'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/50">
                    <span className="text-slate-500 font-sans text-[11px]">Criteria Count:</span>
                    <span className="text-slate-300 font-bold">{activeTpl?.criteria.length || 0} Metrics</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    store.setSelectedTeam(team.id);
                    onNavigate('team-analytics');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Team Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(team)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Edit Team Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      store.setSelectedTeam(team.id);
                      onNavigate('kpi-builder', { templateId: activeTpl?.id });
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    Edit Criteria
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Team Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Engineering Squad</h3>
                <p className="text-xs text-slate-400">Initialize a new team in the organizational hierarchy</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTeam} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Squad Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud Infrastructure"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Squad Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INFRA"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono uppercase text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Team Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tran Van An"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Domain Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the squad's scope of responsibility..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
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
                  Create Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingTeam(null)} />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Squad: {editingTeam.name}</h3>
                <p className="text-xs text-slate-400">Update team details and bound KPI template</p>
              </div>
              <button
                onClick={() => setEditingTeam(null)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTeam} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Squad Name</label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Squad Code</label>
                  <input
                    type="text"
                    required
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono uppercase text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Team Lead Name</label>
                <input
                  type="text"
                  required
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Active KPI Scheme</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {state.kpiTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.version}) - {t.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Domain Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
