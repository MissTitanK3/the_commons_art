'use client';

import { create } from 'zustand';
import { DEV_CONFIG } from '@/config/dev';
import { applyTick } from '@/systems/applyTick';
import { isCheckInEligible } from '@/systems/checkin';
import { EVENTS, isEventEligible, pickEvent } from '@/systems/events';
import { getNeedDirection } from '@/systems/needs';
import { normalizePriority } from '@/systems/priority';
import { canSustainScale, getGracePeriodMs, getScaleTierIndex, NEED_GENERATION_RATE } from '@/systems/scaleMetrics';
import { OFFLINE_CAP_MS } from '@/systems/tick';
import { calculateStatus } from '@/systems/status';
import { Storage } from '@/utils/storage';
import { getSelfCareActionTimeRemaining } from '@/utils/time';
import { CommunityScale, CommunityStatus, Needs } from '@/types/core_game_types';

/**
 * Schema version for persisted state
 * Bump this when making breaking changes to the stored state shape.
 * LEAVE HERE
 */
const SCHEMA_VERSION = 4;

export type ScaleOption = {
  key: CommunityScale;
  label: string;
  requirement: number;
};

export type CommonsState = {
  suppliesFood: number;
  suppliesShelter: number;
  suppliesCare: number;
  volunteerTime: number;
  needs: Needs;
  priority: Needs;
  communityScale: CommunityScale;
  communityInvestment: number;
  lastActiveAt: number;
  status: CommunityStatus;
  lastCheckInAt?: number;
  hasSeenCheckIn?: boolean;
  currentEventId?: string;
  lastEventAt?: number;
  eventLog: { id: string; choice: 'A' | 'B'; at: number }[];
  lastUnsustainableAt?: number; // Track when current scale became unsustainable
  selfCareActionTimestamps: Record<string, number>; // Track when each self-care action was last completed

  rolling: {
    supplyTrend: number[];
    needTrend: {
      food: number[];
      shelter: number[];
      care: number[];
    };
  };

  tick: (elapsedSeconds: number) => void;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  resumeFromLastActive: () => void;
  touch: () => void;
  setPriority: (key: keyof Needs, value: number) => void;
  setCommunityScale: (scale: CommunityScale) => void;
  completeSelfCareAction: (actionId: string, category: 'food' | 'shelter' | 'care', bonus: number) => void;
  helpMember: (category: 'food' | 'shelter' | 'care') => void;
  helpMembersMax: (category: 'food' | 'shelter' | 'care') => void;
  isCheckInEligible: () => boolean;
  submitCheckIn: () => void;
  maybeTriggerEvent: () => void;
  resolveEvent: (choiceId: 'A' | 'B') => void;
  getCurrentEvent: () => (typeof EVENTS)[number] | undefined;
  tradeSupplies: (
    from: 'food' | 'shelter' | 'care',
    to: 'food' | 'shelter' | 'care',
    fromAmount: number,
    toAmount: number,
  ) => void;
  devTriggerEvent?: () => void;
  devTriggerCheckIn?: () => void;
  devLogTestEvent?: () => void;
  devReset?: () => Promise<void>;
};

export const DEFAULT_STATE = {
  suppliesFood: 4,
  suppliesShelter: 3,
  suppliesCare: 3,
  volunteerTime: 5,
  needs: { food: 1, shelter: 1, care: 1 },
  priority: { food: 1, shelter: 1, care: 1 },
  communityScale: 'house' as CommunityScale,
  communityInvestment: 0,
  status: 'holding' as CommunityStatus,
  lastCheckInAt: undefined,
  hasSeenCheckIn: false,
  currentEventId: undefined,
  lastEventAt: undefined,
  eventLog: [],
  lastUnsustainableAt: undefined,
  selfCareActionTimestamps: {},

  rolling: {
    supplyTrend: [],
    needTrend: {
      food: [],
      shelter: [],
      care: [],
    },
  },
};

export const useCommonsStore = create<CommonsState>((set, get) => {
  const withTouch = <T extends Partial<CommonsState>>(updates: T) => ({
    ...updates,
    lastActiveAt: Date.now(),
  });

  return {
    ...DEFAULT_STATE,
    lastActiveAt: Date.now(),

    touch: () => {
      set(withTouch({}));
    },

    resumeFromLastActive: () => {
      const state = get();
      const now = Date.now();
      const elapsedMs = Math.min(Math.max(0, now - state.lastActiveAt), OFFLINE_CAP_MS);
      if (elapsedMs <= 0) return;

      get().tick(elapsedMs / 1000);
    },

    tick: (elapsedSeconds) => {
      const state = get();

      const result = applyTick({
        supplies: {
          food: state.suppliesFood,
          shelter: state.suppliesShelter,
          care: state.suppliesCare,
        },
        priority: state.priority,
        volunteerTime: state.volunteerTime,
        elapsedSeconds,
        communityScale: state.communityScale,
      });

      const prevTotal = state.suppliesFood + state.suppliesShelter + state.suppliesCare;
      const nextTotal = result.supplies.food + result.supplies.shelter + result.supplies.care;
      const delta = nextTotal - prevTotal;

      const supplyTrend = [...state.rolling.supplyTrend, delta].slice(-20);

      const needTrend = {
        food: [...state.rolling.needTrend.food, -result.drains.food].slice(-20),
        shelter: [...state.rolling.needTrend.shelter, -result.drains.shelter].slice(-20),
        care: [...state.rolling.needTrend.care, -result.drains.care].slice(-20),
      };

      const status = calculateStatus({
        ...state,
        suppliesFood: result.supplies.food,
        suppliesShelter: result.supplies.shelter,
        suppliesCare: result.supplies.care,
        rolling: {
          supplyTrend,
          needTrend,
        },
      });

      // Check if current scale is sustainable
      const isSustainable = canSustainScale(state.communityScale);
      const now = Date.now();
      let nextLastUnsustainableAt = state.lastUnsustainableAt;
      let nextScale = state.communityScale;
      let nextInvestment = state.communityInvestment;

      if (!isSustainable) {
        // Mark when it became unsustainable (if not already marked)
        if (!state.lastUnsustainableAt) {
          nextLastUnsustainableAt = now;
        }

        // Check if grace period has expired
        if (state.lastUnsustainableAt) {
          const currentTierIndex = getScaleTierIndex(state.communityScale);
          const elapsedSinceUnsustainable = now - state.lastUnsustainableAt;
          const gracePeriodMs = getGracePeriodMs(0); // Always use same grace period based on downgrade count

          if (elapsedSinceUnsustainable > gracePeriodMs && currentTierIndex > 0) {
            // Auto-downgrade
            const scaleTiers: CommunityScale[] = [
              'house',
              'block',
              'village',
              'town',
              'townhall',
              'apartment',
              'neighborhood',
              'district',
              'borough',
              'municipal',
              'city',
              'metropolis',
              'county',
              'province',
              'region',
            ];
            nextScale = scaleTiers[currentTierIndex - 1]!;
            nextLastUnsustainableAt = undefined; // Reset timer for next tier

            // Reset investment accordingly
            const requirements: Record<CommunityScale, number> = {
              house: 0,
              block: 30,
              village: 60,
              town: 95,
              townhall: 135,
              apartment: 180,
              neighborhood: 230,
              district: 285,
              borough: 345,
              municipal: 410,
              city: 480,
              metropolis: 555,
              county: 635,
              province: 720,
              region: 810,
            };
            nextInvestment = Math.max(0, requirements[nextScale]);
          }
        }
      } else {
        // Scale is sustainable again, clear the timer
        nextLastUnsustainableAt = undefined;
      }

      // Generate new needs based on current scale tier (infinite need generation)
      const needGenerationRate = NEED_GENERATION_RATE[nextScale];
      const generatedNeeds = needGenerationRate * elapsedSeconds;
      const totalPriority = state.priority.food + state.priority.shelter + state.priority.care;
      const priorityWeight = (value: number) => (totalPriority === 0 ? 0 : value / totalPriority);

      const newNeeds = {
        food: state.needs.food + generatedNeeds * priorityWeight(state.priority.food),
        shelter: state.needs.shelter + generatedNeeds * priorityWeight(state.priority.shelter),
        care: state.needs.care + generatedNeeds * priorityWeight(state.priority.care),
      };

      set(
        withTouch({
          suppliesFood: result.supplies.food,
          suppliesShelter: result.supplies.shelter,
          suppliesCare: result.supplies.care,
          communityScale: nextScale,
          communityInvestment: nextInvestment,
          lastUnsustainableAt: nextLastUnsustainableAt,
          needs: newNeeds,
          rolling: {
            supplyTrend,
            needTrend,
          },
          status,
        }),
      );
    },

    hydrate: async () => {
      const raw = await Storage.getItem('commons_state');
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        // Treat missing version as compatible to avoid deleting valid state.
        const version = parsed.schemaVersion ?? 1;
        if (version > SCHEMA_VERSION) {
          await Storage.deleteItem('commons_state');
          return;
        }
        const now = Date.now();

        const elapsedMs = Math.min(now - parsed.lastActiveAt, 1000 * 60 * 60 * 8);

        const elapsedSeconds = elapsedMs / 1000;

        // const restoredEvent = parsed.currentEventId ? EVENTS.find((e) => e.id === parsed.currentEventId) : undefined;

        // Migration: v1 -> v2 (single supplies -> per-need supplies)
        const legacySupplies = parsed.supplies ?? 0;
        const migrated = version < 2 && legacySupplies > 0;
        const evenShare = legacySupplies / 3;

        // Migration: v2 -> v3 adds communityScale; v3 -> v4 adds communityInvestment
        const legacyScale = parsed.communityScale ?? 'house';
        const legacyInvestment = parsed.communityInvestment ?? 0;

        set((s) => ({
          ...s,
          ...parsed,
          suppliesFood: parsed.suppliesFood ?? (migrated ? evenShare : s.suppliesFood),
          suppliesShelter: parsed.suppliesShelter ?? (migrated ? evenShare : s.suppliesShelter),
          suppliesCare: parsed.suppliesCare ?? (migrated ? evenShare : s.suppliesCare),
          communityScale: legacyScale,
          communityInvestment: legacyInvestment,
          currentEventId: parsed.currentEventId,
          lastEventAt: parsed.lastEventAt ?? s.lastEventAt,
          lastUnsustainableAt: parsed.lastUnsustainableAt ?? s.lastUnsustainableAt,
          selfCareActionTimestamps: parsed.selfCareActionTimestamps ?? {},
        }));

        set(() => ({
          hasSeenCheckIn: true,
        }));

        if (elapsedSeconds > 0) {
          get().tick(elapsedSeconds);
        }

        set({ lastActiveAt: now });
      } catch {
        // ignore corrupted state
      }
    },

    persist: async () => {
      const state = get();
      await Storage.setItem(
        'commons_state',
        JSON.stringify({
          schemaVersion: SCHEMA_VERSION,
          suppliesFood: state.suppliesFood,
          suppliesShelter: state.suppliesShelter,
          suppliesCare: state.suppliesCare,
          volunteerTime: state.volunteerTime,
          needs: state.needs,
          priority: state.priority,
          communityScale: state.communityScale,
          communityInvestment: state.communityInvestment,
          status: state.status,
          lastActiveAt: state.lastActiveAt,
          currentEventId: state.currentEventId,
          lastEventAt: state.lastEventAt,
          lastUnsustainableAt: state.lastUnsustainableAt,
          eventLog: state.eventLog,
          lastCheckInAt: state.lastCheckInAt,
          hasSeenCheckIn: state.hasSeenCheckIn,
          selfCareActionTimestamps: state.selfCareActionTimestamps,
        }),
      );
    },

    setPriority: (key, value) => {
      const state = get();

      const next = normalizePriority(
        {
          ...state.priority,
          [key]: value,
        },
        key,
      );

      set(withTouch({ priority: next }));
    },

    setCommunityScale: (scale) => {
      const state = get();
      const totalSupplies = state.suppliesFood + state.suppliesShelter + state.suppliesCare;
      const requirements: Record<CommunityScale, number> = {
        house: 0,
        block: 30,
        village: 60,
        town: 95,
        townhall: 135,
        apartment: 180,
        neighborhood: 230,
        district: 285,
        borough: 345,
        municipal: 410,
        city: 480,
        metropolis: 555,
        county: 635,
        province: 720,
        region: 810,
      };

      const required = requirements[scale];
      const currentInvestment = state.communityInvestment;

      if (currentInvestment >= required) {
        // Scale is already unlocked, just switch to it
        set(withTouch({ communityScale: scale }));
        return;
      }

      const gap = required - currentInvestment;
      if (gap <= 0) {
        set(withTouch({ communityScale: scale }));
        return;
      }

      // Need to invest supplies to unlock
      if (totalSupplies < gap) return; // not enough to invest

      const investFromBuckets = (amount: number, buckets: { food: number; shelter: number; care: number }) => {
        const total = buckets.food + buckets.shelter + buckets.care;
        if (total === 0) return { food: 0, shelter: 0, care: 0 };
        const wFood = buckets.food / total;
        const wShelter = buckets.shelter / total;
        const wCare = buckets.care / total;
        return {
          food: Math.min(buckets.food, amount * wFood),
          shelter: Math.min(buckets.shelter, amount * wShelter),
          care: Math.min(buckets.care, amount * wCare),
        };
      };

      const spend = investFromBuckets(gap, {
        food: state.suppliesFood,
        shelter: state.suppliesShelter,
        care: state.suppliesCare,
      });

      // Determine how many members to add based on scale progression
      const membersByScale: Record<CommunityScale, number> = {
        house: 0,
        block: 1,
        village: 1,
        town: 2,
        townhall: 2,
        apartment: 2,
        neighborhood: 3,
        district: 3,
        borough: 4,
        municipal: 4,
        city: 5,
        metropolis: 5,
        county: 6,
        province: 6,
        region: 7,
      };

      const membersToAdd = membersByScale[scale];
      const newNeeds = {
        food: state.needs.food + membersToAdd,
        shelter: state.needs.shelter + membersToAdd,
        care: state.needs.care + membersToAdd,
      };

      set(
        withTouch({
          communityScale: scale,
          communityInvestment: state.communityInvestment + gap,
          suppliesFood: state.suppliesFood - spend.food,
          suppliesShelter: state.suppliesShelter - spend.shelter,
          suppliesCare: state.suppliesCare - spend.care,
          needs: newNeeds,
        }),
      );
    },

    helpMember: (category) => {
      const state = get();

      const supplyKey: 'suppliesFood' | 'suppliesShelter' | 'suppliesCare' =
        category === 'food' ? 'suppliesFood' : category === 'shelter' ? 'suppliesShelter' : 'suppliesCare';

      const currentSupplies = state[supplyKey];
      if (currentSupplies <= 0) return;

      const spend = Math.min(1, currentSupplies);

      set(
        withTouch({
          [supplyKey]: currentSupplies - spend,
          needs: {
            ...state.needs,
            [category]: Math.max(0, state.needs[category] - spend),
          },
        }),
      );
    },

    helpMembersMax: (category) => {
      const state = get();

      const supplyKey: 'suppliesFood' | 'suppliesShelter' | 'suppliesCare' =
        category === 'food' ? 'suppliesFood' : category === 'shelter' ? 'suppliesShelter' : 'suppliesCare';

      const available = state[supplyKey];
      const need = state.needs[category];
      const spend = Math.min(available, need);

      if (spend <= 0) return;

      set(
        withTouch({
          [supplyKey]: available - spend,
          needs: {
            ...state.needs,
            [category]: Math.max(0, need - spend),
          },
        }),
      );
    },

    completeSelfCareAction: (actionId, category, bonus) => {
      const state = get();
      const now = Date.now();
      const remainingMs = getSelfCareActionTimeRemaining(actionId, state.selfCareActionTimestamps);

      // Guard: action still on cooldown
      if (remainingMs > 0) return;

      const updates: Partial<CommonsState> = {
        selfCareActionTimestamps: {
          ...state.selfCareActionTimestamps,
          [actionId]: now,
        },
      };

      // Add supply bonus to the appropriate category
      if (category === 'food') {
        updates.suppliesFood = state.suppliesFood + bonus;
      } else if (category === 'shelter') {
        updates.suppliesShelter = state.suppliesShelter + bonus;
      } else if (category === 'care') {
        updates.suppliesCare = state.suppliesCare + bonus;
      }

      set(withTouch(updates));
    },

    tradeSupplies: (from, to, fromAmount, toAmount) => {
      const state = get();
      const key = (cat: 'food' | 'shelter' | 'care') =>
        cat === 'food' ? 'suppliesFood' : cat === 'shelter' ? 'suppliesShelter' : 'suppliesCare';

      const fromKey = key(from);
      const toKey = key(to);

      const available = state[fromKey];
      if (available < fromAmount || fromAmount <= 0 || toAmount <= 0) return;

      set(
        withTouch({
          [fromKey]: available - fromAmount,
          [toKey]: state[toKey] + toAmount,
        } as Partial<CommonsState>),
      );
    },

    isCheckInEligible: () => {
      const { lastCheckInAt, hasSeenCheckIn } = get();
      return isCheckInEligible(lastCheckInAt, hasSeenCheckIn);
    },

    submitCheckIn: () => {
      const state = get();
      const now = Date.now();

      // Safety check
      if (!isCheckInEligible(state.lastCheckInAt, state.hasSeenCheckIn)) {
        return;
      }

      set(
        withTouch({
          suppliesFood: state.suppliesFood + 1,
          suppliesShelter: state.suppliesShelter + 1,
          suppliesCare: state.suppliesCare + 1,
          lastCheckInAt: now,
        }),
      );
    },

    maybeTriggerEvent: () => {
      const { currentEventId, lastEventAt } = get();

      // Absolute guard
      if (currentEventId) return;

      if (!isEventEligible(lastEventAt)) return;

      const event = pickEvent();
      if (event) {
        set(withTouch({ currentEventId: event.id }));
      }
    },

    resolveEvent: (choiceId) => {
      const state = get();
      const event = EVENTS.find((e) => e.id === state.currentEventId);
      if (!event) return;

      const choice = event.choices.find((c) => c.id === choiceId);
      if (!choice) return;

      const effects = choice.effect(state);
      if (!effects) return;

      // Apply all priority boosts sequentially and normalize to keep totals reasonable.
      let nextPriority = { ...state.priority };
      if (effects.foodPriorityBoost) {
        nextPriority = normalizePriority(
          { ...nextPriority, food: nextPriority.food + effects.foodPriorityBoost },
          'food',
        );
      }
      if (effects.carePriorityBoost) {
        nextPriority = normalizePriority(
          { ...nextPriority, care: nextPriority.care + effects.carePriorityBoost },
          'care',
        );
      }
      if (effects.shelterPriorityBoost) {
        nextPriority = normalizePriority(
          { ...nextPriority, shelter: nextPriority.shelter + effects.shelterPriorityBoost },
          'shelter',
        );
      }

      const foodDelta = effects.suppliesFoodDelta ?? 0;
      const shelterDelta = effects.suppliesShelterDelta ?? 0;
      const careDelta = effects.suppliesCareDelta ?? 0;

      const now = Date.now();

      set(
        withTouch({
          suppliesFood: Math.max(0, state.suppliesFood + foodDelta),
          suppliesShelter: Math.max(0, state.suppliesShelter + shelterDelta),
          suppliesCare: Math.max(0, state.suppliesCare + careDelta),
          priority: nextPriority,
          currentEventId: undefined,
          lastEventAt: now,
          eventLog: [...state.eventLog, { id: event.id, choice: choiceId, at: now }],
        }),
      );

      // Persist immediately so navigating to other pages does not revert to stale state.
      void get().persist();
    },

    getCurrentEvent: () => {
      const id = get().currentEventId;
      return id ? EVENTS.find((e) => e.id === id) : undefined;
    },

    devTriggerEvent: () => {
      if (!DEV_CONFIG.enabled || !DEV_CONFIG.allowManualEventTrigger) return;

      if (get().currentEventId) return;
      const event = pickEvent();
      if (event) {
        set(withTouch({ currentEventId: event.id }));
      }
    },

    devTriggerCheckIn: () => {
      if (!DEV_CONFIG.enabled || !DEV_CONFIG.allowManualCheckIn) return;

      get().submitCheckIn();
    },

    devLogTestEvent: () => {
      if (!DEV_CONFIG.enabled) return;

      const sampleEvent = pickEvent();
      if (!sampleEvent) return;

      // Force a pending decision, overriding any existing pending event for fast testing.
      set(
        withTouch({
          currentEventId: sampleEvent.id,
        }),
      );

      // Persist immediately so navigating between pages keeps the pending decision visible.
      void get().persist();
    },

    devReset: async () => {
      if (!DEV_CONFIG.enabled) return;

      // Clear persisted storage
      await Storage.deleteItem('commons_state');

      // Reset in-memory state
      set(
        withTouch({
          ...DEFAULT_STATE,
          lastUnsustainableAt: undefined,
        }),
      );
    },
  };
});

export function useNeedDirections() {
  const rolling = useCommonsStore((s: CommonsState) => s.rolling.needTrend);

  const avg = (arr: number[]) => (arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length);

  return {
    food: getNeedDirection(avg(rolling.food)),
    shelter: getNeedDirection(avg(rolling.shelter)),
    care: getNeedDirection(avg(rolling.care)),
  };
}
