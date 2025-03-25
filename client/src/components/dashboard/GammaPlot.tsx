import React, { useRef, useEffect, useState } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { LucideActivity } from 'lucide-react';

interface GammaPoint {
  depth: number;
  value: number;
}

export default function GammaPlot() {
  const { gammaData } = useSurveyContext();
  const [currentGamma, setCurrentGamma] = useState<number | null>(null);
  const [avgGamma, setAvgGamma] = useState<number | null>(null);
  const [depthRange, setDepthRange] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    if (gammaData.length > 0) {
      // Get current gamma (latest data point)
      const latest = gammaData[gammaData.length - 1];
      setCurrentGamma(Number(latest.value));
      
      // Calculate average
      const sum = gammaData.reduce((acc, point) => acc + Number(point.value), 0);
      setAvgGamma(sum / gammaData.length);
      
      // Calculate depth range
      const depths = gammaData.map(point => Number(point.depth));
      const minDepth = Math.min(...depths);
      const maxDepth = Math.max(...depths);
      setDepthRange(`${minDepth.toFixed(0)}-${maxDepth.toFixed(0)}`);
      
      // Set last update time
      setLastUpdate(new Date().toLocaleTimeString());
    }
  }, [gammaData]);

  // Format data for Recharts
  const chartData = gammaData.map(point => ({
    depth: Number(point.depth),
    gamma: Number(point.value)
  })).sort((a, b) => a.depth - b.depth);

  return (
    <div className="card rounded-lg overflow-hidden futuristic-border h-full">
      <div className="p-3 bg-violet-900/30 flex justify-between items-center border-b border-violet-500/20">
        <h2 className="font-heading text-lg font-semibold flex items-center text-violet-100">
          <LucideActivity className="h-5 w-5 mr-2 text-violet-400" />
          Gamma Plot
        </h2>
        <div className="flex space-x-2">
          <button className="glass-panel px-3 py-1 rounded text-xs text-violet-200 hover:bg-violet-800/20 transition-all">
            Export
          </button>
          <div className="bg-violet-950/40 text-xs px-2 py-1 rounded flex items-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 pulse mr-1"></div>
            <span className="text-emerald-300">Live</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-0">
        {/* Side metrics panel */}
        <div className="glass-panel m-3 p-3 rounded-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div className="bg-violet-900/20 rounded-md p-2 border border-violet-500/20">
              <span className="text-xs text-violet-300">Current API</span>
              <div className="font-mono font-bold text-2xl text-emerald-400 mt-1">{currentGamma?.toFixed(1) || 'N/A'}</div>
              <span className="text-[10px] text-violet-400">gAPI</span>
            </div>
            
            <div className="bg-violet-900/20 rounded-md p-2 border border-violet-500/20">
              <span className="text-xs text-violet-300">Avg API</span>
              <div className="font-mono font-medium text-lg text-violet-200 mt-1">{avgGamma?.toFixed(1) || 'N/A'}</div>
              <span className="text-[10px] text-violet-400">gAPI</span>
            </div>
            
            <div className="bg-violet-900/20 rounded-md p-2 border border-violet-500/20">
              <span className="text-xs text-violet-300">Depth Range</span>
              <div className="font-mono font-medium text-sm text-violet-200 mt-1">{depthRange || 'N/A'}</div>
              <span className="text-[10px] text-violet-400">ft MD</span>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="text-[10px] text-violet-400 mt-2">Last Update</div>
            <div className="font-mono text-xs text-violet-200">{lastUpdate || 'N/A'}</div>
          </div>
        </div>
        
        {/* Vertical Gamma plot */}
        <div className="col-span-2 p-3">
          <div className="chart-container glass-panel rounded-lg p-3 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="grid-line" stroke="rgba(139, 92, 246, 0.1)" />
                <XAxis 
                  type="number"
                  domain={[0, 'dataMax + 20']}
                  stroke="#8b5cf6"
                  tick={{ fill: '#c4b5fd' }}
                  orientation="top"
                />
                <YAxis 
                  dataKey="depth" 
                  type="number"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  reversed={true}
                  stroke="#8b5cf6"
                  tick={{ fill: '#c4b5fd' }}
                  tickFormatter={(value) => value.toFixed(0)}
                  label={{ value: 'Depth (ft)', angle: -90, position: 'insideLeft', fill: '#c4b5fd', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                    border: '1px solid rgba(139, 92, 246, 0.4)', 
                    borderRadius: '4px',
                    color: '#f5f3ff',
                    backdropFilter: 'blur(8px)'
                  }}
                  formatter={(value: number) => [value.toFixed(2) + ' gAPI', 'Gamma']}
                  labelFormatter={(label) => `Depth: ${label.toFixed(2)} ft`}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.2)' }}
                />
                <Bar 
                  dataKey="gamma" 
                  fill="url(#gammaGradient)" 
                  radius={[4, 4, 0, 0]}
                  barSize={8}
                  animationDuration={500}
                  animationEasing="ease-out"
                />
                
                <Legend 
                  verticalAlign="bottom" 
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={() => 'Gamma Readings (gAPI)'}
                />
                
                {/* Reference lines for significant gamma values */}
                <ReferenceLine y={0} stroke="rgba(139, 92, 246, 0.5)" strokeDasharray="3 3" />
                <ReferenceLine x={60} stroke="rgba(20, 184, 166, 0.6)" strokeDasharray="3 3" />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gammaGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4c1d95" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#5eead4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .chart-container {
          min-height: 400px;
          position: relative;
        }
        .futuristic-border {
          position: relative;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
        }
        .futuristic-border::before, .futuristic-border::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: rgb(139, 92, 246);
          z-index: 1;
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
      `}</style>
    </div>
  );
}
