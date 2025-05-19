
import CleaningStatistics from './CleaningStatistics';
import { useEffect } from 'react';
import { useCleaningData } from '../hooks/useCleaningData';

interface CleaningStatisticsWrapperProps {
  isActive: boolean;
}

const CleaningStatisticsWrapper = ({ isActive }: CleaningStatisticsWrapperProps) => {
  const { loadData } = useCleaningData();
  
  useEffect(() => {
    if (isActive) {
      console.log("Cleaning Stats tab is active, loading data...");
      loadData();
    }
  }, [isActive, loadData]);

  return <CleaningStatistics />;
};

export default CleaningStatisticsWrapper;
