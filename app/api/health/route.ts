import { healthCheck } from '@/app/src/consumers/esSearchConsumer';
import { findUserByName } from '@/app/src/consumers/postgresConsumer';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'default';

    const healthResponse = await healthCheck();
    const userResponse = await findUserByName(username);

    return NextResponse.json({ healthResponse, userResponse });
  } catch (error) {
    console.error('ES Health check error:', error);
    return NextResponse.json({ error: 'ES health check failed' }, { status: 500 });
  }
}
