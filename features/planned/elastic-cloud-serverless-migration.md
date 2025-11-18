# Elastic Cloud Serverless Migration

**Status**: Planlagt
**Prioritet**: Medium
**Estimat**: 2-4 timer

## Bakgrunn

Flytte fra self-hosted Elasticsearch på Fly.io til Elastic Cloud Serverless for:

- **Kostbesparelse**: $86/måned → $1.50/måned for lav trafikk
- **RRF support**: Reciprocal Rank Fusion for bedre søkeresultater
- **Auto-scaling**: Betaler kun for det vi bruker
- **Ingen vedlikehold**: Managed service

## Tekniske detaljer

### Nåværende setup

- **ES Index**: `lovdata_semantic_ada3l_251108`
- **Embedding model**: `text-embedding-3-large`
- **Documents**: ~5GB
- **Fly.io app**: `elasticsearch-llm-spring-glitter-3589`

### Ny arkitektur

- **Elastic Cloud Serverless**
- **Same index name** for minimal code changes
- **Cloud ID + API Key** authentication
- **RRF enabled** for better hybrid search

## Implementasjonsplan

### Fase 1: Setup (30 min)

1. Opprett Elastic Cloud account
2. Setup Serverless Search project
3. Get Cloud ID og API Key
4. Test connection fra local

### Fase 2: Data Migration (30 min)

```bash
# Export data fra nåværende ES
curl -X GET "localhost:9200/lovdata_semantic_ada3l_251108/_search?scroll=5m&size=1000" > es_backup.json

# Import til Elastic Cloud
curl -X POST "https://cluster.elastic.cloud:443/_bulk" \
  -H "Authorization: ApiKey YOUR_API_KEY" \
  --data-binary @es_backup.json
```

### Fase 3: Kodeendringer (30 min)

**app/src/lib/esClient.ts**:

```typescript
import { Client } from '@elastic/elasticsearch';

export function getClient() {
  if (process.env.ELASTICSEARCH_CLOUD_ID) {
    // Serverless setup
    return new Client({
      cloud: {
        id: process.env.ELASTICSEARCH_CLOUD_ID,
      },
      auth: {
        apiKey: process.env.ELASTICSEARCH_API_KEY,
      },
    });
  }

  // Fallback til lokal setup
  return new Client({
    node: process.env.ELASTICSEARCH_URL,
    auth: {
      username: 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
  });
}
```

**Environment variables**:

```bash
ELASTICSEARCH_CLOUD_ID="your-cloud-id"
ELASTICSEARCH_API_KEY="your-api-key"
```

### Fase 4: RRF Aktivering (30 min)

**app/src/consumers/esSearchConsumer.ts**:

```typescript
const esResponse = await client.search({
  index: index,
  retriever: {
    rrf: {
      retrievers: [
        {
          knn: {
            field: 'embedding',
            query_vector: searchVector,
            k: ES_KNN_K,
            num_candidates: ES_KNN_NUM_CANDIDATES,
          },
        },
        {
          standard: {
            query: {
              bool: {
                should: [{ match: { content: userQuery } }, ...keywordQueries],
              },
            },
          },
        },
      ],
      rank_constant: 60,
    },
  },
});
```

### Fase 5: Testing & Deploy (30 min)

1. Test lokalt mot Elastic Cloud
2. Deploy til Fly.io med nye env vars
3. Verifiser søkefunksjonalitet
4. Monitor performance

## Kostanalyse

### Før (Fly.io)

- **Performance-2x (8GB)**: $85/måned
- **Storage**: $1/måned
- **Total**: $86/måned

### Etter (Elastic Serverless)

- **50 brukere/måned**: $1.50/måned
- **500 brukere/måned**: $15/måned
- **1000 brukere/måned**: $30/måned

**Break-even**: Ved ~3000 brukere/måned

## Risiko og mitigering

**Risiko**: Data tap under migration
**Mitigering**: Full backup før migration, gradvis cutover

**Risiko**: Økte kostnader ved høy trafikk
**Mitigering**: Monitoring og alerts på usage

**Risiko**: API endringer
**Mitigering**: Gradvis migration, fallback til Fly.io

## Rollback Plan

1. Behold Fly.io ES i 2 uker etter migration
2. Switch tilbake ved å endre env vars
3. Reimport data hvis nødvendig

## Success Metrics

- [ ] RRF fungerer (bedre relevance)
- [ ] Response time < 2 sekunder
- [ ] Kostnad < $20/måned første 6 måneder
- [ ] Zero downtime migration

## Neste steg

1. **Research**: Test Elastic Cloud gratis tier
2. **Backup**: Export full ES data
3. **Timeline**: Sett migrasjonshelg
4. **Kommunikasjon**: Varsle brukere om kort downtime
