import { searchMatchVector } from '@/app/src/consumers/esSearchConsumer';
import { embedText, queryChat } from '@/app/src/consumers/openAiConsumer';
import {
  ELASTICSEARCH_INDEX_SKATT_PARA,
  ES_VECTOR_SEARCH_SIZE_SKATT_PARA
} from '@/app/src/constants/esParameters';
import { addUserChatHistory } from '../../consumers/postgresConsumer';
import { QueryChatRequest } from '../../interface/skattSokInterface';
import { getMockQueryResponse } from '../../../../tests/mockData';


async function query(queryChatRequest: QueryChatRequest) {
    console.log('Search text: ', queryChatRequest.searchText);
    console.log('Query request: ', JSON.stringify(queryChatRequest, null, 2));

    if (process.env.USE_MOCK_DATA === 'true') {
        console.log('Using mock data');
        return Response.json(getMockQueryResponse());
    }

    const searchVector: number[] = await embedText(queryChatRequest.searchText);

    console.log('searchVector: ', searchVector);

    const esParagraphSearch = await searchMatchVector(
      searchVector,
      ELASTICSEARCH_INDEX_SKATT_PARA,
      ES_VECTOR_SEARCH_SIZE_SKATT_PARA
    );

    console.log('esParagraphSearch: ', esParagraphSearch);

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