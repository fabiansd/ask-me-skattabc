import getQueryHistory from "@/app/service/history/queryHistoryService";


export async function GET() {
  try {
      const queryHistory = await getQueryHistory();
      return Response.json(queryHistory);
  } catch (error) {
    console.error('ES Health check error: ', error);
    Response.json({ error: ' ES health check failed' });
  }
}
