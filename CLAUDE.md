# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run debug` - Start development server with Node debugger
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npx prisma db pull` - Update Prisma schema from PostgreSQL database

## Architecture Overview

This is a Next.js application that implements a tax-related Q&A system (SkatteABC) using AI and semantic search. The architecture follows a three-tier approach:

### Core Data Flow
1. **Query Processing**: User queries are received via `/api/query` endpoint
2. **Vector Embedding**: Text is embedded using OpenAI's embedding model
3. **Semantic Search**: Elasticsearch performs vector similarity search against tax document paragraphs
4. **AI Response**: OpenAI generates contextual answers using retrieved paragraphs
5. **Data Persistence**: Query history and user feedback are stored in PostgreSQL

### Key Technology Stack
- **Frontend**: Next.js 14 with React, TailwindCSS, and DaisyUI
- **AI/ML**: OpenAI API (GPT models) via LlamaIndex
- **Search**: Elasticsearch with vector search capabilities
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Fly.io with Docker

### Directory Structure
```
app/
├── api/                    # API routes
│   ├── query/             # Main query endpoint
│   ├── postgres/          # Database operations
│   └── health/            # Health checks
├── src/
│   ├── consumers/         # External service integrations
│   │   ├── openAiConsumer.ts      # OpenAI API wrapper
│   │   ├── esSearchConsumer.ts    # Elasticsearch operations
│   │   └── postgresConsumer.ts    # Database operations
│   ├── service/           # Business logic layer
│   │   ├── chat/          # Query processing service
│   │   ├── feedback/      # User feedback handling
│   │   ├── history/       # Query history management
│   │   └── users/         # User management
│   ├── lib/               # Utility libraries
│   │   ├── promptGenerator.ts     # AI prompt construction
│   │   ├── esClient.ts           # Elasticsearch client
│   │   └── prismaClient.ts       # Database client
│   └── components/        # React components
├── [route]/               # Next.js app router pages
└── globals.css           # Global styles
```

### Database Schema
- `users` - User accounts
- `query_history` - Chat history with questions/answers
- `user_feedback` - User satisfaction and feature requests
- `flyway_schema_history` - Database migration tracking

### Environment Variables Required
- `OPENAI_API_KEY` - OpenAI API access
- `DATABASE_URL` - PostgreSQL connection string
- `ELASTICSEARCH_URL` - Elasticsearch cluster URL
- `ELASTICSEARCH_USER` - Elasticsearch authentication
- `ELASTICSEARCH_PASSWORD` - Elasticsearch authentication

### Deployment Notes
- Uses Fly.io with multi-target Docker builds
- If deployment fails, destroy machines with `flyctl machine remove <id> --force` and redeploy
- Secrets are managed through Fly.io secret management

## Coding Principles

Follow Clean Code principles when implementing features:

- **Start simple and expand**: Begin with minimal viable implementation
- **Single Responsibility**: Each function and class has one clear purpose
- **Meaningful names**: Use intention-revealing names for variables, functions, and classes
- **Small functions**: Keep functions short and focused on one task
- **Clean structure**: Organize code logically and consistently
- **No redundancy**: Don't repeat yourself (DRY principle)
- **Clear intent**: Code should read like well-written prose

## Key Implementation Details

### Query Processing Flow
The main query flow is orchestrated in `app/src/service/chat/queryService.ts:13-36`:
1. Embed user query text
2. Perform vector search against paragraph index
3. Generate AI response with context
4. Store query history

### AI Integration
OpenAI integration supports both detailed and concrete response modes, configured via `isDetailed` flag in query requests. Prompt generation uses tax document context to provide accurate, citation-backed answers.

### Search Implementation
Elasticsearch implements k-NN vector search with configurable index sizes for different document types (SKATT vs SKATT_PARA indices).