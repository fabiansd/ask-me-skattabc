import { healthCheck } from '@/app/consumers/esSearch';


export async function GET() {
  try {
    const healthResponse = await healthCheck()

    const response = Response.json({healthResponse});
    
    return response
  } catch (error) {
    console.error('ES Health check error: ', error);
    Response.json({ error: ' ES health check failed' });
  }
}
