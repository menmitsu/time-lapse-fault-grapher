
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
            <TableHead>Data Gathering Complete</TableHead>
            <TableHead>Re-evaluation</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow 
              key={item.id}
              className={isHighlightedRow(item) ? "bg-red-50" : ""}
            >
              <TableCell className="font-medium">{item.center}</TableCell>
              <TableCell>{item.classroom}</TableCell>
              <TableCell>
                <span 
                  className={item.dataGatheringComplete?.toLowerCase() === 'no' 
                    ? "text-red-600 font-semibold" 
                    : ""}
                >
                  {item.dataGatheringComplete}
                </span>
              </TableCell>
              <TableCell>
                <span 
                  className={item.reEvaluation?.toLowerCase() === 'no' 
                    ? "text-red-600 font-semibold" 
                    : ""}
                >
                  {item.reEvaluation}
                </span>
              </TableCell>
              <TableCell>{item.notes}</TableCell>
              <TableCell>{item.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CenterOnboardingTable;
