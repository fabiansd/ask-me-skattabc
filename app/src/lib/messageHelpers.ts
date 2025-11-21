import { ConversationMessage } from '../interface/history';

/**
 * Creates a user message object for immediate display
 * Uses Date.now() as a temporary ID until persisted to database
 */
export function createUserMessage(content: string, conversationId?: number): ConversationMessage {
  return {
    message_id: Date.now(),
    conversation_id: conversationId || 0,
    role: 'user',
    content,
    created_at: new Date(),
  };
}

/**
 * Creates a placeholder assistant message for streaming responses
 * Uses Date.now() + 1 as temporary ID to avoid collision with user message
 */
export function createAssistantPlaceholder(conversationId?: number): ConversationMessage {
  return {
    message_id: Date.now() + 1,
    conversation_id: conversationId || 0,
    role: 'assistant',
    content: '',
    created_at: new Date(),
  };
}
