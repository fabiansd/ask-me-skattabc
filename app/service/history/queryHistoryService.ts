import { findUserChatHistory } from "@/app/consumers/postgresConsumer";
import { query_history } from "@prisma/client";



async function getQueryHistory(): Promise<query_history[]> {

    return await findUserChatHistory();
}

export default getQueryHistory;