import { OpenAI, OpenAIEmbedding, Settings, Message } from "llamaindex";
import generatePromt from "../lib/promptGenerator";


export async function embedText(text: string) {

  Settings.embedModel = new OpenAIEmbedding({
    model: process.env.OPENAI_EMBEDDING_MODEL,
    apiKey: process.env.OPENAI_API_KEY,

    }
  );

  return await Settings.embedModel.getTextEmbedding(text);

}

export async function queryChat(question: string, context: string[]) {

  const azureopenai = new OpenAI({
    model: 'gpt-4-turbo',
    apiKey: process.env.OPENAI_API_KEY,

  })

  const query = generatePromt(question, context)

  const messages: Message[] = [{role: 'user', content: query}];

  const chatParams = { messages: messages};

  const response = await azureopenai.chat(chatParams);

  return response.message.content

}
