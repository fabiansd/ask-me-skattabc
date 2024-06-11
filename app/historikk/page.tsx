'use client'
import { useContext, useEffect, useState } from "react";
import QueryHistory from "../src/components/textManagement/displayQueryHistory";
import UserContext from "../src/contexts/user";


export default function History() {

    const [history, setHistory] = useState([]);
    const { user } = useContext(UserContext);

    const getQueryHistory = async () => {
        try {

            if (!user) {
                console.log('User is null, skipping fetch');
                return;
              }

            const response = await fetch(`/api/postgres/query_history?username=${user?.username ? user.username : 'default'}`);
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
      }, [user]);
    

    return (     
    <div>
        <ul>
        <QueryHistory history={history}/>
        </ul>
    </div>);
}