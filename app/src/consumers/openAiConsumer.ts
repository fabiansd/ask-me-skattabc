import OpenAI from 'openai';

import {
  DEFAULT_MODEL_ANONYMOUS,
  DEFAULT_MODEL_AUTHENTICATED,
  DEFAULT_TEMPERATURE,
  OPENAI_EMBEDDING_MODEL,
} from '../constants/openAiParameters';
import { QueryChatRequest } from '../interface/skattSokInterface';
import { generatePrompt } from '../lib/promptGenerator';

import { findUserConversationHistory } from './postgresConsumer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function moderateContent(text: string): Promise<boolean> {
  try {
    const moderation = await openai.moderations.create({
      input: text,
    });

    return moderation.results[0].flagged;
  } catch (error) {
    return false;
  }
}

export async function embedText(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
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

    const conversationHistory = await findUserConversationHistory(
      authId,
      queryChatRequest.conversation_id
    );

    const query = generatePrompt(queryChatRequest, context, conversationHistory);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [{ role: 'user', content: query }];

    const chatParams: OpenAI.Chat.ChatCompletionCreateParams & {
      reasoning_effort?: 'low' | 'medium' | 'high';
    } = {
      model: selectedModel,
      messages: messages,
      temperature: DEFAULT_TEMPERATURE,
      reasoning_effort: 'low', // Set low for GPT-5 models
    };

    const response = await openai.chat.completions.create(chatParams);

    const openaiTime = performance.now() - startTime;

    console.log(`🤖 OpenAI Response:
    └─ Model: ${selectedModel}
    └─ Response time: ${openaiTime.toFixed(0)}ms
    └─ Context documents: ${context.length}
    └─ Context size: ~${Math.round(context.join('').length / 1000)}k chars`);

    return response.choices[0].message.content || undefined;
  } catch (error) {
    console.error('❌ OpenAI error:', error);
  }
}
