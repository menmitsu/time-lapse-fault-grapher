
import { useState, useCallback } from 'react';
import { CenterData, fetchCenterData } from '../services/centerOnboardingService';
import { toast } from "@/components/ui/sonner";

export function useCenterOnboardingData() {
  const [data, setData] = useState<CenterData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);

  // Mock data for testing or when API fails
  const mockHeaders = ["ID", "Center", "Classroom", "Status", "Date"];
  const mockData: CenterData[] = [
    {
      id: '1',
      "ID": "1",
      "Center": "Delhi Center",
      "Classroom": "Classroom A",
      "Status": "Complete",
      "Date": "2025-05-10"
    },
    {
      id: '2',
      "ID": "2",
      "Center": "Mumbai Center",
      "Classroom": "Classroom B",
      "Status": "Incomplete",
      "Date": "2025-05-12"
    },
    {
      id: '3',
      "ID": "3",
      "Center": "Bangalore Center",
      "Classroom": "Classroom C",
      "Status": "Complete",
      "Date": "2025-05-15"
    }
  ];

  // Use useCallback to avoid unnecessary rerenders
  const loadData = useCallback(async () => {
    // Don't start loading if already in progress
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching center data...");
      const result = await fetchCenterData();
      console.log("Fetched data length:", result.data.length);
      
      if (result.data.length > 0 && result.headers.length > 0) {
        setIsUsingMockData(false);
        setHeaders(result.headers);
        setData(result.data);
        toast.success(`Loaded ${result.data.length} center records`);
      } else {
        // Use mock data if API returns empty
        console.log("Using mock data due to empty API response");
        setIsUsingMockData(true);
        setHeaders(mockHeaders);
        setData(mockData);
        toast.warning("Using mock data for center onboarding");
      }
    } catch (error) {
      console.error("Error loading center data:", error);
      setError("Failed to load center data. Using mock data instead.");
      setIsUsingMockData(true);
      setHeaders(mockHeaders);
      setData(mockData);
      toast.error("Failed to load real data, using mock data");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]); // Add isLoading as dependency to prevent multiple calls when already loading

  return {
    data,
    headers,
    isLoading,
    error,
    isUsingMockData,
    loadData
  };
}
