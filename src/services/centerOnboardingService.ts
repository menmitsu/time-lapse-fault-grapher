
import { toast } from "@/components/ui/sonner";

export interface CenterData {
  id: string;
  center: string;
  classroom: string;
  dataGatheringComplete: string;
  reEvaluation: string;
  notes: string;
  date: string;
  [key: string]: string | number; // Allow additional dynamic fields
}

// Function to fetch data from the Google Sheet
export const fetchCenterData = async (): Promise<CenterData[]> => {
  try {
    // Google Sheets URL to fetch as JSON
    // Using a published sheet URL that works with CORS
    const sheetId = '1kz4VPEAZWKR7M8GDgZ9aHz3ig7LX-vSi35kuNCDU9PM';
    const sheetGid = '1497227990';
    
    // Using the public sheet URL format that returns JSON
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${sheetGid}`;
    
    console.log("Fetching center data from:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    // Google's response is not pure JSON, it's like `/*O_o*/google.visualization.Query.setResponse({...});`
    // We need to extract the JSON object from this response
    const text = await response.text();
    console.log("Response text preview:", text.substring(0, 200));
    
    // Extract the JSON part
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}') + 1;
    
    if (jsonStartIndex < 0 || jsonEndIndex <= 0) {
      console.error("Failed to extract JSON from response:", text);
      throw new Error("Invalid response format from Google Sheets");
    }
    
    const jsonText = text.substring(jsonStartIndex, jsonEndIndex);
    const data = JSON.parse(jsonText);
    
    console.log("Parsed data:", data);
    
    // Parse the table data
    if (!data.table || !data.table.cols || !data.table.rows) {
      console.error("Unexpected data structure:", data);
      throw new Error("Unexpected data structure from Google Sheets");
    }
    
    const headers = data.table.cols.map((col: any) => col.label);
    console.log("Headers:", headers);
    
    const rows = data.table.rows.map((row: any) => {
      const rowData: any = {};
      row.c.forEach((cell: any, index: number) => {
        const header = headers[index] || `column${index}`;
        rowData[header] = cell ? (cell.v !== null ? cell.v : '') : '';
      });
      return rowData;
    });
    
    console.log("Parsed rows:", rows);
    
    // Map to our interface structure
    const centerData: CenterData[] = rows.map((row: any, index: number) => ({
      id: index.toString(),
      center: row['Center'] || '',
      classroom: row['Classroom'] || '',
      dataGatheringComplete: row['Data Gathering Complete'] || '',
      reEvaluation: row['Re-evaluation'] || '',
      notes: row['Notes'] || '',
      date: row['Date'] || '',
      ...row // Include all original fields too
    }));
    
    console.log("Mapped center data:", centerData);
    
    return centerData;
  } catch (error) {
    console.error("Error fetching center data:", error);
    toast.error("Failed to fetch center data");
    return [];
  }
};

// Function to sort and process center data with priority for highlighted rows
export const processCenterData = (data: CenterData[]): CenterData[] => {
  // Helper function to check if a row should be highlighted
  const shouldHighlight = (item: CenterData): boolean => {
    return (
      item.dataGatheringComplete?.toLowerCase() === 'no' ||
      item.reEvaluation?.toLowerCase() === 'no'
    );
  };
  
  // Sort data: highlighted rows first, then alphabetically by center and classroom
  return [...data].sort((a, b) => {
    const aHighlight = shouldHighlight(a);
    const bHighlight = shouldHighlight(b);
    
    // First sort by highlight status
    if (aHighlight && !bHighlight) return -1;
    if (!aHighlight && bHighlight) return 1;
    
    // Then sort by center name
    if (a.center !== b.center) {
      return a.center.localeCompare(b.center);
    }
    
    // Then by classroom
    return a.classroom.localeCompare(b.classroom);
  });
};

// Function to determine if a row should be highlighted
export const isHighlightedRow = (item: CenterData): boolean => {
  return (
    item.dataGatheringComplete?.toLowerCase() === 'no' ||
    item.reEvaluation?.toLowerCase() === 'no'
  );
};
