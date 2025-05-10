
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

interface BalenaData {
  location: string;
  total_delayed_frames: number;
  total_1s_frames_captured: number;
  average_upload_time_ms: number;
  min_upload_time_ms: number;
  max_upload_time_ms: number;
  delayPercentage: number;
  serverIp: string;
}

interface BalenaCacheTableProps {
  data: BalenaData[];
}

type SortableFields = keyof BalenaData;

const getBackgroundColor = (delayPercentage: number) => {
  // Ensure delayPercentage is never negative before checking thresholds
  const nonNegativeDelayPercentage = Math.max(0, delayPercentage);
  
  if (nonNegativeDelayPercentage < 5) return 'bg-green-50';
  if (nonNegativeDelayPercentage <= 15) return 'bg-yellow-50';
  return 'bg-red-50';
};

const getTextColor = (delayPercentage: number) => {
  // Ensure delayPercentage is never negative before checking thresholds
  const nonNegativeDelayPercentage = Math.max(0, delayPercentage);
  
  if (nonNegativeDelayPercentage < 5) return 'text-green-700';
  if (nonNegativeDelayPercentage <= 15) return 'text-yellow-700';
  return 'text-red-700';
};

const BalenaCacheTable = ({ data }: BalenaCacheTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableFields;
    direction: 'asc' | 'desc';
  }>({
    key: 'delayPercentage',
    direction: 'desc'
  });

  // Process data to ensure no negative values
  const processedData = data.map(item => ({
    ...item,
    // Ensure all numerical values that should never be negative are non-negative
    total_delayed_frames: Math.max(0, item.total_delayed_frames),
    total_1s_frames_captured: Math.max(0, item.total_1s_frames_captured),
    average_upload_time_ms: Math.max(0, item.average_upload_time_ms),
    min_upload_time_ms: Math.max(0, item.min_upload_time_ms),
    max_upload_time_ms: Math.max(0, item.max_upload_time_ms),
    delayPercentage: Math.max(0, item.delayPercentage)
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
                onClick={() => requestSort('delayPercentage')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Delay Percentage
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
                Total Frames Captured
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('average_upload_time_ms')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Avg Upload Time (ms)
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('min_upload_time_ms')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Min Upload Time (ms)
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('max_upload_time_ms')}
                className="h-8 whitespace-nowrap font-semibold"
              >
                Max Upload Time (ms)
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
              <TableCell className={`font-medium ${getBackgroundColor(row.delayPercentage)} ${getTextColor(row.delayPercentage)}`}>
                {row.delayPercentage.toFixed(2)}%
              </TableCell>
              <TableCell>{row.total_delayed_frames}</TableCell>
              <TableCell>{row.total_1s_frames_captured}</TableCell>
              <TableCell>{row.average_upload_time_ms.toFixed(2)}</TableCell>
              <TableCell>{row.min_upload_time_ms}</TableCell>
              <TableCell>{row.max_upload_time_ms}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BalenaCacheTable;
