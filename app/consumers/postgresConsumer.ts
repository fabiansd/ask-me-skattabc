import { query_history, user_feedback, users } from "@prisma/client";
import prismaClient from "../lib/prismaClient";
import { UserFeedbackInput } from "../interface/feedback";


export async function findUser(): Promise<users> {
  try {
    const user = await prismaClient.users.findUnique(
      { where: { username: 'fabian'} }
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

export async function addUserChatHistory(question: string, answer: string) {
  try {

    const user = await prismaClient.users.findUnique(
      { where: { username: 'fabian'} }
    );

    await prismaClient.query_history.create(
      { data: 
        {
          user_id: !!user?.user_id ? user.user_id : 1,
          answer: answer,
          question: question,
      } }
    );
    console.log('Found user: ', user)
  } catch(error){
    throw error;
  }
}

export async function findUserChatHistory(): Promise<query_history[]> {
  try {

    const user = await prismaClient.users.findUnique(
      { where: { username: 'fabian'} }
    );
    
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

    const user = await prismaClient.users.findUnique(
      { where: { username: 'fabian'} }
    );

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