import { NextRequest, NextResponse } from 'next/server';

import { QueryChatRequest } from '@/app/src/interface/skattSokInterface';
import { withRateLimit } from '@/app/src/middleware/rateLimitMiddleware';
import query from '@/app/src/service/chat/queryService';

async function handleQuery(request: NextRequest) {
  try {
    const queryChatRequest: QueryChatRequest = await request.json();
    const response = await query(queryChatRequest);
    return response;
  } catch (error) {
    console.error('Prompt query error:', error);
    return NextResponse.json({ error: 'Error generating answer' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, handleQuery, 'QUERY_API');
}
