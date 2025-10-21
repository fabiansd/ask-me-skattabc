import { query_history } from '@prisma/client';

import { findUserChatHistory } from '@/app/src/consumers/postgresConsumer';
import getQueryHistory from '@/app/src/service/history/queryHistoryService';

// Mock the postgres consumer
jest.mock('@/app/src/consumers/postgresConsumer');

const mockFindUserChatHistory = findUserChatHistory as jest.MockedFunction<
  typeof findUserChatHistory
>;

describe('queryHistoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQueryHistory', () => {
    it('should return user chat history for valid username', async () => {
      const mockUsername = 'testuser';
      const mockHistoryData: query_history[] = [
        {
          history_id: 1,
          user_id: 123,
          question: 'Hva er mva på bil?',
          answer: 'MVA på bil er 25%',
          feedback: null,
          created_at: new Date('2024-01-01T10:00:00Z'),
        },
        {
          history_id: 2,
          user_id: 123,
          question: 'Hvordan beregne skattefradrag?',
          answer: 'Skattefradrag beregnes...',
          feedback: true,
          created_at: new Date('2024-01-01T11:00:00Z'),
        },
      ];

      mockFindUserChatHistory.mockResolvedValue(mockHistoryData);

      const result = await getQueryHistory(mockUsername);

      expect(mockFindUserChatHistory).toHaveBeenCalledWith(mockUsername);
      expect(mockFindUserChatHistory).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHistoryData);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no history', async () => {
      const mockUsername = 'newuser';
      const emptyHistory: query_history[] = [];

      mockFindUserChatHistory.mockResolvedValue(emptyHistory);

      const result = await getQueryHistory(mockUsername);

      expect(mockFindUserChatHistory).toHaveBeenCalledWith(mockUsername);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle different usernames correctly', async () => {
      const username1 = 'user1';
      const username2 = 'user2';

      const user1History: query_history[] = [
        {
          history_id: 1,
          user_id: 456,
          question: 'User 1 question',
          answer: 'User 1 answer',
          feedback: null,
          created_at: new Date(),
        },
      ];

      const user2History: query_history[] = [
        {
          history_id: 2,
          user_id: 789,
          question: 'User 2 question',
          answer: 'User 2 answer',
          feedback: null,
          created_at: new Date(),
        },
      ];

      // Test user1
      mockFindUserChatHistory.mockResolvedValueOnce(user1History);
      const result1 = await getQueryHistory(username1);
      expect(result1).toEqual(user1History);

      // Test user2
      mockFindUserChatHistory.mockResolvedValueOnce(user2History);
      const result2 = await getQueryHistory(username2);
      expect(result2).toEqual(user2History);

      expect(mockFindUserChatHistory).toHaveBeenCalledTimes(2);
      expect(mockFindUserChatHistory).toHaveBeenNthCalledWith(1, username1);
      expect(mockFindUserChatHistory).toHaveBeenNthCalledWith(2, username2);
    });

    it('should handle usernames with special characters', async () => {
      const specialUsername = 'user@domain.com';
      const mockHistory: query_history[] = [
        {
          history_id: 1,
          user_id: 999,
          question: 'Test question',
          answer: 'Test answer',
          feedback: null,
          created_at: new Date(),
        },
      ];

      mockFindUserChatHistory.mockResolvedValue(mockHistory);

      const result = await getQueryHistory(specialUsername);

      expect(mockFindUserChatHistory).toHaveBeenCalledWith(specialUsername);
      expect(result).toEqual(mockHistory);
    });

    it('should handle empty username gracefully', async () => {
      const emptyUsername = '';
      const emptyHistory: query_history[] = [];

      mockFindUserChatHistory.mockResolvedValue(emptyHistory);

      const result = await getQueryHistory(emptyUsername);

      expect(mockFindUserChatHistory).toHaveBeenCalledWith(emptyUsername);
      expect(result).toEqual([]);
    });

    it('should propagate database errors', async () => {
      const mockUsername = 'testuser';
      const dbError = new Error('Database connection failed');

      mockFindUserChatHistory.mockRejectedValue(dbError);

      await expect(getQueryHistory(mockUsername)).rejects.toThrow('Database connection failed');
      expect(mockFindUserChatHistory).toHaveBeenCalledWith(mockUsername);
    });

    it('should handle null/undefined response from database', async () => {
      const mockUsername = 'testuser';

      // Test null response
      mockFindUserChatHistory.mockResolvedValueOnce(null as any);
      const resultNull = await getQueryHistory(mockUsername);
      expect(resultNull).toBeNull();

      // Test undefined response
      mockFindUserChatHistory.mockResolvedValueOnce(undefined as any);
      const resultUndefined = await getQueryHistory(mockUsername);
      expect(resultUndefined).toBeUndefined();
    });

    it('should maintain data integrity from database response', async () => {
      const mockUsername = 'testuser';
      const complexHistory: query_history[] = [
        {
          history_id: 999,
          user_id: 777,
          question: 'Complex question with æøå characters',
          answer: 'Answer with "quotes" and special chars: § & %',
          feedback: false,
          created_at: new Date('2024-03-15T14:30:45.123Z'),
        },
      ];

      mockFindUserChatHistory.mockResolvedValue(complexHistory);

      const result = await getQueryHistory(mockUsername);

      expect(result).toEqual(complexHistory);
      expect(result[0].question).toBe('Complex question with æøå characters');
      expect(result[0].answer).toBe('Answer with "quotes" and special chars: § & %');
      expect(result[0].feedback).toBe(false);
      expect(result[0].created_at).toEqual(new Date('2024-03-15T14:30:45.123Z'));
    });
  });
});
