import { ELASTICSEARCH_INDEX_SKATT, ES_SEARCH_NUM_HITS } from '@/app/src/constants/esParameters';
import { searchMatchSearchVectorKeyword } from '@/app/src/consumers/esSearchConsumer';
import { embedText, queryChat } from '@/app/src/consumers/openAiConsumer';

import { getMockQueryResponse } from '../../../../tests/mockData';
import { addUserChatHistory } from '../../consumers/postgresConsumer';
import { QueryChatRequest } from '../../interface/skattSokInterface';

async function query(queryChatRequest: QueryChatRequest, authId: string) {
  console.log('Search text: ', queryChatRequest.searchText);
  console.log('Query request: ', JSON.stringify(queryChatRequest, null, 2));
  console.log('USE_MOCK_DATA env var:', process.env.USE_MOCK_DATA);

  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Using mock data');
    const mockResponse = getMockQueryResponse();
    const conversation_id = await addUserChatHistory(
      queryChatRequest,
      mockResponse.openaiResponse,
      authId
    );
    return { openaiResponse: mockResponse.openaiResponse, conversation_id };
  }

  const searchVector: number[] = await embedText(queryChatRequest.searchText);

  console.log('searchVector: ', searchVector);

  const esChunkSearch = await searchMatchSearchVectorKeyword(
    searchVector,
    ELASTICSEARCH_INDEX_SKATT,
    ES_SEARCH_NUM_HITS,
    queryChatRequest.tags || []
  );

  console.log('Chunk nr 1: ', esChunkSearch[0]);

  const openaiResponse = await queryChat(queryChatRequest, esChunkSearch, authId);

  console.log('openaiResponse: ', openaiResponse);

  let conversation_id;
  if (openaiResponse) {
    conversation_id = await addUserChatHistory(queryChatRequest, openaiResponse, authId);
  }

  return { openaiResponse, conversation_id };
}

export default query;
