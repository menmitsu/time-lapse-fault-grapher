
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
  const { loadData: loadBalenaData } = useBalenaCacheData();
  const { loadData: loadCleaningData } = useCleaningData();
  
  useEffect(() => {
    if (isActive) {
      console.log("All Stats tab is active, loading all data...");
      refreshFaultData();
      loadBalenaData();
      loadCleaningData();
    }
  }, [isActive, refreshFaultData, loadBalenaData, loadCleaningData]);

  return <AllStatistics />;
};

export default AllStatisticsWrapper;
