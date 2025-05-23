import { CenterData, isHighlightedRow } from "../services/centerOnboardingService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CenterOnboardingTableProps {
  headers: string[];
  data: CenterData[];
}

const CenterOnboardingTable = ({ headers, data }: CenterOnboardingTableProps) => {
  // Sort data to show highlighted rows first
  const sortedData = [...data].sort((a, b) => {
    const aHighlighted = isHighlightedRow(a);
    const bHighlighted = isHighlightedRow(b);
    
    // If a is highlighted and b is not, a comes first
    if (aHighlighted && !bHighlighted) return -1;
    // If b is highlighted and a is not, b comes first
    if (!aHighlighted && bHighlighted) return 1;
    // Otherwise keep original order
    return 0;
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length || 1} className="text-center py-4 text-gray-500">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item) => (
              <TableRow 
                key={item.id}
                className={isHighlightedRow(item) ? "bg-red-100" : ""}
              >
                {headers.map((header, index) => (
                  <TableCell key={index}>
                    {item[header] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CenterOnboardingTable;
