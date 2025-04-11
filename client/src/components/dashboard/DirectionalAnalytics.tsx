import React from 'react';
import { Card } from '@/components/ui/card';
import { useSurveyContext } from '@/context/SurveyContext';
import { useWellContext } from '@/context/WellContext';
import { Brain, TrendingUp, AlertTriangle, BatteryCharging } from 'lucide-react';

export default function DirectionalAnalytics() {
  const { surveys, latestSurvey, curveData } = useSurveyContext();
  const { wellInfo } = useWellContext();

  // Helper functions to analyze drilling performance
  const analyzeBuildRate = () => {
    if (!surveys || surveys.length < 3) return { rate: 0, performance: 'insufficient data' };
    
    // Sort by measured depth 
    const sortedSurveys = [...surveys].sort((a, b) => {
      const mdA = typeof a.md === 'string' ? parseFloat(a.md) : Number(a.md || 0);
      const mdB = typeof b.md === 'string' ? parseFloat(b.md) : Number(b.md || 0);
      return mdB - mdA; // Newest first
    });
    
    // Get the last 3 surveys
    const recentSurveys = sortedSurveys.slice(0, 3);
    
    // Calculate build rate over the last 3 surveys
    const incChanges: number[] = [];
    
    for (let i = 0; i < recentSurveys.length - 1; i++) {
      const currentInc = typeof recentSurveys[i].inc === 'string' 
        ? parseFloat(recentSurveys[i].inc) 
        : Number(recentSurveys[i].inc || 0);
      
      const prevInc = typeof recentSurveys[i+1].inc === 'string' 
        ? parseFloat(recentSurveys[i+1].inc) 
        : Number(recentSurveys[i+1].inc || 0);
      
      const currentMD = typeof recentSurveys[i].md === 'string' 
        ? parseFloat(recentSurveys[i].md) 
        : Number(recentSurveys[i].md || 0);
      
      const prevMD = typeof recentSurveys[i+1].md === 'string' 
        ? parseFloat(recentSurveys[i+1].md) 
        : Number(recentSurveys[i+1].md || 0);
      
      // Calculate change in inclination per 100ft
      const mdDiff = currentMD - prevMD;
      if (mdDiff > 0) {
        const rate = ((currentInc - prevInc) / mdDiff) * 100;
        incChanges.push(rate);
      }
    }
    
    // Calculate average build rate
    const avgBuildRate = incChanges.length > 0 
      ? incChanges.reduce((sum, rate) => sum + rate, 0) / incChanges.length 
      : 0;
    
    // Evaluate performance
    let performance = 'neutral';
    
    if (Math.abs(avgBuildRate) < 0.2) {
      performance = 'stable';
    } else if (avgBuildRate > 2.0) {
      performance = 'building fast';
    } else if (avgBuildRate > 1.0) {
      performance = 'building';
    } else if (avgBuildRate < -1.0) {
      performance = 'dropping';
    }
    
    return { 
      rate: avgBuildRate,
      performance 
    };
  };

  const analyzeAzimuthControl = () => {
    if (!surveys || surveys.length < 3) return { stability: 0, performance: 'insufficient data' };
    
    // Sort by measured depth
    const sortedSurveys = [...surveys].sort((a, b) => {
      const mdA = typeof a.md === 'string' ? parseFloat(a.md) : Number(a.md || 0);
      const mdB = typeof b.md === 'string' ? parseFloat(b.md) : Number(b.md || 0);
      return mdB - mdA; // Newest first
    });
    
    // Get the last 5 surveys or all if less than 5
    const recentSurveys = sortedSurveys.slice(0, Math.min(5, sortedSurveys.length));
    
    // Calculate azimuth changes
    const aziDeviations: number[] = [];
    
    for (let i = 0; i < recentSurveys.length - 1; i++) {
      const currentAzi = typeof recentSurveys[i].azi === 'string' 
        ? parseFloat(recentSurveys[i].azi) 
        : Number(recentSurveys[i].azi || 0);
      
      const prevAzi = typeof recentSurveys[i+1].azi === 'string' 
        ? parseFloat(recentSurveys[i+1].azi) 
        : Number(recentSurveys[i+1].azi || 0);
      
      // Calculate absolute change in azimuth, handling angle wrapping
      let aziDiff = Math.abs(currentAzi - prevAzi);
      if (aziDiff > 180) aziDiff = 360 - aziDiff;
      
      aziDeviations.push(aziDiff);
    }
    
    // Calculate average azimuth stability (lower is better)
    const avgAziDeviation = aziDeviations.length > 0 
      ? aziDeviations.reduce((sum, dev) => sum + dev, 0) / aziDeviations.length 
      : 0;
    
    // Evaluate performance
    let performance = 'neutral';
    
    if (avgAziDeviation < 1.0) {
      performance = 'excellent';
    } else if (avgAziDeviation < 2.5) {
      performance = 'good';
    } else if (avgAziDeviation < 5.0) {
      performance = 'fair';
    } else {
      performance = 'poor';
    }
    
    // Invert for stability score (100 = perfect stability)
    const stabilityScore = Math.max(0, 100 - (avgAziDeviation * 10));
    
    return { 
      stability: stabilityScore,
      performance 
    };
  };

  const analyzeDoglegSeverity = () => {
    if (!surveys || surveys.length < 2) return { value: 0, risk: 'insufficient data' };
    
    // Sort by measured depth
    const sortedSurveys = [...surveys].sort((a, b) => {
      const mdA = typeof a.md === 'string' ? parseFloat(a.md) : Number(a.md || 0);
      const mdB = typeof b.md === 'string' ? parseFloat(b.md) : Number(b.md || 0);
      return mdB - mdA; // Newest first
    });
    
    if (sortedSurveys.length < 2) return { value: 0, risk: 'insufficient data' };
    
    // Get the latest survey and the one before
    const latest = sortedSurveys[0];
    const previous = sortedSurveys[1];
    
    // Extract values
    const latestInc = typeof latest.inc === 'string' ? parseFloat(latest.inc) : Number(latest.inc || 0);
    const prevInc = typeof previous.inc === 'string' ? parseFloat(previous.inc) : Number(previous.inc || 0);
    const latestAzi = typeof latest.azi === 'string' ? parseFloat(latest.azi) : Number(latest.azi || 0);
    const prevAzi = typeof previous.azi === 'string' ? parseFloat(previous.azi) : Number(previous.azi || 0);
    const latestMD = typeof latest.md === 'string' ? parseFloat(latest.md) : Number(latest.md || 0);
    const prevMD = typeof previous.md === 'string' ? parseFloat(previous.md) : Number(previous.md || 0);
    
    // Calculate dogleg severity per 100ft
    const mdDiff = latestMD - prevMD;
    
    if (mdDiff <= 0) return { value: 0, risk: 'insufficient data' };
    
    // Calculate azimuth difference handling angle wrapping
    let aziDiff = Math.abs(latestAzi - prevAzi);
    if (aziDiff > 180) aziDiff = 360 - aziDiff;
    
    // Formula for dogleg severity
    const incRad1 = prevInc * Math.PI / 180;
    const incRad2 = latestInc * Math.PI / 180;
    const aziRad = aziDiff * Math.PI / 180;
    
    // Calculate using cosine formula
    const cosAngle = Math.cos(incRad2) * Math.cos(incRad1) + 
                     Math.sin(incRad2) * Math.sin(incRad1) * Math.cos(aziRad);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    
    // Convert to degrees and normalize to 100ft
    const doglegSeverity = (angle * 180 / Math.PI) * (100 / mdDiff);
    
    // Evaluate risk
    let risk = 'low';
    if (doglegSeverity > 8) {
      risk = 'extreme';
    } else if (doglegSeverity > 6) {
      risk = 'high';
    } else if (doglegSeverity > 4) {
      risk = 'moderate';
    } else if (doglegSeverity > 2) {
      risk = 'low';
    } else {
      risk = 'minimal';
    }
    
    return { 
      value: doglegSeverity,
      risk 
    };
  };

  const analyzeSlideEfficiency = () => {
    if (!curveData || !curveData.motorYield) {
      return { efficiency: 0, performance: 'insufficient data' };
    }
    
    // Need at least 2 surveys to calculate slide efficiency
    if (!surveys || surveys.length < 2) {
      return { efficiency: 0, performance: 'insufficient data' };
    }
    
    // Sort by measured depth
    const sortedSurveys = [...surveys].sort((a, b) => {
      const mdA = typeof a.md === 'string' ? parseFloat(a.md) : Number(a.md || 0);
      const mdB = typeof b.md === 'string' ? parseFloat(b.md) : Number(b.md || 0);
      return mdB - mdA; // Newest first
    });
    
    // Get the most recent surveys where sliding was conducted
    const latestSurveys = sortedSurveys.slice(0, 3); // Take last 3 surveys
    
    // Calculate actual build rate vs theoretical motor yield
    const incChanges: number[] = [];
    const theoreticalChanges: number[] = [];
    
    for (let i = 0; i < latestSurveys.length - 1; i++) {
      const slideDistance = typeof latestSurveys[i].slideFootage === 'string' 
        ? parseFloat(latestSurveys[i].slideFootage) 
        : Number(latestSurveys[i].slideFootage || 0);
      
      // Only consider surveys with slide footage
      if (slideDistance > 0) {
        const currentInc = typeof latestSurveys[i].inc === 'string' 
          ? parseFloat(latestSurveys[i].inc) 
          : Number(latestSurveys[i].inc || 0);
        
        const prevInc = typeof latestSurveys[i+1].inc === 'string' 
          ? parseFloat(latestSurveys[i+1].inc) 
          : Number(latestSurveys[i+1].inc || 0);
        
        const mdDiff = (typeof latestSurveys[i].md === 'string' 
          ? parseFloat(latestSurveys[i].md) 
          : Number(latestSurveys[i].md || 0)) - 
          (typeof latestSurveys[i+1].md === 'string' 
            ? parseFloat(latestSurveys[i+1].md) 
            : Number(latestSurveys[i+1].md || 0));
        
        if (mdDiff > 0) {
          // Actual build rate in the interval
          const actualBuildRate = (currentInc - prevInc) / mdDiff * 100;
          
          // Theoretical build rate based on motor yield and slide percentage
          const slidePercentage = slideDistance / mdDiff;
          const motorYield = typeof curveData.motorYield === 'string' 
            ? parseFloat(curveData.motorYield) 
            : Number(curveData.motorYield || 0);
          const theoreticalBuildRate = motorYield * slidePercentage;
          
          incChanges.push(actualBuildRate);
          theoreticalChanges.push(theoreticalBuildRate);
        }
      }
    }
    
    // Calculate slide efficiency
    if (incChanges.length === 0 || theoreticalChanges.length === 0) {
      return { efficiency: 0, performance: 'insufficient data' };
    }
    
    const avgActualChange = incChanges.reduce((sum, val) => sum + val, 0) / incChanges.length;
    const avgTheoreticalChange = theoreticalChanges.reduce((sum, val) => sum + val, 0) / theoreticalChanges.length;
    
    // Efficiency as a percentage (capped at 100%)
    const efficiency = Math.min(100, Math.max(0, (avgActualChange / avgTheoreticalChange) * 100));
    
    // Evaluate performance
    let performance = 'neutral';
    
    if (efficiency > 90) {
      performance = 'excellent';
    } else if (efficiency > 75) {
      performance = 'good';
    } else if (efficiency > 60) {
      performance = 'fair';
    } else if (efficiency > 40) {
      performance = 'poor';
    } else {
      performance = 'very poor';
    }
    
    return { 
      efficiency,
      performance 
    };
  };

  // Calculate analytics
  const buildRateAnalysis = analyzeBuildRate();
  const azimuthAnalysis = analyzeAzimuthControl();
  const doglegAnalysis = analyzeDoglegSeverity();
  const slideEfficiencyAnalysis = analyzeSlideEfficiency();

  // Helper function to determine color based on score
  const getStatusColor = (value: number, type: 'buildRate' | 'azimuth' | 'dogleg' | 'slideEff') => {
    switch (type) {
      case 'buildRate':
        return Math.abs(value) < 1 ? 'text-green-400' : Math.abs(value) < 2 ? 'text-amber-400' : 'text-rose-400';
      case 'azimuth':
        return value > 80 ? 'text-green-400' : value > 60 ? 'text-amber-400' : 'text-rose-400';
      case 'dogleg':
        return value < 3 ? 'text-green-400' : value < 6 ? 'text-amber-400' : 'text-rose-400';
      case 'slideEff':
        return value > 75 ? 'text-green-400' : value > 50 ? 'text-amber-400' : 'text-rose-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 flex justify-between items-center border-b border-gray-700/30">
        <h2 className="font-heading text-lg font-semibold flex items-center text-white">
          <Brain className="h-5 w-5 mr-2 text-purple-400" />
          AI Directional Analytics
        </h2>
      </div>
      <div className="p-4 glass-panel border border-gray-700/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Build Rate Analysis */}
          <div className="glass-panel p-3 rounded border border-gray-700/30">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-cyan-400 mr-1.5" />
                <span className="text-xs text-gray-300 font-semibold">BUILD RATE TREND</span>
              </div>
              <div className={`text-xs font-mono ${getStatusColor(Math.abs(buildRateAnalysis.rate), 'buildRate')}`}>
                {buildRateAnalysis.performance !== 'insufficient data' && buildRateAnalysis.performance.toUpperCase()}
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-2xl font-mono ${getStatusColor(Math.abs(buildRateAnalysis.rate), 'buildRate')}`}>
                {buildRateAnalysis.performance !== 'insufficient data' 
                  ? buildRateAnalysis.rate.toFixed(2) 
                  : '–'}<span className="text-xs text-gray-400 ml-1">°/100ft</span>
              </div>
              <div className="text-xs text-gray-400">
                {buildRateAnalysis.performance === 'insufficient data' 
                  ? 'Insufficient surveys to analyze build rate trend'
                  : buildRateAnalysis.rate > 0 
                    ? 'Wellbore is building inclination'
                    : buildRateAnalysis.rate < 0 
                      ? 'Wellbore is dropping inclination'
                      : 'Wellbore inclination is stable'}
              </div>
            </div>
          </div>
          
          {/* Azimuth Control */}
          <div className="glass-panel p-3 rounded border border-gray-700/30">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Compass className="h-4 w-4 text-purple-400 mr-1.5" />
                <span className="text-xs text-gray-300 font-semibold">AZIMUTH STABILITY</span>
              </div>
              <div className={`text-xs font-mono ${getStatusColor(azimuthAnalysis.stability, 'azimuth')}`}>
                {azimuthAnalysis.performance !== 'insufficient data' && azimuthAnalysis.performance.toUpperCase()}
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-2xl font-mono ${getStatusColor(azimuthAnalysis.stability, 'azimuth')}`}>
                {azimuthAnalysis.performance !== 'insufficient data' 
                  ? azimuthAnalysis.stability.toFixed(0) 
                  : '–'}<span className="text-xs text-gray-400 ml-1">%</span>
              </div>
              <div className="text-xs text-gray-400">
                {azimuthAnalysis.performance === 'insufficient data' 
                  ? 'Insufficient surveys to analyze azimuth stability'
                  : azimuthAnalysis.stability > 80 
                    ? 'Excellent directional control - very stable azimuth'
                    : azimuthAnalysis.stability > 60 
                      ? 'Good directional control with minor azimuth variations'
                      : 'Azimuth showing significant variations - check BHA'}
              </div>
            </div>
          </div>
          
          {/* Dogleg Severity */}
          <div className="glass-panel p-3 rounded border border-gray-700/30">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-400 mr-1.5" />
                <span className="text-xs text-gray-300 font-semibold">DOGLEG SEVERITY</span>
              </div>
              <div className={`text-xs font-mono ${getStatusColor(doglegAnalysis.value, 'dogleg')}`}>
                {doglegAnalysis.risk !== 'insufficient data' && doglegAnalysis.risk.toUpperCase()}
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-2xl font-mono ${getStatusColor(doglegAnalysis.value, 'dogleg')}`}>
                {doglegAnalysis.risk !== 'insufficient data' 
                  ? doglegAnalysis.value.toFixed(2) 
                  : '–'}<span className="text-xs text-gray-400 ml-1">°/100ft</span>
              </div>
              <div className="text-xs text-gray-400">
                {doglegAnalysis.risk === 'insufficient data' 
                  ? 'Insufficient surveys to analyze dogleg severity'
                  : doglegAnalysis.value > 6 
                    ? 'High dogleg severity - risk of tool damage or stuck pipe'
                    : doglegAnalysis.value > 3 
                      ? 'Moderate dogleg severity - monitor closely'
                      : 'Low dogleg severity - acceptable for drilling operations'}
              </div>
            </div>
          </div>
          
          {/* Slide Efficiency */}
          <div className="glass-panel p-3 rounded border border-gray-700/30">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <BatteryCharging className="h-4 w-4 text-emerald-400 mr-1.5" />
                <span className="text-xs text-gray-300 font-semibold">SLIDE EFFICIENCY</span>
              </div>
              <div className={`text-xs font-mono ${getStatusColor(slideEfficiencyAnalysis.efficiency, 'slideEff')}`}>
                {slideEfficiencyAnalysis.performance !== 'insufficient data' && slideEfficiencyAnalysis.performance.toUpperCase()}
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-2xl font-mono ${getStatusColor(slideEfficiencyAnalysis.efficiency, 'slideEff')}`}>
                {slideEfficiencyAnalysis.performance !== 'insufficient data' 
                  ? slideEfficiencyAnalysis.efficiency.toFixed(0) 
                  : '–'}<span className="text-xs text-gray-400 ml-1">%</span>
              </div>
              <div className="text-xs text-gray-400">
                {slideEfficiencyAnalysis.performance === 'insufficient data' 
                  ? 'Insufficient slide data to analyze efficiency'
                  : slideEfficiencyAnalysis.efficiency > 75 
                    ? 'Excellent slide efficiency - optimal weight transfer'
                    : slideEfficiencyAnalysis.efficiency > 50 
                      ? 'Acceptable slide efficiency - normal friction factors'
                      : 'Poor slide efficiency - check for excessive drag or tortuosity'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Overall AI Recommendations */}
        <div className="mt-4 p-3 glass-panel rounded border border-gray-700/30 bg-purple-900/10">
          <div className="flex items-center mb-2">
            <div className="h-5 w-5 rounded-full bg-purple-900/40 flex items-center justify-center mr-2">
              <Brain className="h-3 w-3 text-purple-300" />
            </div>
            <span className="text-sm font-medium text-purple-300">AI DIRECTIONAL RECOMMENDATION</span>
          </div>
          <div className="text-sm text-gray-300">
            {buildRateAnalysis.performance === 'insufficient data' || azimuthAnalysis.performance === 'insufficient data' ? (
              "Add more survey points to receive AI-powered directional drilling recommendations."
            ) : (
              <>
                {azimuthAnalysis.stability < 70 && "Improve azimuth control. "} 
                {doglegAnalysis.value > 5 && "Reduce dogleg severity. "}
                {slideEfficiencyAnalysis.efficiency < 60 && "Optimize slide technique for better efficiency. "}
                {buildRateAnalysis.rate > 2 && "Current build rate is aggressive - consider more rotary drilling. "}
                {buildRateAnalysis.rate < -1 && "Wellbore is dropping inclination - adjust parameters to maintain angle. "}
                {azimuthAnalysis.stability > 80 && doglegAnalysis.value < 3 && slideEfficiencyAnalysis.efficiency > 70 && 
                  "Excellent directional control. Continue with current parameters."}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}