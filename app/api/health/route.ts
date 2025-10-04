import { healthCheck } from '@/app/src/consumers/esSearchConsumer';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const healthResponse = await healthCheck();

    return NextResponse.json({
      status: 'healthy',
      elasticsearch: healthResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
