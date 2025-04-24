
import { supabase } from "@/integrations/supabase/client";

export interface FaultData {
  fault_count_10s: { [key: string]: number };
  fault_count_5s: { [key: string]: number };
  timestamp: string;
}

export const fetchFaultData = async (): Promise<FaultData> => {
  const { data, error } = await supabase
    .from('fault_data')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching fault data:', error);
    throw error;
  }

  // Transform the data into the expected format
  return {
    fault_count_5s: { [data.center]: data.fault_count_5s },
    fault_count_10s: { [data.center]: data.fault_count_10s },
    timestamp: data.timestamp
  };
};

export const insertFaultData = async (data: {
  center: string;
  fault_count_5s: number;
  fault_count_10s: number;
}) => {
  const { error } = await supabase
    .from('fault_data')
    .insert([data]);

  if (error) {
    console.error('Error inserting fault data:', error);
    throw error;
  }
};
