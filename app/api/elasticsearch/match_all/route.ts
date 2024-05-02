import { NextRequest } from 'next/server';
import { searchMatchKeyword, searchMatchVector } from '@/app/consumers/esSearch';
import { queryChat } from '@/app/consumers/openAi';


export async function POST(request: NextRequest) {
  try {
    const { searchText, modelSelect } = await request.json();
    const esResponse = await searchMatchVector(searchText)
    const openaiResponse = await queryChat(searchText, esResponse, modelSelect)

    const response = Response.json({openaiResponse, esResponse});
    
    return response
  } catch (error) {
    console.error('Elasticsearch query error:', error);
    Response.json({ error: 'Error fetching data from Elasticsearch' });
  }
}
