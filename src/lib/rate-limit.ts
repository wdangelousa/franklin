/**
 * Rate limiter with pluggable backend.
 *
 * Uses Redis/Upstash when FRANKLIN_UPSTASH_REDIS_URL is set.
 * Falls back to in-memory for development / single-instance.
 *
 * Failure policy: If the Redis backend is temporarily unavailable,
 * requests are ALLOWED (fail-open) to avoid blocking legitimate traffic.
 * This is logged as a warning. For fail-closed behavior, change the
 * catch block in checkRateLimit.
 */

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  increment(key: string, windowMs: number): Promise<RateLimitEntry>;
}

// ---------------------------------------------------------------------------
// In-memory store (development / single-instance fallback)
// ---------------------------------------------------------------------------

class InMemoryStore implements RateLimitStore {
  private map = new Map<string, RateLimitEntry>();
  private lastCleanup = Date.now();

  async get(key: string): Promise<RateLimitEntry | null> {
    this.maybeCleanup();
    return this.map.get(key) ?? null;
  }

  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    this.maybeCleanup();
    const now = Date.now();
    const existing = this.map.get(key);

    if (!existing || existing.resetAt <= now) {
      const entry = { count: 1, resetAt: now + windowMs };
      this.map.set(key, entry);
      return entry;
    }

    existing.count += 1;
    return existing;
  }

  private maybeCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup < 60_000) return;
    this.lastCleanup = now;
    for (const [key, entry] of this.map) {
      if (entry.resetAt <= now) this.map.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Redis/Upstash store
// ---------------------------------------------------------------------------

class RedisStore implements RateLimitStore {
  private readonly url: string;
  private readonly token: string;

  constructor(url: string, token: string) {
    this.url = url.replace(/\/$/, "");
    this.token = token;
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const raw = await this.command<string | null>("GET", [key]);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RateLimitEntry;
    } catch {
      return null;
    }
  }

  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const now = Date.now();
    const existing = await this.get(key);

    if (!existing || existing.resetAt <= now) {
      const entry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
      const ttlSeconds = Math.ceil(windowMs / 1000);
      await this.command("SET", [key, JSON.stringify(entry), "EX", String(ttlSeconds)]);
      return entry;
    }

    existing.count += 1;
    const remainingMs = existing.resetAt - now;
    const ttlSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
    await this.command("SET", [key, JSON.stringify(existing), "EX", String(ttlSeconds)]);
    return existing;
  }

  private async command<T = unknown>(cmd: string, args: string[]): Promise<T> {
    const response = await fetch(`${this.url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([cmd, ...args])
    });

    if (!response.ok) {
      throw new Error(`Redis command failed: ${response.status}`);
    }

    const data = (await response.json()) as { result: T };
    return data.result;
  }
}

// ---------------------------------------------------------------------------
// Store resolution
// ---------------------------------------------------------------------------

let resolvedStore: RateLimitStore | null = null;

function getStore(): RateLimitStore {
  if (resolvedStore) return resolvedStore;

  const redisUrl = process.env.FRANKLIN_UPSTASH_REDIS_URL?.trim();
  const redisToken = process.env.FRANKLIN_UPSTASH_REDIS_TOKEN?.trim();

  if (redisUrl && redisToken) {
    resolvedStore = new RedisStore(redisUrl, redisToken);
  } else {
    resolvedStore = new InMemoryStore();
  }

  return resolvedStore;
}

/** Reset store — useful for testing. */
export function resetRateLimitStore(store?: RateLimitStore): void {
  resolvedStore = store ?? null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and consume a rate limit token.
 *
 * Fail-open policy: if the backend is unavailable, the request is allowed.
 */
export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  try {
    const store = getStore();
    const entry = await store.increment(key, config.windowMs);

    const allowed = entry.count <= config.maxRequests;
    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetAt: entry.resetAt
    };
  } catch {
    // Fail-open: allow the request if the backend is unavailable
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: Date.now() + config.windowMs
    };
  }
}

// ---------------------------------------------------------------------------
// Preset configurations
// ---------------------------------------------------------------------------

export const RATE_LIMIT_PUBLIC_READ: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000
};

export const RATE_LIMIT_PUBLIC_ACTION: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000
};

export const RATE_LIMIT_CHECKLIST: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60_000
};
