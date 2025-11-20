import { searchVectorAndRRFKeyword } from '@/app/src/consumers/esSearchConsumer';
import { embedText, queryChat } from '@/app/src/consumers/openAiConsumer';
import { addUserChatHistory } from '@/app/src/consumers/postgresConsumer';
import { QueryChatRequest } from '@/app/src/interface/skattSokInterface';
import query from '@/app/src/service/chat/queryService';

// Mock all external dependencies
jest.mock('@/app/src/consumers/esSearchConsumer');
jest.mock('@/app/src/consumers/openAiConsumer');
jest.mock('@/app/src/consumers/postgresConsumer');
jest.mock('../../mockData');

import { getMockQueryResponse } from '../../mockData';

const mockSearchVectorAndRRFKeyword = searchVectorAndRRFKeyword as jest.MockedFunction<
  typeof searchVectorAndRRFKeyword
>;
const mockEmbedText = embedText as jest.MockedFunction<typeof embedText>;
const mockQueryChat = queryChat as jest.MockedFunction<typeof queryChat>;
const mockAddUserChatHistory = addUserChatHistory as jest.MockedFunction<typeof addUserChatHistory>;
const mockGetMockQueryResponse = getMockQueryResponse as jest.MockedFunction<
  typeof getMockQueryResponse
>;

describe('queryService', () => {
  const mockRequest: QueryChatRequest = {
    searchText: 'Hva er mva på bil?',
    isDetailed: false,
    tags: ['mva'],
    conversation_id: 1,
  };

  const mockAuthId = 'testuser';

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.USE_MOCK_DATA;
  });

  describe('when USE_MOCK_DATA is true', () => {
    beforeEach(() => {
      process.env.USE_MOCK_DATA = 'true';
    });

    it('should return mock data and save to history', async () => {
      const mockResponse = {
        openaiResponse: 'Mock OpenAI response',
        conversation_id: 1,
      };
      mockGetMockQueryResponse.mockReturnValue(mockResponse);
      mockAddUserChatHistory.mockResolvedValue(1);

      const result = await query(mockRequest, mockAuthId);

      expect(mockGetMockQueryResponse).toHaveBeenCalledTimes(1);
      expect(mockAddUserChatHistory).toHaveBeenCalledWith(
        mockRequest,
        mockResponse.openaiResponse,
        mockAuthId
      );
      expect(result).toEqual(mockResponse);
    });

    it('should not call external services when using mock data', async () => {
      const mockResponse = {
        openaiResponse: 'Mock response',
        conversation_id: 1,
      };
      mockGetMockQueryResponse.mockReturnValue(mockResponse);

      await query(mockRequest, mockAuthId);

      expect(mockEmbedText).not.toHaveBeenCalled();
      expect(mockSearchVectorAndRRFKeyword).not.toHaveBeenCalled();
      expect(mockQueryChat).not.toHaveBeenCalled();
    });
  });

  describe('when USE_MOCK_DATA is false or undefined', () => {
    it('should process query through full pipeline', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockSearchResults = ['ES result 1', 'ES result 2'];
      const mockOpenAiResponse = 'OpenAI response about MVA';

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChat.mockResolvedValue(mockOpenAiResponse);
      mockAddUserChatHistory.mockResolvedValue(1);

      const result = await query(mockRequest, mockAuthId);

      expect(mockEmbedText).toHaveBeenCalledWith(mockRequest.searchText);
      expect(mockSearchVectorAndRRFKeyword).toHaveBeenCalledWith(
        mockEmbedding,
        'lovdata_semantic_ada3l_251108', // ELASTICSEARCH_INDEX_SKATT constant
        mockRequest.tags,
        mockRequest.searchText
      );
      expect(mockQueryChat).toHaveBeenCalledWith(mockRequest, mockSearchResults, mockAuthId);
      expect(mockAddUserChatHistory).toHaveBeenCalledWith(
        mockRequest,
        mockOpenAiResponse,
        mockAuthId
      );

      expect(result).toEqual({
        openaiResponse: mockOpenAiResponse,
        conversation_id: 1,
      });
    });

    it('should handle missing tags gracefully', async () => {
      const requestWithoutTags = { ...mockRequest, tags: undefined };
      const mockEmbedding = [0.1, 0.2];
      const mockSearchResults = ['Result'];
      const mockOpenAiResponse = 'Response';

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChat.mockResolvedValue(mockOpenAiResponse);

      await query(requestWithoutTags, mockAuthId);

      expect(mockSearchVectorAndRRFKeyword).toHaveBeenCalledWith(
        mockEmbedding,
        'lovdata_semantic_ada3l_251108',
        [], // Should default to empty array
        requestWithoutTags.searchText
      );
    });

    it('should not save history when OpenAI response is falsy', async () => {
      const mockEmbedding = [0.1];
      const mockSearchResults = ['Result'];

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChat.mockResolvedValue(''); // Falsy response

      await query(mockRequest, mockAuthId);

      expect(mockAddUserChatHistory).not.toHaveBeenCalled();
    });

    it('should save history when OpenAI response is truthy', async () => {
      const mockEmbedding = [0.1];
      const mockSearchResults = ['Result'];
      const mockOpenAiResponse = 'Valid response';

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChat.mockResolvedValue(mockOpenAiResponse);

      await query(mockRequest, mockAuthId);

      expect(mockAddUserChatHistory).toHaveBeenCalledWith(
        mockRequest,
        mockOpenAiResponse,
        mockAuthId
      );
    });
  });

  describe('error handling', () => {
    it('should propagate embedding errors', async () => {
      const error = new Error('Embedding failed');
      mockEmbedText.mockRejectedValue(error);

      await expect(query(mockRequest, mockAuthId)).rejects.toThrow('Embedding failed');
    });

    it('should propagate search errors', async () => {
      const mockEmbedding = [0.1];
      const error = new Error('Search failed');

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockRejectedValue(error);

      await expect(query(mockRequest, mockAuthId)).rejects.toThrow('Search failed');
    });

    it('should propagate OpenAI errors', async () => {
      const mockEmbedding = [0.1];
      const mockSearchResults = ['Result'];
      const error = new Error('OpenAI failed');

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChat.mockRejectedValue(error);

      await expect(query(mockRequest, mockAuthId)).rejects.toThrow('OpenAI failed');
    });
  });
});
