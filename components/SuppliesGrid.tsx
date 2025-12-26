'use client';

import { Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/config/constants';
import { CommonsState, useCommonsStore } from '@/state/store';
import { BASE_SUPPLY_RATE, NEED_DRAIN, TICK_INTERVAL_MS } from '@/systems/tick';
import { buildGrowthProfile } from '@/systems/growthDecisions';

type Props = {
  pendingDecisionCount?: number;
  onEventBellClick?: () => void;
};

export function SuppliesGrid({ pendingDecisionCount = 0, onEventBellClick }: Props) {
  const suppliesFood = useCommonsStore((s: CommonsState) => s.suppliesFood);
  const suppliesShelter = useCommonsStore((s: CommonsState) => s.suppliesShelter);
  const suppliesCare = useCommonsStore((s: CommonsState) => s.suppliesCare);
  const priorityFood = useCommonsStore((s: CommonsState) => s.priority.food);
  const priorityShelter = useCommonsStore((s: CommonsState) => s.priority.shelter);
  const priorityCare = useCommonsStore((s: CommonsState) => s.priority.care);
  const volunteerTime = useCommonsStore((s: CommonsState) => s.volunteerTime);
  const growthDecisionSelections = useCommonsStore((s: CommonsState) => s.growthDecisionSelections);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const growthProfile = useMemo(() => buildGrowthProfile(growthDecisionSelections), [growthDecisionSelections]);

  useEffect(() => {
    refreshTimers.current.forEach(clearTimeout);
    refreshTimers.current = [];

    const start = setTimeout(() => setIsRefreshing(true), 0);
    const stop = setTimeout(() => setIsRefreshing(false), 700); // ~0.7s pulse

    refreshTimers.current.push(start, stop);

    return () => {
      refreshTimers.current.forEach(clearTimeout);
      refreshTimers.current = [];
    };
  }, [suppliesFood, suppliesShelter, suppliesCare]);

  const total = suppliesFood + suppliesShelter + suppliesCare;

  const supplies = [
    { key: 'food', value: suppliesFood },
    { key: 'shelter', value: suppliesShelter },
    { key: 'care', value: suppliesCare },
  ] as const;

  const totalPriority = priorityFood + priorityShelter + priorityCare;
  const secondsPerTick = TICK_INTERVAL_MS / 1000;
  const supplyRate = BASE_SUPPLY_RATE * growthProfile.supplyGainMultiplier;
  const tickLabel = `${secondsPerTick.toFixed(0)}s tick`;
  const strain = Math.min(1.5, 1 + Math.max(0, (8 - volunteerTime) * 0.05));

  const perTickDeltaByKey: Record<typeof supplies[number]['key'], number> = {
    food: (() => {
      const weight = totalPriority === 0 ? 0 : priorityFood / totalPriority;
      const gain = supplyRate * weight * secondsPerTick;
      const drain = NEED_DRAIN.food * priorityFood * secondsPerTick * strain;
      return gain - drain;
    })(),
    shelter: (() => {
      const weight = totalPriority === 0 ? 0 : priorityShelter / totalPriority;
      const gain = supplyRate * weight * secondsPerTick;
      const drain = NEED_DRAIN.shelter * priorityShelter * secondsPerTick * strain;
      return gain - drain;
    })(),
    care: (() => {
      const weight = totalPriority === 0 ? 0 : priorityCare / totalPriority;
      const gain = supplyRate * weight * secondsPerTick;
      const drain = NEED_DRAIN.care * priorityCare * secondsPerTick * strain;
      return gain - drain;
    })(),
  };

  const totalPerTick = perTickDeltaByKey.food + perTickDeltaByKey.shelter + perTickDeltaByKey.care;

  const effectChips = [
    {
      label: 'Supply gain',
      value: `x${growthProfile.supplyGainMultiplier.toFixed(2)}`,
      neutral: Math.abs(growthProfile.supplyGainMultiplier - 1) < 0.001,
    },
    {
      label: 'Need growth',
      value: `x${growthProfile.needGenerationMultiplier.toFixed(2)}`,
      neutral: Math.abs(growthProfile.needGenerationMultiplier - 1) < 0.001,
    },
    {
      label: 'Event +/-',
      value: `x${growthProfile.eventPositiveMultiplier.toFixed(2)} / x${growthProfile.eventNegativeMultiplier.toFixed(2)}`,
      neutral:
        Math.abs(growthProfile.eventPositiveMultiplier - 1) < 0.001 &&
        Math.abs(growthProfile.eventNegativeMultiplier - 1) < 0.001,
    },
    {
      label: 'Resilience bias',
      value: growthProfile.resilienceBias.toFixed(2),
      neutral: Math.abs(growthProfile.resilienceBias) < 0.001,
    },
  ].filter((item) => !item.neutral);

  const baseChip = {
    label: 'Base gain',
    value: `${(BASE_SUPPLY_RATE * secondsPerTick).toFixed(2)} / ${tickLabel}`,
  };

  return (
    <div className={`w-full max-w-sm mx-auto px-4 py-4 bg-surface rounded-xl transition-opacity duration-700 ease-in-out ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Available Supplies</h2>
        <button
          type="button"
          onClick={onEventBellClick}
          className={`relative p-2 rounded-lg border border-border hover:opacity-90 transition-opacity ${pendingDecisionCount > 0 ? 'bg-surface-alt' : 'bg-transparent'}`}
          aria-label={pendingDecisionCount > 0 ? 'View pending decisions' : 'No pending decisions'}
        >
          <Bell size={18} />
          {pendingDecisionCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingDecisionCount}
            </span>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {supplies.map(({ key, value }) => {
          const Icon = CATEGORY_ICONS[key];
          const colorClass = CATEGORY_COLORS[key].icon;
          const label = CATEGORY_LABELS[key];

          return (
            <div
              key={key}
              className="flex items-center justify-between px-3 py-2 pb-3 border-b border-surface-alt last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className={colorClass} />
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{value.toFixed(1)}</div>
                <div className="text-xs text-text opacity-60">
                  {perTickDeltaByKey[key] >= 0 ? '+' : ''}{perTickDeltaByKey[key].toFixed(2)} / {tickLabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-tint mt-3 pt-3">
        <div className="text-center text-sm">
          <span className="font-semibold">Supply Gather Rate: {total.toFixed(1)}</span>
          <div className="text-xs text-text opacity-60 mt-1">
            Net rate: {totalPerTick >= 0 ? '+' : ''}{totalPerTick.toFixed(2)} / {tickLabel}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 justify-center text-[11px] text-text opacity-80">
          <span className="px-2 py-1 rounded-full border border-border bg-surface-alt">
            {baseChip.label}: {baseChip.value}
          </span>
          {effectChips.length === 0 ? (
            <span className="px-2 py-1 rounded-full border border-border bg-surface-alt">
              No additional effects active
            </span>
          ) : (
            effectChips.map((chip) => (
              <span key={chip.label} className="px-2 py-1 rounded-full border border-border bg-surface-alt">
                {chip.label}: {chip.value}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
