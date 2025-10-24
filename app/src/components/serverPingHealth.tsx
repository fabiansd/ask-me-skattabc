'use client';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { getUserId } from '../service/users/getUserId';

export const dynamic = 'force-dynamic';

const Health = () => {
  const [isOnline, setIsOnline] = useState(false);

  const { data: session } = useSession();

  const pingBackend = useCallback(async () => {
    try {
      const response = await fetch(`/api/health?username=${getUserId(session)}`);
      if (response.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      setIsOnline(false);
    }
  }, [session]);

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 60000 * 9); // Check every x/1000 seconds
    return () => clearInterval(interval);
  }, [session, pingBackend]);

  const statusStyle = isOnline ? 'badge-accent' : 'badge-neutral';

  const statusText = isOnline ? 'Online' : 'Offline';

  return <div className={`badge ${statusStyle}`}>{statusText}</div>;
};

export default Health;
