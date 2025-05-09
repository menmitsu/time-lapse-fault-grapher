import { useEffect } from 'react';
import { useCleaningData } from '../hooks/useCleaningData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import CleaningTable from './CleaningTable';

const CleaningStatistics = () => {
  const { 
    currentData, 
    error, 
    isUsingMockData, 
    isLoading, 
    cooldownActive,
    cooldownStartTime, 
    refreshData 
  } = useCleaningData();

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
        // Calculate the frames missed
        const framesMissed = data.total_frames_should_have_recieved_since_first_frame - 
                             data.total_frames_recieved_since_first_frame;
        
        // Calculate miss percentage
        const missPercentage = data.total_frames_should_have_recieved_since_first_frame > 0 
          ? (framesMissed / data.total_frames_should_have_recieved_since_first_frame) * 100
          : 0;
        
        // Ensure serverIp is always present
        return {
          location,
          ...data,
          frames_missed: framesMissed,
          frames_missed_percentage: parseFloat(missPercentage.toFixed(2)),
          serverIp: data.serverIp || '35.244.44.28:5020' // Default value if serverIp is missing
        };
      }) 
    : [];

  const handleRefresh = () => {
    console.log('Refreshing cleaning stats data...');
    
    if (!isLoading && !cooldownActive) {
      toast.info('Refreshing data...', {
        duration: 2000,
      });
      refreshData().catch(err => {
        console.error('Error during manual refresh:', err);
      });
    } else if (cooldownActive) {
      const remainingTime = cooldownStartTime ? Math.ceil((15000 - (Date.now() - cooldownStartTime)) / 1000) : 15;
      toast.warning(`Please wait ${remainingTime}s before refreshing again`);
    }
  };

  // If there's an error but we still have mock data to display
  const renderErrorAlert = () => {
    if (!error && !isUsingMockData) return null;
    
    return (
      <Alert 
        variant={isUsingMockData ? "default" : "destructive"} 
        className={`mb-6 ${isUsingMockData ? "border-amber-500 bg-amber-50" : ""}`}
      >
        {isUsingMockData ? (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertTitle>{isUsingMockData ? "Connection Issue - CORS Error" : "Error"}</AlertTitle>
        <AlertDescription>
          {isUsingMockData 
            ? "Could not connect to the cleaning statistics data source due to CORS restrictions. Displaying mock data for demonstration purposes."
            : error}
          <div className="mt-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className={isUsingMockData ? "text-amber-600 border-amber-300" : ""}
              disabled={isLoading || cooldownActive}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again {cooldownActive && cooldownStartTime ? `(${Math.ceil((15000 - (Date.now() - cooldownStartTime)) / 1000)}s)` : ""}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // If there's a critical error and no mock data
  if (error && !currentData) {
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
            Cleaning Station Metrics
          </h2>
          <Button 
            onClick={handleRefresh}
            className="flex items-center gap-2"
            variant="outline"
            disabled={isLoading || cooldownActive}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {cooldownActive ? `Cooling Down (15s)...` : isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        
        {renderErrorAlert()}
        
        <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
          <CleaningTable data={tableData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CleaningStatistics;
