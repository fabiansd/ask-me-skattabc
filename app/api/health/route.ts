import { healthCheck } from '@/app/consumers/esSearchConsumer';
import { findUser } from '@/app/consumers/postgresConsumer';


export async function GET() {
  try {
    const healthResponse = await healthCheck()

    const postgresResponse = await findUser();

    const response = Response.json({healthResponse});
    
    return response
  } catch (error) {
    console.error('ES Health check error: ', error);
    Response.json({ error: ' ES health check failed' });
  }
}
