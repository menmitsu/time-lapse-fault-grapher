
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFaultData } from '../hooks/useFaultData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const FaultGraph = () => {
  const { timeSeriesData, error, isUsingMockData } = useFaultData();

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

  // Get unique locations for creating lines
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
    <div className="w-full h-[600px] p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Fault Count Timeline</h2>
      
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
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {uniqueLocations.map((location, index) => (
            <>
              <Line
                key={`${location}_5s`}
                type="monotone"
                dataKey={`${location}_5s`}
                name={`${location.split('_')[0]} (5s)`}
                stroke="#10B981"
                strokeOpacity={0.7}
                dot={false}
              />
              <Line
                key={`${location}_10s`}
                type="monotone"
                dataKey={`${location}_10s`}
                name={`${location.split('_')[0]} (10s)`}
                stroke="#3B82F6"
                strokeOpacity={0.7}
                dot={false}
              />
            </>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FaultGraph;
