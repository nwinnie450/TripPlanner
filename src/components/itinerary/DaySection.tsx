'use client';

import { Fragment, useCallback } from 'react';
import type { ItineraryItem, TransportMode } from '@/types';
import { formatDate } from '@/lib/utils';
import ItineraryItemCard from './ItineraryItem';
import TravelSegmentConnector from './TravelSegmentConnector';
import { useTravelSegments } from '@/hooks/useTravelSegments';
import { useItinerary } from '@/hooks/useItinerary';

interface DaySectionProps {
  date: string;
  dayNumber: number;
  items: ItineraryItem[];
  passcode: string;
}

export default function DaySection({ date, dayNumber, items, passcode }: DaySectionProps) {
  const segments = useTravelSegments(items);
  const { mutate } = useItinerary(passcode);

  const handleModeChange = useCallback(
    async (itemId: string, mode: TransportMode) => {
      // Optimistic update: mutate SWR cache
      mutate(
        (current) => {
          if (!current) return current;
          return {
            items: current.items.map((item) =>
              item.itemId === itemId ? { ...item, transportMode: mode } : item,
            ),
          };
        },
        { revalidate: false },
      );

      // Persist to server
      await fetch(`/api/trip/${passcode}/itinerary/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transportMode: mode }),
      });
    },
    [passcode, mutate],
  );

  const dayEmojis = ['🌅', '☀️', '🌴', '🎯', '🗻', '🎪', '🌊', '🏰', '🎨', '🌸'];
  const dayEmoji = dayEmojis[(dayNumber - 1) % dayEmojis.length];

  return (
    <section className="mb-8">
      <div className="sticky top-0 z-10 mb-4 rounded-[16px] bg-gradient-to-r from-violet-50 to-amber-50/60 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-[22px]">{dayEmoji}</span>
          <h2 className="font-[family-name:var(--font-display)] text-[17px] font-bold text-slate-900">
            Day {dayNumber}
          </h2>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#7C3AED] shadow-sm">
            {formatDate(date)}
          </span>
          <span className="ml-auto rounded-full bg-[#8B5CF6]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#7C3AED]">
            {items.length} {items.length === 1 ? 'activity' : 'activities'}
          </span>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-col gap-3 pl-2">
          {items.map((item, index) => (
            <Fragment key={item.itemId}>
              <ItineraryItemCard item={item} passcode={passcode} />
              {index < items.length - 1 &&
                segments[index] &&
                segments[index].status !== 'no-coords' && (
                  <TravelSegmentConnector
                    segment={segments[index]}
                    onModeChange={(mode) => handleModeChange(item.itemId, mode)}
                  />
                )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-[20px] bg-white/60 py-8 text-center">
          <span className="mb-2 text-[28px]">🗓️</span>
          <p className="text-[13px] text-slate-400">No activities yet. Tap + to add something!</p>
        </div>
      )}
    </section>
  );
}
