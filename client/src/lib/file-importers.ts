import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { InsertSurvey, InsertGammaData } from '@shared/schema';

// Common header mappings for survey data
const SURVEY_HEADER_MAPPINGS: Record<string, string[]> = {
  md: ['md', 'measured depth', 'depth', 'meas depth', 'measdepth', 'meas_depth', 'md (ft)', 'depth (ft)'],
  inc: ['inc', 'inclination', 'incl', 'dip', 'inc (deg)', 'inclination (deg)', 'angle', 'inc (°)', 'inclination (°)'],
  azi: ['azi', 'azimuth', 'az', 'azim', 'azm', 'azimuth (deg)', 'azi (deg)', 'azimuth (°)', 'azi (°)', 'heading', 'direction'],
  bitDepth: ['bit depth', 'bitdepth', 'bit_depth', 'bd', 'bit', 'bit depth (ft)'],
  gTotal: ['g', 'g-total', 'gtotal', 'g_total', 'gravitytotal', 'gravity', 'g total', 'gravity total'],
  bTotal: ['b', 'b-total', 'btotal', 'b_total', 'magnetictotal', 'magnetic', 'b total', 'magnetic total'],
  dipAngle: ['dip', 'dipa', 'dip angle', 'dipangle', 'dip_angle'],
  toolFace: ['tf', 'toolface', 'tool face', 'tool_face'],
};

// Common header mappings for gamma ray data
const GAMMA_HEADER_MAPPINGS: Record<string, string[]> = {
  depth: ['depth', 'md', 'measured depth', 'adepth', 'a_depth', 'meas depth', 'measdepth', 'depth (ft)', 'md (ft)'],
  value: ['gamma', 'gr', 'gamma ray', 'gammaray', 'gapi', 'gamma_ray', 'gamma ray (gapi)', 'gr (gapi)', 'value'],
};

/**
 * Normalize a header string for comparison
 */
function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[_\-\s.()]/g, '');
}

/**
 * Find matching field for a header based on common mappings
 */
function findMatchingField(normalizedHeader: string, mappings: Record<string, string[]>): string | null {
  for (const [field, aliases] of Object.entries(mappings)) {
    const normalizedAliases = aliases.map(normalizeHeader);
    if (normalizedAliases.includes(normalizedHeader)) {
      return field;
    }
  }
  return null;
}

/**
 * Detect the header row in tabular data
 */
function detectHeaderRow(rows: any[]): { headerRow: number; headers: Record<string, number> } {
  // Check first 10 rows or all rows if less than 10
  const maxRowsToCheck = Math.min(10, rows.length);
  
  for (let i = 0; i < maxRowsToCheck; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row)) continue;
    
    // Count potential survey header matches in this row
    let surveyHeaderMatches = 0;
    let headerColumns: Record<string, number> = {};
    
    for (let j = 0; j < row.length; j++) {
      const cellValue = String(row[j] || '');
      const normalizedHeader = normalizeHeader(cellValue);
      
      // Check if this column header matches any known survey fields
      const matchingSurveyField = findMatchingField(normalizedHeader, SURVEY_HEADER_MAPPINGS);
      
      if (matchingSurveyField) {
        surveyHeaderMatches++;
        headerColumns[matchingSurveyField] = j;
      }
    }
    
    // If we found at least MD and either INC or AZI, consider this a valid header row
    if (surveyHeaderMatches >= 2 && headerColumns.md !== undefined && 
       (headerColumns.inc !== undefined || headerColumns.azi !== undefined)) {
      return { headerRow: i, headers: headerColumns };
    }
  }
  
  // Default to first row if no header row detected
  return { headerRow: 0, headers: {} };
}

/**
 * Detect gamma data header row
 */
function detectGammaHeaderRow(rows: any[]): { headerRow: number; headers: Record<string, number> } {
  // Check first 10 rows or all rows if less than 10
  const maxRowsToCheck = Math.min(10, rows.length);
  
  for (let i = 0; i < maxRowsToCheck; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row)) continue;
    
    // Count potential gamma header matches in this row
    let gammaHeaderMatches = 0;
    let headerColumns: Record<string, number> = {};
    
    for (let j = 0; j < row.length; j++) {
      const cellValue = String(row[j] || '');
      const normalizedHeader = normalizeHeader(cellValue);
      
      // Check if this column header matches any known gamma fields
      const matchingGammaField = findMatchingField(normalizedHeader, GAMMA_HEADER_MAPPINGS);
      
      if (matchingGammaField) {
        gammaHeaderMatches++;
        headerColumns[matchingGammaField] = j;
      }
    }
    
    // If we found both depth and gamma, consider this a valid header row
    if (gammaHeaderMatches >= 2 && headerColumns.depth !== undefined && headerColumns.gamma !== undefined) {
      return { headerRow: i, headers: headerColumns };
    }
  }
  
  // Default to first row if no header row detected
  return { headerRow: 0, headers: {} };
}

/**
 * Parse a value safely to a number, returning 0 if invalid
 */
function parseNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  
  if (typeof value === 'number') return value;
  
  const parsedValue = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * Extract survey data from tabular data
 */
function extractSurveyData(rows: any[], headerInfo: { headerRow: number; headers: Record<string, number> }, wellId: number): InsertSurvey[] {
  const { headerRow, headers } = headerInfo;
  const surveys: InsertSurvey[] = [];
  
  // Skip header row
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row)) continue;
    
    // Extract values based on detected headers
    const md = parseNumber(headers.md !== undefined ? row[headers.md] : null);
    
    // Skip rows with invalid or zero MD
    if (md <= 0) continue;
    
    const inc = parseNumber(headers.inc !== undefined ? row[headers.inc] : null);
    const azi = parseNumber(headers.azi !== undefined ? row[headers.azi] : null);
    const bitDepth = parseNumber(headers.bitDepth !== undefined ? row[headers.bitDepth] : md); // Default to MD if not found
    const gTotal = parseNumber(headers.gTotal !== undefined ? row[headers.gTotal] : null);
    const bTotal = parseNumber(headers.bTotal !== undefined ? row[headers.bTotal] : null);
    const dipAngle = parseNumber(headers.dipAngle !== undefined ? row[headers.dipAngle] : null);
    const toolFace = parseNumber(headers.toolFace !== undefined ? row[headers.toolFace] : null);
    
    const survey: InsertSurvey = {
      wellId,
      md: String(md),
      inc: String(inc),
      azi: String(azi),
      bitDepth: String(bitDepth),
      gTotal: gTotal ? String(gTotal) : null,
      bTotal: bTotal ? String(bTotal) : null,
      dipAngle: dipAngle ? String(dipAngle) : null,
      toolFace: toolFace ? String(toolFace) : null
    };
    
    surveys.push(survey);
  }
  
  return surveys;
}

/**
 * Extract gamma data from tabular data
 */
function extractGammaData(rows: any[], headerInfo: { headerRow: number; headers: Record<string, number> }, wellId: number): InsertGammaData[] {
  const { headerRow, headers } = headerInfo;
  const gammaData: InsertGammaData[] = [];
  
  // Skip header row
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row)) continue;
    
    // Extract values based on detected headers
    const depth = parseNumber(headers.depth !== undefined ? row[headers.depth] : null);
    
    // Skip rows with invalid depth
    if (depth <= 0) continue;
    
    // Check for value column or gamma column
    let gamma = 0;
    if (headers.value !== undefined) {
      gamma = parseNumber(row[headers.value]);
    } else if (headers.gamma !== undefined) {
      gamma = parseNumber(row[headers.gamma]);
    }
    
    const gammaPoint: InsertGammaData = {
      wellId,
      depth: String(depth),
      value: String(gamma)
    };
    
    gammaData.push(gammaPoint);
  }
  
  return gammaData;
}

/**
 * Parse an Excel file for survey data
 */
export async function parseSurveyExcel(file: File, wellId: number): Promise<InsertSurvey[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Detect header row
        const headerInfo = detectHeaderRow(rows);
        
        // Extract survey data
        const surveys = extractSurveyData(rows, headerInfo, wellId);
        
        resolve(surveys);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        reject(new Error(`Failed to parse Excel file: ${errorMessage}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse a CSV file for survey data
 */
export async function parseSurveyCSV(file: File, wellId: number): Promise<InsertSurvey[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          // Detect header row
          const headerInfo = detectHeaderRow(results.data);
          
          // Extract survey data
          const surveys = extractSurveyData(results.data, headerInfo, wellId);
          
          resolve(surveys);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          reject(new Error(`Failed to parse CSV file: ${errorMessage}`));
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
}

/**
 * Parse a text file for survey data (space or tab-delimited)
 */
export async function parseSurveyText(file: File, wellId: number): Promise<InsertSurvey[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Split by lines
        const lines = content.split(/\\r?\\n/);
        
        // Convert to array of arrays (split by whitespace)
        const rows = lines.map(line => 
          line.trim().split(/\\s+/).filter(cell => cell.length > 0)
        );
        
        // Detect header row
        const headerInfo = detectHeaderRow(rows);
        
        // Extract survey data
        const surveys = extractSurveyData(rows, headerInfo, wellId);
        
        resolve(surveys);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        reject(new Error(`Failed to parse text file: ${errorMessage}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parse a LAS file for gamma ray data
 */
export async function parseGammaLAS(file: File, wellId: number): Promise<InsertGammaData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Simple LAS parser for gamma data
        // Skip header sections (start with ~) and find data section
        const lines = content.split(/\\r?\\n/);
        
        let inDataSection = false;
        let gammaIndex = -1;
        let depthIndex = -1;
        const curves: string[] = [];
        const gammaData: InsertGammaData[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Skip empty lines
          if (!line) continue;
          
          // Check for curve section to detect column names
          if (line.startsWith('~C')) {
            inDataSection = false;
            continue;
          }
          
          // Check for data section
          if (line.startsWith('~A')) {
            inDataSection = true;
            continue;
          }
          
          // Process curve definitions to find gamma and depth indices
          if (!inDataSection && line.includes('.') && !line.startsWith('~')) {
            const parts = line.split('.');
            if (parts.length > 1) {
              const curveName = parts[0].trim().toLowerCase();
              curves.push(curveName);
              
              // Try to identify depth curve
              if (depthIndex === -1 && 
                  (curveName.includes('dept') || curveName.includes('depth') || curveName === 'md')) {
                depthIndex = curves.length - 1;
              }
              
              // Try to identify gamma curve
              if (gammaIndex === -1 && 
                  (curveName.includes('gr') || curveName.includes('gamma'))) {
                gammaIndex = curves.length - 1;
              }
            }
          }
          
          // Process data lines
          if (inDataSection && !line.startsWith('~') && depthIndex !== -1 && gammaIndex !== -1) {
            const values = line.trim().split(/\\s+/);
            
            if (values.length > Math.max(depthIndex, gammaIndex)) {
              const depth = parseNumber(values[depthIndex]);
              const gammaValue = parseNumber(values[gammaIndex]);
              
              if (depth > 0) {
                gammaData.push({
                  wellId,
                  depth: String(depth),
                  value: String(gammaValue)
                });
              }
            }
          }
        }
        
        if (gammaData.length === 0) {
          // Fallback: try to parse as a CSV or tab-delimited file
          const rows = lines.map(line => 
            line.trim().split(/\\s+|,/).filter(cell => cell.length > 0)
          );
          
          const headerInfo = detectGammaHeaderRow(rows);
          
          if (headerInfo.headers.depth !== undefined) {
            const extractedData = extractGammaData(rows, headerInfo, wellId);
            if (extractedData.length > 0) {
              resolve(extractedData);
              return;
            }
          }
          
          reject(new Error('Could not parse gamma data from LAS file'));
        } else {
          resolve(gammaData);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        reject(new Error(`Failed to parse LAS file: ${errorMessage}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parse a file for gamma data (Excel, CSV, or text)
 */
export async function parseGammaFile(file: File, wellId: number): Promise<InsertGammaData[]> {
  const fileType = file.name.toLowerCase().split('.').pop();
  
  if (fileType === 'xlsx' || fileType === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to array of arrays
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Detect header row
          const headerInfo = detectGammaHeaderRow(rows);
          
          // Extract gamma data
          const gammaData = extractGammaData(rows, headerInfo, wellId);
          
          resolve(gammaData);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          reject(new Error(`Failed to parse Excel file: ${errorMessage}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  } else if (fileType === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          try {
            // Detect header row
            const headerInfo = detectGammaHeaderRow(results.data);
            
            // Extract gamma data
            const gammaData = extractGammaData(results.data, headerInfo, wellId);
            
            resolve(gammaData);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            reject(new Error(`Failed to parse CSV file: ${errorMessage}`));
          }
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  } else {
    // Assume text file (or try to parse LAS)
    if (fileType === 'las') {
      return parseGammaLAS(file, wellId);
    } else {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            
            // Split by lines
            const lines = content.split(/\\r?\\n/);
            
            // Convert to array of arrays (split by whitespace)
            const rows = lines.map(line => 
              line.trim().split(/\\s+/).filter(cell => cell.length > 0)
            );
            
            // Detect header row
            const headerInfo = detectGammaHeaderRow(rows);
            
            // Extract gamma data
            const gammaData = extractGammaData(rows, headerInfo, wellId);
            
            resolve(gammaData);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            reject(new Error(`Failed to parse text file: ${errorMessage}`));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
      });
    }
  }
}

/**
 * Determine which parser to use based on file extension
 */
export async function parseSurveyFile(file: File, wellId: number): Promise<InsertSurvey[]> {
  const fileType = file.name.toLowerCase().split('.').pop();
  
  if (fileType === 'xlsx' || fileType === 'xls') {
    return parseSurveyExcel(file, wellId);
  } else if (fileType === 'csv') {
    return parseSurveyCSV(file, wellId);
  } else {
    return parseSurveyText(file, wellId);
  }
}