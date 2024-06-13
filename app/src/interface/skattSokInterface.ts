
export interface SearchState {
    searchInput: string;
    queryResponse: string;
    paragraphsResponse: string[];
}

export interface QueryChatRequest {
    searchText: string,
    isDetailed: boolean,
    username: string,
    history: SearchState[],
}
