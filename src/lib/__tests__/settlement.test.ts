import { calculateSettlement, calculateRemainingTransactions, calculateMultiCurrencySettlement } from "../settlement";
import type { Expense, Member } from "@/types";

function makeMember(id: string, name: string): Member {
  return { memberId: id, name, joinedAt: "2026-01-01T00:00:00Z" };
}

function makeExpense(
  overrides: Partial<Expense> & Pick<Expense, "amount" | "paidBy" | "splitBetween">
): Expense {
  return {
    expenseId: "exp1",
    description: "Test expense",
    category: "Food",
    date: "2026-01-15",
    createdBy: overrides.paidBy,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
    ...overrides,
  };
}

const alice = makeMember("a", "Alice");
const bob = makeMember("b", "Bob");
const charlie = makeMember("c", "Charlie");
const allMembers = [alice, bob, charlie];

describe("calculateSettlement", () => {
  describe("no expenses", () => {
    it("should return zero balances and no transactions when there are no expenses", () => {
      const { balances, transactions } = calculateSettlement([], allMembers);

      expect(balances).toHaveLength(3);
      balances.forEach((b) => expect(b.net).toBe(0));
      expect(transactions).toHaveLength(0);
    });
  });

  describe("single expense split equally among all members", () => {
    it("should compute correct balances for a single expense split 3 ways", () => {
      const expenses = [
        makeExpense({
          amount: 30,
          paidBy: "a",
          splitBetween: ["a", "b", "c"],
        }),
      ];

      const { balances, transactions } = calculateSettlement(expenses, allMembers);

      const aliceBalance = balances.find((b) => b.memberId === "a");
      const bobBalance = balances.find((b) => b.memberId === "b");
      const charlieBalance = balances.find((b) => b.memberId === "c");

      expect(aliceBalance!.net).toBe(20);
      expect(bobBalance!.net).toBe(-10);
      expect(charlieBalance!.net).toBe(-10);
    });

    it("should produce transactions settling the debt", () => {
      const expenses = [
        makeExpense({
          amount: 30,
          paidBy: "a",
          splitBetween: ["a", "b", "c"],
        }),
      ];

      const { transactions } = calculateSettlement(expenses, allMembers);

      expect(transactions.length).toBeGreaterThan(0);
      expect(transactions.length).toBeLessThanOrEqual(2);

      const totalToAlice = transactions
        .filter((t) => t.to === "a")
        .reduce((sum, t) => sum + t.amount, 0);
      expect(totalToAlice).toBe(20);
    });
  });

  describe("multiple expenses by different payers", () => {
    it("should net out balances across multiple expenses", () => {
      const expenses = [
        makeExpense({
          expenseId: "e1",
          amount: 30,
          paidBy: "a",
          splitBetween: ["a", "b", "c"],
        }),
        makeExpense({
          expenseId: "e2",
          amount: 60,
          paidBy: "b",
          splitBetween: ["a", "b", "c"],
        }),
      ];

      const { balances } = calculateSettlement(expenses, allMembers);

      const aliceBalance = balances.find((b) => b.memberId === "a")!;
      const bobBalance = balances.find((b) => b.memberId === "b")!;
      const charlieBalance = balances.find((b) => b.memberId === "c")!;

      // Alice paid 30, owes 30 (10+20) => net 0
      expect(aliceBalance.net).toBe(0);
      // Bob paid 60, owes 30 (10+20) => net +30
      expect(bobBalance.net).toBe(30);
      // Charlie paid 0, owes 30 (10+20) => net -30
      expect(charlieBalance.net).toBe(-30);
    });
  });

  describe("one person pays everything", () => {
    it("should make the payer a creditor and everyone else a debtor", () => {
      const expenses = [
        makeExpense({
          expenseId: "e1",
          amount: 90,
          paidBy: "a",
          splitBetween: ["a", "b", "c"],
        }),
        makeExpense({
          expenseId: "e2",
          amount: 30,
          paidBy: "a",
          splitBetween: ["a", "b", "c"],
        }),
      ];

      const { balances } = calculateSettlement(expenses, allMembers);

      const aliceBalance = balances.find((b) => b.memberId === "a")!;
      const bobBalance = balances.find((b) => b.memberId === "b")!;
      const charlieBalance = balances.find((b) => b.memberId === "c")!;

      // Alice paid 120, owes 40 => net +80
      expect(aliceBalance.net).toBe(80);
      // Bob paid 0, owes 40 => net -40
      expect(bobBalance.net).toBe(-40);
      // Charlie paid 0, owes 40 => net -40
      expect(charlieBalance.net).toBe(-40);
    });
  });

  describe("expense split among subset of members", () => {
    it("should only debit members in the split", () => {
      const expenses = [
        makeExpense({
          amount: 50,
          paidBy: "a",
          splitBetween: ["a", "b"],
        }),
      ];

      const { balances } = calculateSettlement(expenses, allMembers);

      const aliceBalance = balances.find((b) => b.memberId === "a")!;
      const bobBalance = balances.find((b) => b.memberId === "b")!;
      const charlieBalance = balances.find((b) => b.memberId === "c")!;

      // Alice paid 50, owes 25 => net +25
      expect(aliceBalance.net).toBe(25);
      // Bob paid 0, owes 25 => net -25
      expect(bobBalance.net).toBe(-25);
      // Charlie not involved at all
      expect(charlieBalance.net).toBe(0);
    });
  });

  describe("invariant: total debits equal total credits", () => {
    it("should have balances that sum to zero", () => {
      const expenses = [
        makeExpense({
          expenseId: "e1",
          amount: 33.33,
          paidBy: "a",
          splitBetween: ["a", "b", "c"],
        }),
        makeExpense({
          expenseId: "e2",
          amount: 17.5,
          paidBy: "b",
          splitBetween: ["b", "c"],
        }),
        makeExpense({
          expenseId: "e3",
          amount: 100,
          paidBy: "c",
          splitBetween: ["a", "b", "c"],
        }),
      ];

      const { balances } = calculateSettlement(expenses, allMembers);
      const totalNet = balances.reduce((sum, b) => sum + b.net, 0);

      expect(Math.abs(totalNet)).toBeLessThan(0.02);
    });

    it("should have transaction amounts equal total owed", () => {
      const expenses = [
        makeExpense({
          expenseId: "e1",
          amount: 90,
          paidBy: "a",
          splitBetween: ["a", "b", "c"],
        }),
      ];

      const { balances, transactions } = calculateSettlement(expenses, allMembers);

      const totalTransferred = transactions.reduce((sum, t) => sum + t.amount, 0);
      const totalOwed = balances
        .filter((b) => b.net > 0)
        .reduce((sum, b) => sum + b.net, 0);

      expect(totalTransferred).toBeCloseTo(totalOwed, 2);
    });
  });

  describe("minimum transactions produced", () => {
    it("should produce at most N-1 transactions for N members", () => {
      const members = [
        makeMember("a", "Alice"),
        makeMember("b", "Bob"),
        makeMember("c", "Charlie"),
        makeMember("d", "Diana"),
      ];

      const expenses = [
        makeExpense({
          expenseId: "e1",
          amount: 100,
          paidBy: "a",
          splitBetween: ["a", "b", "c", "d"],
        }),
        makeExpense({
          expenseId: "e2",
          amount: 40,
          paidBy: "b",
          splitBetween: ["a", "b", "c", "d"],
        }),
      ];

      const { transactions } = calculateSettlement(expenses, members);

      // Greedy algorithm produces at most N-1 transactions
      expect(transactions.length).toBeLessThanOrEqual(members.length - 1);
    });

    it("should produce no transactions when all balances are zero after payments", () => {
      // Scenario: Lyn paid for flights, everyone paid Lyn back, then
      // Sri and Mei added new accommodation expenses
      const members = [
        makeMember("W", "Winnie"),
        makeMember("L", "Lyn"),
        makeMember("M", "Mei"),
        makeMember("K", "Kelvin"),
        makeMember("S", "Sri"),
      ];

      const expenses = [
        makeExpense({ expenseId: "e1", amount: 1130.25, paidBy: "L", splitBetween: ["W","L","M","K","S"] }),
        makeExpense({ expenseId: "e2", amount: 478.98, paidBy: "S", splitBetween: ["W","L","M","K","S"] }),
        makeExpense({ expenseId: "e3", amount: 183, paidBy: "M", splitBetween: ["W","L","M","K","S"] }),
      ];

      const { balances } = calculateSettlement(expenses, members);

      // Everyone already paid Lyn their flight share (S$226.05 each)
      const payments = [
        { from: "W", to: "L", amount: 226.05 },
        { from: "K", to: "L", amount: 226.05 },
        { from: "M", to: "L", amount: 226.05 },
        { from: "S", to: "L", amount: 226.05 },
      ];

      const remaining = calculateRemainingTransactions(balances, payments, members);

      // After payments, Lyn should NOT appear as a creditor (she's been paid)
      const lynsDebts = remaining.filter((t) => t.to === "L");
      expect(lynsDebts).toHaveLength(0);

      // Winnie and Kelvin should owe Sri or Mei (not Lyn)
      const winniesDebts = remaining.filter((t) => t.from === "W");
      const kelvinsDebts = remaining.filter((t) => t.from === "K");
      expect(winniesDebts.length).toBeGreaterThan(0);
      expect(kelvinsDebts.length).toBeGreaterThan(0);

      // Total remaining should balance out
      const totalOut = remaining.reduce((sum, t) => sum + t.amount, 0);
      expect(totalOut).toBeGreaterThan(0);
    });

    it("should produce no transactions when all balances are zero", () => {
      const members = [makeMember("a", "Alice"), makeMember("b", "Bob")];
      const expenses = [
        makeExpense({
          expenseId: "e1",
          amount: 50,
          paidBy: "a",
          splitBetween: ["a", "b"],
        }),
        makeExpense({
          expenseId: "e2",
          amount: 50,
          paidBy: "b",
          splitBetween: ["a", "b"],
        }),
      ];

      const { transactions } = calculateSettlement(expenses, members);
      expect(transactions).toHaveLength(0);
    });
  });
});

describe("calculateMultiCurrencySettlement", () => {
  const members = [alice, bob, charlie];

  describe("single currency (all base)", () => {
    it("returns one group using base currency", () => {
      const expenses = [
        makeExpense({ expenseId: "e1", amount: 30, paidBy: "a", splitBetween: ["a", "b", "c"] }),
      ];
      const groups = calculateMultiCurrencySettlement(expenses, members, "SGD");
      expect(groups).toHaveLength(1);
      expect(groups[0].currency).toBe("SGD");
    });

    it("expenses without a currency field default to base currency group", () => {
      // expense has no currency field — should be treated as SGD
      const expenses = [
        makeExpense({ expenseId: "e1", amount: 60, paidBy: "a", splitBetween: ["a", "b", "c"] }),
      ];
      const groups = calculateMultiCurrencySettlement(expenses, members, "SGD");
      expect(groups).toHaveLength(1);
      expect(groups[0].currency).toBe("SGD");
      const aliceBalance = groups[0].balances.find((b) => b.memberId === "a")!;
      expect(aliceBalance.net).toBe(40); // paid 60, owes 20
    });
  });

  describe("multiple currencies, no exchange rates", () => {
    it("produces separate groups per currency", () => {
      const expenses = [
        makeExpense({ expenseId: "e1", amount: 30, currency: "SGD", paidBy: "a", splitBetween: ["a", "b", "c"] }),
        makeExpense({ expenseId: "e2", amount: 90, currency: "MYR", paidBy: "b", splitBetween: ["a", "b", "c"] }),
      ];
      const groups = calculateMultiCurrencySettlement(expenses, members, "SGD");
      expect(groups).toHaveLength(2);
      const currencies = groups.map((g) => g.currency).sort();
      expect(currencies).toEqual(["MYR", "SGD"]);
    });

    it("SGD group balances are correct and unaffected by MYR expenses", () => {
      const expenses = [
        makeExpense({ expenseId: "e1", amount: 30, currency: "SGD", paidBy: "a", splitBetween: ["a", "b", "c"] }),
        makeExpense({ expenseId: "e2", amount: 90, currency: "MYR", paidBy: "b", splitBetween: ["a", "b", "c"] }),
      ];
      const groups = calculateMultiCurrencySettlement(expenses, members, "SGD");
      const sgdGroup = groups.find((g) => g.currency === "SGD")!;
      const aliceSGD = sgdGroup.balances.find((b) => b.memberId === "a")!;
      expect(aliceSGD.net).toBe(20); // paid 30 SGD, owes 10 → net +20
      const bobSGD = sgdGroup.balances.find((b) => b.memberId === "b")!;
      expect(bobSGD.net).toBe(-10); // paid 0 SGD, owes 10 → net -10
    });

    it("MYR group balances are correct and unaffected by SGD expenses", () => {
      const expenses = [
        makeExpense({ expenseId: "e1", amount: 30, currency: "SGD", paidBy: "a", splitBetween: ["a", "b", "c"] }),
        makeExpense({ expenseId: "e2", amount: 90, currency: "MYR", paidBy: "b", splitBetween: ["a", "b", "c"] }),
      ];
      const groups = calculateMultiCurrencySettlement(expenses, members, "SGD");
      const myrGroup = groups.find((g) => g.currency === "MYR")!;
      const bobMYR = myrGroup.balances.find((b) => b.memberId === "b")!;
      expect(bobMYR.net).toBe(60); // paid 90 MYR, owes 30 → net +60
      const aliceMYR = myrGroup.balances.find((b) => b.memberId === "a")!;
      expect(aliceMYR.net).toBe(-30); // paid 0 MYR, owes 30 → net -30
    });

    it("balances within each currency group sum to zero", () => {
      const expenses = [
        makeExpense({ expenseId: "e1", amount: 22.10, currency: "SGD", paidBy: "a", splitBetween: ["a", "b", "c"] }),
        makeExpense({ expenseId: "e2", amount: 70.60, currency: "MYR", paidBy: "b", splitBetween: ["a", "b", "c"] }),
        makeExpense({ expenseId: "e3", amount: 15.80, currency: "MYR", paidBy: "c", splitBetween: ["a", "b", "c"] }),
      ];
      const groups = calculateMultiCurrencySettlement(expenses, members, "SGD");
      for (const group of groups) {
        const totalNet = group.balances.reduce((sum, b) => sum + b.net, 0);
        expect(Math.abs(totalNet)).toBeLessThan(0.02);
      }
    });

    it("personal expenses are excluded from all currency groups", () => {
      const expenses = [
        makeExpense({ expenseId: "e1", amount: 30, currency: "SGD", paidBy: "a", splitBetween: ["a", "b", "c"] }),
        makeExpense({ expenseId: "e2", amount: 100, currency: "MYR", expenseType: "personal", paidBy: "b", splitBetween: ["b"] }),
      ];
      const groups = calculateMultiCurrencySettlement(expenses, members, "SGD");
      // Only SGD group — personal MYR expense should be ignored entirely
      expect(groups).toHaveLength(1);
      expect(groups[0].currency).toBe("SGD");
    });
  });

  describe("multiple currencies with exchange rates", () => {
    it("converts all expenses to base currency and returns a single group", () => {
      const expenses = [
        makeExpense({ expenseId: "e1", amount: 10, currency: "SGD", paidBy: "a", splitBetween: ["a", "b", "c"] }),
        makeExpense({ expenseId: "e2", amount: 30, currency: "MYR", paidBy: "b", splitBetween: ["a", "b", "c"] }),
      ];
      // 1 MYR = 0.30 SGD
      const groups = calculateMultiCurrencySettlement(expenses, members, "SGD", { MYR: 0.30 });
      expect(groups).toHaveLength(1);
      expect(groups[0].currency).toBe("SGD");
    });

    it("converted MYR amounts are used in SGD balance calculation", () => {
      const expenses = [
        makeExpense({ expenseId: "e1", amount: 10, currency: "SGD", paidBy: "a", splitBetween: ["a", "b", "c"] }),
        // 30 MYR * 0.30 = 9 SGD
        makeExpense({ expenseId: "e2", amount: 30, currency: "MYR", paidBy: "b", splitBetween: ["a", "b", "c"] }),
      ];
      const groups = calculateMultiCurrencySettlement(expenses, members, "SGD", { MYR: 0.30 });
      const sgdGroup = groups[0];
      // Total SGD = 10 + 9 = 19. sharePerPerson = floor(1900/3)/100 = 6.33, remainder = 0.01 → payer Alice absorbs it
      // Alice: paid 10, owes 6.33, absorbs 0.01 remainder → net 10 - 6.33 - 0.01 = 3.66
      const aliceBalance = sgdGroup.balances.find((b) => b.memberId === "a")!;
      expect(aliceBalance.net).toBe(3.66);
      // Bob: paid 9 SGD (converted), owes 6.33 → net 9 - 6.33 = 2.67
      const bobBalance = sgdGroup.balances.find((b) => b.memberId === "b")!;
      expect(bobBalance.net).toBe(2.67);
      // Charlie: paid 0, owes 6.33 → net -6.33
      const charlieBalance = sgdGroup.balances.find((b) => b.memberId === "c")!;
      expect(charlieBalance.net).toBe(-6.33);
    });

    it("falls back to separate groups when exchange rate is missing for a currency", () => {
      const expenses = [
        makeExpense({ expenseId: "e1", amount: 10, currency: "SGD", paidBy: "a", splitBetween: ["a", "b", "c"] }),
        makeExpense({ expenseId: "e2", amount: 30, currency: "MYR", paidBy: "b", splitBetween: ["a", "b", "c"] }),
      ];
      // MYR rate not provided
      const groups = calculateMultiCurrencySettlement(expenses, members, "SGD", {});
      expect(groups).toHaveLength(2);
    });
  });
});
