import type { ExpenseCategory, ItineraryCategory } from '@/types';

export const PASSCODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export const PASSCODE_LENGTH = 6;

export const MEMBER_LIMIT = 8;

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Accommodation',
  'Activities',
  'Shopping',
  'Other',
];

export const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; emoji: string }> =
  {
    Food: { bg: '#FFF3E0', text: '#E65100', emoji: '🍔' },
    Transport: { bg: '#E3F2FD', text: '#1565C0', emoji: '🚕' },
    Accommodation: { bg: '#F3E5F5', text: '#7B1FA2', emoji: '🏨' },
    Activities: { bg: '#E8F5E9', text: '#2E7D32', emoji: '🎯' },
    Shopping: { bg: '#FFF8E1', text: '#F57F17', emoji: '🛍️' },
    Other: { bg: '#F5F5F5', text: '#616161', emoji: '📌' },
  };

export const ITINERARY_CATEGORIES: ItineraryCategory[] = [
  'Food',
  'Sightseeing',
  'Transport',
  'Hotel',
  'Shopping',
  'Nightlife',
  'Activity',
  'Other',
];

export const ITINERARY_CATEGORY_CONFIG: Record<
  ItineraryCategory,
  { emoji: string; bg: string; text: string }
> = {
  Food: { emoji: '🍔', bg: '#FFF3E0', text: '#E65100' },
  Sightseeing: { emoji: '👀', bg: '#E8F5E9', text: '#2E7D32' },
  Transport: { emoji: '🚕', bg: '#E3F2FD', text: '#1565C0' },
  Hotel: { emoji: '🏨', bg: '#F3E5F5', text: '#7B1FA2' },
  Shopping: { emoji: '🛍️', bg: '#FFF8E1', text: '#F57F17' },
  Nightlife: { emoji: '🌙', bg: '#EDE7F6', text: '#4527A0' },
  Activity: { emoji: '🎯', bg: '#E0F7FA', text: '#00695C' },
  Other: { emoji: '📌', bg: '#F5F5F5', text: '#616161' },
};

export const MAX_ITINERARY_ITEMS_PER_DAY = 50;

export const RATE_LIMITS = {
  PASSCODE_VALIDATION: { maxRequests: 5, windowMs: 60_000 },
  GENERAL: { maxRequests: 60, windowMs: 60_000 },
} as const;

export function formatCurrency(amount: number, currency: string = 'SGD'): string {
  const symbols: Record<string, string> = {
    SGD: 'S$',
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
    JPY: '\u00A5',
    THB: '\u0E3F',
    MYR: 'RM',
    IDR: 'Rp',
    PHP: '\u20B1',
    VND: '\u20AB',
    KRW: '\u20A9',
    CNY: '\u00A5',
    TWD: 'NT$',
    HKD: 'HK$',
    AUD: 'A$',
    NZD: 'NZ$',
    CAD: 'C$',
    CHF: 'CHF',
    INR: '\u20B9',
  };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: amount % 1 !== 0 ? 2 : 0 })}`;
}

export function mapItineraryCategoryToExpense(category?: ItineraryCategory): ExpenseCategory {
  const map: Partial<Record<ItineraryCategory, ExpenseCategory>> = {
    Food: 'Food',
    Shopping: 'Shopping',
    Transport: 'Transport',
    Hotel: 'Accommodation',
    Activity: 'Activities',
    Sightseeing: 'Activities',
    Nightlife: 'Activities',
  };
  return category ? (map[category] ?? 'Other') : 'Other';
}
