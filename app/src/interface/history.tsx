export interface ConversationMessage {
  message_id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  tags?: string[];
  created_at: Date;
}

export interface ConversationsList {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: string;
}

export interface ConversationWithMessages {
  conversation_id: number;
  messages: ConversationMessage[];
}
