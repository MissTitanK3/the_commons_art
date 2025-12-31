'use client';

import { CheckCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/config/constants';
import { UB_COPY } from '@/copy/strings';
import { CommonsState, useCommonsStore } from '@/state/store';
import {
  getUbContributionPlan,
  getUbRequirements,
  UB_KEYS,
  type UniversalBasicKey,
} from '@/systems/universalBasics';

export function UniversalBasicsPanel() {
  const ubProgress = useCommonsStore((s: CommonsState) => s.ubProgress);
  const ubActiveCredits = useCommonsStore((s: CommonsState) => s.ubActiveCredits);
  const suppliesFood = useCommonsStore((s: CommonsState) => s.suppliesFood);
  const suppliesShelter = useCommonsStore((s: CommonsState) => s.suppliesShelter);
  const suppliesCare = useCommonsStore((s: CommonsState) => s.suppliesCare);
  const contributeUniversalBasicManual = useCommonsStore((s: CommonsState) => s.contributeUniversalBasicManual);

  const [inputByUb, setInputByUb] = useState<Record<UniversalBasicKey, { food: string; shelter: string; care: string }>>(
    () =>
      UB_KEYS.reduce(
        (acc, key) => {
          acc[key] = { food: '', shelter: '', care: '' };
          return acc;
        },
        {} as Record<UniversalBasicKey, { food: string; shelter: string; care: string }>,
      ),
  );

  const available = { food: suppliesFood, shelter: suppliesShelter, care: suppliesCare };

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-4 bg-surface rounded-xl space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Universal Basics</h2>
        </div>
        <Sparkles size={18} className="text-tint" aria-hidden />
      </div>

      <div className="text-xs text-text opacity-80">{UB_COPY.todayOnlyHint}</div>

      <div className="space-y-3">
        {UB_KEYS.map((key) => {
          const def = UB_COPY[key];
          const ratios = getUbRequirements(key);
          const progressState = ubProgress[key] ?? { contributed: { food: 0, shelter: 0, care: 0 }, completed: false };
          const plan = getUbContributionPlan({
            key,
            contributed: progressState.contributed,
            available,
          });

          const displayProgress = plan.currentProgress;
          const isCompleted = progressState.completed;
          const activeToday = ubActiveCredits[key];
          const inputs = inputByUb[key];
          const parsedSpend = {
            food: parseFloat(inputs.food || '0'),
            shelter: parseFloat(inputs.shelter || '0'),
            care: parseFloat(inputs.care || '0'),
          };
          const totalPlanned = [parsedSpend.food, parsedSpend.shelter, parsedSpend.care]
            .filter((v) => !Number.isNaN(v))
            .reduce((sum, v) => sum + Math.max(0, v), 0);
          const contributionDisabled = isCompleted || totalPlanned <= 0;
          const progressPercent = Math.round(displayProgress * 100);

          const ratioBadges = [
            { key: 'food' as const, value: ratios.food },
            { key: 'shelter' as const, value: ratios.shelter },
            { key: 'care' as const, value: ratios.care },
          ];

          const nextEffectCopy = activeToday
            ? def.active
            : isCompleted
              ? def.completion
              : `Complete to feel: ${def.completion}`;

          return (
            <div key={key} className="p-3 rounded-lg bg-surface-alt border border-border space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{def.name}</div>
                  <div className="flex flex-wrap gap-2 mt-1 w-full justify-between items-center">
                    {ratioBadges.map(({ key: categoryKey, value }) => {
                      const Icon = CATEGORY_ICONS[categoryKey];
                      const colors = CATEGORY_COLORS[categoryKey];
                      return (
                        <span
                          key={categoryKey}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] border border-border bg-background"
                        >
                          <Icon size={12} className={colors.icon} />
                          <span className="font-semibold">{value.toFixed(0)}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {activeToday && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-green-600/10 text-green-600 dark:text-green-300">
                    <CheckCircle size={12} />
                    Active today
                  </span>
                )}
              </div>

              <div className="relative h-3 rounded-full bg-surface-alt overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-tint/10" aria-hidden />
                <div
                  className="absolute inset-y-0 left-0 bg-linear-to-r from-tint via-emerald-400/70 to-amber-400/60 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                  aria-hidden
                />
              </div>
              <div className="flex items-center justify-between text-xs text-text opacity-80">
                <span>{progressPercent}% of today&apos;s bar</span>
              </div>

              <div className="text-xs text-text opacity-80 leading-snug">{nextEffectCopy}</div>

              <div className="flex items-start justify-between gap-3 w-full">
                <div className="text-[11px] text-text opacity-70 flex flex-col gap-2 w-full">
                  <span>
                    Remaining today:{' '}
                    {`${Math.max(0, plan.requirements.food - progressState.contributed.food).toFixed(1)} ${CATEGORY_LABELS.food}, `}
                    {`${Math.max(0, plan.requirements.shelter - progressState.contributed.shelter).toFixed(1)} ${CATEGORY_LABELS.shelter}, `}
                    {`${Math.max(0, plan.requirements.care - progressState.contributed.care).toFixed(1)} ${CATEGORY_LABELS.care}`}
                  </span>
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {(['food', 'shelter', 'care'] as const).map((cat) => {
                      const Icon = CATEGORY_ICONS[cat];
                      const colors = CATEGORY_COLORS[cat];
                      const maxAvailable =
                        cat === 'food' ? suppliesFood : cat === 'shelter' ? suppliesShelter : suppliesCare;
                      return (
                        <label key={cat} className="flex items-center gap-2 text-[11px]">
                          <Icon size={12} className={colors.icon} />
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={inputs[cat]}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === '') {
                                setInputByUb((prev) => ({
                                  ...prev,
                                  [key]: { ...prev[key], [cat]: '' },
                                }));
                                return;
                              }
                              const parsed = Math.floor(Number(raw));
                              const clamped = Math.min(Math.max(parsed, 0), Math.floor(maxAvailable));
                              setInputByUb((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], [cat]: Number.isNaN(clamped) ? '' : clamped.toString() },
                              }));
                            }}
                            className="w-full px-2 py-1 rounded border border-border bg-background text-xs"
                            placeholder="0"
                            aria-label={`Contribute ${CATEGORY_LABELS[cat]} to ${def.name}`}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    contributeUniversalBasicManual(key, parsedSpend);
                    setInputByUb((prev) => ({
                      ...prev,
                      [key]: { food: '', shelter: '', care: '' },
                    }));
                  }}
                  disabled={contributionDisabled}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-opacity ${contributionDisabled
                    ? 'opacity-60 cursor-not-allowed border-border'
                    : 'border-border bg-surface hover:opacity-90'
                    }`}
                >
                  {isCompleted ? 'Completed' : 'Contribute'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
