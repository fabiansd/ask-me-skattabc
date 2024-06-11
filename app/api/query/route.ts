import { NextRequest, NextResponse } from 'next/server';
import query from '@/app/src/service/chat/queryService';


export async function POST(request: NextRequest) {
  try {
    const response = await query(request);
    return response
  } catch (error) {
    console.error('Prompt query error:', error);
    NextResponse.json({ error: 'Error generating answer' });
  }
}
