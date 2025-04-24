
export const fetchFaultData = async (): Promise<FaultData> => {
  const response = await fetch('http://34.93.233.94:5020/get_frame_timestamp_stats', {
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
