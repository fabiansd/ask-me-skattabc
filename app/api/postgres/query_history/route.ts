import getQueryHistory from "@/app/src/service/history/queryHistoryService";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
      const { searchParams } = new URL(request.url);
      const username = searchParams.get('username') || 'default';

      if (!username) {
        return new NextResponse(JSON.stringify({ error: 'Username required to fetch history' }), { status: 400 });
      }

      const queryHistory = await getQueryHistory(username);
      return NextResponse.json(queryHistory);
  } catch (error) {
    console.error('ES Health check error: ', error);
    NextResponse.json({ error: ' ES health check failed' });
  }
}
