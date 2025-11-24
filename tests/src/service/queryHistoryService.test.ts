/**
 * @jest-environment node
 */
import {
  findUserConversationHistory,
  findUserConversations,
} from '@/app/src/consumers/postgresConsumer';
import { ConversationMessage, ConversationsList } from '@/app/src/interface/history';
import {
  getUserConversations,
  getUserConversationHistory,
} from '@/app/src/service/history/historyService';

// Mock the consumers
jest.mock('@/app/src/consumers/postgresConsumer');
jest.mock('@/app/src/consumers/esSearchConsumer');

const mockFindUserConversations = findUserConversations as jest.MockedFunction<
  typeof findUserConversations
>;
const mockFindUserConversationHistory = findUserConversationHistory as jest.MockedFunction<
  typeof findUserConversationHistory
>;

describe('historyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserConversations', () => {
    it('should return user conversations for valid authIdentifier', async () => {
      const mockAuthId = 'testuser';
      const mockConversations: ConversationsList[] = [
        {
          id: 1,
          title: 'MVA på bil',
          lastMessage: 'MVA på bil er 25%',
          timestamp: '2024-01-01T10:00:00Z',
        },
        {
          id: 2,
          title: 'Skattefradrag',
          lastMessage: 'Skattefradrag beregnes...',
          timestamp: '2024-01-01T11:00:00Z',
        },
      ];

      mockFindUserConversations.mockResolvedValue(mockConversations);

      const result = await getUserConversations(mockAuthId);

      expect(mockFindUserConversations).toHaveBeenCalledWith(mockAuthId);
      expect(mockFindUserConversations).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockConversations);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no conversations', async () => {
      const mockAuthId = 'newuser';
      const emptyConversations: ConversationsList[] = [];

      mockFindUserConversations.mockResolvedValue(emptyConversations);

      const result = await getUserConversations(mockAuthId);

      expect(mockFindUserConversations).toHaveBeenCalledWith(mockAuthId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should propagate database errors', async () => {
      const mockAuthId = 'testuser';
      const dbError = new Error('Database connection failed');

      mockFindUserConversations.mockRejectedValue(dbError);

      await expect(getUserConversations(mockAuthId)).rejects.toThrow('Database connection failed');
      expect(mockFindUserConversations).toHaveBeenCalledWith(mockAuthId);
    });
  });

  describe('getUserConversationHistory', () => {
    it('should return conversation messages for valid authIdentifier and conversation_id', async () => {
      const mockAuthId = 'testuser';
      const mockConversationId = 1;
      const mockMessages: ConversationMessage[] = [
        {
          message_id: 1,
          conversation_id: 1,
          role: 'user',
          content: 'Hva er mva på bil?',
          created_at: new Date('2024-01-01T10:00:00Z'),
        },
        {
          message_id: 2,
          conversation_id: 1,
          role: 'assistant',
          content: 'MVA på bil er 25%',
          created_at: new Date('2024-01-01T10:01:00Z'),
        },
      ];

      mockFindUserConversationHistory.mockResolvedValue(mockMessages);

      const result = await getUserConversationHistory(mockAuthId, mockConversationId);

      expect(mockFindUserConversationHistory).toHaveBeenCalledWith(mockAuthId, mockConversationId);
      expect(mockFindUserConversationHistory).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMessages);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when conversation has no messages', async () => {
      const mockAuthId = 'testuser';
      const mockConversationId = 999;
      const emptyMessages: ConversationMessage[] = [];

      mockFindUserConversationHistory.mockResolvedValue(emptyMessages);

      const result = await getUserConversationHistory(mockAuthId, mockConversationId);

      expect(mockFindUserConversationHistory).toHaveBeenCalledWith(mockAuthId, mockConversationId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle different conversation IDs correctly', async () => {
      const mockAuthId = 'testuser';
      const conversationId1 = 1;
      const conversationId2 = 2;

      const conversation1Messages: ConversationMessage[] = [
        {
          message_id: 1,
          conversation_id: 1,
          role: 'user',
          content: 'Conversation 1 question',
          created_at: new Date(),
        },
      ];

      const conversation2Messages: ConversationMessage[] = [
        {
          message_id: 2,
          conversation_id: 2,
          role: 'user',
          content: 'Conversation 2 question',
          created_at: new Date(),
        },
      ];

      // Test conversation 1
      mockFindUserConversationHistory.mockResolvedValueOnce(conversation1Messages);
      const result1 = await getUserConversationHistory(mockAuthId, conversationId1);
      expect(result1).toEqual(conversation1Messages);

      // Test conversation 2
      mockFindUserConversationHistory.mockResolvedValueOnce(conversation2Messages);
      const result2 = await getUserConversationHistory(mockAuthId, conversationId2);
      expect(result2).toEqual(conversation2Messages);

      expect(mockFindUserConversationHistory).toHaveBeenCalledTimes(2);
      expect(mockFindUserConversationHistory).toHaveBeenNthCalledWith(
        1,
        mockAuthId,
        conversationId1
      );
      expect(mockFindUserConversationHistory).toHaveBeenNthCalledWith(
        2,
        mockAuthId,
        conversationId2
      );
    });

    it('should propagate database errors', async () => {
      const mockAuthId = 'testuser';
      const mockConversationId = 1;
      const dbError = new Error('Database connection failed');

      mockFindUserConversationHistory.mockRejectedValue(dbError);

      await expect(getUserConversationHistory(mockAuthId, mockConversationId)).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockFindUserConversationHistory).toHaveBeenCalledWith(mockAuthId, mockConversationId);
    });
  });
});
