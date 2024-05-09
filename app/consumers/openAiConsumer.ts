import { ChatMessage, OpenAI, OpenAIEmbedding, Settings } from "llamaindex";
import { DEFAULT_MODEL, OPENAI_EMBEDDING_MODEL } from "../constants/opanAiParameters";
import { generateConcretePromt } from "../lib/promptGenerator";


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

export async function queryChat(question: string, context: string[]) {

  try {
    console.log('Query openai -> query: ', question)
    const openai = new OpenAI({
      model: DEFAULT_MODEL || 'gpt-4-turbo',
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
    })
    console.log('Connection to openai successful ')
    
    const query = generateConcretePromt(question, context)
    
    const messages: ChatMessage[] = [{role: 'user', content: query}];
    
    const chatParams = { messages: messages};
    
    const response = await openai.chat(chatParams);
    
    console.log('Query successful: ', response)
    
    return response.message.content
  } catch(error) {
    console.error('Error querying openai, ', error)
  }
}
