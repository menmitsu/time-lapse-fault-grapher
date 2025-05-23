
import { useEffect, useState } from "react";
import { useCenterOnboardingData } from "../hooks/useCenterOnboardingData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CenterOnboardingTable from "./CenterOnboardingTable";

interface CenterOnboardingProps {
  isActive: boolean;
}

const CenterOnboarding = ({ isActive }: CenterOnboardingProps) => {
  const { data, headers, isLoading, error, isUsingMockData, loadData } = useCenterOnboardingData();
  const [isInitialized, setIsInitialized] = useState(false);

  // Only load data when the tab becomes active and hasn't been initialized
  useEffect(() => {
    if (isActive && !isInitialized) {
      console.log("Center Onboarding tab is active, loading data once...");
      loadData();
      setIsInitialized(true);
    }
  }, [isActive, isInitialized, loadData]);

  return (
    <Card className="rounded-lg shadow-lg bg-white/50 backdrop-blur-sm border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Center Onboarding Status
          </h2>
          <Button
            onClick={() => {
              loadData();
              setIsInitialized(true);
            }}
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
                  onClick={loadData}
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

        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-pulse flex flex-col items-center space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : (
          data.length > 0 ? (
            <CenterOnboardingTable headers={headers} data={data} />
          ) : (
            <div className="text-center py-10 text-gray-500">
              No center data available
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default CenterOnboarding;
