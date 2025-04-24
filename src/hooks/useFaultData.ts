import { useState, useEffect } from 'react';
import { fetchFaultData, FaultData } from '../services/faultDataService';

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  center: string;
  type: '5s' | '10s';
}

export const useFaultData = () => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchFaultData();
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
        
        setTimeSeriesData(current => {
          // Keep only last 60 data points (5 minutes worth of data)
          const newData = [...current, ...newPoints];
          return newData.slice(-720); // 12 points per minute * 60 minutes
        });
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    };

    // Initial fetch
    fetchData();

    // Set up intervals for data fetching (every 5 seconds)
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return { timeSeriesData, error };
};
