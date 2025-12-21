import { CATEGORY_LABELS } from '@/config/constants';
import type { Category } from '@/types/core_game_types';

interface TradeButtonProps {
  from: Category;
  to: Category;
  fromAmount: number;
  toAmount: number;
  canAfford: boolean;
  onTrade: () => void;
}

export function TradeButton({ from, to, fromAmount, toAmount, canAfford, onTrade }: TradeButtonProps) {
  const fromLabel = CATEGORY_LABELS[from];
  const toLabel = CATEGORY_LABELS[to];

  return (
    <button
      onClick={onTrade}
      disabled={!canAfford}
      className={`w-full p-3 rounded-lg border-2 transition-opacity ${canAfford ? 'border-gray-400 bg-surface hover:opacity-90' : 'border-gray-400 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'}`}
    >
      <div className="text-sm font-semibold">
        Trade {fromAmount} {fromLabel} → {toAmount} {toLabel}
      </div>
      {!canAfford && <div className="text-xs text-text opacity-60 mt-1">Not enough to trade</div>}
    </button>
  );
}
