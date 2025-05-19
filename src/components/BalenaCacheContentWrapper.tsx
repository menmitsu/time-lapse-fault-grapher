
import { useEffect } from 'react';
import { useBalenaCacheData } from '../hooks/useBalenaCacheData';
import BalenaCacheContent from './BalenaCacheContent';

interface BalenaCacheContentWrapperProps {
  isActive: boolean;
}

const BalenaCacheContentWrapper = ({ isActive }: BalenaCacheContentWrapperProps) => {
  const { refreshData } = useBalenaCacheData();
  
  useEffect(() => {
    if (isActive) {
      console.log("BalenaCache tab is active, loading data...");
      refreshData();
    }
  }, [isActive, refreshData]);

  return <BalenaCacheContent />;
};

export default BalenaCacheContentWrapper;
