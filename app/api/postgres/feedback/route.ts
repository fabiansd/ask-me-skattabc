import addUserFeedbackService from '@/app/src/service/feedback/userFeedbackService';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const { feedback } = await request.json();
    await addUserFeedbackService(feedback);
    return NextResponse.json({});
  } catch (error) {
    console.error('Prompt query error:', error);
    NextResponse.json({ error: 'Error generating answer' });
  }
}
