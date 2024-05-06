
export interface SearchState {
    searchInput: string;
    modelSelect: string;
    searchResponse: any; // Consider defining a more specific type based on the structure of the response
    paragraphsResponse: string[];
    isLoading: boolean;
}
