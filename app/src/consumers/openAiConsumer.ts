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
    throw error;
  }
}

export async function queryChat(
  queryChatRequest: QueryChatRequest,
  context: string[],
  authId: string
) {
  try {
    const openai = new OpenAI({
      model: DEFAULT_MODEL,
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
    });

    const conversationHistory = await findUserConversationHistory(
      authId,
      queryChatRequest.conversation_id
    );

    const query = queryChatRequest.isDetailed
      ? generateDetailedPromt(queryChatRequest, context, conversationHistory)
      : generateConcretePrompt(queryChatRequest, context, conversationHistory);

    const messages: ChatMessage[] = [{ role: 'user', content: query }];

    const chatParams = { messages: messages };

    const response = (await openai.chat(chatParams)) as OpenAIResponse;

    return response.message.content;
  } catch (error) {
    console.error('Error querying openai, ', error);
  }
}
