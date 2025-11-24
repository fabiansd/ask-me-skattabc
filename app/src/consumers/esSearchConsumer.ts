import { getClient, getCloudClient } from '../clients/esClient';
import { unwrapESResponse, unwrapESResponseWithMetadata, ESDocument } from '../clients/esUtil';
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

export async function cloudHealthCheck() {
  try {
    const client = getCloudClient();
    const pingResponse = await client.ping();
    const infoResponse = await client.info();
    console.log('ES Cloud health check passed');
    console.log('ES Cloud version:', infoResponse.version?.number);
    return { ping: pingResponse, info: infoResponse };
  } catch (error) {
    console.error('ES Cloud health check failed');
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

export async function fetchDocumentsByIds(
  index: string,
  documentIds: string[]
): Promise<ESDocument[]> {
  try {
    const client = getCloudClient();

    const response = await client.mget({
      index: index,
      body: {
        ids: documentIds,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documents: ESDocument[] = response.docs
      .filter((doc: any) => doc.found)
      .map((doc: any) => ({
        _id: doc._id,
        _index: doc._index,
        content: doc._source.content,
        department: doc._source.department,
        document_title: doc._source.document_title,
        article_number: doc._source.article_number,
        article_title: doc._source.article_title,
      }));

    console.log(`📄 Fetched ${documents.length}/${documentIds.length} documents from ${index}`);

    return documents;
  } catch (error) {
    console.error('❌ ES fetch documents error:', error);
    throw error;
  }
}

export async function searchVectorAndRRFKeyword(
  searchVector: number[],
  index: string,
  keywords: string[] = [],
  userQuery: string = ''
) {
  const startTime = performance.now();
  try {
    const client = getCloudClient();

    // Build sub_searches for RRF
    const subSearches = [
      {
        query: {
          match: {
            content: userQuery,
          },
        },
      },
      ...keywords.map(keyword => ({
        query: {
          match: {
            content: keyword,
          },
        },
      })),
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const esResponse = await (client.search as any)({
      index: index,
      body: {
        retriever: {
          rrf: {
            retrievers: [
              ...subSearches.map(subSearch => ({
                standard: subSearch,
              })),
              {
                knn: {
                  field: 'embedding',
                  query_vector: searchVector,
                  k: ES_KNN_K,
                  num_candidates: ES_KNN_NUM_CANDIDATES,
                },
              },
            ],
            rank_window_size: ES_KNN_NUM_CANDIDATES,
          },
        },
        _source: {
          excludes: ['embedding'],
        },
        size: ES_SEARCH_RANKING_HITS,
      },
    });

    const unwrappedResponse = unwrapESResponseWithMetadata(esResponse);
    const searchTime = performance.now() - startTime;

    console.log(`🔍 ES RRF Search Results:
    └─ Index: ${index}
    └─ Search time: ${searchTime.toFixed(0)}ms
    └─ Query: "${userQuery}"
    └─ Keywords: ${keywords.length > 0 ? keywords.join(', ') : 'none'}
    └─ Documents retrieved: ${unwrappedResponse.length}/${ES_SEARCH_RANKING_HITS}`);

    return unwrappedResponse;
  } catch (error) {
    console.error('❌ ES RRF search error:', error);
    throw error;
  }
}
