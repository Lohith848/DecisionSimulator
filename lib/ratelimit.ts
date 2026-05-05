type WindowBucket = {
  resetAt: number;
  count: number;
};

declare global {
  var __ds_rateLimit: Map<string, WindowBucket> | undefined;
}

function getStore() {
  if (!globalThis.__ds_rateLimit) {
    globalThis.__ds_rateLimit = new Map<string, WindowBucket>();
  }
  return globalThis.__ds_rateLimit;
}

export function getClientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const ip = xf.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function checkRateLimit(args: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true; remaining: number; resetAt: number } | { ok: false; retryAfterSec: number; resetAt: number } {
  const store = getStore();
  const now = Date.now();
  const cur = store.get(args.key);

  if (!cur || now >= cur.resetAt) {
    const resetAt = now + args.windowMs;
    store.set(args.key, { resetAt, count: 1 });
    return { ok: true, remaining: Math.max(0, args.limit - 1), resetAt };
  }

  if (cur.count >= args.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((cur.resetAt - now) / 1000));
    return { ok: false, retryAfterSec, resetAt: cur.resetAt };
  }

  cur.count += 1;
  store.set(args.key, cur);
  return { ok: true, remaining: Math.max(0, args.limit - cur.count), resetAt: cur.resetAt };
}

