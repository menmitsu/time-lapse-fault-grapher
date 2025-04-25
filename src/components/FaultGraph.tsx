
import { useMemo } from 'react';
import { useFaultData } from '../hooks/useFaultData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import TimeseriesGraph from './TimeseriesGraph';
import { Button } from '@/components/ui/button';

const FaultGraph = () => {
  const { timeSeriesData, error, isUsingMockData, refreshData } = useFaultData();

  const formattedData = useMemo(() => {
    // Group data points by timestamp
    const groupedByTime = timeSeriesData.reduce((acc, point) => {
      const timeKey = format(point.timestamp, 'HH:mm:ss');
      if (!acc[timeKey]) {
        acc[timeKey] = { timestamp: timeKey };
      }
      
      const locationKey = `${point.center}_${point.type}`;
      acc[timeKey][locationKey] = point.value;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by timestamp
    return Object.values(groupedByTime).sort((a, b) => 
      new Date('1970/01/01 ' + a.timestamp).getTime() - 
      new Date('1970/01/01 ' + b.timestamp).getTime()
    );
  }, [timeSeriesData]);

  const uniqueLocations = useMemo(() => 
    Array.from(new Set(timeSeriesData.map(point => point.center))),
    [timeSeriesData]
  );

  if (error && !isUsingMockData) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Fault Monitoring Dashboard</h2>
        <Button 
          onClick={refreshData}
          className="flex items-center gap-2"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
      
      {isUsingMockData && (
        <Alert variant="destructive" className="border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>
            Could not connect to the data source. Displaying mock data for demonstration purposes.
            <div className="mt-2">
              <Button 
                onClick={refreshData} 
                variant="outline" 
                size="sm"
                className="text-amber-600 border-amber-300"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <TimeseriesGraph 
        data={formattedData}
        type="5s"
        locations={uniqueLocations}
      />
      
      <TimeseriesGraph 
        data={formattedData}
        type="10s"
        locations={uniqueLocations}
      />
    </div>
  );
};

export default FaultGraph;
