
import AllStatistics from './AllStatistics';
import { useEffect } from 'react';
import { useFaultData } from '../hooks/useFaultData';
import { useBalenaCacheData } from '../hooks/useBalenaCacheData';
import { useCleaningData } from '../hooks/useCleaningData';

interface AllStatisticsWrapperProps {
  isActive: boolean;
}

const AllStatisticsWrapper = ({ isActive }: AllStatisticsWrapperProps) => {
  const { refreshData: refreshFaultData } = useFaultData();
  const { refreshData: refreshBalenaData } = useBalenaCacheData();
  const { refreshData: refreshCleaningData } = useCleaningData();
  
  useEffect(() => {
    if (isActive) {
      console.log("All Stats tab is active, loading all data...");
      refreshFaultData();
      refreshBalenaData();
      refreshCleaningData();
    }
  }, [isActive, refreshFaultData, refreshBalenaData, refreshCleaningData]);

  return <AllStatistics />;
};

export default AllStatisticsWrapper;
