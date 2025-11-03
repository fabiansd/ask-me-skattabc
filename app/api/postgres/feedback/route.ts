import { NextRequest, NextResponse } from 'next/server';

import addUserFeedbackService from '@/app/src/service/feedback/userFeedbackService';

export async function POST(request: NextRequest) {
  try {
    const { feedback } = await request.json();
    await addUserFeedbackService(feedback);
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: 'Error generating answer' });
  }
}
