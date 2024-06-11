import { ChatMessage, ChatResponse, OpenAI, OpenAIEmbedding, Settings, ToolCallLLMMessageOptions } from "llamaindex";
import { DEFAULT_MODEL, OPENAI_EMBEDDING_MODEL } from "../constants/opanAiParameters";
import { generateConcretePromt, generateDetailedPromt } from "../lib/promptGenerator";

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

export async function queryChat(question: string, context: string[], isDetailed: boolean) {

  try {
    console.log('Query openai -> query: ', question)
    const openai = new OpenAI({
      model: DEFAULT_MODEL || 'gpt-4-turbo',
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
    })
    console.log('Connection to openai successful ')
    
    const query = isDetailed ? generateDetailedPromt(question, context) : generateConcretePromt(question, context)
    
    const messages: ChatMessage[] = [{role: 'user', content: query}];
    
    const chatParams = { messages: messages};
    
    const response = await openai.chat(chatParams) as OpenAIResponse;

    const answer: string = response.message.content;
    
    console.log('Query successful: ', answer)
    
    return answer
  } catch(error) {
    console.error('Error querying openai, ', error)
  }
}
