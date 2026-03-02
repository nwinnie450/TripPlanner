'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useItinerary } from '@/hooks/useItinerary';
import { generateDateRange } from '@/lib/utils';
import ItineraryForm from '@/components/itinerary/ItineraryForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function EditItineraryPage() {
  const { passcode } = useTripContext();
  const params = useParams();
  const rawItemId = params.itemId;
  const itemId = typeof rawItemId === 'string' ? rawItemId : '';
  const { trip, isLoading: tripLoading } = useTrip(passcode);
  const { items, isLoading: itemsLoading, mutate } = useItinerary(passcode);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (tripLoading || itemsLoading) return <LoadingSpinner />;
  if (!trip) return null;

  const item = items.find((i) => i.itemId === itemId);
  if (!item) return <ErrorMessage message="Item not found." />;

  const dates = generateDateRange(trip.startDate, trip.endDate);

  async function handleSubmit(data: {
    dayDate: string;
    title: string;
    time: string;
    location: string;
    locationLat?: number;
    locationLng?: number;
    category?: string;
    transportMode?: string;
    notes: string;
  }) {
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/trip/${passcode}/itinerary/${itemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      );
      if (res.ok) {
        await mutate();
        router.back();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      const res = await fetch(
        `/api/trip/${passcode}/itinerary/${itemId}`,
        { method: 'DELETE' },
      );
      if (res.ok) {
        await mutate();
        router.replace(`/trip/${passcode}/itinerary`);
      }
    } catch {
      alert('Failed to delete. Please try again.');
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
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Edit Activity
      </h1>
      <ItineraryForm
        dates={dates}
        initialData={item}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
