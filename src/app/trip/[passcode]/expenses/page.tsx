'use client';

import { useState } from 'react';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency } from '@/lib/constants';
import CategoryFilter from '@/components/expenses/CategoryFilter';
import ExpenseCard from '@/components/expenses/ExpenseCard';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function ExpensesPage() {
  const { passcode, currentMember } = useTripContext();
  const { trip } = useTrip(passcode);
  const { members } = useMembers(passcode);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'group' | 'personal'>('all');
  const {
    expenses,
    isLoading,
    error,
  } = useExpenses(passcode, categoryFilter ?? undefined);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load expenses." />;

  const currency = trip?.currency ?? 'USD';
  const groupExpenses = expenses.filter((e) => e.expenseType !== 'personal');
  const personalExpenses = expenses.filter((e) => e.expenseType === 'personal');
  const groupTotal = groupExpenses.reduce((sum, e) => sum + e.amount, 0);
  const personalTotal = personalExpenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = members.length > 0 ? groupTotal / members.length : 0;

  const myPersonalBudget = currentMember
    ? (trip?.personalBudgets?.[currentMember.memberId] ?? 0)
    : 0;
  const myPersonalExpenses = personalExpenses.filter(
    (e) => e.paidBy === currentMember?.memberId,
  );
  const myPersonalSpent = myPersonalExpenses.reduce((sum, e) => sum + e.amount, 0);

  const filtered = typeFilter === 'all'
    ? expenses
    : typeFilter === 'personal'
      ? personalExpenses
      : groupExpenses;

  return (
    <div>
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-6 pt-6">
        <h1 className="mb-4 text-2xl font-extrabold text-white font-[family-name:var(--font-display)]">
          Expenses
        </h1>
        {typeFilter === 'personal' && myPersonalBudget > 0 ? (
          <div className="bg-white/20 rounded-[20px] p-4">
            <p className="text-[13px] text-white/80">My Personal Spending</p>
            <p className="text-[28px] font-extrabold text-white font-[family-name:var(--font-display)]">
              {formatCurrency(myPersonalSpent, currency)}
            </p>
            <p className="text-[13px] text-white/80">
              of {formatCurrency(myPersonalBudget, currency)} personal budget
            </p>
          </div>
        ) : (
          <div className="bg-white/20 rounded-[20px] p-4">
            <p className="text-[13px] text-white/80">Group Spent</p>
            <p className="text-[28px] font-extrabold text-white font-[family-name:var(--font-display)]">
              {formatCurrency(groupTotal, currency)}
            </p>
            <p className="text-[13px] text-white/80">
              of {formatCurrency(trip?.budget ?? 0, currency)} budget &middot;{' '}
              {formatCurrency(perPerson, currency)}/person
            </p>
            {personalTotal > 0 && (
              <p className="mt-1 text-[13px] text-white/60">
                + {formatCurrency(personalTotal, currency)} personal
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6">
        <div className="mb-3 flex gap-2">
          {(['all', 'group', 'personal'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                typeFilter === type
                  ? 'bg-ocean text-white'
                  : 'bg-white text-slate-600'
              }`}
            >
              {type === 'all' ? 'All' : type === 'group' ? 'Group' : 'Personal'}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <CategoryFilter
            selected={categoryFilter}
            onSelect={setCategoryFilter}
          />
        </div>

        {filtered.length === 0 ? (
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
            {filtered.map((expense) => (
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
    </div>
  );
}
