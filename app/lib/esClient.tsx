// lib/esClient.ts
import { Client } from '@elastic/elasticsearch';


export const client = new Client({
    auth: {
        username: 'elastic',
        password: 'abc',
    },
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});
