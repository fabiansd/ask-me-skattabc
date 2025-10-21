# SkatteABC - Tax Q&A System

This is a Next.js application that provides AI-powered answers to Norwegian tax questions using semantic search and OpenAI integration.

## Tech Stack

- **App**: Next.js 14, React, TailwindCSS, DaisyUI
- **AI/ML**: OpenAI API (GPT models)
- **Search**: Elasticsearch with vector search
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Fly.io with Docker

## Environment Variables

### Required for Local Development

Create `.env.local` with real credentials:

```bash
# Database (use Fly.io proxy)
DATABASE_URL="postgres://postgres:YOUR_PASSWORD@localhost:5432/ask_me_skattabc_young_violet_4122"

# Elasticsearch (use Fly.io proxy)
ELASTICSEARCH_URL="http://localhost:9200"
ELASTIC_PASSWORD="YOUR_ELASTIC_PASSWORD"

# AI Integration
OPENAI_API_KEY="sk-proj-YOUR_OPENAI_KEY"

# Authentication
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
NEXTAUTH_URL="http://localhost:3000"
```

### Default Values in `.env`

The `.env` file contains safe defaults for local development:

```bash
# Local database (auto-started with npm run dev)
DATABASE_URL="postgresql://postgres:devpassword@localhost:5433/ask_me_skattabc_dev"

# Elasticsearch proxy endpoint
ELASTICSEARCH_URL="http://localhost:9200"

# Placeholder values (override in .env.local)
ELASTIC_PASSWORD="devpassword"
OPENAI_API_KEY="your-openai-key-here"
USE_MOCK_DATA=false
```

### Fly.io Proxy Setup

For full functionality, start these proxies before `npm run dev`:

```bash
# Terminal 1: Elasticsearch proxy
flyctl proxy 9200:9200 --app elasticsearch-llm-spring-glitter-3589

# Terminal 2: PostgreSQL proxy (Not needed when running local db)
flyctl proxy 5432:5432 --app skatt-abc-db
```

## Local Development Setup

### Quick Start
```bash
# Clone and install
git clone <repo>
npm install

# Start podman machine (required for database)
podman machine start

# Start everything (database + app)
npm run dev
```

### What This Does
- Starts local PostgreSQL with Podman/Docker
- Runs Prisma migrations + loads test data
- Starts Next.js app on http://localhost:3000
- Press Ctrl+C to stop everything


## Fly.io Deployment

### Deploy Main Application
```bash
flyctl deploy --remote-only
```

### Deploy Elasticsearch Service
```bash
flyctl deploy --config elasticsearch/fly.toml --dockerfile elasticsearch/Dockerfile --remote-only
```

### Deployment Issues

If deploy fails, destroy machines and redeploy:

```bash
flyctl machines list
flyctl machine remove <id> --force
```

## Architecture

### Query Processing Flow
1. **User Query**: Text input received via `/api/query` endpoint
2. **Vector Embedding**: Text is embedded using OpenAI's embedding model
3. **Semantic Search**: Elasticsearch performs vector similarity search against tax document paragraphs
4. **AI Response**: OpenAI generates contextual answers using retrieved paragraphs
5. **Data Persistence**: Query history and user feedback are stored in PostgreSQL

### Database Schema
- **PostgreSQL**: Stores user accounts, query history, and user feedback
- **Elasticsearch**: Contains indexed SkatteABC tax documents with vector embeddings
- **Local Storage**: Temporary conversation history for follow-up questions