import React, { useRef, useEffect, useState } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { Activity, BarChart3, Download, Zap } from 'lucide-react';

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
    <div className="futuristic-container h-full flex flex-col">
      <div className="p-3 flex justify-between items-center border-b border-cyan-500/20">
        <h2 className="font-heading text-lg font-semibold flex items-center text-navy-100">
          <BarChart3 className="h-5 w-5 mr-2 text-cyan-400" />
          <span>GAMMA PLOT</span>
        </h2>
        <div className="flex space-x-2">
          <button className="glass-panel px-3 py-1 rounded text-xs text-cyan-200 hover:bg-cyan-800/20 transition-all duration-300 flex items-center">
            <Download className="h-3 w-3 mr-1" />
            EXPORT
          </button>
          <div className="bg-navy-950/40 text-xs px-2 py-1 rounded flex items-center border border-emerald-500/20">
            <div className="h-2 w-2 rounded-full bg-emerald-500 pulse-effect mr-1"></div>
            <span className="text-emerald-400 font-mono">LIVE</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-0 flex-1">
        {/* Side metrics panel */}
        <div className="glass-panel m-3 p-3 rounded-lg flex flex-col justify-between border border-cyan-500/20 bg-navy-950/70">
          <div className="space-y-4">
            <div className="bg-navy-900/70 rounded-md p-2 border border-cyan-500/20 glow-border">
              <span className="text-xs text-navy-200 font-mono">CURRENT API</span>
              <div className="font-mono font-bold text-2xl glow-text-green mt-1">{currentGamma?.toFixed(1) || 'N/A'}</div>
              <span className="text-[10px] text-cyan-400/70 font-mono">gAPI</span>
            </div>
            
            <div className="bg-navy-900/70 rounded-md p-2 border border-cyan-500/20">
              <span className="text-xs text-navy-200 font-mono">AVG API</span>
              <div className="font-mono font-medium text-lg glow-text mt-1">{avgGamma?.toFixed(1) || 'N/A'}</div>
              <span className="text-[10px] text-cyan-400/70 font-mono">gAPI</span>
            </div>
            
            <div className="bg-navy-900/70 rounded-md p-2 border border-cyan-500/20">
              <span className="text-xs text-navy-200 font-mono">DEPTH RANGE</span>
              <div className="font-mono font-medium text-sm glow-text mt-1">{depthRange || 'N/A'}</div>
              <span className="text-[10px] text-cyan-400/70 font-mono">ft MD</span>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="text-[10px] text-cyan-400/70 mt-2 font-mono flex items-center">
              <Activity className="h-3 w-3 mr-1 text-cyan-400 pulse-effect" />
              LAST UPDATE
            </div>
            <div className="font-mono text-xs text-cyan-200">{lastUpdate || 'N/A'}</div>
          </div>
        </div>
        
        {/* Vertical Gamma plot */}
        <div className="col-span-2 p-3 flex-1 flex">
          <div className="chart-container glass-panel rounded-lg p-3 flex-1 border border-cyan-500/20 bg-navy-950/70">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.15)" />
                <XAxis 
                  type="number"
                  domain={[0, 'dataMax + 20']}
                  stroke="#06b6d4"
                  tick={{ fill: '#a5f3fc' }}
                  orientation="top"
                />
                <YAxis 
                  dataKey="depth" 
                  type="number"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  reversed={true}
                  stroke="#06b6d4"
                  tick={{ fill: '#a5f3fc' }}
                  tickFormatter={(value) => value.toFixed(0)}
                  label={{ value: 'DEPTH (ft)', angle: -90, position: 'insideLeft', fill: '#a5f3fc', fontSize: 12, fontFamily: 'monospace' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(6, 16, 36, 0.9)', 
                    border: '1px solid rgba(6, 182, 212, 0.4)', 
                    borderRadius: '4px',
                    color: '#a5f3fc',
                    backdropFilter: 'blur(8px)',
                    fontFamily: 'monospace',
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'
                  }}
                  formatter={(value: number) => [
                    <span className="glow-text">{value.toFixed(2)} gAPI</span>, 
                    <span className="text-cyan-200">Gamma</span>
                  ]}
                  labelFormatter={(label) => `Depth: ${label.toFixed(2)} ft`}
                  cursor={{ fill: 'rgba(6, 182, 212, 0.15)' }}
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
                  wrapperStyle={{ paddingTop: '10px', fontFamily: 'monospace' }}
                  formatter={() => <span className="text-cyan-200">Gamma Readings (gAPI)</span>}
                />
                
                {/* Reference lines for significant gamma values */}
                <ReferenceLine y={0} stroke="rgba(6, 182, 212, 0.4)" strokeDasharray="3 3" />
                <ReferenceLine x={60} stroke="rgba(16, 185, 129, 0.6)" strokeDasharray="3 3" />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gammaGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0891b2" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-2 border-t border-cyan-500/20 flex justify-between items-center bg-navy-950/60">
        <div className="flex items-center">
          <Zap className="h-4 w-4 text-cyan-400 mr-1" />
          <span className="text-xs text-navy-200 font-mono">REAL-TIME GAMMA ANALYSIS</span>
        </div>
        <div className="text-xs text-cyan-400/70 font-mono">
          SAMPLES: {chartData.length}
        </div>
      </div>
    </div>
  );
}
