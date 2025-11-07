import { user_feedback, users } from '@prisma/client';

import prismaClient from '../clients/prismaClient';
import { UserFeedbackInput } from '../interface/feedback';
import { ConversationMessage, ConversationsList } from '../interface/history';
import { QueryChatRequest } from '../interface/skattSokInterface';

// User lookup functions
export async function findUserById(userId: number): Promise<users> {
  try {
    const user = await prismaClient.users.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
}

export async function findDefaultUser(username: string): Promise<users> {
  try {
    const user = await prismaClient.users.findUnique({
      where: { username: username },
    });

    if (!user) {
      throw new Error('Default user not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
}

export async function findUserByGoogleId(googleId: string): Promise<users> {
  try {
    const user = await prismaClient.users.findFirst({
      where: {
        google_id: googleId,
      },
    });

    if (!user) {
      throw new Error('Google user not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
}

export async function createDefaultUser(username: string): Promise<users> {
  try {
    const user = await prismaClient.users.upsert({
      where: { username },
      update: {}, // Don't update if exists
      create: {
        username,
        auth_provider: 'default',
        query_count: 0,
      },
    });
    return user;
  } catch (error) {
    throw error;
  }
}

export async function createGoogleUser(
  googleId: string,
  email: string,
  name: string
): Promise<users> {
  try {
    let user = await prismaClient.users.findUnique({
      where: { google_id: googleId },
    });

    if (!user) {
      user = await prismaClient.users.create({
        data: {
          username: name || email, // Use display name as username (human-readable)
          email: email,
          auth_provider: 'google',
          google_id: googleId,
          query_count: 0,
        },
      });
    }
    return user;
  } catch (error) {
    throw error;
  }
}

export async function addUserChatHistory(
  queryChatRequest: QueryChatRequest,
  openaiResponse: string,
  authId: string
): Promise<number> {
  try {
    let user;

    if (authId === 'default') {
      user = await findDefaultUser(authId);
    } else {
      user = await findUserByGoogleId(authId);
    }

    let conversationId = queryChatRequest.conversation_id;

    if (!conversationId) {
      const conversation = await prismaClient.conversations.create({
        data: {
          user_id: user.user_id,
          title: queryChatRequest.searchText?.substring(0, 100) || 'Untitled',
        },
      });
      conversationId = conversation.conversation_id;
    }

    await prismaClient.messages.create({
      data: {
        conversation_id: conversationId,
        role: 'user',
        content: queryChatRequest.searchText || 'No content provided',
        tags: queryChatRequest.tags || [],
      },
    });

    await prismaClient.messages.create({
      data: {
        conversation_id: conversationId,
        role: 'assistant',
        content: openaiResponse,
      },
    });

    await prismaClient.conversations.update({
      where: { conversation_id: conversationId },
      data: { updated_at: new Date() },
    });

    await prismaClient.query_history.create({
      data: {
        conversation_id: conversationId,
        user_id: user.user_id,
        answer: openaiResponse,
        question: queryChatRequest.searchText || 'No question provided',
      },
    });

    return conversationId!;
  } catch (error) {
    throw error;
  }
}

export async function findUserConversationHistory(
  authIdentifier: string,
  conversation_id?: number
): Promise<ConversationMessage[]> {
  if (!conversation_id) return [];

  try {
    let user;

    if (authIdentifier === 'default') {
      user = await findDefaultUser(authIdentifier);
    } else {
      user = await findUserByGoogleId(authIdentifier);
    }

    const messages = await prismaClient.messages.findMany({
      where: {
        conversation: {
          conversation_id: conversation_id,
          user_id: user.user_id,
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return messages as ConversationMessage[];
  } catch (error) {
    return [];
  }
}

export async function deleteConversation(
  authIdentifier: string,
  conversationId: number
): Promise<void> {
  try {
    let user;

    if (authIdentifier === 'default') {
      user = await findDefaultUser(authIdentifier);
    } else {
      user = await findUserByGoogleId(authIdentifier);
    }

    const conversation = await prismaClient.conversations.findFirst({
      where: {
        conversation_id: conversationId,
        user_id: user.user_id,
      },
    });

    if (!conversation) {
      return;
    }

    await prismaClient.conversations.delete({
      where: {
        conversation_id: conversationId,
      },
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

export async function findUserConversations(authIdentifier: string): Promise<ConversationsList[]> {
  try {
    let user;

    if (authIdentifier === 'default') {
      user = await findDefaultUser(authIdentifier);
    } else {
      user = await findUserByGoogleId(authIdentifier);
    }

    const conversations = await prismaClient.conversations.findMany({
      where: {
        user_id: user.user_id,
      },
      include: {
        messages: {
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    // Transform to ConversationsList format
    const conversationsList: ConversationsList[] = conversations.map((conv: any) => ({
      id: conv.conversation_id,
      title: conv.title || `Samtale ${conv.conversation_id}`,
      lastMessage: conv.messages?.[0]?.content || 'Ingen meldinger',
      timestamp: conv.updated_at.toLocaleDateString(),
    }));

    return conversationsList;
  } catch (error) {
    console.error('Error in findUserConversations:', error);
    return [];
  }
}

export async function addUserFeedback(feedback: UserFeedbackInput) {
  try {
    const user =
      feedback.username === 'default'
        ? await findDefaultUser(feedback.username)
        : await findUserByGoogleId(feedback.username);

    const feecback_item = {
      user_id: user?.user_id,
      happiness_feedback: feedback.happiness_feedback || '',
      desired_features: feedback.desired_features || '',
    } as user_feedback;

    await prismaClient.user_feedback.create({ data: feecback_item });
  } catch (error) {
    throw error;
  }
}
