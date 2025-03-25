import React, { useRef, useEffect, useState } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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
      setCurrentGamma(latest.value);
      
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
  }));

  return (
    <div className="bg-neutral-surface rounded-lg overflow-hidden futuristic-border">
      <div className="p-4 bg-primary-dark flex justify-between items-center">
        <h2 className="font-heading text-lg font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
          Gamma Plot
        </h2>
        <div className="flex space-x-2">
          <button className="bg-neutral-surface hover:bg-neutral-border transition-colors px-3 py-1 rounded text-sm">
            Export
          </button>
          <div className="bg-neutral-background text-xs px-2 py-1 rounded flex items-center">
            <div className="h-2 w-2 rounded-full bg-secondary-teal pulse mr-1"></div>
            Live
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="chart-container bg-neutral-background rounded-lg p-3">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="grid-line" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="depth" 
                type="number"
                domain={['dataMin', 'dataMax']}
                stroke="#666"
                tick={{ fill: '#ccc' }}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <YAxis 
                stroke="#666"
                tick={{ fill: '#ccc' }}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1E1E1E', 
                  border: '1px solid #333', 
                  borderRadius: '4px',
                  color: '#E0E0E0'
                }}
                formatter={(value: number) => [value.toFixed(2) + ' gAPI', 'Gamma']}
                labelFormatter={(label) => `Depth: ${label.toFixed(2)} ft`}
              />
              <Line 
                type="monotone" 
                dataKey="gamma" 
                stroke="#3498DB" 
                strokeWidth={2}
                dot={{ r: 3, fill: "#3498DB", stroke: "#3498DB" }}
                activeDot={{ r: 6, fill: "#3498DB", stroke: "#fff", strokeWidth: 2 }}
                animationDuration={300}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 mt-4 gap-4">
          <div className="bg-neutral-background rounded-md p-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">Current API (gAPI)</span>
            <span className="font-mono font-medium">{currentGamma?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="bg-neutral-background rounded-md p-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">Avg API (gAPI)</span>
            <span className="font-mono font-medium">{avgGamma?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="bg-neutral-background rounded-md p-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">Depth Range (ft)</span>
            <span className="font-mono font-medium">{depthRange || 'N/A'}</span>
          </div>
          <div className="bg-neutral-background rounded-md p-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">Last Update</span>
            <span className="font-mono text-xs">{lastUpdate || 'N/A'}</span>
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
          height: 200px;
          position: relative;
        }
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
      `}</style>
    </div>
  );
}
