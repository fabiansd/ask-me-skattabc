import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  private getClientId(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    return ip;
  }

  async checkRateLimit(
    request: NextRequest,
    options: { windowMs: number; maxRequests: number }
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const clientId = this.getClientId(request);
    const now = Date.now();
    const windowStart = now;
    const resetTime = windowStart + options.windowMs;

    const entry = this.store.get(clientId);

    if (!entry || now > entry.resetTime) {
      this.store.set(clientId, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: options.maxRequests - 1,
        resetTime
      };
    }

    if (entry.count >= options.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: options.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

export const rateLimiter = new InMemoryRateLimiter();

export const RATE_LIMIT_CONFIG = {
  QUERY_API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50 // 50 requests per 15 minutes for AI queries
  },
  GENERAL_API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // 100 requests per 15 minutes for other APIs
  }
} as const;