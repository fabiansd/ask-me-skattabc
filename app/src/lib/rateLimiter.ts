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
    const keysToDelete: string[] = [];
    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.store.delete(key));
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

  async checkBothLimits(
    request: NextRequest,
    ipConfig: { windowMs: number; maxRequests: number },
    globalConfig?: { windowMs: number; maxRequests: number }
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    globalRemaining?: number;
    globalResetTime?: number;
    blockedBy?: 'ip' | 'global';
  }> {
    // Check global first if provided
    if (globalConfig) {
      const globalKey = 'GLOBAL_TOTAL';
      const now = Date.now();
      const globalResetTime = now + globalConfig.windowMs;
      const globalEntry = this.store.get(globalKey);

      if (!globalEntry || now > globalEntry.resetTime) {
        this.store.set(globalKey, { count: 1, resetTime: globalResetTime });
      } else if (globalEntry.count >= globalConfig.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: 0,
          globalRemaining: 0,
          globalResetTime: globalEntry.resetTime,
          blockedBy: 'global'
        };
      } else {
        globalEntry.count++;
      }
    }

    // Check IP limit
    const ipResult = await this.checkRateLimit(request, ipConfig);

    if (globalConfig) {
      const globalEntry = this.store.get('GLOBAL_TOTAL');
      return {
        ...ipResult,
        globalRemaining: globalEntry ? globalConfig.maxRequests - globalEntry.count : globalConfig.maxRequests,
        globalResetTime: globalEntry?.resetTime,
        blockedBy: ipResult.allowed ? undefined : 'ip'
      };
    }

    return ipResult;
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
  },
  GLOBAL_CIRCUIT_BREAKER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 200 // 200 AI queries per hour across all IPs (max $12/hour protection)
  }
} as const;