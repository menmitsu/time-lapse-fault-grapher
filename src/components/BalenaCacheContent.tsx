
import { useEffect } from 'react';
import { useBalenaCacheData } from '../hooks/useBalenaCacheData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BalenaCacheTable from './BalenaCacheTable';
import { toast } from '@/components/ui/sonner';

const BalenaCacheContent = () => {
  const { currentData, error, isUsingMockData, isLoading, cooldownActive, refreshData } = useBalenaCacheData();

  // Add effect to fetch data on component mount
  useEffect(() => {
    const initialFetch = async () => {
      try {
        await refreshData();
      } catch (err) {
        console.error('Initial data fetch failed:', err);
      }
    };
    
    initialFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tableData = currentData 
    ? Object.entries(currentData).map(([location, data]) => {
        // Calculate the delay percentage
        const delayPercentage = (data.total_delayed_frames / data.total_1s_frames_captured) * 100;
        
        return {
          location,
          ...data,
          delayPercentage,
          serverIp: '34.93.233.94' // This endpoint is currently only from one server
        };
      }) 
    : [];

  const handleRefresh = () => {
    console.log('Refreshing balena cache data...');
    
    if (!isLoading && !cooldownActive) {
      toast.info('Refreshing data...', {
        duration: 2000,
      });
      refreshData().catch(err => {
        console.error('Error during manual refresh:', err);
      });
    } else if (cooldownActive) {
      toast.warning('Please wait before refreshing again');
    }
  };

  if (error && !isUsingMockData) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          className="mt-4"
          disabled={isLoading || cooldownActive}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <Card className="rounded-lg shadow-lg bg-white/50 backdrop-blur-sm border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Capturing Container Metrics
          </h2>
          <Button 
            onClick={handleRefresh}
            className="flex items-center gap-2"
            variant="outline"
            disabled={isLoading || cooldownActive}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {cooldownActive ? 'Cooling Down...' : isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        
        {isUsingMockData && (
          <Alert variant="destructive" className="mb-6 border-amber-500 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>
              Could not connect to the data source. Displaying mock data for demonstration purposes.
              <div className="mt-2">
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="sm"
                  className="text-amber-600 border-amber-300"
                  disabled={isLoading || cooldownActive}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
          <BalenaCacheTable data={tableData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default BalenaCacheContent;
