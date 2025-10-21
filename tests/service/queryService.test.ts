import query from "@/app/src/service/chat/queryService";
import { QueryChatRequest } from "@/app/src/interface/skattSokInterface";

// Mock all external dependencies
jest.mock("@/app/src/consumers/esSearchConsumer");
jest.mock("@/app/src/consumers/openAiConsumer");
jest.mock("@/app/src/consumers/postgresConsumer");
jest.mock("../mockData");

import { searchMatchSearchVectorKeyword } from "@/app/src/consumers/esSearchConsumer";
import { embedText, queryChat } from "@/app/src/consumers/openAiConsumer";
import { addUserChatHistory } from "@/app/src/consumers/postgresConsumer";
import { getMockQueryResponse } from "../mockData";

const mockSearchMatchSearchVectorKeyword = searchMatchSearchVectorKeyword as jest.MockedFunction<typeof searchMatchSearchVectorKeyword>;
const mockEmbedText = embedText as jest.MockedFunction<typeof embedText>;
const mockQueryChat = queryChat as jest.MockedFunction<typeof queryChat>;
const mockAddUserChatHistory = addUserChatHistory as jest.MockedFunction<typeof addUserChatHistory>;
const mockGetMockQueryResponse = getMockQueryResponse as jest.MockedFunction<typeof getMockQueryResponse>;

describe('queryService', () => {
  const mockRequest: QueryChatRequest = {
    searchText: 'Hva er mva på bil?',
    isDetailed: false,
    username: 'testuser',
    history: [],
    tags: ['mva']
  };

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
        esParagraphSearch: ['Mock ES paragraph']
      };
      mockGetMockQueryResponse.mockReturnValue(mockResponse);
      mockAddUserChatHistory.mockResolvedValue(undefined);

      const result = await query(mockRequest);
      const responseData = await result.json();

      expect(mockGetMockQueryResponse).toHaveBeenCalledTimes(1);
      expect(mockAddUserChatHistory).toHaveBeenCalledWith(mockRequest, mockResponse.openaiResponse);
      expect(responseData).toEqual(mockResponse);
    });

    it('should not call external services when using mock data', async () => {
      const mockResponse = {
        openaiResponse: 'Mock response',
        esParagraphSearch: []
      };
      mockGetMockQueryResponse.mockReturnValue(mockResponse);

      await query(mockRequest);

      expect(mockEmbedText).not.toHaveBeenCalled();
      expect(mockSearchMatchSearchVectorKeyword).not.toHaveBeenCalled();
      expect(mockQueryChat).not.toHaveBeenCalled();
    });
  });

  describe('when USE_MOCK_DATA is false or undefined', () => {
    it('should process query through full pipeline', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockSearchResults = ['ES result 1', 'ES result 2'];
      const mockOpenAiResponse = 'OpenAI response about MVA';

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchMatchSearchVectorKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChat.mockResolvedValue(mockOpenAiResponse);
      mockAddUserChatHistory.mockResolvedValue(undefined);

      const result = await query(mockRequest);
      const responseData = await result.json();

      expect(mockEmbedText).toHaveBeenCalledWith(mockRequest.searchText);
      expect(mockSearchMatchSearchVectorKeyword).toHaveBeenCalledWith(
        mockEmbedding,
        'skatt_chunks_2025', // ELASTICSEARCH_INDEX_SKATT constant
        expect.any(Number),
        mockRequest.tags
      );
      expect(mockQueryChat).toHaveBeenCalledWith(mockRequest, mockSearchResults);
      expect(mockAddUserChatHistory).toHaveBeenCalledWith(mockRequest, mockOpenAiResponse);

      expect(responseData).toEqual({
        openaiResponse: mockOpenAiResponse,
        esParagraphSearch: mockSearchResults
      });
    });

    it('should handle missing tags gracefully', async () => {
      const requestWithoutTags = { ...mockRequest, tags: undefined };
      const mockEmbedding = [0.1, 0.2];
      const mockSearchResults = ['Result'];
      const mockOpenAiResponse = 'Response';

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchMatchSearchVectorKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChat.mockResolvedValue(mockOpenAiResponse);

      await query(requestWithoutTags);

      expect(mockSearchMatchSearchVectorKeyword).toHaveBeenCalledWith(
        mockEmbedding,
        'skatt_chunks_2025',
        expect.any(Number),
        [] // Should default to empty array
      );
    });

    it('should not save history when OpenAI response is falsy', async () => {
      const mockEmbedding = [0.1];
      const mockSearchResults = ['Result'];

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchMatchSearchVectorKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChat.mockResolvedValue(''); // Falsy response

      await query(mockRequest);

      expect(mockAddUserChatHistory).not.toHaveBeenCalled();
    });

    it('should save history when OpenAI response is truthy', async () => {
      const mockEmbedding = [0.1];
      const mockSearchResults = ['Result'];
      const mockOpenAiResponse = 'Valid response';

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchMatchSearchVectorKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChat.mockResolvedValue(mockOpenAiResponse);

      await query(mockRequest);

      expect(mockAddUserChatHistory).toHaveBeenCalledWith(mockRequest, mockOpenAiResponse);
    });
  });

  describe('error handling', () => {
    it('should propagate embedding errors', async () => {
      const error = new Error('Embedding failed');
      mockEmbedText.mockRejectedValue(error);

      await expect(query(mockRequest)).rejects.toThrow('Embedding failed');
    });

    it('should propagate search errors', async () => {
      const mockEmbedding = [0.1];
      const error = new Error('Search failed');

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchMatchSearchVectorKeyword.mockRejectedValue(error);

      await expect(query(mockRequest)).rejects.toThrow('Search failed');
    });

    it('should propagate OpenAI errors', async () => {
      const mockEmbedding = [0.1];
      const mockSearchResults = ['Result'];
      const error = new Error('OpenAI failed');

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchMatchSearchVectorKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChat.mockRejectedValue(error);

      await expect(query(mockRequest)).rejects.toThrow('OpenAI failed');
    });
  });

});