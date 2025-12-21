'use client';

import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/config/constants';
import { CommonsState, useCommonsStore } from '@/state/store';
import { BASE_SUPPLY_RATE, NEED_DRAIN, TICK_INTERVAL_MS } from '@/systems/tick';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

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
  const efficiency = Math.min(1, volunteerTime / 10);

  const perTickDeltaByKey: Record<typeof supplies[number]['key'], number> = {
    food: (() => {
      const weight = totalPriority === 0 ? 0 : priorityFood / totalPriority;
      const gain = BASE_SUPPLY_RATE * weight * secondsPerTick;
      const drain = NEED_DRAIN.food * priorityFood * secondsPerTick * efficiency;
      return gain - drain;
    })(),
    shelter: (() => {
      const weight = totalPriority === 0 ? 0 : priorityShelter / totalPriority;
      const gain = BASE_SUPPLY_RATE * weight * secondsPerTick;
      const drain = NEED_DRAIN.shelter * priorityShelter * secondsPerTick * efficiency;
      return gain - drain;
    })(),
    care: (() => {
      const weight = totalPriority === 0 ? 0 : priorityCare / totalPriority;
      const gain = BASE_SUPPLY_RATE * weight * secondsPerTick;
      const drain = NEED_DRAIN.care * priorityCare * secondsPerTick * efficiency;
      return gain - drain;
    })(),
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
                  {perTickDeltaByKey[key] >= 0 ? '+' : ''}{perTickDeltaByKey[key].toFixed(2)} / tick
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-tint mt-3 pt-3">
        <div className="text-center text-sm">
          <span className="font-semibold">Total: {total.toFixed(1)} supplies</span>
          <div className="text-xs text-text opacity-60 mt-1">
            Drains shown per 5s tick (higher volunteer time reduces loss)
          </div>
        </div>
      </div>
    </div>
  );
}
