import { query_history, user_feedback, users } from '@prisma/client';

import { UserFeedbackInput } from '../interface/feedback';
import { QueryChatRequest } from '../interface/skattSokInterface';
import prismaClient from '../lib/prismaClient';

export async function findUserById(userId: number): Promise<users> {
  try {
    const user = await prismaClient.users.findUnique({ where: { user_id: userId } });

    if (!user) {
      throw new Error('User not found');
    }
    console.log('Found user: ', user);
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
    console.log('Found default user: ', user);
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
    console.log('Found Google user: ', user);
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
    console.log('Default user ensured: ', user);
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
          username: name || email,
          email: email,
          auth_provider: 'google',
          google_id: googleId,
          query_count: 0,
        },
      });
    }
    console.log('Google user created/found: ', user);
    return user;
  } catch (error) {
    throw error;
  }
}

export async function addUserChatHistory(
  queryChatRequest: QueryChatRequest,
  openaiResponse: string
) {
  try {
    let user;

    if (queryChatRequest.username === 'default') {
      user = await findDefaultUser(queryChatRequest.username);
    } else {
      user = await findUserByGoogleId(queryChatRequest.username);
    }

    await prismaClient.query_history.create({
      data: {
        user_id: user.user_id,
        answer: openaiResponse,
        question: queryChatRequest.searchText,
      },
    });
    console.log('Found user: ', user);
  } catch (error) {
    throw error;
  }
}

export async function findUserChatHistory(username: string): Promise<query_history[]> {
  try {
    let user;

    if (username === 'default') {
      user = await findDefaultUser(username);
    } else {
      user = await findUserByGoogleId(username);
    }

    const query_history = await prismaClient.query_history.findMany({
      where: { user_id: user.user_id },
    });
    return query_history;
  } catch (error) {
    throw error;
  }
}

export async function addUserFeedback(feedback: UserFeedbackInput) {
  try {
    const user = await findDefaultUser(feedback.username);

    const feecback_item = {
      user_id: user?.user_id,
      happiness_feedback: feedback.happiness_feedback,
      desired_features: feedback.desired_features,
    } as user_feedback;

    await prismaClient.user_feedback.create({ data: feecback_item });
  } catch (error) {
    throw error;
  }
}
