
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BalenaCacheData } from '../services/balenaCacheService';
import { Badge } from './ui/badge';

interface BalenaCacheTableProps {
  data: Array<{ 
    location: string;
    delayPercentage: number;
    serverIp: string;
  } & BalenaCacheData>;
}

type SortableFields = keyof (BalenaCacheData & { location: string; delayPercentage: number; serverIp: string });

const getBackgroundColor = (percentage: number) => {
  if (percentage < 5) return 'bg-[#F2FCE2]';
  if (percentage <= 10) return 'bg-[#FEF7CD]';
  return 'bg-red-50';
};

const getTextColor = (percentage: number) => {
  if (percentage < 5) return 'text-green-700';
  if (percentage <= 10) return 'text-yellow-700';
  return 'text-red-700';
};

const isFrameStale = (timestamp: string) => {
  const frameTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  const fiveMinutesInMs = 5 * 60 * 1000;
  
  return (currentTime - frameTime) > fiveMinutesInMs;
};

const BalenaCacheTable = ({ data }: BalenaCacheTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableFields;
    direction: 'asc' | 'desc';
  }>({
    key: 'delayPercentage',
    direction: 'desc'
  });

  const sortedData = [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: SortableFields) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'desc'
          ? 'asc'
          : 'desc',
    });
  };

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/70">
            <TableHead className="font-semibold">
              <Button
                variant="ghost"
                onClick={() => requestSort('location')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Location (Server IP)
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('total_delayed_frames')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Delayed Frames
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('total_1s_frames_captured')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Total Frames
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('delayPercentage')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Delay %
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('weighted_avg_delay')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Avg Delay (s)
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('median_delay')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Median Delay (s)
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('start_timestamp')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                First Frame
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('last_frame_timestamp')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Last Frame
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('total_reconnect_instances')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Reconnects
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => {
            const isStale = isFrameStale(row.last_frame_timestamp);
            
            return (
              <TableRow key={row.location} className="hover:bg-gray-50/50">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{row.location}</span>
                    <span className="text-xs text-gray-500">{row.serverIp}</span>
                  </div>
                </TableCell>
                <TableCell>{row.total_delayed_frames}</TableCell>
                <TableCell>{row.total_1s_frames_captured}</TableCell>
                <TableCell 
                  className={`font-medium ${getBackgroundColor(row.delayPercentage)} ${getTextColor(row.delayPercentage)}`}
                >
                  <div className="flex items-center gap-2">
                    {row.delayPercentage.toFixed(2)}%
                    {row.delayPercentage > 5 && (
                      <Badge variant="destructive" className="text-xs">High</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{row.weighted_avg_delay}</TableCell>
                <TableCell>{row.median_delay}</TableCell>
                <TableCell>{new Date(row.start_timestamp).toLocaleString()}</TableCell>
                <TableCell className={isStale ? 'bg-red-50 text-red-700 font-medium' : ''}>
                  <div className="flex items-center gap-2">
                    {new Date(row.last_frame_timestamp).toLocaleString()}
                    {isStale && (
                      <Badge variant="destructive" className="text-xs">Stale</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{row.total_reconnect_instances}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default BalenaCacheTable;
