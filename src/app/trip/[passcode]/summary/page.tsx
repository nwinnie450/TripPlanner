'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useTripContext } from '@/context/TripContext';
import { useTrip } from '@/hooks/useTrip';
import { useMembers } from '@/hooks/useMembers';
import { useExpenses } from '@/hooks/useExpenses';
import { useItinerary } from '@/hooks/useItinerary';
import { useSettlement } from '@/hooks/useSettlement';
import { formatCurrency, CATEGORY_COLORS } from '@/lib/constants';
import { formatDate, getDaysBetween } from '@/lib/utils';
import { formatSummaryText } from '@/lib/formatExport';
import StatCard from '@/components/summary/StatCard';
import ShareButton from '@/components/ui/ShareButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { ExpenseCategory } from '@/types';

export default function SummaryPage() {
  const { passcode } = useTripContext();
  const { trip, isLoading: tripLoading } = useTrip(passcode);
  const { members, isLoading: membersLoading } = useMembers(passcode);
  const { expenses, isLoading: expensesLoading } = useExpenses(passcode);
  const { items: itineraryItems, isLoading: itineraryLoading } = useItinerary(passcode);
  const { groups: settlementGroups, isLoading: settlementLoading } = useSettlement(passcode);

  const isLoading = tripLoading || membersLoading || expensesLoading || itineraryLoading || settlementLoading;

  const stats = useMemo(() => {
    if (!trip) return null;

    const currency = trip.currency;
    const memberCount = members.length;
    const duration = getDaysBetween(trip.startDate, trip.endDate);

    // Only count group expenses for summary stats
    const groupExpenses = expenses.filter((e) => e.expenseType !== 'personal');

    // Total spent (group only)
    const totalSpent = groupExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Per person
    const perPerson = memberCount > 0 ? totalSpent / memberCount : 0;

    // Budget status
    const budgetRemaining = trip.budget - totalSpent;

    // Top category (group only)
    const categoryTotals: Partial<Record<ExpenseCategory, number>> = {};
    for (const e of groupExpenses) {
      categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount;
    }
    let topCategory: ExpenseCategory | null = null;
    let topCategoryTotal = 0;
    for (const [cat, total] of Object.entries(categoryTotals)) {
      if (total > topCategoryTotal) {
        topCategory = cat as ExpenseCategory;
        topCategoryTotal = total;
      }
    }

    // Biggest expense
    let biggestExpense: { description: string; amount: number } | null = null;
    for (const e of expenses) {
      if (!biggestExpense || e.amount > biggestExpense.amount) {
        biggestExpense = { description: e.description, amount: e.amount };
      }
    }

    // Most generous (paid the most)
    const paidByTotals: Record<string, number> = {};
    for (const e of expenses) {
      paidByTotals[e.paidBy] = (paidByTotals[e.paidBy] ?? 0) + e.amount;
    }
    let mostGenerousId: string | null = null;
    let mostGenerousTotal = 0;
    for (const [memberId, total] of Object.entries(paidByTotals)) {
      if (total > mostGenerousTotal) {
        mostGenerousId = memberId;
        mostGenerousTotal = total;
      }
    }
    const mostGenerousName = mostGenerousId
      ? members.find((m) => m.memberId === mostGenerousId)?.name ?? null
      : null;

    // Activities planned
    const activityCount = itineraryItems.length;

    // Busiest day
    const dayItemCounts: Record<string, number> = {};
    for (const item of itineraryItems) {
      dayItemCounts[item.dayDate] = (dayItemCounts[item.dayDate] ?? 0) + 1;
    }
    let busiestDay: string | null = null;
    let busiestDayCount = 0;
    for (const [date, count] of Object.entries(dayItemCounts)) {
      if (count > busiestDayCount) {
        busiestDay = date;
        busiestDayCount = count;
      }
    }

    // Settlement status
    const allTransactions = settlementGroups.flatMap((g) => g.transactions);
    const settledCount = allTransactions.filter((tx) => tx.remaining === 0).length;
    const totalTransactions = allTransactions.length;

    return {
      currency,
      memberCount,
      duration,
      totalSpent,
      perPerson,
      budgetRemaining,
      topCategory,
      topCategoryTotal,
      biggestExpense,
      mostGenerousName,
      activityCount,
      busiestDay,
      busiestDayCount,
      settledCount,
      totalTransactions,
    };
  }, [trip, members, expenses, itineraryItems, settlementGroups]);

  if (isLoading) return <LoadingSpinner />;
  if (!trip || !stats) return <ErrorMessage message="Failed to load trip data." />;

  const hasExpenses = expenses.length > 0;
  const hasItinerary = itineraryItems.length > 0;

  const topCategoryConfig = stats.topCategory ? CATEGORY_COLORS[stats.topCategory] : null;

  function getShareData() {
    return {
      title: `${trip!.tripName} - Trip Recap`,
      text: formatSummaryText(
        trip!.tripName,
        stats!.currency,
        stats!.totalSpent,
        stats!.memberCount,
        stats!.topCategory ?? '',
        topCategoryConfig?.emoji ?? '',
        stats!.biggestExpense,
        stats!.mostGenerousName,
        stats!.activityCount,
        stats!.duration,
      ),
    };
  }

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#EC4899] px-6 pb-8 pt-6">
        <span className="pointer-events-none absolute -right-2 -top-2 text-[64px] opacity-20 rotate-12 select-none">
          📊
        </span>
        <span className="pointer-events-none absolute right-16 top-8 text-[40px] opacity-15 -rotate-6 select-none">
          💰
        </span>
        <span className="pointer-events-none absolute left-2 bottom-2 text-[48px] opacity-15 rotate-6 select-none">
          ✈️
        </span>
        <span className="pointer-events-none absolute right-8 bottom-0 text-[36px] opacity-15 select-none">
          🏆
        </span>
        <Link
          href={`/trip/${passcode}`}
          className="relative z-10 mb-2 inline-flex items-center gap-0.5 text-[13px] font-medium text-white/70"
        >
          <ChevronLeft size={14} />
          Dashboard
        </Link>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-md font-[family-name:var(--font-display)]">
              Trip Recap
            </h1>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
              <span className="text-[13px] font-medium text-white">
                {trip.tripName}
              </span>
            </div>
          </div>
          <ShareButton getShareData={getShareData} />
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-50 to-white p-6">
        {!hasExpenses && !hasItinerary ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-[56px] mb-3">🗺️</span>
            <p className="text-[18px] font-bold text-slate-900 font-[family-name:var(--font-display)]">
              No data yet
            </p>
            <p className="mt-1 text-[13px] text-slate-500">
              Add expenses or itinerary items to see your trip recap.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {hasExpenses && (
              <>
                <StatCard
                  emoji="💰"
                  label="Total Spent"
                  value={formatCurrency(stats.totalSpent, stats.currency)}
                />
                <StatCard
                  emoji="👤"
                  label="Per Person"
                  value={formatCurrency(stats.perPerson, stats.currency)}
                  sublabel={`${stats.memberCount} travellers`}
                />
                <StatCard
                  emoji={stats.budgetRemaining >= 0 ? '✅' : '🚨'}
                  label="Budget Status"
                  value={formatCurrency(Math.abs(stats.budgetRemaining), stats.currency)}
                  sublabel={stats.budgetRemaining >= 0 ? 'remaining' : 'overspent'}
                  bgColor={stats.budgetRemaining >= 0 ? '#ECFDF5' : '#FEF2F2'}
                  textColor={stats.budgetRemaining >= 0 ? '#059669' : '#DC2626'}
                />
                {stats.topCategory && topCategoryConfig && (
                  <StatCard
                    emoji={topCategoryConfig.emoji}
                    label="Top Category"
                    value={stats.topCategory}
                    sublabel={formatCurrency(stats.topCategoryTotal, stats.currency)}
                    bgColor={topCategoryConfig.bg}
                    textColor={topCategoryConfig.text}
                  />
                )}
                {stats.biggestExpense && (
                  <StatCard
                    emoji="🏆"
                    label="Biggest Expense"
                    value={formatCurrency(stats.biggestExpense.amount, stats.currency)}
                    sublabel={stats.biggestExpense.description}
                  />
                )}
                {stats.mostGenerousName && (
                  <StatCard
                    emoji="🎖️"
                    label="Most Generous"
                    value={stats.mostGenerousName}
                    bgColor="#FFF7ED"
                    textColor="#C2410C"
                  />
                )}
              </>
            )}
            {hasItinerary && (
              <>
                <StatCard
                  emoji="📍"
                  label="Activities Planned"
                  value={String(stats.activityCount)}
                />
                {stats.busiestDay && (
                  <StatCard
                    emoji="🔥"
                    label="Busiest Day"
                    value={`${stats.busiestDayCount} activities`}
                    sublabel={formatDate(stats.busiestDay)}
                  />
                )}
              </>
            )}
            <StatCard
              emoji="🗓️"
              label="Trip Duration"
              value={`${stats.duration} days`}
              sublabel={`${stats.memberCount} members`}
            />
            {stats.totalTransactions > 0 && (
              <StatCard
                emoji="🤝"
                label="Settlement Status"
                value={`${stats.settledCount} of ${stats.totalTransactions}`}
                sublabel="settled"
                bgColor={stats.settledCount === stats.totalTransactions ? '#ECFDF5' : '#FFF7ED'}
                textColor={stats.settledCount === stats.totalTransactions ? '#059669' : '#C2410C'}
              />
            )}
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-slate-300">
          Shared via GroupTrip
        </p>
      </div>
    </div>
  );
}
