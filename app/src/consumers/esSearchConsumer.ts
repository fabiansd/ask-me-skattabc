import { ELASTICSEARCH_INDEX_SKATT, ES_KNN_NUMBER } from "../constants/esParameters";
import { getClient } from "../lib/esClient";
import { unwrapESResponse } from "../lib/esUtil";


export async function healthCheck() {
  try {
    const client = getClient();
    const pingResponse = await client.ping()
    console.log('ES health check passed ')
    return pingResponse;
  } catch (error) {
    console.error('ES health check failed ')
    throw error
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
            }
          }
        }
      }
    });
    console.log('ES keyword search retreived ')
    return unwrapESResponse(response)
  } catch (error) {
    console.error("Elasticsearch search error: ", error);
    throw error;
  }
}

export async function searchMatchVector(searchVector: number[], index: string, size: number) {
  try {
    const client = getClient();
    const esResponse = await client.search({
      index: index,
      size: size,
      knn: {
        field: "embedding",
        query_vector: searchVector,
        k: ES_KNN_NUMBER,
        num_candidates: 100,
        boost: 0.1,
        }
      });
    const unwrappedResponse = unwrapESResponse(esResponse)
    console.log(`ES vector search retrieved ${unwrappedResponse.length} vectors from index: ${index}`)
    return unwrappedResponse
  } catch (error) {
    console.error("Elasticsearch search error:", error);
    throw error;
  }
}