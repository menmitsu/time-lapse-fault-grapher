
export interface FaultData {
  fault_count_10s: { [key: string]: number };
  fault_count_5s: { [key: string]: number };
  timestamp: string;
}

export const fetchFaultData = async (): Promise<FaultData> => {
  // Check if we're running in HTTPS environment
  const isHttps = window.location.protocol === 'https:';
  const endpoint = '34.93.233.94:5020/get_frame_timestamp_stats';
  
  // Use a CORS proxy if we're in HTTPS mode to avoid mixed content blocking
  const url = isHttps 
    ? `https://corsproxy.io/?${encodeURIComponent(`http://${endpoint}`)}` 
    : `http://${endpoint}`;
  
  console.log(`Fetching data from: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Basic validation to ensure the data matches our expected structure
  if (!data.fault_count_5s || !data.fault_count_10s || !data.timestamp) {
    throw new Error('Invalid data structure received');
  }

  return data;
};
