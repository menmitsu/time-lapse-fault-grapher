
export interface BalenaCacheData {
  cache_frames_with_delay_more_than_1s: number;
  delay_times: number[];
  last_frame_timestamp: string;
  start_timestamp: string;
  total_1s_frames_captured: number;
  total_delayed_frames: number;
  total_reconnect_instances: number;
  weighted_avg_delay: number;
}

export interface BalenaCacheResponse {
  [location: string]: BalenaCacheData;
}

// List of CORS proxies to try in order - reusing from faultDataService
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
  (url: string) => `https://proxy.cors.sh/${url}`,
  (url: string) => `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`
];

const ENDPOINTS = [
  '34.93.233.94:5020/get_balena_cache_result'
];

// Helper function to get base IP from endpoint
const getBaseIp = (endpoint: string) => {
  return endpoint.split('/')[0].split(':')[0];
};

export const fetchBalenaCacheData = async (): Promise<BalenaCacheResponse> => {
  const isHttps = window.location.protocol === 'https:';
  
  // Function to fetch from a single endpoint
  const fetchFromEndpoint = async (endpoint: string): Promise<BalenaCacheResponse> => {
    const targetUrl = `http://${endpoint}`;
    const baseIp = getBaseIp(endpoint);
    
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
          return data;
        }
      } catch (error) {
        console.log(`Direct connection failed for ${endpoint}, will try proxies`);
      }
    }
    
    // If direct connection failed or we're on HTTPS, try the CORS proxies
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      try {
        const proxyUrl = CORS_PROXIES[i](targetUrl);
        console.log(`Trying CORS proxy ${i+1}/${CORS_PROXIES.length} for ${endpoint}: ${proxyUrl}`);
        
        try {
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Origin': window.location.origin
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Proxy ${i+1} successful for ${endpoint}`);
            return data;
          }
        } catch (regularError) {
          console.log(`Regular mode failed for proxy ${i+1} on ${endpoint}`);
        }
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin,
            'X-Requested-With': 'XMLHttpRequest'
          },
          mode: 'no-cors'
        });
        
        if (response.type === 'opaque') {
          throw new Error('Cannot access response content due to CORS restrictions');
        }
      } catch (error) {
        console.log(`Proxy ${i+1} error for ${endpoint}:`, error);
      }
    }
    
    throw new Error(`All CORS proxies failed for ${endpoint}`);
  };
  
  try {
    // Try each endpoint until one works
    for (const endpoint of ENDPOINTS) {
      try {
        const data = await fetchFromEndpoint(endpoint);
        return data;
      } catch (error) {
        console.error(`Failed to fetch from ${endpoint}:`, error);
      }
    }
    
    throw new Error('Failed to fetch data from all endpoints');
  } catch (error) {
    throw error;
  }
};
