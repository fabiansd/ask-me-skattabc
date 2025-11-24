export interface ConversationMessage {
  message_id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  tags?: string[];
  created_at: Date;
  source_index?: string;
  source_document_ids?: string[];
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
