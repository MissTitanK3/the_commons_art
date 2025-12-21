import { CommonsEvent, EventEffect } from '@/types/global_types';
import { DAY_MS } from '@/utils/time';

export function describeEffect(effect: EventEffect): string {
  const parts: string[] = [];

  if (effect.suppliesFoodDelta !== undefined && effect.suppliesFoodDelta !== 0) {
    parts.push(`Food ${effect.suppliesFoodDelta > 0 ? '+' : ''}${effect.suppliesFoodDelta.toFixed(2)}`);
  }
  if (effect.suppliesShelterDelta !== undefined && effect.suppliesShelterDelta !== 0) {
    parts.push(`Shelter ${effect.suppliesShelterDelta > 0 ? '+' : ''}${effect.suppliesShelterDelta.toFixed(2)}`);
  }
  if (effect.suppliesCareDelta !== undefined && effect.suppliesCareDelta !== 0) {
    parts.push(`Care ${effect.suppliesCareDelta > 0 ? '+' : ''}${effect.suppliesCareDelta.toFixed(2)}`);
  }
  if (effect.foodPriorityBoost !== undefined && effect.foodPriorityBoost !== 0) {
    parts.push(
      `Food priority ${effect.foodPriorityBoost > 0 ? '+' : ''}${(effect.foodPriorityBoost * 100).toFixed(0)}%`,
    );
  }
  if (effect.shelterPriorityBoost !== undefined && effect.shelterPriorityBoost !== 0) {
    parts.push(
      `Shelter priority ${effect.shelterPriorityBoost > 0 ? '+' : ''}${(effect.shelterPriorityBoost * 100).toFixed(
        0,
      )}%`,
    );
  }
  if (effect.carePriorityBoost !== undefined && effect.carePriorityBoost !== 0) {
    parts.push(
      `Care priority ${effect.carePriorityBoost > 0 ? '+' : ''}${(effect.carePriorityBoost * 100).toFixed(0)}%`,
    );
  }

  return parts.length > 0 ? parts.join(', ') : 'No change';
}

export function isEventEligible(lastEventAt?: number) {
  if (!lastEventAt) return true;
  return Date.now() - lastEventAt >= DAY_MS;
}

export function pickEvent() {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}

export const EVENTS: CommonsEvent[] = [
  // ─────────────────────────
  // Material Flow
  // ─────────────────────────

  {
    id: 'extra_food',
    title: 'A neighbor brings extra food',
    body: 'It helps for a while.',
    choices: [
      {
        id: 'A',
        label: 'Distribute broadly',
        effect: () => ({ suppliesFoodDelta: 2 }),
      },
      {
        id: 'B',
        label: 'Hold for later',
        effect: () => ({ suppliesFoodDelta: 1 }),
      },
    ],
  },

  {
    id: 'supply_delay',
    title: 'A delivery arrives later than expected',
    body: 'Plans adjust.',
    choices: [
      {
        id: 'A',
        label: 'Stretch existing supplies',
        effect: () => ({ suppliesFoodDelta: -0.34, suppliesShelterDelta: -0.33, suppliesCareDelta: -0.33 }),
      },
      {
        id: 'B',
        label: 'Reprioritize needs',
        effect: () => ({ foodPriorityBoost: 0.1 }),
      },
    ],
  },

  {
    id: 'shared_storage',
    title: 'Shared storage space becomes available',
    body: 'Coordination reduces waste.',
    choices: [
      {
        id: 'A',
        label: 'Use it for food',
        effect: () => ({ foodPriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Use it for shelter supplies',
        effect: () => ({ shelterPriorityBoost: 0.1 }),
      },
    ],
  },

  // ─────────────────────────
  // Weather & Environment
  // ─────────────────────────

  {
    id: 'cold_weather',
    title: 'Colder weather arrives',
    body: 'Shelter needs rise slightly.',
    choices: [
      {
        id: 'A',
        label: 'Shift attention',
        effect: () => ({ shelterPriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Use extra supplies',
        effect: () => ({ suppliesShelterDelta: -1 }),
      },
    ],
  },

  {
    id: 'heat_wave',
    title: 'A stretch of warm days',
    body: 'People adjust routines.',
    choices: [
      {
        id: 'A',
        label: 'Adapt schedules',
        effect: () => ({ carePriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Use additional resources',
        effect: () => ({ suppliesCareDelta: -1 }),
      },
    ],
  },

  // ─────────────────────────
  // Human Capacity
  // ─────────────────────────

  {
    id: 'volunteer_fatigue',
    title: 'A volunteer needs rest',
    body: 'Pace matters for the long term.',
    choices: [
      {
        id: 'A',
        label: 'Slow things down',
        effect: () => ({ carePriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Redistribute effort',
        effect: () => ({
          foodPriorityBoost: 0.05,
          shelterPriorityBoost: 0.05,
        }),
      },
    ],
  },

  {
    id: 'new_volunteer',
    title: 'Someone new offers help',
    body: 'Capacity increases gently.',
    choices: [
      {
        id: 'A',
        label: 'Pair them with care work',
        effect: () => ({ carePriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Support logistics',
        effect: () => ({ suppliesFoodDelta: 0.5, suppliesShelterDelta: 0.5 }),
      },
    ],
  },

  // ─────────────────────────
  // Coordination Friction
  // ─────────────────────────

  {
    id: 'overlap_effort',
    title: 'Two efforts overlap unintentionally',
    body: 'Communication clarifies things.',
    choices: [
      {
        id: 'A',
        label: 'Align responsibilities',
        effect: () => ({ shelterPriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Let it resolve naturally',
        effect: () => ({ carePriorityBoost: 0.1 }),
      },
    ],
  },

  {
    id: 'miscommunication',
    title: 'A small misunderstanding occurs',
    body: 'Nothing serious, just noise.',
    choices: [
      {
        id: 'A',
        label: 'Talk it through',
        effect: () => ({ carePriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Refocus on tasks',
        effect: () => ({ foodPriorityBoost: 0.1 }),
      },
    ],
  },

  // ─────────────────────────
  // External Support
  // ─────────────────────────

  {
    id: 'community_grant',
    title: 'A small community grant comes through',
    body: 'It eases pressure briefly.',
    choices: [
      {
        id: 'A',
        label: 'Replenish supplies',
        effect: () => ({ suppliesFoodDelta: 0.7, suppliesShelterDelta: 0.7, suppliesCareDelta: 0.6 }),
      },
      {
        id: 'B',
        label: 'Invest in coordination',
        effect: () => ({ carePriorityBoost: 0.1 }),
      },
    ],
  },

  {
    id: 'mutual_aid_offer',
    title: 'Another group offers mutual aid',
    body: 'Reciprocity builds resilience.',
    choices: [
      {
        id: 'A',
        label: 'Accept support',
        effect: () => ({ suppliesFoodDelta: 0.35, suppliesShelterDelta: 0.35, suppliesCareDelta: 0.3 }),
      },
      {
        id: 'B',
        label: 'Share knowledge instead',
        effect: () => ({ carePriorityBoost: 0.1 }),
      },
    ],
  },

  // ─────────────────────────
  // Quiet Periods
  // ─────────────────────────

  {
    id: 'quiet_week',
    title: 'A quiet week passes',
    body: 'Nothing urgent comes up.',
    choices: [
      {
        id: 'A',
        label: 'Maintain routines',
        effect: () => ({ suppliesFoodDelta: 0.35, suppliesShelterDelta: 0.35, suppliesCareDelta: 0.3 }),
      },
      {
        id: 'B',
        label: 'Check in on people',
        effect: () => ({ carePriorityBoost: 0.1 }),
      },
    ],
  },

  {
    id: 'steady_progress',
    title: 'Things feel steady for now',
    body: 'Consistency has its own value.',
    choices: [
      {
        id: 'A',
        label: 'Keep going',
        effect: () => ({ suppliesFoodDelta: 0.35, suppliesShelterDelta: 0.35, suppliesCareDelta: 0.3 }),
      },
      {
        id: 'B',
        label: 'Refine priorities',
        effect: () => ({ foodPriorityBoost: 0.05, shelterPriorityBoost: 0.05 }),
      },
    ],
  },
];
