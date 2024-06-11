import { createUser, findUserById } from "@/app/src/consumers/postgresConsumer";
import { users } from "@prisma/client";


export async function getUserById(userId: number): Promise<users> {

    return await findUserById(userId);
}

export async function createUserIfNotExist(username: string): Promise<users> {

    return await createUser(username);
}