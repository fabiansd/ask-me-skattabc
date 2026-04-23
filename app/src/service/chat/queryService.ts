import { ELASTICSEARCH_INDEX_SKATT } from '@/app/src/constants/esParameters';
import { searchVectorAndRRFKeyword } from '@/app/src/consumers/esSearchConsumer';
import { embedText, moderateContent, queryChatStream } from '@/app/src/consumers/openAiConsumer';

import { getMockQueryResponse } from '../../../../tests/mockData';
import { addUserChatHistory, getConversationContext } from '../../consumers/postgresConsumer';
import { QueryChatRequest } from '../../interface/skattSokInterface';

async function validateQueryRequest(queryChatRequest: QueryChatRequest): Promise<void> {
  const isFlagged = await moderateContent(queryChatRequest.searchText);
  if (isFlagged) {
    throw new Error(
      'Innholdet er ikke støttet. Vennligst still et spørsmål om norske skatteregler.'
    );
  }
}

export async function* queryStream(
  queryChatRequest: QueryChatRequest,
  authId: string
): AsyncGenerator<string> {
  await validateQueryRequest(queryChatRequest);

  if (process.env.USE_MOCK_DATA === 'true') {
    const mockResponse = getMockQueryResponse();
    yield mockResponse.openaiResponse;

    const conversation_id = await addUserChatHistory(
      queryChatRequest,
      mockResponse.openaiResponse,
      authId,
      mockResponse.sourceIndex,
      mockResponse.sourceDocumentIds
    );
    yield JSON.stringify({ conversation_id });
    return;
  }

  // Build search context with question history for better ES results
  let searchContext = queryChatRequest.searchText;

  if (queryChatRequest.conversation_id && authId !== 'default') {
    const previousQuestions = await getConversationContext(queryChatRequest.conversation_id);
    if (previousQuestions) {
      searchContext = previousQuestions + ' ' + queryChatRequest.searchText;
    }
  }

  const searchVector: number[] = await embedText(searchContext);

  const esDocuments = await searchVectorAndRRFKeyword(
    searchVector,
    ELASTICSEARCH_INDEX_SKATT,
    queryChatRequest.tags || [],
    searchContext
  );

  // Extract content for streaming and source metadata for storage
  const esContent = esDocuments.map(doc => doc.content);
  const sourceDocumentIds = esDocuments.map(doc => doc._id);

  // Collect streamed response
  let fullResponse = '';
  for await (const chunk of queryChatStream(queryChatRequest, esContent, authId)) {
    fullResponse += chunk;
    yield chunk;
  }

  // After stream completes, save to database with source tracking
  if (fullResponse) {
    const conversation_id = await addUserChatHistory(
      queryChatRequest,
      fullResponse,
      authId,
      ELASTICSEARCH_INDEX_SKATT,
      sourceDocumentIds
    );
    // Send final message with conversation_id
    yield JSON.stringify({ conversation_id });
  }
}
