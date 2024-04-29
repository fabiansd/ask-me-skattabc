// lib/esClient.ts
import { Client } from '@elastic/elasticsearch';


export const client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});
