import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, RATE_LIMIT_CONFIG } from '@/app/src/lib/rateLimiter';

export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  endpoint: keyof typeof RATE_LIMIT_CONFIG = 'GENERAL_API'
) {
  const config = RATE_LIMIT_CONFIG[endpoint];
  const result = await rateLimiter.checkRateLimit(request, config);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${retryAfter} seconds.`,
        retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString()
        }
      }
    );
  }

  const response = await handler(request);

  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

  return response;
}