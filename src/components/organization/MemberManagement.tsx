import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import { Member } from '../../types/kpi';
import { History, UserCircle, Plus, Edit3, ArrowRight, X, Shield, Search, CheckCircle2 } from 'lucide-react';

interface MemberManagementProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ onNavigate }) => {
  const state = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('ALL');

  const [transferModalMemberId, setTransferModalMemberId] = useState<string | null>(null);
  const [targetTeamId, setTargetTeamId] = useState<string>(state.teams[0]?.id || '');
  const [effectivePeriod, setEffectivePeriod] = useState<string>(state.currentPeriodCode);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('Senior Software Engineer');
  const [level, setLevel] = useState('Senior (L4)');
  const [teamId, setTeamId] = useState(state.teams[0]?.id || '');
  const [jiraUsername, setJiraUsername] = useState('');

  const activeTransferMember = state.members.find((m) => m.id === transferModalMemberId);

  const filteredMembers = state.members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.jiraUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = teamFilter === 'ALL' || m.currentTeamId === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setTitle('Software Engineer');
    setLevel('Mid-Level (L3)');
    setTeamId(state.teams[0]?.id || '');
    setJiraUsername('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (m: Member) => {
    setEditingMember(m);
    setName(m.name);
    setEmail(m.email);
    setTitle(m.title);
    setLevel(m.level);
    setTeamId(m.currentTeamId);
    setJiraUsername(m.jiraUsername);
  };

  const handleSaveNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !jiraUsername) return;

    store.addMemberToTeam({
      name,
      email,
      title,
      level,
      teamId,
      jiraUsername: jiraUsername.replace('@', ''),
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !name) return;

    store.updateMember(editingMember.id, {
      name,
      email,
      title,
      level,
      jiraUsername: jiraUsername.replace('@', ''),
    });

    setEditingMember(null);
  };

  const handleExecuteTransfer = () => {
    if (!transferModalMemberId || !targetTeamId) return;
    store.transferMember(transferModalMemberId, targetTeamId, effectivePeriod);
    setTransferModalMemberId(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full text-slate-100">
      {/* Header Bento */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
            <UserCircle className="w-3.5 h-3.5" />
            <span>Engineering Staff Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Members Directory & Time-Based Transfer History
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Manage engineers, Jira username bindings, and period-by-period team transfer timelines with historical evaluation isolation.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Engineer</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, role or @jira..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Squads</option>
            {state.teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="font-bold text-slate-200">{filteredMembers.length}</span> / {state.members.length} engineers
        </div>
      </div>

      {/* Members Bento Table Card */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Active Engineering Roster</h2>
            <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-400 border border-indigo-800/50 rounded font-mono text-[10px] font-bold">
              {filteredMembers.length} Staff
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">Period: {state.currentPeriodCode}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Member Name</th>
                <th className="py-3.5 px-4">Title / Level</th>
                <th className="py-3.5 px-4">Current Squad</th>
                <th className="py-3.5 px-4">Jira Telemetry</th>
                <th className="py-3.5 px-4">Transfer History</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredMembers.map((m) => {
                const currentTeam = state.teams.find((t) => t.id === m.currentTeamId);
                const memberMemberships = state.memberships.filter((ms) => ms.memberId === m.id);
                const hasTransfers = memberMemberships.length > 1;

                return (
                  <tr key={m.id} className="hover:bg-slate-850/60 transition-colors group">
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => {
                          store.setSelectedMember(m.id);
                          onNavigate('my-performance');
                        }}
                        className="font-bold text-sm text-slate-100 group-hover:text-indigo-400 font-sans transition-colors cursor-pointer text-left block"
                      >
                        {m.name}
                      </button>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5">{m.email}</div>
                    </td>
                    <td className="py-4 px-4 font-sans">
                      <div className="text-slate-200 font-medium">{m.title}</div>
                      <div className="text-[11px] text-indigo-400 font-mono mt-0.5">{m.level}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold font-sans border border-slate-700">
                        {currentTeam?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-indigo-400 font-bold">
                      @{m.jiraUsername}
                    </td>
                    <td className="py-4 px-4 font-sans">
                      {hasTransfers ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-950/60 text-purple-300 border border-purple-800/50 rounded-lg font-mono text-[10px] font-bold">
                          <History className="w-3 h-3" />
                          {memberMemberships.length} Records
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Since {m.joinedDate}</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right font-sans space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(m)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Edit Engineer Profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setTransferModalMemberId(m.id)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                      >
                        Transfer
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          store.setSelectedMember(m.id);
                          onNavigate('my-performance');
                        }}
                        className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        View Trace
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Team Modal */}
      {transferModalMemberId && activeTransferMember && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setTransferModalMemberId(null)} />

          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 p-6 sm:p-8 space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Transfer Member to New Squad</h3>
                <p className="text-xs text-indigo-400 font-medium">{activeTransferMember.name}</p>
              </div>
              <button onClick={() => setTransferModalMemberId(null)} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Target Squad:</label>
                <select
                  value={targetTeamId}
                  onChange={(e) => setTargetTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {state.teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Effective Evaluation Period:</label>
                <select
                  value={effectivePeriod}
                  onChange={(e) => setEffectivePeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {state.periods.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-purple-950/40 border border-purple-800/40 rounded-2xl text-purple-200 text-xs leading-relaxed">
                <strong>Historical Integrity Guarantee:</strong> Earlier evaluation periods (e.g. August 2026) will remain strictly isolated and preserved using the previous squad's criteria and weights.
              </div>
            </div>

            <button
              type="button"
              onClick={handleExecuteTransfer}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Confirm Time-Based Transfer
            </button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Onboard New Engineer</h3>
                <p className="text-xs text-slate-400">Add an engineer and link Jira telemetry username</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tran Quoc Toan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="toan.tran@company.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Role Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Junior (L2)">Junior (L2)</option>
                    <option value="Mid-Level (L3)">Mid-Level (L3)</option>
                    <option value="Senior (L4)">Senior (L4)</option>
                    <option value="Staff Engineer (L5)">Staff Engineer (L5)</option>
                    <option value="Principal Engineer (L6)">Principal Engineer (L6)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Assigned Squad *</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {state.teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Jira Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. toan.tran"
                    value={jiraUsername}
                    onChange={(e) => setJiraUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  Add Engineer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingMember(null)} />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Profile: {editingMember.name}</h3>
                <p className="text-xs text-slate-400">Update title, level, and Jira account binding</p>
              </div>
              <button onClick={() => setEditingMember(null)} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Role Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Junior (L2)">Junior (L2)</option>
                    <option value="Mid-Level (L3)">Mid-Level (L3)</option>
                    <option value="Senior (L4)">Senior (L4)</option>
                    <option value="Staff Engineer (L5)">Staff Engineer (L5)</option>
                    <option value="Principal Engineer (L6)">Principal Engineer (L6)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Jira Telemetry Username</label>
                <input
                  type="text"
                  required
                  value={jiraUsername}
                  onChange={(e) => setJiraUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
