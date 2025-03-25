import React from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { 
  Info, 
  TrendingUp, 
  Users 
} from 'lucide-react';

export default function AIAnalytics() {
  const { 
    latestSurvey, 
    aiAnalysis, 
    projections
  } = useSurveyContext();

  // Format status class based on AI analysis status
  const getStatusClass = (status: string) => {
    if (status === 'Passed') return 'bg-status-success';
    if (status === 'Warning') return 'bg-status-warning';
    if (status === 'Failed') return 'bg-status-error';
    return 'bg-status-info';
  };

  return (
    <div className="bg-neutral-surface rounded-lg overflow-hidden futuristic-border">
      <div className="p-4 bg-primary-dark flex justify-between items-center">
        <h2 className="font-heading text-lg font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2" />
          AI Survey Analytics
        </h2>
        <div className="flex items-center bg-secondary-purple/20 text-xs px-2 py-1 rounded">
          <div className="h-2 w-2 rounded-full bg-secondary-purple pulse mr-2"></div>
          Active Analysis
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* Survey Validation */}
        <div className="bg-neutral-background rounded-lg p-3 space-y-3">
          <div className="flex items-center">
            <div className="h-8 w-8 flex items-center justify-center bg-secondary-purple/20 rounded-full text-secondary-purple mr-3">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Survey Validation</h3>
              <p className="text-xs text-gray-400">
                {latestSurvey 
                  ? `Latest survey at ${latestSurvey.md.toFixed(2)} ft` 
                  : 'No survey data available'}
              </p>
            </div>
            <div className="ml-auto">
              {aiAnalysis && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(aiAnalysis.status)} text-white`}>
                  {aiAnalysis.status}
                </span>
              )}
            </div>
          </div>
          
          {aiAnalysis && (
            <div className="pl-11">
              <ul className="text-xs space-y-2 text-gray-300">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-status-success mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {latestSurvey?.index > 1 
                    ? `Inclination trend ${aiAnalysis.trend === 'Consistent with build plan' 
                        ? 'consistent with previous surveys' 
                        : aiAnalysis.trend}`
                    : 'First survey in this well'}
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-status-success mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Azimuth within expected range (±2° variation)
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-status-success mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Dogleg severity {aiAnalysis.doglegs}
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-status-success mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Magnetic interference check passed (dip angle variance &lt; 0.2°)
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Trajectory Prediction */}
        {projections && (
          <div className="bg-neutral-background rounded-lg p-3 space-y-3">
            <div className="flex items-center">
              <div className="h-8 w-8 flex items-center justify-center bg-primary/20 rounded-full text-primary mr-3">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Trajectory Prediction</h3>
                <p className="text-xs text-gray-400">Based on last 3 surveys</p>
              </div>
            </div>
            <div className="pl-11">
              <div className="text-xs space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-gray-400">Projected Inc @ {latestSurvey ? (latestSurvey.md + 100).toFixed(0) : ''}ft</p>
                    <p className="font-mono font-medium">{projections.projectedInc.toFixed(2)}°</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Projected Az @ {latestSurvey ? (latestSurvey.md + 100).toFixed(0) : ''}ft</p>
                    <p className="font-mono font-medium">{projections.projectedAz.toFixed(2)}°</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Est. Build Rate</p>
                    <p className="font-mono font-medium">{projections.buildRate.toFixed(2)}°/100ft</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Est. Turn Rate</p>
                    <p className="font-mono font-medium">{projections.turnRate.toFixed(2)}°/100ft</p>
                  </div>
                </div>
                
                {Math.abs(projections.buildRate) > 1.35 && (
                  <div className="mt-3">
                    <p className="text-status-warning flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Build rate {projections.buildRate > 0 ? 'exceeds' : 'is below'} target (1.35°/100ft)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gamma Analysis */}
        <div className="bg-neutral-background rounded-lg p-3 space-y-3">
          <div className="flex items-center">
            <div className="h-8 w-8 flex items-center justify-center bg-secondary-teal/20 rounded-full text-secondary-teal mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium">Gamma Analysis</h3>
              <p className="text-xs text-gray-400">Last 100ft interval</p>
            </div>
          </div>
          <div className="pl-11">
            <div className="text-xs space-y-3">
              <p>Gamma spike detected at {latestSurvey ? latestSurvey.md - 6.3 : 0}ft (74.28 gAPI), suggesting potential formation change.</p>
              <p>Correlation with offset well "DEEP HORIZON #38" indicates approaching target sandstone layer.</p>
              <div className="mt-2">
                <button className="text-primary text-xs hover:text-white transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  View detailed formation analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .futuristic-border {
          border: 1px solid rgba(52, 152, 219, 0.3);
          position: relative;
        }
        .futuristic-border::before, .futuristic-border::after {
          content: '';
          position: absolute;
          width: 15px;
          height: 15px;
          border-color: #3498DB;
        }
        .futuristic-border::before {
          top: -1px;
          left: -1px;
          border-top: 2px solid;
          border-left: 2px solid;
        }
        .futuristic-border::after {
          bottom: -1px;
          right: -1px;
          border-bottom: 2px solid;
          border-right: 2px solid;
        }
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
