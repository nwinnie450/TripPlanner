'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useItinerary } from '@/hooks/useItinerary';
import { generateDateRange } from '@/lib/utils';
import ItineraryForm from '@/components/itinerary/ItineraryForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AddItineraryPage() {
  const { passcode, currentMember } = useTripContext();
  const { trip, isLoading } = useTrip(passcode);
  const { mutate } = useItinerary(passcode);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading || !trip) return <LoadingSpinner />;

  const dates = generateDateRange(trip.startDate, trip.endDate);

  async function handleSubmit(data: {
    dayDate: string;
    title: string;
    time: string;
    location: string;
    notes: string;
  }) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trip/${passcode}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdBy: currentMember?.memberId ?? '',
        }),
      });
      if (res.ok) {
        await mutate();
        router.back();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="px-4 pt-4">
      <Link
        href={`/trip/${passcode}/itinerary`}
        className="mb-4 inline-flex items-center gap-1 text-[15px] text-ocean"
      >
        &larr; Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Add Activity</h1>
      <ItineraryForm
        dates={dates}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
