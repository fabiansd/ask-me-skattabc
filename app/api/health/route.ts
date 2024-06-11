import { healthCheck } from '@/app/src/consumers/esSearchConsumer';
import { findUserById, findUserByName } from '@/app/src/consumers/postgresConsumer';
import { NextRequest } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    const healthResponse = await healthCheck()

    const userResponse = await findUserByName(username ? username : 'default');

    const response = Response.json({healthResponse, userResponse});
    
    return response
  } catch (error) {
    console.error('ES Health check error: ', error);
    Response.json({ error: ' ES health check failed' });
  }
}
