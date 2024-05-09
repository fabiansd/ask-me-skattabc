'use client'
import { useEffect, useState } from "react";
import GptResponseDisplay from "../components/gptResponseDisplay";
import ParagraphsDisplay from "../components/paragraphsDisplay";
import { SearchState } from "../interface/skattSokInterface";
import HistoryDropdownSelect from "../components/historyDropdownSelect.tsx";


const initialSearchResponse: SearchState = {
    searchInput: '',
    queryResponse: '',
    paragraphsResponse: [''],
};

export default function Search() {
    const [searchResponse, setSearchResponse] = useState<SearchState>(initialSearchResponse);
    const [searchHistory, setSearchHistory] = useState<SearchState[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const savedHistoryList = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        if (Array.isArray(savedHistoryList)) {
            setSearchHistory(savedHistoryList);
            if (savedHistoryList.length > 0) {
                const latestSearch = savedHistoryList[savedHistoryList.length - 1];
                setSearchResponse(latestSearch);
                setSearchInput(latestSearch.searchInput);
            }
        }
    }, []);

    const saveSearchHistory = (newSearchResponse: SearchState) => {
        const updatedHistoryList = [...searchHistory, newSearchResponse];
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistoryList));
        setSearchHistory(updatedHistoryList);
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleHistorySelect = (selectedSearch: SearchState) => {
        setSearchResponse(selectedSearch);
        setSearchInput(selectedSearch.searchInput);
    };

    const handeButtonClick = async () => {
        setIsLoading(true);
        try {
            console.log('API call -> searchText: ', searchInput);
            const response = await fetch(`/api/elasticsearch/match_all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchText: searchInput }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Client API call successful: ', data);
            const newSearchResponse = {
                searchInput: searchInput,
                queryResponse: data.openaiResponse,
                paragraphsResponse: data.esParagraphSearch
            };
            setSearchResponse(newSearchResponse);
            saveSearchHistory(newSearchResponse); 
            localStorage.setItem('searchResponse', JSON.stringify(newSearchResponse));
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
        setIsLoading(false);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handeButtonClick();
        }
    };

    return (
        <div>
            <div className="flex justify-center padding-bottom-30">
                <input
                    type="text"
                    placeholder="Spør meg om skatt"
                    className="input input-bordered mr-10 w-full max-w-lg"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyPress}
                />
                <button className="btn btn-primary mr-10" disabled={isLoading || searchInput === ""} onClick={handeButtonClick}>
                    Spør
                </button>
                <HistoryDropdownSelect searchHistory={searchHistory} onSelect={handleHistorySelect}></HistoryDropdownSelect>
            </div>
            <div className="divider p-12"></div>
            <div className="px-40 pb-20">
                {isLoading && <p className="text-center">Loading...</p>}
                {!isLoading && searchResponse !== initialSearchResponse && (
                    <div>
                        <GptResponseDisplay searchResponse={searchResponse.queryResponse} />
                        <div className="divider p-12">Relevante paragrafer</div>
                        <ParagraphsDisplay paragraphs={searchResponse.paragraphsResponse} />
                    </div>
                )}
            </div>
        </div>
    );
}
