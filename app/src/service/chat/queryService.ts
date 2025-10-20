import { searchMatchSearchVectorKeyword, searchMatchVector } from '@/app/src/consumers/esSearchConsumer';
import { embedText, queryChat } from '@/app/src/consumers/openAiConsumer';
import {
  ELASTICSEARCH_INDEX_SKATT,
  ES_SEARCH_NUM_HITS
} from '@/app/src/constants/esParameters';
import { addUserChatHistory } from '../../consumers/postgresConsumer';
import { QueryChatRequest } from '../../interface/skattSokInterface';
import { getMockQueryResponse } from '../../../../tests/mockData';


async function query(queryChatRequest: QueryChatRequest) {
    console.log('Search text: ', queryChatRequest.searchText);
    console.log('Query request: ', JSON.stringify(queryChatRequest, null, 2));
    console.log('USE_MOCK_DATA env var:', process.env.USE_MOCK_DATA);

    if (process.env.USE_MOCK_DATA === 'true') {
        console.log('Using mock data');
        const mockResponse = getMockQueryResponse();
        await addUserChatHistory(queryChatRequest, mockResponse.openaiResponse);
        return Response.json(mockResponse);
    }

    const searchVector: number[] = await embedText(queryChatRequest.searchText);

    console.log('searchVector: ', searchVector);

    const esParagraphSearch = await searchMatchSearchVectorKeyword(
      searchVector,
      ELASTICSEARCH_INDEX_SKATT,
      ES_SEARCH_NUM_HITS,
      queryChatRequest.tags || []
    );

    console.log('Chunk nr 1: ', esParagraphSearch[0]);

    const openaiResponse = await queryChat(
      queryChatRequest,
      esParagraphSearch
    );

    console.log('openaiResponse: ', openaiResponse);

    !!openaiResponse && await addUserChatHistory(queryChatRequest, openaiResponse);

    const response = Response.json({ openaiResponse, esParagraphSearch });

    return response;
  }

  export default query;