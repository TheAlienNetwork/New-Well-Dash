import React, { useRef, useEffect, useState } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Legend, Area, ComposedChart,
  AreaChart 
} from 'recharts';
import { Activity, ArrowUpDown, BarChart3, BarChart, Clock, Download, Zap, Mail } from 'lucide-react';
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

  // Format data for Recharts - properly process the gamma data
  const chartData = React.useMemo(() => {
    if (gammaData.length === 0) return [];
    
    // Create a proper data array for the chart
    const formattedData = gammaData
      .map(point => ({
        depth: Number(point.depth),
        gamma: Number(point.value),
        // Adding a unique key to each point to avoid React key conflicts
        id: `gamma-${point.id}-${point.depth}`
      }))
      .sort((a, b) => a.depth - b.depth);
    
    // Determine display range - either show all data or the last 200ft
    const shouldTruncate = formattedData.length > 200;
    const maxDepth = Math.max(...formattedData.map(p => p.depth));
    const displayWindow = shouldTruncate ? 200 : 50; // Use 200ft window for large datasets, 50ft for smaller ones
    
    // Filter data for display - dynamically adjust based on data size
    return formattedData.filter(point => {
      if (formattedData.length <= 10) return true; // Always show all data for small datasets
      return point.depth >= maxDepth - displayWindow;
    });
  }, [gammaData]);

  return (
    <div className="premium-card h-full flex flex-col w-full">
      <div className="p-4 flex justify-between items-center border-b border-gray-700/30 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
        <h2 className="font-heading text-lg font-semibold flex items-center text-white">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
          <span>Gamma Plot</span>
        </h2>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportPDF}
            className="px-3 py-1.5 rounded-md text-xs text-blue-300 hover:bg-blue-900/40 transition-all duration-300 flex items-center border border-blue-500/30 shadow-inner shadow-blue-500/5 backdrop-blur-sm"
          >
            <Download className="h-3 w-3 mr-1.5" />
            Export PDF
          </button>
          <div className="glass-card text-xs px-3 py-1.5 rounded-md flex items-center border border-emerald-500/40 shadow-glow-green">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
            <span className="text-emerald-400 font-semibold">LIVE</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row flex-1 w-full">
        {/* Side metrics panel - takes up less space on large screens */}
        <div className="flex flex-row md:flex-col md:w-60 p-4 gap-3">
          <div className="glass-card p-4 flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
            <span className="text-xs text-gray-300 font-semibold flex items-center">
              <Activity className="h-3 w-3 mr-1.5 text-emerald-400" />
              CURRENT API
            </span>
            <div className="font-semibold text-2xl value-green mt-1.5">{currentGamma?.toFixed(1) || 'N/A'}</div>
            <span className="text-xs text-gray-400">gAPI</span>
          </div>
          
          <div className="glass-card p-4 flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50"></div>
            <span className="text-xs text-gray-300 font-semibold flex items-center">
              <BarChart className="h-3 w-3 mr-1.5 text-blue-400" />
              AVG API
            </span>
            <div className="font-semibold text-lg value-blue mt-1.5">{avgGamma?.toFixed(1) || 'N/A'}</div>
            <span className="text-xs text-gray-400">gAPI</span>
          </div>
          
          <div className="glass-card p-4 flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50"></div>
            <span className="text-xs text-gray-300 font-semibold flex items-center">
              <ArrowUpDown className="h-3 w-3 mr-1.5 text-purple-400" />
              RANGE
            </span>
            <div className="font-semibold text-sm value-purple mt-1.5">{depthRange || 'N/A'}</div>
            <span className="text-xs text-gray-400">ft MD</span>
          </div>
          
          <div className="glass-card p-4 flex-1 md:flex hidden flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-500/50"></div>
            <div className="text-xs text-gray-300 flex items-center">
              <Clock className="h-3 w-3 mr-1.5 text-gray-400" />
              LAST UPDATE
            </div>
            <div className="text-xs text-gray-300 mt-1.5">{lastUpdate || 'N/A'}</div>
          </div>
        </div>
        
        {/* Gamma plot - takes up full remaining width */}
        <div className="flex-1 p-4">
          <div className="neumorph-card p-4 h-full">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart 
                data={chartData} 
                margin={{ top: 10, right: 20, left: 70, bottom: 20 }}
                key={chartKey}
                layout="vertical" // This makes depth go on the Y-axis
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.3)" />
                <YAxis 
                  dataKey="depth"
                  type="number"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  stroke="#6b7280"
                  tick={{ fill: '#e5e7eb' }}
                  label={{ value: 'Depth (ft)', angle: -90, position: 'insideLeft', fill: '#e5e7eb', fontSize: 12, offset: -55 }}
                  reversed={true} // Important: This makes depth increase downward
                  width={70}
                />
                <XAxis 
                  dataKey="gamma" 
                  type="number"
                  domain={[0, 'dataMax + 20']}
                  stroke="#6b7280"
                  tick={{ fill: '#e5e7eb' }}
                  tickFormatter={(value) => value.toFixed(0)}
                  label={{ value: 'Gamma (gAPI)', position: 'insideBottom', fill: '#e5e7eb', fontSize: 12, offset: 0 }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.85)', 
                    border: '1px solid #4b5563', 
                    borderRadius: '8px',
                    color: '#e5e7eb',
                    boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(12px)'
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
                  cursor={{ stroke: '#4b5563', strokeWidth: 1 }}
                />
                
                {/* Line for gamma values with improved visibility */}
                <Line 
                  type="monotone"
                  dataKey="gamma"
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff', fill: '#10b981' }}
                  isAnimationActive={false}
                  dot={{ stroke: '#10b981', strokeWidth: 1, r: 4, fill: '#10b981' }}
                />
                
                {/* Area for the gamma values */}
                <Area 
                  type="monotone"
                  dataKey="gamma"
                  stroke="none"
                  fill="url(#gammaGradient)" 
                  fillOpacity={0.4}
                  isAnimationActive={false}
                />
                
                <Legend 
                  verticalAlign="bottom" 
                  wrapperStyle={{ paddingTop: '15px', color: '#e5e7eb' }}
                  formatter={() => 'Gamma Readings (gAPI)'}
                />
                
                {/* Reference line for significant gamma value */}
                <ReferenceLine x={60} stroke="rgba(16, 185, 129, 0.5)" strokeDasharray="3 3" 
                  label={{ 
                    value: 'Threshold', 
                    fill: '#10b981', 
                    fontSize: 11, 
                    position: 'top' 
                  }} 
                />
                
                {/* Gradient definition for area fill - horizontal direction now */}
                <defs>
                  <linearGradient id="gammaGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-gray-700/30 flex justify-between items-center glass-footer">
        <div className="flex items-center">
          <Zap className="h-4 w-4 text-blue-400 mr-2" />
          <span className="text-xs text-gray-300 font-semibold">Real-time Gamma Analysis</span>
        </div>
        <div className="flex items-center space-x-5">
          {/* Email toggle */}
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-blue-400" />
            <Label htmlFor="include-gamma-email" className="text-xs text-gray-200">Email</Label>
            <Switch
              id="include-gamma-email"
              checked={includeInEmail}
              onCheckedChange={handleToggleEmail}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          <div className="text-xs glass-badge px-2 py-1">
            SAMPLES: {chartData.length}
          </div>
        </div>
      </div>
    </div>
  );
}
