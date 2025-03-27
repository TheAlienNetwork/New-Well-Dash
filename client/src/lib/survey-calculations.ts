interface SurveyPoint {
  md: number;
  inc: number;
  azi: number;
}

export interface SurveyCalculation {
  tvd: number;
  northSouth: number;
  isNorth: boolean;
  eastWest: number;
  isEast: boolean;
  vs: number;
  dls: number;
}

/**
 * Calculate TVD (True Vertical Depth) from measured depth and inclination
 */
export function calculateTVD(md: number, inc: number, prevMD: number, prevTVD: number): number {
  const avgInc = inc * Math.PI / 180;  // Convert to radians
  return prevTVD + (md - prevMD) * Math.cos(avgInc);
}

/**
 * Calculate North/South displacement
 */
export function calculateNorthSouth(
  md: number, 
  inc: number, 
  azi: number, 
  prevMD: number, 
  prevNorthSouth: number,
  prevIsNorth: boolean
): { northSouth: number, isNorth: boolean } {
  const incRad = inc * Math.PI / 180;
  const aziRad = azi * Math.PI / 180;
  
  // Calculate the NS component
  const nsChange = (md - prevMD) * Math.sin(incRad) * Math.cos(aziRad);
  
  // Apply to previous value considering direction
  let newNorthSouth = prevIsNorth ? prevNorthSouth + nsChange : prevNorthSouth - nsChange;
  
  // Determine if the result is north or south
  const isNorth = newNorthSouth >= 0;
  
  return { 
    northSouth: Math.abs(newNorthSouth),
    isNorth 
  };
}

/**
 * Calculate East/West displacement
 */
export function calculateEastWest(
  md: number, 
  inc: number, 
  azi: number, 
  prevMD: number, 
  prevEastWest: number,
  prevIsEast: boolean
): { eastWest: number, isEast: boolean } {
  const incRad = inc * Math.PI / 180;
  const aziRad = azi * Math.PI / 180;
  
  // Calculate the EW component
  const ewChange = (md - prevMD) * Math.sin(incRad) * Math.sin(aziRad);
  
  // Apply to previous value considering direction
  let newEastWest = prevIsEast ? prevEastWest + ewChange : prevEastWest - ewChange;
  
  // Determine if the result is east or west
  const isEast = newEastWest >= 0;
  
  return { 
    eastWest: Math.abs(newEastWest),
    isEast 
  };
}

/**
 * Calculate Vertical Section
 */
export function calculateVS(northSouth: number, eastWest: number, proposedDirection: number): number {
  const dirRad = proposedDirection * Math.PI / 180;
  return Math.abs(northSouth * Math.sin(dirRad) + eastWest * Math.cos(dirRad));
}

/**
 * Calculate Dogleg Severity
 */
export function calculateDLS(
  inc: number,
  azi: number,
  prevInc: number,
  prevAzi: number,
  md: number,
  prevMD: number
): number {
  const incRad1 = prevInc * Math.PI / 180;
  const incRad2 = inc * Math.PI / 180;
  const aziDiff = Math.abs(azi - prevAzi);
  
  // Handle azimuth wraparound
  const aziDiffRad = (aziDiff <= 180 ? aziDiff : 360 - aziDiff) * Math.PI / 180;
  
  // Calculate dogleg angle
  const doglegAngle = Math.acos(
    Math.cos(incRad1) * Math.cos(incRad2) + 
    Math.sin(incRad1) * Math.sin(incRad2) * Math.cos(aziDiffRad)
  );
  
  // Convert to degrees and normalize to per 100ft
  return (doglegAngle * 180 / Math.PI) * 100 / (md - prevMD);
}

/**
 * Calculate all survey values from a raw survey input and previous survey
 */
export function calculateSurveyValues(
  survey: SurveyPoint,
  previousSurvey: {
    md: number;
    inc: number;
    azi: number;
    tvd: number;
    northSouth: number;
    isNorth: boolean;
    eastWest: number;
    isEast: boolean;
  },
  proposedDirection: number
): SurveyCalculation {
  // Calculate TVD
  const tvd = calculateTVD(survey.md, survey.inc, previousSurvey.md, previousSurvey.tvd);
  
  // Calculate North/South
  const { northSouth, isNorth } = calculateNorthSouth(
    survey.md,
    survey.inc,
    survey.azi,
    previousSurvey.md,
    previousSurvey.northSouth,
    previousSurvey.isNorth
  );
  
  // Calculate East/West
  const { eastWest, isEast } = calculateEastWest(
    survey.md,
    survey.inc,
    survey.azi,
    previousSurvey.md,
    previousSurvey.eastWest,
    previousSurvey.isEast
  );
  
  // Calculate VS
  const vs = calculateVS(northSouth, eastWest, proposedDirection);
  
  // Calculate DLS
  const dls = calculateDLS(
    survey.inc,
    survey.azi,
    previousSurvey.inc,
    previousSurvey.azi,
    survey.md,
    previousSurvey.md
  );
  
  return {
    tvd,
    northSouth,
    isNorth,
    eastWest,
    isEast,
    vs,
    dls
  };
}

/**
 * Generate sample AI analysis for a survey
 */
export function generateSurveyAnalysis(survey: any, previousSurveys: any[]): {
  isValid: boolean;
  status: string;
  doglegs: string;
  trend: string;
  recommendation: string;
} {
  if (previousSurveys.length === 0) {
    return {
      isValid: true,
      status: 'Passed',
      doglegs: 'N/A - First survey',
      trend: 'N/A - First survey',
      recommendation: 'Continue as planned'
    };
  }
  
  const lastSurvey = previousSurveys[previousSurveys.length - 1];
  const incChange = survey.inc - lastSurvey.inc;
  const aziChange = Math.abs(survey.azi - lastSurvey.azi);
  
  const incChangeNormalized = (incChange * 100) / (survey.md - lastSurvey.md);
  
  let isValid = true;
  let status = 'Passed';
  let recommendation = 'Continue as planned';
  
  // Check dogleg severity
  if (survey.dls > 3) {
    isValid = false;
    status = 'Failed';
    recommendation = 'Reduce dogleg severity';
  }
  
  // Check inclination trend
  let trend = 'Consistent with build plan';
  if (Math.abs(incChangeNormalized) > 2) {
    trend = 'Excessive inclination change detected';
    if (isValid) {
      isValid = false;
      status = 'Warning';
      recommendation = 'Monitor inclination build rate';
    }
  }
  
  // DLS status
  const dlsValue = (typeof survey.dls === 'number') 
    ? survey.dls 
    : (typeof survey.dls === 'string' 
        ? parseFloat(survey.dls || '0') 
        : 0);
  
  let doglegs = `${dlsValue.toFixed(2)}°/100ft (Within limits)`;
  if (dlsValue > 2) {
    doglegs = `${dlsValue.toFixed(2)}°/100ft (High)`;
  }
  
  return {
    isValid,
    status,
    doglegs,
    trend,
    recommendation
  };
}

/**
 * Calculate projected values based on current surveys and trends
 */
export function projectValues(surveys: any[], projectionDistance: number = 100): {
  projectedInc: number;
  projectedAz: number;
  buildRate: number;
  turnRate: number;
  isAbove: boolean;
  isBelow: boolean;
  isLeft: boolean; 
  isRight: boolean;
} {
  if (surveys.length < 2) {
    return {
      projectedInc: surveys.length ? surveys[0].inc : 0,
      projectedAz: surveys.length ? surveys[0].azi : 0,
      buildRate: 0,
      turnRate: 0,
      isAbove: false,
      isBelow: false,
      isLeft: false,
      isRight: false
    };
  }
  
  // Use last 3 surveys or all if less than 3
  const recentSurveys = surveys.slice(-3);
  
  // Calculate build rate (inclination change per 100ft)
  let buildRateSum = 0;
  let turnRateSum = 0;
  let totalDistance = 0;
  
  for (let i = 1; i < recentSurveys.length; i++) {
    const s1 = recentSurveys[i-1];
    const s2 = recentSurveys[i];
    const distance = s2.md - s1.md;
    
    buildRateSum += (s2.inc - s1.inc) * (100 / distance);
    
    // Calculate azimuth change (handle wraparound)
    let aziChange = s2.azi - s1.azi;
    if (aziChange > 180) aziChange -= 360;
    if (aziChange < -180) aziChange += 360;
    
    turnRateSum += aziChange * (100 / distance);
    totalDistance += distance;
  }
  
  const buildRate = buildRateSum / (recentSurveys.length - 1);
  const turnRate = turnRateSum / (recentSurveys.length - 1);
  
  // Calculate projected values
  const lastSurvey = surveys[surveys.length - 1];
  const normalizedDistance = projectionDistance / 100;
  
  const projectedInc = lastSurvey.inc + (buildRate * normalizedDistance);
  
  // Handle azimuth wraparound for projection
  let projectedAz = lastSurvey.azi + (turnRate * normalizedDistance);
  if (projectedAz >= 360) projectedAz -= 360;
  if (projectedAz < 0) projectedAz += 360;
  
  // Calculate directional positioning
  const isAbove = projectedInc > lastSurvey.inc;
  const isBelow = projectedInc < lastSurvey.inc;
  
  // Calculate left/right based on azimuth change
  let azimuthDiff = projectedAz - lastSurvey.azi;
  if (azimuthDiff > 180) azimuthDiff -= 360;
  if (azimuthDiff < -180) azimuthDiff += 360;
  
  const isLeft = azimuthDiff < 0;
  const isRight = azimuthDiff > 0;

  return {
    projectedInc,
    projectedAz,
    buildRate,
    turnRate,
    isAbove,
    isBelow,
    isLeft,
    isRight
  };
}

/**
 * Calculate slide requirements
 */
export function calculateSlideRequirements(
  currentInc: number, 
  targetInc: number,
  currentAzi: number,
  targetAzi: number,
  motorYield: number,
  distanceToNext: number
): {
  dogLegNeeded: number;
  slideAhead: number;
  toolFace: number;
} {
  // Calculate change needed
  const incChange = targetInc - currentInc;
  
  // Handle azimuth wraparound
  let aziChange = targetAzi - currentAzi;
  if (aziChange > 180) aziChange -= 360;
  if (aziChange < -180) aziChange += 360;
  
  // Calculate dogleg severity needed
  const dogLegNeeded = Math.sqrt(incChange * incChange + aziChange * aziChange) * (100 / distanceToNext);
  
  // Calculate slide distance needed
  const slideAhead = (dogLegNeeded * distanceToNext) / motorYield;
  
  // Calculate toolface angle
  let toolFace = Math.atan2(aziChange, incChange) * (180 / Math.PI);
  if (toolFace < 0) toolFace += 360;
  
  return {
    dogLegNeeded,
    slideAhead,
    toolFace
  };
}
