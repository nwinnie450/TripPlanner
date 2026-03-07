'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import type { ExpenseCategory, ExpenseType } from '@/types';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function EditExpensePage() {
  const { passcode } = useTripContext();
  const params = useParams();
  const rawExpenseId = params.expenseId;
  const expenseId = typeof rawExpenseId === 'string' ? rawExpenseId : '';
  const { trip, isLoading: tripLoading } = useTrip(passcode);
  const { members, isLoading: membersLoading } = useMembers(passcode);
  const { expenses, isLoading: expensesLoading, mutate } =
    useExpenses(passcode);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (tripLoading || membersLoading || expensesLoading)
    return <LoadingSpinner />;
  if (!trip) return null;

  const allCurrencies = [trip.currency, ...(trip.currencies ?? [])];

  const expense = expenses.find((e) => e.expenseId === expenseId);
  if (!expense) return <ErrorMessage message="Expense not found." />;

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
      const res = await fetch(
        `/api/trip/${passcode}/expenses/${expenseId}`,
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
    setShowConfirm(false);
    try {
      const res = await fetch(
        `/api/trip/${passcode}/expenses/${expenseId}`,
        { method: 'DELETE' },
      );
      if (res.ok) {
        await mutate();
        router.replace(`/trip/${passcode}/expenses`);
      }
    } catch {
      alert('Failed to delete. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] via-[#FAF5FF] to-white">
      <div className="relative overflow-hidden flex items-center bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-4 pb-6 pt-12">
        {/* Floating travel emojis */}
        <span className="absolute right-4 top-4 text-[32px] opacity-20 rotate-12 select-none pointer-events-none">🧾</span>
        <span className="absolute right-20 top-2 text-[24px] opacity-15 -rotate-6 select-none pointer-events-none">✏️</span>

        <Link
          href={`/trip/${passcode}/expenses`}
          className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="relative ml-3 font-[family-name:var(--font-display)] text-[20px] font-bold text-white">
          Edit Expense ✏️
        </h1>
      </div>
      <div className="px-5 -mt-3">
        <div className="rounded-[20px] border-t-4 border-dashed border-[#A78BFA] bg-white p-6 shadow-lg">
          <ExpenseForm
            members={members}
            currency={trip.currency}
            currencies={allCurrencies}
            initialData={expense}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            onDelete={() => setShowConfirm(true)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
      <ConfirmDialog
        open={showConfirm}
        title="Delete Expense"
        message="Are you sure? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
