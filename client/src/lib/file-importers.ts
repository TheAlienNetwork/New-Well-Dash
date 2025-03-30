import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { InsertSurvey, InsertGammaData } from '@shared/schema';

// Common header mappings for survey data
const SURVEY_HEADER_MAPPINGS: Record<string, string[]> = {
  md: ['md', 'measured depth', 'depth', 'meas depth', 'measdepth', 'meas_depth', 'md (ft)', 'depth (ft)', 'svydepth', 'svy depth'],
  inc: ['inc', 'inclination', 'incl', 'dip', 'inc (deg)', 'inclination (deg)', 'angle', 'inc (°)', 'inclination (°)', 'incl.', 'inc.'],
  azi: ['azi', 'azimuth', 'az', 'azim', 'azm', 'azimuth (deg)', 'azi (deg)', 'azimuth (°)', 'azi (°)', 'heading', 'direction', 'azm.', 'azi.'],
  tvd: ['tvd', 'true vertical depth', 'true_vertical_depth', 'tvd (ft)', 'tvdepth', 'tvd depth'],
  vs: ['vs', 'vertical section', 'vert_section', 'vert. section', 'vs (ft)', 'vertical_section'],
  northSouth: ['north/south', 'n/s', 'north', 'south', 'n/-s', 'n-s', 'ns', 'north south', 'northing', 'n/s (ft)'],
  eastWest: ['east/west', 'e/w', 'east', 'west', 'e/-w', 'e-w', 'ew', 'east west', 'easting', 'e/w (ft)'],
  dls: ['dls', 'dog leg', 'dogleg', 'dog leg severity', 'dogleg severity', 'dog_leg', 'dls (°/100ft)', 'dls (deg/100ft)'],
  bitDepth: ['bit depth', 'bitdepth', 'bit_depth', 'bd', 'bit', 'bit depth (ft)'],
  gTotal: ['g', 'g-total', 'gtotal', 'g_total', 'gravitytotal', 'gravity', 'g total', 'gravity total'],
  bTotal: ['b', 'b-total', 'btotal', 'b_total', 'magnetictotal', 'magnetic', 'b total', 'magnetic total'],
  dipAngle: ['dip', 'dipa', 'dip angle', 'dipangle', 'dip_angle'],
  toolFace: ['tf', 'toolface', 'tool face', 'tool_face'],
};

// Common header mappings for gamma ray data
const GAMMA_HEADER_MAPPINGS: Record<string, string[]> = {
  depth: ['depth', 'md', 'measured depth', 'adepth', 'a_depth', 'meas depth', 'measdepth', 'depth (ft)', 'md (ft)'],
  value: ['gamma', 'gr', 'gamma ray', 'gammaray', 'gapi', 'gamma_ray', 'gamma ray (gapi)', 'gr (gapi)', 'value', 'gr.api'],
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
        
        // Enhanced LAS parser for gamma data and Hutchison-Teele format
        const lines = content.split(/\\r?\\n/);
        
        let inDataSection = false;
        let inCurveSection = false;
        let inOtherInfoSection = false;
        let gammaIndex = -1;
        let depthIndex = -1;
        let grColumn = '';
        let depthColumn = '';
        const curves: {name: string, unit: string, description: string}[] = [];
        const gammaData: InsertGammaData[] = [];
        
        // Look for curves in the ~Curve Information section
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Skip empty lines or comments
          if (!line || line.startsWith('#')) continue;
          
          // Check for curve section to detect column names
          if (line.startsWith('~C') || line.startsWith('~Curve')) {
            inCurveSection = true;
            inDataSection = false;
            inOtherInfoSection = false;
            continue;
          }
          
          // Check for data section
          if (line.startsWith('~A') || line.startsWith('~ASCII')) {
            inDataSection = true;
            inCurveSection = false;
            inOtherInfoSection = false;
            continue;
          }
          
          // Check for ~Other Information section (Hutchison-Teele format)
          if (line.startsWith('~O') || line.startsWith('~Other')) {
            inOtherInfoSection = true;
            inCurveSection = false;
            inDataSection = false;
            continue;
          }
          
          // Any other section marker
          if (line.startsWith('~')) {
            inCurveSection = false;
            inDataSection = false;
            inOtherInfoSection = false;
            continue;
          }
          
          // Process curve definitions to find gamma and depth indices
          if (inCurveSection && line.includes('.') && !line.startsWith('~')) {
            // Standard LAS curve format: "DEPTH .FT 001 :Measured Depth"
            
            // Extract curve name by splitting on whitespace or period
            const parts = line.split(/\\s+|\\./);
            if (parts.length > 0) {
              const curveName = parts[0].trim().toLowerCase();
              
              // Store the curve information
              curves.push({
                name: parts[0].trim(),
                unit: parts.length > 1 ? parts[1].trim() : '',
                description: line.includes(':') ? line.split(':')[1].trim() : ''
              });
              
              // Try to identify depth and gamma curves
              if (depthIndex === -1 && 
                  (curveName === 'depth' || curveName === 'md')) {
                depthIndex = curves.length - 1;
                depthColumn = parts[0].trim();
              }
              
              if (gammaIndex === -1 && 
                  (curveName === 'gr' || curveName.includes('gamma'))) {
                gammaIndex = curves.length - 1;
                grColumn = parts[0].trim();
              }
            }
          }
          
          // Process data lines in the ASCII section
          if (inDataSection && !line.startsWith('~')) {
            const values = line.trim().split(/\\s+/);
            
            // If we found depth and gamma columns in the curve section
            if (depthIndex !== -1 && gammaIndex !== -1 && values.length > Math.max(depthIndex, gammaIndex)) {
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
          
          // Process data in the ~Other Information section (Hutchison-Teele format)
          if (inOtherInfoSection && !line.startsWith('~') && !line.startsWith('#')) {
            const values = line.trim().split(/\\s+/).filter(val => val.trim().length > 0);
            
            // Check if this is a data line (has at least 4 columns and starts with a number)
            if (values.length >= 4 && !isNaN(parseFloat(values[0]))) {
              let depth, gamma;
              
              // Hutchison-Teele format usually has GR as the second column after DEPTH
              // Format: TRACK SVY DEPTH INCL AZM TVD VS N/-S E/-W DLS
              if (values.length >= 4 && line.match(/^\s*\d+\s+\d+\s+\d+/)) {
                // Find the DEPTH column - it's usually the 3rd number
                depth = parseFloat(values[2]);
                
                // Try to find GR - Check if there's an explicit GR column
                // If not found, handle it outside this block with other approaches
                // Extract GR from another source in the file
              }
            }
          }
        }
        
        // If standard LAS parsing didn't work, try to find data in Curve Information section
        // and parse the data section differently
        if (gammaData.length === 0 && curves.length > 0) {
          // First, determine if this file has GR data
          const hasGammaCurve = curves.some(curve => 
            curve.name.toLowerCase() === 'gr' || 
            curve.name.toLowerCase().includes('gamma')
          );
          
          if (hasGammaCurve) {
            // Find the data section
            let dataLineStart = 0;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].trim().startsWith('~A')) {
                dataLineStart = i + 1;
                break;
              }
            }
            
            // Parse data lines with index-based approach
            if (dataLineStart > 0) {
              for (let i = dataLineStart; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line || line.startsWith('~') || line.startsWith('#')) continue;
                
                const values = line.split(/\\s+/).filter(v => v.trim().length > 0);
                if (values.length >= 2) {
                  // In standard LAS, first column is depth, find the GR column
                  const depth = parseNumber(values[0]);
                  
                  // Find the gamma ray column
                  let gamma = 0;
                  for (let j = 0; j < curves.length; j++) {
                    if (curves[j].name.toLowerCase() === 'gr' || 
                        curves[j].name.toLowerCase().includes('gamma')) {
                      gamma = parseNumber(values[j]);
                      break;
                    }
                  }
                  
                  if (depth > 0) {
                    gammaData.push({
                      wellId,
                      depth: String(depth),
                      value: String(gamma)
                    });
                  }
                }
              }
            }
          }
        }
        
        // Specifically handle Hutchison-Teele LAS format which may have embedded GR data
        if (gammaData.length === 0) {
          // Look for "~Other Information" section that contains both survey and sometimes gamma data
          let otherInfoSectionStart = -1;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('~Other Information')) {
              otherInfoSectionStart = i + 1;
              break;
            }
          }
          
          if (otherInfoSectionStart > 0) {
            // Look for GR data in the Curve Information section first to identify columns
            let hasGR = false;
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line.includes('GR') && line.includes('API')) {
                hasGR = true;
                break;
              }
            }
            
            if (hasGR) {
              // Process the data section with the knowledge there is GR data
              // The data might be in a tabular format with DEPTH and GR columns
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line || line.startsWith('#') || line.startsWith('~')) continue;
                
                // Try to parse data lines
                const parts = line.split(/\\s+/).filter(p => p.trim().length > 0);
                if (parts.length >= 2 && !isNaN(parseFloat(parts[0]))) {
                  const depth = parseFloat(parts[0]);
                  
                  // Usually GR is the 2nd column in tabular data
                  let gr = parts.length >= 2 ? parseFloat(parts[1]) : 0;
                  
                  // If this looks like survey data (has inclination, azimuth), skip it
                  if (parts.length >= 4 && !isNaN(parseFloat(parts[3]))) {
                    // This is likely survey data
                    continue;
                  }
                  
                  if (depth > 0) {
                    gammaData.push({
                      wellId,
                      depth: String(depth),
                      value: String(gr)
                    });
                  }
                }
              }
            }
          }
        }
        
        // If we still couldn't parse the gamma data, try to parse directly from the LAS 
        // data section by looking at the format of each line
        if (gammaData.length === 0) {
          let foundDataSection = false;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty or comment lines
            if (!line || line.startsWith('#')) continue;
            
            // Check for data section start
            if (line.startsWith('~A')) {
              foundDataSection = true;
              continue;
            }
            
            // Process data lines
            if (foundDataSection && !line.startsWith('~')) {
              // Standard LAS data format: values separated by whitespace
              // First value is typically depth
              const values = line.trim().split(/\\s+/).filter(v => v.trim().length > 0);
              
              if (values.length >= 2) {
                // First column is almost always depth
                const depth = parseNumber(values[0]);
                
                // For GR, we need to check curve definitions or use a heuristic
                // Often it's the 2nd column, but better to verify with curve info
                let grIndex = 1; // Default to second column
                
                // If we found a specific GR column in curve definitions, use that
                if (gammaIndex !== -1) {
                  grIndex = gammaIndex;
                }
                
                const gr = parseNumber(values[grIndex]);
                
                if (depth > 0) {
                  gammaData.push({
                    wellId,
                    depth: String(depth),
                    value: String(gr)
                  });
                }
              }
            }
          }
        }
        
        // Last resort: try to parse as a CSV or tab-delimited file
        if (gammaData.length === 0) {
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
        console.error('Gamma import error:', error);
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
 * Parse a LAS file for survey data (handles Hutchison-Teele and similar formats)
 */
export async function parseSurveyLAS(file: File, wellId: number): Promise<InsertSurvey[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split(/\\r?\\n/);
        const surveys: InsertSurvey[] = [];
        
        // Check for survey data in the ~Other Information section (common in Hutchison-Teele format)
        let inSurveySection = false;
        let surveyHeaderFound = false;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Skip empty lines or section markers that aren't related to surveys
          if (!line) continue;
          
          // Check for survey section markers or headers
          if (line.startsWith('#SURVEYS:') || 
              (line.includes('TRACK') && 
               line.includes('SVY') && 
               line.includes('DEPTH') && 
               line.includes('INCL') && 
               line.includes('AZM'))) {
            inSurveySection = true;
            surveyHeaderFound = true;
            continue;
          }
          
          // Check for Other Information section that contains survey data
          if (line.startsWith('~Other')) {
            inSurveySection = true;
            continue;
          }
          
          // Process lines in the survey section
          if (inSurveySection && !line.startsWith('#') && !line.startsWith('~')) {
            // Split line into elements
            const elements = line.split(/\\s+/).filter(e => e.trim() !== '');
            
            // Hutchison-Teele format typically has:
            // TRACK SVY DEPTH INCL AZM TVD VS N/-S E/-W DLS
            // Example: 1 10 1072.00 6.87 138.87 1069.42 43.20 -32.40 47.01 1.08
            
            // Check if this line looks like survey data (numeric values)
            if (elements.length >= 5 && !isNaN(parseNumber(elements[2]))) {
              const md = parseNumber(elements[2]);
              const inc = parseNumber(elements[3]);
              const azi = parseNumber(elements[4]);
              
              // Only add surveys with valid MD
              if (md > 0) {
                surveys.push({
                  wellId,
                  md: String(md),
                  inc: String(inc),
                  azi: String(azi),
                  bitDepth: String(md), // Default to MD
                  gTotal: null,
                  bTotal: null,
                  dipAngle: null, 
                  toolFace: null
                });
              }
            }
          }
        }
        
        // If we couldn't find survey data in the expected format,
        // fall back to generic text parsing
        if (surveys.length === 0) {
          // Convert lines to rows for the generic parser
          const rows = lines.map(line => 
            line.trim().split(/\\s+/).filter(cell => cell.length > 0)
          );
          
          // Detect header row
          const headerInfo = detectHeaderRow(rows);
          
          // Extract survey data
          const extractedSurveys = extractSurveyData(rows, headerInfo, wellId);
          
          if (extractedSurveys.length > 0) {
            resolve(extractedSurveys);
            return;
          }
          
          reject(new Error('Could not extract survey data from LAS file'));
        } else {
          resolve(surveys);
        }
      } catch (error: unknown) {
        console.error('Survey import error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        reject(new Error(`Failed to parse LAS survey data: ${errorMessage}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
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
  } else if (fileType === 'las') {
    // Try to parse as a LAS file first
    try {
      return await parseSurveyLAS(file, wellId);
    } catch (error) {
      // Fall back to text parsing if LAS parsing fails
      console.warn('LAS parsing failed, trying generic text parsing:', error);
      return parseSurveyText(file, wellId);
    }
  } else {
    // Assume text file
    return parseSurveyText(file, wellId);
  }
}