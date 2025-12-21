'use client';

import { Star, X } from 'lucide-react';

import { SCALE_LABELS } from '@/config/constants';
import { CommonsState, useCommonsStore } from '@/state/store';

export function PrestigeModal() {
  const pendingPrestigeSummary = useCommonsStore((s: CommonsState) => s.pendingPrestigeSummary);
  const cancelPrestigeSummary = useCommonsStore((s: CommonsState) => s.cancelPrestigeSummary);
  const prestige = useCommonsStore((s: CommonsState) => s.prestige);

  if (!pendingPrestigeSummary) return null;

  const { starToEarn, highestTier, decisions, identitySummary } = pendingPrestigeSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-lg max-h-[90vh] bg-surface rounded-xl border border-border shadow-xl p-5 space-y-4 overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase opacity-70">Legacy Reflection</p>
            <h2 className="text-lg font-semibold">This community is complete.</h2>
            <p className="text-sm text-text opacity-75">What remains is what it chose to be.</p>
          </div>
          <button onClick={cancelPrestigeSummary} className="p-2 rounded-lg hover:bg-surface-alt" aria-label="Close prestige reflection">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-lg border border-border bg-surface-alt p-3 space-y-2 text-sm">
          <div className="flex items-start justify-between text-sm font-semibold">
            <span>Legacy Marker</span>
          </div>
          <div className="flex items-end justify-between gap-1">

            <span className="text-amber-600 dark:text-amber-300">Community Star</span>
            <span className="text-amber-600 dark:text-amber-300 flex gap-2 items-center">{starToEarn}<Star size={15} fill='currentColor' /></span>
          </div>
          <p className="text-xs text-text opacity-70">Highest tier reached: {SCALE_LABELS[highestTier]}</p>
          <p className="text-xs text-text opacity-80">{identitySummary}</p>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <p className="text-sm font-semibold">Values remembered</p>
          {decisions.length === 0 && (
            <p className="text-xs text-text opacity-70">No key decisions were recorded.</p>
          )}
          {decisions.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-surface-alt p-3 text-xs space-y-1">
              <p className="font-semibold">{item.tier}</p>
              <p className="opacity-80">{item.prompt}</p>
              <p className="font-semibold">Chosen: {item.choice}</p>
              <p className="opacity-80">Result: {item.summary}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-xs text-text opacity-80">
          <p>Two paths remain. There is no pressure.</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={prestige}
              className="w-full py-2 px-3 rounded-lg border-2 border-amber-500 text-amber-700 dark:text-amber-200 font-semibold hover:opacity-90"
            >
              Begin Again with ★{starToEarn}
            </button>
            <button
              onClick={cancelPrestigeSummary}
              className="w-full py-2 px-3 rounded-lg border border-border font-semibold hover:opacity-90"
            >
              Remain in this world
            </button>
          </div>
          <p className="text-[11px] opacity-70">
            Prestige grants identity, not speed. Requirements grow by 25% per star; no resources carry over.
          </p>
        </div>
      </div>
    </div>
  );
}
