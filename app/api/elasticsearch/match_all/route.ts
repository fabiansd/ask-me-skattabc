import { NextRequest } from 'next/server';
import { searchMatchKeyword, searchMatchVector } from '@/app/consumers/esSearch';
import { queryChat } from '@/app/consumers/openAi';


export async function POST(request: NextRequest) {
  try {
    const { searchText, modelSelect } = await request.json();
    console.log('Search text: ', searchText, ' with model: ', modelSelect)
    const esResponse = await searchMatchVector(searchText)
    const openaiResponse = await queryChat(searchText, esResponse, modelSelect)

    const response = Response.json({openaiResponse, esResponse});
    
    return response
  } catch (error) {
    console.error('Prompt query error:', error);
    Response.json({ error: 'Error generating answer' });
  }
}
