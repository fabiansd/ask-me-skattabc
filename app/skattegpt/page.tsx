'use client'
import { useEffect, useState } from "react";
import ModelSelectDropdown from "../components/ModelSelectDropdown";
import { ALL_MODELS, DEFAULT_MODEL } from "../constants/opanAiParameters";
import GptResponseDisplay from "../components/gptResponseDisplay";
import ParagraphsDisplay from "../components/paragraphsDisplay";
import { SearchState } from "../interface/skattSokInterface";
import usePersistedState from "../lib/persinstenStateUtil";


export const initialState: SearchState = {
    searchInput: '',
    modelSelect: DEFAULT_MODEL,
    searchResponse: null,
    paragraphsResponse: [''],
    isLoading: false
};


export default function Search() {
    const [state, setState] = usePersistedState('searchData', initialState);

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, searchInput: event.target.value }));
    };

    const handleModelSelect = (model: string) => {
        setState(prev => ({ ...prev, modelSelect: model }));
    };

    const handeButtonClick = async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            console.log('API call -> searchText: ', state.searchInput, ' Model: ', state.modelSelect);
            const response = await fetch(`/api/elasticsearch/match_all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchText: state.searchInput, modelSelect: state.modelSelect }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Client API call successful: ', data);
            setState(prev => ({
                ...prev,
                searchResponse: data.openaiResponse,
                paragraphsResponse: data.esParagraphSearch,
                isLoading: false
            }));
        } catch (error) {
            console.error('Error fetching search results:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
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
                    value={state?.searchInput}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyPress}
                />
                <button className="btn btn-primary mr-10" disabled={state?.isLoading || state?.searchInput === ""} onClick={handeButtonClick}>
                    Spør
                </button>
                <ModelSelectDropdown models={ALL_MODELS} onSelect={handleModelSelect}></ModelSelectDropdown>
            </div>
            <div className="divider p-12"></div>
            <div className="px-40 pb-20">
                {state?.isLoading && <p className="text-center">Loading...</p>}
                {!state?.isLoading && state?.searchResponse !== null && (
                    <div>
                        <GptResponseDisplay searchResponse={state?.searchResponse} />
                        <div className="divider p-12">Relevant paragrafer</div>
                        <ParagraphsDisplay paragraphs={state?.paragraphsResponse} />
                    </div>
                )}
            </div>
        </div>
    );
}
