import { NextRequest } from 'next/server';
import { searchMatchKeyword, searchMatchVector } from '@/app/consumers/esSearch';
import { queryChat } from '@/app/consumers/openAi';


export async function POST(request: NextRequest) {
  try {
    const { searchText } = await request.json();
    console.log('searchText', searchText);
    const esResponse = await searchMatchVector(searchText)
    const openaiResponse = await queryChat(searchText, esResponse)
    
    return Response.json({openaiResponse});
  } catch (error) {
    console.error('Elasticsearch query error:', error);
    Response.json({ error: 'Error fetching data from Elasticsearch' });
  }
}
