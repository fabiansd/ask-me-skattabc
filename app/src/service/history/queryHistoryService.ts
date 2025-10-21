import { query_history } from '@prisma/client';

import { findUserChatHistory } from '@/app/src/consumers/postgresConsumer';

async function getQueryHistory(username: string): Promise<query_history[]> {
  return await findUserChatHistory(username);
}

export default getQueryHistory;
