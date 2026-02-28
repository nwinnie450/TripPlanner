import { checkRateLimit } from "../rate-limit";

describe("checkRateLimit", () => {
  // Use unique namespaces per test to avoid cross-test contamination
  let testNs: string;
  let counter = 0;

  beforeEach(() => {
    counter++;
    testNs = `test-ns-${counter}-${Date.now()}`;
  });

  it("should allow the first request", () => {
    const result = checkRateLimit(testNs, "user1", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should decrement remaining on successive requests", () => {
    checkRateLimit(testNs, "user1", 5, 60_000);
    const result = checkRateLimit(testNs, "user1", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);
  });

  it("should allow requests up to the limit", () => {
    for (let i = 0; i < 4; i++) {
      checkRateLimit(testNs, "user1", 5, 60_000);
    }
    const result = checkRateLimit(testNs, "user1", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("should block requests that exceed the limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(testNs, "user1", 5, 60_000);
    }
    const result = checkRateLimit(testNs, "user1", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should track different keys independently", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(testNs, "user1", 5, 60_000);
    }
    // user1 is blocked
    expect(checkRateLimit(testNs, "user1", 5, 60_000).allowed).toBe(false);
    // user2 is not
    expect(checkRateLimit(testNs, "user2", 5, 60_000).allowed).toBe(true);
  });

  it("should reset after the window expires", () => {
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    for (let i = 0; i < 5; i++) {
      checkRateLimit(testNs, "user1", 5, 1000);
    }
    expect(checkRateLimit(testNs, "user1", 5, 1000).allowed).toBe(false);

    // Advance time past the window
    (Date.now as jest.Mock).mockReturnValue(now + 1001);

    const result = checkRateLimit(testNs, "user1", 5, 1000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);

    jest.restoreAllMocks();
  });

  it("should return a resetAt timestamp in the future", () => {
    const before = Date.now();
    const result = checkRateLimit(testNs, "user1", 5, 60_000);
    expect(result.resetAt).toBeGreaterThan(before);
  });
});
