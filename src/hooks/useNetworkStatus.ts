import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      
      if (!isOnline && online) {
        // Just came back online
        setWasOffline(true);
      }
      
      setIsOnline(online);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also listen to network change events
    window.addEventListener('load', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('load', updateOnlineStatus);
    };
  }, [isOnline]);

  const markSyncHandled = () => {
    setWasOffline(false);
  };

  return {
    isOnline,
    wasOffline,
    markSyncHandled
  };
};