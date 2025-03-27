import React, { createContext, useContext, useState } from 'react';
import { 
  runBasicPredictionModel, 
  runAdvancedPredictionModel, 
  PredictionModelInput, 
  PredictionResults,
  LithologyData
} from '@/lib/ai-prediction-models-simple';
import { useSurveyContext } from './SurveyContext';

interface AIPredictionContextType {
  // State
  predictionResults: PredictionResults | null;
  targetFormation: string;
  targetTVD: number | null;
  targetInclination: number | null;
  targetAzimuth: number | null;
  isLoading: boolean;
  isAdvancedModel: boolean;
  lithologyData: LithologyData[];
  mudType: string;
  bitType: string;
  
  // Actions
  setTargetFormation: (formation: string) => void;
  setTargetTVD: (tvd: number | null) => void;
  setTargetInclination: (inc: number | null) => void;
  setTargetAzimuth: (az: number | null) => void;
  setIsAdvancedModel: (isAdvanced: boolean) => void;
  setLithologyData: (data: LithologyData[]) => void;
  setMudType: (type: string) => void;
  setBitType: (type: string) => void;
  runPredictionModel: () => void;
}

const AIPredictionContext = createContext<AIPredictionContextType | undefined>(undefined);

const defaultContext: AIPredictionContextType = {
  predictionResults: null,
  targetFormation: '',
  targetTVD: null,
  targetInclination: null,
  targetAzimuth: null,
  isLoading: false,
  isAdvancedModel: false,
  lithologyData: [],
  mudType: 'Water-Based Mud',
  bitType: 'PDC Bit',
  
  setTargetFormation: () => {},
  setTargetTVD: () => {},
  setTargetInclination: () => {},
  setTargetAzimuth: () => {},
  setIsAdvancedModel: () => {},
  setLithologyData: () => {},
  setMudType: () => {},
  setBitType: () => {},
  runPredictionModel: () => {}
};

export const useAIPrediction = () => {
  const context = useContext(AIPredictionContext);
  if (context === undefined) {
    throw new Error('useAIPrediction must be used within an AIPredictionProvider');
  }
  return context;
};

export const AIPredictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { surveys, curveData } = useSurveyContext();
  
  // State
  const [predictionResults, setPredictionResults] = useState<PredictionResults | null>(null);
  const [targetFormation, setTargetFormation] = useState<string>('');
  const [targetTVD, setTargetTVD] = useState<number | null>(null);
  const [targetInclination, setTargetInclination] = useState<number | null>(null);
  const [targetAzimuth, setTargetAzimuth] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdvancedModel, setIsAdvancedModel] = useState<boolean>(false);
  const [lithologyData, setLithologyData] = useState<LithologyData[]>([]);
  const [mudType, setMudType] = useState<string>('Water-Based Mud');
  const [bitType, setBitType] = useState<string>('PDC Bit');
  
  // Run the prediction model based on current data
  const runPredictionModel = async () => {
    setIsLoading(true);
    
    try {
      // Prepare input data for the model
      const input: PredictionModelInput = {
        surveys: surveys,
        curveData: curveData || undefined,
        targetFormation: targetFormation || undefined,
        targetTVD: targetTVD || undefined,
        targetInclination: targetInclination || undefined,
        targetAzimuth: targetAzimuth || undefined,
        lithology: lithologyData.length > 0 ? lithologyData : undefined,
        mudType: mudType || undefined,
        bitType: bitType || undefined
      };
      
      let results: PredictionResults;
      
      // Run the appropriate model based on user selection
      if (isAdvancedModel) {
        // Advanced model is async, returns a Promise
        results = await runAdvancedPredictionModel(input);
      } else {
        // Basic model is synchronous
        results = runBasicPredictionModel(input);
      }
      
      // Update state with results
      setPredictionResults(results);
    } catch (error) {
      console.error('Error running prediction model:', error);
      // Handle errors with appropriate feedback
    } finally {
      setIsLoading(false);
    }
  };
  
  const value: AIPredictionContextType = {
    predictionResults,
    targetFormation,
    targetTVD,
    targetInclination,
    targetAzimuth,
    isLoading,
    isAdvancedModel,
    lithologyData,
    mudType,
    bitType,
    
    setTargetFormation,
    setTargetTVD,
    setTargetInclination,
    setTargetAzimuth,
    setIsAdvancedModel,
    setLithologyData,
    setMudType,
    setBitType,
    runPredictionModel
  };
  
  return (
    <AIPredictionContext.Provider value={value}>
      {children}
    </AIPredictionContext.Provider>
  );
};