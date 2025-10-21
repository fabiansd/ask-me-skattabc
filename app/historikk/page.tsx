'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';

import QueryHistory from '../src/components/textManagement/displayQueryHistory';
import { getUserId } from '../src/lib/getUserId';

export default function History() {
  const [history, setHistory] = useState([]);
  const { data: session } = useSession();

  const getQueryHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/postgres/query_history?username=${getUserId(session)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Error fetching query history');
      }
      setHistory(data);
      console.log('Fetch query history: ', data);
    } catch (error) {
      console.error('Error fetching search query history:', error);
    }
  }, [session]);

  useEffect(() => {
    if (session !== undefined) {
      getQueryHistory();
    }
  }, [session, getQueryHistory]);

  return (
    <div>
      <ul>
        <QueryHistory history={history} />
      </ul>
    </div>
  );
}
