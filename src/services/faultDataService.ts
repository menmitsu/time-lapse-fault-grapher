
export interface FaultData {
  fault_count_10s: { [key: string]: number };
  fault_count_5s: { [key: string]: number };
  timestamp: string;
}

// Mock data generator for development and when API is unreachable
const generateMockData = (): FaultData => {
  const centers = ['Center A', 'Center B', 'Center C', 'Center D'];
  const fault_count_5s: { [key: string]: number } = {};
  const fault_count_10s: { [key: string]: number } = {};
  
  centers.forEach(center => {
    fault_count_5s[center] = Math.floor(Math.random() * 50);
    fault_count_10s[center] = Math.floor(Math.random() * 25);
  });
  
  return {
    fault_count_5s,
    fault_count_10s,
    timestamp: new Date().toISOString()
  };
};

export const fetchFaultData = async (): Promise<FaultData> => {
  try {
    // Add a timeout to the fetch to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch('http://34.93.233.94:5020/get_frame_timestamp_stats', {
      signal: controller.signal,
      // Add CORS mode to handle cross-origin requests
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching fault data:', error);
    // Return mock data when API is unreachable
    console.log('Using mock data instead');
    return generateMockData();
  }
};
