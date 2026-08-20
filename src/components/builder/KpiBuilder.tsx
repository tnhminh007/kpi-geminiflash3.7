import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { store } from '../../services/stateStorage';
import {
  KpiTemplate,
  Criterion,
  EvaluationMethod,
  EvidenceSourceType,
  ScoringRuleType,
  ScoringThresholdItem,
} from '../../types/kpi';
import { SYSTEM_METRIC_LIBRARY } from '../../services/metricLibrary';
import { evaluateScoringRule } from '../../services/kpiEngine';
import { ScoreExplanationTrace } from '../common/ScoreExplanationTrace';
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  Save,
  ArrowRight,
  Database,
  Calculator,
  ShieldCheck,
  FileCheck,
  Send,
  Layers,
} from 'lucide-react';

interface KpiBuilderProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
  initialTemplateId?: string;
}

export const KpiBuilder: React.FC<KpiBuilderProps> = ({
  onNavigate,
  initialTemplateId,
}) => {
  const state = useStore();
  const selectedTemplate =
    state.kpiTemplates.find((t) => t.id === initialTemplateId) ||
    state.kpiTemplates.find((t) => t.status === 'DRAFT') ||
    state.kpiTemplates[0];

  const [activeTemplateId, setActiveTemplateId] = useState<string>(selectedTemplate.id);
  const currentTemplate = state.kpiTemplates.find((t) => t.id === activeTemplateId) || selectedTemplate;

  const [selectedCriterionId, setSelectedCriterionId] = useState<string>(
    currentTemplate.criteria[0]?.id || ''
  );

  const selectedCriterion =
    currentTemplate.criteria.find((c) => c.id === selectedCriterionId) ||
    currentTemplate.criteria[0];

  // Live Interactive Simulator test inputs
  const [simCommittedSp, setSimCommittedSp] = useState<number>(50);
  const [simCompletedSp, setSimCompletedSp] = useState<number>(46);
  const [simOnTimeSp, setSimOnTimeSp] = useState<number>(44);
  const [simBugCount, setSimBugCount] = useState<number>(1);
  const [simIncidentCount, setSimIncidentCount] = useState<number>(0);
  const [simSharingCount, setSimSharingCount] = useState<number>(2);

  // Calculate live preview metrics
  const totalMaxScore = currentTemplate.criteria.reduce((acc, c) => acc + c.maxScore, 0);
  const isScoreValid = Math.abs(totalMaxScore - 10.0) < 0.05;

  // Simulator calculation for active criterion
  let simMetricValue = 88;
  let simMetricFormatted = '88%';

  if (selectedCriterion) {
    const key = selectedCriterion.metricConfig?.metricKey || selectedCriterion.code;
    if (key === 'ON_TIME_COMPLETION_RATE' || selectedCriterion.name.toLowerCase().includes('on-time')) {
      simMetricValue = simCompletedSp > 0 ? Math.round((simOnTimeSp / simCompletedSp) * 100) : 85;
      simMetricFormatted = `${simMetricValue}%`;
    } else if (key === 'TASK_COMPLETION_RATE' || key === 'COMPLETED_STORY_POINTS') {
      simMetricValue = simCommittedSp > 0 ? Math.round((simCompletedSp / simCommittedSp) * 100) : 90;
      simMetricFormatted = `${simMetricValue}%`;
    } else if (key === 'BUG_RATE' || selectedCriterion.name.toLowerCase().includes('quality')) {
      simMetricValue = Number(((simBugCount / (simCompletedSp || 10)) * 100).toFixed(1));
      simMetricFormatted = `${simMetricValue}% Defects`;
    } else if (key === 'INCIDENT_COUNT' || selectedCriterion.name.toLowerCase().includes('incident')) {
      simMetricValue = simIncidentCount;
      simMetricFormatted = `${simIncidentCount} Incidents`;
    } else {
      simMetricValue = simSharingCount;
      simMetricFormatted = `${simSharingCount} Sessions`;
    }
  }

  const liveRuleResult = selectedCriterion
    ? evaluateScoringRule(simMetricValue, selectedCriterion.maxScore, selectedCriterion.scoringRule)
    : { score: 0, ruleDescription: 'No criterion selected' };

  // Handlers for modifying current template
  const handleUpdateCriterion = (updated: Partial<Criterion>) => {
    if (!selectedCriterion) return;
    const updatedCriteria = currentTemplate.criteria.map((c) =>
      c.id === selectedCriterion.id ? { ...c, ...updated } : c
    );
    store.updateKpiTemplate(currentTemplate.id, { criteria: updatedCriteria });
  };

  const handleAddCriterion = () => {
    const newId = `crit-${Date.now()}`;
    const newCrit: Criterion = {
      id: newId,
      name: 'New Performance Criterion',
      code: `CRIT_${currentTemplate.criteria.length + 1}`,
      description: 'Describe performance expectations and measurement rubric.',
      maxScore: 2.0,
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
          { id: 'th1', operator: '>=', value: 90, score: 2.0, label: '>= 90% -> 2.0 pts' },
          { id: 'th2', operator: '>=', value: 80, score: 1.5, label: '80% - 89% -> 1.5 pts' },
          { id: 'th3', operator: '<', value: 80, score: 1.0, label: '< 80% -> 1.0 pt' },
        ],
        fallbackScore: 1.0,
      },
      reviewRequired: false,
    };

    const updatedCriteria = [...currentTemplate.criteria, newCrit];
    store.updateKpiTemplate(currentTemplate.id, { criteria: updatedCriteria });
    setSelectedCriterionId(newId);
  };

  const handleDeleteCriterion = (id: string) => {
    if (currentTemplate.criteria.length <= 1) {
      alert('A KPI template must contain at least one criterion.');
      return;
    }
    const updatedCriteria = currentTemplate.criteria.filter((c) => c.id !== id);
    store.updateKpiTemplate(currentTemplate.id, { criteria: updatedCriteria });
    if (selectedCriterionId === id) {
      setSelectedCriterionId(updatedCriteria[0].id);
    }
  };

  const handleThresholdChange = (
    index: number,
    field: keyof ScoringThresholdItem,
    val: any
  ) => {
    if (!selectedCriterion) return;
    const newThresholds = [...selectedCriterion.scoringRule.thresholds];
    newThresholds[index] = { ...newThresholds[index], [field]: val };
    handleUpdateCriterion({
      scoringRule: {
        ...selectedCriterion.scoringRule,
        thresholds: newThresholds,
      },
    });
  };

  const handleAddThreshold = () => {
    if (!selectedCriterion) return;
    const newTh: ScoringThresholdItem = {
      id: `th-${Date.now()}`,
      operator: '>=',
      value: 70,
      score: Math.max(0.5, selectedCriterion.maxScore * 0.5),
      label: '>= 70% -> Standard',
    };
    handleUpdateCriterion({
      scoringRule: {
        ...selectedCriterion.scoringRule,
        thresholds: [...selectedCriterion.scoringRule.thresholds, newTh],
      },
    });
  };

  const handleRemoveThreshold = (index: number) => {
    if (!selectedCriterion) return;
    const newThresholds = selectedCriterion.scoringRule.thresholds.filter((_, i) => i !== index);
    handleUpdateCriterion({
      scoringRule: {
        ...selectedCriterion.scoringRule,
        thresholds: newThresholds,
      },
    });
  };

  const handlePublish = () => {
    if (!isScoreValid) {
      alert(`Cannot publish: Total max score must equal 10.0 pts (currently ${totalMaxScore.toFixed(1)} pts).`);
      return;
    }
    store.publishKpiTemplate(currentTemplate.id, state.currentPeriodCode);
    alert(`Successfully published ${currentTemplate.name} for period ${state.currentPeriodCode}!`);
  };

  const handleCloneNewVersion = () => {
    const cloned = store.cloneKpiTemplate(currentTemplate.id);
    if (cloned) {
      setActiveTemplateId(cloned.id);
      setSelectedCriterionId(cloned.criteria[0]?.id || '');
      alert(`Cloned as ${cloned.name}! You can now edit and publish.`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Top Builder Control Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={activeTemplateId}
                onChange={(e) => {
                  setActiveTemplateId(e.target.value);
                  const tpl = state.kpiTemplates.find((t) => t.id === e.target.value);
                  if (tpl && tpl.criteria.length > 0) {
                    setSelectedCriterionId(tpl.criteria[0].id);
                  }
                }}
                className="font-bold text-sm text-slate-900 bg-transparent border-0 focus:ring-0 cursor-pointer pr-4"
              >
                {state.kpiTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.version}) - {t.status}
                  </option>
                ))}
              </select>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                  currentTemplate.status === 'PUBLISHED' || currentTemplate.status === 'IN_USE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {currentTemplate.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {currentTemplate.criteria.length} Criteria Configured • Total Score Target: 10.0 pts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Total Score Validation Pill */}
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
              isScoreValid
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
            }`}
          >
            {isScoreValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>Total: {totalMaxScore.toFixed(1)} / 10.0 pts</span>
          </div>

          <button
            type="button"
            onClick={handleCloneNewVersion}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Clone as New Version</span>
          </button>

          {currentTemplate.status === 'DRAFT' && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={!isScoreValid}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                isScoreValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Version</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-COLUMN WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT COLUMN: Criteria List & Ordering (3 cols) */}
        <div className="lg:col-span-3 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Criteria Hierarchy
            </span>
            <button
              type="button"
              onClick={handleAddCriterion}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
            {currentTemplate.criteria.map((crit, idx) => {
              const isSelected = crit.id === selectedCriterionId;
              return (
                <div
                  key={crit.id}
                  onClick={() => setSelectedCriterionId(crit.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5 overflow-hidden">
                    <span className="text-slate-400 font-mono text-xs mt-0.5">{idx + 1}.</span>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-xs text-slate-900 truncate">
                        {crit.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.2 bg-slate-100 rounded font-mono text-[10px] text-slate-700">
                          {crit.evaluationMethod}
                        </span>
                        <span>•</span>
                        <span className="font-mono font-bold text-blue-700">
                          {crit.maxScore.toFixed(1)} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCriterion(crit.id);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Delete Criterion"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex justify-between font-mono">
            <span>Criteria Count: {currentTemplate.criteria.length}</span>
            <span className="font-bold text-slate-900">{totalMaxScore.toFixed(1)} / 10.0 pts</span>
          </div>
        </div>

        {/* CENTER COLUMN: Criterion Editor & Rule Builder (5 cols) */}
        <div className="lg:col-span-5 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
          {selectedCriterion ? (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* General Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    1. Criterion Definition
                  </h3>
                  <span className="text-xs font-mono text-blue-600 font-semibold">
                    Code: {selectedCriterion.code}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Criterion Title
                    </label>
                    <input
                      type="text"
                      value={selectedCriterion.name}
                      onChange={(e) => handleUpdateCriterion({ name: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Max Score
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="10"
                      value={selectedCriterion.maxScore}
                      onChange={(e) =>
                        handleUpdateCriterion({ maxScore: parseFloat(e.target.value) || 0.5 })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Measurement Description
                  </label>
                  <textarea
                    rows={2}
                    value={selectedCriterion.description}
                    onChange={(e) => handleUpdateCriterion({ description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-blue-500"
                  />
                </div>
              </div>

              {/* Evaluation Method Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  2. Evaluation Method
                </h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { method: 'AUTO', title: 'AUTO', desc: 'Data → Metric → Rule → Score' },
                    { method: 'ASSISTED', title: 'ASSISTED', desc: 'Data → Suggested → Human Review' },
                    { method: 'MANUAL', title: 'MANUAL', desc: 'Evidence → Human Evaluation' },
                  ].map((item) => (
                    <button
                      key={item.method}
                      type="button"
                      onClick={() =>
                        handleUpdateCriterion({ evaluationMethod: item.method as EvaluationMethod })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedCriterion.evaluationMethod === item.method
                          ? 'bg-blue-50 border-blue-500 text-blue-900 font-medium ring-1 ring-blue-500/30'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold">{item.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-snug">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric & Evidence Mapping */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  3. Metric & Evidence Source
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Metric Definition</label>
                    <select
                      value={selectedCriterion.metricConfig?.metricKey || 'ON_TIME_COMPLETION_RATE'}
                      onChange={(e) => {
                        const mDef = SYSTEM_METRIC_LIBRARY.find((m) => m.key === e.target.value);
                        if (mDef) {
                          handleUpdateCriterion({
                            metricConfig: {
                              metricId: mDef.id,
                              metricKey: mDef.key,
                              metricName: mDef.name,
                              includedIssueTypes: mDef.supportedIssueTypes,
                              completionStatuses: ['Done', 'Closed'],
                              deadlineField: 'duedate',
                              periodAttribution: 'RESOLVED_DATE',
                              storyPointWeighted: true,
                              excludeCancelled: true,
                            },
                          });
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                    >
                      {SYSTEM_METRIC_LIBRARY.map((m) => (
                        <option key={m.key} value={m.key}>
                          {m.name} ({m.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Evidence Source</label>
                    <select
                      value={selectedCriterion.evidenceSource}
                      onChange={(e) =>
                        handleUpdateCriterion({
                          evidenceSource: e.target.value as EvidenceSourceType,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                    >
                      <option value="JIRA">Jira Issue Tracking System</option>
                      <option value="CONFLUENCE_DOCS">Confluence Specs & RFCs</option>
                      <option value="MANUAL_EVIDENCE">Manual Evidence Upload</option>
                      <option value="CUSTOM_SOURCE">Custom Telemetry Source</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Scoring Rule Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    4. Visual Scoring Rules
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddThreshold}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Tier</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedCriterion.scoringRule.thresholds.map((th, index) => (
                    <div
                      key={th.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono"
                    >
                      <span className="text-slate-400 font-sans text-[11px] w-5">{index + 1}.</span>
                      <select
                        value={th.operator}
                        onChange={(e) => handleThresholdChange(index, 'operator', e.target.value)}
                        className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs"
                      >
                        <option value=">=">&gt;=</option>
                        <option value=">">&gt;</option>
                        <option value="<=">&lt;=</option>
                        <option value="<">&lt;</option>
                        <option value="==">==</option>
                        <option value="BETWEEN">BETWEEN</option>
                      </select>

                      <input
                        type="number"
                        value={th.value}
                        onChange={(e) =>
                          handleThresholdChange(index, 'value', parseFloat(e.target.value) || 0)
                        }
                        className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-800"
                      />

                      <span className="text-slate-500 font-sans text-xs">points:</span>

                      <input
                        type="number"
                        step="0.1"
                        max={selectedCriterion.maxScore}
                        value={th.score}
                        onChange={(e) =>
                          handleThresholdChange(index, 'score', parseFloat(e.target.value) || 0)
                        }
                        className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-blue-700"
                      />

                      <input
                        type="text"
                        placeholder="Label"
                        value={th.label || ''}
                        onChange={(e) => handleThresholdChange(index, 'label', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-sans text-slate-700"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveThreshold(index)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select or add a criterion to begin configuration.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Interactive Score Simulator & Explainability (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50 flex flex-col h-full overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Live Rule Simulation</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-semibold">
              Instant Feedback
            </span>
          </div>

          {/* Test Inputs */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="font-semibold text-slate-800 text-[11px] flex justify-between">
              <span>Interactive Input Sliders</span>
              <span className="text-blue-600 font-mono">Live Testing</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Committed Story Points:</span>
                <span className="font-mono font-bold text-slate-800">{simCommittedSp} SP</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={simCommittedSp}
                onChange={(e) => setSimCommittedSp(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Completed Story Points:</span>
                <span className="font-mono font-bold text-slate-800">{simCompletedSp} SP</span>
              </div>
              <input
                type="range"
                min="0"
                max={simCommittedSp}
                value={simCompletedSp}
                onChange={(e) => setSimCompletedSp(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">On-time Story Points:</span>
                <span className="font-mono font-bold text-emerald-700">{simOnTimeSp} SP</span>
              </div>
              <input
                type="range"
                min="0"
                max={simCompletedSp}
                value={simOnTimeSp}
                onChange={(e) => setSimOnTimeSp(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          {/* Real-time Explainable Score Trace */}
          {selectedCriterion && (
            <div className="space-y-3">
              <div className="font-bold text-xs text-slate-800">
                Score Explanation Trace
              </div>
              <ScoreExplanationTrace
                trace={{
                  inputSummary: {
                    committedSP: simCommittedSp,
                    completedSP: simCompletedSp,
                    onTimeSP: simOnTimeSp,
                    defectCount: simBugCount,
                  },
                  metricValue: simMetricValue,
                  metricFormatted: simMetricFormatted,
                  ruleAppliedDescription: liveRuleResult.ruleDescription,
                  suggestedScore: liveRuleResult.score,
                  maxScore: selectedCriterion.maxScore,
                  confidence: 'HIGH',
                  confidenceReasons: ['Simulated verified Jira artifacts.'],
                  evidenceCount: 12,
                  evidenceSummary: '12 Verified tickets linked',
                  ticketKeys: ['API-842', 'API-910', 'API-951'],
                }}
                criterionName={selectedCriterion.name}
                compact={true}
              />
            </div>
          )}

          {/* Summary Box */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold block mb-1">Configure, Don't Hard-code:</span>
            Any adjustments made in this rule builder immediately propagate to system suggested evaluations without modifying backend source code.
          </div>
        </div>
      </div>
    </div>
  );
};
