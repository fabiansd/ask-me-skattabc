# Streaming Responses Feature

## Overview

Implement real-time streaming for OpenAI responses to improve user experience by showing incremental text generation instead of waiting for complete response.

## Current Implementation Analysis

### Current Flow

1. User submits query → `/api/query` endpoint
2. `queryService.ts` generates complete response via OpenAI
3. Complete response saved to DB via `addUserChatHistory()`
4. Returns `{ openaiResponse, conversation_id }`
5. Frontend saves conversation_id to state
6. `fetchConversationMessages()` fetches all messages from DB
7. Renders conversation from persisted data

### Key Files

- `app/src/service/chat/queryService.ts:39-52` - Main query orchestration
- `app/src/consumers/openAiConsumer.ts:48-87` - OpenAI integration
- `app/page.tsx:132-153` - Frontend query handling
- `app/page.tsx:89-106` - Conversation message fetching
- `app/src/contexts/ConversationContext.tsx` - Conversation state management

## Proposed Solution: Option 1 (Hybrid Approach)

### Strategy

- Stream response to frontend immediately for real-time UX
- Save complete response to DB after streaming completes
- Preserve existing conversation management patterns
- Minimal changes to current architecture

### Implementation Plan

#### 1. Message State Management

**New Message States:**

```typescript
interface ConversationMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  // New fields for streaming
  isPending?: boolean; // Currently being streamed
  isComplete?: boolean; // Streaming finished, saved to DB
  streamError?: string; // Stream failed
  tempId?: string; // Temporary ID before DB save
}
```

**State Management Strategy:**

- Maintain two message arrays: `pendingMessages` + `persistedMessages`
- During streaming: Show pending messages in real-time
- After streaming: Replace pending with persisted via DB fetch
- Handle race conditions between streaming and DB operations

#### 2. Frontend Changes (page.tsx)

**Modified handleButtonClick Flow:**

```typescript
async function handleButtonClick() {
  // 1. Add pending user message immediately
  const tempUserMsg = {
    role: 'user',
    content: searchInput,
    isPending: true,
    tempId: generateTempId(),
  };
  setConversationMessages(prev => [...prev, tempUserMsg]);

  // 2. Add pending assistant message
  const tempAssistantMsg = {
    role: 'assistant',
    content: '',
    isPending: true,
    tempId: generateTempId(),
  };
  setConversationMessages(prev => [...prev, tempAssistantMsg]);

  // 3. Stream response
  const response = await fetch('/api/query', {
    /* existing params */
  });
  const reader = response.body.getReader();
  let streamedContent = '';
  let conversationId = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = new TextDecoder().decode(value);
    if (chunk.startsWith('data: ')) {
      const data = JSON.parse(chunk.substring(6));
      if (data.content) {
        streamedContent += data.content;
        // Update pending message in real-time
        setConversationMessages(prev =>
          prev.map(msg =>
            msg.tempId === tempAssistantMsg.tempId ? { ...msg, content: streamedContent } : msg
          )
        );
      }
      if (data.conversation_id) {
        conversationId = data.conversation_id;
      }
    }
  }

  // 4. Mark streaming complete, save conversation_id
  if (conversationId) {
    setCurrentConversationId(conversationId);
  }

  // 5. Replace pending messages with persisted ones
  refreshConversations();
  fetchConversationMessages();
}
```

#### 3. Backend Changes

**API Route (route.ts) - Streaming Response:**

```typescript
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async req => {
      const queryChatRequest = await req.json();
      const authId = new URL(req.url).searchParams.get('auth_id');

      // Create streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const { textStream, conversationId } = await queryWithStreaming(
              queryChatRequest,
              authId
            );

            // Stream AI response chunks
            for await (const chunk of textStream) {
              controller.enqueue(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }

            // Send final conversation_id
            controller.enqueue(`data: ${JSON.stringify({ conversation_id: conversationId })}\n\n`);
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    },
    'QUERY_API'
  );
}
```

**Query Service Changes:**

```typescript
async function queryWithStreaming(queryChatRequest: QueryChatRequest, authId: string) {
  await validateQueryRequest(queryChatRequest);

  // Generate search context (unchanged)
  const searchVector = await embedText(queryChatRequest.searchText);
  const esChunkSearch = await searchMatchSearchVectorKeyword(/* params */);

  // Stream from OpenAI
  const textStream = await queryChatStreaming(queryChatRequest, esChunkSearch, authId);

  // Collect complete response while streaming
  let completeResponse = '';
  const streamIterator = textStream[Symbol.asyncIterator]();

  const outputStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of streamIterator) {
        completeResponse += chunk;
        controller.enqueue(chunk);
      }

      // Save to DB after streaming completes
      const conversationId = await addUserChatHistory(queryChatRequest, completeResponse, authId);
      controller.close();
      return { conversationId };
    },
  });

  return { textStream: outputStream, conversationId };
}
```

**OpenAI Consumer Changes:**

```typescript
export async function queryChatStreaming(queryChatRequest, context, authId) {
  // Existing setup code unchanged...

  const response = await openai.chat({
    messages: messages,
    stream: true, // Enable streaming
  });

  return response; // Returns async iterator
}
```

## Technical Considerations

### 1. State Synchronization

- **Race Condition**: Stream completion vs DB save vs fetchConversationMessages()
- **Solution**: Use sequence numbers or timestamps to ensure latest data wins
- **Cleanup**: Remove pending messages once persisted messages loaded

### 2. Error Handling

- **Stream Interruption**: Network issues, user navigation
- **Partial Responses**: Save partial content if stream fails midway
- **Retry Logic**: Allow re-attempting failed streams
- **Fallback**: Revert to non-streaming if streaming consistently fails

### 3. UX Considerations

- **Loading States**: Show typing indicator during streaming
- **Message Ordering**: Ensure messages appear in correct sequence
- **Mobile Performance**: Consider chunk size and render frequency
- **Accessibility**: Screen reader support for streaming text
- **Interruption**: Allow user to stop streaming if needed

### 4. Performance Optimization

- **Render Throttling**: Limit UI updates to avoid excessive re-renders
- **Memory Management**: Clean up event listeners and streams
- **Chunk Size**: Optimize balance between responsiveness and performance
- **Caching**: Consider caching complete responses for re-display

### 5. Edge Cases

- **Page Refresh During Stream**: Handle incomplete states gracefully
- **Multiple Concurrent Queries**: Prevent overlapping streams
- **Session Timeout**: Handle auth expiration during long streams
- **Conversation Switching**: Cancel active streams when switching conversations
- **Browser Tab Switching**: Pause/resume streaming based on visibility

## Implementation Steps

### Phase 1: Core Streaming (2-3 hours)

1. Modify `openAiConsumer.ts` to support streaming
2. Update API route to return streaming response
3. Add basic frontend streaming consumption
4. Test end-to-end streaming flow

### Phase 2: State Management (2-3 hours)

1. Extend ConversationMessage interface
2. Implement pending message handling
3. Add stream completion and DB save coordination
4. Handle conversation_id management during streaming

### Phase 3: Error Handling & Polish (2-3 hours)

1. Add comprehensive error handling
2. Implement loading states and UX improvements
3. Add stream interruption capabilities
4. Performance optimization and testing

### Phase 4: Edge Case Handling (1-2 hours)

1. Handle page refresh and navigation during streaming
2. Add concurrent request prevention
3. Memory leak prevention and cleanup
4. Mobile optimization

## Testing Strategy

### Unit Tests

- Stream processing logic
- Message state management
- Error handling scenarios

### Integration Tests

- End-to-end streaming flow
- DB save after stream completion
- Race condition handling

### Manual Testing

- Various network conditions
- Mobile vs desktop experience
- Error scenarios and recovery
- Performance with long responses

## Rollback Plan

### Feature Flag

Implement feature flag to toggle between streaming and non-streaming modes:

```typescript
const USE_STREAMING = process.env.ENABLE_STREAMING === 'true';
```

### Gradual Rollout

1. Deploy with streaming disabled
2. Enable for subset of users
3. Monitor performance and error rates
4. Full rollout or rollback based on metrics

## Success Metrics

### Performance

- Time to first token (TTFT) < 2 seconds
- Complete response time unchanged or improved
- Frontend responsiveness during streaming

### User Experience

- Reduced perceived wait time
- Lower bounce rate during query processing
- Positive user feedback on streaming experience

### Technical

- Stream completion rate > 95%
- Error rate < 2%
- No increase in server resource usage

## Notes for Future Development

### Potential Enhancements

- **Real-time collaboration**: Multiple users viewing same stream
- **Stream caching**: Cache and replay streams for identical queries
- **Progressive enhancement**: Fallback gracefully for non-streaming browsers
- **Advanced UX**: Show reasoning steps during complex queries

### Architecture Considerations

- Consider WebSockets for bi-directional streaming in future
- Evaluate Server-Sent Events (SSE) vs current approach
- Plan for handling very long responses (>10k tokens)
- Consider streaming for search results in addition to AI responses

## Implementation Files to Modify

### Frontend

- `app/page.tsx:132-153` - Main query handling
- `app/src/interface/history.ts` - Message interface extension
- `app/src/components/textManagement/markdownTextDisplay.tsx` - Display pending states

### Backend

- `app/api/query/route.ts` - Add streaming response
- `app/src/service/chat/queryService.ts` - Streaming orchestration
- `app/src/consumers/openAiConsumer.ts` - OpenAI streaming integration

### Supporting

- `app/src/lib/streamUtils.ts` - New utility functions for stream handling
- Add error boundary components for stream error handling
- Update TypeScript types for streaming states

## Risk Assessment

### High Risk

- Race conditions between streaming and DB operations
- Memory leaks from unclosed streams
- Poor mobile performance with frequent re-renders

### Medium Risk

- Browser compatibility with streaming APIs
- Error handling complexity
- User experience during network issues

### Low Risk

- OpenAI API rate limiting (existing issue)
- Deployment complexity (minimal changes)
- Backward compatibility (feature flag mitigates)

## Conclusion

This hybrid approach preserves the existing conversation management architecture while adding real-time streaming capabilities. The implementation is incremental and low-risk, with clear rollback options and comprehensive error handling.

The key insight is maintaining the current DB-centric conversation model while layering streaming as a UX enhancement, rather than a fundamental architectural change.
