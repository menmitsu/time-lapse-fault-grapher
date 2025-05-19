
import { toast } from "@/components/ui/sonner";

export interface CenterData {
  id: string;
  center: string;
  classroom: string;
  dataGatheringComplete: string;
  reEvaluation: string;
  notes: string;
  date: string;
  channel?: string; // Added channel field
  [key: string]: string | number | undefined; // Allow additional dynamic fields
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

    // Find the row with actual headers (around row 8)
    let headerRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].some(cell => cell === "Center Name" || cell === "clasroom name" || cell === "Channel")) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      console.error("Header row not found in CSV data");
      throw new Error("Invalid CSV structure: header row not found");
    }
    
    // Use the found header row
    const headers = rows[headerRowIndex];
    console.log("Using headers:", headers);
    
    // Skip empty rows and use only rows with actual data
    const centerData: CenterData[] = [];
    let centerName = ""; // Track current center name for empty cells
    
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows or rows with insufficient data
      if (row.length < 3 || row.every(cell => !cell.trim())) {
        continue;
      }
      
      // Update current center name if this row has one
      if (row[1] && row[1].trim()) {
        centerName = row[1].trim();
      }
      
      const item: CenterData = {
        id: (centerData.length).toString(),
        center: centerName,
        classroom: row[2] || "",
        dataGatheringComplete: row[4] || "",
        reEvaluation: row[8] || "",
        notes: "", // No notes field in the sheet
        date: row[7] || "", // Using uploaded to firebase date
        channel: row[3] || ""
      };
      
      // Only add rows that have at least a classroom or channel value
      if (item.classroom || item.channel) {
        centerData.push(item);
      }
    }
    
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

// Function to sort and process center data with priority for highlighted rows
export const processCenterData = (data: CenterData[]): CenterData[] => {
  // Helper function to check if a row should be highlighted
  const shouldHighlight = (item: CenterData): boolean => {
    return (
      item.dataGatheringComplete?.toLowerCase() === 'no' ||
      item.reEvaluation?.toLowerCase() === 'yes' // Changed to highlight rows needing reevaluation
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
    item.reEvaluation?.toLowerCase() === 'yes' // Changed to highlight rows needing reevaluation
  );
};
