import {
  parseCsv,
  parseImportCsv,
  resolveImportRow,
  buildDedupKey,
  buildExistingDedupKeys,
} from "../expenseImport";
import type { Member, Expense } from "@/types";

const members: Member[] = [
  { memberId: "m1", name: "Yvonne", joinedAt: "2026-01-01" },
  { memberId: "m2", name: "Ching", joinedAt: "2026-01-01" },
];

describe("parseCsv", () => {
  it("parses simple rows", () => {
    const rows = parseCsv("a,b,c\n1,2,3");
    expect(rows).toEqual([["a", "b", "c"], ["1", "2", "3"]]);
  });

  it("handles quoted fields with commas and escaped quotes", () => {
    const rows = parseCsv('"hello, world","she said ""hi"""\n1,2');
    expect(rows[0]).toEqual(["hello, world", 'she said "hi"']);
  });

  it("ignores blank trailing lines", () => {
    const rows = parseCsv("a,b\n1,2\n\n");
    expect(rows).toEqual([["a", "b"], ["1", "2"]]);
  });
});

describe("parseImportCsv", () => {
  it("parses a well-formed CSV with all recognized columns", () => {
    const csv =
      "Date,Description,Category,Amount (MYR),Paid By,Split Between\n" +
      "2026-07-09,Dinner,Food,50.5,Yvonne,Yvonne; Ching";
    const { rows, headerErrors } = parseImportCsv(csv);
    expect(headerErrors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      date: "2026-07-09",
      description: "Dinner",
      category: "Food",
      amount: "50.5",
      paidByName: "Yvonne",
      splitBetweenNames: ["Yvonne", "Ching"],
    });
  });

  it("reports missing required columns", () => {
    const { headerErrors } = parseImportCsv("Date,Description\n2026-07-09,Dinner");
    expect(headerErrors.length).toBeGreaterThan(0);
  });
});

describe("resolveImportRow", () => {
  it("resolves member names to IDs", () => {
    const resolved = resolveImportRow(
      {
        rowNumber: 2,
        date: "2026-07-09",
        description: "Dinner",
        category: "Food",
        amount: "50.5",
        paidByName: "yvonne",
        splitBetweenNames: ["Yvonne", "Ching"],
      },
      members,
    );
    expect(resolved.errors).toEqual([]);
    expect(resolved.paidBy).toBe("m1");
    expect(resolved.splitBetween).toEqual(["m1", "m2"]);
  });

  it("flags unknown members and invalid amount/category", () => {
    const resolved = resolveImportRow(
      {
        rowNumber: 2,
        date: "2026-07-09",
        description: "Dinner",
        category: "NotACategory",
        amount: "abc",
        paidByName: "Nobody",
        splitBetweenNames: ["Nobody"],
      },
      members,
    );
    expect(resolved.errors.some((e) => e.includes("Unknown category"))).toBe(true);
    expect(resolved.errors.some((e) => e.includes("Invalid amount"))).toBe(true);
    expect(resolved.errors.some((e) => e.includes("Paid By"))).toBe(true);
  });
});

describe("dedup", () => {
  it("builds matching keys for same date/description/amount regardless of case/whitespace", () => {
    const keyA = buildDedupKey({ date: "2026-07-09", description: "  Dinner  ", amount: 50.5 });
    const keyB = buildDedupKey({ date: "2026-07-09", description: "dinner", amount: 50.5 });
    expect(keyA).toBe(keyB);
  });

  it("detects an existing expense as a duplicate", () => {
    const existing: Expense[] = [
      {
        expenseId: "e1",
        amount: 50.5,
        description: "Dinner",
        category: "Food",
        paidBy: "m1",
        splitBetween: ["m1", "m2"],
        date: "2026-07-09",
        createdBy: "m1",
        createdAt: "2026-07-09T00:00:00.000Z",
        updatedAt: "2026-07-09T00:00:00.000Z",
      },
    ];
    const keys = buildExistingDedupKeys(existing);
    expect(keys.has(buildDedupKey({ date: "2026-07-09", description: "Dinner", amount: 50.5 }))).toBe(true);
    expect(keys.has(buildDedupKey({ date: "2026-07-09", description: "Lunch", amount: 50.5 }))).toBe(false);
  });
});
