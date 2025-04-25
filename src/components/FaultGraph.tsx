
import { useFaultData } from '../hooks/useFaultData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SortableTable from './SortableTable';

const FaultGraph = () => {
  const { currentData, error, isUsingMockData, refreshData } = useFaultData();

  const tableData = currentData ? Object.entries(currentData).map(([location, data]) => ({
    location,
    ...data
  })) : [];

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
      
      <SortableTable data={tableData} />
    </div>
  );
};

export default FaultGraph;
