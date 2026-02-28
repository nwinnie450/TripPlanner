import { calculateSettlement } from "../settlement";
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
