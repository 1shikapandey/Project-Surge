/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AQUAALERT — CHATBOT SLIDING-WINDOW RATE LIMITER
 * ═══════════════════════════════════════════════════════════════════════════
 * Enforces a strict 5 messages per rolling 2-minute (120 seconds) limit
 * per session / client IP.
 *
 * FAQ-matched responses bypass this limiter.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  limit: number;
}

const WINDOW_MS = 2 * 60 * 1000; // 2 minutes (120,000 ms)
const MAX_REQUESTS = 5;

// In-memory store: sessionKey -> Array of timestamps (ms)
const requestStore = new Map<string, number[]>();

/**
 * Checks and records rate limit for given session identifier.
 */
export function checkRateLimit(sessionKey: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Retrieve existing timestamps and purge expired ones
  const timestamps = (requestStore.get(sessionKey) || []).filter(ts => ts > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
    
    // Log rate limit hit
    console.warn(`[Chatbot RateLimiter] Session '${sessionKey}' hit limit (${timestamps.length}/${MAX_REQUESTS}). Reset in ${resetInSeconds}s.`);
    
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
      limit: MAX_REQUESTS,
    };
  }

  // Calculate remaining capacity before recording
  const remaining = MAX_REQUESTS - (timestamps.length + 1);

  return {
    allowed: true,
    remaining,
    resetInSeconds: 0,
    limit: MAX_REQUESTS,
  };
}

/**
 * Consumes 1 quota slot for sessionKey. Call only when request actually proceeds to LLM.
 */
export function consumeRateLimitQuota(sessionKey: string): void {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (requestStore.get(sessionKey) || []).filter(ts => ts > windowStart);
  timestamps.push(now);
  requestStore.set(sessionKey, timestamps);
}

/**
 * Inspects remaining quota without consuming a slot (for client UI initial status check).
 */
export function inspectRateLimit(sessionKey: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (requestStore.get(sessionKey) || []).filter(ts => ts > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
      limit: MAX_REQUESTS,
    };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - timestamps.length,
    resetInSeconds: 0,
    limit: MAX_REQUESTS,
  };
}
