
export interface CleaningData {
  [location: string]: LocationCleaningData;
}

export interface LocationCleaningData {
  first_frame_timestamp: string;
  last_frame_timestamp: string;
  frames_with_10s_delay: number;
  frames_with_15s_delay: number;
  frames_with_20s_delay: number;
  total_frames_recieved_since_first_frame: number;
  total_frames_should_have_recieved_since_first_frame: number;
  serverIp: string;  // Changed from optional to required
}

// Extended list of CORS proxies to try in order, reusing the same approach as in faultDataService
const CORS_PROXIES = [
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

const CLEANING_ENDPOINT = 'http://35.244.44.28:5020/get_frame_timestamp_stats';

export const fetchCleaningData = async (): Promise<CleaningData> => {
  const isHttps = window.location.protocol === 'https:';
  
  // If we're in HTTP mode, try direct connection first
  if (!isHttps) {
    try {
      console.log(`Attempting direct connection to: ${CLEANING_ENDPOINT}`);
      const response = await fetch(CLEANING_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return processCleaningData(data);
      }
    } catch (error) {
      console.log(`Direct connection failed for cleaning endpoint, will try proxies`);
    }
  }
  
  // If direct connection failed or we're on HTTPS, try the CORS proxies
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[i](CLEANING_ENDPOINT);
      console.log(`Trying CORS proxy ${i+1}/${CORS_PROXIES.length} for cleaning endpoint: ${proxyUrl}`);
      
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
          console.log(`Proxy ${i+1} successful for cleaning endpoint`);
          return processCleaningData(data);
        }
      } catch (regularError) {
        console.log(`Regular mode failed for proxy ${i+1} on cleaning endpoint`);
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
      console.log(`Proxy ${i+1} error for cleaning endpoint:`, error);
    }
  }
  
  throw new Error(`All CORS proxies failed for cleaning endpoint`);
};

// Process and transform the API response into our expected format
function processCleaningData(data: any): CleaningData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data structure received');
  }
  
  // Add serverIp to the data for identification
  const processedData: CleaningData = {};
  
  Object.entries(data).forEach(([location, locationData]: [string, any]) => {
    processedData[location] = {
      ...locationData,
      serverIp: '35.244.44.28:5020' // Always add serverIp as required
    } as LocationCleaningData;
  });
  
  return processedData;
}
