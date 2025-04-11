import React, { useState, useEffect } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { useWellContext } from '@/context/WellContext';
import { Card } from '@/components/ui/card';
import { Compass, ArrowDown } from 'lucide-react';

// Simplified version of the wellbore trajectory component
const WellboreTrajectory = () => {
  const { surveys } = useSurveyContext();
  const { wellInfo } = useWellContext();
  const [trajectoryPoints, setTrajectoryPoints] = useState<Array<{
    md: number;
    tvd: number;
    ns: number;
    ew: number;
    inc: number;
    azi: number;
  }>>([]);

  // Process survey data for trajectory visualization
  useEffect(() => {
    if (!surveys || surveys.length === 0) return;

    // Sort surveys by measured depth
    const sortedSurveys = [...surveys].sort((a, b) => {
      const mdA = typeof a.md === 'string' ? parseFloat(a.md) : Number(a.md || 0);
      const mdB = typeof b.md === 'string' ? parseFloat(b.md) : Number(b.md || 0);
      return mdA - mdB;
    });

    // Extract trajectory points
    const points = sortedSurveys.map(survey => {
      const md = typeof survey.md === 'string' ? parseFloat(survey.md) : Number(survey.md || 0);
      const tvd = typeof survey.tvd === 'string' ? parseFloat(survey.tvd) : Number(survey.tvd || 0);
      const northSouth = typeof survey.northSouth === 'string' ? parseFloat(survey.northSouth) : Number(survey.northSouth || 0);
      const eastWest = typeof survey.eastWest === 'string' ? parseFloat(survey.eastWest) : Number(survey.eastWest || 0);
      const inc = typeof survey.inc === 'string' ? parseFloat(survey.inc) : Number(survey.inc || 0);
      const azi = typeof survey.azi === 'string' ? parseFloat(survey.azi) : Number(survey.azi || 0);
      const isNorth = Boolean(survey.isNorth);
      const isEast = Boolean(survey.isEast);

      // Apply direction (North/South, East/West)
      const ns = isNorth ? northSouth : -northSouth;
      const ew = isEast ? eastWest : -eastWest;

      return { md, tvd, ns, ew, inc, azi };
    });

    setTrajectoryPoints(points);
  }, [surveys]);

  // Calculate trajectory stats 
  const maxTVD = trajectoryPoints.length > 0 ? Math.max(...trajectoryPoints.map(p => p.tvd)) : 0;
  const maxNS = trajectoryPoints.length > 0 ? Math.max(...trajectoryPoints.map(p => Math.abs(p.ns))) : 0;
  const maxEW = trajectoryPoints.length > 0 ? Math.max(...trajectoryPoints.map(p => Math.abs(p.ew))) : 0;
  const maxHorizontalDisplacement = Math.sqrt(Math.pow(maxNS, 2) + Math.pow(maxEW, 2));
  const latest = trajectoryPoints.length > 0 ? trajectoryPoints[trajectoryPoints.length - 1] : null;

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 flex justify-between items-center border-b border-gray-700/30">
        <h2 className="font-heading text-lg font-semibold flex items-center text-white">
          <Compass className="h-5 w-5 mr-2 text-cyan-400" />
          Wellbore Trajectory
        </h2>
      </div>
      <div className="p-4 glass-panel border border-gray-700/30">
        {trajectoryPoints.length > 0 ? (
          <div className="space-y-5">
            {/* Wellbore stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="glass-panel p-3 rounded border border-gray-700/30">
                <div className="text-xs text-gray-400">Current Depth</div>
                <div className="text-xl font-mono text-cyan-400 mt-1">
                  {latest ? latest.md.toFixed(2) : '0.00'}<span className="text-xs text-gray-400 ml-1">ft</span>
                </div>
              </div>
              <div className="glass-panel p-3 rounded border border-gray-700/30">
                <div className="text-xs text-gray-400">Current TVD</div>
                <div className="text-xl font-mono text-cyan-400 mt-1">
                  {latest ? latest.tvd.toFixed(2) : '0.00'}<span className="text-xs text-gray-400 ml-1">ft</span>
                </div>
              </div>
              <div className="glass-panel p-3 rounded border border-gray-700/30">
                <div className="text-xs text-gray-400">Current Inclination</div>
                <div className="text-xl font-mono text-amber-400 mt-1">
                  {latest ? latest.inc.toFixed(2) : '0.00'}<span className="text-xs text-gray-400 ml-1">°</span>
                </div>
              </div>
              <div className="glass-panel p-3 rounded border border-gray-700/30">
                <div className="text-xs text-gray-400">Current Azimuth</div>
                <div className="text-xl font-mono text-amber-400 mt-1">
                  {latest ? latest.azi.toFixed(2) : '0.00'}<span className="text-xs text-gray-400 ml-1">°</span>
                </div>
              </div>
            </div>
            
            {/* Trajectory visualization - simplified representation */}
            <div className="relative h-64 bg-gray-900/50 rounded-lg border border-gray-700/30 p-4 overflow-hidden">
              <div className="absolute left-0 bottom-0 w-full h-full flex items-end">
                {trajectoryPoints.map((point, index) => {
                  // Calculate position
                  const x = (point.ew / maxEW) * 50 + 50; // Center at 50%
                  const y = (point.tvd / maxTVD) * 85; // Use 85% of height
                  
                  return (
                    <div 
                      key={index}
                      className="absolute h-2 w-2 rounded-full bg-cyan-400"
                      style={{ 
                        left: `${x}%`, 
                        bottom: `${y}%`,
                        opacity: (index / trajectoryPoints.length) * 0.7 + 0.3
                      }}
                    />
                  );
                })}
                
                {/* Connect points with line */}
                <svg className="absolute bottom-0 left-0 w-full h-full" style={{ overflow: 'visible' }}>
                  <path
                    d={trajectoryPoints.map((point, i) => {
                      const x = (point.ew / maxEW) * 50 + 50; // Center at 50%
                      const y = 100 - ((point.tvd / maxTVD) * 85); // Invert for SVG coords
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.7)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Current position indicator */}
                {latest && (
                  <div 
                    className="absolute h-4 w-4 rounded-full bg-amber-400 animate-pulse"
                    style={{ 
                      left: `${(latest.ew / maxEW) * 50 + 50}%`, 
                      bottom: `${(latest.tvd / maxTVD) * 85}%`,
                      transform: 'translate(-50%, 50%)'
                    }}
                  />
                )}
                
                {/* Axes */}
                <div className="absolute left-1/2 bottom-0 w-px h-full bg-gray-600/30" />
                <div className="absolute left-0 bottom-1/6 w-full h-px bg-gray-600/30" />
                
                {/* Labels */}
                <div className="absolute left-1 bottom-1 text-[10px] text-gray-400">TVD: 0 ft</div>
                <div className="absolute left-1 top-1 text-[10px] text-gray-400">
                  TVD: {maxTVD.toFixed(0)} ft
                </div>
                <div className="absolute left-1/2 bottom-1 text-[10px] text-gray-400 transform -translate-x-1/2">
                  Center
                </div>
                <div className="absolute right-1 bottom-1 text-[10px] text-gray-400">
                  HD: {maxHorizontalDisplacement.toFixed(0)} ft
                </div>
              </div>
            </div>
            
            {/* Trajectory info text */}
            <div className="text-center text-sm text-gray-400 mt-2">
              <p>
                Wellbore has been drilled to {latest?.md.toFixed(2)} ft MD / {latest?.tvd.toFixed(2)} ft TVD
                with a current inclination of {latest?.inc.toFixed(2)}° and azimuth of {latest?.azi.toFixed(2)}°
              </p>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <ArrowDown className="h-12 w-12 text-gray-600 mb-3" />
            <p className="text-gray-400">No trajectory data available</p>
            <p className="text-sm text-gray-500 mt-1">Add survey points to see wellbore trajectory</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellboreTrajectory;