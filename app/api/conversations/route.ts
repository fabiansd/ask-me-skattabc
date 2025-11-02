import { NextRequest, NextResponse } from 'next/server';

import { getUserConversations } from '../../src/service/history/historyService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authId = searchParams.get('auth_id');

    if (!authId) {
      return NextResponse.json({ error: 'auth_id is required' }, { status: 400 });
    }

    const conversationsList = await getUserConversations(authId);
    return NextResponse.json(conversationsList, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}
