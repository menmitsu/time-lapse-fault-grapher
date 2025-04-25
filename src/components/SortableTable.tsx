
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

type FaultDataRow = {
  center: string;
  fault_count_5s: number;
  fault_count_10s: number;
};

interface SortableTableProps {
  data: FaultDataRow[];
}

const SortableTable = ({ data }: SortableTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FaultDataRow;
    direction: 'asc' | 'desc';
  }>({
    key: 'center',
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

  const requestSort = (key: keyof FaultDataRow) => {
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
                onClick={() => requestSort('center')}
                className="h-8 whitespace-nowrap"
              >
                Location
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('fault_count_5s')}
                className="h-8 whitespace-nowrap"
              >
                5s Fault Count
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => requestSort('fault_count_10s')}
                className="h-8 whitespace-nowrap"
              >
                10s Fault Count
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={row.center + index}>
              <TableCell className="font-medium">{row.center}</TableCell>
              <TableCell>{row.fault_count_5s}</TableCell>
              <TableCell>{row.fault_count_10s}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SortableTable;
