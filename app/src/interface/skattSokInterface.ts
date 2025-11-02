export interface QueryChatRequest {
  searchText: string;
  tags?: string[];
  isDetailed: boolean;
  conversation_id?: number;
}
