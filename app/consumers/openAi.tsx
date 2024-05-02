import { ChatMessage, OpenAI, OpenAIEmbedding, Settings } from "llamaindex";
import generatePromt from "../lib/promptGenerator";
import { OPENAI_EMBEDDING_MODEL } from "../constants.ts/opanAiParameters";


export async function embedText(text: string) {

  Settings.embedModel = new OpenAIEmbedding({
    model: OPENAI_EMBEDDING_MODEL,
    apiKey: process.env.OPENAI_API_KEY,

    }
  );

  return await Settings.embedModel.getTextEmbedding(text);

}

export async function queryChat(question: string, context: string[], modelSelect: string) {

  const azureopenai = new OpenAI({
    model: modelSelect || 'gpt-4-turbo',
    apiKey: process.env.OPENAI_API_KEY,

  })

  const query = generatePromt(question, context)

  const messages: ChatMessage[] = [{role: 'user', content: query}];

  const chatParams = { messages: messages};

  const response = await azureopenai.chat(chatParams);

  return response.message.content

}
