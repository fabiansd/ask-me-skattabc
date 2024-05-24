import { Client } from '@elastic/elasticsearch';
import { ELASTIC_USERNAME } from '../constants/esParameters';


export const client = new Client({
    auth: {
        username: ELASTIC_USERNAME || 'elastic',
        password: process.env.ELASTIC_PASSWORD || '',
    },
    node: process.env.ELASTICSEARCH_URL || ''
});
