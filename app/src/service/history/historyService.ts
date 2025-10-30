import {
  deleteConversation,
  findUserConversationHistory,
  findUserConversations,
} from '@/app/src/consumers/postgresConsumer';

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
