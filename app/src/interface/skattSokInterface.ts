export interface QueryChatRequest {
  searchText: string;
  tags?: string[];
  isDetailed: boolean;
  conversation_id?: number;
}

export interface SearchState {
  searchText: string;
  searchResponse?: string;
  conversation_id?: number;
}
