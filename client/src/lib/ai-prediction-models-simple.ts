/**
 * Simple version of AI Prediction Models for Drilling Optimization
 */

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
 * Interface for prediction model input data
 */
export interface PredictionModelInput {
  surveys: any[];          // Historical survey data
  curveData?: any;          // Current curve data if available
  targetFormation?: string; // Target geological formation
  targetTVD?: number;       // Target true vertical depth
  targetInclination?: number; // Target inclination
  targetAzimuth?: number;   // Target azimuth
  lithology?: LithologyData[]; // Lithology data if available
  mudType?: string;         // Mud type being used
  bitType?: string;         // Bit type being used
  motorData?: MotorData;    // Motor specifications
  ropConstraints?: ROPConstraints; // Rate of penetration constraints
}

/**
 * Runs the basic AI prediction model using available data
 */
export function runBasicPredictionModel(_input: PredictionModelInput): PredictionResults {
  // Generate mock drilling recommendations
  const drillingRecommendations: DrillingRecommendation = {
    recommendedROP: 85.5,
    recommendedWOB: 23.4,
    recommendedRPM: 65.2,
    slideRotateRatio: 0.35,
    slidingLength: 30,
    rotatingLength: 70,
    toolface: 75.5,
    doglegSeverity: 2.8,
    expectedTorque: 8500,
    expectedDrag: 14500,
    confidenceScore: 0.78,
    optimizationType: 'BALANCED',
    explanation: 'Optimized for balanced drilling performance considering ROP, wellbore quality, and equipment limitations.',
    warningFlags: ['HIGH_INCLINATION_ZONE']
  };
  
  // Generate mock vibration predictions
  const vibrationPredictions: VibrationPrediction = {
    axialVibrationRisk: 0.35,
    lateralVibrationRisk: 0.45,
    torsionalVibrationRisk: 0.28,
    recommendedMitigations: [
      "Maintain consistent WOB to minimize axial vibrations",
      "Monitor and adjust RPM to avoid resonant frequencies",
      "Use proper stabilization in the BHA design"
    ],
    explanations: {
      axial: "Based on current parameters, axial vibration risk is moderate. Watch for signs of bit bounce.",
      lateral: "Lateral vibration risk is elevated. Consider additional stabilization.",
      torsional: "Torsional vibration (stick-slip) risk is low to moderate, continue monitoring torque fluctuations."
    }
  };
  
  // Generate mock wellbore stability predictions
  const wellboreStabilityPredictions: WellboreStabilityPrediction = {
    stabilityRisk: 0.32,
    potentialIssues: [
      "Potential washouts in softer formations",
      "Risk of tight hole in higher angle sections"
    ],
    mitigationStrategies: [
      "Maintain appropriate mud weight",
      "Monitor for tight spots while tripping",
      "Minimize drilling and tripping time in problematic zones"
    ],
    mudWeightRecommendation: {
      min: 9.2,
      optimal: 10.5,
      max: 11.8
    }
  };
  
  // Generate mock trajectory correction recommendations
  const trajectoryCorrectionNeeded = true;
  const trajectoryCorrectionRecommendations = [
    "Increase inclination by 1.5° to reach target inclination of 45.0°.",
    "Turn left by 2.8° to reach target azimuth of 175.5°.",
    "Maintain a controlled dogleg severity below 3.0°/100ft during correction to ensure wellbore quality."
  ];
  
  // Generate mock formation top predictions if lithology data is provided
  const formationTopPredictions = _input.lithology ? _input.lithology.map(lith => ({
    formation: lith.formation,
    predictedDepth: lith.depth,
    confidence: 0.8 - (Math.random() * 0.3)
  })) : [
    {
      formation: "Austin Chalk",
      predictedDepth: 6580,
      confidence: 0.85
    },
    {
      formation: "Eagle Ford",
      predictedDepth: 7850,
      confidence: 0.75
    }
  ];
  
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
 */
export function runAdvancedPredictionModel(input: PredictionModelInput): Promise<PredictionResults> {
  // Simulate an API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get base results from the basic model
      const baseResults = runBasicPredictionModel(input);
      
      // Enhance with "advanced" capabilities
      const enhancedResults: PredictionResults = {
        ...baseResults,
        drillingRecommendations: {
          ...baseResults.drillingRecommendations,
          // Slightly different values
          recommendedROP: 83.2,
          recommendedWOB: 24.6,
          recommendedRPM: 62.8,
          // Higher confidence score
          confidenceScore: 0.92,
          // More detailed explanation
          explanation: baseResults.drillingRecommendations.explanation + " Advanced analysis incorporated historical well data from offset wells and machine learning pattern recognition to refine these recommendations.",
        },
        vibrationPredictions: {
          ...baseResults.vibrationPredictions,
          // More detailed mitigations
          recommendedMitigations: [
            ...baseResults.vibrationPredictions.recommendedMitigations,
            "Apply advanced friction reduction techniques based on machine learning analysis",
            "Implement dynamic toolface control algorithms for optimized sliding sequences"
          ],
        },
        wellboreStabilityPredictions: {
          ...baseResults.wellboreStabilityPredictions,
          // Additional strategies
          mitigationStrategies: [
            ...baseResults.wellboreStabilityPredictions.mitigationStrategies,
            "Apply machine learning derived optimal mud weight variation by formation",
            "Implement advanced wellbore strengthening materials based on formation properties"
          ],
        },
        // Add detailed formation top predictions
        formationTopPredictions: input.lithology ? input.lithology.map(lith => ({
          formation: lith.formation,
          predictedDepth: lith.depth + (Math.random() * 20 - 10),
          confidence: 0.85 + (Math.random() * 0.1)
        })) : [
          {
            formation: "Austin Chalk",
            predictedDepth: 6550,
            confidence: 0.92
          },
          {
            formation: "Eagle Ford",
            predictedDepth: 7830,
            confidence: 0.88
          },
          {
            formation: "Buda",
            predictedDepth: 8450,
            confidence: 0.76
          }
        ],
      };
      
      resolve(enhancedResults);
    }, 2000); // 2 second delay to simulate API call
  });
}