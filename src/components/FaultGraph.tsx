
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useFaultData } from '../hooks/useFaultData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const FaultGraph = () => {
  const { timeSeriesData, error, isUsingMockData } = useFaultData();

  const formattedData = useMemo(() => {
    // Get unique locations
    const uniqueLocations = Array.from(
      new Set(timeSeriesData.map(point => point.center))
    );

    return uniqueLocations.map(location => {
      return {
        location: location.split('_')[0], // Only show the ID part
        location_full: location, // Keep full name for tooltip
        fault_count_5s: timeSeriesData.find(
          point => point.center === location && point.type === '5s'
        )?.value || 0,
        fault_count_10s: timeSeriesData.find(
          point => point.center === location && point.type === '10s'
        )?.value || 0,
      };
    }).sort((a, b) => b.fault_count_5s + b.fault_count_10s - (a.fault_count_5s + a.fault_count_10s));
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
      <h2 className="text-2xl font-bold mb-4">Fault Count by Location</h2>
      
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
        <BarChart 
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="location" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(value, entry) => {
              const item = entry[0]?.payload;
              return item ? `Location: ${item.location_full}` : value;
            }}
          />
          <Legend />
          <Bar dataKey="fault_count_5s" name="5s Faults" fill="#10B981" />
          <Bar dataKey="fault_count_10s" name="10s Faults" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FaultGraph;
