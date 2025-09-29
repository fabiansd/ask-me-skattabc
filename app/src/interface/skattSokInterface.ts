export interface SearchState {
  id: string;
  searchInput: string;
  queryResponse: string;
  paragraphsResponse: string[];
  chatFeedback?: "thumbsUp" | "thumbsDown" | null;
}

export interface QueryChatRequest {
  searchText: string;
  isDetailed: boolean;
  username: string;
  history: SearchState[];
}
