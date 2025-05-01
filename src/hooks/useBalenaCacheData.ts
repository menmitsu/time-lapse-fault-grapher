
import { useState, useRef, useEffect } from 'react';
import { fetchBalenaCacheData, BalenaCacheResponse } from '../services/balenaCacheService';
import { toast } from '@/components/ui/sonner';

// Mock data for when API requests fail
const generateMockData = (): BalenaCacheResponse => {
  const currentDate = new Date();
  const dateStr = currentDate.toISOString().replace('T', ' ').substring(0, 19);
  
  // Generate time 30 minutes ago for the start timestamp
  const startDate = new Date(currentDate.getTime() - 30 * 60 * 1000);
  const startDateStr = startDate.toISOString().replace('T', ' ').substring(0, 19);
  
  return {
    "0MNYH_mayfieldGarden123": {
      cache_frames_with_delay_more_than_1s: 174,
      delay_times: [2, 3, 2, 2, 2, 2, 2],
      last_frame_timestamp: dateStr,
      start_timestamp: startDateStr,
      total_1s_frames_captured: 1933,
      total_delayed_frames: 174,
      total_reconnect_instances: 0,
      weighted_avg_delay: 2.13
    },
    "1ABCD_downtownStation": {
      cache_frames_with_delay_more_than_1s: 250,
      delay_times: [2, 4, 3, 2, 3],
      last_frame_timestamp: dateStr,
      start_timestamp: startDateStr,
      total_1s_frames_captured: 2400,
      total_delayed_frames: 250,
      total_reconnect_instances: 2,
      weighted_avg_delay: 2.8
    },
    "2EFGH_cityCenterLoc": {
      cache_frames_with_delay_more_than_1s: 120,
      delay_times: [2, 2, 1, 3, 2],
      last_frame_timestamp: dateStr,
      start_timestamp: startDateStr,
      total_1s_frames_captured: 2100,
      total_delayed_frames: 120,
      total_reconnect_instances: 1,
      weighted_avg_delay: 1.95
    }
  };
};

export const useBalenaCacheData = () => {
  const [currentData, setCurrentData] = useState<BalenaCacheResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  // Create a ref to track active requests
  const activeRequestRef = useRef<AbortController | null>(null);
  const COOLDOWN_DURATION = 15000; // 15 seconds cooldown

  // Function to check if we're in cooldown period
  const isInCooldown = (): boolean => {
    if (!lastRefreshTime) return false;
    const timeSinceLastRefresh = Date.now() - lastRefreshTime;
    return timeSinceLastRefresh < COOLDOWN_DURATION;
  };

  // Start cooldown timer when lastRefreshTime changes
  useEffect(() => {
    if (lastRefreshTime) {
      setCooldownActive(true);
      const cooldownTimer = setTimeout(() => {
        setCooldownActive(false);
      }, COOLDOWN_DURATION);
      
      // Clean up timer
      return () => clearTimeout(cooldownTimer);
    }
  }, [lastRefreshTime]);

  const fetchData = async () => {
    // Check cooldown period
    if (isInCooldown()) {
      const remainingCooldown = Math.ceil((COOLDOWN_DURATION - (Date.now() - lastRefreshTime!)) / 1000);
      toast.warning(`Please wait ${remainingCooldown} seconds before refreshing again`);
      return;
    }

    // If there's an ongoing request, abort it
    if (activeRequestRef.current) {
      console.log('Aborting previous request');
      activeRequestRef.current.abort();
    }
    
    // Create a new abort controller for this request
    const abortController = new AbortController();
    activeRequestRef.current = abortController;
    
    setIsLoading(true);
    try {
      console.log('Attempting to fetch balena cache data...');
      
      let data: BalenaCacheResponse;
      
      try {
        // Add a timestamp query parameter to prevent caching
        data = await fetchBalenaCacheData(abortController.signal, true);
        console.log('Balena Cache Data Retrieved:', data);
        
        if (isUsingMockData) {
          setIsUsingMockData(false);
          toast.success('API connection restored');
        }
      } catch (fetchError) {
        // Check if the error was due to an aborted request
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.log('Request was aborted by a new request');
          return; // Exit early, don't update state
        }
        
        console.error('API fetch failed, using mock data instead:', fetchError);
        
        if (!isUsingMockData) {
          setIsUsingMockData(true);
          toast.warning('Using mock data - CORS issues detected. API connection failed');
        }
        
        data = generateMockData();
        setError("CORS issues detected. Unable to connect to the API.");
      }
      
      // Only update state if this is still the active request
      if (activeRequestRef.current === abortController && !abortController.signal.aborted) {
        setCurrentData(data);
        // Record the time of successful refresh
        setLastRefreshTime(Date.now());
      }
    } catch (err) {
      // Only update error state if this is still the active request
      if (activeRequestRef.current === abortController && !abortController.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        console.error('General error:', errorMessage);
        setError(errorMessage);
      }
    } finally {
      // Clean up only if this is the current request
      if (activeRequestRef.current === abortController) {
        setIsLoading(false);
        activeRequestRef.current = null;
      }
    }
  };

  return { currentData, error, isUsingMockData, isLoading, cooldownActive, refreshData: fetchData, cooldownDuration: COOLDOWN_DURATION };
};
