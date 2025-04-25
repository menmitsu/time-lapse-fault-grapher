
import { useState } from 'react';
import { fetchFaultData, FaultData } from '../services/faultDataService';
import { toast } from '@/components/ui/sonner';

const generateMockData = (): FaultData => {
  return {
    "0MNYH_mayfieldGarden123": {
      first_frame_timestamp: "2025-04-25 14:56:39",
      frames_with_10s_delay: 3,
      frames_with_15s_delay: 2,
      frames_with_5s_delay: 29,
      last_frame_timestamp: "2025-04-25 18:29:56",
      total_frames_recieved_since_first_frame: 2540,
      total_frames_should_have_recieved_since_first_frame: 2561
    }
  };
};

export const useFaultData = () => {
  const [currentData, setCurrentData] = useState<FaultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log('Attempting to fetch fault data...');
      
      let data: FaultData;
      
      try {
        data = await fetchFaultData();
        console.log('Fault Data Retrieved:', data);
        
        if (isUsingMockData) {
          setIsUsingMockData(false);
          toast.success('API connection restored');
        }
      } catch (fetchError) {
        console.error('API fetch failed, using mock data instead:', fetchError);
        
        if (!isUsingMockData) {
          setIsUsingMockData(true);
          toast.warning('Using mock data - API connection failed');
        }
        
        data = generateMockData();
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

  return { currentData, error, isUsingMockData, isLoading, refreshData: fetchData };
};
