
import { useFaultData } from '../hooks/useFaultData';
import { useBalenaCacheData } from '../hooks/useBalenaCacheData';
import { useCleaningData } from '../hooks/useCleaningData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect } from 'react';

const AllStatistics = () => {
  // Get data from all three hooks
  const {
    currentData: flaskData,
    isUsingMockData: isUsingMockFlaskData,
    isLoading: isLoadingFlaskData,
    error: flaskError,
    refreshData: refreshFlaskData
  } = useFaultData();
  
  const {
    currentData: capturingData,
    isUsingMockData: isUsingMockCapturingData,
    isLoading: isLoadingCapturingData,
    error: capturingError,
    refreshData: refreshCapturingData
  } = useBalenaCacheData();
  
  const {
    currentData: cleaningData,
    isUsingMockData: isUsingMockCleaningData,
    isLoading: isLoadingCleaningData,
    error: cleaningError,
    refreshData: refreshCleaningData
  } = useCleaningData();

  // Fetch all data on component mount
  useEffect(() => {
    refreshFlaskData();
    refreshCapturingData();
    refreshCleaningData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAnyLoading = isLoadingFlaskData || isLoadingCapturingData || isLoadingCleaningData;
  const isAnyError = flaskError || capturingError || cleaningError;
  const isAnyMockData = isUsingMockFlaskData || isUsingMockCapturingData || isUsingMockCleaningData;

  // Function to refresh all data
  const refreshAllData = () => {
    refreshFlaskData();
    refreshCapturingData();
    refreshCleaningData();
  };

  // Process Flask data (5s frames)
  const processFlaskData = () => {
    if (!flaskData) return [];
    
    return Object.entries(flaskData).map(([location, data]) => {
      const framesMissed = Math.max(0, data.total_frames_should_have_recieved_since_first_frame - data.total_frames_recieved_since_first_frame);
      const missedPercentage = data.total_frames_should_have_recieved_since_first_frame > 0 
        ? (framesMissed / data.total_frames_should_have_recieved_since_first_frame * 100).toFixed(2)
        : '0.00';
        
      return {
        location,
        type: '5s Frames (Flask)',
        first_frame: data.first_frame_timestamp,
        last_frame: data.last_frame_timestamp,
        frames_received: data.total_frames_recieved_since_first_frame,
        frames_expected: data.total_frames_should_have_recieved_since_first_frame,
        frames_missed: framesMissed,
        missed_percentage: missedPercentage + '%',
        serverIp: data.serverIp
      };
    });
  };

  // Process Capturing data (1s frames)
  const processCapturingData = () => {
    if (!capturingData) return [];
    
    return Object.entries(capturingData).map(([location, data]) => {
      const delayedFramesPercentage = data.total_1s_frames_captured > 0
        ? (data.total_delayed_frames / data.total_1s_frames_captured * 100).toFixed(2)
        : '0.00';
        
      return {
        location,
        type: '1s Frames (Capturing)',
        first_frame: data.start_timestamp,
        last_frame: data.last_frame_timestamp,
        frames_received: data.total_1s_frames_captured,
        frames_expected: data.total_1s_frames_captured + data.cache_frames_with_delay_more_than_1s,
        frames_missed: data.cache_frames_with_delay_more_than_1s,
        missed_percentage: delayedFramesPercentage + '%',
        serverIp: 'Balena Cache'
      };
    });
  };

  // Process Cleaning data (15s frames)
  const processCleaningData = () => {
    if (!cleaningData) return [];
    
    return Object.entries(cleaningData).map(([location, data]) => {
      const framesMissed = Math.max(0, data.total_frames_should_have_recieved_since_first_frame - data.total_frames_recieved_since_first_frame);
      const missedPercentage = data.total_frames_should_have_recieved_since_first_frame > 0 
        ? (framesMissed / data.total_frames_should_have_recieved_since_first_frame * 100).toFixed(2)
        : '0.00';
        
      return {
        location,
        type: '15s Frames (Cleaning)',
        first_frame: data.first_frame_timestamp,
        last_frame: data.last_frame_timestamp,
        frames_received: data.total_frames_recieved_since_first_frame,
        frames_expected: data.total_frames_should_have_recieved_since_first_frame,
        frames_missed: framesMissed,
        missed_percentage: missedPercentage + '%',
        serverIp: data.serverIp
      };
    });
  };

  // Combine all data
  const allData = [
    ...processFlaskData(),
    ...processCapturingData(),
    ...processCleaningData()
  ];

  // Group by location for display
  const groupedData = allData.reduce((acc, item) => {
    if (!acc[item.location]) {
      acc[item.location] = [];
    }
    acc[item.location].push(item);
    return acc;
  }, {} as Record<string, typeof allData>);

  return (
    <Card className="rounded-lg shadow-lg bg-white/50 backdrop-blur-sm border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Comparative Statistics Dashboard
          </h2>
          <Button 
            onClick={refreshAllData} 
            className="flex items-center gap-2" 
            variant="outline" 
            disabled={isAnyLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
            Refresh All Data
          </Button>
        </div>
        
        {isAnyError && !isAnyMockData ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {flaskError || capturingError || cleaningError}
            </AlertDescription>
          </Alert>
        ) : null}
        
        {isAnyMockData && (
          <Alert variant="destructive" className="mb-6 border-amber-500 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>
              Could not connect to one or more data sources. Some mock data is being displayed.
              <div className="mt-2">
                <Button 
                  onClick={refreshAllData} 
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
        
        <div className="space-y-8">
          {Object.entries(groupedData).map(([location, items]) => (
            <Card key={location} className="overflow-hidden">
              <CardHeader className="bg-gray-50 py-3 px-6">
                <CardTitle className="text-lg font-medium">{location}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Frame Type</TableHead>
                      <TableHead>First Frame</TableHead>
                      <TableHead>Last Frame</TableHead>
                      <TableHead>Frames Received</TableHead>
                      <TableHead>Frames Expected</TableHead>
                      <TableHead>Missed</TableHead>
                      <TableHead>Missed %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.type}</TableCell>
                        <TableCell>{item.first_frame}</TableCell>
                        <TableCell>{item.last_frame}</TableCell>
                        <TableCell>{item.frames_received}</TableCell>
                        <TableCell>{item.frames_expected}</TableCell>
                        <TableCell>{item.frames_missed}</TableCell>
                        <TableCell className={parseFloat(item.missed_percentage) > 10 ? "text-red-600 font-semibold" : 
                                             parseFloat(item.missed_percentage) > 5 ? "text-amber-600 font-semibold" : 
                                             "text-green-600 font-semibold"}>
                          {item.missed_percentage}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
          
          {Object.keys(groupedData).length === 0 && !isAnyLoading && (
            <div className="text-center py-10">
              <p className="text-gray-500">No data available. Please refresh to try again.</p>
            </div>
          )}
          
          {isAnyLoading && Object.keys(groupedData).length === 0 && (
            <div className="text-center py-10">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Loading data from all sources...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AllStatistics;
