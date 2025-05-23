export interface LocationData {
  first_frame_timestamp: string;
  frames_with_10s_delay: number;
  frames_with_15s_delay: number;
  frames_with_5s_delay: number;
  last_frame_timestamp: string;
  total_frames_recieved_since_first_frame: number;
  total_frames_should_have_recieved_since_first_frame: number;
  serverIp?: string; // Add optional serverIp property
}

export interface FaultData {
  [location: string]: LocationData;
}

// Extended list of CORS proxies to try in order
const CORS_PROXIES = [
  // Original proxies
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
  (url: string) => `https://proxy.cors.sh/${url}`,
  (url: string) => `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`,
  
  // Additional proxies
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${url}`,
  (url: string) => `https://yacdn.org/proxy/${url}`,
  (url: string) => `https://cors.eu.org/${url}`,
  (url: string) => `https://cors-proxy.taskcluster.net/${url}`,
  (url: string) => `https://crossorigin.me/${url}`,
  (url: string) => `https://cors-proxy.uproxy.workers.dev/?${url}`,
  (url: string) => `https://proxy.yuuk.io/${url}`,
  (url: string) => `https://api.websiteproxy.co/browse.php?u=${encodeURIComponent(url)}`,
  (url: string) => `https://cors-proxy.fabians.dev/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy1.herokuapp.com/${url}`,
  (url: string) => `https://corsmeister.herokuapp.com/${url}`,
  (url: string) => `https://cors-proxy-1.herokuapp.com/${url}`,
  (url: string) => `https://corsproxy.onrender.com/?${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy-331.herokuapp.com/${url}`,
  (url: string) => `https://worker-coral-wave-fa1c.trzqbasic.workers.dev/?${url}`,
  (url: string) => `https://api.getproxylist.com/proxy?url=${encodeURIComponent(url)}`,
  (url: string) => `https://open-proxy.vercel.app/api?url=${encodeURIComponent(url)}`,
  (url: string) => `https://cloudcors.vercel.app/api?url=${encodeURIComponent(url)}`,
  (url: string) => `https://servercors.vercel.app/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy-beta.vercel.app/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://cors-handler.vercel.app/api?url=${encodeURIComponent(url)}`,
  (url: string) => `https://vercel-cors.vercel.app/api?url=${encodeURIComponent(url)}`,
  (url: string) => `https://nextjs-cors-anywhere.vercel.app/api?endpoint=${encodeURIComponent(url)}`,
  (url: string) => `https://cors-omega.vercel.app/api?url=${encodeURIComponent(url)}`,
  (url: string) => `https://proxy.cors.bridge.id/${url}`,
  (url: string) => `https://cors.maisputain.ovh/${url}`,
  (url: string) => `https://bypasscors.herokuapp.com/api/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://cors-bypass.herokuapp.com/${url}`,
  (url: string) => `https://kjdev.onrender.com/${url}`,
  (url: string) => `https://corsproxy-orcin.vercel.app/api?url=${encodeURIComponent(url)}`,
  (url: string) => `https://cors-proxy.fringe.zone/${url}`,
  (url: string) => `https://justcors.com/tl_5f7106c/${url}`,
  (url: string) => `https://cors-xvjn.onrender.com/${url}`,
];

const ENDPOINTS = [
  '34.93.233.94:5020/get_frame_timestamp_stats',
  'https://35.200.180.212/get_frame_timestamp_stats'
];

// Helper function to get base IP from endpoint
const getBaseIp = (endpoint: string) => {
  // Extract just the domain or IP without protocol or paths
  const url = endpoint.includes('://') ? 
    new URL(endpoint).hostname : 
    endpoint.split('/')[0].split(':')[0];
  
  return url;
};

export const fetchFaultData = async (): Promise<FaultData> => {
  const isHttps = window.location.protocol === 'https:';
  
  // Function to fetch from a single endpoint
  const fetchFromEndpoint = async (endpoint: string): Promise<FaultData> => {
    // For HTTPS endpoints, use as is; for others prepend http://
    const targetUrl = endpoint.includes('://') ? 
      endpoint : 
      `http://${endpoint}`;
    
    const baseIp = getBaseIp(endpoint);
    
    // If we're in HTTP mode, try direct connection first
    if (!isHttps || endpoint.startsWith('https://')) {
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
            return processApiResponse(data);
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
    // Fetch from both endpoints concurrently
    const results = await Promise.allSettled(ENDPOINTS.map(fetchFromEndpoint));
    
    // Combine successful results
    const combinedData: FaultData = {};
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        // The bug was here - instead of overwriting existing entries, we need to merge data
        // from different endpoints based on unique location keys
        Object.entries(result.value).forEach(([location, data]) => {
          // Add the server IP to the location for later identification
          const locationWithServer = `${location}`;
          combinedData[locationWithServer] = {
            ...data,
            // Add origin information to the data
            serverIp: ENDPOINTS[index]
          } as LocationData & { serverIp: string };
        });
        
        console.log(`Successfully added data from ${ENDPOINTS[index]}`);
      } else {
        console.error(`Failed to fetch from ${ENDPOINTS[index]}:`, result.reason);
      }
    });
    
    // If we got no data at all, throw an error
    if (Object.keys(combinedData).length === 0) {
      throw new Error('Failed to fetch data from all endpoints');
    }
    
    return combinedData;
  } catch (error) {
    throw error;
  }
};

// Process and transform the API response into our expected format
function processApiResponse(data: any): FaultData {
  // Check if we have the expected main structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data structure received');
  }
  
  // The server may return data in different formats:
  // 1. Direct format with fault_count_5s and fault_count_10s as top-level properties
  // 2. New format with location keys
  
  return data as FaultData;
}
