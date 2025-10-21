import { NextResponse } from 'next/server';

import { healthCheck } from '@/app/src/consumers/esSearchConsumer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const healthResponse = await healthCheck();

    return NextResponse.json({
      status: 'healthy',
      elasticsearch: healthResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
