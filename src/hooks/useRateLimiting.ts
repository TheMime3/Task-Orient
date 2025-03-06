import { useState, useRef, useCallback } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
}

export const useRateLimiting = (config: RateLimitConfig) => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const requestTimestamps = useRef<number[]>([]);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const timeWindow = config.timeWindow;
    
    // Remove timestamps outside the time window
    requestTimestamps.current = requestTimestamps.current.filter(
      timestamp => now - timestamp < timeWindow
    );

    // Check if we've exceeded the rate limit
    if (requestTimestamps.current.length >= config.maxRequests) {
      setIsRateLimited(true);
      
      // Calculate when the rate limit will reset
      const oldestTimestamp = requestTimestamps.current[0];
      const resetDelay = timeWindow - (now - oldestTimestamp);
      
      setTimeout(() => {
        setIsRateLimited(false);
      }, resetDelay);
      
      return false;
    }

    // Add current timestamp and allow the request
    requestTimestamps.current.push(now);
    return true;
  }, [config.maxRequests, config.timeWindow]);

  return {
    isRateLimited,
    checkRateLimit,
  };
};