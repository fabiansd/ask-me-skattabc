import { NextRequest, NextResponse } from 'next/server';

import { QueryChatRequest } from '@/app/src/interface/skattSokInterface';
import { withRateLimit } from '@/app/src/middleware/rateLimitMiddleware';
import { queryStream } from '@/app/src/service/chat/queryService';

async function handleQuery(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authId = searchParams.get('auth_id');

    if (!authId) {
      return NextResponse.json({ error: 'auth_id is required' }, { status: 400 });
    }

    const queryChatRequest: QueryChatRequest = await request.json();

    // Create a ReadableStream from the async generator
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of queryStream(queryChatRequest, authId)) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error generating answer' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, handleQuery, 'QUERY_API');
}
