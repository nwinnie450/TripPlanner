'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import type { ExpenseCategory } from '@/types';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AddExpensePage() {
  const { passcode, currentMember } = useTripContext();
  const { trip, isLoading: tripLoading } = useTrip(passcode);
  const { members, isLoading: membersLoading } = useMembers(passcode);
  const { mutate } = useExpenses(passcode);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (tripLoading || membersLoading) return <LoadingSpinner />;
  if (!trip) return null;

  async function handleSubmit(data: {
    amount: number;
    description: string;
    category: ExpenseCategory;
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
    <div className="px-4 pt-4">
      <Link
        href={`/trip/${passcode}/expenses`}
        className="mb-4 inline-flex items-center gap-1 text-[15px] text-ocean"
      >
        &larr; Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Add Expense</h1>
      <ExpenseForm
        members={members}
        currency={trip.currency}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
