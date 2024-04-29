import { client } from "../lib/esClient";
import { unwrapESResponse } from "../lib/esUtil";
import { embedText, queryChat } from "./openAi";


export async function searchMatchKeyword(searchText: string) {
  try {
    const response = await client.search({
      index: process.env.ELASTICSEARCH_INDEX || 'index_skatt',
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
    console.log('response', response);
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
      index: process.env.ELASTICSEARCH_INDEX || 'index_skatt',
      size: 1,
      knn: {
        field: "embedding",
        query_vector: searchVector,
        k: 5,
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