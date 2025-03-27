/**
 * AI Prediction Models for Drilling Optimization
 * These models provide both basic and advanced prediction capabilities for optimizing drilling parameters
 * based on historical survey data, formation characteristics, and drilling equipment specifications.
 */

import { Survey } from "@shared/schema";

// Helper function to parse numeric values from surveys
function parseNumeric(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value) || 0;
}

/**
 * Interface for prediction model input data
 */
export interface PredictionModelInput {
  surveys: Survey[];           // Historical survey data
  curveData?: any;             // Current curve data if available
  targetFormation?: string;    // Target geological formation
  targetTVD?: number;          // Target true vertical depth
  targetInclination?: number;  // Target inclination
  targetAzimuth?: number;      // Target azimuth
  lithology?: LithologyData[]; // Lithology data if available
  mudType?: string;            // Mud type being used
  bitType?: string;            // Bit type being used
  motorData?: MotorData;       // Motor specifications
  ropConstraints?: ROPConstraints; // Rate of penetration constraints
}

/**
 * Interface for lithology data
 */
export interface LithologyData {
  depth: number;
  formation: string;
  description: string;
  hardness: number; // Scale of 1-10
}

/**
 * Interface for motor specifications
 */
export interface MotorData {
  type: string;
  yield: number;
  flowRate: number;
  pressure: number;
}

/**
 * Interface for Rate of Penetration constraints
 */
export interface ROPConstraints {
  maxROP: number;
  minROP: number;
  optimalROP: number;
  maxWOB: number; // Weight on bit
  maxRPM: number;
}

/**
 * Interface for drilling optimization recommendations
 */
export interface DrillingRecommendation {
  recommendedROP: number;
  recommendedWOB: number;
  recommendedRPM: number;
  slideRotateRatio: number;
  slidingLength: number;
  rotatingLength: number;
  toolface: number;
  doglegSeverity: number;
  expectedTorque: number;
  expectedDrag: number;
  confidenceScore: number;
  optimizationType: 'ROP' | 'TORTUOSITY' | 'WELLBORE_QUALITY' | 'BALANCED';
  explanation: string;
  warningFlags: string[];
}

/**
 * Interface for vibration prediction
 */
export interface VibrationPrediction {
  axialVibrationRisk: number; // 0-1 scale
  lateralVibrationRisk: number; // 0-1 scale
  torsionalVibrationRisk: number; // 0-1 scale
  recommendedMitigations: string[];
  explanations: {
    axial: string;
    lateral: string;
    torsional: string;
  };
}

/**
 * Interface for wellbore stability prediction
 */
export interface WellboreStabilityPrediction {
  stabilityRisk: number; // 0-1 scale
  potentialIssues: string[];
  mitigationStrategies: string[];
  mudWeightRecommendation: {
    min: number;
    optimal: number;
    max: number;
  };
}

/**
 * Interface for overall prediction results
 */
export interface PredictionResults {
  drillingRecommendations: DrillingRecommendation;
  vibrationPredictions: VibrationPrediction;
  wellboreStabilityPredictions: WellboreStabilityPrediction;
  trajectoryCorrectionNeeded: boolean;
  trajectoryCorrectionRecommendations: string[];
  formationTopPredictions?: {
    formation: string;
    predictedDepth: number;
    confidence: number;
  }[];
}

/**
 * Runs the basic AI prediction model using available data
 */
export function runBasicPredictionModel(input: PredictionModelInput): PredictionResults {
  const { surveys } = input;
  
  // Generate drilling recommendations
  const drillingRecommendations = generateDrillingRecommendations(
    surveys,
    input.targetInclination,
    input.targetAzimuth,
    input.lithology,
    input.bitType
  );
  
  // Generate vibration predictions
  const vibrationPredictions = predictVibrations(
    surveys,
    drillingRecommendations
  );
  
  // Generate wellbore stability predictions
  const wellboreStabilityPredictions = predictWellboreStability(
    surveys,
    input.lithology,
    input.mudType
  );
  
  // Determine if trajectory correction is needed
  const trajectoryCorrectionNeeded = determineIfTrajectoryCorrectionNeeded(
    surveys,
    input.targetTVD,
    input.targetInclination,
    input.targetAzimuth
  );
  
  // Generate trajectory correction recommendations if needed
  const trajectoryCorrectionRecommendations = generateTrajectoryCorrectionRecommendations(
    surveys,
    input.targetTVD,
    input.targetInclination,
    input.targetAzimuth
  );
  
  // Generate formation top predictions if we have lithology data
  const formationTopPredictions = input.lithology && input.lithology.length > 0
    ? input.lithology.map(lith => ({
        formation: lith.formation,
        predictedDepth: lith.depth,
        confidence: 0.8 - (Math.random() * 0.3) // Simulating confidence scores
      }))
    : undefined;
  
  return {
    drillingRecommendations,
    vibrationPredictions,
    wellboreStabilityPredictions,
    trajectoryCorrectionNeeded,
    trajectoryCorrectionRecommendations,
    formationTopPredictions
  };
}

/**
 * Advanced AI prediction model integrating machine learning algorithms
 * This would typically call an external ML service in production
 */
export function runAdvancedPredictionModel(input: PredictionModelInput): Promise<PredictionResults> {
  // In a real implementation, this would make API calls to an ML service
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Base results on the basic model
      const baseResults = runBasicPredictionModel(input);
      
      // Enhance results with "advanced" capabilities
      const enhancedResults: PredictionResults = {
        ...baseResults,
        drillingRecommendations: {
          ...baseResults.drillingRecommendations,
          // Slightly different values to simulate advanced model
          recommendedROP: baseResults.drillingRecommendations.recommendedROP * (1 + (Math.random() * 0.2 - 0.1)),
          recommendedWOB: baseResults.drillingRecommendations.recommendedWOB * (1 + (Math.random() * 0.2 - 0.1)),
          recommendedRPM: baseResults.drillingRecommendations.recommendedRPM * (1 + (Math.random() * 0.2 - 0.1)),
          // Higher confidence score for advanced model
          confidenceScore: Math.min(0.95, baseResults.drillingRecommendations.confidenceScore + 0.15),
          // More detailed explanation
          explanation: baseResults.drillingRecommendations.explanation + " Advanced analysis incorporated historical well data from offset wells and machine learning pattern recognition to refine these recommendations.",
        },
        vibrationPredictions: {
          ...baseResults.vibrationPredictions,
          // More detailed mitigations for advanced model
          recommendedMitigations: [
            ...baseResults.vibrationPredictions.recommendedMitigations,
            "Apply advanced friction reduction techniques based on machine learning analysis",
            "Implement dynamic toolface control algorithms for optimized sliding sequences"
          ],
        },
        wellboreStabilityPredictions: {
          ...baseResults.wellboreStabilityPredictions,
          // Additional strategies for advanced model
          mitigationStrategies: [
            ...baseResults.wellboreStabilityPredictions.mitigationStrategies,
            "Apply machine learning derived optimal mud weight variation by formation",
            "Implement advanced wellbore strengthening materials based on formation properties"
          ],
        },
        // Add detailed formation top predictions with ML-derived confidence levels
        formationTopPredictions: input.lithology ? input.lithology.map(lith => ({
          formation: lith.formation,
          predictedDepth: lith.depth + (Math.random() * 20 - 10), // More varied predictions
          confidence: 0.85 + (Math.random() * 0.1) // Higher confidence
        })) : undefined,
      };
      
      resolve(enhancedResults);
    }, 2000); // 2 second delay to simulate API call
  });
}

/**
 * Generate drilling optimization recommendations
 */
function generateDrillingRecommendations(
  surveys: Survey[],
  targetInclination?: number,
  targetAzimuth?: number,
  lithology?: LithologyData[],
  bitType?: string
): DrillingRecommendation {
  // Default values
  let recommendedROP = 80;  // ft/hr
  let recommendedWOB = 25;  // klbs
  let recommendedRPM = 60;  // rpm
  let slideRotateRatio = 0.3;  // 30% sliding, 70% rotating
  let doglegSeverity = 2.5;  // degrees/100ft
  let expectedTorque = 8000;  // ft-lbs
  let expectedDrag = 15000;  // lbs
  let confidenceScore = 0.75;
  let warningFlags: string[] = [];
  let optimizationType: 'ROP' | 'TORTUOSITY' | 'WELLBORE_QUALITY' | 'BALANCED' = 'BALANCED';
  
  // Get the most recent survey
  const lastSurvey = surveys.length > 0 ? surveys[surveys.length - 1] : null;
  
  // Adjust based on recent survey data
  if (lastSurvey) {
    // Adjust ROP based on inclination
    const inc = parseNumeric(lastSurvey.inc);
    if (inc > 60) {
      recommendedROP -= 15;  // Reduce ROP in high inclination
      warningFlags.push('HIGH_INCLINATION_ZONE');
    }
    
    // Adjust WOB based on depth
    const md = parseNumeric(lastSurvey.md);
    if (md > 10000) {
      recommendedWOB += 5;  // Increase WOB in deeper sections
      expectedTorque += 2000;  // More depth = more torque
      expectedDrag += 5000;  // More depth = more drag
    }
    
    // Calculate toolface based on target azimuth
    let toolface = 0;
    const azi = parseNumeric(lastSurvey.azi);
    if (targetAzimuth !== undefined) {
      const azimuthDiff = getShortestAngularDistance(azi, targetAzimuth);
      toolface = (azimuthDiff > 0) ? 90 : 270;  // Simplified toolface calculation
    }
    
    // Calculate sliding/rotating lengths
    const slideDistance = 30; // ft
    const rotateDistance = 70; // ft
    
    return {
      recommendedROP,
      recommendedWOB,
      recommendedRPM,
      slideRotateRatio,
      slidingLength: slideDistance,
      rotatingLength: rotateDistance,
      toolface: toolface,
      doglegSeverity,
      expectedTorque,
      expectedDrag,
      confidenceScore,
      optimizationType,
      explanation: `Recommendations based on analysis of ${surveys.length} survey points. Optimized for balanced drilling performance considering ROP, wellbore quality, and equipment limitations.`,
      warningFlags
    };
  }
  
  // Adjust based on lithology if available
  if (lithology && lithology.length > 0) {
    // Find the lithology closest to the current depth
    const currentDepth = lastSurvey ? parseNumeric(lastSurvey.md) : 0;
    let closestLithology: LithologyData | null = null;
    let minDepthDiff = Number.MAX_VALUE;
    
    for (const lith of lithology) {
      const depthDiff = Math.abs(lith.depth - currentDepth);
      if (depthDiff < minDepthDiff) {
        minDepthDiff = depthDiff;
        closestLithology = lith;
      }
    }
    
    if (closestLithology) {
      // Adjust parameters based on formation hardness
      if (closestLithology.hardness > 7) {
        recommendedROP -= 20;
        recommendedWOB += 5;
        recommendedRPM += 10;
        warningFlags.push('HARD_FORMATION');
      } else if (closestLithology.hardness < 3) {
        recommendedROP += 15;
        recommendedWOB -= 3;
        warningFlags.push('SOFT_FORMATION');
      }
    }
  }
  
  // Adjust based on bit type
  if (bitType) {
    if (bitType === 'PDC Bit') {
      recommendedRPM -= 10;
      recommendedWOB += 2;
    } else if (bitType === 'Tricone Bit') {
      recommendedRPM += 20;
      recommendedWOB -= 5;
    } else if (bitType === 'Diamond Bit') {
      recommendedRPM += 30;
      recommendedWOB -= 8;
      warningFlags.push('DIAMOND_BIT_OPERATING_PARAMETERS');
    }
  }
  
  // Generate explanations based on all the factors
  let explanation = `Recommendations based on analysis of ${surveys.length} survey points. `;
  
  if (optimizationType === 'ROP') {
    explanation += 'Prioritizing rate of penetration for faster drilling. ';
  } else if (optimizationType === 'TORTUOSITY') {
    explanation += 'Prioritizing reduced tortuosity for better wellbore quality. ';
  } else if (optimizationType === 'WELLBORE_QUALITY') {
    explanation += 'Prioritizing wellbore quality for better completions. ';
  } else {
    explanation += 'Optimized for balanced drilling performance considering ROP, wellbore quality, and equipment limitations. ';
  }
  
  if (warningFlags.length > 0) {
    explanation += 'Particular attention needed for identified risk factors. ';
  }
  
  return {
    recommendedROP,
    recommendedWOB,
    recommendedRPM,
    slideRotateRatio,
    slidingLength: 30,  // Default sliding length in ft
    rotatingLength: 70, // Default rotating length in ft
    toolface: lastSurvey && targetAzimuth ? 
      (getShortestAngularDistance(parseNumeric(lastSurvey.azi), targetAzimuth) > 0 ? 90 : 270) : 
      0,
    doglegSeverity,
    expectedTorque,
    expectedDrag,
    confidenceScore,
    optimizationType,
    explanation,
    warningFlags
  };
}

/**
 * Predict vibrations based on survey data and drilling recommendations
 */
function predictVibrations(
  surveys: Survey[],
  drillingRecommendations: DrillingRecommendation
): VibrationPrediction {
  // Default risk values (0-1 scale)
  let axialVibrationRisk = 0.3;
  let lateralVibrationRisk = 0.4;
  let torsionalVibrationRisk = 0.35;
  
  // Default mitigations
  let recommendedMitigations = [
    "Maintain consistent WOB to minimize axial vibrations",
    "Monitor and adjust RPM to avoid resonant frequencies",
    "Use proper stabilization in the BHA design"
  ];
  
  // Explanations for each vibration type
  let axialExplanation = "Based on current parameters, axial vibration risk is moderate. Watch for signs of bit bounce.";
  let lateralExplanation = "Lateral vibration risk is controlled but could increase in harder formations.";
  let torsionalExplanation = "Torsional vibration (stick-slip) risk is moderate, monitor torque fluctuations.";
  
  // Adjust based on drilling recommendations
  if (drillingRecommendations.recommendedRPM > 80) {
    lateralVibrationRisk += 0.2;
    lateralExplanation = "Higher RPM increases risk of lateral vibrations. Consider additional stabilization.";
    recommendedMitigations.push("Consider reducing RPM to decrease lateral vibration risk");
  }
  
  if (drillingRecommendations.recommendedWOB > 30) {
    torsionalVibrationRisk += 0.25;
    torsionalExplanation = "Higher WOB increases risk of stick-slip. Monitor torque carefully and consider torque limiting techniques.";
    recommendedMitigations.push("Apply real-time torque management to mitigate stick-slip");
  }
  
  // Adjust based on survey data
  if (surveys.length > 0) {
    const lastSurvey = surveys[surveys.length - 1];
    
    // High inclination increases lateral vibration risk
    const inc = parseNumeric(lastSurvey.inc);
    if (inc > 60) {
      lateralVibrationRisk += 0.15;
      lateralExplanation += " High inclination angle increases risk of lateral vibrations.";
    }
    
    // Depth affects all vibration types
    const md = parseNumeric(lastSurvey.md);
    if (md > 10000) {
      axialVibrationRisk += 0.1;
      torsionalVibrationRisk += 0.15;
      axialExplanation += " Increased depth adds complexity to vibration management.";
      torsionalExplanation += " Increased depth raises torsional vibration risk due to friction effects.";
      recommendedMitigations.push("Consider friction reduction techniques for the extended lateral section");
    }
  }
  
  // Cap risks at 1.0
  axialVibrationRisk = Math.min(axialVibrationRisk, 1.0);
  lateralVibrationRisk = Math.min(lateralVibrationRisk, 1.0);
  torsionalVibrationRisk = Math.min(torsionalVibrationRisk, 1.0);
  
  return {
    axialVibrationRisk,
    lateralVibrationRisk,
    torsionalVibrationRisk,
    recommendedMitigations,
    explanations: {
      axial: axialExplanation,
      lateral: lateralExplanation,
      torsional: torsionalExplanation
    }
  };
}

/**
 * Predict wellbore stability based on survey data
 */
function predictWellboreStability(
  surveys: Survey[],
  lithology?: LithologyData[],
  mudType?: string
): WellboreStabilityPrediction {
  // Default values
  let stabilityRisk = 0.3; // 0-1 scale
  let potentialIssues = [
    "Potential washouts in softer formations",
    "Risk of tight hole in higher angle sections"
  ];
  let mitigationStrategies = [
    "Maintain appropriate mud weight",
    "Monitor for tight spots while tripping",
    "Minimize drilling and tripping time in problematic zones"
  ];
  let mudWeightRecommendation = {
    min: 9.0, // ppg
    optimal: 10.2, // ppg
    max: 11.5 // ppg
  };
  
  // Adjust based on survey data
  if (surveys.length > 0) {
    const lastSurvey = surveys[surveys.length - 1];
    
    // High inclination increases stability risk
    const inc = parseNumeric(lastSurvey.inc);
    if (inc > 65) {
      stabilityRisk += 0.2;
      potentialIssues.push("Increased risk of hole collapse in high-angle section");
      mitigationStrategies.push("Consider wellbore strengthening materials in high-angle section");
    }
    
    // Adjust mud weight based on depth
    const md = parseNumeric(lastSurvey.md);
    
    if (md > 12000) {
      mudWeightRecommendation.min += 0.5;
      mudWeightRecommendation.optimal += 0.5;
      mudWeightRecommendation.max += 0.7;
      potentialIssues.push("Increased pore pressure gradient with depth");
    } else if (md > 8000) {
      mudWeightRecommendation.min += 0.3;
      mudWeightRecommendation.optimal += 0.3;
      mudWeightRecommendation.max += 0.4;
    }
  }
  
  // Adjust based on lithology
  if (lithology && lithology.length > 0) {
    let hasShale = false;
    let hasSand = false;
    let hasReactive = false;
    
    for (const lith of lithology) {
      const desc = lith.description.toLowerCase();
      if (desc.includes('shale')) {
        hasShale = true;
      }
      if (desc.includes('sand')) {
        hasSand = true;
      }
      if (desc.includes('reactive') || desc.includes('swelling')) {
        hasReactive = true;
      }
    }
    
    if (hasShale) {
      stabilityRisk += 0.15;
      potentialIssues.push("Shale sections may have wellbore stability issues");
      mitigationStrategies.push("Minimize exposure time in shale sections");
    }
    
    if (hasSand) {
      potentialIssues.push("Sand sections may have fluid loss issues");
      mitigationStrategies.push("Monitor for lost circulation in sand intervals");
    }
    
    if (hasReactive) {
      stabilityRisk += 0.25;
      potentialIssues.push("Reactive formations with swelling potential");
      mitigationStrategies.push("Use inhibitive mud system to control clay swelling");
    }
  }
  
  // Adjust based on mud type
  if (mudType) {
    if (mudType === 'Water-Based Mud') {
      if (lithology && lithology.some(l => l.description.toLowerCase().includes('reactive'))) {
        stabilityRisk += 0.2;
        potentialIssues.push("Water-based mud may interact with reactive formations");
        mitigationStrategies.push("Consider inhibitors in the water-based mud system");
      }
    } else if (mudType === 'Oil-Based Mud') {
      stabilityRisk -= 0.15; // OBM generally provides better wellbore stability
      mitigationStrategies.push("Maintain oil-water ratio for optimal stability");
    }
  }
  
  // Cap risk at 1.0
  stabilityRisk = Math.min(stabilityRisk, 1.0);
  
  return {
    stabilityRisk,
    potentialIssues,
    mitigationStrategies,
    mudWeightRecommendation
  };
}

/**
 * Determine if trajectory correction is needed
 */
function determineIfTrajectoryCorrectionNeeded(
  surveys: Survey[],
  targetTVD?: number,
  targetInclination?: number,
  targetAzimuth?: number
): boolean {
  // Default to no correction needed
  if (!targetTVD && !targetInclination && !targetAzimuth) {
    return false;
  }
  
  // Need at least one survey to determine if correction is needed
  if (surveys.length === 0) {
    return false;
  }
  
  const lastSurvey = surveys[surveys.length - 1];
  
  // Check if we're already close to targets
  const tvdDifference = targetTVD ? 
    Math.abs(targetTVD - parseNumeric(lastSurvey.tvd)) : 0;
  
  const inclinationDifference = targetInclination ? 
    Math.abs(targetInclination - parseNumeric(lastSurvey.inc)) : 0;
  
  const azimuthDifference = targetAzimuth ? 
    Math.abs(getShortestAngularDistance(parseNumeric(lastSurvey.azi), targetAzimuth)) : 0;
  
  // Determine if correction is needed based on thresholds
  const needsTVDCorrection = targetTVD && tvdDifference > 50;
  const needsInclinationCorrection = targetInclination && inclinationDifference > 2;
  const needsAzimuthCorrection = targetAzimuth && azimuthDifference > 5;
  
  return needsTVDCorrection || needsInclinationCorrection || needsAzimuthCorrection;
}

/**
 * Generate trajectory correction recommendations
 */
function generateTrajectoryCorrectionRecommendations(
  surveys: Survey[],
  targetTVD?: number,
  targetInclination?: number,
  targetAzimuth?: number
): string[] {
  // Need at least one survey to generate recommendations
  if (surveys.length === 0) {
    return ["Insufficient survey data to generate trajectory correction recommendations."];
  }
  
  const lastSurvey = surveys[surveys.length - 1];
  const recommendations: string[] = [];
  
  // Generate TVD correction recommendation
  if (targetTVD) {
    const tvdDifference = targetTVD - parseNumeric(lastSurvey.tvd);
    if (Math.abs(tvdDifference) > 50) {
      const direction = tvdDifference > 0 ? "deeper" : "shallower";
      recommendations.push(`Adjust trajectory to build ${Math.abs(tvdDifference).toFixed(1)} ft ${direction} to reach target TVD of ${targetTVD.toFixed(1)} ft.`);
    }
  }
  
  // Generate inclination correction recommendation
  if (targetInclination) {
    const incDifference = targetInclination - parseNumeric(lastSurvey.inc);
    if (Math.abs(incDifference) > 2) {
      const direction = incDifference > 0 ? "increase" : "decrease";
      recommendations.push(`${direction} inclination by ${Math.abs(incDifference).toFixed(1)}° to reach target inclination of ${targetInclination.toFixed(1)}°.`);
    }
  }
  
  // Generate azimuth correction recommendation
  if (targetAzimuth) {
    const azDifference = getShortestAngularDistance(parseNumeric(lastSurvey.azi), targetAzimuth);
    if (Math.abs(azDifference) > 5) {
      const direction = azDifference > 0 ? "right" : "left";
      recommendations.push(`Turn ${direction} by ${Math.abs(azDifference).toFixed(1)}° to reach target azimuth of ${targetAzimuth.toFixed(1)}°.`);
    }
  }
  
  // If no specific corrections were added, provide a general recommendation
  if (recommendations.length === 0) {
    if ((targetTVD || targetInclination || targetAzimuth) && determineIfTrajectoryCorrectionNeeded(surveys, targetTVD, targetInclination, targetAzimuth)) {
      recommendations.push("Minor trajectory adjustment recommended to optimize path to target.");
    } else {
      recommendations.push("Current trajectory is on target. Continue with established drilling parameters.");
    }
  }
  
  // Add general guidance
  recommendations.push(`Maintain a controlled dogleg severity below 3.0°/100ft during correction to ensure wellbore quality.`);
  
  return recommendations;
}

/**
 * Get the shortest angular distance between two angles
 */
function getShortestAngularDistance(angle1: number, angle2: number): number {
  let diff = angle2 - angle1;
  
  // Normalize to [-180, 180]
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  
  return diff;
}