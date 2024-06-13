import { query_history, user_feedback, users } from "@prisma/client";
import prismaClient from "../lib/prismaClient";
import { UserFeedbackInput } from "../interface/feedback";
import { QueryChatRequest } from "../interface/skattSokInterface";


export async function findUserById(userId: number): Promise<users> {
  try {
    const user = await prismaClient.users.findUnique(
      { where: { user_id: userId} }
    );

    if (!user) {
      throw new Error('User not found');
    }
    console.log('Found user: ', user)
    return user;
  } catch(error){
    throw error;
  }
}

export async function findUserByName(username: string): Promise<users> {
  try {
    const user = await prismaClient.users.findUnique(
      { where: { username: username} }
    );

    if (!user) {
      throw new Error('User not found');
    }
    console.log('Found user: ', user)
    return user;
  } catch(error){
    throw error;
  }
}

export async function createUser(username: string): Promise<users> {
  try {
    let user = await prismaClient.users.findUnique({
      where: { username },
    });

    if (!user) {
      user = await prismaClient.users.create({
        data: { username },
      });
    }
    console.log('User already exist: ', user)
    return user;
  } catch(error){
    throw error;
  }
}

export async function addUserChatHistory(queryChatRequest: QueryChatRequest, openaiResponse: string) {
  try {

    const user = await findUserByName(queryChatRequest.username);

    await prismaClient.query_history.create(
      { data: 
        {
          user_id: !!user?.user_id ? user.user_id : 1,
          answer: openaiResponse,
          question: queryChatRequest.searchText,
      } }
    );
    console.log('Found user: ', user)
  } catch(error){
    throw error;
  }
}

export async function findUserChatHistory(username: string): Promise<query_history[]> {
  try {

    const user = await findUserByName(username);
    
    const query_history = await prismaClient.query_history.findMany(
      { where: { user_id: !!user?.user_id ? user.user_id : 1 } }
    );
    return query_history;
  } catch(error){
    throw error;
  }
}

export async function addUserFeedback( feedback: UserFeedbackInput) {
  try {

    const user = await findUserByName(feedback.username);

    const feecback_item = {
      user_id: user?.user_id,
      happiness_feedback: feedback.happiness_feedback,
      desired_features: feedback.desired_features,
    } as user_feedback;
    
    await prismaClient.user_feedback.create(
      { data: feecback_item }
    );
  } catch(error){
    throw error;
  }
}