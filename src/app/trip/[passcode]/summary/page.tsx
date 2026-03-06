'use client';

import { useMemo } from 'react';
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

    // Total spent
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Per person
    const perPerson = memberCount > 0 ? totalSpent / memberCount : 0;

    // Budget status
    const budgetRemaining = trip.budget - totalSpent;

    // Top category
    const categoryTotals: Partial<Record<ExpenseCategory, number>> = {};
    for (const e of expenses) {
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
      <div className="bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] px-6 pb-6 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-display)]">
              Trip Recap
            </h1>
            <p className="text-[13px] text-white/80">{trip.tripName}</p>
          </div>
          <ShareButton getShareData={getShareData} />
        </div>
      </div>

      <div className="bg-white p-6">
        {!hasExpenses && !hasItinerary ? (
          <p className="py-12 text-center text-sm text-slate-400">
            No data yet. Add expenses or itinerary items to see your trip recap.
          </p>
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
