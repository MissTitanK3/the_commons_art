import { DEV_CONFIG } from '@/config/dev';

export function formatTimeAgoDHM(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function formatTimeAgoNMH(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export const DAY_MS = 1000 * 60 * 60 * 24;
// Target events every ~8 minutes with a 5-minute minimum spacing.
export const EVENT_INTERVAL_MS = DEV_CONFIG.enabled ? DEV_CONFIG.EVENT_INTERVAL_MS : 1000 * 60 * 8;
export const MIN_EVENT_SPACING_MS = DEV_CONFIG.enabled ? DEV_CONFIG.EVENT_INTERVAL_MS : 1000 * 60 * 5;

export const CHECKIN_INTERVAL_MS = DEV_CONFIG.enabled ? DEV_CONFIG.CHECKIN_INTERVAL_MS : 1000 * 60 * 60 * 24 * 7;

export const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '';

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 1) return `${hours}h ${minutes}m`;

  return `${minutes}m`;
}

export function getSelfCareActionTimeRemaining(actionId: string, timestamps: Record<string, number>): number {
  const lastCompleted = timestamps[actionId] || 0;
  const now = Date.now();
  const elapsed = now - lastCompleted;
  const remaining = COOLDOWN_MS - elapsed;
  return Math.max(0, remaining);
}
