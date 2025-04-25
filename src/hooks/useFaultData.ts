
import { useState, useEffect } from 'react';
import { fetchFaultData, FaultData } from '../services/faultDataService';
import { toast } from '@/components/ui/sonner';

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  center: string;
  type: '5s' | '10s';
}

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
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [fetchAttempt, setFetchAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        console.log('Attempting to fetch fault data...'); // Added logging
        
        let data: FaultData;
        
        try {
          data = await fetchFaultData();
          console.log('Fault Data Retrieved:', data); // Log the retrieved data
          
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
          
          // Use mock data when API fails
          data = generateMockData();
        }
        
        const timestamp = new Date();
        
        const newPoints: TimeSeriesPoint[] = [];
        
        // Process 5s fault counts
        Object.entries(data.fault_count_5s).forEach(([center, value]) => {
          newPoints.push({
            timestamp,
            value,
            center,
            type: '5s'
          });
        });
        
        // Process 10s fault counts
        Object.entries(data.fault_count_10s).forEach(([center, value]) => {
          newPoints.push({
            timestamp,
            value,
            center,
            type: '10s'
          });
        });
        
        if (isMounted) {
          setTimeSeriesData(current => {
            // Keep only last 144 data points (12 hours of 5-minute intervals)
            const newData = [...current, ...newPoints];
            return newData.slice(-144 * CENTERS.length); // Now using the constant CENTERS
          });
          
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

  return { timeSeriesData, error, isUsingMockData, refreshData };
};
