import { getClient } from '../clients/esClient';
import { unwrapESResponse } from '../clients/esUtil';
import {
  ELASTICSEARCH_INDEX_SKATT,
  ES_SEARCH_RANKING_HITS,
  ES_KNN_K,
  ES_KNN_NUM_CANDIDATES,
} from '../constants/esParameters';

export async function healthCheck() {
  try {
    const client = getClient();
    const pingResponse = await client.ping();
    console.log('ES health check passed ');
    return pingResponse;
  } catch (error) {
    console.error('ES health check failed ');
    throw error;
  }
}

export async function searchMatchKeyword(searchText: string) {
  try {
    const client = getClient();
    const response = await client.search({
      index: ELASTICSEARCH_INDEX_SKATT || 'index_skatt',
      size: 5,
      body: {
        query: {
          match: {
            content: {
              query: searchText,
              boost: 0.9,
            },
          },
        },
      },
    });
    console.log('ES keyword search retreived ');
    return unwrapESResponse(response);
  } catch (error) {
    console.error('Elasticsearch search error: ', error);
    throw error;
  }
}

export async function searchMatchVector(searchVector: number[], index: string) {
  const startTime = performance.now();
  try {
    const client = getClient();
    const esResponse = await client.search({
      index: index,
      size: ES_SEARCH_RANKING_HITS,
      knn: {
        field: 'embedding',
        query_vector: searchVector,
        k: ES_KNN_K,
        num_candidates: ES_KNN_NUM_CANDIDATES,
        boost: 0.1,
      },
    });
    const unwrappedResponse = unwrapESResponse(esResponse);
    const searchTime = performance.now() - startTime;

    console.log(`🔍 ES Vector Search Results:
    └─ Index: ${index}
    └─ Search time: ${searchTime.toFixed(0)}ms
    └─ Documents retrieved: ${unwrappedResponse.length}/${ES_SEARCH_RANKING_HITS}`);

    return unwrappedResponse;
  } catch (error) {
    console.error('❌ ES vector search error:', error);
    throw error;
  }
}

export async function searchMatchSearchVectorKeyword(
  searchVector: number[],
  index: string,
  keywords: string[] = [],
  userQuery: string = ''
) {
  const startTime = performance.now();
  try {
    const client = getClient();

    const esResponse = await client.search({
      index: index,
      size: ES_SEARCH_RANKING_HITS,
      knn: {
        field: 'embedding',
        query_vector: searchVector,
        k: ES_KNN_K,
        num_candidates: ES_KNN_NUM_CANDIDATES,
        boost: 1.0,
      },
      query: {
        bool: {
          should: [
            { match: { content: { query: userQuery, boost: 0.3 } } },
            ...(keywords.length > 0
              ? keywords.map(kw => ({
                  match: { content: { query: kw, boost: 0.3 } },
                }))
              : []),
          ],
          minimum_should_match: 0,
        },
      },
    });

    const unwrappedResponse = unwrapESResponse(esResponse);
    const searchTime = performance.now() - startTime;

    console.log(`🔍 ES Hybrid Search Results:
    └─ Index: ${index}
    └─ Search time: ${searchTime.toFixed(0)}ms
    └─ Query: "${userQuery}"
    └─ Keywords: ${keywords.length > 0 ? keywords.join(', ') : 'none'}
    └─ Documents retrieved: ${unwrappedResponse.length}/${ES_SEARCH_RANKING_HITS}`);

    return unwrappedResponse;
  } catch (error) {
    console.error('❌ ES hybrid search error:', error);
    throw error;
  }
}
