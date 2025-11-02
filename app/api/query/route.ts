import { NextRequest, NextResponse } from 'next/server';

import { QueryChatRequest } from '@/app/src/interface/skattSokInterface';
import { withRateLimit } from '@/app/src/middleware/rateLimitMiddleware';
import query from '@/app/src/service/chat/queryService';

async function handleQuery(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authId = searchParams.get('auth_id');

    if (!authId) {
      return NextResponse.json({ error: 'auth_id is required' }, { status: 400 });
    }

    const queryChatRequest: QueryChatRequest = await request.json();
    const data = await query(queryChatRequest, authId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error generating answer' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, handleQuery, 'QUERY_API');
}
