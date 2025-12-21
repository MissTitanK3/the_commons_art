'use client';

import { useMemo } from 'react';

import { EVENTS } from '@/systems/events';
import { useCommonsStore, type CommonsState } from '@/state/store';
import { formatTimeAgoNMH } from '@/utils/time';

export default function LogPage() {
  const eventLog = useCommonsStore((s: CommonsState) => s.eventLog);
  const devLogTestEvent = useCommonsStore((s: CommonsState) => s.devLogTestEvent);

  const eventsById = useMemo(() => new Map(EVENTS.map((event) => [event.id, event])), []);
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <main className="min-h-screen bg-background text-text overflow-x-hidden px-4">
      {/* Header */}
      <section className="pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Community Log</h1>
        <p className="text-sm text-text opacity-70">
          Review past community events and decisions to stay informed about your collective journey.
        </p>
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
    </main>
  );
}