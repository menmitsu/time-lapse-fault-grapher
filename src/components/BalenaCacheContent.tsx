
import React from 'react';
import { useBalenaCacheData } from '../hooks/useBalenaCacheData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import BalenaCacheTable from './BalenaCacheTable';

const BalenaCacheContent = () => {
  const { 
    currentData, 
    error, 
    isUsingMockData, 
    isLoading, 
    refreshData,
    cooldownActive
  } = useBalenaCacheData();

  // Transform the BalenaCacheResponse object into an array of BalenaData objects
  const transformedData = React.useMemo(() => {
    if (!currentData) return [];
    
    return Object.entries(currentData).map(([location, data]) => {
      // Calculate delay percentage
      const delayPercentage = data.total_1s_frames_captured > 0
        ? (data.total_delayed_frames / data.total_1s_frames_captured) * 100
        : 0;
      
      // Extract server IP from location if needed
      const serverIp = location.includes('_') 
        ? location.split('_')[0] 
        : '';
      
      return {
        location: location.replace(/^\d+\w+_/, ''), // Remove prefix like "0MNYH_" if present
        total_delayed_frames: data.total_delayed_frames,
        total_1s_frames_captured: data.total_1s_frames_captured,
        average_upload_time_ms: data.average_upload_time_ms,
        min_upload_time_ms: data.min_upload_time_ms,
        max_upload_time_ms: data.max_upload_time_ms,
        delayPercentage,
        serverIp
      };
    });
  }, [currentData]);

  return (
    <Card className="rounded-lg shadow-lg bg-white/50 backdrop-blur-sm border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Balena Cache Statistics
          </h2>
          <Button 
            onClick={refreshData} 
            className="flex items-center gap-2" 
            variant="outline" 
            disabled={isLoading || cooldownActive}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
        
        {error && !isUsingMockData && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isUsingMockData && (
          <Alert variant="destructive" className="mb-6 border-amber-500 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>
              Could not connect to the balena cache data source. Displaying mock data for demonstration purposes.
              <div className="mt-2">
                <Button 
                  onClick={refreshData} 
                  variant="outline" 
                  size="sm" 
                  className="text-amber-600 border-amber-300"
                  disabled={cooldownActive}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
          <BalenaCacheTable data={transformedData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default BalenaCacheContent;
