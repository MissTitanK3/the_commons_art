'use client';

import { Pin, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SCALE_LABELS } from '@/config/constants';
import { EVENTS } from '@/systems/events';
// import { GROWTH_DECISIONS } from '@/systems/growthDecisions';
// import { GrowthDecisionId } from '@/types/core_game_types';
import { useCommonsStore, type CommonsState } from '@/state/store';
import { formatTimeAgoNMH } from '@/utils/time';

export default function LogPage() {
  const eventLog = useCommonsStore((s: CommonsState) => s.eventLog);
  const devLogTestEvent = useCommonsStore((s: CommonsState) => s.devLogTestEvent);
  // const communityScale = useCommonsStore((s: CommonsState) => s.communityScale);
  const prestigeStars = useCommonsStore((s: CommonsState) => s.prestigeStars);
  // const growthDecisionSelections = useCommonsStore((s: CommonsState) => s.growthDecisionSelections);
  // const communityValues = useCommonsStore((s: CommonsState) => s.communityValues);
  const legacyRuns = useCommonsStore((s: CommonsState) => s.legacyRuns);
  const pinnedLegacyRunId = useCommonsStore((s: CommonsState) => s.pinnedLegacyRunId);
  const renameLegacyRun = useCommonsStore((s: CommonsState) => s.renameLegacyRun);
  const setLegacyNote = useCommonsStore((s: CommonsState) => s.setLegacyNote);
  const pinLegacyRun = useCommonsStore((s: CommonsState) => s.pinLegacyRun);

  const eventsById = useMemo(() => new Map(EVENTS.map((event) => [event.id, event])), []);
  const isDev = process.env.NODE_ENV === 'development';

  // const reflection = useMemo(() => {
  //   const decisions = Object.entries(growthDecisionSelections)
  //     .map(([id, choiceKey]) => {
  //       const decision = GROWTH_DECISIONS.find((d) => d.id === id);
  //       if (!decision || !choiceKey) return undefined;
  //       const choice = decision.choices.find((c) => c.key === choiceKey);
  //       if (!choice) return undefined;
  //       return {
  //         id: decision.id as GrowthDecisionId,
  //         tier: `${decision.from} -> ${decision.to}`,
  //         prompt: decision.prompt,
  //         choice: choice.title,
  //         summary: choice.effects.join('; '),
  //       };
  //     })
  //     .filter((d): d is {
  //       id: GrowthDecisionId;
  //       tier: string;
  //       prompt: string;
  //       choice: string;
  //       summary: string;
  //     } => Boolean(d));

  //   const identitySummary = (() => {
  //     const flags = communityValues;
  //     const themes: string[] = [];
  //     if (flags.careFirst) themes.push('care over speed');
  //     if (flags.informalCoordination) themes.push('informal coordination');
  //     if (flags.participatoryGovernance) themes.push('participatory governance');
  //     if (flags.denseLiving) themes.push('living closely to share resources');
  //     if (flags.identityStrong) themes.push('strong local identity');
  //     if (flags.adaptiveGovernance) themes.push('adaptive governance');
  //     if (flags.trustFocused) themes.push('trust-first relations');
  //     if (flags.aidAnchor) themes.push('regional mutual aid');
  //     if (themes.length === 0) return 'This community is steady and pragmatic.';
  //     return `This community leans toward ${themes.join(', ')}.`;
  //   })();

  //   return {
  //     highestTier: communityScale,
  //     prestigeStars,
  //     decisions,
  //     identitySummary,
  //   };
  // }, [communityScale, communityValues, growthDecisionSelections, prestigeStars]);

  const chronologicalLegacy = useMemo(
    () => [...legacyRuns].sort((a, b) => a.createdAt - b.createdAt),
    [legacyRuns],
  );

  const sortedLegacy = useMemo(() => {
    if (!pinnedLegacyRunId) return chronologicalLegacy;
    const pinned = chronologicalLegacy.find((run) => run.id === pinnedLegacyRunId);
    if (!pinned) return chronologicalLegacy;
    return [pinned, ...chronologicalLegacy.filter((run) => run.id !== pinnedLegacyRunId)];
  }, [chronologicalLegacy, pinnedLegacyRunId]);

  const [selectedLegacyId, setSelectedLegacyId] = useState<string | null>(null);
  const selectedLegacy = useMemo(
    () => sortedLegacy.find((run) => run.id === selectedLegacyId),
    [selectedLegacyId, sortedLegacy],
  );

  const [legacyDrafts, setLegacyDrafts] = useState<Record<string, { label: string; note: string }>>({});

  const activeLegacyDraft = useMemo(() => {
    if (!selectedLegacy) return { label: '', note: '' };
    return (
      legacyDrafts[selectedLegacy.id] ?? {
        label: selectedLegacy.label,
        note: selectedLegacy.legacyNote ?? '',
      }
    );
  }, [legacyDrafts, selectedLegacy]);

  const updateLegacyDraft = (field: 'label' | 'note', value: string) => {
    if (!selectedLegacy) return;
    setLegacyDrafts((prev) => {
      const current = prev[selectedLegacy.id] ?? {
        label: selectedLegacy.label,
        note: selectedLegacy.legacyNote ?? '',
      };
      return {
        ...prev,
        [selectedLegacy.id]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const handleSaveLegacyLabel = () => {
    if (selectedLegacy) {
      renameLegacyRun(selectedLegacy.id, activeLegacyDraft.label);
    }
  };

  const handleSaveLegacyNote = () => {
    if (selectedLegacy) {
      setLegacyNote(selectedLegacy.id, activeLegacyDraft.note);
    }
  };

  return (
    <main className="min-h-screen bg-background text-text overflow-x-hidden px-4">
      {/* Header */}
      <section className="pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Community Log</h1>
        <p className="text-sm text-text opacity-70">
          Review past community events and decisions to stay informed about your collective journey.
        </p>
      </section>

      {/* Legacy runs */}
      <section className="max-w-sm mx-auto pb-6">
        <div className="bg-surface rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1 w-1/2">
              <p className="text-sm font-semibold">Legacy Runs</p>
              <p className="text-xs text-text opacity-70">Stars earned across all prestiges.</p>
            </div>
            <div className="flex flex-col items-end w-1/2">

              <span className="text-xs w-full font-semibold px-2 py-1 rounded-full border border-border">
                Total stars: {prestigeStars}
              </span>
            </div>
          </div>

          {sortedLegacy.length === 0 ? (
            <p className="text-xs text-text opacity-70">No legacy runs recorded yet. Prestiging will mark your values.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pinnedLegacyRunId && sortedLegacy[0]?.id === pinnedLegacyRunId && (
                <button
                  onClick={() => setSelectedLegacyId(sortedLegacy[0]!.id)}
                  className="px-3 py-2 rounded-lg border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-left text-xs font-semibold flex flex-col gap-1 hover:opacity-90 transition-opacity"
                  aria-label={`Open pinned legacy star ${sortedLegacy[0]!.starEarned}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 dark:text-amber-200 flex items-center gap-1">
                      <Pin size={12} /> Pinned ★ {sortedLegacy[0]!.starEarned}
                    </span>
                    <span className="text-[11px] text-text opacity-70">{SCALE_LABELS[sortedLegacy[0]!.highestTier]}</span>
                  </div>
                  <p className="text-xs text-text">{sortedLegacy[0]!.label}</p>
                  <p className="text-[11px] text-text opacity-70">{sortedLegacy[0]!.identitySummary}</p>
                </button>
              )}

              <div className="flex flex-wrap gap-2">
                {sortedLegacy
                  .filter((run) => run.id !== pinnedLegacyRunId)
                  .sort((a, b) => b.starEarned - a.starEarned)
                  .map((run) => (
                    <button
                      key={run.id}
                      onClick={() => setSelectedLegacyId(run.id)}
                      className="px-3 py-2 rounded-lg border border-border bg-surface-alt text-left text-xs font-semibold flex flex-col gap-1 hover:opacity-90 transition-opacity min-w-56"
                      aria-label={`Open legacy star ${run.starEarned}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-amber-600 dark:text-amber-300">★ {run.starEarned}</span>
                        {pinnedLegacyRunId === run.id && (
                          <span className="flex items-center gap-1 text-[11px] text-text opacity-80">
                            <Pin size={12} /> Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text">{run.label}</p>
                      <p className="text-[11px] text-text opacity-70">
                        {SCALE_LABELS[run.highestTier]} • {run.identitySummary}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {isDev && (
        <section className="max-w-sm mx-auto pb-4">
          <button
            onClick={() => devLogTestEvent?.()}
            className="w-full py-2 px-3 rounded-lg bg-surface-alt border border-border text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            DEV: Add Test Log Entry
          </button>
        </section>
      )}

      {/* Event List or Empty State */}
      <section className="max-w-sm mx-auto pb-8">
        {eventLog.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-base text-text opacity-60">
              No events yet. Check back after your first community decision.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventLog.map((event: CommonsState['eventLog'][number]) => {
              const meta = eventsById.get(event.id);
              const choiceLabel = meta?.choices.find((choice) => choice.id === event.choice)?.label;

              return (
                <div
                  key={`${event.id}-${event.at}`}
                  className="bg-surface rounded-lg p-4 space-y-2"
                >
                  <h3 className="text-base font-semibold">{meta?.title ?? event.id}</h3>
                  <p className="text-sm text-text opacity-70">{formatTimeAgoNMH(event.at)}</p>
                  <p className="text-sm">
                    Choice: {event.choice}
                    {choiceLabel ? ` - ${choiceLabel}` : event.choice === 'A' ? ' - Option A' : ' - Option B'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedLegacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm px-4">
          <div className="w-full max-w-md max-h-[70vh] bg-surface rounded-xl border border-border shadow-xl p-5 space-y-4 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase opacity-70">Legacy marker</p>
                <span className="text-amber-600 dark:text-amber-300 flex items-center gap-1"><Star fill='currentColor' /> Community {selectedLegacy.label}</span>
                <p className="text-sm text-text opacity-75">Recorded {formatTimeAgoNMH(selectedLegacy.createdAt)}.</p>
              </div>
              <button
                onClick={() => setSelectedLegacyId(null)}
                className="p-2 rounded-lg hover:bg-surface-alt"
                aria-label="Close legacy summary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 text-xs">
              <button
                onClick={() => pinLegacyRun(selectedLegacy.id)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border font-semibold hover:opacity-90"
              >
                <Pin size={14} /> {pinnedLegacyRunId === selectedLegacy.id ? 'Unpin' : 'Pin this run'}
              </button>
              <span className="text-text opacity-70">Pinned run sits at the top of the archive.</span>
            </div>

            <div className="space-y-2 text-sm flex flex-col">
              <label className="text-xs font-semibold">Legacy name</label>
              <div className="flex gap-2 items-center flex-col">
                <input
                  value={activeLegacyDraft.label}
                  onChange={(e) => updateLegacyDraft('label', e.target.value)}
                  onBlur={handleSaveLegacyLabel}
                  maxLength={50}
                  className="flex-1 rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm"
                />
                <button
                  onClick={handleSaveLegacyLabel}
                  className="px-3 py-2 w-full rounded-lg border border-border text-xs font-semibold hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface-alt p-3 space-y-2 text-sm">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Legacy Marker</span>

              </div>
              <p className="text-xs text-text opacity-70">
                Highest tier reached: {SCALE_LABELS[selectedLegacy.highestTier]}
              </p>
              <p className="text-xs text-text opacity-80">{selectedLegacy.identitySummary}</p>
            </div>

            <div className="space-y-2 text-sm">
              <label className="text-xs font-semibold">Legacy sentence (optional)</label>
              <textarea
                value={activeLegacyDraft.note}
                onChange={(e) => updateLegacyDraft('note', e.target.value)}
                onBlur={handleSaveLegacyNote}
                maxLength={180}
                className="w-full min-h-18 rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm"
              />
              <div className="flex items-center justify-between text-[11px] text-text opacity-70">
                <span>{activeLegacyDraft.note.length}/180</span>
                <button
                  onClick={handleSaveLegacyNote}
                  className="px-3 py-1 rounded-lg border border-border text-xs font-semibold hover:opacity-90"
                >
                  Save sentence
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              <p className="text-sm font-semibold">Values remembered</p>
              {selectedLegacy.decisions.length === 0 && (
                <p className="text-xs text-text opacity-70">No key decisions were recorded.</p>
              )}
              {selectedLegacy.decisions.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-surface-alt p-3 text-xs space-y-1">
                  <p className="font-semibold">{item.tier}</p>
                  <p className="opacity-80">{item.prompt}</p>
                  <p className="font-semibold">Chosen: {item.choice}</p>
                  <p className="opacity-80">Result: {item.summary}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLegacyId(null)}
                className="px-3 py-2 rounded-lg border border-border text-sm font-semibold hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}