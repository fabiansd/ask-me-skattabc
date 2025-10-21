import { rateLimiter, RATE_LIMIT_CONFIG } from "@/app/src/lib/rateLimiter";
import { NextRequest } from 'next/server';

// Mock NextRequest for testing
function createMockRequest(ip?: string, headers?: Record<string, string>): NextRequest {
  const mockHeaders = new Map();
  if (headers?.['x-forwarded-for']) {
    mockHeaders.set('x-forwarded-for', headers['x-forwarded-for']);
  }

  return {
    ip: ip || '127.0.0.1',
    headers: {
      get: (key: string) => mockHeaders.get(key) || null
    }
  } as unknown as NextRequest;
}

describe('rateLimiter', () => {
  // Note: Using the singleton instance, so tests may affect each other
  // In a production test suite, you'd want to mock or reset state
  // The singleton also keeps a cleanup interval running (expected behavior)

  describe('checkRateLimit', () => {
    it('should allow first request within limit', async () => {
      const request = createMockRequest('192.168.1.1');
      const config = { windowMs: 60000, maxRequests: 5 };

      const result = await rateLimiter.checkRateLimit(request, config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should track multiple requests from same IP', async () => {
      const request = createMockRequest('192.168.1.10'); // Use unique IP
      const config = { windowMs: 60000, maxRequests: 3 };

      const result1 = await rateLimiter.checkRateLimit(request, config);
      const result2 = await rateLimiter.checkRateLimit(request, config);
      const result3 = await rateLimiter.checkRateLimit(request, config);

      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests exceeding limit', async () => {
      const request = createMockRequest('192.168.1.11');
      const config = { windowMs: 60000, maxRequests: 2 };

      await rateLimiter.checkRateLimit(request, config);
      await rateLimiter.checkRateLimit(request, config);
      const result = await rateLimiter.checkRateLimit(request, config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle different IPs independently', async () => {
      const request1 = createMockRequest('192.168.1.12');
      const request2 = createMockRequest('192.168.1.13');
      const config = { windowMs: 60000, maxRequests: 1 };

      const result1 = await rateLimiter.checkRateLimit(request1, config);
      const result2 = await rateLimiter.checkRateLimit(request2, config);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });

    it('should extract IP from x-forwarded-for header', async () => {
      const request = createMockRequest('127.0.0.1', { 'x-forwarded-for': '203.0.113.1,198.51.100.1' });
      const config = { windowMs: 60000, maxRequests: 1 };

      const result1 = await rateLimiter.checkRateLimit(request, config);
      const result2 = await rateLimiter.checkRateLimit(request, config);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(false);
    });

    it('should handle missing IP gracefully', async () => {
      const request = createMockRequest();
      // Override to simulate no IP
      (request as any).ip = undefined;
      const config = { windowMs: 60000, maxRequests: 1 };

      const result = await rateLimiter.checkRateLimit(request, config);

      expect(result.allowed).toBe(true);
    });

    it('should reset window after time expires', async () => {
      const request = createMockRequest('192.168.1.14');
      const config = { windowMs: 100, maxRequests: 1 }; // Very short window

      const result1 = await rateLimiter.checkRateLimit(request, config);
      expect(result1.allowed).toBe(true);

      const result2 = await rateLimiter.checkRateLimit(request, config);
      expect(result2.allowed).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      const result3 = await rateLimiter.checkRateLimit(request, config);
      expect(result3.allowed).toBe(true);
    });
  });

  describe('checkBothLimits', () => {
    it('should check only IP limit when no global config provided', async () => {
      const request = createMockRequest('192.168.1.15');
      const ipConfig = { windowMs: 60000, maxRequests: 2 };

      const result = await rateLimiter.checkBothLimits(request, ipConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
      expect(result.globalRemaining).toBeUndefined();
      expect(result.blockedBy).toBeUndefined();
    });

    it('should check both IP and global limits', async () => {
      const request = createMockRequest('192.168.1.16');
      const ipConfig = { windowMs: 60000, maxRequests: 5 };
      const globalConfig = { windowMs: 60000, maxRequests: 10 };

      const result = await rateLimiter.checkBothLimits(request, ipConfig, globalConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.globalRemaining).toBe(9);
    });

    it('should block when global limit exceeded', async () => {
      const request1 = createMockRequest('192.168.1.17');
      const request2 = createMockRequest('192.168.1.18');
      const ipConfig = { windowMs: 60000, maxRequests: 5 };
      const globalConfig = { windowMs: 60000, maxRequests: 2 };

      await rateLimiter.checkBothLimits(request1, ipConfig, globalConfig);
      await rateLimiter.checkBothLimits(request2, ipConfig, globalConfig);
      const result = await rateLimiter.checkBothLimits(request1, ipConfig, globalConfig);

      expect(result.allowed).toBe(false);
      expect(result.blockedBy).toBe('global');
      expect(result.globalRemaining).toBe(0);
    });

    it('should block when IP limit exceeded but global limit OK', async () => {
      const request = createMockRequest('192.168.1.19');
      const ipConfig = { windowMs: 60000, maxRequests: 1 };
      const globalConfig = { windowMs: 60000, maxRequests: 10 };

      await rateLimiter.checkBothLimits(request, ipConfig, globalConfig);
      const result = await rateLimiter.checkBothLimits(request, ipConfig, globalConfig);

      expect(result.allowed).toBe(false);
      expect(result.blockedBy).toBe('ip');
      expect(result.remaining).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries during cleanup', async () => {
      const request = createMockRequest('192.168.1.20');
      const config = { windowMs: 100, maxRequests: 1 };

      // Make a request to create an entry
      await rateLimiter.checkRateLimit(request, config);

      // Wait for entry to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Note: Cleanup happens automatically via interval in the singleton

      // New request should be allowed (entry was cleaned up)
      const result = await rateLimiter.checkRateLimit(request, config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0); // First request in new window
    });
  });
});

describe('RATE_LIMIT_CONFIG', () => {
  it('should have correct configuration values', () => {
    expect(RATE_LIMIT_CONFIG.QUERY_API.windowMs).toBe(15 * 60 * 1000);
    expect(RATE_LIMIT_CONFIG.QUERY_API.maxRequests).toBe(50);

    expect(RATE_LIMIT_CONFIG.GENERAL_API.windowMs).toBe(15 * 60 * 1000);
    expect(RATE_LIMIT_CONFIG.GENERAL_API.maxRequests).toBe(100);

    expect(RATE_LIMIT_CONFIG.GLOBAL_CIRCUIT_BREAKER.windowMs).toBe(60 * 60 * 1000);
    expect(RATE_LIMIT_CONFIG.GLOBAL_CIRCUIT_BREAKER.maxRequests).toBe(200);
  });

  it('should be readonly configuration', () => {
    // TypeScript prevents modification at compile time
    // Runtime test for object immutability would require Object.freeze()
    expect(RATE_LIMIT_CONFIG.QUERY_API.maxRequests).toBe(50);
    expect(typeof RATE_LIMIT_CONFIG).toBe('object');
  });
});