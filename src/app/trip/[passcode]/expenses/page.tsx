'use client';

import { useState } from 'react';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency } from '@/lib/constants';
import CategoryFilter from '@/components/expenses/CategoryFilter';
import ExpenseCard from '@/components/expenses/ExpenseCard';
import ShareButton from '@/components/ui/ShareButton';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatExpensesJson } from '@/lib/formatExport';

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
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] via-[#FAF5FF] to-white">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-8 pt-6">
        {/* Floating travel emojis */}
        <span className="absolute -right-2 top-3 text-[40px] opacity-20 rotate-12 select-none pointer-events-none">✈️</span>
        <span className="absolute right-16 top-1 text-[28px] opacity-15 -rotate-12 select-none pointer-events-none">🌴</span>
        <span className="absolute left-2 bottom-2 text-[32px] opacity-15 rotate-6 select-none pointer-events-none">🧳</span>
        <span className="absolute right-8 bottom-3 text-[24px] opacity-15 -rotate-6 select-none pointer-events-none">💸</span>

        <div className="relative mb-4 flex items-start justify-between">
          <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-display)]">
            Expenses 💰
          </h1>
          {expenses.length > 0 && (
            <ShareButton
              getShareData={() => ({
                title: `${trip?.tripName ?? 'Trip'} Expenses`,
                text: formatExpensesJson(
                  trip?.tripName ?? 'Trip',
                  currency,
                  expenses,
                  members,
                ),
              })}
            />
          )}
        </div>
        {typeFilter === 'personal' && myPersonalBudget > 0 ? (
          <div className="relative bg-white/20 backdrop-blur-sm rounded-[20px] p-4 border border-white/10">
            <p className="text-[13px] text-white/80 font-medium">My Personal Spending</p>
            <p className="text-[28px] font-extrabold text-white font-[family-name:var(--font-display)]">
              {formatCurrency(myPersonalSpent, currency)}
            </p>
            <p className="text-[13px] text-white/80">
              of {formatCurrency(myPersonalBudget, currency)} personal budget
            </p>
          </div>
        ) : (
          <div className="relative bg-white/20 backdrop-blur-sm rounded-[20px] p-4 border border-white/10">
            <p className="text-[13px] text-white/80 font-medium">Group Spent</p>
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

      <div className="p-6">
        <div className="mb-3 flex gap-2">
          {(['all', 'group', 'personal'] as const).map((type) => {
            const typeEmoji = type === 'all' ? '🌐' : type === 'group' ? '👥' : '🙋';
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
                  typeFilter === type
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white shadow-md scale-105'
                    : 'bg-white/80 text-slate-500 border border-slate-200 hover:border-purple-300'
                }`}
              >
                {typeEmoji} {type === 'all' ? 'All' : type === 'group' ? 'Group' : 'Personal'}
              </button>
            );
          })}
        </div>
        <div className="mb-4">
          <CategoryFilter
            selected={categoryFilter}
            onSelect={setCategoryFilter}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-[20px] bg-white/60 border border-dashed border-purple-200 py-16 text-center">
            <span className="mb-3 text-[56px]">🧾</span>
            <p className="text-[18px] font-bold text-slate-900">
              No expenses yet!
            </p>
            <p className="mt-1 text-[13px] text-slate-500">
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
