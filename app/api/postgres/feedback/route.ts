import addUserFeedbackService from '@/app/service/feedback/userFeedbackService';
import { NextRequest } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const { feedback } = await request.json();
    await addUserFeedbackService(feedback);
    return Response.json({});
  } catch (error) {
    console.error('Prompt query error:', error);
    Response.json({ error: 'Error generating answer' });
  }
}
