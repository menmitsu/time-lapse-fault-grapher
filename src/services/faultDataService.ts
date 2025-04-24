
export interface FaultData {
  fault_count_10s: { [key: string]: number };
  fault_count_5s: { [key: string]: number };
  timestamp: string;
}

// List of CORS proxies to try in order
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://cors-anywhere.herokuapp.com/${encodeURIComponent(url)}`,
  (url: string) => `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`
];

export const fetchFaultData = async (): Promise<FaultData> => {
  // Check if we're running in HTTPS environment
  const isHttps = window.location.protocol === 'https:';
  const endpoint = '34.93.233.94:5020/get_frame_timestamp_stats';
  const targetUrl = `http://${endpoint}`;
  
  // If we're in HTTP mode, try direct connection first
  if (!isHttps) {
    try {
      console.log(`Attempting direct connection to: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return processApiResponse(data);
      }
    } catch (error) {
      console.log('Direct connection failed, will try proxies');
    }
  }
  
  // If direct connection failed or we're on HTTPS, try the CORS proxies
  let lastError: Error | null = null;
  
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[i](targetUrl);
      console.log(`Trying CORS proxy ${i+1}/${CORS_PROXIES.length}: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) {
        console.log(`Proxy ${i+1} failed with status: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      return processApiResponse(data);
    } catch (error) {
      console.log(`Proxy ${i+1} error:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  
  // If we've tried all proxies and none worked, throw the last error
  throw lastError || new Error('All CORS proxies failed');
};

// Process and transform the API response into our expected format
function processApiResponse(data: any): FaultData {
  // Check if we have the expected main structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data structure received');
  }
  
  // The server may return data in different formats:
  // 1. Direct format with fault_count_5s and fault_count_10s as top-level properties
  if (data.fault_count_5s && data.fault_count_10s) {
    return {
      fault_count_5s: data.fault_count_5s,
      fault_count_10s: data.fault_count_10s,
      timestamp: data.timestamp || new Date().toISOString()
    };
  }
  
  // 2. Format where each key contains an object with fault_count properties
  // Transform it into our expected format
  const fault_count_5s: { [key: string]: number } = {};
  const fault_count_10s: { [key: string]: number } = {};
  let lastTimestamp = '';
  
  Object.keys(data).forEach(key => {
    const item = data[key];
    if (item && typeof item === 'object') {
      if ('fault_count_5s' in item) {
        fault_count_5s[key] = Number(item.fault_count_5s);
      }
      
      if ('fault_count_10s' in item) {
        fault_count_10s[key] = Number(item.fault_count_10s);
      }
      
      if (item.last_timestamp && (!lastTimestamp || new Date(item.last_timestamp) > new Date(lastTimestamp))) {
        lastTimestamp = item.last_timestamp;
      }
    }
  });
  
  // Check if we managed to extract some data
  if (Object.keys(fault_count_5s).length === 0 && Object.keys(fault_count_10s).length === 0) {
    console.log('Could not extract fault counts from data:', data);
    throw new Error('Failed to extract fault data');
  }
  
  return {
    fault_count_5s,
    fault_count_10s,
    timestamp: lastTimestamp || new Date().toISOString()
  };
}

