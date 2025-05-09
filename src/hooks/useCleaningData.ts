
import { useState } from 'react';
import { fetchCleaningData, CleaningData } from '../services/cleaningDataService';
import { toast } from '@/components/ui/sonner';

const generateMockCleaningData = (): CleaningData => {
  return {
    "0CXYZ_cleaningStation123": {
      first_frame_timestamp: "2025-05-08 10:30:15",
      frames_with_10s_delay: 15,
      frames_with_15s_delay: 5,
      frames_with_20s_delay: 2,
      last_frame_timestamp: "2025-05-09 11:45:30",
      total_frames_recieved_since_first_frame: 3450,
      total_frames_should_have_recieved_since_first_frame: 3500,
      serverIp: '35.244.44.28:5020'
    },
    "1DEFG_maintenanceArea456": {
      first_frame_timestamp: "2025-05-08 09:15:22",
      frames_with_10s_delay: 8,
      frames_with_15s_delay: 3,
      frames_with_20s_delay: 1,
      last_frame_timestamp: "2025-05-09 11:50:42",
      total_frames_recieved_since_first_frame: 3680,
      total_frames_should_have_recieved_since_first_frame: 3700,
      serverIp: '35.244.44.28:5020'
    },
    "2HIJK_sanitationZone789": {
      first_frame_timestamp: "2025-05-08 11:20:05",
      frames_with_10s_delay: 20,
      frames_with_15s_delay: 10,
      frames_with_20s_delay: 5,
      last_frame_timestamp: "2025-05-09 11:55:18",
      total_frames_recieved_since_first_frame: 3240,
      total_frames_should_have_recieved_since_first_frame: 3300,
      serverIp: '35.244.44.28:5020'
    }
  };
};

export const useCleaningData = () => {
  const [currentData, setCurrentData] = useState<CleaningData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownStartTime, setCooldownStartTime] = useState<number | null>(null);

  const fetchData = async () => {
    if (isLoading || cooldownActive) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting to fetch cleaning data...');
      
      let data: CleaningData;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      try {
        data = await fetchCleaningData();
        console.log('Cleaning Data Retrieved:', data);
        
        if (isUsingMockData) {
          setIsUsingMockData(false);
          toast.success('API connection restored');
        }
        
        // Set cooldown to prevent excessive refreshing
        setCooldownActive(true);
        const now = Date.now();
        setCooldownStartTime(now);
        setTimeout(() => {
          setCooldownActive(false);
          setCooldownStartTime(null);
        }, 15000); // 15 second cooldown
      } catch (fetchError) {
        console.error('API fetch failed, using mock data instead:', fetchError);
        
        if (!isUsingMockData) {
          setIsUsingMockData(true);
          toast.warning('Using mock data - API connection failed');
        }
        
        data = generateMockCleaningData();
      } finally {
        clearTimeout(timeoutId);
      }
      
      setCurrentData(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('General error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    currentData, 
    error, 
    isUsingMockData, 
    isLoading, 
    cooldownActive,
    cooldownStartTime,
    refreshData: fetchData 
  };
};
