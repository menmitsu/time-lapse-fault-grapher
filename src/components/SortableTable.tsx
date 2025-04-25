
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
  data: Array<{ location: string } & LocationData>;
}

type SortableFields = keyof (LocationData & { location: string });

const SortableTable = ({ data }: SortableTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortableFields;
    direction: 'asc' | 'desc';
  }>({
    key: 'location',
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('location')}
                className="h-8 whitespace-nowrap"
              >
                Location
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('frames_with_5s_delay')}
                className="h-8 whitespace-nowrap"
              >
                5s Delays
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('frames_with_10s_delay')}
                className="h-8 whitespace-nowrap"
              >
                10s Delays
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('frames_with_15s_delay')}
                className="h-8 whitespace-nowrap"
              >
                15s Delays
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('total_frames_recieved_since_first_frame')}
                className="h-8 whitespace-nowrap"
              >
                Frames Received
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('total_frames_should_have_recieved_since_first_frame')}
                className="h-8 whitespace-nowrap"
              >
                Expected Frames
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('last_frame_timestamp')}
                className="h-8 whitespace-nowrap"
              >
                Last Frame
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.location}>
              <TableCell className="font-medium">{row.location}</TableCell>
              <TableCell>{row.frames_with_5s_delay}</TableCell>
              <TableCell>{row.frames_with_10s_delay}</TableCell>
              <TableCell>{row.frames_with_15s_delay}</TableCell>
              <TableCell>{row.total_frames_recieved_since_first_frame}</TableCell>
              <TableCell>{row.total_frames_should_have_recieved_since_first_frame}</TableCell>
              <TableCell>{new Date(row.last_frame_timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SortableTable;
