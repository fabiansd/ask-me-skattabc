import { NextRequest, NextResponse } from 'next/server';

import {
  deleteUserConversation,
  getUserConversationHistory,
} from '../../../../src/service/history/historyService';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const authId = searchParams.get('auth_id');
    const conversationId = parseInt(params.id);

    if (!authId) {
      return NextResponse.json({ error: 'auth_id is required' }, { status: 400 });
    }
    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    const conversationMessages = await getUserConversationHistory(authId, conversationId);
    return NextResponse.json(conversationMessages, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const authId = searchParams.get('auth_id');
    const conversationId = parseInt(params.id);

    if (!authId) {
      return NextResponse.json({ error: 'auth_id is required' }, { status: 400 });
    }
    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    await deleteUserConversation(authId, conversationId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting conversation' }, { status: 500 });
  }
}
