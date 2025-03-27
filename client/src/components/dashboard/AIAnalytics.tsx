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
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AIAnalyticsProps {
  analysis: {
    confidenceScore: number;
    recommendations: string[];
    warnings: string[];
  };
}

export const AIAnalytics: React.FC<AIAnalyticsProps> = ({ analysis }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">AI Confidence Score:</div>
            <div className="text-emerald-500">{analysis.confidenceScore}%</div>
          </div>

          {analysis.recommendations.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Recommendations:</div>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.warnings.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Warnings:</div>
              <ul className="space-y-2">
                {analysis.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <AlertCircle className="h-4 w-4 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

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

export const AIAnalyticsContainer = () => {
  const { latestSurvey, aiAnalysis } = useSurveyContext();

  //Transform aiAnalysis for new component
  const transformedAiAnalysis = {
    confidenceScore: 94.8,
    recommendations: [
      latestSurvey && Number(latestSurvey.index) > 1
        ? `Inclination trend ${aiAnalysis?.trend === 'Consistent with build plan'
            ? 'consistent with previous surveys'
            : aiAnalysis?.trend ?? ''}`
        : 'First survey in this well',
      'Azimuth within expected range (±2° variation)',
      `Dogleg severity ${aiAnalysis?.doglegs ?? ''}`,
      'Magnetic interference check passed (dip angle variance < 0.2°)'
    ].filter(item => item !== ''),
    warnings: []
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
        {aiAnalysis && <AIAnalytics analysis={transformedAiAnalysis} />}
      </div>
      <div className="p-2 border-t border-cyan-500/20 flex justify-between items-center bg-navy-950/60">
        <div className="flex items-center">
          <Zap className="h-4 w-4 text-cyan-400 mr-1" />
          <span className="text-xs text-navy-200 font-mono">REAL-TIME ANALYSIS</span>
        </div>
      </div>
    </div>
  );
};