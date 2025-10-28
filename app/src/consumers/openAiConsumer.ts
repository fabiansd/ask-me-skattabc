import { ChatMessage, OpenAI, OpenAIEmbedding, Settings } from 'llamaindex';

import { DEFAULT_MODEL, OPENAI_EMBEDDING_MODEL } from '../constants/opanAiParameters';
import { QueryChatRequest } from '../interface/skattSokInterface';
import { generateConcretePrompt, generateDetailedPromt } from '../lib/promptGenerator';

import { findUserConversationHistory } from './postgresConsumer';

type OpenAIResponse = {
  message: {
    content: string;
  };
};

export async function embedText(text: string) {
  try {
    Settings.embedModel = new OpenAIEmbedding({
      model: OPENAI_EMBEDDING_MODEL,
      apiKey: process.env.OPENAI_API_KEY,
    });
    return await Settings.embedModel.getTextEmbedding(text);
  } catch (error) {
    console.error('Error getting embedding ');
    throw error;
  }
}

export async function queryChat(
  queryChatRequest: QueryChatRequest,
  context: string[],
  authId: string
) {
  try {
    // console.log('Query openai -> query: ', queryChatRequest.searchText);
    const openai = new OpenAI({
      model: DEFAULT_MODEL,
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
    });

    const conversationHistory = await findUserConversationHistory(
      authId,
      queryChatRequest.conversation_id
    );
    console.log(
      '🟡 [HISTORY] Fetched conversation history for AI context:',
      conversationHistory.length,
      'messages'
    );

    const query = queryChatRequest.isDetailed
      ? generateDetailedPromt(queryChatRequest, context, conversationHistory)
      : generateConcretePrompt(queryChatRequest, context, conversationHistory);

    const messages: ChatMessage[] = [{ role: 'user', content: query }];

    const chatParams = { messages: messages };

    console.log('🔵 [AI] Sending request to OpenAI...');
    const response = (await openai.chat(chatParams)) as OpenAIResponse;
    console.log(
      '🟢 [AI] OpenAI response received:',
      response.message.content.substring(0, 100) + '...'
    );

    return response.message.content;
  } catch (error) {
    console.error('Error querying openai, ', error);
  }
}
