'use client';

import Link from 'next/link';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import { formatDate, getDaysBetween } from '@/lib/utils';
import PasscodeDisplay from '@/components/trip/PasscodeDisplay';
import MemberList from '@/components/trip/MemberList';
import BudgetSummary from '@/components/trip/BudgetSummary';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function DashboardPage() {
  const { passcode } = useTripContext();
  const { trip, isLoading, error } = useTrip(passcode);
  const { members } = useMembers(passcode);
  const { expenses } = useExpenses(passcode);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load trip data." />;
  if (!trip) return null;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const days = getDaysBetween(trip.startDate, trip.endDate);

  return (
    <div className="px-4 pt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">{trip.tripName}</h1>
        <p className="text-[13px] text-slate-600">
          {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)}{' '}
          &middot; {days} {days === 1 ? 'day' : 'days'}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <PasscodeDisplay passcode={trip.passcode} />
        <MemberList members={members} />
        <BudgetSummary
          spent={totalSpent}
          budget={trip.budget}
          currency={trip.currency}
        />

        <Card>
          <p className="mb-3 text-[13px] font-semibold text-slate-600">
            Quick Links
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/trip/${passcode}/itinerary`}
              className="flex h-11 items-center justify-center rounded-[10px] bg-ocean-light text-[15px] font-medium text-ocean"
            >
              Itinerary
            </Link>
            <Link
              href={`/trip/${passcode}/expenses`}
              className="flex h-11 items-center justify-center rounded-[10px] bg-ocean-light text-[15px] font-medium text-ocean"
            >
              Expenses
            </Link>
            <Link
              href={`/trip/${passcode}/settlement`}
              className="flex h-11 items-center justify-center rounded-[10px] bg-ocean-light text-[15px] font-medium text-ocean"
            >
              Settlement
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
