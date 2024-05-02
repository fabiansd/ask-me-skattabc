'use client'
import { useState } from "react";
import ModelSelectDropdown from "./ModelSelectDropdown";
import { ALL_MODELS, DEFAULT_MODEL } from "../constants.ts/opanAiParameters";


export default function SearchBar() {

    const [searchInput, setSearch] = useState('');
    const [modelSelect, setModelSelect] = useState(DEFAULT_MODEL)
    const [searchResponse, setSearchResponse] = useState(null);
    const [documentsResponse, setDocumentsResponse] = useState(['']);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    }

    const handleModelSelect = (model: string) => {
        setModelSelect(model);
    };

    const handeButtonClick = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/elasticsearch/match_all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchText: searchInput, modelSelect: modelSelect }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setSearchResponse(data.openaiResponse);
            setDocumentsResponse(data.esResponse);
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
                <ModelSelectDropdown models={ALL_MODELS} onSelect={handleModelSelect}></ModelSelectDropdown>
            </div>
            <div className="divider p-12"></div>
            <div className="px-40 pb-20">
            {isLoading && <p className="text-center">Loading...</p>}
            {!isLoading && searchResponse !== null && (
                <div>
                    <div className="text-left" style={{whiteSpace: "pre-line"}}>
                        <p>{searchResponse}</p>
                    </div>
                    <div className="divider p-12"></div>
                </div>
            )}
            </div>
        </div>
    )
}
