'use client'
import { useContext, useEffect, useState } from "react";
import GptResponseDisplay from "../src/components/textManagement/markdownTextDisplay";
import ParagraphsDisplay from "../src/components/textManagement/paragraphsDisplay";
import { SearchState } from "../src/interface/skattSokInterface";
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

    const { user } = useContext(UserContext);

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

    const handleToggle = (state: boolean) => {
        setIsDetailed(state);
        console.log(isDetailed)
    };

    const handleHistorySelect = (selectedSearch: SearchState) => {
        setSearchResponse(selectedSearch);
        setSearchInput(selectedSearch.searchInput);
    };

    const handeButtonClick = async () => {
        setIsLoading(true);
        try {
            console.log('API call -> searchText: ', searchInput);
            const response = await fetch(`/api/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    searchText: searchInput, 
                    isDetailed: isDetailed,
                    username: user?.username ? user.username : 'default',
                }),
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
                <button className="btn bg-sky-700 hover:bg-sky-800 text-white font-bold m-1 px-6 rounded mr-10" disabled={isLoading || searchInput === ""} onClick={handeButtonClick}>
                    Spør
                </button>
            </div>
            <div className="flex justify-center pt-5">
                <ToggleSwitch 
                    onToggle={handleToggle} 
                    textA="Konkret" 
                    textB="Detaljert" 
                />
                <HistoryDropdownSelect searchHistory={searchHistory} onSelect={handleHistorySelect}/>
                <DownloadCSV searchResponse={searchResponse} />
                <DeleteLocalStorage/>
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
