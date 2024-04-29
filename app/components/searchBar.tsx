'use client'
import { useState } from "react";
import TextCard from "./textBar";
import SafeHtmlRenderer from "./renderHTML";


export default function SearchBar() {

    const [searchInput, setSearch] = useState("");
    const [searchResponse, setSearchResponse] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    }

    const handeButtonClick = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/elasticsearch/match_all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchText: searchInput }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setSearchResponse(data);
            console.log(searchResponse)
            console.log(searchResponse.openaiResponse?.message?.content)
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
        setIsLoading(false);
    }

    const htmlContent = '<h1>Header</h1><p>Some important text here...</p>';

    return (
        <div>
            <div className="flex justify-center">            
                <input 
                    type="text" 
                    placeholder="Spor meg om skatt" 
                    className="input input-bordered mr-10 w-full max-w-lg" 
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    />
                <button className="btn btn-primary" onClick={handeButtonClick}>
                    Spør
                </button>
            </div>
            <div className="divider p-12"></div>
            <div>
            {isLoading && <p>Loading...</p>}
            {!isLoading && (
                <div>
                    <div>
                        <pre>{searchResponse}</pre>
                    </div>
                    <div>
                    <SafeHtmlRenderer htmlContent={searchResponse.openaiResponse?.message?.content} />
                </div>
                </div>
            )}
            </div>
        </div>
    )
}
