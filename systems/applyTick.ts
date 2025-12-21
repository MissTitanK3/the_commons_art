import { TickInput } from '@/types/core_game_types';
import { BASE_SUPPLY_RATE, NEED_DRAIN } from './tick';

export function applyTick(input: TickInput) {
  const { supplies, priority, volunteerTime, elapsedSeconds, growthProfile } = input;
  const totalPriority = priority.food + priority.shelter + priority.care;
  const weight = (value: number) => (totalPriority === 0 ? 0 : value / totalPriority);

  const supplyGainTotal = BASE_SUPPLY_RATE * (growthProfile?.supplyGainMultiplier ?? 1) * elapsedSeconds;
  const gainFood = supplyGainTotal * weight(priority.food);
  const gainShelter = supplyGainTotal * weight(priority.shelter);
  const gainCare = supplyGainTotal * weight(priority.care);

  const efficiency = Math.min(1, volunteerTime / 10);

  const foodDrain = NEED_DRAIN.food * priority.food * elapsedSeconds * efficiency;
  const shelterDrain = NEED_DRAIN.shelter * priority.shelter * elapsedSeconds * efficiency;
  const careDrain = NEED_DRAIN.care * priority.care * elapsedSeconds * efficiency;

  const nextFood = Math.max(0, supplies.food + gainFood - foodDrain);
  const nextShelter = Math.max(0, supplies.shelter + gainShelter - shelterDrain);
  const nextCare = Math.max(0, supplies.care + gainCare - careDrain);

  return {
    supplies: {
      food: nextFood,
      shelter: nextShelter,
      care: nextCare,
    },
    drains: {
      food: foodDrain,
      shelter: shelterDrain,
      care: careDrain,
    },
    gains: {
      food: gainFood,
      shelter: gainShelter,
      care: gainCare,
    },
  };
}
