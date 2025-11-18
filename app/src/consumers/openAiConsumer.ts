import { ChatMessage, OpenAI, OpenAIEmbedding, Settings } from 'llamaindex';

import {
  DEFAULT_MODEL_ANONYMOUS,
  DEFAULT_MODEL_AUTHENTICATED,
  OPENAI_EMBEDDING_MODEL,
} from '../constants/openAiParameters';
import { QueryChatRequest } from '../interface/skattSokInterface';
import { generatePrompt } from '../lib/promptGenerator';

import { findUserConversationHistory } from './postgresConsumer';

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
  const startTime = performance.now();
  try {
    const isAuthenticated =
      authId && authId !== 'default' && authId !== 'anonymous' && authId.trim() !== '';
    const selectedModel = isAuthenticated ? DEFAULT_MODEL_AUTHENTICATED : DEFAULT_MODEL_ANONYMOUS;

    console.log(
      `🤖 Using model: ${selectedModel} (authenticated: ${isAuthenticated}, authId: ${authId})`
    );

    const openaiConfig = {
      model: selectedModel,
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 1,
    };

    const openai = new OpenAI(openaiConfig);

    const conversationHistory = await findUserConversationHistory(
      authId,
      queryChatRequest.conversation_id
    );

    const query = generatePrompt(queryChatRequest, context, conversationHistory);

    const messages: ChatMessage[] = [{ role: 'user', content: query }];

    const chatParams = { messages: messages };

    const response = await openai.chat(chatParams);

    const openaiTime = performance.now() - startTime;

    console.log(`🤖 OpenAI Response:
    └─ Model: ${selectedModel}
    └─ Response time: ${openaiTime.toFixed(0)}ms
    └─ Context documents: ${context.length}
    └─ Context size: ~${Math.round(context.join('').length / 1000)}k chars`);

    return typeof response.message.content === 'string'
      ? response.message.content
      : (response.message.content?.find(item => item.type === 'text') as { text: string })?.text;
  } catch (error) {
    console.error('❌ OpenAI error:', error);
  }
}
