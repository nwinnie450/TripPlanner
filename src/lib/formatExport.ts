import { formatCurrency, ITINERARY_CATEGORY_CONFIG } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Expense, ItineraryItem, Member } from '@/types';
import type { CurrencySettlementGroup } from '@/hooks/useSettlement';

export function formatSummaryText(
  tripName: string,
  currency: string,
  totalSpent: number,
  memberCount: number,
  topCategory: string,
  topCategoryEmoji: string,
  biggestExpense: { description: string; amount: number } | null,
  mostGenerous: string | null,
  activityCount: number,
  duration: number,
): string {
  const lines: string[] = [];
  lines.push(`📊 ${tripName} — Trip Recap`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(`💰 Total Spent: ${formatCurrency(totalSpent, currency)}`);
  lines.push(`👥 ${memberCount} travellers · ${duration} days`);
  lines.push(
    `👤 Per Person: ${formatCurrency(totalSpent / Math.max(memberCount, 1), currency)}`,
  );
  lines.push('');
  if (topCategory) lines.push(`${topCategoryEmoji} Top Category: ${topCategory}`);
  if (biggestExpense)
    lines.push(
      `🏆 Biggest Expense: ${biggestExpense.description} (${formatCurrency(biggestExpense.amount, currency)})`,
    );
  if (mostGenerous) lines.push(`🎖️ Most Generous: ${mostGenerous}`);
  if (activityCount > 0) lines.push(`📍 ${activityCount} activities planned`);
  lines.push('');
  lines.push('Shared via GroupTrip');
  return lines.join('\n');
}

export function formatSettlementText(
  tripName: string,
  groups: CurrencySettlementGroup[],
): string {
  const lines: string[] = [];

  lines.push(`🧾 ${tripName} — Settlement`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  const allTransactions = groups.flatMap((g) =>
    g.transactions.map((tx) => ({ ...tx, currency: g.currency })),
  );

  const pending = allTransactions.filter((tx) => tx.remaining > 0);
  const settled = allTransactions.filter((tx) => tx.remaining === 0 && tx.amount > 0);

  if (pending.length > 0) {
    lines.push('Who pays who:');
    for (const tx of pending) {
      let line = `  ${tx.fromName} → ${tx.toName}: ${formatCurrency(tx.remaining, tx.currency)}`;
      if (tx.paid > 0) {
        line += ` (${formatCurrency(tx.paid, tx.currency)} paid)`;
      }
      lines.push(line);
    }
    lines.push('');
  }

  if (settled.length > 0) {
    lines.push('Settled:');
    for (const tx of settled) {
      lines.push(`  ✅ ${tx.fromName} → ${tx.toName}: ${formatCurrency(tx.amount, tx.currency)}`);
    }
    lines.push('');
  }

  if (pending.length === 0 && settled.length === 0) {
    lines.push('No settlements needed.');
    lines.push('');
  }

  lines.push('Shared via GroupTrip');
  return lines.join('\n');
}

export function formatItineraryText(
  tripName: string,
  startDate: string,
  endDate: string,
  items: ItineraryItem[],
  dates: string[],
): string {
  const lines: string[] = [];

  lines.push(`🗓️ ${tripName} — Itinerary`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const dayItems = items
      .filter((item) => item.dayDate === date)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (dayItems.length === 0) continue;

    lines.push(`Day ${i + 1} — ${formatDate(date)}`);

    for (const item of dayItems) {
      const emoji = item.category
        ? ITINERARY_CATEGORY_CONFIG[item.category]?.emoji + ' '
        : '';
      lines.push(`  ${item.time}  ${emoji}${item.title}`);
      if (item.location) {
        lines.push(`    📍 ${item.location}`);
      }
      if (item.notes) {
        lines.push(`    ${item.notes}`);
      }
    }
    lines.push('');
  }

  lines.push('Shared via GroupTrip');
  return lines.join('\n');
}

export function formatExpensesJson(
  tripName: string,
  currency: string,
  expenses: Expense[],
  members: Member[],
): string {
  const memberMap = new Map(members.map((m) => [m.memberId, m.name]));

  const data = {
    trip: tripName,
    currency,
    exportedAt: new Date().toISOString().split('T')[0],
    expenses: expenses.map((e) => ({
      date: e.date,
      description: e.description,
      amount: e.amount,
      currency: e.currency ?? currency,
      category: e.category,
      type: e.expenseType ?? 'group',
      paidBy: memberMap.get(e.paidBy) ?? e.paidBy,
      splitBetween: e.splitBetween.map((id) => memberMap.get(id) ?? id),
    })),
  };

  return JSON.stringify(data, null, 2);
}
