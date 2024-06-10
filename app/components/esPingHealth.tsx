'use client'
import React, { useState, useEffect } from 'react';


const EsHealth = () => {
  const [isOnline, setIsOnline] = useState(false);

  const pingBackend = async () => {
    try {
      const response = await fetch(`/api/health`);
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
