import { Client } from '@elastic/elasticsearch';


const ELASTIC_USERNAME = 'elastic';

export const client = new Client({
    auth: {
        username: ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD || '',
    },
    node: process.env.ELASTICSEARCH_URL || ''
});
