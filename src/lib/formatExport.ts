import { formatCurrency, ITINERARY_CATEGORY_CONFIG } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Balance, ItineraryItem } from '@/types';
import type { EnrichedTransaction } from '@/hooks/useSettlement';

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
  currency: string,
  balances: Balance[],
  transactions: EnrichedTransaction[],
): string {
  const lines: string[] = [];

  lines.push(`🧾 ${tripName} — Settlement`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  if (balances.length > 0) {
    lines.push('Net Balances:');
    for (const b of balances) {
      const sign = b.net > 0 ? '+' : '';
      const label = b.net > 0 ? '(is owed)' : b.net < 0 ? '(owes)' : '(settled)';
      lines.push(`  ${b.memberName}: ${sign}${formatCurrency(b.net, currency)} ${label}`);
    }
    lines.push('');
  }

  const pending = transactions.filter((tx) => tx.remaining > 0);
  if (pending.length > 0) {
    lines.push('Payments Needed:');
    for (const tx of pending) {
      let line = `  ${tx.fromName} → ${tx.toName}: ${formatCurrency(tx.remaining, currency)}`;
      if (tx.paid > 0) {
        line += ` (${formatCurrency(tx.paid, currency)} paid)`;
      }
      lines.push(line);
    }
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
        lines.push(`         📍 ${item.location}`);
      }
      if (item.notes) {
        const truncated = item.notes.length > 80 ? item.notes.slice(0, 77) + '...' : item.notes;
        lines.push(`         ${truncated}`);
      }
    }
    lines.push('');
  }

  lines.push('Shared via GroupTrip');
  return lines.join('\n');
}
