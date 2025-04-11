import React, { useState, useEffect } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { useWellContext } from '@/context/WellContext';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  BarChart4,
  Compass,
  Target,
  Ruler,
  Route
} from 'lucide-react';

const DirectionalAnalytics = () => {
  const { surveys, latestSurvey, projections } = useSurveyContext();
  const { wellInfo } = useWellContext();
  
  const [buildStats, setBuildStats] = useState({
    avgBuildRate: 0,
    avgTurnRate: 0,
    maxDLS: 0,
    avgDLS: 0,
    dlsViolations: 0,
    dolHigh: 0,
    dolLow: 0,
    tortuosity: 0,
  });
  
  const [targetStats, setTargetStats] = useState({
    remainingDist: 0,
    estimatedStays: 0,
    targetTVD: 0,
    remainingShift: 0,
    onTargetScore: 0
  });
  
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [drillOpportunities, setDrillOpportunities] = useState<string[]>([]);
  
  // Calculate directional drilling statistics
  useEffect(() => {
    if (!surveys || surveys.length < 2 || !wellInfo) return;
    
    // Sort surveys by MD
    const sortedSurveys = [...surveys].sort((a, b) => {
      const mdA = typeof a.md === 'string' ? parseFloat(a.md) : Number(a.md);
      const mdB = typeof b.md === 'string' ? parseFloat(b.md) : Number(b.md);
      return mdA - mdB;
    });
    
    // Calculate build and turn rates between surveys
    let totalBuildRate = 0;
    let totalTurnRate = 0;
    let totalDLS = 0;
    let maxDLS = 0;
    let dlsViolations = 0;
    let totalTortuosity = 0;
    
    for (let i = 1; i < sortedSurveys.length; i++) {
      const prevSurvey = sortedSurveys[i-1];
      const survey = sortedSurveys[i];
      
      const md1 = typeof prevSurvey.md === 'string' ? parseFloat(prevSurvey.md) : Number(prevSurvey.md);
      const md2 = typeof survey.md === 'string' ? parseFloat(survey.md) : Number(survey.md);
      const inc1 = typeof prevSurvey.inc === 'string' ? parseFloat(prevSurvey.inc) : Number(prevSurvey.inc);
      const inc2 = typeof survey.inc === 'string' ? parseFloat(survey.inc) : Number(survey.inc);
      const azi1 = typeof prevSurvey.azi === 'string' ? parseFloat(prevSurvey.azi) : Number(prevSurvey.azi);
      const azi2 = typeof survey.azi === 'string' ? parseFloat(survey.azi) : Number(survey.azi);
      const dls = typeof survey.dls === 'string' ? parseFloat(survey.dls) : Number(survey.dls);
      
      const distance = md2 - md1;
      if (distance <= 0) continue;
      
      // Build rate in degrees per 100ft
      const buildRate = ((inc2 - inc1) / distance) * 100;
      totalBuildRate += buildRate;
      
      // Turn rate (azimuth change) in degrees per 100ft
      // Handle azimuth wrap-around (0/360 degrees)
      let aziChange = azi2 - azi1;
      if (aziChange > 180) aziChange -= 360;
      if (aziChange < -180) aziChange += 360;
      const turnRate = (Math.abs(aziChange) / distance) * 100;
      totalTurnRate += turnRate;
      
      // Track DLS statistics
      totalDLS += dls;
      maxDLS = Math.max(maxDLS, dls);
      if (dls > 3) dlsViolations++;
      
      // Tortuosity - a measure of how much the well deviates from a smooth path
      // Calculate as the ratio of actual path to straight-line distance
      totalTortuosity += dls * distance / 100;
    }
    
    const avgBuildRate = totalBuildRate / (sortedSurveys.length - 1);
    const avgTurnRate = totalTurnRate / (sortedSurveys.length - 1);
    const avgDLS = totalDLS / (sortedSurveys.length - 1);
    
    // Depth of Investigation (DOI) - how far ahead we can predict with reasonable accuracy
    // Higher DLS means lower DOI
    const dolHigh = avgDLS > 2 ? 100 : (avgDLS > 1 ? 150 : 200);
    const dolLow = avgDLS > 2 ? 50 : (avgDLS > 1 ? 100 : 150);
    
    // Estimate target and distance info
    let targetTVD = 0;
    let remainingDist = 0;
    
    if (wellInfo.targetDepth) {
      targetTVD = Number(wellInfo.targetDepth);
      if (latestSurvey && latestSurvey.tvd) {
        const latestTVD = typeof latestSurvey.tvd === 'string' ? parseFloat(latestSurvey.tvd) : Number(latestSurvey.tvd);
        remainingDist = targetTVD - latestTVD;
      }
    }
    
    // Estimate slides needed based on build rate and remaining distance
    let estimatedStays = 0;
    
    if (projections && projections.buildRate && remainingDist > 0) {
      // If we need to make significant build rate changes
      const avgSlideDist = 30; // 30ft average slide
      estimatedStays = Math.ceil(remainingDist / 100);
    }
    
    // Estimated position shift needed to reach target
    let remainingShift = 0;
    if (latestSurvey && (latestSurvey.vs || latestSurvey.vs === 0)) {
      const targetVS = Number(wellInfo.proposedVerticalSection || 0);
      const currentVS = typeof latestSurvey.vs === 'string' ? parseFloat(latestSurvey.vs) : Number(latestSurvey.vs);
      remainingShift = Math.abs(targetVS - currentVS);
    }
    
    // Calculate on-target score (0-100)
    let onTargetScore = 100;
    
    // Reduce score based on DLS violations
    onTargetScore -= dlsViolations * 10;
    
    // Reduce score based on remaining shift (higher shift = lower score)
    if (remainingShift > 50) onTargetScore -= 30;
    else if (remainingShift > 20) onTargetScore -= 15;
    else if (remainingShift > 10) onTargetScore -= 5;
    
    // Reduce score based on high DOL (less predictability)
    if (avgDLS > 2.5) onTargetScore -= 15;
    
    // Ensure score is between 0-100
    onTargetScore = Math.max(0, Math.min(100, onTargetScore));
    
    // Update state
    setBuildStats({
      avgBuildRate,
      avgTurnRate,
      maxDLS,
      avgDLS,
      dlsViolations,
      dolHigh,
      dolLow,
      tortuosity: totalTortuosity
    });
    
    setTargetStats({
      remainingDist,
      estimatedStays,
      targetTVD,
      remainingShift,
      onTargetScore
    });
    
    // Identify risk factors
    const risks: string[] = [];
    if (avgDLS > 3) risks.push("High dogleg severity increases mechanical risk");
    if (dlsViolations > 1) risks.push("Multiple dogleg violations may cause tool failure");
    if (totalTortuosity > 15) risks.push("High tortuosity increases drag and limits hole cleaning");
    if (avgTurnRate > 2) risks.push("High turn rate may lead to azimuth control issues");
    if (remainingShift > 30 && remainingDist < 200) risks.push("Significant course correction needed in limited distance");
    
    setRiskFactors(risks);
    
    // Identify opportunities
    const opportunities: string[] = [];
    if (avgDLS < 1.5) opportunities.push("Low DLS provides opportunity for faster drilling rates");
    if (dlsViolations === 0) opportunities.push("Wellbore quality suitable for optimal tool performance");
    if (remainingShift < 10) opportunities.push("Well on target, potential to reduce survey frequency");
    if (avgBuildRate < 1 && avgBuildRate > -1) opportunities.push("Stable inclination trend minimizes directional adjustments");
    
    setDrillOpportunities(opportunities);
    
  }, [surveys, wellInfo, latestSurvey, projections]);
  
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400";
    if (score >= 70) return "text-lime-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-emerald-400";
    if (score >= 70) return "bg-lime-400";
    if (score >= 50) return "bg-amber-400";
    return "bg-rose-400";
  };
  
  return (
    <div className="premium-card overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 flex justify-between items-center border-b border-gray-700/30">
        <h2 className="font-heading text-lg font-semibold flex items-center text-white">
          <Brain className="h-5 w-5 mr-2 text-purple-400" />
          AI Directional Insights
        </h2>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-purple-400 pulse-effect mr-1"></div>
          <span className="text-xs text-gray-300 font-mono">ACTIVE ANALYSIS</span>
        </div>
      </div>
      
      <div className="p-4 space-y-5">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Build Statistics */}
          <div className="glass-panel p-3 rounded border border-gray-700/30">
            <div className="flex items-center mb-2 pb-2 border-b border-gray-700/20">
              <div className="h-7 w-7 flex items-center justify-center bg-purple-900/30 rounded-full text-purple-400 mr-2">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium text-gray-200">Build Statistics</h3>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Avg. Build Rate:</span>
                <span className="font-mono text-purple-400">{buildStats.avgBuildRate.toFixed(2)}°/100ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg. Turn Rate:</span>
                <span className="font-mono text-blue-400">{buildStats.avgTurnRate.toFixed(2)}°/100ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max DLS:</span>
                <span className="font-mono text-cyan-400">{buildStats.maxDLS.toFixed(2)}°/100ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">DLS Violations:</span>
                <span className={`font-mono ${buildStats.dlsViolations > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {buildStats.dlsViolations}
                </span>
              </div>
            </div>
          </div>
          
          {/* Target Projection */}
          <div className="glass-panel p-3 rounded border border-gray-700/30">
            <div className="flex items-center mb-2 pb-2 border-b border-gray-700/20">
              <div className="h-7 w-7 flex items-center justify-center bg-blue-900/30 rounded-full text-blue-400 mr-2">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium text-gray-200">Target Projection</h3>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Remaining Depth:</span>
                <span className="font-mono text-cyan-400">{targetStats.remainingDist.toFixed(2)} ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Slides:</span>
                <span className="font-mono text-emerald-400">{targetStats.estimatedStays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Position Shift Needed:</span>
                <span className={`font-mono ${targetStats.remainingShift > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {targetStats.remainingShift.toFixed(2)} ft
                </span>
              </div>
            </div>
          </div>
          
          {/* On-Target Score */}
          <div className="glass-panel p-3 rounded border border-gray-700/30">
            <div className="flex items-center mb-2 pb-2 border-b border-gray-700/20">
              <div className="h-7 w-7 flex items-center justify-center bg-cyan-900/30 rounded-full text-cyan-400 mr-2">
                <BarChart4 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium text-gray-200">On-Target Score</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center h-24">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 transform -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={getScoreColor(targetStats.onTargetScore).replace('text-', 'var(--')}
                    strokeWidth="2"
                    strokeDasharray={`${targetStats.onTargetScore}, 100`}
                    strokeLinecap="round"
                    className={getScoreColor(targetStats.onTargetScore)}
                    style={{ opacity: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={`text-2xl font-bold ${getScoreColor(targetStats.onTargetScore)}`}>
                    {targetStats.onTargetScore}
                  </span>
                  <span className="text-[10px] text-gray-400">TARGET SCORE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Risk Factors & Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Risk Factors */}
          <div className="glass-panel p-3 rounded border border-rose-700/20 bg-rose-900/5">
            <div className="flex items-center mb-2 pb-2 border-b border-rose-700/20">
              <div className="h-7 w-7 flex items-center justify-center bg-rose-900/30 rounded-full text-rose-400 mr-2">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium text-gray-200">Risk Factors</h3>
            </div>
            
            <div className="space-y-2">
              {riskFactors.length > 0 ? (
                <ul className="space-y-1">
                  {riskFactors.map((risk, index) => (
                    <li key={index} className="text-xs text-gray-300 flex">
                      <AlertCircle className="h-3 w-3 text-rose-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-emerald-400 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  <span>No significant risk factors identified</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Opportunities */}
          <div className="glass-panel p-3 rounded border border-emerald-700/20 bg-emerald-900/5">
            <div className="flex items-center mb-2 pb-2 border-b border-emerald-700/20">
              <div className="h-7 w-7 flex items-center justify-center bg-emerald-900/30 rounded-full text-emerald-400 mr-2">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium text-gray-200">Opportunities</h3>
            </div>
            
            <div className="space-y-2">
              {drillOpportunities.length > 0 ? (
                <ul className="space-y-1">
                  {drillOpportunities.map((opportunity, index) => (
                    <li key={index} className="text-xs text-gray-300 flex">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-amber-400 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>No specific opportunities identified</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Drilling Recommendation */}
        <div className="glass-panel p-3 rounded border border-blue-700/20 bg-blue-900/5">
          <div className="flex items-center mb-2 pb-2 border-b border-blue-700/20">
            <div className="h-7 w-7 flex items-center justify-center bg-blue-900/30 rounded-full text-blue-400 mr-2">
              <Route className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-medium text-gray-200">AI Directional Recommendation</h3>
          </div>
          
          <div className="text-sm text-gray-300">
            {targetStats.onTargetScore >= 85 ? (
              <p>Continue current drilling parameters. Well is on target with excellent directional control. Maintain survey frequency and monitor turn rate.</p>
            ) : targetStats.onTargetScore >= 70 ? (
              <p>Well is tracking to plan with minor deviations. Consider slight toolface adjustments to optimize vertical section position. Continue with regular survey intervals.</p>
            ) : targetStats.onTargetScore >= 50 ? (
              <p>Course correction needed. Implement {targetStats.estimatedStays} slide(s) with appropriate toolface orientation to address position shift of {targetStats.remainingShift.toFixed(2)} ft. Increase survey frequency to verify correction.</p>
            ) : (
              <p>Significant course correction required. Consider dedicated sliding runs with optimized toolface orientation. Increase survey frequency and monitor DLS closely to avoid mechanical risk.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectionalAnalytics;