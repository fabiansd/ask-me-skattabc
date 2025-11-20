# Feature: Sources Sidebar ("Kilder")

## Status

**Planned** - Ready for implementation

## Objective

Display retrieved Elasticsearch documents used as context for each AI response in an interactive sidebar, providing transparency and allowing users to verify sources.

## User Experience

### Trigger

- Small "Kilder" tag/badge displayed on each assistant message
- Shows document count (e.g., "Kilder (5)")
- Clicking opens the sources sidebar

### Sidebar Behavior

- **Width**: 80% of screen width
- **Direction**: Slides in from left to right
- **Overlay**: Semi-transparent backdrop, clicking closes sidebar
- **Animation**: Smooth slide-in transition
- **Close button**: X button in top-right corner

### Content Display

- **Paginated view**: One document at a time
- **Navigation**: Previous/Next buttons
- **Position indicator**: "Document 2 of 5"
- **Scrollable**: Long documents scroll within the sidebar

### Document Information Shown

- **Title**: Document title from ES metadata
- **Section**: Section/category from ES metadata
- **Full text**: Complete document content used in context
- **Metadata**: Department, document ID, any other relevant fields

## Technical Implementation

### Database Schema

**No migration needed** - Use existing `messages.tags` field

```prisma
model messages {
  message_id      Int           @id @default(autoincrement())
  conversation_id Int
  role            String        @db.VarChar(20)
  content         String
  tags            String[]      // Store ES document IDs here
  created_at      DateTime      @default(now()) @db.Timestamp(6)
  // ...
}
```

Example tags value: `["doc_123", "doc_456", "doc_789"]`

### Backend Changes

#### 1. Update `queryService.ts`

Store ES document IDs when saving assistant messages:

```typescript
async function query(queryChatRequest: QueryChatRequest, authId: string) {
  await validateQueryRequest(queryChatRequest);

  const searchVector = await embedText(queryChatRequest.searchText);
  const esResults = await searchVectorAndRRFKeyword(...);

  // Extract document IDs from ES results
  const documentIds = esResults.map(doc => doc._id || doc.id);

  const openaiResponse = await queryChat(queryChatRequest, esResults, authId);

  if (openaiResponse) {
    conversation_id = await addUserChatHistory(
      queryChatRequest,
      openaiResponse,
      authId,
      documentIds  // Pass doc IDs to be stored in tags
    );
  }

  return { openaiResponse, conversation_id };
}
```

#### 2. Update `addUserChatHistory()` in `postgresConsumer.ts`

Store document IDs in the tags field:

```typescript
export async function addUserChatHistory(
  queryChatRequest: QueryChatRequest,
  openaiResponse: string,
  authId: string,
  documentIds?: string[] // New parameter
): Promise<number> {
  // Store assistant message with document IDs in tags
  await prisma.messages.create({
    data: {
      conversation_id: conversationId,
      role: 'assistant',
      content: openaiResponse,
      tags: documentIds || [], // Store ES doc IDs
    },
  });
}
```

#### 3. New API Endpoint: `GET /api/messages/[messageId]/sources`

```typescript
// app/api/messages/[messageId]/sources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/src/lib/prismaClient';
import { fetchSourceDocuments } from '@/app/src/consumers/esSearchConsumer';

export async function GET(request: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const messageId = parseInt(params.messageId);

    // Fetch message with document IDs from tags
    const message = await prisma.messages.findUnique({
      where: { message_id: messageId },
      select: { tags: true },
    });

    if (!message || !message.tags.length) {
      return NextResponse.json({ sources: [] });
    }

    // Fetch full documents from Elasticsearch
    const sources = await fetchSourceDocuments(message.tags);

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}
```

#### 4. New Function in `esSearchConsumer.ts`

```typescript
export async function fetchSourceDocuments(docIds: string[]) {
  try {
    const client = getCloudClient();

    const response = await client.mget({
      index: ELASTICSEARCH_INDEX_SKATT,
      body: {
        ids: docIds,
      },
    });

    // Extract and format source documents
    return response.docs
      .filter(doc => doc.found)
      .map(doc => ({
        id: doc._id,
        title: doc._source.title,
        section: doc._source.section_name || doc._source.department,
        content: doc._source.content,
        department: doc._source.department,
        metadata: {
          // Include any other relevant metadata
        },
      }));
  } catch (error) {
    console.error('❌ Error fetching source documents:', error);
    throw error;
  }
}
```

### Frontend Changes

#### 1. Kilder Tag Component

```typescript
// components/KilderTag.tsx
interface KilderTagProps {
  messageId: number;
  documentCount: number;
  onOpen: () => void;
}

export function KilderTag({ messageId, documentCount, onOpen }: KilderTagProps) {
  return (
    <button
      onClick={onOpen}
      className="badge badge-outline badge-sm"
    >
      Kilder ({documentCount})
    </button>
  );
}
```

#### 2. Sources Sidebar Component

```typescript
// components/SourcesSidebar.tsx
interface SourcesSidebarProps {
  messageId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function SourcesSidebar({ messageId, isOpen, onClose }: SourcesSidebarProps) {
  const [sources, setSources] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !sources.length) {
      fetchSources();
    }
  }, [isOpen]);

  async function fetchSources() {
    setLoading(true);
    const response = await fetch(`/api/messages/${messageId}/sources`);
    const data = await response.json();
    setSources(data.sources);
    setLoading(false);
  }

  const currentDoc = sources[currentIndex];

  return (
    <div className={`sources-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Overlay */}
      <div className="overlay" onClick={onClose} />

      {/* Sidebar content */}
      <div className="sidebar-content">
        <button className="close-btn" onClick={onClose}>×</button>

        {loading ? (
          <div>Loading sources...</div>
        ) : (
          <>
            <div className="document-header">
              <h2>{currentDoc?.title}</h2>
              <p className="section">{currentDoc?.section}</p>
              <p className="position">
                Document {currentIndex + 1} of {sources.length}
              </p>
            </div>

            <div className="document-content">
              {currentDoc?.content}
            </div>

            <div className="navigation">
              <button
                onClick={() => setCurrentIndex(i => i - 1)}
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentIndex(i => i + 1)}
                disabled={currentIndex === sources.length - 1}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

#### 3. Styling (CSS/Tailwind)

```css
.sources-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.sources-sidebar.open {
  pointer-events: auto;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

.sources-sidebar.open .overlay {
  opacity: 1;
}

.sidebar-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 80%;
  height: 100%;
  background: white;
  transform: translateX(-100%);
  transition: transform 0.3s;
  overflow-y: auto;
  padding: 2rem;
}

.sources-sidebar.open .sidebar-content {
  transform: translateX(0);
}
```

## Benefits

### Transparency

- Users see exactly which documents informed the AI response
- Builds trust in AI-generated answers

### Verification

- Users can validate AI answers against source material
- Reduces misinformation concerns

### Learning

- Users can explore related tax law documents
- Encourages deeper understanding

### Efficiency

- **No database bloat**: Full document text stays in Elasticsearch
- Lazy loading: Only fetch sources when user opens sidebar
- Caching: Can cache fetched sources per message

## Implementation Checklist

- [ ] Backend: Update `queryService.ts` to extract document IDs
- [ ] Backend: Update `addUserChatHistory()` to accept and store doc IDs
- [ ] Backend: Create `fetchSourceDocuments()` function
- [ ] Backend: Create `/api/messages/[messageId]/sources` endpoint
- [ ] Frontend: Create `KilderTag` component
- [ ] Frontend: Create `SourcesSidebar` component
- [ ] Frontend: Add sidebar state management to chat interface
- [ ] Frontend: Style sidebar and overlay
- [ ] Testing: Test with various document counts (1, 5, 25)
- [ ] Testing: Test loading states and error handling
- [ ] Testing: Test on mobile (adjust width for smaller screens)

## Future Enhancements

- Search within sources
- Highlight relevant passages that matched the query
- Link to full document on Lovdata website
- Export sources as PDF or text file
- Keyboard navigation (arrow keys to change documents)
