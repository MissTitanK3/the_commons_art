'use client';

import { useEffect, useRef } from 'react';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/config/constants';
import { SliderControl } from '@/components/needs/SliderControl';
import { SupplyBucketCard } from '@/components/needs/SupplyBucketCard';
import { TradeButton } from '@/components/needs/TradeButton';
import { useCommonsStore, type CommonsState } from '@/state/store';
import type { Category } from '@/types/core_game_types';
import { BASE_SUPPLY_RATE, TICK_INTERVAL_MS } from '@/systems/tick';

export default function NeedsPage() {
  const suppliesFood = useCommonsStore((s: CommonsState) => s.suppliesFood);
  const suppliesShelter = useCommonsStore((s: CommonsState) => s.suppliesShelter);
  const suppliesCare = useCommonsStore((s: CommonsState) => s.suppliesCare);
  const priorityFood = useCommonsStore((s: CommonsState) => s.priority.food);
  const priorityShelter = useCommonsStore((s: CommonsState) => s.priority.shelter);
  const priorityCare = useCommonsStore((s: CommonsState) => s.priority.care);
  const setPriority = useCommonsStore((s: CommonsState) => s.setPriority);
  const tradeSupplies = useCommonsStore((s: CommonsState) => s.tradeSupplies);
  const hydrate = useCommonsStore((s: CommonsState) => s.hydrate);
  const persist = useCommonsStore((s: CommonsState) => s.persist);
  const touch = useCommonsStore((s: CommonsState) => s.touch);
  const tick = useCommonsStore((s: CommonsState) => s.tick);
  const resumeFromLastActive = useCommonsStore((s: CommonsState) => s.resumeFromLastActive);
  const hydratedRef = useRef(false);

  // Hydrate state when landing on Needs and persist on exit to keep trades/priorities
  useEffect(() => {
    if (typeof window === 'undefined') return;

    hydrate()
      .catch(() => { })
      .finally(() => {
        hydratedRef.current = true;
      });

    const handleBeforeUnload = () => {
      touch();
      persist().catch(() => { });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hydrate, persist, touch]);

  // Run live ticks on this page and briefly dim buckets while updating
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastTickAt = Date.now();
    const runTick = () => {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, (now - lastTickAt) / 1000);
      lastTickAt = now;
      if (!hydratedRef.current) return;
      tick(elapsedSeconds);
    };

    runTick();
    const tickInterval = setInterval(runTick, TICK_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.hidden) {
        touch();
        persist().catch(() => { });
      } else {
        resumeFromLastActive();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(tickInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [tick, touch, persist, resumeFromLastActive]);

  // Persist when priorities change so sliders stick
  useEffect(() => {
    if (typeof window === 'undefined') return;
    persist().catch(() => { });
  }, [persist, priorityFood, priorityShelter, priorityCare]);

  const totalPriority = priorityFood + priorityShelter + priorityCare;
  const priorityZeroFallback = 1 / 3;

  const foodWeight = totalPriority > 0 ? priorityFood / totalPriority : priorityZeroFallback;
  const shelterWeight = totalPriority > 0 ? priorityShelter / totalPriority : priorityZeroFallback;
  const careWeight = totalPriority > 0 ? priorityCare / totalPriority : priorityZeroFallback;

  const foodGainRate = BASE_SUPPLY_RATE * foodWeight;
  const shelterGainRate = BASE_SUPPLY_RATE * shelterWeight;
  const careGainRate = BASE_SUPPLY_RATE * careWeight;

  const supplyBuckets = [
    { category: 'food', value: suppliesFood },
    { category: 'shelter', value: suppliesShelter },
    { category: 'care', value: suppliesCare },
  ] as const;

  const accentByCategory = {
    food: 'bg-red-500',
    shelter: 'bg-blue-500',
    care: 'bg-green-500',
  } as const;

  const supplyByCategory: Record<Category, number> = {
    food: suppliesFood,
    shelter: suppliesShelter,
    care: suppliesCare,
  };

  const trades: Array<{ from: Category; to: Category }> = [
    { from: 'food', to: 'shelter' },
    { from: 'food', to: 'care' },
    { from: 'shelter', to: 'food' },
    { from: 'shelter', to: 'care' },
    { from: 'care', to: 'food' },
    { from: 'care', to: 'shelter' },
  ];

  const handleTrade = (from: 'food' | 'shelter' | 'care', to: 'food' | 'shelter' | 'care', fromAmount: number, toAmount: number) => {
    tradeSupplies(from, to, fromAmount, toAmount);
    persist().catch(() => { });
  };

  return (
    <main className="min-h-screen bg-background text-text overflow-x-hidden px-4">
      {/* Header */}
      <section className="pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Balancing Needs</h1>
        <p className="text-sm text-text opacity-70">
          Adjust priorities and trade supplies to ensure all community needs are met effectively.
        </p>
      </section>

      {/* Supply Buckets Overview */}
      <section className="max-w-sm mx-auto mb-8">
        <h2 className="text-base font-semibold mb-3">Supply Buckets</h2>
        <div className="flex gap-3 justify-center">
          {supplyBuckets.map(({ category, value }) => (
            <SupplyBucketCard key={category} category={category} value={value} />
          ))}
        </div>
      </section>

      {/* Priority Sliders */}
      <section className="max-w-sm mx-auto mb-8">
        <p className="text-sm text-text opacity-75 mb-6">
          Adjust how quickly each need is addressed. Higher priority routes more supply gain and drain to that need.
        </p>

        <SliderControl
          label="Food"
          value={priorityFood}
          onChange={(value) => setPriority('food', value)}
          gainRate={foodGainRate}
          Icon={CATEGORY_ICONS.food}
          accentClassName={accentByCategory.food}
          iconClassName={CATEGORY_COLORS.food.icon}
        />

        <SliderControl
          label="Shelter"
          value={priorityShelter}
          onChange={(value) => setPriority('shelter', value)}
          gainRate={shelterGainRate}
          Icon={CATEGORY_ICONS.shelter}
          accentClassName={accentByCategory.shelter}
          iconClassName={CATEGORY_COLORS.shelter.icon}
        />

        <SliderControl
          label="Care"
          value={priorityCare}
          onChange={(value) => setPriority('care', value)}
          gainRate={careGainRate}
          Icon={CATEGORY_ICONS.care}
          accentClassName={accentByCategory.care}
          iconClassName={CATEGORY_COLORS.care.icon}
        />

        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 dim:bg-surface-alt dim:border dim:border-border rounded-lg">
          <p className="text-xs text-text opacity-80 dim:text-foreground dim:opacity-90">
            Tip: If one need is critical, bump its slider; you can trade supplies below to rebalance buckets.
          </p>
        </div>
      </section>

      {/* Trade Supplies */}
      <section className="max-w-sm mx-auto pb-8">
        <h2 className="text-base font-semibold mb-4">Trade Supplies</h2>

        <div className="space-y-3">
          {trades.map(({ from, to }) => (
            <TradeButton
              key={`${from}-${to}`}
              from={from}
              to={to}
              fromAmount={1}
              toAmount={1}
              canAfford={supplyByCategory[from] >= 1}
              onTrade={() => handleTrade(from, to, 1, 1)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}