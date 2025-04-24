
export interface FaultData {
  fault_count_10s: { [key: string]: number };
  fault_count_5s: { [key: string]: number };
  timestamp: string;
}

export const fetchFaultData = async (): Promise<FaultData> => {
  try {
    const response = await fetch('http://34.93.233.94:5020/get_frame_timestamp_stats');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching fault data:', error);
    throw error;
  }
};
