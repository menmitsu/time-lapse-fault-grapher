import { useState, useEffect } from 'react';
import { fetchFaultData, FaultData } from '../services/faultDataService';
import { toast } from '@/components/ui/sonner';

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  center: string;
  type: '5s' | '10s';
}

export const useFaultData = () => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds
    
    const fetchData = async () => {
      try {
        const data = await fetchFaultData();
        
        // Check if we're using mock data by testing if the timestamp is recent
        const mockDataDetected = !data.timestamp || new Date(data.timestamp).getTime() > Date.now() - 100;
        
        if (mockDataDetected && !isUsingMockData) {
          setIsUsingMockData(true);
          toast.warning('Using mock data - API connection failed');
        } else if (!mockDataDetected && isUsingMockData) {
          setIsUsingMockData(false);
          toast.success('API connection restored');
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
          retryCount = 0; // Reset retry count on success
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        console.error('Fetch error:', errorMessage);
        
        if (isMounted) {
          setError(errorMessage);
          
          // Implement exponential backoff for retries
          if (retryCount < maxRetries) {
            retryCount++;
            const backoffTime = retryDelay * Math.pow(2, retryCount - 1);
            console.log(`Retrying in ${backoffTime}ms (attempt ${retryCount})`);
            
            setTimeout(fetchData, backoffTime);
          } else if (!isUsingMockData) {
            setIsUsingMockData(true);
            toast.error('Connection failed after multiple retries. Using mock data.');
          }
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
