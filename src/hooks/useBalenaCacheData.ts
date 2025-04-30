
import { useState, useRef } from 'react';
import { fetchBalenaCacheData, BalenaCacheResponse } from '../services/balenaCacheService';
import { toast } from '@/components/ui/sonner';

// Mock data for when API requests fail
const generateMockData = (): BalenaCacheResponse => {
  return {
    "0MNYH_mayfieldGarden123": {
      cache_frames_with_delay_more_than_1s: 174,
      delay_times: [2, 3, 2, 2, 2, 2, 2],
      last_frame_timestamp: "2025-04-30 13:32:50",
      start_timestamp: "2025-04-30 12:57:45",
      total_1s_frames_captured: 1933,
      total_delayed_frames: 174,
      total_reconnect_instances: 0,
      weighted_avg_delay: 2.13
    },
    "1ABCD_downtownStation": {
      cache_frames_with_delay_more_than_1s: 250,
      delay_times: [2, 4, 3, 2, 3],
      last_frame_timestamp: "2025-04-30 13:30:20",
      start_timestamp: "2025-04-30 12:50:15",
      total_1s_frames_captured: 2400,
      total_delayed_frames: 250,
      total_reconnect_instances: 2,
      weighted_avg_delay: 2.8
    }
  };
};

export const useBalenaCacheData = () => {
  const [currentData, setCurrentData] = useState<BalenaCacheResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Create a ref to track active requests
  const activeRequestRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
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
        data = await fetchBalenaCacheData(abortController.signal);
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
          toast.warning('Using mock data - API connection failed');
        }
        
        data = generateMockData();
      }
      
      // Only update state if this is still the active request
      if (activeRequestRef.current === abortController && !abortController.signal.aborted) {
        setCurrentData(data);
        setError(null);
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

  return { currentData, error, isUsingMockData, isLoading, refreshData: fetchData };
};
