import { ELASTICSEARCH_INDEX_SKATT, ES_KNN_NUMBER, ES_VECTOR_SEARCH_SIZE } from "../constants.ts/esParameters";
import { client } from "../lib/esClient";
import { unwrapESResponse } from "../lib/esUtil";
import { embedText, queryChat } from "./openAi";


export async function searchMatchKeyword(searchText: string) {
  try {
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
    return unwrapESResponse(response)
  } catch (error) {
    console.error("Elasticsearch search error:", error);
    throw error;
  }
}


export async function searchMatchVector(searchText: string) {
  try {
    const searchVector: number[] = await embedText(searchText);
    const esResponse = await client.search({
      index: ELASTICSEARCH_INDEX_SKATT || 'index_skatt',
      size: ES_VECTOR_SEARCH_SIZE,
      knn: {
        field: "embedding",
        query_vector: searchVector,
        k: ES_KNN_NUMBER,
        num_candidates: 50,
        boost: 0.1,
        }
      });
    return unwrapESResponse(esResponse)
  } catch (error) {
    console.error("Elasticsearch search error:", error);
    throw error;
  }
}