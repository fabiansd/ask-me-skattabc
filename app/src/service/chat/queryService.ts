import { ELASTICSEARCH_INDEX_SKATT } from '@/app/src/constants/esParameters';
import { searchVectorAndRRFKeyword } from '@/app/src/consumers/esSearchConsumer';
import { embedText, moderateContent, queryChatStream } from '@/app/src/consumers/openAiConsumer';

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

export async function* queryStream(
  queryChatRequest: QueryChatRequest,
  authId: string
): AsyncGenerator<string> {
  await validateQueryRequest(queryChatRequest);

  if (process.env.USE_MOCK_DATA === 'true') {
    const mockResponse = getMockQueryResponse();
    yield mockResponse.openaiResponse;

    const conversation_id = await addUserChatHistory(
      queryChatRequest,
      mockResponse.openaiResponse,
      authId
    );
    yield JSON.stringify({ conversation_id });
    return;
  }

  const searchVector: number[] = await embedText(queryChatRequest.searchText);

  const esChunkSearch = await searchVectorAndRRFKeyword(
    searchVector,
    ELASTICSEARCH_INDEX_SKATT,
    queryChatRequest.tags || [],
    queryChatRequest.searchText
  );

  // Collect streamed response
  let fullResponse = '';
  for await (const chunk of queryChatStream(queryChatRequest, esChunkSearch, authId)) {
    fullResponse += chunk;
    yield chunk;
  }

  // After stream completes, save to database
  if (fullResponse) {
    const conversation_id = await addUserChatHistory(queryChatRequest, fullResponse, authId);
    // Send final message with conversation_id
    yield JSON.stringify({ conversation_id });
  }
}
