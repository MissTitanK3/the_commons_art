import { useEffect, useRef, useState } from 'react';
import { CATEGORY_COLORS } from '@/config/constants';
import type { Category } from '@/types/core_game_types';

interface SupplyBucketCardProps {
  category: Category;
  value: number;
}

export function SupplyBucketCard({ category, value }: SupplyBucketCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const colors = CATEGORY_COLORS[category];
  const label = colors.label ?? category.charAt(0).toUpperCase() + category.slice(1);

  useEffect(() => {
    refreshTimers.current.forEach(clearTimeout);
    refreshTimers.current = [];

    const start = setTimeout(() => setIsRefreshing(true), 0);
    const stop = setTimeout(() => setIsRefreshing(false), 700); // ~0.7s pulse

    refreshTimers.current.push(start, stop);

    return () => {
      refreshTimers.current.forEach(clearTimeout);
      refreshTimers.current = [];
    };
  }, [value]);


  return (
    <div
      className={`flex-1 p-2 rounded-xl border ${colors.bg} text-center transition-opacity duration-700 ease-in-out ${isRefreshing ? 'opacity-70' : 'opacity-100'
        } dim:bg-surface-alt dim:border-border dim:text-foreground`}
    >
      <div className="text-xs font-semibold opacity-90 dim:opacity-95">{label}</div>
      <div className="text-lg font-bold">{value.toFixed(1)}</div>
    </div>
  );
}
