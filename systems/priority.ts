import { Needs } from '@/types/global_types';

export function normalizePriority(input: Needs, changed: keyof Needs): Needs {
  const total = input.food + input.shelter + input.care;
  const targetTotal = 3;

  const diff = total - targetTotal;
  if (Math.abs(diff) < 0.001) return input;

  const others = (['food', 'shelter', 'care'] as const).filter((k) => k !== changed);

  const share = diff / others.length;

  const next = { ...input };

  for (const key of others) {
    next[key] = Math.max(0.5, input[key] - share);
  }

  return next;
}
