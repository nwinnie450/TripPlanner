'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import type { ExpenseCategory } from '@/types';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

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

  if (tripLoading || membersLoading || expensesLoading)
    return <LoadingSpinner />;
  if (!trip) return null;

  const expense = expenses.find((e) => e.expenseId === expenseId);
  if (!expense) return <ErrorMessage message="Expense not found." />;

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
    if (!confirm('Are you sure you want to delete this expense?')) return;
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
    <div className="px-4 pt-4">
      <Link
        href={`/trip/${passcode}/expenses`}
        className="mb-4 inline-flex items-center gap-1 text-[15px] text-ocean"
      >
        &larr; Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Edit Expense</h1>
      <ExpenseForm
        members={members}
        currency={trip.currency}
        initialData={expense}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
