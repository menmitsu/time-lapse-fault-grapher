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
  const fault_count_5s: { [key: string]: number } = {};
  const fault_count_10s: { [key: string]: number } = {};
  
  // Generate random values for each center
  centers.forEach(center => {
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

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    const fetchData = async () => {
      while (retryCount < MAX_RETRIES) {
        try {
          console.log(`Attempting to fetch fault data... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          
          let data: FaultData;
          
          try {
            data = await fetchFaultData();
            console.log('Fault Data Retrieved:', data);
            
            if (isUsingMockData) {
              setIsUsingMockData(false);
              toast.success('API connection restored');
            }
            
            // Reset retry count on successful fetch
            retryCount = 0;
            break; // Exit retry loop on success
          } catch (fetchError) {
            retryCount++;
            console.error(`API fetch failed (attempt ${retryCount}/${MAX_RETRIES}):`, fetchError);
            
            if (retryCount === MAX_RETRIES) {
              if (!isUsingMockData) {
                setIsUsingMockData(true);
                toast.warning('Using mock data - API connection failed after 3 attempts');
              }
              
              // Use mock data when all retries fail
              data = generateMockData();
            } else {
              // Wait 2 seconds before retrying
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue; // Try again
            }
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
              // Keep only last 60 data points (5 hours worth of data with 5-minute intervals)
              const newData = [...current, ...newPoints];
              return newData.slice(-144); // 12 points per hour * 12 hours
            });
            
            setError(null);
          }
          
          break; // Exit retry loop on successful processing
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
          console.error('General error:', errorMessage);
          
          if (isMounted) {
            setError(errorMessage);
          }
          
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    };

    // Initial fetch
    fetchData();

    // Update every 5 minutes
    const intervalId = setInterval(fetchData, FIVE_MINUTES);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isUsingMockData]);

  return { timeSeriesData, error, isUsingMockData };
};
