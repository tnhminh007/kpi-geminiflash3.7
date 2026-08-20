import React, { useState } from 'react';
import { useStore } from './hooks/useStore';
import { store } from './services/stateStorage';
import { Shell } from './components/layout/Shell';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { TeamDashboard } from './components/dashboard/TeamDashboard';
import { MemberDashboard } from './components/dashboard/MemberDashboard';
import { KpiBuilder } from './components/builder/KpiBuilder';
import { KpiSetupWizard } from './components/wizard/KpiSetupWizard';
import { LeaderReviewView } from './components/evaluation/LeaderReviewView';
import { CalibrationView } from './components/evaluation/CalibrationView';
import { SystemEvaluationView } from './components/evaluation/SystemEvaluationView';
import { PeriodsView } from './components/evaluation/PeriodsView';
import { KpiTemplateManagement } from './components/governance/KpiTemplateManagement';
import { KpiSimulationView } from './components/governance/KpiSimulationView';
import { VersionCompareView } from './components/governance/VersionCompareView';
import { TeamManagement } from './components/organization/TeamManagement';
import { MemberManagement } from './components/organization/MemberManagement';
import { JiraIntegrationView } from './components/integration/JiraIntegrationView';
import { HistoricalAnalyticsView } from './components/analytics/HistoricalAnalyticsView';
import { DataQualityView } from './components/quality/DataQualityView';
import { RankSchemeView } from './components/admin/RankSchemeView';
import { AuditLogView } from './components/admin/AuditLogView';
import { MetricLibraryView } from './components/admin/MetricLibraryView';
import { JiraTicketDrawer } from './components/common/JiraTicketDrawer';
import { JudgeScenariosModal } from './components/common/JudgeScenariosModal';
import { JiraIssue } from './types/kpi';

export default function App() {
  const state = useStore();
  const [currentView, setCurrentView] = useState<string>('executive');
  const [viewParams, setViewParams] = useState<Record<string, any>>({});

  // Jira Ticket Drawer State
  const [inspectedTicketKey, setInspectedTicketKey] = useState<string | null>(null);

  // Judge Scenarios Modal State
  const [isScenariosOpen, setIsScenariosOpen] = useState<boolean>(false);

  const inspectedIssue: JiraIssue | null = inspectedTicketKey
    ? state.jiraIssues.find((i) => i.key === inspectedTicketKey) || null
    : null;

  const handleNavigate = (view: string, params: Record<string, any> = {}) => {
    setCurrentView(view);
    setViewParams(params);
  };

  const handleOpenTicket = (key: string) => {
    setInspectedTicketKey(key);
  };

  const handleMutateJiraSp = (key: string, newSp: number) => {
    store.mutateJiraIssueSp(key, newSp);
  };

  const handleRunJudgeScenario = (scenarioId: string) => {
    switch (scenarioId) {
      case 'SCENARIO_NEW_TEAM':
        // Jump directly to Step 3 of 10-step wizard
        setCurrentView('kpi-wizard');
        break;

      case 'SCENARIO_TEAM_TRANSFER':
        // Pham Minh Tuan (Transferred from API to Payment)
        store.setSelectedMember('m-tuan');
        setCurrentView('my-performance');
        break;

      case 'SCENARIO_LOCKED_SNAPSHOT':
        // Ticket API-842 in July locked snapshot
        store.setPeriod('2026-07');
        setInspectedTicketKey('API-842');
        setCurrentView('jira-integration');
        break;

      case 'SCENARIO_EXPLAINABLE_TRACE':
        // Dang Van Lam 6-step score trace
        store.setSelectedMember('m-lam');
        setCurrentView('my-performance');
        break;

      case 'SCENARIO_LEADER_ADJUSTMENT':
        // Dang Van Lam with emergency weekend fix
        store.setSelectedMember('m-lam');
        setCurrentView('leader-review');
        break;

      case 'SCENARIO_HEAD_CALIBRATION':
        // Calibration Workspace
        setCurrentView('calibration');
        break;

      case 'SCENARIO_KPI_SIMULATION':
        // KPI v2 Simulation
        setCurrentView('kpi-simulation');
        break;

      case 'SCENARIO_DATA_QUALITY':
        // Hoang Duc Nam missing deadlines
        store.setSelectedMember('m-nam');
        setCurrentView('data-quality');
        break;

      default:
        setCurrentView('executive');
    }
  };

  return (
    <Shell
      currentView={currentView}
      onNavigate={handleNavigate}
      onOpenQuickScenarios={() => setIsScenariosOpen(true)}
    >
      {/* Dynamic View Router */}
      {currentView === 'executive' && (
        <ExecutiveDashboard onNavigate={handleNavigate} onOpenTicket={handleOpenTicket} />
      )}

      {currentView === 'team-analytics' && (
        <TeamDashboard onNavigate={handleNavigate} onOpenTicket={handleOpenTicket} />
      )}

      {currentView === 'my-performance' && (
        <MemberDashboard onNavigate={handleNavigate} onOpenTicket={handleOpenTicket} />
      )}

      {currentView === 'kpi-builder' && (
        <KpiBuilder
          onNavigate={handleNavigate}
          initialTemplateId={viewParams.templateId}
        />
      )}

      {currentView === 'kpi-wizard' && (
        <KpiSetupWizard onNavigate={handleNavigate} />
      )}

      {currentView === 'kpi-templates' && (
        <KpiTemplateManagement onNavigate={handleNavigate} />
      )}

      {currentView === 'kpi-simulation' && (
        <KpiSimulationView onNavigate={handleNavigate} />
      )}

      {currentView === 'version-compare' && (
        <VersionCompareView onNavigate={handleNavigate} />
      )}

      {currentView === 'teams' && (
        <TeamManagement onNavigate={handleNavigate} />
      )}

      {currentView === 'members' && (
        <MemberManagement onNavigate={handleNavigate} />
      )}

      {currentView === 'leader-review' && (
        <LeaderReviewView onNavigate={handleNavigate} onOpenTicket={handleOpenTicket} />
      )}

      {currentView === 'calibration' && (
        <CalibrationView onNavigate={handleNavigate} onOpenTicket={handleOpenTicket} />
      )}

      {currentView === 'system-eval' && (
        <SystemEvaluationView onNavigate={handleNavigate} />
      )}

      {currentView === 'periods' && (
        <PeriodsView onNavigate={handleNavigate} />
      )}

      {currentView === 'historical-analytics' && (
        <HistoricalAnalyticsView onNavigate={handleNavigate} />
      )}

      {currentView === 'data-quality' && (
        <DataQualityView onNavigate={handleNavigate} onOpenTicket={handleOpenTicket} />
      )}

      {currentView === 'jira-integration' && (
        <JiraIntegrationView onOpenTicket={handleOpenTicket} />
      )}

      {currentView === 'rank-scheme' && (
        <RankSchemeView />
      )}

      {currentView === 'audit-log' && (
        <AuditLogView />
      )}

      {currentView === 'metric-library' && (
        <MetricLibraryView onNavigate={handleNavigate} />
      )}

      {/* Global Jira Ticket Drawer */}
      <JiraTicketDrawer
        issue={inspectedIssue}
        isOpen={!!inspectedIssue}
        onClose={() => setInspectedTicketKey(null)}
        onMutateSpForDemo={handleMutateJiraSp}
      />

      {/* Global Judge Scenarios Modal */}
      <JudgeScenariosModal
        isOpen={isScenariosOpen}
        onClose={() => setIsScenariosOpen(false)}
        onRunScenario={handleRunJudgeScenario}
      />
    </Shell>
  );
}
