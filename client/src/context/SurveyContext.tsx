import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Survey, CurveData, GammaData, InsertSurvey } from '@shared/schema';
import { witsClient } from '@/lib/wits-client';
import { useWellContext } from './WellContext';
import { useToast } from '@/hooks/use-toast';
import { 
  generateSurveyAnalysis, 
  projectValues, 
  calculateSurveyValues,
  calculateTVD,
  calculateNorthSouth,
  calculateEastWest,
  calculateVS,
  calculateDLS
} from '@/lib/survey-calculations';

interface SurveyContextType {
  surveys: Survey[];
  latestSurvey: Survey | null;
  currentSurvey: Survey | null;
  setCurrentSurvey: (survey: Survey | null) => void;
  curveData: CurveData | null;
  gammaData: GammaData[];
  loading: boolean;
  error: string | null;
  showSurveyModal: boolean;
  setShowSurveyModal: (show: boolean) => void;
  modalSurvey: Survey | null;
  setModalSurvey: (survey: Survey | null) => void;
  addSurvey: (survey: InsertSurvey) => Promise<Survey | null>;
  updateSurvey: (id: number, survey: Partial<InsertSurvey>) => Promise<Survey | null>;
  deleteSurvey: (id: number) => Promise<boolean>;
  updateCurveData: (data: Partial<CurveData>) => Promise<CurveData | null>;
  aiAnalysis: {
    isValid: boolean;
    status: string;
    doglegs: string;
    trend: string;
    recommendation: string;
  } | null;
  projections: {
    projectedInc: number;
    projectedAz: number;
    buildRate: number;
    turnRate: number;
    isAbove?: boolean;
    isBelow?: boolean;
    isLeft?: boolean;
    isRight?: boolean;
    verticalPosition?: number;
    horizontalPosition?: number;
  } | null;
}

const defaultAiAnalysis = {
  isValid: true,
  status: 'Passed',
  doglegs: 'N/A',
  trend: 'N/A',
  recommendation: 'Continue as planned'
};

const SurveyContext = createContext<SurveyContextType>({
  surveys: [],
  latestSurvey: null,
  currentSurvey: null,
  setCurrentSurvey: () => {},
  curveData: null,
  gammaData: [],
  loading: true,
  error: null,
  showSurveyModal: false,
  setShowSurveyModal: () => {},
  modalSurvey: null,
  setModalSurvey: () => {},
  addSurvey: async () => null,
  updateSurvey: async () => null,
  deleteSurvey: async () => false,
  updateCurveData: async () => null,
  aiAnalysis: defaultAiAnalysis,
  projections: null
});

export const useSurveyContext = () => useContext(SurveyContext);

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [latestSurvey, setLatestSurvey] = useState<Survey | null>(null);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [curveData, setCurveData] = useState<CurveData | null>(null);
  const [gammaData, setGammaData] = useState<GammaData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSurveyModal, setShowSurveyModal] = useState<boolean>(false);
  const [modalSurvey, setModalSurvey] = useState<Survey | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(defaultAiAnalysis);
  const [projections, setProjections] = useState<any>(null);

  const { wellInfo } = useWellContext();
  const { toast } = useToast();

  useEffect(() => {
    if (wellInfo?.id) {
      loadSurveys(wellInfo.id);
      loadCurveData(wellInfo.id);
      loadGammaData(wellInfo.id);
    }
  }, [wellInfo]);

  useEffect(() => {
    // Calculate AI analysis
    if (latestSurvey) {
      try {
        const analysis = generateSurveyAnalysis(latestSurvey, surveys.filter(s => s.id !== latestSurvey.id));
        setAiAnalysis(analysis);
      } catch (err) {
        console.error('Error generating AI analysis:', err);
        // Set a default analysis if generation fails
        setAiAnalysis({
          isValid: true,
          status: 'Unknown',
          doglegs: 'N/A',
          trend: 'N/A',
          recommendation: 'Continue as planned'
        });
      }
    }

    // Calculate projections
    if (surveys.length > 0) {
      try {
        const projection = projectValues(surveys);

        if (projection) {
          setProjections(projection);

          // Update curve data with projections if it exists
          if (curveData && wellInfo) {
            // Create the update payload manually with safe type handling
            // The numeric type in the schema expects a string, not a number
            // Make sure we're not concatenating numbers - convert to strings separately
            const projInc = typeof projection.projectedInc === 'number' ? projection.projectedInc : 0;
            const projAz = typeof projection.projectedAz === 'number' ? projection.projectedAz : 0;

            const curveUpdateData = {
              id: curveData.id,
              projectedInc: String(projInc),
              projectedAz: String(projAz)
            };

            updateCurveData(curveUpdateData);
          }
        }
      } catch (err) {
        console.error('Error calculating projections:', err);
      }
    }
  }, [surveys, latestSurvey]);

  // Listen for WebSocket events
  useEffect(() => {
    // Listen for survey list updates
    witsClient.onSurveys((data) => {
      setSurveys(data);
      if (data.length > 0) {
        setLatestSurvey(data[data.length - 1]);
      }
    });

    // Listen for individual survey updates
    witsClient.onSurveyUpdate((data) => {
      if (data.action === 'created') {
        setSurveys(prev => [...prev, data.data]);
        setLatestSurvey(data.data);
      } else if (data.action === 'updated') {
        setSurveys(prev => 
          prev.map(survey => survey.id === data.data.id ? data.data : survey)
        );
        if (latestSurvey?.id === data.data.id) {
          setLatestSurvey(data.data);
        }
      } else if (data.action === 'deleted') {
        setSurveys(prev => prev.filter(survey => survey.id !== data.data.id));
        if (latestSurvey?.id === data.data.id) {
          const remaining = surveys.filter(survey => survey.id !== data.data.id);
          setLatestSurvey(remaining.length > 0 ? remaining[remaining.length - 1] : null);
        }
      }
    });

    // Listen for curve data updates
    witsClient.onCurveData((data) => {
      setCurveData(data);
    });

    // Listen for gamma data updates
    witsClient.onGammaData((data) => {
      setGammaData(data);

      // Sync with window.gammaData for email service
      window.gammaData = data.map((point: GammaData) => ({
        depth: point.depth,
        value: point.value
      }));
    });

    witsClient.onGammaDataUpdate((data) => {
      setGammaData(prev => {
        const index = prev.findIndex(g => g.id === data.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;

          // Sync with window.gammaData for email service
          window.gammaData = updated.map((point: GammaData) => ({
            depth: point.depth,
            value: point.value
          }));

          return updated;
        } else {
          const newData = [...prev, data];

          // Sync with window.gammaData for email service
          window.gammaData = newData.map((point: GammaData) => ({
            depth: point.depth,
            value: point.value
          }));

          return newData;
        }
      });
    });

    // Listen for survey modal requests
    witsClient.onShowSurveyModal((data) => {
      setModalSurvey(data);
      setShowSurveyModal(true);
    });
  }, [surveys, latestSurvey]);

  const loadSurveys = async (wellId: number) => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', `/api/surveys/${wellId}`, undefined);
      const data = await response.json();
      setSurveys(data);
      if (data.length > 0) {
        setLatestSurvey(data[data.length - 1]);
      }
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError('Failed to load surveys');
      toast({
        title: "Error",
        description: "Failed to load surveys",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCurveData = async (wellId: number) => {
    try {
      const response = await apiRequest('GET', `/api/curve-data/${wellId}`, undefined);
      const data = await response.json();
      setCurveData(data);
    } catch (err) {
      console.error('Error fetching curve data:', err);
    }
  };

  const loadGammaData = async (wellId: number) => {
    try {
      const response = await apiRequest('GET', `/api/gamma-data/${wellId}`, undefined);
      const data = await response.json();
      setGammaData(data);

      // Sync with window.gammaData for email service
      window.gammaData = data.map((point: GammaData) => ({
        depth: point.depth,
        value: point.value
      }));
    } catch (err) {
      console.error('Error fetching gamma data:', err);
    }
  };

  const addSurvey = async (survey: InsertSurvey): Promise<Survey | null> => {
    try {
      setLoading(true);

      const proposedDirection = wellInfo ? Number(wellInfo.proposedDirection || 0) : 0;
      const prevSurvey = surveys.length > 0 ? surveys[surveys.length - 1] : null;
      const processedSurvey = processSurveyData(survey, prevSurvey, proposedDirection);

        // Convert previous survey values
        const prevMd = typeof prevSurvey.md === 'string' ? parseFloat(prevSurvey.md) : Number(prevSurvey.md);
        const prevInc = typeof prevSurvey.inc === 'string' ? parseFloat(prevSurvey.inc) : Number(prevSurvey.inc);
        const prevAzi = typeof prevSurvey.azi === 'string' ? parseFloat(prevSurvey.azi) : Number(prevSurvey.azi);
        const prevTvd = typeof prevSurvey.tvd === 'string' ? parseFloat(prevSurvey.tvd) : Number(prevSurvey.tvd);
        const prevNS = typeof prevSurvey.northSouth === 'string' ? parseFloat(prevSurvey.northSouth) : Number(prevSurvey.northSouth);
        const prevEW = typeof prevSurvey.eastWest === 'string' ? parseFloat(prevSurvey.eastWest) : Number(prevSurvey.eastWest);

        // Calculate all values using imported functions
        const tvd = calculateTVD(md, inc, prevMd, prevTvd);
        const { northSouth, isNorth } = calculateNorthSouth(md, inc, azi, prevMd, prevNS, prevSurvey.isNorth);
        const { eastWest, isEast } = calculateEastWest(md, inc, azi, prevMd, prevEW, prevSurvey.isEast);
        const vs = calculateVS(northSouth, eastWest, proposedDirection);
        const dls = calculateDLS(inc, azi, prevInc, prevAzi, md, prevMd);

        // Add calculated values to processed survey with proper formatting
        processedSurvey.tvd = tvd.toFixed(2);
        processedSurvey.northSouth = northSouth.toFixed(2);
        processedSurvey.isNorth = isNorth;
        processedSurvey.eastWest = eastWest.toFixed(2);
        processedSurvey.isEast = isEast;
        processedSurvey.vs = vs.toFixed(2);
        processedSurvey.dls = dls.toFixed(2);
      } else {
        // For first survey, calculate initial values
        const tvd = md * Math.cos((inc * Math.PI) / 180);
        const ns = md * Math.sin((inc * Math.PI) / 180) * Math.cos((azi * Math.PI) / 180);
        const ew = md * Math.sin((inc * Math.PI) / 180) * Math.sin((azi * Math.PI) / 180);
        const vs = calculateVS(Math.abs(ns), Math.abs(ew), proposedDirection);

        // Add calculated values with proper formatting
        processedSurvey.tvd = tvd.toFixed(2);
        processedSurvey.northSouth = Math.abs(ns).toFixed(2);
        processedSurvey.isNorth = ns >= 0;
        processedSurvey.eastWest = Math.abs(ew).toFixed(2);
        processedSurvey.isEast = ew >= 0;
        processedSurvey.vs = vs.toFixed(2);
        processedSurvey.dls = "0.00";
        processedSurvey.md = md.toString();
        processedSurvey.inc = inc.toString();
        processedSurvey.azi = azi.toString();
      }

      // Process the survey data to ensure correct types for the API
      Object.entries(survey).forEach(([key, value]) => {
        if (key === 'wellId') {
          // Keep wellId as a number
          processedSurvey[key] = typeof value === 'string' ? parseInt(value) : value;
        } else if (key === 'isNorth' || key === 'isEast') {
          // Keep boolean values (if not already set by auto-calculation)
          if (processedSurvey[key] === undefined) {
            processedSurvey[key] = value;
          }
        } else if (typeof value === 'number') {
          // Convert numbers to strings for numeric fields
          processedSurvey[key] = String(value);
        } else {
          // Keep other values as is (if not already set by auto-calculation)
          if (processedSurvey[key] === undefined) {
            processedSurvey[key] = value;
          }
        }
      });

      console.log('Sending survey data:', processedSurvey);
      const response = await apiRequest('POST', '/api/surveys', processedSurvey);
      const newSurvey = await response.json();

      if (response.status === 400) {
        console.error('Error adding survey:', newSurvey);
        toast({
          title: "Validation Error",
          description: "Please check the survey data and try again",
          variant: "destructive"
        });
        return null;
      }

      // Update surveys list with the new survey
      setSurveys(prevSurveys => [...prevSurveys, newSurvey]);

      // Update latest survey
      setLatestSurvey(newSurvey);

      // Set the current survey to the newly added one
      setCurrentSurvey(newSurvey);

      toast({
        title: "Success",
        description: "Survey added successfully",
      });

      return newSurvey;
    } catch (err) {
      console.error('Error adding survey:', err);
      toast({
        title: "Error",
        description: "Failed to add survey",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSurvey = async (id: number, survey: Partial<InsertSurvey>): Promise<Survey | null> => {
    try {
      setLoading(true);

      // Process numeric fields to ensure they're all strings
      const processedSurvey: Record<string, any> = {};

      // Auto-calculate TVD, N/S, E/W, VS, and DLS if the relevant fields (md, inc, azi) are updated
      if (wellInfo && (survey.md !== undefined || survey.inc !== undefined || survey.azi !== undefined)) {
        // Find the current survey being updated
        const currentSurveyData = surveys.find(s => s.id === id);
        if (currentSurveyData) {
          // Find the previous survey, if any
          const currentIndex = surveys.findIndex(s => s.id === id);
          const prevSurvey = currentIndex > 0 ? surveys[currentIndex - 1] : null;

          // Get the proposed direction from well info
          const proposedDirection = Number(wellInfo.proposedDirection || 0);

          // Prepare values from current survey, overridden by any updates
          const md = survey.md !== undefined 
            ? (typeof survey.md === 'string' ? parseFloat(survey.md) : Number(survey.md))
            : (typeof currentSurveyData.md === 'string' ? parseFloat(currentSurveyData.md) : Number(currentSurveyData.md));

          const inc = survey.inc !== undefined
            ? (typeof survey.inc === 'string' ? parseFloat(survey.inc) : Number(survey.inc))
            : (typeof currentSurveyData.inc === 'string' ? parseFloat(currentSurveyData.inc) : Number(currentSurveyData.inc));

          const azi = survey.azi !== undefined
            ? (typeof survey.azi === 'string' ? parseFloat(survey.azi) : Number(survey.azi))
            : (typeof currentSurveyData.azi === 'string' ? parseFloat(currentSurveyData.azi) : Number(currentSurveyData.azi));

          if (prevSurvey) {
            // If there's a previous survey, calculate from there
            const prevMd = typeof prevSurvey.md === 'string' ? parseFloat(prevSurvey.md) : Number(prevSurvey.md);
            const prevInc = typeof prevSurvey.inc === 'string' ? parseFloat(prevSurvey.inc) : Number(prevSurvey.inc);
            const prevAzi = typeof prevSurvey.azi === 'string' ? parseFloat(prevSurvey.azi) : Number(prevSurvey.azi);
            const prevTvd = typeof prevSurvey.tvd === 'string' ? parseFloat(prevSurvey.tvd) : Number(prevSurvey.tvd || 0);
            const prevNS = typeof prevSurvey.northSouth === 'string' ? parseFloat(prevSurvey.northSouth) : Number(prevSurvey.northSouth || 0);
            const prevEW = typeof prevSurvey.eastWest === 'string' ? parseFloat(prevSurvey.eastWest) : Number(prevSurvey.eastWest || 0);
            const prevIsNorth = Boolean(prevSurvey.isNorth);
            const prevIsEast = Boolean(prevSurvey.isEast);

            // Calculate all values with proper type handling
            const tvd = calculateTVD(md, inc, prevMd, prevTvd);
            const { northSouth, isNorth } = calculateNorthSouth(md, inc, azi, prevMd, prevNS, prevIsNorth);
            const { eastWest, isEast } = calculateEastWest(md, inc, azi, prevMd, prevEW, prevIsEast);
            const vs = calculateVS(northSouth, eastWest, proposedDirection);
            const dls = calculateDLS(inc, azi, prevInc, prevAzi, md, prevMd);

            // Add calculated values to survey with proper formatting
            processedSurvey.tvd = tvd.toFixed(2);
            processedSurvey.northSouth = northSouth.toFixed(2);
            processedSurvey.isNorth = isNorth;
            processedSurvey.eastWest = eastWest.toFixed(2);
            processedSurvey.isEast = isEast;
            processedSurvey.vs = vs.toFixed(2);
            processedSurvey.dls = dls.toFixed(2);
          } else {
            // For the first survey, set some initial values
            const md = typeof survey.md === 'string' ? parseFloat(survey.md) : Number(survey.md || 0);
            const inc = typeof survey.inc === 'string' ? parseFloat(survey.inc) : Number(survey.inc || 0);
            const azi = typeof survey.azi === 'string' ? parseFloat(survey.azi) : Number(survey.azi || 0);

            // Calculate TVD for first survey
            const tvd = md * Math.cos(inc * Math.PI / 180);

            // Use wellInfo's proposed direction for VS calculation if available
            const proposedDirection = wellInfo?.proposedDirection ? Number(wellInfo.proposedDirection) : 0;

            // Calculate VS using 0 for N/S and E/W since it's first survey
            const vs = calculateVS(0, 0, proposedDirection);

            // Initial values for other fields with proper string conversion
            processedSurvey.tvd = tvd.toFixed(2);
            processedSurvey.northSouth = "0.00";
            processedSurvey.isNorth = true;
            processedSurvey.eastWest = "0.00";
            processedSurvey.isEast = true;
            processedSurvey.vs = vs.toFixed(2);
            processedSurvey.dls = "0.00";
          }
        }
      }

      // Process the survey data to ensure correct types for the API
      Object.entries(survey).forEach(([key, value]) => {
        if (key === 'wellId') {
          // Keep wellId as a number
          processedSurvey[key] = typeof value === 'string' ? parseInt(value) : value;
        } else if (key === 'isNorth' || key === 'isEast') {
          // Keep boolean values (if not already set by auto-calculation)
          if (processedSurvey[key] === undefined) {
            processedSurvey[key] = value;
          }
        } else if (typeof value === 'number') {
          // Convert numbers to strings for numeric fields
          processedSurvey[key] = String(value);
        } else {
          // Keep other values as is (if not already set by auto-calculation)
          if (processedSurvey[key] === undefined) {
            processedSurvey[key] = value;
          }
        }
      });

      console.log('Sending update survey data:', processedSurvey);
      const response = await apiRequest('PATCH', `/api/surveys/${id}`, processedSurvey);
      const updatedSurvey = await response.json();

      if (response.status === 400) {
        console.error('Error updating survey:', updatedSurvey);
        toast({
          title: "Validation Error",
          description: "Please check the survey data and try again",
          variant: "destructive"
        });
        return null;
      }

      // Update surveys list with the updated survey
      setSurveys(prevSurveys => prevSurveys.map(s => 
        s.id === id ? updatedSurvey : s
      ));

      // Update current survey if it's the one being edited
      if (currentSurvey && currentSurvey.id === id) {
        setCurrentSurvey(updatedSurvey);
      }

      // Update latest survey if it's the one being edited
      if (latestSurvey && latestSurvey.id === id) {
        setLatestSurvey(updatedSurvey);
      }

      toast({
        title: "Success",
        description: "Survey updated successfully",
      });

      return updatedSurvey;
    } catch (err) {
      console.error('Error updating survey:', err);
      toast({
        title: "Error",
        description: "Failed to update survey",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSurvey = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await apiRequest('DELETE', `/api/surveys/${id}`, undefined);

      // Remove survey from surveys list
      setSurveys(prevSurveys => prevSurveys.filter(s => s.id !== id));

      // If current survey is the one being deleted, set it to null
      if (currentSurvey && currentSurvey.id === id) {
        setCurrentSurvey(null);
      }

      toast({
        title: "Success",
        description: "Survey deleted successfully",
      });

      return true;
    } catch (err) {
      console.error('Error deleting survey:', err);
      toast({
        title: "Error",
        description: "Failed to delete survey",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCurveData = async (data: Partial<CurveData>): Promise<CurveData | null> => {
    try {
      const id = data.id || (curveData?.id || 0);

      // Convert numeric values to strings to match the schema validation
      const processedData: Record<string, any> = {};

      // Process the data to ensure correct types for the API
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'id' || key === 'wellId') {
          // Keep IDs as numbers
          processedData[key] = typeof value === 'string' ? parseInt(value) : value;
        } else if (key === 'includeInEmail') {
          // Keep boolean values
          processedData[key] = value;
        } else if (typeof value === 'number') {
          // Convert numbers to strings for numeric fields
          processedData[key] = String(value);
        } else {
          // Keep other values as is
          processedData[key] = value;
        }
      });

      console.log('Sending PATCH data:', processedData);
      const response = await apiRequest('PATCH', `/api/curve-data/${id}`, processedData);
      const updatedCurve = await response.json();
      setCurveData(updatedCurve);
      return updatedCurve;
    } catch (err) {
      console.error('Error updating curve data:', err);
      toast({
        title: "Error",
        description: "Failed to update curve data",
        variant: "destructive"
      });
      return null;
    }
  };

  return (
    <SurveyContext.Provider value={{
      surveys,
      latestSurvey,
      currentSurvey,
      setCurrentSurvey,
      curveData,
      gammaData,
      loading,
      error,
      showSurveyModal,
      setShowSurveyModal,
      modalSurvey,
      setModalSurvey,
      addSurvey,
      updateSurvey,
      deleteSurvey,
      updateCurveData,
      aiAnalysis,
      projections
    }}>
      {children}
    </SurveyContext.Provider>
  );
};