# Conversation History Implementation

## Overview

Implementation of conversation and message management tied to users in the SkatteABC application.

## Database Schema Changes

### New Tables Added

**conversations**

- `conversation_id` (PK, auto-increment)
- `user_id` (FK → users.user_id)
- `title` (VARCHAR 255, nullable)
- `created_at` (TIMESTAMP, default now)
- `updated_at` (TIMESTAMP, default now)

**messages**

- `message_id` (PK, auto-increment)
- `conversation_id` (FK → conversations.conversation_id, CASCADE delete)
- `role` (VARCHAR 20: 'user' | 'assistant')
- `content` (TEXT)
- `created_at` (TIMESTAMP, default now)

### Modified Tables

**query_history** (kept for analytics)

- Added `conversation_id` (FK → conversations.conversation_id, nullable, SET NULL on delete)

**users**

- Added relation: `conversations conversations[]`

## Implementation Status

### ✅ Completed

1. **Prisma Schema Updated** - All new tables and relations defined
2. **Database Migration** - `npx prisma db push` completed successfully
3. **QueryChatRequest Interface** - Added `conversation_id?: number` field
4. **addUserChatHistory Function** - Modified to:
   - Create new conversation if `conversation_id` is null
   - Add user message and assistant response to messages table
   - Maintain legacy query_history for analytics
   - Return conversation_id
5. **findUserConversationHistory Function** - Retrieves conversation messages for AI context
6. **AI Context Integration** - queryChat fetches and uses conversation history in prompts
7. **Frontend Conversation Management** - Full UI integration with sidebar

### ✅ Frontend Implementation

1. **ConversationContext** - React Context for state management across components
2. **ConversationSidebar Component** - Collapsible sidebar with conversation list
3. **ChatLayout Component** - Responsive layout wrapper for main page
4. **Main Page Integration** - Conversation state connected to query system
5. **UI Improvements**:
   - Removed redundant "Nytt emne" button
   - "Ny samtale" button replaces old functionality
   - Dynamic button text: "Nytt spørsmål" vs "Oppfølgingsspørsmål"
   - Collapsible sidebar with arrow toggle
   - Mobile-responsive design

### 🔄 In Progress

1. **API Endpoints for Conversation Management** - List conversations, fetch specific conversation

### ⏳ Pending

1. **Real Data Integration** - Replace dummy conversations with actual user conversations
2. **Conversation Management Features** - Delete conversations, rename conversations

## Current Data Flow

### Query Processing

1. Frontend sends `QueryChatRequest` with optional `conversation_id`
2. `addUserChatHistory` function:
   - If no `conversation_id`: creates new conversation with question as title
   - If `conversation_id` exists: adds to existing conversation
   - Saves user message (role: 'user')
   - Saves AI response (role: 'assistant')
   - Saves to legacy query_history for analytics
   - Returns `conversation_id`

### Security Model

- Frontend uses NextAuth session: `getUserId(session)` → username/auth identifier
- Backend resolves username to actual `user_id` via database lookup
- All conversation access verified by `user_id` to prevent cross-user access

## Next Function to Implement

```typescript
export async function findUserConversationHistory(
  username: string,
  conversation_id: number
): Promise<messages[]> {
  // 1. Resolve username to user record
  // 2. Query messages WHERE conversation belongs to user AND conversation_id matches
  // 3. ORDER BY created_at ASC for chronological context
  // 4. Return messages array for AI context
}
```

## Component Architecture

### Frontend Structure

```
Search()
├── ConversationProvider (Context state)
└── ChatLayout (Sidebar + Main area)
    ├── ConversationSidebar (Conversation list + New conversation)
    └── SearchContent (Original search interface)
```

### Key Components

- **ConversationProvider**: Manages `currentConversationId` state across app
- **ChatLayout**: Parent container managing layout and sidebar state
  - Controls sidebar visibility (`sidebarOpen` state)
  - Handles responsive behavior (mobile/desktop)
  - Bridges conversation context to sidebar
  - Manages hamburger menu for mobile
- **ConversationSidebar**: Child component rendering sidebar content
  - Receives visibility props from ChatLayout
  - Contains "Ny samtale" button and collapse arrow
  - Displays conversation list with active highlighting
  - Handles user interactions (select conversation, new conversation, toggle)
- **SearchContent**: Main search interface, connected to conversation context

### Component Data Flow

```
ChatLayout (Parent)
├── State: sidebarOpen, toggleSidebar()
├── Props to ConversationSidebar:
│   ├── isOpen={sidebarOpen}
│   ├── onToggle={toggleSidebar}
│   ├── currentConversationId (from context)
│   └── conversation handlers (bridged to context)
└── ConversationSidebar (Child)
    ├── Renders: conversation list, buttons
    ├── Calls: onToggle() to collapse sidebar
    └── Calls: conversation handlers for state changes
```

## Integration Points

### Current Usage

- `QueryChatRequest.conversation_id`: Sent from frontend context to backend
- `addUserChatHistory`: Returns conversation_id for frontend tracking
- `findUserConversationHistory`: Fetches messages for AI context
- Security: All functions verify user ownership before data access
- Context Management: React Context shares conversation state across components

### AI Context Flow

1. Frontend sends `conversation_id` in query request
2. Backend fetches conversation messages via `findUserConversationHistory`
3. Messages passed to prompt generation as "Tidligere spørsmål og svar"
4. AI receives full conversation context for context-aware responses

### UI Flow

1. User clicks "Ny samtale" → `currentConversationId = null`
2. Query button shows "Nytt spørsmål"
3. Backend creates new conversation, returns ID
4. Frontend tracks new conversation ID
5. Follow-up questions use conversation ID for context
