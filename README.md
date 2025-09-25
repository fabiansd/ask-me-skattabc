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

Create `.env` and `.env.local` files with the following variables:

### Required Variables
```bash
# PostgreSQL Database
DATABASE_URL="postgres://username:password@host:port/database"

# Elasticsearch
ELASTICSEARCH_URL="https://your-elasticsearch-instance.com"
ELASTIC_PASSWORD="your-elasticsearch-password"

# OpenAI
OPENAI_API_KEY="sk-proj-your-openai-key"

# Development/Testing
USE_MOCK_DATA=true  # Set to false for production
```

### Environment File Priority
- **Development** (`npm run dev`): `.env.local` → `.env.development` → `.env`
- **Production** (`npm start`): `.env.production.local` → `.env.local` → `.env.production` → `.env`

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

# Deploy

## Issues

The fly deploy command can fail and not be able to update the machines. My workaround is to destroy the machines and let the deploy command set them up anew:

```bash
flyctl machines list
```

Then delete the machines with the ID's

```bash
flyctl machine remove <id> --force
```


