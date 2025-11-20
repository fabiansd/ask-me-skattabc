import { Client } from '@elastic/elasticsearch';

import { ELASTIC_USERNAME } from '../constants/esParameters';

let client: Client | null = null;
let cloudClient: Client | null = null;

export function getClient(): Client {
  if (!client) {
    const elasticsearchUrl = process.env.ELASTICSEARCH_URL;
    if (!elasticsearchUrl) {
      throw new Error('ELASTICSEARCH_URL environment variable is not set');
    }

    client = new Client({
      auth: {
        username: ELASTIC_USERNAME || 'elastic',
        password: process.env.ELASTIC_PASSWORD || '',
      },
      node: elasticsearchUrl,
    });
  }
  return client;
}

export function getCloudClient(): Client {
  if (!cloudClient) {
    const elasticCloudUrl = process.env.ELASTIC_CLOUD_URL;
    const elasticCloudApiKey = process.env.ELASTIC_CLOUD_API_KEY;

    if (!elasticCloudUrl) {
      throw new Error('ELASTIC_CLOUD_URL environment variable is not set');
    }

    if (!elasticCloudApiKey) {
      throw new Error('ELASTIC_CLOUD_API_KEY environment variable is not set');
    }

    cloudClient = new Client({
      node: elasticCloudUrl,
      auth: {
        apiKey: elasticCloudApiKey,
      },
    });
  }
  return cloudClient;
}

export { getClient as client };
