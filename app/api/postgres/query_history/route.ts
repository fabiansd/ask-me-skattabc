import getQueryHistory from "@/app/src/service/history/queryHistoryService";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
  try {
      const { searchParams } = new URL(request.url);
      const username = searchParams.get('username');

      if (!username) {
        return new Response(JSON.stringify({ error: 'Username required to fetch history' }), { status: 400 });
      }

      const queryHistory = await getQueryHistory(username);
      return Response.json(queryHistory);
  } catch (error) {
    console.error('ES Health check error: ', error);
    Response.json({ error: ' ES health check failed' });
  }
}
