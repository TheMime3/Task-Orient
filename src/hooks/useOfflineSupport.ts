import { useState, useEffect } from 'react';
import { Message } from '../types';

interface OfflineMessage extends Message {
  status: 'pending' | 'failed';
  retryCount: number;
}

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineMessage[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      processOfflineQueue();
    }
  }, [isOnline, offlineQueue]);

  const addToOfflineQueue = (message: Message) => {
    const offlineMessage: OfflineMessage = {
      ...message,
      status: 'pending',
      retryCount: 0,
    };
    setOfflineQueue(prev => [...prev, offlineMessage]);
  };

  const processOfflineQueue = async () => {
    for (const message of offlineQueue) {
      try {
        // Attempt to send the message
        await sendMessage(message);
        
        // Remove from queue if successful
        setOfflineQueue(prev => prev.filter(m => m.id !== message.id));
      } catch (error) {
        // Update retry count and status
        setOfflineQueue(prev =>
          prev.map(m =>
            m.id === message.id
              ? {
                  ...m,
                  status: 'failed',
                  retryCount: m.retryCount + 1,
                }
              : m
          )
        );
      }
    }
  };

  const sendMessage = async (message: Message) => {
    // Implement your message sending logic here
    // This should integrate with your chat store
  };

  return {
    isOnline,
    offlineQueue,
    addToOfflineQueue,
  };
};