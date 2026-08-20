import React from 'react';
import { ConfidenceLevel } from '../../types/kpi';
import { ShieldCheck, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  reasons?: string[];
  showText?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  level,
  reasons,
  showText = true,
}) => {
  const configs = {
    HIGH: {
      bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 shadow-xs shadow-emerald-950/50',
      dot: 'bg-emerald-400',
      icon: ShieldCheck,
      label: 'High Confidence',
      tooltip: 'Complete evidence & clean Jira timestamps verified.',
    },
    MEDIUM: {
      bg: 'bg-amber-950/80 text-amber-300 border-amber-800/80 shadow-xs shadow-amber-950/50',
      dot: 'bg-amber-400',
      icon: AlertTriangle,
      label: 'Medium Confidence',
      tooltip: 'Minor data omissions (e.g. missing target deadline on non-critical tasks).',
    },
    LOW: {
      bg: 'bg-orange-950/80 text-orange-300 border-orange-800/80 shadow-xs shadow-orange-950/50',
      dot: 'bg-orange-400',
      icon: AlertCircle,
      label: 'Low Confidence',
      tooltip: 'Missing Story Points or deadlines on multiple committed deliverables.',
    },
    REVIEW_REQUIRED: {
      bg: 'bg-rose-950/80 text-rose-300 border-rose-800/80 shadow-xs shadow-rose-950/50',
      dot: 'bg-rose-400',
      icon: HelpCircle,
      label: 'Review Required',
      tooltip: 'No automated Jira tickets found or critical data missing; requires leader rubric.',
    },
  };

  const config = configs[level] || configs.HIGH;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${config.bg} backdrop-blur-xs`}
      title={reasons && reasons.length > 0 ? reasons.join('; ') : config.tooltip}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {showText && <span className="font-mono text-[11px]">{config.label}</span>}
    </div>
  );
};
