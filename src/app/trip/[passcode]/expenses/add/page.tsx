'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import type { ExpenseCategory, ExpenseType } from '@/types';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AddExpensePage() {
  const { passcode, currentMember } = useTripContext();
  const { trip, isLoading: tripLoading } = useTrip(passcode);
  const { members, isLoading: membersLoading } = useMembers(passcode);
  const { mutate } = useExpenses(passcode);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = {
    description: searchParams.get('title') ?? '',
    category: (searchParams.get('category') as ExpenseCategory) ?? undefined,
    date: searchParams.get('date') ?? '',
  };

  if (tripLoading || membersLoading) return <LoadingSpinner />;
  if (!trip) return null;

  const allCurrencies = [trip.currency, ...(trip.currencies ?? [])];

  async function handleSubmit(data: {
    amount: number;
    currency: string;
    description: string;
    category: ExpenseCategory;
    expenseType: ExpenseType;
    date: string;
    paidBy: string;
    splitBetween: string[];
  }) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trip/${passcode}/expenses`, {
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
    <div className="min-h-screen bg-white">
      <div className="flex items-center bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-4 pb-4 pt-12">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h1 className="ml-3 font-[family-name:var(--font-display)] text-[20px] font-bold text-white">
          Add Expense
        </h1>
      </div>
      <div className="p-6">
        <ExpenseForm
          members={members}
          currency={trip.currency}
          currencies={allCurrencies}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  );
}
