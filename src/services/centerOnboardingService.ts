
import { toast } from "@/components/ui/sonner";

export interface CenterData {
  id: string;
  [key: string]: string | undefined;
}

// Function to fetch data from the Google Sheet
export const fetchCenterData = async (): Promise<{headers: string[], data: CenterData[]}> => {
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
    
    if (rows.length < 1) {
      console.error("Not enough rows in CSV data");
      throw new Error("Invalid CSV data structure");
    }

    // Use the first row as headers
    const headers = rows[0].map(header => header.trim());
    console.log("Using headers from first row:", headers);
    
    // Map the rest of the rows to data objects
    const centerData: CenterData[] = rows.slice(1).map((row, index) => {
      const item: CenterData = { id: index.toString() };
      
      // Map each cell to its corresponding header
      headers.forEach((header, i) => {
        if (i < row.length) {
          item[header] = row[i];
        }
      });
      
      return item;
    });
    
    console.log("Mapped center data:", centerData);
    
    return { headers, data: centerData };
  } catch (error) {
    console.error("Error fetching center data:", error);
    toast.error("Failed to fetch center data");
    return { headers: [], data: [] };
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

// Function to determine if a row should be highlighted based on specific conditions
export const isHighlightedRow = (item: CenterData): boolean => {
  // Find case-insensitive column matches
  const dataGatheringCompletionKey = findCaseInsensitiveKey(item, "Data Gathering Completion");
  const reevaluationNeededKey = findCaseInsensitiveKey(item, "Reevaluation Needed");
  
  // Check for Data Gathering Completion = "No"
  if (dataGatheringCompletionKey) {
    const value = item[dataGatheringCompletionKey]?.trim().toLowerCase();
    if (value === "no") {
      return true;
    }
  }
  
  // Check for Reevaluation Needed = "Yes"
  if (reevaluationNeededKey) {
    const value = item[reevaluationNeededKey]?.trim().toLowerCase();
    if (value === "yes") {
      return true;
    }
  }
  
  return false;
};

// Helper function to find a key in an object in a case-insensitive way
function findCaseInsensitiveKey(obj: CenterData, searchKey: string): string | undefined {
  const lowerSearchKey = searchKey.toLowerCase();
  
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === lowerSearchKey) {
      return key;
    }
  }
  
  return undefined;
}
