import { healthCheck } from '@/app/src/consumers/esSearchConsumer';
import { findUserByName } from '@/app/src/consumers/postgresConsumer';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'default';

    const healthResponse = await healthCheck()

    const userResponse = await findUserByName(username ? username : 'default');

    const response = NextResponse.json({healthResponse, userResponse});
    
    return response
  } catch (error) {
    console.error('ES Health check error: ', error);
    NextResponse.json({ error: ' ES health check failed' });
  }
}
