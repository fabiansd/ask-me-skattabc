import { ChatMessage, OpenAI, OpenAIEmbedding, Settings } from "llamaindex";
import generatePromt from "../lib/promptGenerator";
import { OPENAI_EMBEDDING_MODEL } from "../constants.ts/opanAiParameters";


export async function embedText(text: string) {

  try {    
    Settings.embedModel = new OpenAIEmbedding({
      model: OPENAI_EMBEDDING_MODEL,
      apiKey: process.env.OPENAI_API_KEY,
      }
    );
    
    const embeddedVector = await Settings.embedModel.getTextEmbedding(text);
    console.log('Embedding successful');
    return embeddedVector;
  } catch(error) {
    console.error('Error getting embedding ')
    throw error;
  }
}

export async function queryChat(question: string, context: string[], modelSelect: string) {

  try {
    console.log('Query openai -> model: ', modelSelect, ' query: ', question)
    const openai = new OpenAI({
      model: modelSelect || 'gpt-4-turbo',
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
    })
    console.log('Connection to openai successful ')
    
    const query = generatePromt(question, context)
    
    const messages: ChatMessage[] = [{role: 'user', content: query}];
    
    const chatParams = { messages: messages};
    
    const response = await openai.chat(chatParams);
    
    console.log('Query successful: ', response)
    
    return response.message.content
  } catch(error) {
    console.error('Error querying openai, ', error)
  }
}
