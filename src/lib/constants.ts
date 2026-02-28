import type { ExpenseCategory } from "@/types";

export const PASSCODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export const PASSCODE_LENGTH = 6;

export const MEMBER_LIMIT = 8;

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Accommodation",
  "Activities",
  "Shopping",
  "Other",
];

export const CATEGORY_COLORS: Record<
  ExpenseCategory,
  { bg: string; text: string }
> = {
  Food: { bg: "#FFF3E0", text: "#E65100" },
  Transport: { bg: "#E3F2FD", text: "#1565C0" },
  Accommodation: { bg: "#F3E5F5", text: "#7B1FA2" },
  Activities: { bg: "#E8F5E9", text: "#2E7D32" },
  Shopping: { bg: "#FFF8E1", text: "#F57F17" },
  Other: { bg: "#F5F5F5", text: "#616161" },
};

export const MAX_ITINERARY_ITEMS_PER_DAY = 50;

export const RATE_LIMITS = {
  PASSCODE_VALIDATION: { maxRequests: 5, windowMs: 60_000 },
  GENERAL: { maxRequests: 60, windowMs: 60_000 },
} as const;
