'use client'
import { useEffect, useState } from "react";
import ModelSelectDropdown from "../components/ModelSelectDropdown";
import { ALL_MODELS, DEFAULT_MODEL } from "../constants/opanAiParameters";
import GptResponseDisplay from "../components/gptResponseDisplay";
import ParagraphsDisplay from "../components/paragraphsDisplay";
import { SearchState } from "../interface/skattSokInterface";
import usePersistedSearchResponse from "../lib/persinstenStateUtil";


export const initialSearchResponse: SearchState = {
    queryResponse: '',
    paragraphsResponse: [''],
};


export default function Search() {
    const [serachResponse, setSearchResponse] = usePersistedSearchResponse('searchData', initialSearchResponse);
    const [isLoading, setIsLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleModelSelect = (model: string) => {
        setSelectedModel(model);
    };

    const handeButtonClick = async () => {
        setIsLoading(true);
        setSearchResponse(prev => ({ ...prev }));
        try {
            console.log('API call -> searchText: ', searchInput, ' Model: ', selectedModel);
            const response = await fetch(`/api/elasticsearch/match_all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchText: searchInput, modelSelect: selectedModel }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Client API call successful: ', data);
            setSearchResponse(prev => ({
                ...prev,
                queryResponse: data.openaiResponse,
                paragraphsResponse: data.esParagraphSearch,
            }));
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResponse(prev => ({ ...prev }));
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
                <ModelSelectDropdown models={ALL_MODELS} onSelect={handleModelSelect}></ModelSelectDropdown>
            </div>
            <div className="divider p-12"></div>
            <div className="px-40 pb-20">
                {isLoading && <p className="text-center">Loading...</p>}
                {!isLoading && serachResponse?.queryResponse !== null && (
                    <div suppressHydrationWarning={true}>
                        <GptResponseDisplay searchResponse={serachResponse.queryResponse} />
                        <div className="divider p-12">Relevant paragrafer</div>
                        <ParagraphsDisplay paragraphs={serachResponse.paragraphsResponse} />
                    </div>
                )}
            </div>
        </div>
    );
}
