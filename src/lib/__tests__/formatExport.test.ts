import { formatSettlementText, formatItineraryText } from '../formatExport';
import type { Balance, ItineraryItem } from '@/types';
import type { EnrichedTransaction } from '@/hooks/useSettlement';

describe('formatSettlementText', () => {
  const baseBalance: Balance = { memberId: '1', memberName: 'Alice', net: 50 };

  it('formats positive, negative, and zero balances', () => {
    const balances: Balance[] = [
      { memberId: '1', memberName: 'Alice', net: 50 },
      { memberId: '2', memberName: 'Bob', net: -30 },
      { memberId: '3', memberName: 'Charlie', net: 0 },
    ];
    const result = formatSettlementText('Tokyo 2026', 'SGD', balances, []);
    expect(result).toContain('Alice');
    expect(result).toContain('(is owed)');
    expect(result).toContain('Bob');
    expect(result).toContain('(owes)');
    expect(result).toContain('Charlie');
    expect(result).toContain('(settled)');
  });

  it('shows pending transactions with remaining amounts', () => {
    const transactions: EnrichedTransaction[] = [
      {
        from: '2',
        fromName: 'Bob',
        to: '1',
        toName: 'Alice',
        amount: 50,
        paid: 0,
        remaining: 50,
      },
    ];
    const result = formatSettlementText('Trip', 'SGD', [baseBalance], transactions);
    expect(result).toContain('Bob → Alice');
    expect(result).toContain('Payments Needed');
  });

  it('shows partially paid transactions', () => {
    const transactions: EnrichedTransaction[] = [
      {
        from: '2',
        fromName: 'Bob',
        to: '1',
        toName: 'Alice',
        amount: 50,
        paid: 20,
        remaining: 30,
      },
    ];
    const result = formatSettlementText('Trip', 'SGD', [baseBalance], transactions);
    expect(result).toContain('paid');
  });

  it('skips fully paid transactions', () => {
    const transactions: EnrichedTransaction[] = [
      {
        from: '2',
        fromName: 'Bob',
        to: '1',
        toName: 'Alice',
        amount: 50,
        paid: 50,
        remaining: 0,
      },
    ];
    const result = formatSettlementText('Trip', 'SGD', [baseBalance], transactions);
    expect(result).not.toContain('Payments Needed');
  });

  it('handles empty data gracefully', () => {
    const result = formatSettlementText('Trip', 'SGD', [], []);
    expect(result).toContain('Trip');
    expect(result).toContain('Shared via GroupTrip');
  });
});

describe('formatItineraryText', () => {
  const makeItem = (overrides: Partial<ItineraryItem>): ItineraryItem => ({
    itemId: '1',
    dayDate: '2026-03-07',
    time: '09:00',
    title: 'Breakfast',
    location: 'Shibuya',
    notes: '',
    createdBy: 'user1',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  });

  it('formats items grouped by day', () => {
    const items = [makeItem({ time: '09:00', title: 'Breakfast', dayDate: '2026-03-07' })];
    const dates = ['2026-03-07'];
    const result = formatItineraryText('Tokyo 2026', '2026-03-07', '2026-03-07', items, dates);
    expect(result).toContain('Day 1');
    expect(result).toContain('Breakfast');
    expect(result).toContain('📍 Shibuya');
  });

  it('adds category emoji when present', () => {
    const items = [makeItem({ category: 'Food', title: 'Sushi' })];
    const dates = ['2026-03-07'];
    const result = formatItineraryText('Trip', '2026-03-07', '2026-03-07', items, dates);
    expect(result).toContain('🍔 Sushi');
  });

  it('skips empty days', () => {
    const items = [makeItem({ dayDate: '2026-03-08' })];
    const dates = ['2026-03-07', '2026-03-08'];
    const result = formatItineraryText('Trip', '2026-03-07', '2026-03-08', items, dates);
    expect(result).not.toContain('Day 1');
    expect(result).toContain('Day 2');
  });

  it('truncates long notes to 80 characters', () => {
    const longNote = 'A'.repeat(100);
    const items = [makeItem({ notes: longNote })];
    const dates = ['2026-03-07'];
    const result = formatItineraryText('Trip', '2026-03-07', '2026-03-07', items, dates);
    expect(result).toContain('...');
    expect(result).not.toContain('A'.repeat(100));
  });

  it('handles empty items gracefully', () => {
    const result = formatItineraryText('Trip', '2026-03-07', '2026-03-07', [], ['2026-03-07']);
    expect(result).toContain('Trip');
    expect(result).toContain('Shared via GroupTrip');
  });
});
