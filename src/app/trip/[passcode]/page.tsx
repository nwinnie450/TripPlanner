'use client';

import Link from 'next/link';
import { Pencil, ChevronLeft } from 'lucide-react';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import { formatDate, getDaysBetween } from '@/lib/utils';
import PasscodeDisplay from '@/components/trip/PasscodeDisplay';
import MemberList from '@/components/trip/MemberList';
import BudgetSummary from '@/components/trip/BudgetSummary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function DashboardPage() {
  const { passcode, currentMember } = useTripContext();
  const { trip, isLoading, error } = useTrip(passcode);
  const { members } = useMembers(passcode);
  const { expenses } = useExpenses(passcode);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load trip data." />;
  if (!trip) return null;

  const totalSpent = expenses
    .filter((e) => e.expenseType !== 'personal')
    .reduce((sum, e) => sum + e.amount, 0);
  const days = getDaysBetween(trip.startDate, trip.endDate);

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#EC4899] px-6 pb-8 pt-6">
        <span className="pointer-events-none absolute -right-2 -top-2 text-[64px] opacity-20 rotate-12 select-none">
          ✈️
        </span>
        <span className="pointer-events-none absolute right-16 top-8 text-[40px] opacity-15 -rotate-6 select-none">
          ☁️
        </span>
        <span className="pointer-events-none absolute left-2 bottom-2 text-[48px] opacity-15 rotate-6 select-none">
          🌍
        </span>
        <span className="pointer-events-none absolute right-8 bottom-0 text-[36px] opacity-15 select-none">
          🗺️
        </span>
        <Link
          href="/"
          className="relative z-10 mb-2 inline-flex items-center gap-0.5 text-[13px] font-medium text-white/70"
        >
          <ChevronLeft size={14} />
          My Trips
        </Link>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-md font-[family-name:var(--font-display)]">
              {trip.tripName}
            </h1>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
              <span className="text-[13px] font-medium text-white">
                {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/60" />
              <span className="text-[13px] font-bold text-white">
                {days} {days === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
          <Link
            href={`/trip/${passcode}/edit`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
          >
            <Pencil size={16} />
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-50 to-white p-6 flex flex-col gap-6">
        <PasscodeDisplay passcode={trip.passcode} />
        <MemberList members={members} />
        <BudgetSummary
          spent={totalSpent}
          budget={trip.budget}
          currency={trip.currency}
          budgetPerPax={trip.budgetPerPax}
          memberCount={members.length}
          label="Group Budget"
        />
        {(() => {
          if (!currentMember) return null;
          const myBudget = trip.personalBudgets?.[currentMember.memberId];
          if (!myBudget || myBudget <= 0) return null;
          const myPersonalSpent = expenses
            .filter((e) => e.expenseType === 'personal' && e.paidBy === currentMember.memberId)
            .reduce((sum, e) => sum + e.amount, 0);
          return (
            <BudgetSummary
              spent={myPersonalSpent}
              budget={myBudget}
              currency={trip.currency}
              label="My Personal Budget"
            />
          );
        })()}

        <div>
          <p className="mb-3 text-[13px] font-semibold text-slate-600">Quick Links</p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/trip/${passcode}/summary`}
              className="flex h-14 items-center justify-center gap-2 rounded-[16px] bg-white text-[15px] font-semibold text-ocean shadow-md transition-shadow hover:shadow-lg"
            >
              <span className="text-lg">📊</span> Summary
            </Link>
            <Link
              href={`/trip/${passcode}/checklist`}
              className="flex h-14 items-center justify-center gap-2 rounded-[16px] bg-white text-[15px] font-semibold text-ocean shadow-md transition-shadow hover:shadow-lg"
            >
              <span className="text-lg">✅</span> Checklist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
