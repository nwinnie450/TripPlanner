import { EXPENSE_CATEGORIES } from '@/lib/constants';
import type { Expense, ExpenseCategory, ExpenseType, Member } from '@/types';

/** Parses RFC4180-ish CSV text (quoted fields, escaped quotes, CRLF/LF) into rows of cells. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
}

const HEADER_ALIASES: Record<string, string> = {
  date: 'date',
  description: 'description',
  category: 'category',
  amount: 'amount',
  currency: 'currency',
  'paid by': 'paidBy',
  'split between': 'splitBetween',
  'expense type': 'expenseType',
};

export interface RawImportRow {
  rowNumber: number;
  date: string;
  description: string;
  category: string;
  amount: string;
  currency?: string;
  paidByName: string;
  splitBetweenNames: string[];
  expenseType?: string;
}

export interface ImportParseResult {
  rows: RawImportRow[];
  headerErrors: string[];
}

/** Parses the CSV text into raw (unresolved) import rows, matching columns case-insensitively. */
export function parseImportCsv(text: string): ImportParseResult {
  const table = parseCsv(text);
  if (table.length === 0) {
    return { rows: [], headerErrors: ['File is empty'] };
  }

  const [headerRow, ...dataRows] = table;
  const colIndex: Record<string, number> = {};
  headerRow.forEach((h, i) => {
    const key = HEADER_ALIASES[normalizeHeader(h)];
    if (key) colIndex[key] = i;
  });

  const required = ['date', 'description', 'category', 'amount', 'paidBy', 'splitBetween'];
  const headerErrors = required
    .filter((r) => !(r in colIndex))
    .map((r) => `Missing required column: ${r}`);
  if (headerErrors.length > 0) {
    return { rows: [], headerErrors };
  }

  const rows: RawImportRow[] = dataRows
    .filter((r) => r.some((cell) => cell.trim() !== ''))
    .map((cells, idx) => ({
      rowNumber: idx + 2, // +1 for header, +1 for 1-indexing
      date: (cells[colIndex.date] ?? '').trim(),
      description: (cells[colIndex.description] ?? '').trim(),
      category: (cells[colIndex.category] ?? '').trim(),
      amount: (cells[colIndex.amount] ?? '').trim(),
      currency: colIndex.currency !== undefined ? cells[colIndex.currency]?.trim() : undefined,
      paidByName: (cells[colIndex.paidBy] ?? '').trim(),
      splitBetweenNames: (cells[colIndex.splitBetween] ?? '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean),
      expenseType: colIndex.expenseType !== undefined ? cells[colIndex.expenseType]?.trim() : undefined,
    }));

  return { rows, headerErrors: [] };
}

export interface ResolvedImportRow {
  rowNumber: number;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  paidBy: string;
  paidByName: string;
  splitBetween: string[];
  splitBetweenNames: string[];
  expenseType: ExpenseType;
  errors: string[];
  isDuplicate: boolean;
}

function findMemberByName(name: string, members: Member[]): Member | undefined {
  const target = name.trim().toLowerCase();
  return members.find((m) => m.name.trim().toLowerCase() === target);
}

function normalizeDate(raw: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split('T')[0];
}

/** Resolves member names to IDs, validates category/amount/date, and flags errors per row. */
export function resolveImportRow(raw: RawImportRow, members: Member[]): ResolvedImportRow {
  const errors: string[] = [];

  const date = normalizeDate(raw.date);
  if (!date) errors.push(`Invalid date: "${raw.date}"`);

  const amount = parseFloat(raw.amount.replace(/[^0-9.-]/g, ''));
  if (isNaN(amount) || amount <= 0) errors.push(`Invalid amount: "${raw.amount}"`);

  if (!raw.description) errors.push('Description is required');

  const categoryMatch = EXPENSE_CATEGORIES.find(
    (c) => c.toLowerCase() === raw.category.toLowerCase(),
  );
  if (!categoryMatch) errors.push(`Unknown category: "${raw.category}"`);

  const paidByMember = findMemberByName(raw.paidByName, members);
  if (!paidByMember) errors.push(`Unknown member (Paid By): "${raw.paidByName}"`);

  const splitMembers = raw.splitBetweenNames.map((n) => ({
    name: n,
    member: findMemberByName(n, members),
  }));
  const unresolvedSplit = splitMembers.filter((s) => !s.member);
  if (raw.splitBetweenNames.length === 0) {
    errors.push('Split Between is required');
  } else if (unresolvedSplit.length > 0) {
    errors.push(
      `Unknown member(s) (Split Between): ${unresolvedSplit.map((s) => `"${s.name}"`).join(', ')}`,
    );
  }

  const expenseType: ExpenseType = raw.expenseType?.toLowerCase() === 'personal' ? 'personal' : 'group';

  return {
    rowNumber: raw.rowNumber,
    date: date ?? raw.date,
    description: raw.description,
    category: categoryMatch ?? 'Other',
    amount: isNaN(amount) ? 0 : amount,
    currency: raw.currency || undefined,
    paidBy: paidByMember?.memberId ?? '',
    paidByName: raw.paidByName,
    splitBetween: splitMembers.map((s) => s.member?.memberId).filter((id): id is string => !!id),
    splitBetweenNames: raw.splitBetweenNames,
    expenseType,
    errors,
    isDuplicate: false,
  };
}

function normalizeDescription(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Signature used to detect the same expense already present in the trip (date + description + amount). */
export function buildDedupKey(e: { date: string; description: string; amount: number }): string {
  return `${e.date}|${normalizeDescription(e.description)}|${e.amount.toFixed(2)}`;
}

export function buildExistingDedupKeys(expenses: Expense[]): Set<string> {
  return new Set(expenses.map((e) => buildDedupKey(e)));
}
