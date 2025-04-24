
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFaultData } from '../hooks/useFaultData';

const colors = {
  '5s': '#10B981',
  '10s': '#3B82F6'
};

const FaultGraph = () => {
  const { timeSeriesData, error } = useFaultData();

  const formattedData = useMemo(() => {
    const grouped = timeSeriesData.reduce((acc, point) => {
      const key = point.timestamp.toISOString();
      if (!acc[key]) {
        acc[key] = {
          timestamp: point.timestamp,
        };
      }
      const identifier = `${point.type}_${point.center}`;
      acc[key][identifier] = point.value;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }, [timeSeriesData]);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Fault Count Time Series</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(label) => new Date(label).toLocaleTimeString()}
          />
          <Legend />
          {timeSeriesData.length > 0 &&
            Array.from(
              new Set(
                timeSeriesData.map(
                  (point) => `${point.type}_${point.center}`
                )
              )
            ).map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[key.split('_')[0] as '5s' | '10s']}
                dot={false}
                name={`${key.split('_')[1]} (${key.split('_')[0]})`}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FaultGraph;
