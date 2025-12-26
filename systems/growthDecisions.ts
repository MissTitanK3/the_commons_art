import { SCALE_ORDER } from '@/config/constants';
import {
  CommunityScale,
  CommunityValueFlags,
  CommunityValueFlagKey,
  GrowthDecisionChoiceKey,
  GrowthDecisionId,
  GrowthDecisionSelections,
  GrowthModifierProfile,
} from '@/types/core_game_types';

export type GrowthDecision = {
  id: GrowthDecisionId;
  from: CommunityScale;
  to: CommunityScale;
  theme: string;
  prompt: string;
  range: [number, number];
  choices: {
    key: GrowthDecisionChoiceKey;
    title: string;
    effects: string[];
    valueFlag?: keyof CommunityValueFlags;
  }[];
  systemsAffected: string[];
};

export const VALUE_FLAG_LABELS: Partial<Record<CommunityValueFlagKey, string>> = {
  trustFocused: 'Trust-first mutuality',
  careFirst: 'Care-first ethic',
  informalCoordination: 'Informal coordination',
  participatoryGovernance: 'Participatory governance',
  denseLiving: 'Dense shared living',
  identityStrong: 'Identity-led culture',
  adaptiveGovernance: 'Adaptive governance',
  aidAnchor: 'Mutual aid anchor',
  independent_units: 'Autonomy and independence',
  work_first: 'Output-first mindset',
  mixed_focus: 'Balanced approach',
  formal_governance: 'Formal governance',
  delegated_circles: 'Delegated circles',
  distributed_living: 'Distributed layout',
  specialization: 'Focused specialization',
  layered_governance: 'Layered governance',
  skill_sharing: 'Skill-sharing culture',
};

export const getValueFlagLabel = (
  flagKey?: keyof CommunityValueFlags,
  fallback?: string,
): string => VALUE_FLAG_LABELS[flagKey as CommunityValueFlagKey] ?? fallback ?? flagKey ?? 'Not set';

export const GROWTH_DECISIONS: GrowthDecision[] = [
  {
    id: 'house_block',
    from: 'house',
    to: 'block',
    theme: 'Trust vs autonomy',
    prompt: 'How do we begin relying on each other?',
    range: [0, 120],
    choices: [
      {
        key: 'shared_living',
        title: 'Shared Living',
        effects: ['Smoother resource distribution', 'Less individual surplus'],
        valueFlag: 'trustFocused',
      },
      {
        key: 'skill_sharing',
        title: 'Skill Sharing',
        effects: ['Faster task completion', 'Higher burnout risk'],
        valueFlag: 'trustFocused',
      },
      {
        key: 'independent_units',
        title: 'Independent Units',
        effects: ['Strong personal resilience', 'Weaker collective response'],
        valueFlag: 'independent_units',
      },
    ],
    systemsAffected: ['Resource variance', 'Task speed', 'Burnout pressure'],
  },
  {
    id: 'block_village',
    from: 'block',
    to: 'village',
    theme: 'Care vs productivity',
    prompt: 'What matters when people depend on us?',
    range: [120, 200],
    choices: [
      {
        key: 'care_first',
        title: 'Care First',
        effects: ['Faster wellbeing recovery', 'Slower growth'],
        valueFlag: 'careFirst',
      },
      {
        key: 'work_first',
        title: 'Work First',
        effects: ['Higher output', 'Morale decays faster'],
        valueFlag: 'work_first',
      },
      {
        key: 'mixed_focus',
        title: 'Mixed Focus',
        effects: ['Balanced outcomes', 'No strong bias'],
        valueFlag: 'mixed_focus',
      },
    ],
    systemsAffected: ['Wellbeing regen', 'Growth thresholds', 'Morale stability'],
  },
  {
    id: 'village_town',
    from: 'village',
    to: 'town',
    theme: 'Informal vs organized coordination',
    prompt: 'How do we get things done together?',
    range: [200, 300],
    choices: [
      {
        key: 'informal_networks',
        title: 'Informal Networks',
        effects: ['Fast crisis response', 'Higher volatility'],
        valueFlag: 'informalCoordination',
      },
      {
        key: 'structured_roles',
        title: 'Structured Roles',
        effects: ['Predictable outcomes', 'Slower adaptation'],
        valueFlag: 'formal_governance',
      },
      {
        key: 'rotating_responsibility',
        title: 'Rotating Responsibility',
        effects: ['Shared load', 'Coordination overhead'],
        valueFlag: 'participatoryGovernance',
      },
    ],
    systemsAffected: ['Event resolution variance', 'Coordination cost', 'Task overlap efficiency'],
  },
  {
    id: 'town_townhall',
    from: 'town',
    to: 'townhall',
    theme: 'Centralization vs participation',
    prompt: 'Who makes decisions for the whole?',
    range: [300, 450],
    choices: [
      {
        key: 'central_council',
        title: 'Central Council',
        effects: ['Stability and clarity', 'Reduced flexibility'],
        valueFlag: 'formal_governance',
      },
      {
        key: 'open_assemblies',
        title: 'Open Assemblies',
        effects: ['High morale resilience', 'Slower decisions'],
        valueFlag: 'participatoryGovernance',
      },
      {
        key: 'delegated_circles',
        title: 'Delegated Circles',
        effects: ['Parallel progress', 'Communication friction'],
        valueFlag: 'delegated_circles',
      },
    ],
    systemsAffected: ['Decision latency', 'Morale floor', 'Parallel task capacity'],
  },
  {
    id: 'apartment_neighborhood',
    from: 'apartment',
    to: 'neighborhood',
    theme: 'Density vs connection',
    prompt: 'How close do people live and work?',
    range: [650, 900],
    choices: [
      {
        key: 'dense_living',
        title: 'Dense Living',
        effects: ['Efficient resource use', 'Stress spikes during crises'],
        valueFlag: 'denseLiving',
      },
      {
        key: 'distributed_living',
        title: 'Distributed Living',
        effects: ['Higher resilience', 'Slower logistics'],
        valueFlag: 'distributed_living',
      },
      {
        key: 'hybrid_layout',
        title: 'Hybrid Layout',
        effects: ['Moderate efficiency', 'Moderate strain'],
        valueFlag: 'mixed_focus',
      },
    ],
    systemsAffected: ['Resource efficiency', 'Crisis amplification', 'Logistics delay'],
  },
  {
    id: 'district_borough',
    from: 'district',
    to: 'borough',
    theme: 'Identity vs expansion',
    prompt: 'What defines us at scale?',
    range: [1200, 1550],
    choices: [
      {
        key: 'strong_local_identity',
        title: 'Strong Local Identity',
        effects: ['Morale stability', 'Slower expansion'],
        valueFlag: 'identityStrong',
      },
      {
        key: 'open_growth',
        title: 'Open Growth',
        effects: ['Faster population growth', 'Cultural drift'],
        valueFlag: 'work_first',
      },
      {
        key: 'specialization',
        title: 'Specialization',
        effects: ['Strong bonuses in one area', 'Weaker overall balance'],
        valueFlag: 'specialization',
      },
    ],
    systemsAffected: ['Morale decay', 'Expansion rate', 'Specialization modifiers'],
  },
  {
    id: 'municipal_city',
    from: 'municipal',
    to: 'city',
    theme: 'Governance vs adaptability',
    prompt: 'How do we govern complexity?',
    range: [1950, 2400],
    choices: [
      {
        key: 'formal_governance',
        title: 'Formal Governance',
        effects: ['Predictable outcomes', 'Slower crisis response'],
        valueFlag: 'formal_governance',
      },
      {
        key: 'adaptive_governance',
        title: 'Adaptive Governance',
        effects: ['Faster recovery', 'Higher uncertainty'],
        valueFlag: 'adaptiveGovernance',
      },
      {
        key: 'layered_governance',
        title: 'Layered Governance',
        effects: ['Redundancy and safety', 'Maintenance cost'],
        valueFlag: 'layered_governance',
      },
    ],
    systemsAffected: ['Crisis resolution curves', 'Variance bands', 'Upkeep pressure'],
  },
  {
    id: 'county_region',
    from: 'county',
    to: 'region',
    theme: 'Influence vs sustainability',
    prompt: 'What is our role beyond ourselves?',
    range: [3500, 5000],
    choices: [
      {
        key: 'mutual_aid_anchor',
        title: 'Mutual Aid Anchor',
        effects: ['Strong external aid effects', 'Internal strain increases'],
        valueFlag: 'aidAnchor',
      },
      {
        key: 'self_sustaining_region',
        title: 'Self-Sustaining Region',
        effects: ['Internal efficiency high', 'Limited external support'],
        valueFlag: 'independent_units',
      },
      {
        key: 'knowledge_training_hub',
        title: 'Knowledge & Training Hub',
        effects: ['Permanent skill uplift', 'Slower material growth'],
        valueFlag: 'skill_sharing',
      },
    ],
    systemsAffected: ['External event modifiers', 'Internal efficiency scaling', 'Skill persistence'],
  },
];

const CHOICE_MODIFIERS: Record<GrowthDecisionChoiceKey, Partial<GrowthModifierProfile>> = {
  shared_living: {
    supplyGainMultiplier: 0.97,
    needGenerationMultiplier: 0.95,
    eventPositiveMultiplier: 0.98,
    eventNegativeMultiplier: 0.98,
    resilienceBias: 0.04,
  },
  skill_sharing: {
    supplyGainMultiplier: 1.06,
    needGenerationMultiplier: 1.05,
    resilienceBias: -0.04,
  },
  independent_units: {
    supplyGainMultiplier: 0.93,
    needGenerationMultiplier: 0.94,
    eventPositiveMultiplier: 0.97,
    eventNegativeMultiplier: 0.97,
    resilienceBias: 0.02,
  },
  care_first: {
    supplyGainMultiplier: 0.94,
    needGenerationMultiplier: 0.9,
    resilienceBias: 0.08,
  },
  work_first: {
    supplyGainMultiplier: 1.07,
    needGenerationMultiplier: 1.08,
    resilienceBias: -0.08,
  },
  mixed_focus: {},
  informal_networks: {
    eventPositiveMultiplier: 1.1,
    eventNegativeMultiplier: 1.1,
    resilienceBias: 0.03,
  },
  structured_roles: {
    supplyGainMultiplier: 0.98,
    eventPositiveMultiplier: 0.93,
    eventNegativeMultiplier: 0.9,
  },
  rotating_responsibility: {
    supplyGainMultiplier: 0.99,
    needGenerationMultiplier: 0.97,
    resilienceBias: 0.02,
  },
  central_council: {
    supplyGainMultiplier: 0.97,
    eventPositiveMultiplier: 0.95,
    eventNegativeMultiplier: 0.92,
  },
  open_assemblies: {
    supplyGainMultiplier: 0.95,
    eventNegativeMultiplier: 0.97,
    resilienceBias: 0.1,
  },
  delegated_circles: {
    supplyGainMultiplier: 1.05,
    needGenerationMultiplier: 1.03,
    eventPositiveMultiplier: 1.02,
    eventNegativeMultiplier: 1.03,
  },
  dense_living: {
    supplyGainMultiplier: 1.05,
    needGenerationMultiplier: 1.06,
    eventNegativeMultiplier: 1.1,
  },
  distributed_living: {
    supplyGainMultiplier: 0.95,
    needGenerationMultiplier: 0.94,
    eventNegativeMultiplier: 0.95,
  },
  hybrid_layout: {
    supplyGainMultiplier: 1,
    needGenerationMultiplier: 0.99,
  },
  strong_local_identity: {
    supplyGainMultiplier: 0.96,
    needGenerationMultiplier: 0.93,
    eventNegativeMultiplier: 0.97,
    resilienceBias: 0.05,
  },
  open_growth: {
    supplyGainMultiplier: 1.08,
    needGenerationMultiplier: 1.08,
    eventNegativeMultiplier: 1.05,
    resilienceBias: -0.04,
  },
  specialization: {
    supplyGainMultiplier: 1.06,
    needGenerationMultiplier: 1.03,
    eventPositiveMultiplier: 1.04,
    eventNegativeMultiplier: 1.02,
  },
  formal_governance: {
    supplyGainMultiplier: 0.97,
    needGenerationMultiplier: 1.02,
    eventPositiveMultiplier: 0.95,
    eventNegativeMultiplier: 0.9,
    resilienceBias: 0.02,
  },
  adaptive_governance: {
    supplyGainMultiplier: 1.06,
    needGenerationMultiplier: 0.96,
    eventPositiveMultiplier: 1.1,
    eventNegativeMultiplier: 1.1,
    resilienceBias: 0.03,
  },
  layered_governance: {
    supplyGainMultiplier: 0.94,
    needGenerationMultiplier: 0.95,
    eventNegativeMultiplier: 0.96,
    resilienceBias: 0.07,
  },
  mutual_aid_anchor: {
    supplyGainMultiplier: 0.99,
    needGenerationMultiplier: 1.06,
    eventPositiveMultiplier: 1.3,
    eventNegativeMultiplier: 1.15,
  },
  self_sustaining_region: {
    supplyGainMultiplier: 1.08,
    needGenerationMultiplier: 0.97,
    eventPositiveMultiplier: 0.9,
    eventNegativeMultiplier: 0.95,
  },
  knowledge_training_hub: {
    supplyGainMultiplier: 1.04,
    needGenerationMultiplier: 0.98,
    eventPositiveMultiplier: 1.05,
    eventNegativeMultiplier: 0.98,
  },
};

const BASE_PROFILE: GrowthModifierProfile = {
  supplyGainMultiplier: 1,
  needGenerationMultiplier: 1,
  eventPositiveMultiplier: 1,
  eventNegativeMultiplier: 1,
  resilienceBias: 0,
};

const clampMultiplier = (value: number, min = 0.85, max = 1.25) => Math.min(max, Math.max(min, value));
const clampResilience = (value: number) => Math.min(0.3, Math.max(-0.3, value));

const makeEmptyValueFlags = (): CommunityValueFlags => {
  const flags: Partial<CommunityValueFlags> = {};
  GROWTH_DECISIONS.forEach((decision) => {
    decision.choices.forEach((choice) => {
      const flagKey = (choice.valueFlag ?? choice.key) as keyof CommunityValueFlags;
      flags[flagKey] = false;
      // Keep the original choice key present even when sharing a value flag
      if (choice.key !== flagKey) {
        flags[choice.key as keyof CommunityValueFlags] ??= false;
      }
    });
  });
  return flags as CommunityValueFlags;
};

export function buildGrowthProfile(selections: GrowthDecisionSelections): GrowthModifierProfile {
  let profile = { ...BASE_PROFILE };

  Object.values(selections).forEach((choiceKey) => {
    if (!choiceKey) return;
    const mod = CHOICE_MODIFIERS[choiceKey];
    if (!mod) return;

    profile = {
      supplyGainMultiplier: clampMultiplier(profile.supplyGainMultiplier * (mod.supplyGainMultiplier ?? 1)),
      needGenerationMultiplier: clampMultiplier(profile.needGenerationMultiplier * (mod.needGenerationMultiplier ?? 1)),
      eventPositiveMultiplier: clampMultiplier(
        profile.eventPositiveMultiplier * (mod.eventPositiveMultiplier ?? 1),
        0.85,
        1.35,
      ),
      eventNegativeMultiplier: clampMultiplier(
        profile.eventNegativeMultiplier * (mod.eventNegativeMultiplier ?? 1),
        0.85,
        1.35,
      ),
      resilienceBias: clampResilience(profile.resilienceBias + (mod.resilienceBias ?? 0)),
    };
  });

  return profile;
}

export function deriveCommunityValueFlags(selections: GrowthDecisionSelections): CommunityValueFlags {
  const flags: CommunityValueFlags = makeEmptyValueFlags();

  GROWTH_DECISIONS.forEach((decision) => {
    const chosen = selections[decision.id];
    if (!chosen) return;
    const pickedChoice = decision.choices.find((c) => c.key === chosen);
    const flagKey = (pickedChoice?.valueFlag ?? pickedChoice?.key) as keyof CommunityValueFlags | undefined;
    if (flagKey) {
      flags[flagKey] = true;
    }
  });

  return flags;
}

export function getDecisionForScale(scale: CommunityScale) {
  return GROWTH_DECISIONS.find((decision) => decision.to === scale);
}

export function findGrowthDecision(decisionId?: GrowthDecisionId) {
  if (!decisionId) return undefined;
  return GROWTH_DECISIONS.find((decision) => decision.id === decisionId);
}

export function getPendingGrowthDecisionId(
  currentScale: CommunityScale,
  selections: GrowthDecisionSelections,
): GrowthDecisionId | undefined {
  const currentIndex = SCALE_ORDER.indexOf(currentScale);
  if (currentIndex < 0) return undefined;

  const pending = GROWTH_DECISIONS.find((decision) => {
    const decisionIndex = SCALE_ORDER.indexOf(decision.to);
    const alreadyChosen = Boolean(selections[decision.id]);
    return decisionIndex >= 0 && decisionIndex <= currentIndex && !alreadyChosen;
  });

  return pending?.id;
}
