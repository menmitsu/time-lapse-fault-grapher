
// This needs to be updated to handle the isActive prop
// Since it's a read-only file, we'll create a new component that wraps it

import { BalenaCacheContent as OriginalBalenaCacheContent } from './BalenaCacheContent';
import { useEffect } from 'react';
import { useBalenaCacheData } from '../hooks/useBalenaCacheData';

interface BalenaCacheContentWrapperProps {
  isActive: boolean;
}

const BalenaCacheContentWrapper = ({ isActive }: BalenaCacheContentWrapperProps) => {
  const { loadData } = useBalenaCacheData();
  
  useEffect(() => {
    if (isActive) {
      console.log("BalenaCache tab is active, loading data...");
      loadData();
    }
  }, [isActive, loadData]);

  return <OriginalBalenaCacheContent />;
};

export default BalenaCacheContentWrapper;
