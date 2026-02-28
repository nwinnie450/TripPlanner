'use client';

import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useItinerary } from '@/hooks/useItinerary';
import { generateDateRange, formatDate } from '@/lib/utils';
import DaySection from '@/components/itinerary/DaySection';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function ItineraryPage() {
  const { passcode } = useTripContext();
  const { trip, isLoading: tripLoading } = useTrip(passcode);
  const { items, isLoading: itemsLoading, error } = useItinerary(passcode);

  if (tripLoading || itemsLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load itinerary." />;
  if (!trip) return null;

  const dates = generateDateRange(trip.startDate, trip.endDate);
  const hasItems = items.length > 0;

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Itinerary</h1>
      <p className="mb-6 text-[13px] text-slate-600">
        {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)}
      </p>

      {!hasItems ? (
        <div className="flex flex-col items-center py-16 text-center">
          <svg
            className="mb-4 text-slate-400"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-[18px] font-semibold text-slate-900">
            No plans yet!
          </p>
          <p className="mt-1 text-[13px] text-slate-600">
            Start building your itinerary by tapping the + button below.
          </p>
        </div>
      ) : (
        dates.map((date, i) => {
          const dayItems = items
            .filter((item) => item.dayDate === date)
            .sort((a, b) => a.time.localeCompare(b.time));
          return (
            <DaySection
              key={date}
              date={date}
              dayNumber={i + 1}
              items={dayItems}
              passcode={passcode}
            />
          );
        })
      )}

      <FloatingActionButton
        href={`/trip/${passcode}/itinerary/add`}
        label="Add activity"
      />
    </div>
  );
}
