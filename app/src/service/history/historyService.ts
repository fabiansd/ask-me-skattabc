import { fetchDocumentsByIds } from '@/app/src/consumers/esSearchConsumer';
import {
  deleteConversation,
  findUserConversationHistory,
  findUserConversations,
  getMessageSourceInfo,
} from '@/app/src/consumers/postgresConsumer';

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

  // Fetch source documents from Elasticsearch
  const sourceDocuments = await fetchDocumentsByIds(
    sourceInfo.source_index,
    sourceInfo.source_document_ids
  );

  return sourceDocuments;
}
