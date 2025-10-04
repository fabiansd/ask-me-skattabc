import { NextRequest } from 'next/server';
import { rateLimiter, RATE_LIMIT_CONFIG } from '@/app/src/lib/rateLimiter';

export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<Response>,
  endpoint: keyof typeof RATE_LIMIT_CONFIG = 'GENERAL_API'
) {
  const config = RATE_LIMIT_CONFIG[endpoint];

  // Check IP rate limit
  const result = await rateLimiter.checkRateLimit(request, config);

  // Check global limit for AI queries
  if (endpoint === 'QUERY_API') {
    const globalConfig = RATE_LIMIT_CONFIG.GLOBAL_CIRCUIT_BREAKER;
    // Create a mock request for global rate limiting
    const globalRequest = {
      headers: new Headers(),
      ip: 'GLOBAL_TOTAL'
    } as NextRequest;
    const globalResult = await rateLimiter.checkRateLimit(
      globalRequest,
      globalConfig
    );

    if (!globalResult.allowed) {
      const retryAfter = Math.ceil((globalResult.resetTime - Date.now()) / 1000);
      return Response.json(
        {
          error: 'Service temporarily unavailable',
          message: `Too many requests globally. Try again in ${retryAfter} seconds.`
        },
        {
          status: 503,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-Global-RateLimit-Remaining': '0'
          }
        }
      );
    }
  }

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return Response.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${retryAfter} seconds.`
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Remaining': '0'
        }
      }
    );
  }

  const response = await handler(request);

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());

  return response;
}