import { CommonsEvent, EventEffect } from '@/types/global_types';
import { EVENT_INTERVAL_MS, MIN_EVENT_SPACING_MS } from '@/utils/time';

const DEFAULT_WIPE_RISK = {
  chance: 0.15,
  minFraction: 0.5,
  maxFraction: 0.75,
};

// Scale all supply deltas (positive and negative) to make impacts meaningful but not overwhelming.
const SUPPLY_DELTA_SCALE = 120;
const PRIORITY_BOOST_SCALE = 10;

const staticEffect = (effect: EventEffect) => {
  const scaled = applyEffectScale(effect);
  return {
    effect: () => ({ ...scaled }),
    effectDescription: describeEffect(scaled),
  };
};

const applyEffectScale = (effect: EventEffect): EventEffect => {
  const scaled: EventEffect = { ...effect };
  if (scaled.suppliesFoodDelta !== undefined) scaled.suppliesFoodDelta *= SUPPLY_DELTA_SCALE;
  if (scaled.suppliesShelterDelta !== undefined) scaled.suppliesShelterDelta *= SUPPLY_DELTA_SCALE;
  if (scaled.suppliesCareDelta !== undefined) scaled.suppliesCareDelta *= SUPPLY_DELTA_SCALE;
  if (scaled.foodPriorityBoost !== undefined) scaled.foodPriorityBoost *= PRIORITY_BOOST_SCALE;
  if (scaled.shelterPriorityBoost !== undefined) scaled.shelterPriorityBoost *= PRIORITY_BOOST_SCALE;
  if (scaled.carePriorityBoost !== undefined) scaled.carePriorityBoost *= PRIORITY_BOOST_SCALE;
  return scaled;
};

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
  if (effect.wipeRisk) {
    parts.push(
      `Wipe risk ${(effect.wipeRisk.chance * 100).toFixed(0)}%: ${(effect.wipeRisk.minFraction * 100).toFixed(
        0,
      )}–${(effect.wipeRisk.maxFraction * 100).toFixed(0)}% ${effect.wipeRisk.target}`,
    );
  }

  return parts.length > 0 ? parts.join(', ') : 'No change';
}

export function isEventEligible(lastEventAt?: number) {
  if (!lastEventAt) return true;
  const elapsed = Date.now() - lastEventAt;
  const cooldown = Math.max(EVENT_INTERVAL_MS, MIN_EVENT_SPACING_MS);
  return elapsed >= cooldown;
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
        ...staticEffect({ suppliesFoodDelta: 2 }),
      },
      {
        id: 'B',
        label: 'Hold for later',
        ...staticEffect({ suppliesFoodDelta: 1 }),
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
        ...staticEffect({
          suppliesFoodDelta: -0.34,
          suppliesShelterDelta: -0.33,
          suppliesCareDelta: -0.33,
          wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'food' },
        }),
      },
      {
        id: 'B',
        label: 'Reprioritize needs',
        ...staticEffect({ foodPriorityBoost: 0.1 }),
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
        ...staticEffect({ foodPriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Use it for shelter supplies',
        ...staticEffect({ shelterPriorityBoost: 0.1 }),
      },
    ],
  },

  {
    id: 'spoiled_shipment',
    title: 'A shipment spoils en route',
    body: 'Not everything can be saved.',
    choices: [
      {
        id: 'A',
        label: 'Compost and move on',
        ...staticEffect({ suppliesFoodDelta: -1, wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'food' } }),
      },
      {
        id: 'B',
        label: 'Salvage what you can',
        ...staticEffect({ suppliesFoodDelta: -0.4, wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'food' } }),
      },
      {
        id: 'C',
        label: 'Ask for replacements',
        ...staticEffect({ foodPriorityBoost: 0.12 }),
      },
    ],
  },

  {
    id: 'community_potluck',
    title: 'Neighbors plan a potluck',
    body: 'Food and care circulate together.',
    choices: [
      {
        id: 'A',
        label: 'Open invite',
        ...staticEffect({ suppliesFoodDelta: 1.2, carePriorityBoost: 0.05 }),
      },
      {
        id: 'B',
        label: 'Keep it simple',
        ...staticEffect({ suppliesFoodDelta: 0.6 }),
      },
      {
        id: 'C',
        label: 'Save leftovers',
        ...staticEffect({ suppliesFoodDelta: 0.45, suppliesCareDelta: 0.2 }),
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
        ...staticEffect({ shelterPriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Use extra supplies',
        ...staticEffect({
          suppliesShelterDelta: -1,
          wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'shelter' },
        }),
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
        ...staticEffect({ carePriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Use additional resources',
        ...staticEffect({
          suppliesCareDelta: -1,
          wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'care' },
        }),
      },
    ],
  },

  {
    id: 'storm_alert',
    title: 'Storm alerts come through',
    body: 'People brace for rough weather.',
    choices: [
      {
        id: 'A',
        label: 'Board up and prep',
        ...staticEffect({
          suppliesShelterDelta: -0.5,
          wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'shelter' },
        }),
      },
      {
        id: 'B',
        label: 'Stage response routes',
        ...staticEffect({ shelterPriorityBoost: 0.1 }),
      },
      {
        id: 'C',
        label: 'Check on neighbors',
        ...staticEffect({ carePriorityBoost: 0.1 }),
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
        ...staticEffect({ carePriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Redistribute effort',
        ...staticEffect({
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
        ...staticEffect({ carePriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Support logistics',
        ...staticEffect({ suppliesFoodDelta: 0.5, suppliesShelterDelta: 0.5 }),
      },
    ],
  },

  {
    id: 'equipment_failure',
    title: 'Key equipment fails',
    body: 'Repairs will take effort.',
    choices: [
      {
        id: 'A',
        label: 'Divert repairs immediately',
        ...staticEffect({
          suppliesShelterDelta: -0.8,
          wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'shelter' },
        }),
      },
      {
        id: 'B',
        label: 'Rally neighbors to fix it',
        ...staticEffect({ shelterPriorityBoost: 0.12 }),
      },
      {
        id: 'C',
        label: 'Pause expansion plans',
        ...staticEffect({ carePriorityBoost: 0.05 }),
      },
    ],
  },

  {
    id: 'festival_rush',
    title: 'A local festival needs support',
    body: 'Attention gets pulled briefly.',
    choices: [
      {
        id: 'A',
        label: 'Host an info booth',
        ...staticEffect({
          suppliesCareDelta: -0.6,
          wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'care' },
        }),
      },
      {
        id: 'B',
        label: 'Rotate shifts carefully',
        ...staticEffect({ carePriorityBoost: 0.1 }),
      },
      {
        id: 'C',
        label: 'Share food with visitors',
        ...staticEffect({
          suppliesFoodDelta: -0.2,
          wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'food' },
        }),
      },
    ],
  },

  {
    id: 'mentor_visit',
    title: 'A mentor visits the team',
    body: 'Fresh perspective arrives.',
    choices: [
      {
        id: 'A',
        label: 'Pair them with logistics',
        ...staticEffect({ suppliesFoodDelta: 0.5, suppliesShelterDelta: 0.5 }),
      },
      {
        id: 'B',
        label: 'Run a training session',
        ...staticEffect({ carePriorityBoost: 0.12 }),
      },
      {
        id: 'C',
        label: 'Document best practices',
        ...staticEffect({ foodPriorityBoost: 0.05, shelterPriorityBoost: 0.05 }),
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
        ...staticEffect({ shelterPriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Let it resolve naturally',
        ...staticEffect({ carePriorityBoost: 0.1 }),
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
        ...staticEffect({ carePriorityBoost: 0.1 }),
      },
      {
        id: 'B',
        label: 'Refocus on tasks',
        ...staticEffect({ foodPriorityBoost: 0.1 }),
      },
    ],
  },

  {
    id: 'festival_overlap',
    title: 'Multiple invites collide',
    body: 'Scheduling gets tricky.',
    choices: [
      {
        id: 'A',
        label: 'Prioritize essentials',
        ...staticEffect({ foodPriorityBoost: 0.08, shelterPriorityBoost: 0.08 }),
      },
      {
        id: 'B',
        label: 'Split teams',
        ...staticEffect({ carePriorityBoost: 0.08 }),
      },
      {
        id: 'C',
        label: 'Decline extras',
        ...staticEffect({ suppliesCareDelta: 0.3 }),
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
        ...staticEffect({ suppliesFoodDelta: 0.7, suppliesShelterDelta: 0.7, suppliesCareDelta: 0.6 }),
      },
      {
        id: 'B',
        label: 'Invest in coordination',
        ...staticEffect({ carePriorityBoost: 0.1 }),
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
        ...staticEffect({ suppliesFoodDelta: 0.35, suppliesShelterDelta: 0.35, suppliesCareDelta: 0.3 }),
      },
      {
        id: 'B',
        label: 'Share knowledge instead',
        ...staticEffect({ carePriorityBoost: 0.1 }),
      },
    ],
  },

  {
    id: 'mentor_exchange',
    title: 'A nearby crew invites a skills swap',
    body: 'Shared learning can pay off.',
    choices: [
      {
        id: 'A',
        label: 'Send supplies as thanks',
        ...staticEffect({
          suppliesFoodDelta: -0.3,
          suppliesShelterDelta: -0.3,
          wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'food' },
        }),
      },
      {
        id: 'B',
        label: 'Host the training',
        ...staticEffect({ carePriorityBoost: 0.08 }),
      },
      {
        id: 'C',
        label: 'Trade notes only',
        ...staticEffect({ foodPriorityBoost: 0.05 }),
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
        ...staticEffect({ suppliesFoodDelta: 0.35, suppliesShelterDelta: 0.35, suppliesCareDelta: 0.3 }),
      },
      {
        id: 'B',
        label: 'Check in on people',
        ...staticEffect({ carePriorityBoost: 0.1 }),
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
        ...staticEffect({ suppliesFoodDelta: 0.35, suppliesShelterDelta: 0.35, suppliesCareDelta: 0.3 }),
      },
      {
        id: 'B',
        label: 'Refine priorities',
        ...staticEffect({ foodPriorityBoost: 0.05, shelterPriorityBoost: 0.05 }),
      },
    ],
  },

  {
    id: 'water_pipe_break',
    title: 'A water line bursts',
    body: 'Shelter spaces need quick attention.',
    choices: [
      {
        id: 'A',
        label: 'Patch with what you have',
        ...staticEffect({
          suppliesShelterDelta: -0.9,
          wipeRisk: { ...DEFAULT_WIPE_RISK, target: 'shelter' },
        }),
      },
      {
        id: 'B',
        label: 'Reroute usage',
        ...staticEffect({ shelterPriorityBoost: 0.08 }),
      },
      {
        id: 'C',
        label: 'Check on hydration needs',
        ...staticEffect({ carePriorityBoost: 0.08 }),
      },
    ],
  },
];
