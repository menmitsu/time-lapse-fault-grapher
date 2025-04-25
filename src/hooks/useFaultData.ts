
import { useState, useEffect } from 'react';
import { fetchFaultData, FaultData } from '../services/faultDataService';
import { toast } from '@/components/ui/sonner';

// Define centers at module scope so it's available throughout the file
const CENTERS = ['center1', 'center2', 'center3', 'center4'];

// Mock data to use when API is unavailable
const generateMockData = (): FaultData => {
  const fault_count_5s: { [key: string]: number } = {};
  const fault_count_10s: { [key: string]: number } = {};
  
  // Generate random values for each center
  CENTERS.forEach(center => {
    fault_count_5s[center] = Math.floor(Math.random() * 10);
    fault_count_10s[center] = Math.floor(Math.random() * 5);
  });
  
  return {
    fault_count_5s,
    fault_count_10s,
    timestamp: new Date().toISOString()
  };
};

export const useFaultData = () => {
  const [currentData, setCurrentData] = useState<FaultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [fetchAttempt, setFetchAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
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
        
        if (isMounted) {
          setCurrentData(data);
          setError(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        console.error('General error:', errorMessage);
        
        if (isMounted) {
          setError(errorMessage);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Manual retry button trigger
    if (fetchAttempt > 0) {
      fetchData();
    }

    // Update every 5 minutes (300000 ms)
    const FIVE_MINUTES = 5 * 60 * 1000;
    const intervalId = setInterval(fetchData, FIVE_MINUTES);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isUsingMockData, fetchAttempt]);

  // Function to manually trigger a refresh
  const refreshData = () => {
    setFetchAttempt(prev => prev + 1);
    toast.info('Refreshing data...');
  };

  return { currentData, error, isUsingMockData, refreshData };
};
