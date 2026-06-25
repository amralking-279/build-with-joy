// Lightweight in-memory per-IP rate limiter for anti-abuse on AI endpoints.
// Runs in the Cloudflare Worker SSR isolate. Per-isolate state isn't perfect
// across regions, but it adds meaningful friction against scripted abuse and
// caps cost exposure of the shared LOVABLE_API_KEY when the app has no user
// auth surface.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    (headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

/**
 * Allow `limit` calls per `windowMs` per (scope, ip) pair.
 */
export function rateLimit(
  scope: string,
  ip: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  prune(now);
  const key = `${scope}:${ip}`;
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}