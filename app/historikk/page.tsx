'use client'
import { useEffect, useState } from "react";
import QueryHistory from "../components/textManagement/displayQueryHistory";


export default function History() {

    const [history, setHistory] = useState([]);

    const getQueryHistory = async () => {
        try {
            const response = await fetch(`/api/postgres/query_history`);
            const data = await response.json();

            if (!response.ok) {
            throw new Error('Error fetching query history');
            }
            setHistory(data);
            console.log('Fetch query history: ', data)
        } catch (error) {
            console.error('Error fetching search query history:', error);
        }
      };
    
      useEffect(() => {
        getQueryHistory();
      }, []);
    

    return (     
    <div>
        <ul>
        <QueryHistory history={history}/>
        </ul>
    </div>);
}