
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useFaultData } from '../hooks/useFaultData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const TARGET_LOCATIONS = ['YNQR6_sector65Emerald123', '0MNYH_mayfieldGarden123'];

const FaultGraph = () => {
  const { timeSeriesData, error, isUsingMockData } = useFaultData();

  const formattedData = useMemo(() => {
    return TARGET_LOCATIONS.map(location => {
      const locationData = timeSeriesData.find(
        point => `${point.type}_${point.center}` === location
      );
      
      return {
        location: location.split('_')[0], // Only show the ID part
        fault_count_5s: timeSeriesData.find(
          point => point.center === location && point.type === '5s'
        )?.value || 0,
        fault_count_10s: timeSeriesData.find(
          point => point.center === location && point.type === '10s'
        )?.value || 0,
      };
    });
  }, [timeSeriesData]);

  if (error && !isUsingMockData) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Fault Count Comparison</h2>
      
      {isUsingMockData && (
        <Alert variant="destructive" className="mb-4 border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription>
            Could not connect to the data source. Displaying mock data for demonstration purposes.
          </AlertDescription>
        </Alert>
      )}
      
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="location" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="fault_count_5s" name="5s Faults" fill="#10B981" />
          <Bar dataKey="fault_count_10s" name="10s Faults" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FaultGraph;
