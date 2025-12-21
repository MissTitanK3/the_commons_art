import { NeedDirection } from '@/types/global_types';

export function getNeedDirection(delta: number): NeedDirection {
  if (delta > 0.02) return 'increasing';
  if (delta < -0.02) return 'decreasing';
  return 'steady';
}
