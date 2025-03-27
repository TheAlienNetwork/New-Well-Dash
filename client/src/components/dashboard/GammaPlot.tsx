import React, { useRef, useEffect, useState } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Legend, Area, ComposedChart,
  AreaChart 
} from 'recharts';
import { Activity, BarChart3, Download, Zap, Mail } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GammaPoint {
  depth: number;
  value: number;
}

export default function GammaPlot() {
  const { gammaData, curveData, updateCurveData } = useSurveyContext();
  const [currentGamma, setCurrentGamma] = useState<number | null>(null);
  const [avgGamma, setAvgGamma] = useState<number | null>(null);
  const [depthRange, setDepthRange] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [includeInEmail, setIncludeInEmail] = useState<boolean>(curveData?.includeGammaPlot || false);
  const [chartKey, setChartKey] = useState(() => `gamma-chart-${Date.now()}`);
  
  // Force regenerate chart key on gammaData changes
  useEffect(() => {
    setChartKey(`gamma-chart-${Date.now()}`);
  }, [gammaData]);
  
  useEffect(() => {
    if (curveData) {
      setIncludeInEmail(curveData.includeGammaPlot || false);
    }
  }, [curveData]);
  
  const handleToggleEmail = (checked: boolean) => {
    setIncludeInEmail(checked);
    
    if (updateCurveData && curveData) {
      updateCurveData({
        id: curveData.id,
        wellId: curveData.wellId,
        motorYield: curveData.motorYield,
        dogLegNeeded: curveData.dogLegNeeded,
        projectedInc: curveData.projectedInc,
        projectedAz: curveData.projectedAz,
        slideSeen: curveData.slideSeen,
        slideAhead: curveData.slideAhead,
        includeInEmail: curveData.includeInEmail,
        includeTargetPosition: curveData.includeTargetPosition,
        includeGammaPlot: checked
      });
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = gammaData
      .sort((a, b) => Number(a.depth) - Number(b.depth))
      .map(point => [String(Number(point.depth).toFixed(2)), String(Number(point.value).toFixed(2))]);
    
    doc.setFontSize(16);
    doc.text('Gamma Data Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
    
    autoTable(doc, {
      head: [['Depth (ft)', 'Gamma (gAPI)']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 }
    });
    
    doc.save('gamma-data.pdf');
  };

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
      setDepthRange(`${Math.floor(minDepth)}-${Math.ceil(maxDepth)}`);
      
      // Set last update time
      setLastUpdate(new Date().toLocaleTimeString());
    }
  }, [gammaData]);

  // Format data for Recharts - only show last 100ft
  const chartData = gammaData
    .map(point => ({
      depth: Number(point.depth),
      gamma: Number(point.value),
      // Adding a unique key to each point to avoid React key conflicts
      id: `gamma-${point.id}-${point.depth}`
    }))
    .sort((a, b) => a.depth - b.depth)
    .filter(point => {
      const maxDepth = Math.max(...gammaData.map(p => Number(p.depth)));
      return point.depth >= maxDepth - 50; // Show only last 50ft for more compact view
    });

  return (
    <div className="futuristic-container h-full flex flex-col">
      <div className="p-3 flex justify-between items-center border-b border-cyan-500/20">
        <h2 className="font-heading text-lg font-semibold flex items-center text-navy-100">
          <BarChart3 className="h-5 w-5 mr-2 text-cyan-400" />
          <span>GAMMA PLOT</span>
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportPDF}
            className="glass-panel px-3 py-1 rounded text-xs text-cyan-200 hover:bg-cyan-800/20 transition-all duration-300 flex items-center"
          >
            <Download className="h-3 w-3 mr-1" />
            EXPORT PDF
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
        <div className="col-span-2 p-3 flex-1 flex" style={{ maxHeight: '400px' }}>
          <div className="chart-container glass-panel rounded-lg p-3 flex-1 border border-cyan-500/20 bg-navy-950/70">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart 
                data={chartData} 
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                key={chartKey}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.15)" />
                <XAxis 
                  dataKey="gamma"
                  type="number"
                  domain={[0, 'dataMax + 20']}
                  stroke="#06b6d4"
                  tick={{ fill: '#a5f3fc' }}
                  label={{ value: 'Gamma (gAPI)', position: 'insideBottom', fill: '#a5f3fc', fontSize: 12, fontFamily: 'monospace', offset: 0 }}
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
                    `${value.toFixed(2)} gAPI`, 
                    'Gamma'
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return `Depth: ${(payload[0] as any).payload.depth.toFixed(2)} ft`;
                    }
                    return `Depth: unknown`;
                  }}
                  cursor={{ stroke: 'rgba(6, 182, 212, 0.4)', strokeWidth: 1 }}
                />
                
                {/* Line for gamma values with lime green styling */}
                <Line 
                  type="monotone"
                  dataKey="gamma"
                  stroke="#4ade80" 
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 1, stroke: '#ffffff', fill: '#4ade80' }}
                  isAnimationActive={false}
                  dot={{ stroke: '#4ade80', strokeWidth: 1, r: 3, fill: '#4ade80' }}
                />
                
                {/* Area under the line with gradient */}
                <Area 
                  type="monotone"
                  dataKey="gamma"
                  stroke="none"
                  fill="url(#gammaGradient)" 
                  fillOpacity={0.3}
                  isAnimationActive={false}
                />
                
                <Legend 
                  verticalAlign="bottom" 
                  wrapperStyle={{ paddingTop: '10px', fontFamily: 'monospace', color: '#a5f3fc' }}
                  formatter={() => 'Gamma Readings (gAPI)'}
                />
                
                {/* Reference line for significant gamma value */}
                <ReferenceLine x={60} stroke="rgba(77, 255, 77, 0.3)" strokeDasharray="3 3" label={{ value: 'Threshold', fill: '#4ade80', fontSize: 10 }} />
                
                {/* Gradient definition for area fill */}
                <defs>
                  <linearGradient id="gammaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.7} />
                    <stop offset="50%" stopColor="#4ade80" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-2 border-t border-cyan-500/20 flex justify-between items-center bg-navy-950/60">
        <div className="flex items-center">
          <Zap className="h-4 w-4 text-cyan-400 mr-1" />
          <span className="text-xs text-navy-200 font-mono">REAL-TIME GAMMA ANALYSIS</span>
        </div>
        <div className="flex items-center space-x-4">
          {/* Email toggle */}
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-cyan-400" />
            <Label htmlFor="include-gamma-email" className="text-xs text-cyan-200">Email</Label>
            <Switch
              id="include-gamma-email"
              checked={includeInEmail}
              onCheckedChange={handleToggleEmail}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>
          <div className="text-xs text-cyan-400/70 font-mono">
            SAMPLES: {chartData.length}
          </div>
        </div>
      </div>
    </div>
  );
}
