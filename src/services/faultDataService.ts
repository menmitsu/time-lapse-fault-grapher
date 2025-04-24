
export interface FaultData {
  fault_count_10s: { [key: string]: number };
  fault_count_5s: { [key: string]: number };
  timestamp: string;
}

// List of CORS proxies to try in order
const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://cors-anywhere.herokuapp.com/${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
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
        return validateAndReturnData(data);
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
      return validateAndReturnData(data);
    } catch (error) {
      console.log(`Proxy ${i+1} error:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  
  // If we've tried all proxies and none worked, throw the last error
  throw lastError || new Error('All CORS proxies failed');
};

// Validate the data structure and return it
function validateAndReturnData(data: any): FaultData {
  if (!data || typeof data !== 'object' || !data.fault_count_5s || !data.fault_count_10s) {
    throw new Error('Invalid data structure received');
  }
  
  return {
    fault_count_5s: data.fault_count_5s,
    fault_count_10s: data.fault_count_10s,
    timestamp: data.timestamp || new Date().toISOString()
  };
}
