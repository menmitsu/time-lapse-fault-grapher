
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimeseriesGraphProps {
  data: any[];
  type: '5s' | '10s';
  locations: string[];
}

const colors = [
  '#10B981', '#3B82F6', '#F97316', '#8B5CF6', '#D946EF', 
  '#059669', '#2563EB', '#EA580C', '#7C3AED', '#C026D3',
  '#047857', '#1D4ED8', '#C2410C', '#6D28D9', '#A21CAF',
  '#065F46', '#1E40AF', '#9A3412', '#5B21B6', '#86198F',
  '#064E3B', '#1E3A8A', '#7C2D12', '#4C1D95', '#701A75',
  '#14532D', '#172554', '#431407', '#3B0764', '#4A044E',
  '#052E16', '#082F49', '#27272A', '#581C87', '#831843',
  '#022C22', '#0C4A6E', '#18181B', '#6B21A8', '#9D174D'
];

const TimeseriesGraph = ({ data, type, locations }: TimeseriesGraphProps) => {
  return (
    <div className="w-full h-[800px] bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-xl font-semibold mb-4">
        Fault Count Timeline ({type})
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 120, left: 100, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis 
            dataKey="timestamp"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis 
            width={90}
            label={{ 
              value: 'Fault Count',
              angle: -90,
              position: 'insideLeft',
              offset: -10
            }}
          />
          <Tooltip 
            content={(props) => {
              const { active, payload, label } = props;
              if (!active || !payload?.length) return null;
              
              return (
                <div className="bg-white/95 dark:bg-gray-950/95 shadow-lg p-4 rounded-md border border-gray-200">
                  <p className="font-medium text-sm mb-2">{label}</p>
                  <div className="max-h-[400px] overflow-y-auto">
                    {payload.map((entry: any, index: number) => (
                      <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-sm py-1">
                        <span style={{ color: entry.color }}>{entry.name}</span>
                        <span className="font-mono font-medium">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          {locations.map((location, idx) => (
            <Line
              key={`${location}_${type}`}
              type="monotone"
              dataKey={`${location}_${type}`}
              name={location}
              stroke={colors[idx % colors.length]}
              strokeWidth={2}
              dot={false}
              label={{
                position: 'right',
                offset: 10,
                fill: colors[idx % colors.length],
                fontSize: 12,
                content: (props: any) => {
                  return props.index === data.length - 1 ? location : '';
                }
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeseriesGraph;
