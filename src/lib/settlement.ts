import type { Expense, Member, Balance, Transaction } from "@/types";

/** Round to 2 decimal places */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Greedy debt simplification: match largest creditor with largest debtor,
 * transfer the minimum of the two, repeat. Produces at most N-1 transactions.
 */
function settleDebts(
  netMap: Map<string, number>,
  memberMap: Map<string, string>,
): Transaction[] {
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [memberId, net] of netMap) {
    const rounded = round2(net);
    if (rounded > 0.01) {
      creditors.push({ id: memberId, amount: rounded });
    } else if (rounded < -0.01) {
      debtors.push({ id: memberId, amount: Math.abs(rounded) });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const transfer = Math.min(creditors[ci].amount, debtors[di].amount);
    const roundedTransfer = round2(transfer);

    if (roundedTransfer > 0) {
      transactions.push({
        from: debtors[di].id,
        fromName: memberMap.get(debtors[di].id) ?? "",
        to: creditors[ci].id,
        toName: memberMap.get(creditors[ci].id) ?? "",
        amount: roundedTransfer,
      });
    }

    creditors[ci].amount -= transfer;
    debtors[di].amount -= transfer;

    if (creditors[ci].amount < 0.01) ci++;
    if (debtors[di].amount < 0.01) di++;
  }

  return transactions;
}

export function calculateSettlement(
  expenses: Expense[],
  members: Member[]
): { balances: Balance[]; transactions: Transaction[] } {
  const memberMap = new Map(members.map((m) => [m.memberId, m.name]));

  // Calculate net balance for each member
  const netMap = new Map<string, number>();
  for (const member of members) {
    netMap.set(member.memberId, 0);
  }

  for (const expense of expenses) {
    if (expense.expenseType === 'personal') continue;
    if (expense.splitBetween.length === 0) continue;

    const total = round2(expense.amount);
    const count = expense.splitBetween.length;
    const sharePerPerson = Math.floor((total * 100) / count) / 100;
    // Remainder cents go to the payer (avoids rounding drift)
    const remainder = round2(total - sharePerPerson * count);

    // Payer gets credit for the full amount
    const currentPayerBalance = netMap.get(expense.paidBy) ?? 0;
    netMap.set(expense.paidBy, currentPayerBalance + total);

    // Each person in the split gets debited their share
    for (const memberId of expense.splitBetween) {
      const currentBalance = netMap.get(memberId) ?? 0;
      netMap.set(memberId, currentBalance - sharePerPerson);
    }

    // Assign remainder cents to the payer so balances sum to zero
    if (remainder > 0) {
      const payerBalance = netMap.get(expense.paidBy) ?? 0;
      netMap.set(expense.paidBy, payerBalance - remainder);
    }
  }

  // Build balances list
  const balances: Balance[] = members.map((m) => ({
    memberId: m.memberId,
    memberName: m.name,
    net: round2(netMap.get(m.memberId) ?? 0),
  }));

  const transactions = settleDebts(netMap, memberMap);

  return { balances, transactions };
}

/**
 * Given raw expense-based balances and recorded payments,
 * compute the remaining transactions needed to fully settle.
 * Payments shift net positions: payer's balance goes up, receiver's goes down.
 */
export function calculateRemainingTransactions(
  balances: Balance[],
  payments: { from: string; to: string; amount: number }[],
  members: Member[],
): Transaction[] {
  const memberMap = new Map(members.map((m) => [m.memberId, m.name]));

  // Start from expense-based net balances
  const netMap = new Map<string, number>();
  for (const b of balances) {
    netMap.set(b.memberId, b.net);
  }

  // Apply payments: payer's net goes up, receiver's net goes down
  for (const p of payments) {
    const fromNet = netMap.get(p.from) ?? 0;
    const toNet = netMap.get(p.to) ?? 0;
    netMap.set(p.from, fromNet + p.amount);
    netMap.set(p.to, toNet - p.amount);
  }

  return settleDebts(netMap, memberMap);
}

export interface CurrencySettlement {
  currency: string;
  balances: Balance[];
  transactions: Transaction[];
}

export function calculateMultiCurrencySettlement(
  expenses: Expense[],
  members: Member[],
  baseCurrency: string,
  exchangeRates?: Record<string, number>,
): CurrencySettlement[] {
  const groupExpenses = expenses.filter((e) => e.expenseType !== 'personal');

  if (groupExpenses.length === 0) {
    return [{ currency: baseCurrency, ...calculateSettlement([], members) }];
  }

  const usedCurrencies = new Set(
    groupExpenses.map((e) => e.currency ?? baseCurrency)
  );

  const nonBaseCurrencies = [...usedCurrencies].filter(
    (c) => c !== baseCurrency
  );

  const canConvert =
    exchangeRates &&
    nonBaseCurrencies.length > 0 &&
    nonBaseCurrencies.every((c) => exchangeRates[c] !== undefined);

  if (nonBaseCurrencies.length === 0 || canConvert) {
    const convertedExpenses: Expense[] = groupExpenses.map((e) => {
      const expCurrency = e.currency ?? baseCurrency;
      if (expCurrency === baseCurrency) return e;
      const rate = exchangeRates![expCurrency];
      return { ...e, amount: round2(e.amount * rate), currency: baseCurrency };
    });

    const { balances, transactions } = calculateSettlement(
      convertedExpenses,
      members
    );
    return [{ currency: baseCurrency, balances, transactions }];
  }

  const grouped = new Map<string, Expense[]>();
  for (const expense of groupExpenses) {
    const currency = expense.currency ?? baseCurrency;
    if (!grouped.has(currency)) {
      grouped.set(currency, []);
    }
    grouped.get(currency)!.push(expense);
  }

  const results: CurrencySettlement[] = [];
  for (const [currency, currencyExpenses] of grouped) {
    const { balances, transactions } = calculateSettlement(
      currencyExpenses,
      members
    );
    results.push({ currency, balances, transactions });
  }

  return results;
}
