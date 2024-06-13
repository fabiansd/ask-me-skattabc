import { searchMatchVector } from '@/app/src/consumers/esSearchConsumer';
import { embedText, queryChat } from '@/app/src/consumers/openAiConsumer';
import { 
  ELASTICSEARCH_INDEX_SKATT, 
  ELASTICSEARCH_INDEX_SKATT_PARA, 
  ES_VECTOR_SEARCH_SIZE_SKATT, 
  ES_VECTOR_SEARCH_SIZE_SKATT_PARA 
} from '@/app/src/constants/esParameters';
import { addUserChatHistory } from '../../consumers/postgresConsumer';
import { QueryChatRequest } from '../../interface/skattSokInterface';


async function query(queryChatRequest: QueryChatRequest) {
    console.log('Search text: ', queryChatRequest.searchText);

    const searchVector: number[] = await embedText(queryChatRequest.searchText);

    const esParagraphSearch = await searchMatchVector(
      searchVector,
      ELASTICSEARCH_INDEX_SKATT_PARA,
      ES_VECTOR_SEARCH_SIZE_SKATT_PARA
    );

    const openaiResponse = await queryChat(
      queryChatRequest,
      esParagraphSearch
    );

    !!openaiResponse && await addUserChatHistory(queryChatRequest, openaiResponse);

    const response = Response.json({ openaiResponse, esParagraphSearch });

    return response;
  }

  export default query;