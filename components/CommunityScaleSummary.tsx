'use client';

import { SCALE_LABELS, SCALE_ORDER } from "@/config/constants";
import { CommonsState, useCommonsStore } from "@/state/store";
import { GROWTH_DECISIONS, findGrowthDecision, getDecisionForScale, getValueFlagLabel } from "@/systems/growthDecisions";
import { PRESTIGE_REQUIREMENT_STEP, SCALE_REQUIREMENTS } from "@/systems/scaleMetrics";
import { CommunityScale, CommunityValueFlags } from "@/types/core_game_types";

type CommunityScaleSummaryProps = {
  onOpenGrowthDecision?: () => void;
};

const valueLabelForChoice = (flagKey: keyof CommunityValueFlags | undefined, fallbackTitle?: string) =>
  getValueFlagLabel(flagKey, fallbackTitle);

export function CommunityScaleSummary({ onOpenGrowthDecision }: CommunityScaleSummaryProps) {
  const communityScale = useCommonsStore((s: CommonsState) => s.communityScale);
  const status = useCommonsStore((s: CommonsState) => s.status);
  const suppliesFood = useCommonsStore((s: CommonsState) => s.suppliesFood);
  const suppliesShelter = useCommonsStore((s: CommonsState) => s.suppliesShelter);
  const suppliesCare = useCommonsStore((s: CommonsState) => s.suppliesCare);
  const communityInvestment = useCommonsStore((s: CommonsState) => s.communityInvestment);
  const prestigeStars = useCommonsStore((s: CommonsState) => s.prestigeStars);
  const needs = useCommonsStore((s: CommonsState) => s.needs);
  const growthDecisionSelections = useCommonsStore((s: CommonsState) => s.growthDecisionSelections);
  const pendingGrowthDecisionId = useCommonsStore((s: CommonsState) => s.pendingGrowthDecisionId);
  const queuePrestigeSummary = useCommonsStore((s: CommonsState) => s.queuePrestigeSummary);
  const setCommunityScale = useCommonsStore((s: CommonsState) => s.setCommunityScale);

  const scaleIndex = SCALE_ORDER.indexOf(communityScale);
  const isMaxScale = scaleIndex === SCALE_ORDER.length - 1;
  const requirementMultiplier = 1 + prestigeStars * PRESTIGE_REQUIREMENT_STEP;

  let scaleStatus = 'Holding';
  if (status === 'well_supported') scaleStatus = 'Well Supported';
  else if (status === 'improving') scaleStatus = 'Improving';
  else if (status === 'stable') scaleStatus = 'Stable';
  else if (status === 'holding') scaleStatus = 'Holding';

  const supplies = {
    food: suppliesFood,
    shelter: suppliesShelter,
    care: suppliesCare,
  };
  const totalSupplies = supplies.food + supplies.shelter + supplies.care;

  const allNeedsMet = needs.food <= 3.34 && needs.shelter <= 3.34 && needs.care <= 3.34;

  const nextScale: CommunityScale | null = !isMaxScale ? SCALE_ORDER[scaleIndex + 1] ?? null : null;
  const nextScaleLabel = nextScale ? SCALE_LABELS[nextScale] : null;
  const requiredForNext = nextScale ? (SCALE_REQUIREMENTS[nextScale] ?? 0) * requirementMultiplier : 0;
  const gap = Math.max(0, requiredForNext - communityInvestment);
  const canInvestGap = gap <= totalSupplies;
  const canUpgrade = allNeedsMet && !isMaxScale && canInvestGap;
  const nextDecision = nextScale ? getDecisionForScale(nextScale) : undefined;
  const pendingDecision = findGrowthDecision(pendingGrowthDecisionId ?? undefined);
  const pendingDecisionExists = Boolean(pendingGrowthDecisionId);

  const selectedValues = GROWTH_DECISIONS.map((decision) => {
    const selectedKey = growthDecisionSelections[decision.id];
    const choice = decision.choices.find((c) => c.key === selectedKey);
    const valueLabel = valueLabelForChoice(
      (choice?.valueFlag ?? choice?.key) as keyof CommunityValueFlags | undefined,
      choice?.title ?? 'Not set',
    );
    return {
      id: decision.id,
      theme: decision.theme,
      prompt: decision.prompt,
      choiceTitle: choice?.title ?? 'Not chosen yet',
      valueLabel,
      isSet: Boolean(choice),
    };
  });

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
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs font-semibold">
          <span>Community Stars</span>
          <span className="text-amber-600 dark:text-amber-300">{prestigeStars}</span>
        </div>
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
            <div className="flex justify-between text-[11px] text-text opacity-70">
              <span>Prestige scaling</span>
              <span>x{requirementMultiplier.toFixed(2)}</span>
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
        <div className="text-xs text-text opacity-80 text-center space-y-2">
          <p>Max scale reached</p>
          <div className="px-3 py-3 rounded-lg bg-surface-alt border border-border text-left space-y-2">
            <p className="text-sm font-semibold">Prestige (optional)</p>
            <p>
              Start a new community with +1 Community Star. Requirements increase by 25% per star.
              Identity persists; no resources carry over.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-text opacity-80">
              <span className="px-2 py-1 rounded-full border border-border">Current stars: {prestigeStars}</span>
              <span className="px-2 py-1 rounded-full border border-border">
                Next star: x{(requirementMultiplier + PRESTIGE_REQUIREMENT_STEP).toFixed(2)} requirements
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={queuePrestigeSummary}
                disabled={pendingDecisionExists}
                className={`w-full py-2 px-3 rounded-lg border-2 font-semibold ${pendingDecisionExists
                  ? 'border-gray-400 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
                  : 'border-amber-500 text-amber-700 dark:text-amber-200 hover:opacity-90'
                  }`}
              >
                Begin New Community (+1 Star)
              </button>
              {pendingDecisionExists && (
                <p className="text-[11px] text-amber-700 dark:text-amber-200 text-center">
                  Resolve pending growth decisions before starting a new community.
                </p>
              )}
              <p className="text-[11px] text-text opacity-70 text-center">
                Or continue indefinitely; prestige is always optional.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Community Values & Decisions */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-sm font-semibold mb-2">Community Values</p>

        <div className="space-y-2">
          {selectedValues.map((item) => (
            <div
              key={item.id}
              className={`px-3 py-2 rounded-lg border ${item.isSet ? 'border-green-500 text-green-700 dark:text-green-300' : 'border-border text-text opacity-75'
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">{item.theme}</span>
                <span className="text-[11px] opacity-80">{item.isSet ? 'Set' : 'Pending'}</span>
              </div>
              <p className="text-sm font-semibold">{item.choiceTitle}</p>
              <p className="text-[11px] text-text opacity-75">Identity: {item.valueLabel}</p>
            </div>
          ))}
        </div>

        {pendingDecision && (
          <div className="mt-3 px-3 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-xs">
            <p className="font-semibold mb-1">Decision needed</p>
            <p className="mb-2">{pendingDecision.theme}: {pendingDecision.prompt}</p>
            <button
              onClick={onOpenGrowthDecision}
              className="w-full py-2 px-3 rounded-lg border border-amber-400 font-semibold text-amber-700 dark:text-amber-200 hover:opacity-90"
            >
              Review choices
            </button>
          </div>
        )}

        {!pendingDecision && nextDecision && (
          <p className="mt-3 text-xs text-text opacity-70">
            Upcoming decision at {nextScaleLabel}: {nextDecision.theme}
          </p>
        )}
      </div>
    </div>
  );
}
