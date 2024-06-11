'use client'
import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../contexts/user';

 
const EsHealth = () => {
  const [isOnline, setIsOnline] = useState(false);

  const { user } = useContext(UserContext);

  const pingBackend = async () => {
    try {
      const response = await fetch(`/api/health?username=${user?.username ? user?.username : 'default'}`);
      if (response.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 60000*9);  // Check every x/1000 seconds
    return () => clearInterval(interval); 
  }, []);

  const statusStyle = isOnline
    ? 'badge-accent'
    : 'badge-neutral';

  const statusText = isOnline
    ? 'Online'
    : 'Offline';

  return (
    <div className={`badge ${statusStyle}`}>{statusText}</div>
  );
};

export default EsHealth;
