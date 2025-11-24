import { NextRequest, NextResponse } from 'next/server';

import { getMessageSources } from '@/app/src/service/history/historyService';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const messageId = parseInt(params.id, 10);

    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const sourceDocuments = await getMessageSources(messageId);

    return NextResponse.json({ sources: sourceDocuments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching message sources:', error);

    if (error instanceof Error) {
      if (error.message === 'Invalid message ID') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message === 'Message not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json({ error: 'Error fetching message sources' }, { status: 500 });
  }
}
