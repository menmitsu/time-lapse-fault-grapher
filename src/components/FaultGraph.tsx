
import { useState } from 'react';
import { useFaultData } from '../hooks/useFaultData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SortableTable from './SortableTable';
import BalenaCacheContentWrapper from './BalenaCacheContentWrapper';
import CleaningStatisticsWrapper from './CleaningStatisticsWrapper';
import AllStatisticsWrapper from './AllStatisticsWrapper';
import CenterOnboarding from './CenterOnboarding';

const FaultGraph = () => {
  const [activeTab, setActiveTab] = useState("frameStats");
  const {
    currentData,
    error,
    isUsingMockData,
    isLoading,
    refreshData
  } = useFaultData();

  // Calculate table data for fault statistics tabs
  const tableData = currentData ? Object.entries(currentData).map(([location, data]) => {
    // Calculate frames missed and ensure it's never negative
    const framesMissed = Math.max(0, 
      data.total_frames_should_have_recieved_since_first_frame - 
      data.total_frames_recieved_since_first_frame
    );
    
    // Use the serverIp from the data object, or extract it from the location if needed
    const serverIp = data.serverIp || (location.includes('34.93.233.94') ? '34.93.233.94' : '35.200.180.212');
    
    return {
      location,
      ...data,
      frames_missed: framesMissed,
      serverIp
    };
  }) : [];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Only refresh fault data when switching to frameStats tab
    if (value === "frameStats") {
      refreshData();
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex justify-center mb-4">
        <TabsList>
          <TabsTrigger value="frameStats">Flask Statistics</TabsTrigger>
          <TabsTrigger value="capturingContainer">Capturing Statistics</TabsTrigger>
          <TabsTrigger value="cleaningStats">Cleaning Statistics</TabsTrigger>
          <TabsTrigger value="allStats">All Stats</TabsTrigger>
          <TabsTrigger value="centerOnboarding">Center Onboarding</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="frameStats">
        {error && !isUsingMockData ? (
          <Alert variant="destructive" className="max-w-2xl mx-auto mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card className="rounded-lg shadow-lg bg-white/50 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Fault Monitoring Dashboard
                </h2>
                <Button 
                  onClick={refreshData} 
                  className="flex items-center gap-2" 
                  variant="outline" 
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
              
              {isUsingMockData && (
                <Alert variant="destructive" className="mb-6 border-amber-500 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle>Connection Issue</AlertTitle>
                  <AlertDescription>
                    Could not connect to the data source. Displaying mock data for demonstration purposes.
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
              
              <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <SortableTable data={tableData} />
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="capturingContainer">
        <BalenaCacheContentWrapper isActive={activeTab === "capturingContainer"} />
      </TabsContent>
      
      <TabsContent value="cleaningStats">
        <CleaningStatisticsWrapper isActive={activeTab === "cleaningStats"} />
      </TabsContent>
      
      <TabsContent value="allStats">
        <AllStatisticsWrapper isActive={activeTab === "allStats"} />
      </TabsContent>

      <TabsContent value="centerOnboarding">
        <CenterOnboarding isActive={activeTab === "centerOnboarding"} />
      </TabsContent>
    </Tabs>
  );
};

export default FaultGraph;
