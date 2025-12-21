import { CHECKIN_INTERVAL_MS } from '@/utils/time';

export function isCheckInEligible(lastCheckInAt?: number, hasSeenCheckIn?: boolean) {
  // Never on first launch
  if (!hasSeenCheckIn) return false;

  if (!lastCheckInAt) return true;

  const now = Date.now();
  return now - lastCheckInAt >= CHECKIN_INTERVAL_MS;
}
