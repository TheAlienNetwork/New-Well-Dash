import React, { useState, useEffect } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, ArrowLeftRight, Compass, Ruler, MoveHorizontal, ArrowUpDown, ArrowUp, ArrowDown, ArrowRight, CornerDownRight } from 'lucide-react';

export default function DirectionalCurveData() {
  const { curveData, updateCurveData } = useSurveyContext();
  
  const [formData, setFormData] = useState({
    motorYield: 0,
    dogLegNeeded: 0,
    projectedInc: 0,
    projectedAz: 0,
    slideSeen: 0,
    slideAhead: 0,
    includeInEmail: true,
    aboveTarget: 0,
    belowTarget: 0,
    leftTarget: 0,
    rightTarget: 0
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
        includeInEmail: curveData.includeInEmail,
        // Default values for target position (these will be updated from server once we add them to the schema)
        aboveTarget: 0,
        belowTarget: 0,
        leftTarget: 0,
        rightTarget: 0
      });
    }
  }, [curveData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (curveData) {
      // Update the main curve data (we'll add the target position fields to the schema later)
      await updateCurveData({
        motorYield: String(formData.motorYield),
        dogLegNeeded: String(formData.dogLegNeeded),
        projectedInc: String(formData.projectedInc),
        projectedAz: String(formData.projectedAz),
        slideSeen: String(formData.slideSeen),
        slideAhead: String(formData.slideAhead),
        includeInEmail: formData.includeInEmail,
        id: curveData.id,
        wellId: curveData.wellId
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Position Component */}
      <div className="card rounded-lg overflow-hidden">
        <div className="p-3 bg-indigo-900/30 flex justify-between items-center border-b border-indigo-500/20">
          <h2 className="font-heading text-lg font-semibold flex items-center text-indigo-100">
            <ArrowUpDown className="h-5 w-5 mr-2 text-indigo-400" />
            Target Position
          </h2>
        </div>
        <div className="p-4 glass-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel rounded-md p-3 group transition-all hover:bg-indigo-900/10">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-indigo-300 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1 text-indigo-400" />
                  Above Target
                </Label>
                <span className="text-[10px] text-indigo-400">ft</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="aboveTarget"
                  value={formData.aboveTarget}
                  onChange={handleInputChange}
                  className="font-mono text-cyan-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
            
            <div className="glass-panel rounded-md p-3 group transition-all hover:bg-indigo-900/10">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-indigo-300 flex items-center">
                  <ArrowDown className="h-3 w-3 mr-1 text-indigo-400" />
                  Below Target
                </Label>
                <span className="text-[10px] text-indigo-400">ft</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="belowTarget"
                  value={formData.belowTarget}
                  onChange={handleInputChange}
                  className="font-mono text-cyan-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
            
            <div className="glass-panel rounded-md p-3 group transition-all hover:bg-indigo-900/10">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-indigo-300 flex items-center">
                  <CornerDownRight className="h-3 w-3 mr-1 text-indigo-400" />
                  Left of Target
                </Label>
                <span className="text-[10px] text-indigo-400">ft</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="leftTarget"
                  value={formData.leftTarget}
                  onChange={handleInputChange}
                  className="font-mono text-cyan-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
            
            <div className="glass-panel rounded-md p-3 group transition-all hover:bg-indigo-900/10">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-indigo-300 flex items-center">
                  <ArrowRight className="h-3 w-3 mr-1 text-indigo-400" />
                  Right of Target
                </Label>
                <span className="text-[10px] text-indigo-400">ft</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="rightTarget"
                  value={formData.rightTarget}
                  onChange={handleInputChange}
                  className="font-mono text-cyan-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Curve Data Component */}
      <div className="card rounded-lg overflow-hidden">
        <div className="p-3 bg-violet-900/30 flex justify-between items-center border-b border-violet-500/20">
          <h2 className="font-heading text-lg font-semibold flex items-center text-violet-100">
            <ArrowLeftRight className="h-5 w-5 mr-2 text-violet-400" />
            Curve Data
          </h2>
          <div className="flex items-center">
            <span className="text-sm mr-2 text-violet-200">Include in Email</span>
            <Switch 
              checked={formData.includeInEmail}
              onCheckedChange={(checked) => {
                setFormData(prev => ({
                  ...prev,
                  includeInEmail: checked
                }));
                if (curveData) {
                  updateCurveData({
                    id: curveData.id,
                    includeInEmail: checked
                  });
                }
              }}
            />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 glass-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="glass-panel rounded-md p-3 group transition-all hover:bg-violet-900/10">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-violet-300 flex items-center">
                    <MoveHorizontal className="h-3 w-3 mr-1 text-violet-400" />
                    Motor Yield 
                  </Label>
                  <span className="text-[10px] text-violet-400">°/100ft</span>
                </div>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01"
                    name="motorYield"
                    value={formData.motorYield}
                    onChange={handleInputChange}
                    className="font-mono text-emerald-400"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500 to-violet-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>
              <div className="glass-panel rounded-md p-3 group transition-all hover:bg-violet-900/10">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-violet-300 flex items-center">
                    <ArrowLeftRight className="h-3 w-3 mr-1 text-violet-400" />
                    Dog Leg Needed
                  </Label>
                  <span className="text-[10px] text-violet-400">°/100ft</span>
                </div>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01"
                    name="dogLegNeeded"
                    value={formData.dogLegNeeded}
                    onChange={handleInputChange}
                    className="font-mono text-emerald-400"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500 to-violet-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="glass-panel rounded-md p-3 group transition-all hover:bg-violet-900/10">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-violet-300 flex items-center">
                    <ArrowLeftRight className="h-3 w-3 mr-1 text-violet-400" />
                    Projected Inc
                  </Label>
                  <span className="text-[10px] text-violet-400">°</span>
                </div>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01"
                    name="projectedInc"
                    value={formData.projectedInc}
                    onChange={handleInputChange}
                    className="font-mono text-blue-400"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500 to-violet-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>
              <div className="glass-panel rounded-md p-3 group transition-all hover:bg-violet-900/10">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-violet-300 flex items-center">
                    <Compass className="h-3 w-3 mr-1 text-violet-400" />
                    Projected Az
                  </Label>
                  <span className="text-[10px] text-violet-400">°</span>
                </div>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01"
                    name="projectedAz"
                    value={formData.projectedAz}
                    onChange={handleInputChange}
                    className="font-mono text-blue-400"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500 to-violet-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="glass-panel rounded-md p-3 group transition-all hover:bg-violet-900/10">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-violet-300 flex items-center">
                    <Ruler className="h-3 w-3 mr-1 text-violet-400" />
                    Slide Seen
                  </Label>
                  <span className="text-[10px] text-violet-400">ft</span>
                </div>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01"
                    name="slideSeen"
                    value={formData.slideSeen}
                    onChange={handleInputChange}
                    className="font-mono text-cyan-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500 to-violet-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>
              <div className="glass-panel rounded-md p-3 group transition-all hover:bg-violet-900/10">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-violet-300 flex items-center">
                    <Ruler className="h-3 w-3 mr-1 text-violet-400" />
                    Slide Ahead
                  </Label>
                  <span className="text-[10px] text-violet-400">ft</span>
                </div>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.01"
                    name="slideAhead"
                    value={formData.slideAhead}
                    onChange={handleInputChange}
                    className="font-mono text-cyan-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500 to-violet-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-500 hover:to-violet-700 transition-all px-5 py-2 rounded-md text-sm font-medium flex items-center shadow-lg shadow-violet-900/20"
            >
              <Save className="h-4 w-4 mr-2" />
              Update MWD Values
            </Button>
          </div>
        </form>

        <style>{`
          .glass-container {
            background-color: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(2px);
            border-radius: 0.5rem;
            border: 1px solid rgba(139, 92, 246, 0.1);
          }
        `}</style>
      </div>
    </div>
  );
}