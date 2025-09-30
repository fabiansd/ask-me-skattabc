# Elasticsearch Troubleshooting Session - 2025-09-29

## Issue Summary
- **Problem**: Elasticsearch connection timeouts and DNS resolution errors
- **Error**: `getaddrinfo ENOTFOUND elasticsearch-skatteabc-252809.fly.dev`
- **Current Setup**: 1GB shared CPU Fly.io machine

## Diagnosis

### Root Causes Identified:
1. **DNS Resolution Issue**: Local development can't resolve Fly.io hostnames directly
2. **Resource Constraints**: 1GB RAM insufficient for Elasticsearch with vector search
3. **Connection Method**: Need Fly.io proxy for local development

### Performance Issues from Logs:
- Cluster operations taking 97+ seconds (should be milliseconds)
- JVM garbage collection taking 5-9 seconds
- File system health checks taking 7-19 seconds
- Multiple timeout errors for cluster events

## Solutions Attempted

### 1. Environment Configuration
- **File**: `.env.local`
- **Change**: Set `ELASTICSEARCH_URL=http://localhost:9200` for proxy use
- **Commands**: Added Fly.io proxy command to CLAUDE.md

### 2. Proxy Setup
- **Command**: `flyctl proxy 9200:9200 --app elasticsearch-skatteabc-252809`
- **Purpose**: Creates secure tunnel from localhost:9200 to Fly.io Elasticsearch
- **Documentation**: Added to CLAUDE.md development setup

### 3. Resource Scaling (STOPPED - Cost Concern)
- **Attempted**: `flyctl scale memory 2048 --app elasticsearch-skatteabc-252809`
- **Status**: Machine restarted but scaling may not be cost-effective

## Current Status
- Elasticsearch machine is restarting (logs show normal startup)
- Need to verify if current resources can work with optimization
- Alternative: Use mock data for development

## Next Steps
1. **Check if secrets are properly configured**
2. **Test proxy connection once machine is fully started**
3. **Consider optimizing Elasticsearch config before scaling**
4. **Evaluate if mock data is sufficient for development**

## Key Files Modified
- `/Users/fabian.s.dietrichson/Develop/ask-me-skattabc/.env.local`
- `/Users/fabian.s.dietrichson/Develop/ask-me-skattabc/CLAUDE.md`
- `/Users/fabian.s.dietrichson/Develop/ask-me-skattabc/app/src/consumers/esSearchConsumer.ts`

## Commands to Remember
```bash
# Start Elasticsearch proxy
flyctl proxy 9200:9200 --app elasticsearch-skatteabc-252809

# Check app status
flyctl status --app elasticsearch-skatteabc-252809

# View logs
flyctl logs --app elasticsearch-skatteabc-252809

# Check secrets
flyctl secrets list --app elasticsearch-skatteabc-252809
```

## Cost Considerations
- Current setup: 1GB shared CPU (~$5-10/month)
- Scaling to 2GB performance CPU would increase costs significantly
- Consider if development can work with current resources + proxy