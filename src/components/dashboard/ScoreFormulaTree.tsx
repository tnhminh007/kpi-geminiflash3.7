import React, { useState } from 'react';
import { MemberEvaluation, CriterionEvaluation, JiraIssue } from '../../types/kpi';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import {
  GitCommit,
  Layers,
  Calculator,
  Scale,
  ShieldCheck,
  Award,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Database,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
  UserCheck,
  Crown,
  Lock,
  Workflow
} from 'lucide-react';

interface ScoreFormulaTreeProps {
  evaluation: MemberEvaluation;
  allIssues?: JiraIssue[];
  onOpenTicket: (ticketKey: string) => void;
}

export const ScoreFormulaTree: React.FC<ScoreFormulaTreeProps> = ({
  evaluation,
  allIssues = [],
  onOpenTicket,
}) => {
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({
    [evaluation.criteriaEvaluations[0]?.criterionId || '']: true,
  });

  const [selectedCriterionId, setSelectedCriterionId] = useState<string>(
    evaluation.criteriaEvaluations[0]?.criterionId || ''
  );

  const toggleCriterion = (critId: string) => {
    setExpandedCriteria((prev) => ({
      ...prev,
      [critId]: !prev[critId],
    }));
    setSelectedCriterionId(critId);
  };

  const selectedCriterion =
    evaluation.criteriaEvaluations.find((c) => c.criterionId === selectedCriterionId) ||
    evaluation.criteriaEvaluations[0];

  const totalFinalScore =
    evaluation.finalKpi ??
    evaluation.headKpi ??
    evaluation.leaderKpi ??
    evaluation.systemKpi ??
    0;

  const totalMaxScore = evaluation.criteriaEvaluations.reduce((sum, c) => sum + c.maxScore, 0) || 10;

  // Calculate sum of parts
  const sumOfCriteriaScores = evaluation.criteriaEvaluations.reduce(
    (sum, c) => sum + ((c.finalScore ?? c.headScore ?? c.leaderScore ?? c.systemScore) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Visual Mathematical Formula Equation Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>CÔNG THỨC TRUY VẾT TỔNG HỢP (KPI FORMULA EQUATION)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Final KPI</span>
              <span className="text-indigo-400 font-mono">=</span>
              <span className="text-emerald-400 font-mono">
                ∑ (Tiêu chí <span className="text-xs text-emerald-300/80 font-sans">× Trọng số</span>)
              </span>
              <span className="text-purple-400 font-mono">± Điều chỉnh</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Phiên bản Scheme: <strong className="text-indigo-300">{evaluation.kpiVersion}</strong> • Chu kỳ:{' '}
              <strong className="text-slate-200">{evaluation.periodId}</strong> • Độ tin cậy:{' '}
              <strong className="text-emerald-400">{evaluation.confidence}</strong>
            </p>
          </div>

          {/* Mathematical Result Badge */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 font-mono shadow-inner">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                Điểm KPI Tổng Kết
              </span>
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {totalFinalScore.toFixed(2)}
                </span>
                <span className="text-sm text-slate-500 font-semibold">/ {totalMaxScore.toFixed(0)}</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="space-y-1">
              <span className="px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-700/60 rounded-lg text-xs font-bold block text-center">
                Rank {evaluation.rank || 'A'}
              </span>
              <span className="text-[10px] text-slate-400 font-sans block text-center">
                Thưởng {evaluation.coefficient || 1.0}x
              </span>
            </div>
          </div>
        </div>

        {/* Tree Flow Breadcrumbs Equation */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-mono text-slate-300 pb-1">
          <span className="text-slate-500 uppercase font-bold text-[11px] whitespace-nowrap">Phân rã:</span>
          {evaluation.criteriaEvaluations.map((c, i) => {
            const score = (c.finalScore ?? c.headScore ?? c.leaderScore ?? c.systemScore ?? 0).toFixed(2);
            return (
              <React.Fragment key={c.criterionId}>
                {i > 0 && <span className="text-indigo-400 font-bold px-1">+</span>}
                <button
                  type="button"
                  onClick={() => setSelectedCriterionId(c.criterionId)}
                  className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    selectedCriterionId === c.criterionId
                      ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500 font-bold shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] text-indigo-400">#{i + 1}</span>
                  <span>{c.criterionName}</span>
                  <span className="font-bold text-slate-100 bg-slate-900/80 px-1.5 py-0.5 rounded text-[11px]">
                    {score}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
          <span className="text-slate-500 px-1 font-bold">=</span>
          <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-xl font-bold whitespace-nowrap">
            {sumOfCriteriaScores.toFixed(2)} pts
          </span>
        </div>
      </div>

      {/* 2-Column Formula Tree Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Criteria Tree Navigator (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                CÂY TIÊU CHÍ ĐÓNG GÓP ({evaluation.criteriaEvaluations.length})
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Click xem chi tiết</span>
          </div>

          <div className="space-y-3">
            {evaluation.criteriaEvaluations.map((crit, idx) => {
              const isSelected = selectedCriterionId === crit.criterionId;
              const isExpanded = expandedCriteria[crit.criterionId];
              const score = (crit.finalScore ?? crit.headScore ?? crit.leaderScore ?? crit.systemScore ?? 0).toFixed(2);
              const percentageOfTotal = totalFinalScore > 0 ? (((crit.finalScore ?? crit.systemScore ?? 0) / totalFinalScore) * 100).toFixed(0) : '0';

              return (
                <div
                  key={crit.criterionId}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isSelected
                      ? 'bg-slate-950 border-indigo-500/80 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Tree Node Header */}
                  <div
                    onClick={() => toggleCriterion(crit.criterionId)}
                    className="p-4 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-indigo-950 text-indigo-300 rounded border border-indigo-800/60">
                            W: {crit.maxScore} pts
                          </span>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-indigo-300 transition-colors">
                            {crit.criterionName}
                          </h5>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-2">
                          <span>Đo lường: <strong className="text-slate-300">{crit.metricFormatted || crit.metricKey}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono flex-shrink-0">
                      <span className="text-sm font-black text-indigo-400 block">
                        {score} <span className="text-[10px] text-slate-500 font-normal">/ {crit.maxScore}</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {percentageOfTotal}% tổng điểm
                      </span>
                    </div>
                  </div>

                  {/* Progress Weight Bar */}
                  <div className="px-4 pb-3">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (Number(score) / (crit.maxScore || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick Sub-Tree Metadata */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800/80 text-[11px] font-mono space-y-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Phương thức:</span>
                        <span className="text-slate-200 font-semibold">{crit.evaluationMethod}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Chứng cứ Jira:</span>
                        <span className="text-indigo-400 font-semibold">{crit.evidenceTickets?.length || 0} tickets</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Độ tin cậy:</span>
                        <ConfidenceBadge level={crit.confidence} />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCriterionId(crit.criterionId);
                        }}
                        className="w-full mt-2 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 hover:text-white text-indigo-300 rounded-xl text-[11px] font-bold transition-all border border-indigo-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Xem sơ đồ tính toán chi tiết</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Mathematical Breakdown & Formula Graph (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCriterion ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
              {/* Header of Active Detailed Criterion */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800/60 rounded-lg text-xs font-mono font-bold">
                      {selectedCriterion.criterionCode}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {selectedCriterion.criterionName}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Trọng số tối đa: <strong className="text-slate-200">{selectedCriterion.maxScore} điểm</strong> • Phương thức: <strong className="text-indigo-400">{selectedCriterion.evaluationMethod}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">ĐIỂM TIÊU CHÍ NÀY</span>
                    <div className="text-2xl font-extrabold text-indigo-400">
                      {(selectedCriterion.finalScore ?? selectedCriterion.headScore ?? selectedCriterion.leaderScore ?? selectedCriterion.systemScore ?? 0).toFixed(2)}
                      <span className="text-xs text-slate-500 font-normal"> / {selectedCriterion.maxScore} pts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6-STEP EXPLAINABLE FORMULA FLOWCHART (Visual Tree Nodes) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-indigo-400" />
                    <span>SƠ ĐỒ TRUY VẾT 6 BƯỚC TỪ ARTIFACT ĐẾN ĐIỂM SỐ</span>
                  </span>
                  <ConfidenceBadge level={selectedCriterion.confidence} />
                </div>

                {/* Vertical Visual Flow Pipeline */}
                <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-emerald-500">
                  {/* Step 1: Raw Jira Facts */}
                  <div className="relative pl-12">
                    <div className="absolute left-4 top-3.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 -translate-x-1/2 flex items-center justify-center text-[9px] font-bold text-indigo-300">
                      1
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" />
                          <span>Bước 1: Thu thập sự thật khách quan từ Jira (Facts Ingestion)</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {selectedCriterion.evidenceTickets?.length || 0} Tickets
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        {selectedCriterion.trace?.inputSummary ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                            {Object.entries(selectedCriterion.trace.inputSummary).map(([key, val]) => (
                              <div key={key}>
                                <span className="text-slate-500">{key}: </span>
                                <strong className="text-slate-200">{String(val)}</strong>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>Dữ liệu Jira raw được trích xuất tự động qua Jira REST API.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Formula & Calculation */}
                  <div className="relative pl-12">
                    <div className="absolute left-4 top-3.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 -translate-x-1/2 flex items-center justify-center text-[9px] font-bold text-indigo-300">
                      2
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Bước 2: Áp dụng công thức đo lường (Metric Formula Calculation)</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Giá trị chỉ số thô tính được:</span>
                          <span className="text-base font-bold text-indigo-300">
                            {selectedCriterion.trace?.metricFormatted || selectedCriterion.metricFormatted || 'N/A'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 text-[10px] block">Raw Value:</span>
                          <span className="text-slate-300 font-bold">{selectedCriterion.trace?.metricValue ?? 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Scoring Rules & Thresholds Matching */}
                  <div className="relative pl-12">
                    <div className="absolute left-4 top-3.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-purple-500 -translate-x-1/2 flex items-center justify-center text-[9px] font-bold text-purple-300">
                      3
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-purple-400 flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          <span>Bước 3: Khớp ngưỡng bảng điểm KPI (Scoring Rule Matching)</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          Đạt: {selectedCriterion.systemScore?.toFixed(2)} pts
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-emerald-400 font-semibold block">
                          Rule đã kích hoạt: {selectedCriterion.trace?.ruleAppliedDescription || 'Quy tắc chuẩn theo bảng thang điểm'}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          Hệ thống tự động chấm: {selectedCriterion.systemScore?.toFixed(2)} / {selectedCriterion.maxScore} điểm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Leader Review & Adjustments */}
                  <div className="relative pl-12">
                    <div className="absolute left-4 top-3.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-amber-500 -translate-x-1/2 flex items-center justify-center text-[9px] font-bold text-amber-300">
                      4
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Bước 4: Trưởng nhóm rà soát & Giải trình (Leader Review)</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {selectedCriterion.isLeaderAdjusted ? 'Có điều chỉnh' : 'Giữ nguyên điểm máy'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-sans bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center font-mono">
                          <span className="text-slate-400">Điểm Leader duyệt:</span>
                          <span className="font-bold text-amber-300">{selectedCriterion.leaderScore?.toFixed(2)} pts</span>
                        </div>
                        {selectedCriterion.leaderAdjustmentReason && (
                          <div className="p-2 bg-amber-950/40 border border-amber-800/40 rounded-lg text-amber-200 text-[11px]">
                            <strong>Lý do giải trình:</strong> "{selectedCriterion.leaderAdjustmentReason}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 5: Head of Department Calibration */}
                  <div className="relative pl-12">
                    <div className="absolute left-4 top-3.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-purple-500 -translate-x-1/2 flex items-center justify-center text-[9px] font-bold text-purple-300">
                      5
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-purple-400 flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5" />
                          <span>Bước 5: Trưởng bộ phận hiệu chuẩn (Head Calibration)</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {selectedCriterion.isHeadAdjusted ? 'Hiệu chuẩn phân phối' : 'Đồng thuận Leader'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-sans bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center font-mono">
                          <span className="text-slate-400">Điểm sau Calibration:</span>
                          <span className="font-bold text-purple-300">
                            {(selectedCriterion.headScore ?? selectedCriterion.leaderScore)?.toFixed(2)} pts
                          </span>
                        </div>
                        {selectedCriterion.headAdjustmentReason && (
                          <div className="p-2 bg-purple-950/40 border border-purple-800/40 rounded-lg text-purple-200 text-[11px]">
                            <strong>Lý do hiệu chuẩn:</strong> "{selectedCriterion.headAdjustmentReason}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 6: Immutable Snapshot & Lock */}
                  <div className="relative pl-12">
                    <div className="absolute left-4 top-3.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500 -translate-x-1/2 flex items-center justify-center text-[9px] font-bold text-emerald-300">
                      6
                    </div>
                    <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-800/50 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Bước 6: Khóa kết quả & Snapshot bất biến (Final Snapshot Lock)</span>
                        </span>
                        <span className="font-mono text-[11px] text-emerald-300 font-bold">
                          Final: {(selectedCriterion.finalScore ?? selectedCriterion.headScore ?? selectedCriterion.leaderScore ?? selectedCriterion.systemScore ?? 0).toFixed(2)} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200/80 font-sans">
                        Kết quả được niêm phong mật mã vào kỳ đánh giá, độc lập hoàn toàn và miễn nhiễm với các thay đổi sau này trên Jira.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Jira Tickets List with Direct Drilldown */}
              {selectedCriterion.evidenceTickets && selectedCriterion.evidenceTickets.length > 0 && (
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
                      <GitCommit className="w-4 h-4 text-indigo-400" />
                      <span>DANH SÁCH CHỨNG CỨ JIRA GẮN LIỀN VỚI TIÊU CHÍ NÀY ({selectedCriterion.evidenceTickets.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Bấm vào ticket để mở chi tiết Snapshot</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedCriterion.evidenceTickets.map((key) => {
                      const issueDetail = allIssues.find((iss) => iss.key === key);
                      return (
                        <div
                          key={key}
                          onClick={() => onOpenTicket(key)}
                          className="p-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-indigo-400 group-hover:text-indigo-300">
                                {key}
                              </span>
                              {issueDetail && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                                  {issueDetail.storyPoints || 0} SP
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1 group-hover:text-slate-200">
                              {issueDetail?.summary || `Jira Task ${key}`}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800">
              <p className="text-slate-400 text-sm">Vui lòng chọn tiêu chí để xem công thức truy vết chi tiết.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
