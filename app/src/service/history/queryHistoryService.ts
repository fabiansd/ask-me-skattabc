import { findUserChatHistory } from "@/app/src/consumers/postgresConsumer";
import { query_history } from "@prisma/client";



async function getQueryHistory(username: string): Promise<query_history[]> {

    return await findUserChatHistory(username);
}

export default getQueryHistory;