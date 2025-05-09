
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
import { LocationCleaningData } from '../services/cleaningDataService';

interface CleaningTableProps {
  data: Array<{ 
    location: string; 
    frames_missed: number;
    frames_missed_percentage: number;
    serverIp: string; 
  } & LocationCleaningData>;
}

type SortableFields = keyof (LocationCleaningData & { 
  location: string; 
  frames_missed: number;
  frames_missed_percentage: number;
  serverIp: string; 
});

const getBackgroundColor = (framesMissed: number) => {
  if (framesMissed < 100) return 'bg-[#F2FCE2]';
  if (framesMissed <= 250) return 'bg-[#FEF7CD]';
  return 'bg-red-50';
};

const getTextColor = (framesMissed: number) => {
  if (framesMissed < 100) return 'text-green-700';
  if (framesMissed <= 250) return 'text-yellow-700';
  return 'text-red-700';
};

const CleaningTable = ({ data }: CleaningTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableFields;
    direction: 'asc' | 'desc';
  }>({
    key: 'frames_missed',
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
                onClick={() => requestSort('frames_missed_percentage')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Frames Missed (%)
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
                onClick={() => requestSort('frames_with_20s_delay')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                20s Delays
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
              <TableCell 
                className={`font-medium ${getBackgroundColor(row.frames_missed)} ${getTextColor(row.frames_missed)}`}
              >
                {row.frames_missed_percentage}%
              </TableCell>
              <TableCell>{row.total_frames_should_have_recieved_since_first_frame}</TableCell>
              <TableCell>{row.frames_with_20s_delay}</TableCell>
              <TableCell>{row.frames_with_15s_delay}</TableCell>
              <TableCell>{row.frames_with_10s_delay}</TableCell>
              <TableCell>{row.total_frames_recieved_since_first_frame}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CleaningTable;
