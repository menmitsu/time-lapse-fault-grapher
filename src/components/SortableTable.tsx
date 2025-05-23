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
import { LocationData } from '../services/faultDataService';

interface SortableTableProps {
  data: Array<{ 
    location: string; 
    frames_missed: number;
    serverIp: string; 
  } & LocationData>;
}

type SortableFields = keyof (LocationData & { 
  location: string; 
  frames_missed: number;
  serverIp: string;
});

const getBackgroundColor = (framesMissed: number) => {
  // Ensure framesMissed is never negative before checking thresholds
  const nonNegativeFramesMissed = Math.max(0, framesMissed);
  
  if (nonNegativeFramesMissed < 100) return 'bg-green-50';
  if (nonNegativeFramesMissed <= 250) return 'bg-yellow-50';
  return 'bg-red-50';
};

const getTextColor = (framesMissed: number) => {
  // Ensure framesMissed is never negative before checking thresholds
  const nonNegativeFramesMissed = Math.max(0, framesMissed);
  
  if (nonNegativeFramesMissed < 100) return 'text-green-700';
  if (nonNegativeFramesMissed <= 250) return 'text-yellow-700';
  return 'text-red-700';
};

const SortableTable = ({ data }: SortableTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableFields;
    direction: 'asc' | 'desc';
  }>({
    key: 'frames_missed',
    direction: 'desc'
  });

  // Process data to ensure no negative values
  const processedData = data.map(item => ({
    ...item,
    // Ensure all numerical values that should never be negative are non-negative
    frames_missed: Math.max(0, item.frames_missed),
    frames_with_5s_delay: item.frames_with_5s_delay !== undefined ? Math.max(0, item.frames_with_5s_delay) : 0,
    frames_with_10s_delay: Math.max(0, item.frames_with_10s_delay),
    frames_with_15s_delay: Math.max(0, item.frames_with_15s_delay),
    total_frames_recieved_since_first_frame: Math.max(0, item.total_frames_recieved_since_first_frame),
    total_frames_should_have_recieved_since_first_frame: Math.max(0, item.total_frames_should_have_recieved_since_first_frame)
  }));

  const sortedData = [...processedData].sort((a, b) => {
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
                onClick={() => requestSort('first_frame_timestamp')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                First Frame
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('frames_missed')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Frames Missed
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('total_frames_should_have_recieved_since_first_frame')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Expected Frames
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('frames_with_15s_delay')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                15s Delays
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('frames_with_10s_delay')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                10s Delays
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('frames_with_5s_delay')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                5s Delays
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('total_frames_recieved_since_first_frame')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Frames Received
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.location} className="hover:bg-gray-50/50">
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{row.location}</span>
                  <span className="text-xs text-gray-500">{row.serverIp}</span>
                </div>
              </TableCell>
              <TableCell>{new Date(row.last_frame_timestamp).toLocaleString()}</TableCell>
              <TableCell>{new Date(row.first_frame_timestamp).toLocaleString()}</TableCell>
              <TableCell 
                className={`font-medium ${getBackgroundColor(row.frames_missed)} ${getTextColor(row.frames_missed)}`}
              >
                {row.frames_missed}
              </TableCell>
              <TableCell>{row.total_frames_should_have_recieved_since_first_frame}</TableCell>
              <TableCell>{row.frames_with_15s_delay}</TableCell>
              <TableCell>{row.frames_with_10s_delay}</TableCell>
              <TableCell>{row.frames_with_5s_delay}</TableCell>
              <TableCell>{row.total_frames_recieved_since_first_frame}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SortableTable;
