'use client'
import { useContext, useEffect, useState } from "react";
import GptResponseDisplay from "../src/components/textManagement/markdownTextDisplay";
import ParagraphsDisplay from "../src/components/textManagement/paragraphsDisplay";
import { QueryChatRequest, SearchState } from "../src/interface/skattSokInterface";
import HistoryDropdownSelect from "../src/components/localStorage/historyDropdownSelect.tsx";
import DeleteLocalStorage from "../src/components/localStorage/clearLocalStorage";
import ToggleSwitch from "../src/components/toogleModelDepth";
import DownloadCSV from "../src/components/textManagement/csvRapport";
import UserContext from "../src/contexts/user";


const initialSearchResponse: SearchState = {
    searchInput: '',
    queryResponse: '',
    paragraphsResponse: [''],
};

export default function Search() {
    const [searchResponse, setSearchResponse] = useState<SearchState>(initialSearchResponse);
    const [searchHistory, setSearchHistory] = useState<SearchState[]>([]);
    const [isDetailed, setIsDetailed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [isClearHistoryDisabled, setIsClearHistoryDisabled] = useState(true);

    const { user } = useContext(UserContext);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedHistoryList = getSearchHistory();
            setSearchHistory(savedHistoryList);
            setIsClearHistoryDisabled(savedHistoryList.length === 0);
            if (savedHistoryList.length > 0) {
                const latestSearch = savedHistoryList[savedHistoryList.length - 1];
                setSearchResponse(latestSearch);
                setSearchInput(latestSearch.searchInput);
            }
    }}, []);

    const saveSearchHistory = (newSearchResponse: SearchState) => {
        const updatedHistoryList = [...searchHistory, newSearchResponse];
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistoryList));
        setSearchHistory(updatedHistoryList);
        setIsClearHistoryDisabled(updatedHistoryList.length === 0);
    };

    const getSearchHistory = (): SearchState[] => {
        if (typeof window !== 'undefined') {
            const history = localStorage.getItem('searchHistory');
            return history ? JSON.parse(history) as SearchState[] : [];
        }
        return [];
    };

    const clearSearchHistory = () => {
        localStorage.removeItem('searchHistory');
        setSearchHistory([]);
        setIsClearHistoryDisabled(true);
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleToggle = (state: boolean) => {
        setIsDetailed(state);
    };

    const handleHistorySelect = (selectedSearch: SearchState) => {
        setSearchResponse(selectedSearch);
        setSearchInput(selectedSearch.searchInput);
    };

    const handeButtonClick = async () => {
        setIsLoading(true);
        try {
            console.log('API call -> searchText: ', searchInput);
            const queryChatRequest: QueryChatRequest = {
                searchText: searchInput,
                isDetailed: isDetailed,
                username: user?.username ? user.username : 'default',
                history: getSearchHistory()
            }

            const response = await fetch(`/api/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(queryChatRequest)
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
        <div className="pt-10">
            <div className="flex justify-center">
                <input
                    type="text"
                    placeholder="Spør meg om skatt"
                    className="input input-bordered mr-10 w-full max-w-2xl m-1"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyPress}
                />
            </div>
            <div className="flex justify-center pt-5">
                <ToggleSwitch 
                    onToggle={handleToggle} 
                    textA="Konkret" 
                    textB="Detaljert" 
                />
                <HistoryDropdownSelect searchHistory={searchHistory} onSelect={handleHistorySelect}/>
                <DeleteLocalStorage disabled={isClearHistoryDisabled} handleDelete={clearSearchHistory}/>
                <button className="btn bg-sky-700 hover:bg-sky-800 text-white font-bold m-1 px-6 rounded mr-10" disabled={isLoading || searchInput === ""} onClick={handeButtonClick}>
                    { isClearHistoryDisabled ? 'Nytt spørsmål' : 'Oppfølgingsspørsmål' }
                </button>
            </div>
            <div className="divider"></div>
            <div className="px-60">
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
