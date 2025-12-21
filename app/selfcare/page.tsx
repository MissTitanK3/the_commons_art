'use client';

import { CategorySection } from '@/components/selfcare/CategorySection';
import { useEffect, useState } from 'react';
import { CommonsState, useCommonsStore } from '@/state/store';
import { COOLDOWN_MS, formatTimeRemaining, getSelfCareActionTimeRemaining } from '@/utils/time';
import type { Category } from '@/types/core_game_types';
import { SELF_CARE_ACTIONS } from '@/config/constants';

export default function SelfCarePage() {
  const completeSelfCareAction = useCommonsStore((s: CommonsState) => s.completeSelfCareAction);
  const selfCareActionTimestamps = useCommonsStore((s: CommonsState) => s.selfCareActionTimestamps);
  const hydrate = useCommonsStore((s: CommonsState) => s.hydrate);
  const persist = useCommonsStore((s: CommonsState) => s.persist);
  const touch = useCommonsStore((s: CommonsState) => s.touch);
  const [timeRemainings, setTimeRemainings] = useState<Record<string, string>>({});

  // Ensure store is hydrated on this route and persist on exit
  useEffect(() => {
    if (typeof window === 'undefined') return;

    hydrate().catch(() => { });

    const handleBeforeUnload = () => {
      touch();
      persist().catch(() => { });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hydrate, persist, touch]);

  // Persist whenever self-care timestamps change to keep cooldowns intact across visits
  useEffect(() => {
    if (typeof window === 'undefined') return;
    persist().catch(() => { });
  }, [persist, selfCareActionTimestamps]);

  // Update cooldown display every second
  useEffect(() => {
    const updateTimers = () => {
      const newTimes: Record<string, string> = {};

      Object.keys(SELF_CARE_ACTIONS).forEach((category) => {
        SELF_CARE_ACTIONS[category as keyof typeof SELF_CARE_ACTIONS].forEach((action) => {
          const remaining = getSelfCareActionTimeRemaining(action.id, selfCareActionTimestamps);
          newTimes[action.id] = formatTimeRemaining(remaining);
        });
      });

      setTimeRemainings(newTimes);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [selfCareActionTimestamps]);

  const handleCompleteAction = (actionId: string, category: Category, bonus: number) => {
    completeSelfCareAction(actionId, category, bonus);
    // Update the timer immediately based on new completion
    setTimeRemainings((prev) => ({ ...prev, [actionId]: formatTimeRemaining(COOLDOWN_MS) }));
    persist().catch(() => { });
  };

  return (
    <main className="min-h-screen bg-background text-text overflow-x-hidden px-4">
      {/* Header */}
      <section className="pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Self-Care</h1>
        <p className="text-sm text-text opacity-70 mb-1">Take care of yourself. Each action provides a daily supply bonus.</p>
        <p className="text-xs text-text opacity-60 italic">Actions refresh after 24 hours</p>
      </section>

      {/* Category Sections */}
      <section className="space-y-8 pb-8">
        {(['food', 'shelter', 'care'] as const).map((category) => {
          return (
            <CategorySection
              key={category}
              category={category}
              actions={SELF_CARE_ACTIONS[category]}
              timeRemainings={timeRemainings}
              getRemainingMs={(actionId) => getSelfCareActionTimeRemaining(actionId, selfCareActionTimestamps)}
              onComplete={(actionId, bonus) => handleCompleteAction(actionId, category, bonus)}
            />
          );
        })}
      </section>
    </main>
  );
}