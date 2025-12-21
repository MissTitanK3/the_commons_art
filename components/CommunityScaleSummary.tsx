'use client';

import { SCALE_LABELS, SCALE_ORDER } from "@/config/constants";
import { CommonsState, useCommonsStore } from "@/state/store";
import { CommunityScale } from "@/types/core_game_types";

export function CommunityScaleSummary() {
  const communityScale = useCommonsStore((s: CommonsState) => s.communityScale);
  const status = useCommonsStore((s: CommonsState) => s.status);
  const suppliesFood = useCommonsStore((s: CommonsState) => s.suppliesFood);
  const suppliesShelter = useCommonsStore((s: CommonsState) => s.suppliesShelter);
  const suppliesCare = useCommonsStore((s: CommonsState) => s.suppliesCare);
  const communityInvestment = useCommonsStore((s: CommonsState) => s.communityInvestment);
  const needs = useCommonsStore((s: CommonsState) => s.needs);
  const setCommunityScale = useCommonsStore((s: CommonsState) => s.setCommunityScale);

  const scaleIndex = SCALE_ORDER.indexOf(communityScale);
  const isMaxScale = scaleIndex === SCALE_ORDER.length - 1;

  let scaleStatus = 'Holding';
  if (status === 'well_supported') scaleStatus = 'Well Supported';
  else if (status === 'improving') scaleStatus = 'Improving';
  else if (status === 'stable') scaleStatus = 'Stable';
  else if (status === 'holding') scaleStatus = 'Holding';

  const requirements: Record<CommunityScale, number> = {
    house: 0,
    block: 30,
    village: 60,
    town: 95,
    townhall: 135,
    apartment: 180,
    neighborhood: 230,
    district: 285,
    borough: 345,
    municipal: 410,
    city: 480,
    metropolis: 555,
    county: 635,
    province: 720,
    region: 810,
  };

  const supplies = {
    food: suppliesFood,
    shelter: suppliesShelter,
    care: suppliesCare,
  };
  const totalSupplies = supplies.food + supplies.shelter + supplies.care;

  const allNeedsMet = needs.food <= 1.34 && needs.shelter <= 1.34 && needs.care <= 1.34;

  const nextScale: CommunityScale | null = !isMaxScale ? SCALE_ORDER[scaleIndex + 1] ?? null : null;
  const nextScaleLabel = nextScale ? SCALE_LABELS[nextScale] : null;
  const requiredForNext = nextScale ? requirements[nextScale] ?? 0 : 0;
  const gap = Math.max(0, requiredForNext - communityInvestment);
  const canInvestGap = gap <= totalSupplies;
  const canUpgrade = allNeedsMet && !isMaxScale && canInvestGap;

  const handleUpgrade = () => {
    if (!nextScale) return;
    setCommunityScale(nextScale);
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-4 bg-surface rounded-xl mt-6">
      {/* Current Scale Display */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold">{SCALE_LABELS[communityScale]}</h2>
        <p className="text-sm text-text opacity-80">{scaleStatus}</p>
      </div>

      {/* Next Scale Section */}
      {nextScaleLabel && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-3">Next: {nextScaleLabel}</p>

          <div className="space-y-2 mb-4 text-xs text-text opacity-85">
            <div className="flex justify-between">
              <span>Investment needed</span>
              <span>{requiredForNext.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Already invested</span>
              <span>{communityInvestment.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gap remaining</span>
              <span className={gap > totalSupplies ? 'text-red-500 font-semibold' : 'font-semibold'}>
                {gap.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Supplies available</span>
              <span>{totalSupplies.toFixed(0)}</span>
            </div>
          </div>

          {!canInvestGap && (
            <p className="text-xs text-red-500 font-semibold mb-3">Need {Math.ceil(gap - totalSupplies)} more supplies to invest</p>
          )}

          {!allNeedsMet && (
            <p className="text-xs text-amber-600 font-semibold mb-3">Meet core needs before upgrading</p>
          )}

          {/* Upgrade Button */}
          <button
            onClick={handleUpgrade}
            disabled={!canUpgrade}
            className={`w-full py-2 px-3 rounded-lg border-2 font-semibold text-sm transition-opacity ${canUpgrade
              ? 'border-green-500 text-green-600 dark:text-green-400 hover:opacity-90'
              : 'border-gray-400 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 opacity-50 cursor-not-allowed'
              }`}
          >
            Support Larger Commons
          </button>
        </div>
      )}

      {/* Max Scale Reached */}
      {isMaxScale && (
        <p className="text-xs text-text opacity-70 text-center">Max scale reached</p>
      )}
    </div>
  );
}
