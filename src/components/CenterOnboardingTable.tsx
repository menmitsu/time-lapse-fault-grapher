
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
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length || 1} className="text-center py-4 text-gray-500">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow 
                key={item.id}
                className={isHighlightedRow(item) ? "bg-red-50" : ""}
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
