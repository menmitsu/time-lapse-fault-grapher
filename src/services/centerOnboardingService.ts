
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
    // For CSV, we'll use a direct CSV export URL from Google Sheets
    const sheetId = '1kz4VPEAZWKR7M8GDgZ9aHz3ig7LX-vSi35kuNCDU9PM';
    const gid = '1497227990';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    console.log("Fetching center data from CSV URL:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log("CSV data loaded, length:", csvText.length);
    
    // Parse CSV to JSON
    const rows = parseCSV(csvText);
    console.log("Parsed CSV rows:", rows.length);
    
    if (rows.length < 2) {
      console.error("Not enough rows in CSV data");
      throw new Error("Invalid CSV data structure");
    }

    // First row is headers
    const headers = rows[0];
    
    // Map the rows to our interface
    const centerData: CenterData[] = rows.slice(1).map((row, index) => {
      const item: CenterData = {
        id: index.toString(),
        center: '',
        classroom: '',
        dataGatheringComplete: '',
        reEvaluation: '',
        notes: '',
        date: ''
      };
      
      // Map each column to the corresponding header
      headers.forEach((header, i) => {
        if (i < row.length) {
          const key = headerToKey(header);
          item[key] = row[i];
        }
      });
      
      return item;
    });
    
    console.log("Mapped center data:", centerData);
    
    return centerData;
  } catch (error) {
    console.error("Error fetching center data:", error);
    toast.error("Failed to fetch center data");
    return [];
  }
};

// Helper function to parse CSV
function parseCSV(text: string): string[][] {
  // Split by newlines
  const lines = text.split('\n');
  
  return lines.map(line => {
    const row: string[] = [];
    let insideQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Push the last value
    row.push(currentValue);
    
    return row;
  }).filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''));
}

// Helper function to convert header to camelCase key
function headerToKey(header: string): string {
  // Map Google Sheet headers to our interface properties
  const headerMap: Record<string, string> = {
    'Center': 'center',
    'Classroom': 'classroom',
    'Data Gathering Complete': 'dataGatheringComplete',
    'Re-evaluation': 'reEvaluation',
    'Notes': 'notes',
    'Date': 'date'
  };
  
  return headerMap[header] || header.toLowerCase().replace(/\s+/g, '');
}

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
