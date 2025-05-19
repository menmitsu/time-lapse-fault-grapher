
import { useState, useEffect } from 'react';
import { CenterData, fetchCenterData, processCenterData } from '../services/centerOnboardingService';
import { toast } from "@/components/ui/sonner";

export function useCenterOnboardingData() {
  const [data, setData] = useState<CenterData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);

  // Mock data for testing or when API fails
  const mockData: CenterData[] = [
    {
      id: '1',
      center: 'Delhi Center',
      classroom: 'Classroom A',
      dataGatheringComplete: 'Yes',
      reEvaluation: 'No',
      notes: 'Needs re-evaluation due to technical issues',
      date: '2025-05-10'
    },
    {
      id: '2',
      center: 'Mumbai Center',
      classroom: 'Classroom B',
      dataGatheringComplete: 'No',
      reEvaluation: 'Yes',
      notes: 'Data gathering in progress',
      date: '2025-05-12'
    },
    {
      id: '3',
      center: 'Bangalore Center',
      classroom: 'Classroom C',
      dataGatheringComplete: 'Yes',
      reEvaluation: 'Yes',
      notes: 'All complete',
      date: '2025-05-15'
    },
    {
      id: '4',
      center: 'Chennai Center',
      classroom: 'Classroom D',
      dataGatheringComplete: 'No',
      reEvaluation: 'No',
      notes: 'Critical: Needs immediate attention',
      date: '2025-05-08'
    }
  ];

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedData = await fetchCenterData();
      
      if (fetchedData.length > 0) {
        setIsUsingMockData(false);
        setData(processCenterData(fetchedData));
      } else {
        // Use mock data if API returns empty
        setIsUsingMockData(true);
        setData(processCenterData(mockData));
        toast.warning("Using mock data for center onboarding");
      }
    } catch (error) {
      console.error("Error loading center data:", error);
      setError("Failed to load center data. Using mock data instead.");
      setIsUsingMockData(true);
      setData(processCenterData(mockData));
      toast.error("Failed to load real data, using mock data");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to load data on mount
  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    isLoading,
    error,
    isUsingMockData,
    refreshData: loadData
  };
}
