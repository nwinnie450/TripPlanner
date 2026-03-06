import { formatSettlementText, formatItineraryText, formatExpensesJson } from '../formatExport';
import type { ItineraryItem, Expense, Member } from '@/types';
import type { CurrencySettlementGroup } from '@/hooks/useSettlement';

describe('formatSettlementText', () => {
  function makeGroup(overrides: Partial<CurrencySettlementGroup> = {}): CurrencySettlementGroup {
    return {
      currency: 'SGD',
      balances: [],
      transactions: [],
      ...overrides,
    };
  }

  it('shows pending transactions as who pays who', () => {
    const groups = [
      makeGroup({
        transactions: [
          {
            from: '2',
            fromName: 'Bob',
            to: '1',
            toName: 'Alice',
            amount: 50,
            paid: 0,
            remaining: 50,
          },
        ],
      }),
    ];
    const result = formatSettlementText('Tokyo 2026', groups);
    expect(result).toContain('Bob → Alice');
    expect(result).toContain('Who pays who');
  });

  it('shows partially paid transactions', () => {
    const groups = [
      makeGroup({
        transactions: [
          {
            from: '2',
            fromName: 'Bob',
            to: '1',
            toName: 'Alice',
            amount: 50,
            paid: 20,
            remaining: 30,
          },
        ],
      }),
    ];
    const result = formatSettlementText('Trip', groups);
    expect(result).toContain('paid');
  });

  it('shows settled transactions with checkmark', () => {
    const groups = [
      makeGroup({
        transactions: [
          {
            from: '2',
            fromName: 'Bob',
            to: '1',
            toName: 'Alice',
            amount: 50,
            paid: 50,
            remaining: 0,
          },
        ],
      }),
    ];
    const result = formatSettlementText('Trip', groups);
    expect(result).toContain('Settled');
    expect(result).toContain('✅');
  });

  it('handles multi-currency groups', () => {
    const groups = [
      makeGroup({
        currency: 'SGD',
        transactions: [
          { from: '2', fromName: 'Bob', to: '1', toName: 'Alice', amount: 50, paid: 0, remaining: 50 },
        ],
      }),
      makeGroup({
        currency: 'JPY',
        transactions: [
          { from: '3', fromName: 'Charlie', to: '1', toName: 'Alice', amount: 3000, paid: 0, remaining: 3000 },
        ],
      }),
    ];
    const result = formatSettlementText('Trip', groups);
    expect(result).toContain('Bob → Alice');
    expect(result).toContain('Charlie → Alice');
  });

  it('handles empty data gracefully', () => {
    const result = formatSettlementText('Trip', []);
    expect(result).toContain('Trip');
    expect(result).toContain('Shared via GroupTrip');
    expect(result).toContain('No settlements needed');
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

  it('shows full notes without truncation', () => {
    const longNote = 'A'.repeat(100);
    const items = [makeItem({ notes: longNote })];
    const dates = ['2026-03-07'];
    const result = formatItineraryText('Trip', '2026-03-07', '2026-03-07', items, dates);
    expect(result).toContain('A'.repeat(100));
    expect(result).not.toContain('...');
  });

  it('handles empty items gracefully', () => {
    const result = formatItineraryText('Trip', '2026-03-07', '2026-03-07', [], ['2026-03-07']);
    expect(result).toContain('Trip');
    expect(result).toContain('Shared via GroupTrip');
  });
});

describe('formatExpensesJson', () => {
  const members: Member[] = [
    { memberId: 'm1', name: 'Alice', joinedAt: '' },
    { memberId: 'm2', name: 'Bob', joinedAt: '' },
  ];

  const expenses: Expense[] = [
    {
      expenseId: 'e1',
      amount: 120,
      description: 'Dinner',
      category: 'Food',
      expenseType: 'group',
      paidBy: 'm1',
      splitBetween: ['m1', 'm2'],
      date: '2026-03-01',
      createdBy: 'm1',
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('exports valid JSON with member names resolved', () => {
    const result = formatExpensesJson('Trip', 'SGD', expenses, members);
    const parsed = JSON.parse(result);
    expect(parsed.trip).toBe('Trip');
    expect(parsed.currency).toBe('SGD');
    expect(parsed.expenses).toHaveLength(1);
    expect(parsed.expenses[0].paidBy).toBe('Alice');
    expect(parsed.expenses[0].splitBetween).toEqual(['Alice', 'Bob']);
    expect(parsed.expenses[0].type).toBe('group');
  });

  it('handles empty expenses', () => {
    const result = formatExpensesJson('Trip', 'SGD', [], members);
    const parsed = JSON.parse(result);
    expect(parsed.expenses).toHaveLength(0);
  });
});
