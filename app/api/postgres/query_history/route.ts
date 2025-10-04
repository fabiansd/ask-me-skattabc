import getQueryHistory from "@/app/src/service/history/queryHistoryService";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
      const { searchParams } = new URL(request.url);
      const username = searchParams.get('username');

      if (!username) {
        return NextResponse.json({ error: 'Username required to fetch history' }, { status: 400 });
      }

      const queryHistory = await getQueryHistory(username);
      return NextResponse.json(queryHistory);
  } catch (error) {
    console.error('Query history error: ', error);

    if (error.message === 'User not found') {
      return NextResponse.json({
        message: `User '${searchParams.get('username')}' not found`,
        history: []
      }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to fetch query history' }, { status: 500 });
  }
}
