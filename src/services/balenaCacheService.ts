export interface BalenaCacheData {
  cache_frames_with_delay_more_than_1s: number;
  delay_times: number[];
  last_frame_timestamp: string;
  start_timestamp: string;
  total_1s_frames_captured: number;
  total_delayed_frames: number;
  total_reconnect_instances: number;
  weighted_avg_delay: number;
  median_delay: number;
}

export interface BalenaCacheResponse {
  [location: string]: BalenaCacheData;
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
  'http://34.93.233.94:5020/get_balena_cache_result'
];

// Helper function to get base IP from endpoint
const getBaseIp = (endpoint: string) => {
  // Extract just the domain or IP without protocol or paths
  const url = endpoint.includes('://') ?
    new URL(endpoint).hostname :
    endpoint.split('/')[0].split(':')[0];

  return url;
};

export const fetchBalenaCacheData = async (signal?: AbortSignal, preventCache: boolean = false): Promise<BalenaCacheResponse> => {
  const isHttps = window.location.protocol === 'https:';

  // Function to fetch from a single endpoint
  const fetchFromEndpoint = async (endpoint: string): Promise<BalenaCacheResponse> => {
    // Add timestamp to prevent caching if requested
    const cacheBuster = preventCache ? `?_t=${Date.now()}` : '';

    // For HTTPS endpoints, use as is; for others prepend http://
    const targetUrl = endpoint.includes('://') ?
      `${endpoint}${cacheBuster}` :
      `http://${endpoint}${cacheBuster}`;



    // If we're in HTTP mode or using HTTPS endpoint, try direct connection first
    if (!isHttps || endpoint.startsWith('http://')) {
      try {
        console.log(`Attempting direct connection to: ${targetUrl}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          signal // Pass the signal to the fetch request
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        // Check if the request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          throw error; // Re-throw abort error to be handled by caller
        }
        console.log(`Direct connection failed for ${endpoint}, will try proxies`);
      }
    }

    // If direct connection failed or we're on HTTPS, try the CORS proxies
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      // First, check if the request has been aborted before trying a new proxy
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      try {
        const proxyUrl = CORS_PROXIES[i](targetUrl);
        console.log(`Trying CORS proxy ${i + 1}/${CORS_PROXIES.length} for ${endpoint}: ${proxyUrl}`);

        try {
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Origin': window.location.origin,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            signal // Pass the signal to the fetch request
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Proxy ${i + 1} successful for ${endpoint}`);
            return data;
          }
        } catch (regularError) {
          // Check if the request was aborted
          if (regularError instanceof Error && regularError.name === 'AbortError') {
            throw regularError; // Re-throw abort error to be handled by caller
          }
          console.log(`Regular mode failed for proxy ${i + 1} on ${endpoint}`);
        }

        // We can't pass the signal to no-cors mode, so we need to check if aborted first
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        // Only attempt no-cors as a last resort since we can't access the response
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin,
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          mode: 'no-cors'
        });

        if (response.type === 'opaque') {
          throw new Error('Cannot access response content due to CORS restrictions');
        }
      } catch (error) {
        // Check if the request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          throw error; // Re-throw abort error to be handled by caller
        }
        console.log(`Proxy ${i + 1} error for ${endpoint}:`, error);
      }
    }

    throw new Error(`All CORS proxies failed for ${endpoint}`);
  };

  // Check if the request has been aborted before starting
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  try {
    // Try each endpoint until one works
    for (const endpoint of ENDPOINTS) {
      // Check for abort before trying each endpoint
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      try {
        const data = await fetchFromEndpoint(endpoint);
        return data;
      } catch (error) {
        // Check if the request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          throw error; // Re-throw abort error to be handled by caller
        }
        console.error(`Failed to fetch from ${endpoint}:`, error);
      }
    }

    throw new Error('Failed to fetch data from all endpoints');
  } catch (error) {
    // Final check if this is an abort error
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request aborted by user or new request');
    }
    throw error;
  }
};
