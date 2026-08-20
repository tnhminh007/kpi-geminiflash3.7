import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import {
  Criterion,
  EvaluationMethod,
  EvidenceSourceType,
} from '../../types/kpi';
import { SYSTEM_METRIC_LIBRARY } from '../../services/metricLibrary';
import {
  Wand2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Send,
  Building2,
  Users,
  FileCode2,
  ShieldCheck,
  Calculator,
} from 'lucide-react';

interface KpiSetupWizardProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const KpiSetupWizard: React.FC<KpiSetupWizardProps> = ({ onNavigate }) => {
  const state = useStore();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State across wizard steps
  const [teamName, setTeamName] = useState('Video Platform Engineering');
  const [teamCode, setTeamCode] = useState('VID');
  const [teamDescription, setTeamDescription] = useState(
    'Live streaming infrastructure, WebRTC transcoding cluster, and HLS video delivery.'
  );
  const [leaderName, setLeaderName] = useState('Vu Dinh Trong');
  const [leaderEmail, setLeaderEmail] = useState('trong.vu@enterprise.vn');

  // Criteria State (Defaulting to the exact Scenario 1 contest prompt: 4 - 3 - 2 - 1 = 10)
  const [criteria, setCriteria] = useState<Criterion[]>([
    {
      id: 'crit-vid-1',
      name: 'Sprint Delivery Velocity & Transcoding Features',
      code: 'DELIVERY',
      description: 'On-time story points delivered for live transcoding pipeline.',
      maxScore: 4.0,
      evaluationMethod: 'AUTO',
      evidenceSource: 'JIRA',
      metricConfig: {
        metricId: 'm-ontime-rate',
        metricKey: 'ON_TIME_COMPLETION_RATE',
        metricName: 'On-time Completion Rate',
        includedIssueTypes: ['Story', 'Task'],
        completionStatuses: ['Done'],
        deadlineField: 'duedate',
        periodAttribution: 'RESOLVED_DATE',
        storyPointWeighted: true,
        excludeCancelled: true,
      },
      scoringRule: {
        type: 'THRESHOLD',
        thresholds: [
          { id: 'v1', operator: '>=', value: 95, score: 4.0, label: '>= 95% -> 4.0 pts' },
          { id: 'v2', operator: '>=', value: 88, score: 3.2, label: '88% - 94% -> 3.2 pts' },
          { id: 'v3', operator: '<', value: 88, score: 2.0, label: '< 88% -> 2.0 pts' },
        ],
        fallbackScore: 2.0,
      },
      reviewRequired: false,
    },
    {
      id: 'crit-vid-2',
      name: 'Video Quality & Low Buffer Ratio',
      code: 'QUALITY',
      description: 'Zero streaming stutter defects or playback bugs.',
      maxScore: 3.0,
      evaluationMethod: 'AUTO',
      evidenceSource: 'JIRA',
      metricConfig: {
        metricId: 'm-bug-rate',
        metricKey: 'BUG_RATE',
        metricName: 'Defect & Bug Ratio',
        includedIssueTypes: ['Bug'],
        completionStatuses: ['Done'],
        deadlineField: 'duedate',
        periodAttribution: 'RESOLVED_DATE',
        storyPointWeighted: false,
        excludeCancelled: true,
      },
      scoringRule: {
        type: 'THRESHOLD',
        thresholds: [
          { id: 'vq1', operator: '<=', value: 5, score: 3.0, label: '<= 5% Defects -> 3.0 pts' },
          { id: 'vq2', operator: '<=', value: 10, score: 2.2, label: '5.1% - 10% -> 2.2 pts' },
          { id: 'vq3', operator: '>', value: 10, score: 1.0, label: '> 10% -> 1.0 pt' },
        ],
        fallbackScore: 1.0,
      },
      reviewRequired: true,
    },
    {
      id: 'crit-vid-3',
      name: 'P1 Live Broadcast Outage Defense',
      code: 'INCIDENT',
      description: 'Zero live broadcast failure incidents during peak traffic.',
      maxScore: 2.0,
      evaluationMethod: 'AUTO',
      evidenceSource: 'JIRA',
      metricConfig: {
        metricId: 'm-incident-count',
        metricKey: 'INCIDENT_COUNT',
        metricName: 'P1 / P2 Production Incident Count',
        includedIssueTypes: ['Incident'],
        completionStatuses: ['Done'],
        deadlineField: 'duedate',
        periodAttribution: 'RESOLVED_DATE',
        storyPointWeighted: false,
        excludeCancelled: true,
      },
      scoringRule: {
        type: 'THRESHOLD',
        thresholds: [
          { id: 'vi1', operator: '==', value: 0, score: 2.0, label: '0 Outages -> 2.0 pts' },
          { id: 'vi2', operator: '>=', value: 1, score: 0.5, label: '>= 1 Outage -> 0.5 pt' },
        ],
        fallbackScore: 0.5,
      },
      reviewRequired: false,
    },
    {
      id: 'crit-vid-4',
      name: 'Video Protocol RFCs & Knowledge Sharing',
      code: 'KNOWLEDGE_SHARING',
      description: 'WebRTC and AV1 streaming architecture workshops.',
      maxScore: 1.0,
      evaluationMethod: 'MANUAL',
      evidenceSource: 'CONFLUENCE_DOCS',
      scoringRule: {
        type: 'THRESHOLD',
        thresholds: [
          { id: 'vk1', operator: '>=', value: 1, score: 1.0, label: 'Complete -> 1.0 pt' },
          { id: 'vk2', operator: '<', value: 1, score: 0.4, label: 'Partial -> 0.4 pt' },
        ],
        fallbackScore: 0.4,
      },
      reviewRequired: true,
    },
  ]);

  const totalScore = criteria.reduce((acc, c) => acc + c.maxScore, 0);
  const isValid = Math.abs(totalScore - 10.0) < 0.01;

  const handleFinishAndPublish = () => {
    // 1. Create the team
    const createdTeam = store.createTeam({
      name: teamName,
      code: teamCode,
      description: teamDescription,
      leaderId: `m-lead-${teamCode.toLowerCase()}`,
      leaderName: leaderName,
      criteriaList: criteria,
    });

    // 2. Add leader as member
    store.addMemberToTeam({
      name: leaderName,
      email: leaderEmail,
      title: `${teamName} Lead`,
      level: 'Staff Engineer',
      teamId: createdTeam.id,
      jiraUsername: `${leaderName.toLowerCase().replace(/\s+/g, '.')}`,
    });

    alert(
      `🎉 Success! Team "${teamName}" created with 4 custom criteria (Total = 10 pts) and published for ${state.currentPeriodCode} without any code changes!`
    );

    onNavigate('teams');
  };

  const steps = [
    { num: 1, label: 'Team Setup' },
    { num: 2, label: 'Leadership' },
    { num: 3, label: 'Criteria (4-3-2-1)' },
    { num: 4, label: 'Scoring Rules' },
    { num: 5, label: 'Review & Publish' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Wizard Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              KPI Setup Wizard
            </h1>
            <p className="text-xs text-slate-500">
              Configure a brand new Team and custom KPI schema end-to-end without code modifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-mono font-bold rounded-lg border border-blue-200">
            Step {currentStep} of {steps.length}
          </span>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-5 gap-2 text-xs">
        {steps.map((step) => (
          <div
            key={step.num}
            onClick={() => setCurrentStep(step.num)}
            className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
              currentStep === step.num
                ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-2xs'
                : currentStep > step.num
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <div className="text-[10px] opacity-80">STEP 0{step.num}</div>
            <div className="truncate">{step.label}</div>
          </div>
        ))}
      </div>

      {/* STEP 1: Team Setup */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Define Organization & Team Details</h2>
            <p className="text-xs text-slate-500">Create an arbitrary engineering team under Backend Department.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
                placeholder="e.g. Video Platform Engineering"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Team Code (Prefix)
              </label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold uppercase"
                placeholder="VID"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Mission & Architectural Description
            </label>
            <textarea
              rows={3}
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="Describe team domain responsibilities..."
            />
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Arbitrary Hierarchy:</span> The system dynamically provisions team structures and period memberships on the fly.
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Leadership & Members */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Assign Team Leadership & Members</h2>
            <p className="text-xs text-slate-500">Designate the primary Team Lead for review sign-off.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Leader Full Name
              </label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Corporate Email
              </label>
              <input
                type="email"
                value={leaderEmail}
                onChange={(e) => setLeaderEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800">Assigned Evaluation Period:</div>
            <div className="text-slate-600 font-mono">{state.currentPeriodCode} (Effective from active month)</div>
          </div>
        </div>
      )}

      {/* STEP 3: Define Criteria (4-3-2-1 = 10) */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Configure Performance Criteria</h2>
              <p className="text-xs text-slate-500">Demo Scenario 1: Delivery (4), Quality (3), Incident (2), Knowledge (1).</p>
            </div>

            <div
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                isValid
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300 animate-pulse'
              }`}
            >
              Total Score: {totalScore.toFixed(1)} / 10.0 pts
            </div>
          </div>

          <div className="space-y-3">
            {criteria.map((crit, index) => (
              <div
                key={crit.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 font-mono">#{index + 1}</span>
                    <input
                      type="text"
                      value={crit.name}
                      onChange={(e) => {
                        const copy = [...criteria];
                        copy[index].name = e.target.value;
                        setCriteria(copy);
                      }}
                      className="font-bold text-slate-900 bg-white px-2 py-1 border border-slate-200 rounded text-xs w-80"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Max Score:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="10"
                      value={crit.maxScore}
                      onChange={(e) => {
                        const copy = [...criteria];
                        copy[index].maxScore = parseFloat(e.target.value) || 0.5;
                        setCriteria(copy);
                      }}
                      className="w-16 px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-blue-700"
                    />
                    <span className="font-mono text-slate-400">pts</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block mb-1 text-[11px]">Evaluation Method:</span>
                    <select
                      value={crit.evaluationMethod}
                      onChange={(e) => {
                        const copy = [...criteria];
                        copy[index].evaluationMethod = e.target.value as EvaluationMethod;
                        setCriteria(copy);
                      }}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold"
                    >
                      <option value="AUTO">AUTO (Algorithmic)</option>
                      <option value="ASSISTED">ASSISTED (Human Review)</option>
                      <option value="MANUAL">MANUAL (Rubric)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1 text-[11px]">Evidence Source:</span>
                    <select
                      value={crit.evidenceSource}
                      onChange={(e) => {
                        const copy = [...criteria];
                        copy[index].evidenceSource = e.target.value as EvidenceSourceType;
                        setCriteria(copy);
                      }}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                    >
                      <option value="JIRA">Jira Issue Tracking</option>
                      <option value="CONFLUENCE_DOCS">Confluence Documentation</option>
                      <option value="MANUAL_EVIDENCE">Manual Evidence Upload</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1 text-[11px]">Metric Key:</span>
                    <input
                      type="text"
                      value={crit.metricConfig?.metricKey || crit.code}
                      readOnly
                      className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Visual Scoring Rules */}
      {currentStep === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Scoring Rules & Thresholds</h2>
            <p className="text-slate-500">Configured thresholds automatically convert metric values into score points.</p>
          </div>

          <div className="space-y-4">
            {criteria.map((crit) => (
              <div key={crit.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{crit.name}</span>
                  <span className="text-blue-700 font-mono">{crit.maxScore} Max pts</span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  {crit.scoringRule.thresholds.map((th) => (
                    <div key={th.id} className="p-1.5 bg-white rounded border border-slate-200 flex justify-between">
                      <span>{th.operator} {th.value}%</span>
                      <span className="font-bold text-blue-700">→ {th.score} pts ({th.label})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: Final Review & Publish */}
      {currentStep === 5 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Summary & Publication Review</h2>
            <p className="text-slate-500">Ready to publish and apply this KPI version to {state.currentPeriodCode}.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Team Overview</div>
              <div className="font-bold text-sm text-slate-900">{teamName} ({teamCode})</div>
              <div className="text-slate-600">Lead: {leaderName} ({leaderEmail})</div>
              <div className="text-slate-600">Department: {state.department.name}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">KPI Version Scheme</div>
              <div className="font-bold text-sm text-slate-900">{teamCode}_KPI_V1 (v1.0)</div>
              <div className="text-emerald-700 font-bold font-mono">Total Maximum Score: 10.0 / 10.0 pts</div>
              <div className="text-slate-600">{criteria.length} Criteria Configured</div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Contest Scenario 1 Verification Passed</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Delivery (4.0) + Quality (3.0) + Incident (2.0) + Knowledge Sharing (1.0) = 10.0 pts.
            </p>
          </div>
        </div>
      )}

      {/* Wizard Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            currentStep === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        {currentStep < steps.length ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishAndPublish}
            disabled={!isValid}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish Team & KPI Schema</span>
          </button>
        )}
      </div>
    </div>
  );
};
