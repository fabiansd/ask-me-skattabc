import { ELASTICSEARCH_INDEX_SKATT } from '@/app/src/constants/esParameters';
import { searchMatchSearchVectorKeyword } from '@/app/src/consumers/esSearchConsumer';
import { embedText, moderateContent, queryChat } from '@/app/src/consumers/openAiConsumer';

import { getMockQueryResponse } from '../../../../tests/mockData';
import { addUserChatHistory } from '../../consumers/postgresConsumer';
import { QueryChatRequest } from '../../interface/skattSokInterface';

async function validateQueryRequest(queryChatRequest: QueryChatRequest): Promise<void> {
  const isFlagged = await moderateContent(queryChatRequest.searchText);
  if (isFlagged) {
    throw new Error(
      'Innholdet er ikke støttet. Vennligst still et spørsmål om norske skatteregler.'
    );
  }
}

async function generateResponse(
  queryChatRequest: QueryChatRequest,
  authId: string
): Promise<string | undefined> {
  if (process.env.USE_MOCK_DATA === 'true') {
    const mockResponse = getMockQueryResponse();
    return mockResponse.openaiResponse;
  }

  const searchVector: number[] = await embedText(queryChatRequest.searchText);

  const esChunkSearch = await searchMatchSearchVectorKeyword(
    searchVector,
    ELASTICSEARCH_INDEX_SKATT,
    queryChatRequest.tags || [],
    queryChatRequest.searchText
  );

  return await queryChat(queryChatRequest, esChunkSearch, authId);
}

async function query(queryChatRequest: QueryChatRequest, authId: string) {
  await validateQueryRequest(queryChatRequest);

  const openaiResponse = await generateResponse(queryChatRequest, authId);

  let conversation_id;
  if (openaiResponse) {
    conversation_id = await addUserChatHistory(queryChatRequest, openaiResponse, authId);
  }

  return { openaiResponse, conversation_id };
}

export default query;
