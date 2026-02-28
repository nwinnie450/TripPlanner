'use client';

import { useState } from 'react';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency } from '@/lib/utils';
import CategoryFilter from '@/components/expenses/CategoryFilter';
import ExpenseCard from '@/components/expenses/ExpenseCard';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function ExpensesPage() {
  const { passcode } = useTripContext();
  const { trip } = useTrip(passcode);
  const { members } = useMembers(passcode);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const {
    expenses,
    isLoading,
    error,
  } = useExpenses(passcode, categoryFilter ?? undefined);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load expenses." />;

  const currency = trip?.currency ?? 'USD';
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = members.length > 0 ? total / members.length : 0;

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Expenses</h1>

      <Card highlighted className="mb-4">
        <p className="text-[18px] font-bold text-slate-900">
          Total: {formatCurrency(total, currency)}
        </p>
        <p className="text-[13px] text-slate-600">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}{' '}
          &middot; {formatCurrency(perPerson, currency)}/person avg
        </p>
      </Card>

      <div className="mb-4">
        <CategoryFilter
          selected={categoryFilter}
          onSelect={setCategoryFilter}
        />
      </div>

      {expenses.length === 0 ? (
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
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5A3.5 3.5 0 0 0 6 8.5 3.5 3.5 0 0 0 9.5 12H14.5A3.5 3.5 0 0 1 18 15.5 3.5 3.5 0 0 1 14.5 19H6" />
          </svg>
          <p className="text-[18px] font-semibold text-slate-900">
            No expenses yet!
          </p>
          <p className="mt-1 text-[13px] text-slate-600">
            Tap the + button to add your first expense.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.expenseId}
              expense={expense}
              members={members}
              currency={currency}
              passcode={passcode}
            />
          ))}
        </div>
      )}

      <FloatingActionButton
        href={`/trip/${passcode}/expenses/add`}
        label="Add expense"
      />
    </div>
  );
}
