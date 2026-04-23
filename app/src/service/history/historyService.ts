import { fetchDocumentsByIds } from '@/app/src/consumers/esSearchConsumer';
import {
  deleteConversation,
  findUserConversationHistory,
  findUserConversations,
  getMessageSourceInfo,
} from '@/app/src/consumers/postgresConsumer';

import { MOCK_SOURCES, MOCK_SOURCE_INDEX } from '../../../../tests/mockData';
import { ESDocument } from '../../clients/esUtil';
import { ConversationMessage, ConversationsList } from '../../interface/history';

export async function getUserConversations(authIdentifier: string): Promise<ConversationsList[]> {
  return await findUserConversations(authIdentifier);
}

export async function getUserConversationHistory(
  authIdentifier: string,
  conversation_id: number
): Promise<ConversationMessage[]> {
  return await findUserConversationHistory(authIdentifier, conversation_id);
}

export async function deleteUserConversation(
  authIdentifier: string,
  conversationId: number
): Promise<void> {
  return await deleteConversation(authIdentifier, conversationId);
}

export async function getMessageSources(messageId: number): Promise<ESDocument[]> {
  // Validation
  if (!messageId || messageId <= 0) {
    throw new Error('Invalid message ID');
  }

  // Fetch source info from database
  const sourceInfo = await getMessageSourceInfo(messageId);

  if (!sourceInfo) {
    throw new Error('Message not found');
  }

  // If no sources are stored, return empty array
  if (!sourceInfo.source_index || sourceInfo.source_document_ids.length === 0) {
    return [];
  }

  // When running with mock data, short-circuit the Elasticsearch fetch and
  // return the matching mock documents so the Kilder pane can be exercised
  // without a populated ES instance.
  if (process.env.USE_MOCK_DATA === 'true' && sourceInfo.source_index === MOCK_SOURCE_INDEX) {
    const idSet = new Set(sourceInfo.source_document_ids);
    return MOCK_SOURCES.filter(doc => idSet.has(doc._id));
  }

  // Fetch source documents from Elasticsearch
  const sourceDocuments = await fetchDocumentsByIds(
    sourceInfo.source_index,
    sourceInfo.source_document_ids
  );

  return sourceDocuments;
}
