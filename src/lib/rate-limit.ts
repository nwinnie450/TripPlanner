interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(namespace: string): Map<string, RateLimitEntry> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

export function checkRateLimit(
  namespace: string,
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const store = getStore(namespace);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

export function rateLimitPasscode(ip: string) {
  return checkRateLimit("passcode", ip, 5, 60_000);
}

export function rateLimitGeneral(ip: string) {
  return checkRateLimit("general", ip, 60, 60_000);
}
