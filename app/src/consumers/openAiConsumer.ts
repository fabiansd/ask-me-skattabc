import { ChatMessage, OpenAI, OpenAIEmbedding, Settings } from 'llamaindex';

import {
  DEFAULT_MODEL_ANONYMOUS,
  DEFAULT_MODEL_AUTHENTICATED,
  OPENAI_EMBEDDING_MODEL,
} from '../constants/opanAiParameters';
import { QueryChatRequest } from '../interface/skattSokInterface';
import { generateConcretePrompt, generateDetailedPromt } from '../lib/promptGenerator';

import { findUserConversationHistory } from './postgresConsumer';

type OpenAIResponse = {
  message: {
    content: string;
  };
};

export async function moderateContent(text: string): Promise<boolean> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moderation = await (openai as any).moderations.create({
      input: text,
    });

    return moderation.results[0].flagged;
  } catch (error) {
    return false;
  }
}

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
    const isAuthenticated =
      authId && authId !== 'default' && authId !== 'anonymous' && authId.trim() !== '';
    const selectedModel = isAuthenticated ? DEFAULT_MODEL_AUTHENTICATED : DEFAULT_MODEL_ANONYMOUS;

    console.log(
      `🤖 Using model: ${selectedModel} (authenticated: ${isAuthenticated}, authId: ${authId})`
    );

    // For GPT-5, we must explicitly set temperature to 1 (its only supported value)
    const openaiConfig = {
      model: selectedModel,
      apiKey: process.env.OPENAI_API_KEY,
      temperature: selectedModel === DEFAULT_MODEL_AUTHENTICATED ? 1 : 0,
    };

    const openai = new OpenAI(openaiConfig);

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
