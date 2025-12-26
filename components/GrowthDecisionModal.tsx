'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useMemo } from 'react';

import { SCALE_LABELS } from '@/config/constants';
import { CommonsState, useCommonsStore } from '@/state/store';
import { findGrowthDecision, getValueFlagLabel } from '@/systems/growthDecisions';

type GrowthDecisionModalProps = {
  open: boolean;
  onClose: () => void;
};

export function GrowthDecisionModal({ open, onClose }: GrowthDecisionModalProps) {
  const pendingDecisionId = useCommonsStore((s: CommonsState) => s.pendingGrowthDecisionId);
  const chooseGrowthDecision = useCommonsStore((s: CommonsState) => s.chooseGrowthDecision);

  const decision = useMemo(() => findGrowthDecision(pendingDecisionId), [pendingDecisionId]);

  if (!open || !pendingDecisionId || !decision) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-surface rounded-xl border border-border shadow-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase opacity-70">{decision.theme}</p>
            <h2 className="text-lg font-semibold">{decision.prompt}</h2>
            <p className="text-xs text-text opacity-70">
              {SCALE_LABELS[decision.from]} {'->'} {SCALE_LABELS[decision.to]} ({decision.range[0]} {'->'} {decision.range[1]})
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-alt" aria-label="Close growth decision">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3">
          <AlertTriangle size={14} />
          <span>Choices are permanent. There are no timers or fail states.</span>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] text-text opacity-70">
          {decision.systemsAffected.map((system) => (
            <span key={system} className="px-2 py-1 rounded-full bg-surface-alt border border-border">
              {system}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          {decision.choices.map((choice) => (
            <button
              key={choice.key}
              onClick={() => {
                chooseGrowthDecision(decision.id, choice.key);
                onClose();
              }}
              className="w-full text-left p-4 rounded-lg border border-border bg-surface-alt hover:border-text transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{choice.title}</p>
                  <p className="text-[11px] text-text opacity-70">
                    Identity: {getValueFlagLabel(choice.valueFlag ?? choice.key, choice.title)}
                  </p>
                </div>
                <span className="text-[11px] text-text opacity-70">Permanent</span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-text opacity-85 list-disc list-inside">
                {choice.effects.map((effect) => (
                  <li key={effect}>{effect}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <p className="text-xs text-text opacity-70">
          Effects bias behavior quietly in the background. Events and text will reference the value flags you set.
        </p>
      </div>
    </div>
  );
}
