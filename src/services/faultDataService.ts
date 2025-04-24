
export interface FaultData {
  fault_count_10s: { [key: string]: number };
  fault_count_5s: { [key: string]: number };
  timestamp: string;
}

export const fetchFaultData = async (): Promise<FaultData> => {
  try {
    const response = await fetch('http://34.93.233.94:5020/get_frame_timestamp_stats', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate the data structure matches our expected interface
    if (!data.fault_count_5s || !data.fault_count_10s || !data.timestamp) {
      throw new Error('Invalid data structure received');
    }

    return data;
  } catch (error) {
    console.error('Error fetching fault data:', error);
    throw error;  // Let the caller handle the error
  }
};
