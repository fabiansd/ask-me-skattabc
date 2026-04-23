/**
 * @jest-environment node
 */
import { searchVectorAndRRFKeyword } from '@/app/src/consumers/esSearchConsumer';
import { embedText, queryChatStream } from '@/app/src/consumers/openAiConsumer';
import { addUserChatHistory } from '@/app/src/consumers/postgresConsumer';
import { QueryChatRequest } from '@/app/src/interface/skattSokInterface';
import { queryStream } from '@/app/src/service/chat/queryService';

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
const mockQueryChatStream = queryChatStream as jest.MockedFunction<typeof queryChatStream>;
const mockAddUserChatHistory = addUserChatHistory as jest.MockedFunction<typeof addUserChatHistory>;
const mockGetMockQueryResponse = getMockQueryResponse as jest.MockedFunction<
  typeof getMockQueryResponse
>;

// Helper function to collect all chunks from AsyncGenerator
async function collectStreamChunks(generator: AsyncGenerator<string>): Promise<string[]> {
  const chunks: string[] = [];
  for await (const chunk of generator) {
    chunks.push(chunk);
  }
  return chunks;
}

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
        sourceIndex: 'mock_skatt_para',
        sourceDocumentIds: ['mock-1', 'mock-2'],
      };
      mockGetMockQueryResponse.mockReturnValue(mockResponse);
      mockAddUserChatHistory.mockResolvedValue(1);

      const chunks = await collectStreamChunks(queryStream(mockRequest, mockAuthId));

      expect(mockGetMockQueryResponse).toHaveBeenCalledTimes(1);
      expect(mockAddUserChatHistory).toHaveBeenCalledWith(
        mockRequest,
        mockResponse.openaiResponse,
        mockAuthId,
        mockResponse.sourceIndex,
        mockResponse.sourceDocumentIds
      );
      expect(chunks).toContain(mockResponse.openaiResponse);
      expect(chunks).toContain(JSON.stringify({ conversation_id: 1 }));
    });

    it('should not call external services when using mock data', async () => {
      const mockResponse = {
        openaiResponse: 'Mock response',
        conversation_id: 1,
        sourceIndex: 'mock_skatt_para',
        sourceDocumentIds: ['mock-1'],
      };
      mockGetMockQueryResponse.mockReturnValue(mockResponse);
      mockAddUserChatHistory.mockResolvedValue(1);

      await collectStreamChunks(queryStream(mockRequest, mockAuthId));

      expect(mockEmbedText).not.toHaveBeenCalled();
      expect(mockSearchVectorAndRRFKeyword).not.toHaveBeenCalled();
      expect(mockQueryChatStream).not.toHaveBeenCalled();
    });
  });

  describe('when USE_MOCK_DATA is false or undefined', () => {
    it('should process query through full pipeline', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockSearchResults = [
        { _id: 'doc1', _index: 'lovdata_semantic_ada3l_251108', content: 'ES result 1' },
        { _id: 'doc2', _index: 'lovdata_semantic_ada3l_251108', content: 'ES result 2' },
      ];
      const mockStreamChunks = ['OpenAI ', 'response ', 'about ', 'MVA'];

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChatStream.mockImplementation(async function* () {
        for (const chunk of mockStreamChunks) {
          yield chunk;
        }
      });
      mockAddUserChatHistory.mockResolvedValue(1);

      const chunks = await collectStreamChunks(queryStream(mockRequest, mockAuthId));

      expect(mockEmbedText).toHaveBeenCalledWith(mockRequest.searchText);
      expect(mockSearchVectorAndRRFKeyword).toHaveBeenCalledWith(
        mockEmbedding,
        'lovdata_semantic_ada3l_251108', // ELASTICSEARCH_INDEX_SKATT constant
        mockRequest.tags,
        mockRequest.searchText
      );
      expect(mockQueryChatStream).toHaveBeenCalledWith(
        mockRequest,
        ['ES result 1', 'ES result 2'],
        mockAuthId
      );

      const fullResponse = mockStreamChunks.join('');
      expect(mockAddUserChatHistory).toHaveBeenCalledWith(
        mockRequest,
        fullResponse,
        mockAuthId,
        'lovdata_semantic_ada3l_251108',
        ['doc1', 'doc2']
      );

      expect(chunks).toEqual([...mockStreamChunks, JSON.stringify({ conversation_id: 1 })]);
    });

    it('should handle missing tags gracefully', async () => {
      const requestWithoutTags = { ...mockRequest, tags: undefined };
      const mockEmbedding = [0.1, 0.2];
      const mockSearchResults = [
        { _id: 'doc1', _index: 'lovdata_semantic_ada3l_251108', content: 'Result' },
      ];

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChatStream.mockImplementation(async function* () {
        yield 'Response';
      });
      mockAddUserChatHistory.mockResolvedValue(1);

      await collectStreamChunks(queryStream(requestWithoutTags, mockAuthId));

      expect(mockSearchVectorAndRRFKeyword).toHaveBeenCalledWith(
        mockEmbedding,
        'lovdata_semantic_ada3l_251108',
        [], // Should default to empty array
        requestWithoutTags.searchText
      );
    });

    it('should not save history when OpenAI response is falsy', async () => {
      const mockEmbedding = [0.1];
      const mockSearchResults = [
        { _id: 'doc1', _index: 'lovdata_semantic_ada3l_251108', content: 'Result' },
      ];

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChatStream.mockImplementation(async function* () {
        // Empty stream - no chunks yielded
      });

      await collectStreamChunks(queryStream(mockRequest, mockAuthId));

      expect(mockAddUserChatHistory).not.toHaveBeenCalled();
    });

    it('should save history when OpenAI response is truthy', async () => {
      const mockEmbedding = [0.1];
      const mockSearchResults = [
        { _id: 'doc1', _index: 'lovdata_semantic_ada3l_251108', content: 'Result' },
      ];
      const mockOpenAiResponse = 'Valid response';

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChatStream.mockImplementation(async function* () {
        yield mockOpenAiResponse;
      });
      mockAddUserChatHistory.mockResolvedValue(1);

      await collectStreamChunks(queryStream(mockRequest, mockAuthId));

      expect(mockAddUserChatHistory).toHaveBeenCalledWith(
        mockRequest,
        mockOpenAiResponse,
        mockAuthId,
        'lovdata_semantic_ada3l_251108',
        ['doc1']
      );
    });
  });

  describe('error handling', () => {
    it('should propagate embedding errors', async () => {
      const error = new Error('Embedding failed');
      mockEmbedText.mockRejectedValue(error);

      await expect(collectStreamChunks(queryStream(mockRequest, mockAuthId))).rejects.toThrow(
        'Embedding failed'
      );
    });

    it('should propagate search errors', async () => {
      const mockEmbedding = [0.1];
      const error = new Error('Search failed');

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockRejectedValue(error);

      await expect(collectStreamChunks(queryStream(mockRequest, mockAuthId))).rejects.toThrow(
        'Search failed'
      );
    });

    it('should propagate OpenAI streaming errors', async () => {
      const mockEmbedding = [0.1];
      const mockSearchResults = [
        { _id: 'doc1', _index: 'lovdata_semantic_ada3l_251108', content: 'Result' },
      ];
      const error = new Error('OpenAI failed');

      mockEmbedText.mockResolvedValue(mockEmbedding);
      mockSearchVectorAndRRFKeyword.mockResolvedValue(mockSearchResults);
      mockQueryChatStream.mockImplementation(async function* () {
        throw error;
      });

      await expect(collectStreamChunks(queryStream(mockRequest, mockAuthId))).rejects.toThrow(
        'OpenAI failed'
      );
    });
  });
});
