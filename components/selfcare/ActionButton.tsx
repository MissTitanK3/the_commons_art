import { Clock } from 'lucide-react';
import { CATEGORY_COLORS } from '@/config/constants';
import type { Category } from '@/types/core_game_types';

export type SelfCareAction = {
  id: string;
  label: string;
  bonus: number;
};

interface ActionButtonProps {
  action: SelfCareAction;
  category: Category;
  isOnCooldown: boolean;
  timeRemaining: string;
  onComplete: () => void;
}

export function ActionButton({ action, category, isOnCooldown, timeRemaining, onComplete }: ActionButtonProps) {
  const colors = CATEGORY_COLORS[category];

  return (
    <button
      onClick={onComplete}
      disabled={isOnCooldown}
      className={`w-full p-3 rounded-lg border flex items-center justify-between transition-opacity ${isOnCooldown ? `${colors.bg} border-gray-400 opacity-50 cursor-not-allowed` : 'bg-surface border-gray-400 hover:opacity-90'}`}
    >
      <div className="text-left">
        <div className="text-sm font-semibold">{action.label}</div>
        {isOnCooldown && <div className="text-xs text-text opacity-60">Available in {timeRemaining}</div>}
      </div>
      <div className="flex items-center gap-2">
        <div className={`text-xs font-semibold ${colors.text}`}>+{action.bonus}</div>
        {isOnCooldown && <Clock size={16} className="text-gray-500" />}
      </div>
    </button>
  );
}
