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
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export function AIAnalyticsComponent({ analysis }: { analysis: any }) {
  if (!analysis) return null;

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">AI Analysis</h2>
      <div className="space-y-2">
        <div>Status: {analysis.status}</div>
        <div>Doglegs: {analysis.doglegs}</div>
        <div>Trend: {analysis.trend}</div>
        <div>Recommendation: {analysis.recommendation}</div>
      </div>
    </Card>
  );
}

export default function AIAnalytics() {
  const { 
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
          {aiAnalysis && <AIAnalyticsComponent analysis={aiAnalysis} />}
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
                    <p className="glow-text text-lg">{projections.projectedInc.toFixed(2)}°</p>
                  </div>
                  <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                    <p className="text-navy-200 font-mono">Projected Az @ {latestSurvey ? (Number(latestSurvey.md) + 100).toFixed(0) : ''}ft</p>
                    <p className="glow-text text-lg">{projections.projectedAz.toFixed(2)}°</p>
                  </div>
                  <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                    <p className="text-navy-200 font-mono">Est. Build Rate</p>
                    <p className="glow-text text-lg">{projections.buildRate.toFixed(2)}°/100ft</p>
                  </div>
                  <div className="bg-navy-900/50 p-2 rounded border border-cyan-500/10">
                    <p className="text-navy-200 font-mono">Est. Turn Rate</p>
                    <p className="glow-text text-lg">{projections.turnRate.toFixed(2)}°/100ft</p>
                  </div>
                </div>
                
                {Math.abs(projections.buildRate) > 1.35 && (
                  <div className="mt-3 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                    <p className="text-amber-400 flex items-center font-mono">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Build rate {projections.buildRate > 0 ? 'exceeds' : 'is below'} target (1.35°/100ft)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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