import { searchMatchVector } from '@/app/consumers/esSearchConsumer';
import { embedText, queryChat } from '@/app/consumers/openAiConsumer';
import { 
  ELASTICSEARCH_INDEX_SKATT, 
  ELASTICSEARCH_INDEX_SKATT_PARA, 
  ES_VECTOR_SEARCH_SIZE_SKATT, 
  ES_VECTOR_SEARCH_SIZE_SKATT_PARA 
} from '@/app/constants/esParameters';
import { NextRequest } from 'next/server';
import { addUserChatHistory } from '../../consumers/postgresConsumer';


async function query(request: NextRequest) {
    const { searchText, isDetailed } = await request.json();
    console.log('Search text: ', searchText);

    const searchVector: number[] = await embedText(searchText);

    /*const esChunkSearch = await searchMatchVector(
      searchVector,
      ELASTICSEARCH_INDEX_SKATT,
      ES_VECTOR_SEARCH_SIZE_SKATT
    );*/

    const esParagraphSearch = await searchMatchVector(
      searchVector,
      ELASTICSEARCH_INDEX_SKATT_PARA,
      ES_VECTOR_SEARCH_SIZE_SKATT_PARA
    );

    const openaiResponse = await queryChat(
      searchText,
      esParagraphSearch,
      isDetailed
    );

    !!openaiResponse && await addUserChatHistory(searchText, openaiResponse);

    const response = Response.json({ openaiResponse, esParagraphSearch });

    return response;
  }

  export default query;