import {
  formatCurrency,
  formatDate,
  formatDateLong,
  getDaysBetween,
  generateDateRange,
  generateId,
} from "../utils";

describe("formatCurrency", () => {
  it("should format USD amounts with dollar sign", () => {
    expect(formatCurrency(100, "USD")).toBe("$100.00");
  });

  it("should format zero", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });

  it("should format negative amounts", () => {
    const result = formatCurrency(-25.5, "USD");
    expect(result).toContain("25.50");
  });

  it("should format EUR amounts with euro sign", () => {
    const result = formatCurrency(50, "EUR");
    expect(result).toContain("50.00");
  });

  it("should format JPY amounts", () => {
    const result = formatCurrency(1000, "JPY");
    expect(result).toContain("1,000");
  });

  it("should round to 2 decimal places", () => {
    expect(formatCurrency(10.999, "USD")).toBe("$11.00");
  });

  it("should handle large amounts with commas", () => {
    expect(formatCurrency(1234567.89, "USD")).toBe("$1,234,567.89");
  });
});

describe("formatDate", () => {
  it("should format a date as short weekday, short month, and day", () => {
    const result = formatDate("2026-01-15");
    // Thu, Jan 15
    expect(result).toMatch(/Thu/);
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/15/);
  });

  it("should handle different months", () => {
    const result = formatDate("2026-07-04");
    expect(result).toMatch(/Jul/);
    expect(result).toMatch(/4/);
  });
});

describe("formatDateLong", () => {
  it("should include the year", () => {
    const result = formatDateLong("2026-01-15");
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/15/);
  });
});

describe("getDaysBetween", () => {
  it("should return 1 for same start and end date", () => {
    expect(getDaysBetween("2026-01-15", "2026-01-15")).toBe(1);
  });

  it("should return 2 for consecutive days", () => {
    expect(getDaysBetween("2026-01-15", "2026-01-16")).toBe(2);
  });

  it("should return 7 for a week-long trip", () => {
    expect(getDaysBetween("2026-01-01", "2026-01-07")).toBe(7);
  });

  it("should handle month boundaries", () => {
    expect(getDaysBetween("2026-01-30", "2026-02-02")).toBe(4);
  });
});

describe("generateDateRange", () => {
  it("should return a single date when start equals end", () => {
    const range = generateDateRange("2026-01-15", "2026-01-15");
    expect(range).toEqual(["2026-01-15"]);
  });

  it("should return all dates inclusive of start and end", () => {
    const range = generateDateRange("2026-01-01", "2026-01-03");
    expect(range).toEqual(["2026-01-01", "2026-01-02", "2026-01-03"]);
  });

  it("should handle month boundaries", () => {
    const range = generateDateRange("2026-01-30", "2026-02-01");
    expect(range).toEqual(["2026-01-30", "2026-01-31", "2026-02-01"]);
  });

  it("should return an empty array when end is before start", () => {
    const range = generateDateRange("2026-01-15", "2026-01-10");
    expect(range).toEqual([]);
  });
});

describe("generateId", () => {
  it("should return a string of length 8", () => {
    expect(generateId()).toHaveLength(8);
  });

  it("should only contain lowercase letters and digits", () => {
    for (let i = 0; i < 20; i++) {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]{8}$/);
    }
  });

  it("should generate unique ids on successive calls", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 20; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBeGreaterThan(1);
  });
});
