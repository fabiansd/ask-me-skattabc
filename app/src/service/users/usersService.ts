import { users } from '@prisma/client';

import { createDefaultUser, findUserById } from '@/app/src/consumers/postgresConsumer';

export async function getUserById(userId: number): Promise<users> {
  return await findUserById(userId);
}

export async function createUserIfNotExist(username: string): Promise<users> {
  return await createDefaultUser(username);
}
