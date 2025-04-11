import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useSurveyContext } from '@/context/SurveyContext';
import { Settings2, Mail, BarChart4, Compass, Ruler, Activity, Wrench, Sliders } from 'lucide-react';

export default function CurveData() {
  const { curveData, updateCurveData } = useSurveyContext();
  const [formData, setFormData] = useState({
    motorYield: 0,
    dogLegNeeded: 0,
    projectedInc: 0,
    projectedAz: 0,
    slideSeen: 0,
    slideAhead: 0,
    includeInEmail: false
  });
  
  useEffect(() => {
    if (curveData) {
      setFormData({
        motorYield: Number(curveData.motorYield) || 0,
        dogLegNeeded: Number(curveData.dogLegNeeded) || 0,
        projectedInc: Number(curveData.projectedInc) || 0,
        projectedAz: Number(curveData.projectedAz) || 0,
        slideSeen: Number(curveData.slideSeen) || 0,
        slideAhead: Number(curveData.slideAhead) || 0,
        includeInEmail: curveData.includeInEmail || false
      });
    }
  }, [curveData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    const newFormData = {
      ...formData,
      includeInEmail: checked
    };
    setFormData(newFormData);
    
    if (updateCurveData) {
      updateCurveData({
        id: curveData?.id || 1,
        wellId: curveData?.wellId || 1,
        motorYield: String(newFormData.motorYield),
        dogLegNeeded: String(newFormData.dogLegNeeded),
        projectedInc: String(newFormData.projectedInc),
        projectedAz: String(newFormData.projectedAz),
        slideSeen: String(newFormData.slideSeen),
        slideAhead: String(newFormData.slideAhead),
        includeInEmail: newFormData.includeInEmail
      });
    }
  };

  const handleBlur = () => {
    if (updateCurveData) {
      updateCurveData({
        id: curveData?.id || 1,
        wellId: curveData?.wellId || 1,
        motorYield: String(formData.motorYield),
        dogLegNeeded: String(formData.dogLegNeeded),
        projectedInc: String(formData.projectedInc),
        projectedAz: String(formData.projectedAz),
        slideSeen: String(formData.slideSeen),
        slideAhead: String(formData.slideAhead),
        includeInEmail: formData.includeInEmail
      });
    }
  };

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 flex justify-between items-center border-b border-gray-700/30">
        <h2 className="font-heading text-lg font-semibold flex items-center text-white">
          <Sliders className="h-5 w-5 mr-2 text-cyan-400" />
          Directional Calculations
        </h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-gray-800/50 text-cyan-300 border-cyan-500/30 flex items-center">
            <Ruler className="h-3 w-3 mr-1.5" />
            <span>Motor: {formData.motorYield.toFixed(2)}°</span>
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Directional Tool Parameters */}
          <div className="space-y-4">
            <div className="glass-panel p-3 rounded border border-gray-700/30">
              <div className="flex items-center mb-2 pb-2 border-b border-gray-700/20">
                <div className="h-7 w-7 flex items-center justify-center bg-cyan-900/30 rounded-full text-cyan-400 mr-2">
                  <Wrench className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-medium text-gray-200">Tool Parameters</h3>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="motorYield" className="text-xs text-gray-400">Motor Yield (°/100ft)</Label>
                  <Input
                    id="motorYield"  
                    name="motorYield"
                    type="number"
                    value={formData.motorYield}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="h-8 bg-gray-800/40 border-gray-700/50 text-sm font-mono"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="dogLegNeeded" className="text-xs text-gray-400">Dog Leg Needed (°/100ft)</Label>
                  <Input
                    id="dogLegNeeded"
                    name="dogLegNeeded" 
                    type="number"
                    value={formData.dogLegNeeded}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="h-8 bg-gray-800/40 border-gray-700/50 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Column 2: Projection Values */}
          <div className="space-y-4">
            <div className="glass-panel p-3 rounded border border-gray-700/30">
              <div className="flex items-center mb-2 pb-2 border-b border-gray-700/20">
                <div className="h-7 w-7 flex items-center justify-center bg-blue-900/30 rounded-full text-blue-400 mr-2">
                  <Compass className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-medium text-gray-200">Projected Survey</h3>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="projectedInc" className="text-xs text-gray-400">Projected Inc (°)</Label>
                  <Input
                    id="projectedInc"
                    name="projectedInc"
                    type="number"
                    value={formData.projectedInc}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="h-8 bg-gray-800/40 border-gray-700/50 text-sm font-mono"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="projectedAz" className="text-xs text-gray-400">Projected Az (°)</Label>
                  <Input
                    id="projectedAz"
                    name="projectedAz"
                    type="number"
                    value={formData.projectedAz}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="h-8 bg-gray-800/40 border-gray-700/50 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Column 3: Slide Requirements */}
          <div className="space-y-4">
            <div className="glass-panel p-3 rounded border border-gray-700/30">
              <div className="flex items-center mb-2 pb-2 border-b border-gray-700/20">
                <div className="h-7 w-7 flex items-center justify-center bg-green-900/30 rounded-full text-green-400 mr-2">
                  <Activity className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-medium text-gray-200">Slide Requirements</h3>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="slideSeen" className="text-xs text-gray-400">Slide Seen (ft)</Label>
                  <Input
                    id="slideSeen"
                    name="slideSeen"
                    type="number"
                    value={formData.slideSeen}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="h-8 bg-gray-800/40 border-gray-700/50 text-sm font-mono"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="slideAhead" className="text-xs text-gray-400">Slide Ahead (ft)</Label>
                  <Input
                    id="slideAhead"
                    name="slideAhead"
                    type="number"
                    value={formData.slideAhead}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="h-8 bg-gray-800/40 border-gray-700/50 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer section with email toggle */}
        <div className="glass-panel p-3 rounded border border-gray-700/30 flex items-center">
          <div className="h-7 w-7 flex items-center justify-center bg-blue-900/30 rounded-full text-blue-400 mr-3">
            <Mail className="h-4 w-4" />
          </div>
          <Label htmlFor="include-in-email" className="flex-1 text-sm text-gray-300">Include curve data in emails</Label>
          <Switch
            id="include-in-email"
            checked={formData.includeInEmail}
            onCheckedChange={handleSwitchChange}
            className="data-[state=checked]:bg-cyan-600"
          />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .glass-panel {
          background: rgba(17, 24, 39, 0.4);
          backdrop-filter: blur(4px);
        }
        `
      }}></style>
    </div>
  );
}