'use client'
import { useState } from "react";
import SafeHtmlRenderer from "./renderHTML";
import RangeBar from "./rangeBar";


export default function SearchBar() {

    const [searchInput, setSearch] = useState('');
    const [searchRange, setSearchRange] = useState(1)
    const [searchResponse, setSearchResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    }

    const handleRangeChange = (newRangee: number) => {
        setSearchRange(newRangee);
    };

    const handeButtonClick = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/elasticsearch/match_all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchText: searchInput, searchRange: searchRange }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setSearchResponse(data.openaiResponse);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
        setIsLoading(false);
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handeButtonClick();
        }
    }

    return (
        <div>
            <div className="flex justify-center padding-bottom-30">            
                <input 
                    type="text" 
                    placeholder="Spor meg om skatt" 
                    className="input input-bordered mr-10 w-full max-w-lg" 
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyPress}
                    />
                <button className="btn btn-primary mr-10" disabled={isLoading || searchInput === ""} onClick={handeButtonClick}>
                    Spør
                </button>
                <RangeBar value={searchRange} onChange={handleRangeChange}></RangeBar>
            </div>
            <div className="divider p-12"></div>
            <div className="px-40 pb-20">
            {isLoading && <p className="text-center">Loading...</p>}
            {!isLoading && searchResponse !== null && (
                <div style={{whiteSpace: "pre-line"}}>
                    <p>{searchResponse}</p>
                </div>
            )}
            </div>
        </div>
    )
}
