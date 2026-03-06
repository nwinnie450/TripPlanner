import {
  createTripSchema,
  addMemberSchema,
  addExpenseSchema,
  addItineraryItemSchema,
  updateTripSchema,
} from "../validation";

describe("createTripSchema", () => {
  const validTrip = {
    tripName: "Beach Vacation",
    startDate: "2026-03-01",
    endDate: "2026-03-07",
    currency: "USD",
  };

  it("should accept valid trip data", () => {
    const result = createTripSchema.safeParse(validTrip);
    expect(result.success).toBe(true);
  });

  it("should reject missing tripName", () => {
    const { tripName, ...rest } = validTrip;
    const result = createTripSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject empty tripName", () => {
    const result = createTripSchema.safeParse({ ...validTrip, tripName: "" });
    expect(result.success).toBe(false);
  });

  it("should reject tripName exceeding max length", () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      tripName: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid date format for startDate", () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      startDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid date format for endDate", () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      endDate: "01/07/2026",
    });
    expect(result.success).toBe(false);
  });

  it("should reject currency codes that are not 3 characters", () => {
    expect(
      createTripSchema.safeParse({ ...validTrip, currency: "US" }).success
    ).toBe(false);
    expect(
      createTripSchema.safeParse({ ...validTrip, currency: "USDX" }).success
    ).toBe(false);
  });
});

describe("addMemberSchema", () => {
  it("should accept a valid member name", () => {
    expect(addMemberSchema.safeParse({ name: "Alice" }).success).toBe(true);
  });

  it("should reject an empty name", () => {
    expect(addMemberSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("should reject a name exceeding 50 characters", () => {
    expect(addMemberSchema.safeParse({ name: "x".repeat(51) }).success).toBe(
      false
    );
  });

  it("should reject missing name field", () => {
    expect(addMemberSchema.safeParse({}).success).toBe(false);
  });
});

describe("addExpenseSchema", () => {
  const validExpense = {
    amount: 25.5,
    description: "Lunch",
    category: "Food",
    paidBy: "member1",
    splitBetween: ["member1", "member2"],
    date: "2026-03-01",
    createdBy: "member1",
  };

  it("should accept valid expense data", () => {
    expect(addExpenseSchema.safeParse(validExpense).success).toBe(true);
  });

  it("should reject zero amount", () => {
    expect(
      addExpenseSchema.safeParse({ ...validExpense, amount: 0 }).success
    ).toBe(false);
  });

  it("should reject negative amount", () => {
    expect(
      addExpenseSchema.safeParse({ ...validExpense, amount: -10 }).success
    ).toBe(false);
  });

  it("should reject non-number amount", () => {
    expect(
      addExpenseSchema.safeParse({ ...validExpense, amount: "twenty" }).success
    ).toBe(false);
  });

  it("should reject empty description", () => {
    expect(
      addExpenseSchema.safeParse({ ...validExpense, description: "" }).success
    ).toBe(false);
  });

  it("should reject invalid category", () => {
    expect(
      addExpenseSchema.safeParse({ ...validExpense, category: "Invalid" })
        .success
    ).toBe(false);
  });

  it("should accept all valid categories", () => {
    const categories = [
      "Food",
      "Transport",
      "Accommodation",
      "Activities",
      "Shopping",
      "Other",
    ];
    for (const category of categories) {
      expect(
        addExpenseSchema.safeParse({ ...validExpense, category }).success
      ).toBe(true);
    }
  });

  it("should reject empty splitBetween array", () => {
    expect(
      addExpenseSchema.safeParse({ ...validExpense, splitBetween: [] }).success
    ).toBe(false);
  });

  it("should reject invalid date format", () => {
    expect(
      addExpenseSchema.safeParse({ ...validExpense, date: "March 1" }).success
    ).toBe(false);
  });
});

describe("addItineraryItemSchema", () => {
  const validItem = {
    dayDate: "2026-03-01",
    time: "14:30",
    title: "Visit Museum",
    location: "Downtown",
    notes: "Buy tickets online",
    createdBy: "member1",
  };

  it("should accept valid itinerary data", () => {
    expect(addItineraryItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("should accept empty string for time", () => {
    expect(
      addItineraryItemSchema.safeParse({ ...validItem, time: "" }).success
    ).toBe(true);
  });

  it("should accept missing time (optional)", () => {
    const { time, ...rest } = validItem;
    expect(addItineraryItemSchema.safeParse(rest).success).toBe(true);
  });

  it("should reject invalid time format", () => {
    expect(
      addItineraryItemSchema.safeParse({ ...validItem, time: "2:30 PM" })
        .success
    ).toBe(false);
  });

  it("should reject time with hours > 23", () => {
    expect(
      addItineraryItemSchema.safeParse({ ...validItem, time: "25:00" }).success
    ).toBe(false);
  });

  it("should reject empty title", () => {
    expect(
      addItineraryItemSchema.safeParse({ ...validItem, title: "" }).success
    ).toBe(false);
  });
});

describe("updateTripSchema", () => {
  it("should accept zero budget", () => {
    expect(updateTripSchema.safeParse({ budget: 0 }).success).toBe(true);
  });

  it("should accept positive budget", () => {
    expect(updateTripSchema.safeParse({ budget: 1000 }).success).toBe(true);
  });

  it("should reject negative budget", () => {
    expect(updateTripSchema.safeParse({ budget: -1 }).success).toBe(false);
  });

  it("should reject non-number budget", () => {
    expect(updateTripSchema.safeParse({ budget: "lots" }).success).toBe(
      false
    );
  });
});
