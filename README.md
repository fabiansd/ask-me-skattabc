# SkatteABC - Tax Q&A System

This is a Next.js application that provides AI-powered answers to Norwegian tax questions using semantic search and OpenAI integration.

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, DaisyUI
- **AI/ML**: OpenAI API (GPT models) via LlamaIndex
- **Search**: Elasticsearch with vector search capabilities
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Fly.io with Docker

## Environment Variables

The `.env` file contains default local development values:

```bash
# Local database (automatically started with npm run dev)
DATABASE_URL="postgresql://postgres:devpassword@localhost:5433/ask_me_skattabc_dev"

# Elasticsearch (requires proxy to Fly.io)
ELASTICSEARCH_URL="http://localhost:9200"

# Placeholder values (override in .env.local with real keys)
ELASTIC_PASSWORD="devpassword"
OPENAI_API_KEY="your-openai-key-here"
USE_MOCK_DATA=false
```

Create `.env.local` for real API credentials:

```bash
# Real credentials (never commit this file)
ELASTIC_PASSWORD="your-real-elastic-password"
OPENAI_API_KEY="sk-proj-your-real-openai-key"
```

## Local Development Setup

### Quick Start
```bash
# Clone and install
git clone <repo>
npm install

# Start everything (database + app)
npm run dev
```

### What This Does
- Starts local PostgreSQL with Podman/Docker
- Runs Prisma migrations + loads test data
- Starts Next.js app on http://localhost:3000
- Press Ctrl+C to stop everything

### Requirements
**Container Runtime (choose one):**

**Option A: Podman (recommended for company Macs)**
```bash
brew install podman
podman machine init && podman machine start
```

**Option B: Docker**
```bash
# Install Docker Desktop or via Homebrew
```

**Elasticsearch Connection:**
```bash
# Start proxy to Fly.io Elasticsearch (in separate terminal)
flyctl proxy 9200:9200 --app elasticsearch-llm-spring-glitter-3589
```

**API Keys:**
Add real credentials to `.env.local` (see Environment Variables above)

### Manual Commands
```bash
npm run dev:db:setup  # Setup database only
npm run dev:app       # Start app only
npm run dev:db:stop   # Stop database
```

### Environment Files
- `.env` - Default local values (committed)
- `.env.local` - Override with real API keys (never committed)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Commands

- `npm run dev` - Start development server
- `npm run debug` - Start development server with Node debugger
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npx prisma db pull` - Update Prisma schema from PostgreSQL database

## User Manual

### Main Interface Features

#### Question Input
- **Text Field**: Enter your tax-related question in Norwegian
- **Enter Key**: Press Enter to submit your question

#### Response Mode Toggle
- **Konkret**: Provides brief, direct answers
- **Detaljert**: Provides detailed, elaborate explanations with more context

#### Action Buttons
- **Nytt spørsmål**: Starts a new question (clears conversation history cache)
- **Oppfølgingsspørsmål**: Asks a follow-up question (includes previous conversation context)

#### History Management
- **History Dropdown**: View and select from previous questions
- **Clear History**: Delete all stored conversation history from local storage

### How It Works
1. Type your tax question in the input field
2. Choose response style (Konkret/Detaljert)
3. Click "Nytt spørsmål" for new topics or "Oppfølgingsspørsmål" for follow-ups
4. View AI response with relevant tax law paragraphs below

## Architecture

### Query Processing Flow
The main query flow is orchestrated through these steps:
1. **User Query**: Text input received via `/api/query` endpoint
2. **Vector Embedding**: Text is embedded using OpenAI's embedding model
3. **Semantic Search**: Elasticsearch performs vector similarity search against tax document paragraphs
4. **AI Response**: OpenAI generates contextual answers using retrieved paragraphs
5. **Data Persistence**: Query history and user feedback are stored in PostgreSQL

### Data Flow
1. **Question Input**: User submits tax question via frontend
2. **Text Embedding**: Question is converted to vector embedding using OpenAI
3. **Semantic Search**: Vector similarity search performed against Elasticsearch database
4. **Document Retrieval**: Relevant tax law paragraphs retrieved from SkatteABC corpus
5. **AI Response**: OpenAI generates contextual answer using retrieved documents
6. **Storage**: Question history and user feedback stored in PostgreSQL
7. **Frontend Display**: Response and relevant paragraphs displayed to user

### Database Schema
- **PostgreSQL**: Stores user accounts, query history, and user feedback
- **Elasticsearch**: Contains indexed SkatteABC tax documents with vector embeddings
- **Local Storage**: Temporary conversation history for follow-up questions

# Database (postgres)

In order to update the prisma schema of the postgres database run 

```bash
npx prisma db pull
```

## Fly.io Deployment

### Multi-App Deployment (from root directory)

**Deploy Main Application:**
```bash
flyctl deploy --remote-only
```

**Deploy Elasticsearch Service:**
```bash
flyctl deploy --config elasticsearch/fly.toml --dockerfile elasticsearch/Dockerfile --remote-only
```

### Monorepo Structure

This project uses a multi-app structure where each service has its own Fly.io configuration:

```
ask-me-skattabc/
├── fly.toml                    # Main Next.js application
├── Dockerfile                  # Main app Dockerfile
└── elasticsearch/
    ├── fly.toml               # ES app config
    └── Dockerfile             # ES 8.12.2 with data
```

**Key Benefits:**
- Deploy any service from root directory using `--config` and `--dockerfile` flags
- Each service maintains independent configuration and versioning
- No need to navigate between directories during deployment
- Supports multiple environments (staging, production) per service

### Deployment Issues

The fly deploy command can fail and not be able to update the machines. My workaround is to destroy the machines and let the deploy command set them up anew:

```bash
flyctl machines list
```

Then delete the machines with the ID's

```bash
flyctl machine remove <id> --force
```


