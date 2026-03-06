import type { Expense, Member, Balance, Transaction } from "@/types";

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
    const sharePerPerson = expense.amount / expense.splitBetween.length;

    // Payer gets credit for the full amount
    const currentPayerBalance = netMap.get(expense.paidBy) ?? 0;
    netMap.set(expense.paidBy, currentPayerBalance + expense.amount);

    // Each person in the split gets debited their share
    for (const memberId of expense.splitBetween) {
      const currentBalance = netMap.get(memberId) ?? 0;
      netMap.set(memberId, currentBalance - sharePerPerson);
    }
  }

  // Build balances list
  const balances: Balance[] = members.map((m) => ({
    memberId: m.memberId,
    memberName: m.name,
    net: Math.round((netMap.get(m.memberId) ?? 0) * 100) / 100,
  }));

  // Greedy debt simplification
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [memberId, net] of netMap) {
    const rounded = Math.round(net * 100) / 100;
    if (rounded > 0.01) {
      creditors.push({ id: memberId, amount: rounded });
    } else if (rounded < -0.01) {
      debtors.push({ id: memberId, amount: Math.abs(rounded) });
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const transfer = Math.min(creditors[ci].amount, debtors[di].amount);
    const roundedTransfer = Math.round(transfer * 100) / 100;

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

  return { balances, transactions };
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
  if (expenses.length === 0) {
    return [{ currency: baseCurrency, ...calculateSettlement([], members) }];
  }

  // Determine unique currencies used
  const usedCurrencies = new Set(
    expenses.map((e) => e.currency ?? baseCurrency)
  );

  const nonBaseCurrencies = [...usedCurrencies].filter(
    (c) => c !== baseCurrency
  );

  // Check if exchange rates cover all non-base currencies
  const canConvert =
    exchangeRates &&
    nonBaseCurrencies.length > 0 &&
    nonBaseCurrencies.every((c) => exchangeRates[c] !== undefined);

  if (nonBaseCurrencies.length === 0 || canConvert) {
    // Convert everything to base currency
    const convertedExpenses: Expense[] = expenses.map((e) => {
      const expCurrency = e.currency ?? baseCurrency;
      if (expCurrency === baseCurrency) return e;
      const rate = exchangeRates![expCurrency];
      return { ...e, amount: e.amount * rate, currency: baseCurrency };
    });

    const { balances, transactions } = calculateSettlement(
      convertedExpenses,
      members
    );
    return [{ currency: baseCurrency, balances, transactions }];
  }

  // Group expenses by currency and run settlement per group
  const grouped = new Map<string, Expense[]>();
  for (const expense of expenses) {
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
