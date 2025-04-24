import { useState, useEffect } from 'react';
import { fetchFaultData, FaultData } from '../services/faultDataService';
import { toast } from '@/components/ui/sonner';

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  center: string;
  type: '5s' | '10s';
}

// Mock data to use when API is unavailable
const generateMockData = (): FaultData => {
  const centers = ['center1', 'center2', 'center3', 'center4'];
  const mockData: FaultData = {
    fault_count_5s: {},
    fault_count_10s: {},
    timestamp: new Date().toISOString()
  };
  
  // Generate random values for each center
  centers.forEach(center => {
    mockData.fault_count_5s[center] = Math.floor(Math.random() * 10);
    mockData.fault_count_10s[center] = Math.floor(Math.random() * 5);
  });
  
  return mockData;
};

export const useFaultData = () => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

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
            // Keep only last 60 data points (5 minutes worth of data)
            const newData = [...current, ...newPoints];
            return newData.slice(-720); // 12 points per minute * 60 minutes
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

    // Set up intervals for data fetching (every 5 seconds)
    const intervalId = setInterval(fetchData, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isUsingMockData]);

  return { timeSeriesData, error, isUsingMockData };
};
