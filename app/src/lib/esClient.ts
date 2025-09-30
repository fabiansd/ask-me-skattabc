import { Client } from '@elastic/elasticsearch';
import { ELASTIC_USERNAME } from '../constants/esParameters';

let client: Client | null = null;

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
            node: elasticsearchUrl
        });
    }
    return client;
}

export { getClient as client };
