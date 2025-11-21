import { createAssistantPlaceholder, createUserMessage } from '@/app/src/lib/messageHelpers';

describe('messageHelpers', () => {
  describe('createUserMessage', () => {
    it('creates a user message with all required fields', () => {
      const content = 'Test question';
      const conversationId = 123;

      const message = createUserMessage(content, conversationId);

      expect(message).toMatchObject({
        role: 'user',
        content: 'Test question',
        conversation_id: 123,
      });
      expect(message.message_id).toBeGreaterThan(0);
      expect(message.created_at).toBeInstanceOf(Date);
    });

    it('uses 0 as conversation_id when not provided', () => {
      const message = createUserMessage('Test');

      expect(message.conversation_id).toBe(0);
    });

    it('uses Date.now() for temporary message_id', () => {
      const beforeTime = Date.now();
      const message = createUserMessage('Test');
      const afterTime = Date.now();

      expect(message.message_id).toBeGreaterThanOrEqual(beforeTime);
      expect(message.message_id).toBeLessThanOrEqual(afterTime);
    });

    it('preserves content exactly as provided', () => {
      const content = 'Test\nwith\nnewlines';
      const message = createUserMessage(content);

      expect(message.content).toBe(content);
    });
  });

  describe('createAssistantPlaceholder', () => {
    it('creates an assistant message with empty content', () => {
      const conversationId = 456;

      const message = createAssistantPlaceholder(conversationId);

      expect(message).toMatchObject({
        role: 'assistant',
        content: '',
        conversation_id: 456,
      });
      expect(message.message_id).toBeGreaterThan(0);
      expect(message.created_at).toBeInstanceOf(Date);
    });

    it('uses 0 as conversation_id when not provided', () => {
      const message = createAssistantPlaceholder();

      expect(message.conversation_id).toBe(0);
    });

    it('uses Date.now() + 1 for temporary message_id to avoid collision', () => {
      const beforeTime = Date.now();
      const message = createAssistantPlaceholder();
      const afterTime = Date.now();

      // Should be at least Date.now() + 1 at time of creation
      expect(message.message_id).toBeGreaterThan(beforeTime);
      expect(message.message_id).toBeLessThanOrEqual(afterTime + 1);
    });

    it('has message_id greater than user message created at same time', () => {
      const userMessage = createUserMessage('Test');
      const assistantMessage = createAssistantPlaceholder();

      // Assistant message_id should be greater (Date.now() + 1 vs Date.now())
      expect(assistantMessage.message_id).toBeGreaterThanOrEqual(userMessage.message_id);
    });
  });

  describe('ID collision avoidance', () => {
    it('creates different IDs for user and assistant messages created sequentially', () => {
      const userMessage = createUserMessage('User message');
      const assistantMessage = createAssistantPlaceholder();

      expect(userMessage.message_id).not.toBe(assistantMessage.message_id);
      expect(assistantMessage.message_id).toBeGreaterThanOrEqual(userMessage.message_id);
    });
  });
});
