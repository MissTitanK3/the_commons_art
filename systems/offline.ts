import { Needs, OfflineState } from '@/types/global_types';
import { applyTick } from './applyTick';
import { OFFLINE_CAP_MS } from './tick';

export function applyOfflineProgress(state: OfflineState, lastActiveAt: number) {
  const now = Date.now();
  const elapsedMs = Math.min(now - lastActiveAt, OFFLINE_CAP_MS);
  const elapsedSeconds = elapsedMs / 1000;

  return applyTick({
    supplies: {
      food: state.suppliesFood,
      shelter: state.suppliesShelter,
      care: state.suppliesCare,
    },
    priority: state.priority as Needs,
    volunteerTime: state.volunteerTime,
    communityScale: state.communityScale,
    elapsedSeconds,
  });
}
