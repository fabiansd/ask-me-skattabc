import { NextRequest } from 'next/server';
import query from '@/app/service/chat/queryService';


export async function POST(request: NextRequest) {
  try {
    const response = await query(request);
    return response
  } catch (error) {
    console.error('Prompt query error:', error);
    Response.json({ error: 'Error generating answer' });
  }
}
