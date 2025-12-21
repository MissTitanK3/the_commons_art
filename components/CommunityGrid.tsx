'use client';

import { User, Users } from 'lucide-react';
import { categories, CATEGORY_COLORS, CATEGORY_LABELS, memberCount } from '@/config/constants';
import { CommonsState, useCommonsStore } from '@/state/store';

export function CommunityGrid() {
  const needs = useCommonsStore((s: CommonsState) => s.needs);
  const helpMember = useCommonsStore((s: CommonsState) => s.helpMember);
  const helpMembersMax = useCommonsStore((s: CommonsState) => s.helpMembersMax);
  const suppliesFood = useCommonsStore((s: CommonsState) => s.suppliesFood);
  const suppliesShelter = useCommonsStore((s: CommonsState) => s.suppliesShelter);
  const suppliesCare = useCommonsStore((s: CommonsState) => s.suppliesCare);

  const canHelpMax = categories.some((category) => {
    const supply = category === 'food' ? suppliesFood : category === 'shelter' ? suppliesShelter : suppliesCare;
    return Math.min(needs[category], supply) > 0.01;
  });
  return (
    <div className="w-full max-w-sm mx-auto px-4 py-4 bg-surface rounded-xl mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Community Needs</h2>
        <button
          onClick={() => categories.forEach((category) => helpMembersMax(category))}
          disabled={!canHelpMax}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-opacity ${canHelpMax
            ? 'border-blue-500 text-blue-600 dark:text-blue-300 hover:opacity-90'
            : 'border-gray-400 text-gray-500 opacity-60 cursor-not-allowed'
            }`}
          aria-label="Help as many members as possible"
        >
          <Users size={16} />
          Help Max
        </button>
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const Icon = User;
          const colors = CATEGORY_COLORS[category];
          const label = CATEGORY_LABELS[category];
          const needValue = needs[category];
          const membersToShow = Math.min(memberCount, Math.ceil(needValue));

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={`${colors.icon} opacity-70`} />
                <span className="text-xs font-semibold text-text opacity-70">{label}</span>
              </div>

              {/* Member avatars */}
              <div className="flex gap-2 flex-wrap">
                {membersToShow > 0 ? (
                  Array.from({ length: membersToShow }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => helpMember(category)}
                      className={`w-12 h-12 rounded-lg border-4 flex items-center justify-center transition-opacity hover:opacity-75 active:opacity-60 ${colors.bg} ${colors.border}`}
                      aria-label={`Help with ${label} need`}
                    >
                      <Icon size={24} className={colors.icon} />
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-text opacity-70">All {label.toLowerCase()} needs met</span>
                )}

                {/* More indicator if needed */}
                {needValue > memberCount && (
                  <div className={`w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center text-xs font-semibold ${colors.icon}`}>
                    +{Math.ceil(needValue - memberCount)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
