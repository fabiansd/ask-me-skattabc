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
    model: 'gpt-3.5-turbo-1106',
    apiKey: process.env.OPENAI_API_KEY,

  })

  const query = generatePromt(question, context)

  const messages: Message[] = [{role: 'user', content: query}];

  const chatParams = { messages: messages};

  return await azureopenai.chat(chatParams);
}

