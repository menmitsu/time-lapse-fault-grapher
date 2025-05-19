
import { useCenterOnboardingData } from "../hooks/useCenterOnboardingData";
import { CenterData, isHighlightedRow } from "../services/centerOnboardingService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CenterOnboarding = () => {
  const { data, isLoading, error, isUsingMockData, refreshData } = useCenterOnboardingData();

  // Group centers for better organization
  const groupedData: { [key: string]: CenterData[] } = {};
  data.forEach(item => {
    if (!groupedData[item.center]) {
      groupedData[item.center] = [];
    }
    groupedData[item.center].push(item);
  });

  return (
    <Card className="rounded-lg shadow-lg bg-white/50 backdrop-blur-sm border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Center Onboarding Status
          </h2>
          <Button
            onClick={refreshData}
            className="flex items-center gap-2"
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isUsingMockData && (
          <Alert variant="destructive" className="mb-6 border-amber-500 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>
              Could not connect to the Google Sheet. Displaying mock data for demonstration purposes.
              <div className="mt-2">
                <Button
                  onClick={refreshData}
                  variant="outline"
                  size="sm"
                  className="text-amber-600 border-amber-300"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {Object.entries(groupedData).map(([center, centerItems]) => (
            <div key={center} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <h3 className="text-lg font-semibold p-4 bg-gray-50 border-b">
                {center}
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Classroom</TableHead>
                      <TableHead>Data Gathering Complete</TableHead>
                      <TableHead>Re-evaluation</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centerItems.map((item) => (
                      <TableRow 
                        key={item.id}
                        className={isHighlightedRow(item) ? "bg-red-50" : ""}
                      >
                        <TableCell className="font-medium">{item.classroom}</TableCell>
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
            </div>
          ))}

          {Object.keys(groupedData).length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-500">
              No center data available
            </div>
          )}

          {isLoading && (
            <div className="text-center py-10">
              <div className="animate-pulse flex flex-col items-center space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CenterOnboarding;
