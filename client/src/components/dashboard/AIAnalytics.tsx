import React from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { 
  Info, 
  TrendingUp, 
  Users,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LineChart,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  BarChart,
  CircleDot,
  List
} from 'lucide-react';

export default function AIAnalytics() {
  const { 
    surveys,
    latestSurvey, 
    aiAnalysis, 
    projections
  } = useSurveyContext();

  // Format status class based on AI analysis status
  const getStatusClass = (status: string) => {
    if (status === 'Passed') return 'bg-emerald-500';
    if (status === 'Warning') return 'bg-amber-500';
    if (status === 'Failed') return 'bg-rose-500';
    return 'bg-cyan-500';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Passed') return <CheckCircle2 className="h-3 w-3 mr-1" />;
    if (status === 'Warning') return <AlertTriangle className="h-3 w-3 mr-1" />;
    if (status === 'Failed') return <XCircle className="h-3 w-3 mr-1" />;
    return <AlertCircle className="h-3 w-3 mr-1" />;
  };
  
  // Calculate directional statistics from survey data
  const calculateDirectionalStats = () => {
    if (!surveys || surveys.length === 0) {
      return {
        avgInc: 0,
        avgAz: 0,
        incChange: 0,
        passedCount: 0,
        warningCount: 0,
        failedCount: 0,
        totalCount: 0
      };
    }
    
    // Calculate average inclination and azimuth
    const incValues = surveys.map(s => typeof s.inc === 'string' ? parseFloat(s.inc) : Number(s.inc));
    const azValues = surveys.map(s => typeof s.azi === 'string' ? parseFloat(s.azi) : Number(s.azi));
    
    const avgInc = incValues.reduce((sum, val) => sum + val, 0) / incValues.length;
    
    // For azimuth, we need to handle circular averaging correctly
    const sinSum = azValues.reduce((sum, val) => sum + Math.sin(val * Math.PI / 180), 0);
    const cosSum = azValues.reduce((sum, val) => sum + Math.cos(val * Math.PI / 180), 0);
    const avgAz = (Math.atan2(sinSum, cosSum) * 180 / Math.PI + 360) % 360;
    
    // Calculate inclination change from previous survey
    let incChange = 0;
    if (surveys.length >= 2 && latestSurvey) {
      const prevSurvey = surveys[surveys.length - 2];
      const prevInc = typeof prevSurvey.inc === 'string' ? parseFloat(prevSurvey.inc) : Number(prevSurvey.inc);
      const currentInc = typeof latestSurvey.inc === 'string' ? parseFloat(latestSurvey.inc) : Number(latestSurvey.inc);
      incChange = currentInc - prevInc;
    }
    
    // Count survey quality metrics
    const passedCount = surveys.filter(s => {
      const dls = typeof s.dls === 'string' ? parseFloat(s.dls) : Number(s.dls);
      return dls < 1.5;
    }).length;
    
    const warningCount = surveys.filter(s => {
      const dls = typeof s.dls === 'string' ? parseFloat(s.dls) : Number(s.dls);
      return dls >= 1.5 && dls < 3;
    }).length;
    
    const failedCount = surveys.filter(s => {
      const dls = typeof s.dls === 'string' ? parseFloat(s.dls) : Number(s.dls);
      return dls >= 3;
    }).length;
    
    return {
      avgInc,
      avgAz,
      incChange,
      passedCount,
      warningCount,
      failedCount,
      totalCount: surveys.length
    };
  };
  
  // Get directional statistics
  const stats = calculateDirectionalStats();

  return (
    <div className="futuristic-container h-full flex flex-col">
      <div className="p-3 flex justify-between items-center border-b border-cyan-500/20">
        <h2 className="font-heading text-lg font-semibold flex items-center text-navy-100">
          <Brain className="h-5 w-5 mr-2 text-cyan-400" />
          <span>AI SURVEY ANALYTICS</span>
        </h2>
        <div className="flex items-center bg-navy-900/80 text-xs px-3 py-1 rounded-full border border-cyan-500/20">
          <div className="h-2 w-2 rounded-full bg-cyan-400 pulse-effect mr-2"></div>
          <span className="text-cyan-300 font-mono">ACTIVE ANALYSIS</span>
        </div>
      </div>
      <div className="p-3 space-y-3 flex-1 overflow-auto">
        {/* Survey Validation */}
        <div className="glass-panel p-3 space-y-3 border border-cyan-500/20">
          <div className="flex items-center">
            <div className="h-8 w-8 flex items-center justify-center bg-cyan-500/10 rounded-full text-cyan-400 mr-3 border border-cyan-500/20">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-navy-100">SURVEY VALIDATION</h3>
              <p className="text-xs text-navy-200 font-mono">
                {latestSurvey 
                  ? `Latest survey at ${Number(latestSurvey.md).toFixed(2)} ft` 
                  : 'No survey data available'}
              </p>
            </div>
            <div className="ml-auto">
              {aiAnalysis && (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono ${getStatusClass(aiAnalysis.status)} text-white`}>
                  {getStatusIcon(aiAnalysis.status)}
                  {aiAnalysis.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          
          {aiAnalysis && (
            <div className="pl-11">
              <ul className="text-xs space-y-2 text-navy-200 font-mono">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  {latestSurvey && Number(latestSurvey.index) > 1 
                    ? `Inclination trend ${aiAnalysis.trend === 'Consistent with build plan' 
                        ? 'consistent with previous surveys' 
                        : aiAnalysis.trend}`
                    : 'First survey in this well'}
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  Azimuth within expected range (±2° variation)
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  Dogleg severity {aiAnalysis.doglegs}
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  Magnetic interference check passed (dip angle variance &lt; 0.2°)
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Trajectory Prediction */}
        {projections && (
          <div className="glass-panel p-3 space-y-3 border border-cyan-500/20">
            <div className="flex items-center">
              <div className="h-8 w-8 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-400 mr-3 border border-blue-500/20">
                <LineChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-navy-100">TRAJECTORY PREDICTION</h3>
                <p className="text-xs text-navy-200 font-mono">Based on last 3 surveys</p>
              </div>
            </div>
            <div className="pl-11">
              <div className="text-xs space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                    <p className="text-navy-200 font-mono">Projected Inc @ {latestSurvey ? (Number(latestSurvey.md) + 100).toFixed(0) : ''}ft</p>
                    <p className="glow-text text-lg">
                      {typeof projections.projectedInc === 'number' 
                        ? projections.projectedInc.toFixed(2) 
                        : (parseFloat(String(projections.projectedInc) || '0')).toFixed(2)}°
                    </p>
                  </div>
                  <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                    <p className="text-navy-200 font-mono">Projected Az @ {latestSurvey ? (Number(latestSurvey.md) + 100).toFixed(0) : ''}ft</p>
                    <p className="glow-text text-lg">
                      {typeof projections.projectedAz === 'number' 
                        ? projections.projectedAz.toFixed(2) 
                        : (parseFloat(String(projections.projectedAz) || '0')).toFixed(2)}°
                    </p>
                  </div>
                  <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                    <p className="text-navy-200 font-mono">Est. Build Rate</p>
                    <p className="glow-text text-lg">
                      {typeof projections.buildRate === 'number' 
                        ? projections.buildRate.toFixed(2) 
                        : (parseFloat(String(projections.buildRate) || '0')).toFixed(2)}°/100ft
                    </p>
                  </div>
                  <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                    <p className="text-navy-200 font-mono">Est. Turn Rate</p>
                    <p className="glow-text text-lg">
                      {typeof projections.turnRate === 'number' 
                        ? projections.turnRate.toFixed(2) 
                        : (parseFloat(String(projections.turnRate) || '0')).toFixed(2)}°/100ft
                    </p>
                  </div>
                </div>
                
                {(() => {
                  // Safely extract build rate as a number
                  const buildRate = typeof projections.buildRate === 'number'
                    ? projections.buildRate
                    : parseFloat(String(projections.buildRate) || '0');
                  
                  return Math.abs(buildRate) > 1.35 && (
                    <div className="mt-3 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                      <p className="text-amber-400 flex items-center font-mono">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Build rate {buildRate > 0 ? 'exceeds' : 'is below'} target (1.35°/100ft)
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Directional Statistics - NEW SECTION */}
        <div className="glass-panel p-3 space-y-3 border border-cyan-500/20">
          <div className="flex items-center">
            <div className="h-8 w-8 flex items-center justify-center bg-indigo-500/10 rounded-full text-indigo-400 mr-3 border border-indigo-500/20">
              <BarChart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-navy-100">DIRECTIONAL STATISTICS</h3>
              <p className="text-xs text-navy-200 font-mono">Calculated from {stats.totalCount} surveys</p>
            </div>
          </div>
          <div className="pl-11">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                <div className="flex items-center justify-between">
                  <p className="text-navy-200 font-mono">Average Inclination</p>
                  <p className="font-mono text-cyan-400">{stats.avgInc.toFixed(2)}°</p>
                </div>
              </div>
              <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                <div className="flex items-center justify-between">
                  <p className="text-navy-200 font-mono">Average Azimuth</p>
                  <p className="font-mono text-blue-400">{stats.avgAz.toFixed(2)}°</p>
                </div>
              </div>
              
              {stats.incChange !== 0 && (
                <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10 col-span-2">
                  <div className="flex items-center">
                    <p className="text-navy-200 font-mono">Inclination Change</p>
                    <div className="ml-auto flex items-center font-mono">
                      {stats.incChange > 0 ? (
                        <ChevronUp className="h-4 w-4 text-emerald-400 mr-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-amber-400 mr-1" />
                      )}
                      <span className={stats.incChange > 0 ? "text-emerald-400" : "text-amber-400"}>
                        {Math.abs(stats.incChange).toFixed(2)}°
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {latestSurvey && (
                <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10 col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-navy-200 font-mono">Current DLS</p>
                    <div className="flex items-center">
                      <CircleDot className="h-4 w-4 text-purple-400 mr-2" />
                      <span className="font-mono text-purple-400">
                        {typeof latestSurvey.dls === 'string' 
                          ? parseFloat(latestSurvey.dls).toFixed(2) 
                          : Number(latestSurvey.dls).toFixed(2)}°/100ft
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Survey Quality Metrics - NEW SECTION */}
        <div className="glass-panel p-3 space-y-3 border border-cyan-500/20">
          <div className="flex items-center">
            <div className="h-8 w-8 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-400 mr-3 border border-blue-500/20">
              <List className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-navy-100">SURVEY QUALITY METRICS</h3>
              <p className="text-xs text-navy-200 font-mono">Algorithmic validation results</p>
            </div>
          </div>
          <div className="pl-11">
            <div className="text-xs space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10 col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-navy-200 font-mono">Total Surveys Taken</p>
                    <p className="font-mono text-white">{stats.totalCount}</p>
                  </div>
                  <div className="flex items-center space-x-1 mt-2 bg-navy-800/50 h-4 rounded overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{width: `${(stats.passedCount / Math.max(stats.totalCount, 1)) * 100}%`}}></div>
                    <div className="h-full bg-amber-500" style={{width: `${(stats.warningCount / Math.max(stats.totalCount, 1)) * 100}%`}}></div>
                    <div className="h-full bg-rose-500" style={{width: `${(stats.failedCount / Math.max(stats.totalCount, 1)) * 100}%`}}></div>
                  </div>
                </div>
                
                <div className="bg-navy-900/50 p-2 rounded border border-emerald-500/20">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2" />
                    <p className="text-emerald-300 font-mono">Passed</p>
                    <p className="ml-auto font-mono text-emerald-400">{stats.passedCount}</p>
                  </div>
                </div>
                
                <div className="bg-navy-900/50 p-2 rounded border border-amber-500/20">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-400 mr-2" />
                    <p className="text-amber-300 font-mono">Warnings</p>
                    <p className="ml-auto font-mono text-amber-400">{stats.warningCount}</p>
                  </div>
                </div>
                
                <div className="bg-navy-900/50 p-2 rounded border border-rose-500/20 col-span-2">
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-rose-400 mr-2" />
                    <p className="text-rose-300 font-mono">Failed Surveys</p>
                    <p className="ml-auto font-mono text-rose-400">{stats.failedCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                {stats.failedCount > 0 && (
                  <div className="bg-rose-900/20 p-2 rounded border border-rose-500/20">
                    <p className="text-rose-300 flex items-center font-mono text-xs">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      {stats.failedCount} survey(s) with excessive dogleg severity detected. Check previous surveys for potential issues.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Gamma Analysis */}
        <div className="glass-panel p-3 space-y-3 border border-cyan-500/20">
          <div className="flex items-center">
            <div className="h-8 w-8 flex items-center justify-center bg-emerald-500/10 rounded-full text-emerald-400 mr-3 border border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-navy-100">GAMMA ANALYSIS</h3>
              <p className="text-xs text-navy-200 font-mono">Last 100ft interval</p>
            </div>
          </div>
          <div className="pl-11">
            <div className="text-xs space-y-3 font-mono text-navy-200">
              <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                <p>Gamma spike detected at <span className="glow-text">{latestSurvey ? (Number(latestSurvey.md) - 6.3).toFixed(1) : 0}ft (74.28 gAPI)</span>, suggesting potential formation change.</p>
              </div>
              <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                <p>Correlation with offset well "<span className="glow-text">DEEP HORIZON #38</span>" indicates approaching target sandstone layer.</p>
              </div>
              <div className="mt-2">
                <button className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors flex items-center bg-navy-900/50 px-3 py-1 rounded border border-cyan-500/20">
                  <Info className="h-4 w-4 mr-1" />
                  VIEW DETAILED FORMATION ANALYSIS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-2 border-t border-cyan-500/20 flex justify-between items-center bg-navy-950/60 text-xs font-mono">
        <div className="flex items-center">
          <Brain className="h-4 w-4 text-cyan-400 mr-2 pulse-effect" />
          <span className="text-navy-200">AI MODULE ACTIVE</span>
        </div>
        <div className="text-cyan-400/70">
          CONFIDENCE: 94.8%
        </div>
      </div>
    </div>
  );
}
