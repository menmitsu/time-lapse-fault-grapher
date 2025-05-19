
import { CenterData, isHighlightedRow } from "../services/centerOnboardingService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CenterOnboardingTableProps {
  data: CenterData[];
}

const CenterOnboardingTable = ({ data }: CenterOnboardingTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Center</TableHead>
            <TableHead>Classroom</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Data Gathering Complete</TableHead>
            <TableHead>Uploaded to Firebase</TableHead>
            <TableHead>Re-evaluation Needed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow 
                key={item.id}
                className={isHighlightedRow(item) ? "bg-red-50" : ""}
              >
                <TableCell className="font-medium">{item.center}</TableCell>
                <TableCell>{item.classroom}</TableCell>
                <TableCell>{item.channel}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.dataGatheringComplete?.toLowerCase() === 'yes' ? "default" : "destructive"}
                    className={item.dataGatheringComplete?.toLowerCase() === 'yes' 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : "bg-red-100 text-red-800 hover:bg-red-100"}
                  >
                    {item.dataGatheringComplete || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.reEvaluation?.toLowerCase() === 'yes' ? "destructive" : "default"}
                    className={item.reEvaluation?.toLowerCase() === 'yes' 
                      ? "bg-red-100 text-red-800 hover:bg-red-100" 
                      : "bg-green-100 text-green-800 hover:bg-green-100"}
                  >
                    {item.reEvaluation || 'No'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CenterOnboardingTable;
