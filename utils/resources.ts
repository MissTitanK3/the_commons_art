import { useCommonsStore } from '@/state/store';

export const performTrade = (
  cost: { food: number; shelter: number; care: number },
  gain: { food: number; shelter: number; care: number },
) => {
  useCommonsStore.setState((state) => {
    const canAfford =
      state.suppliesFood >= cost.food && state.suppliesShelter >= cost.shelter && state.suppliesCare >= cost.care;

    if (!canAfford) return state;

    return {
      ...state,
      suppliesFood: Math.max(0, state.suppliesFood - cost.food + gain.food),
      suppliesShelter: Math.max(0, state.suppliesShelter - cost.shelter + gain.shelter),
      suppliesCare: Math.max(0, state.suppliesCare - cost.care + gain.care),
    };
  });
};
