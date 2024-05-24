import { query_history, users } from "@prisma/client";
import prismaClient from "../lib/prismaClient";


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
