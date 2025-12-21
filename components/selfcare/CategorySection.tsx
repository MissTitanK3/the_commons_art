import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/config/constants';
import type { Category } from '@/types/core_game_types';
import { ActionButton, type SelfCareAction } from './ActionButton';

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  food: 'Energy intake, stability, nourishment, and routine',
  shelter: 'Physical safety, rest, and environmental stability',
  care: 'Emotional regulation, connection, and continuity',
};

interface CategorySectionProps {
  category: Category;
  actions: ReadonlyArray<SelfCareAction>;
  timeRemainings: Record<string, string>;
  getRemainingMs: (actionId: string) => number;
  onComplete: (actionId: string, bonus: number) => void;
}

export function CategorySection({ category, actions, timeRemainings, getRemainingMs, onComplete }: CategorySectionProps) {
  const colors = CATEGORY_COLORS[category];
  const Icon = CATEGORY_ICONS[category];
  const description = CATEGORY_DESCRIPTIONS[category];

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className={`${colors.icon} opacity-80`} />
        <h2 className="text-lg font-semibold">{colors.label}</h2>
      </div>

      <p className="text-xs text-text opacity-60 mb-4">{description}</p>

      <div className="space-y-2">
        {actions.map((action) => {
          const remainingMs = getRemainingMs(action.id);
          const isOnCooldown = remainingMs > 0;
          const timeRemaining = timeRemainings[action.id] || '';

          return (
            <ActionButton
              key={action.id}
              action={action}
              category={category}
              isOnCooldown={isOnCooldown}
              timeRemaining={timeRemaining}
              onComplete={() => onComplete(action.id, action.bonus)}
            />
          );
        })}
      </div>
    </div>
  );
}
