import React, { useState, useEffect } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Mail, ArrowLeftRight, Compass, Ruler, MoveHorizontal, Waypoints } from 'lucide-react';

export default function CurveData() {
  const { curveData, updateCurveData, projections } = useSurveyContext();
  
  const [formData, setFormData] = useState({
    motorYield: 0,
    dogLegNeeded: 0,
    projectedInc: 0,
    projectedAz: 0,
    slideSeen: 0,
    slideAhead: 0,
    includeInEmail: true
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
        includeInEmail: curveData.includeInEmail
      });
    }
  }, [curveData]);

  useEffect(() => {
    if (projections) {
      setFormData(prev => ({
        ...prev,
        projectedInc: projections.projectedInc,
        projectedAz: projections.projectedAz
      }));
    }
  }, [projections]);

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
    <div className="futuristic-container flex flex-col h-full">
      <div className="p-3 flex justify-between items-center border-b border-cyan-500/20">
        <h2 className="font-heading text-lg font-semibold flex items-center text-navy-100">
          <Waypoints className="h-5 w-5 mr-2 text-cyan-400" />
          <span>CURVE DATA</span>
        </h2>
        <div className="flex items-center space-x-2 bg-navy-900/50 px-3 py-1 rounded-full border border-cyan-500/20">
          <span className="text-xs mr-2 text-navy-200 font-mono">INCLUDE IN EMAIL</span>
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
            className="data-[state=checked]:bg-cyan-500"
          />
          <Mail className={`h-4 w-4 ${formData.includeInEmail ? 'text-cyan-400' : 'text-navy-400'}`} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          <div className="space-y-3">
            <div className="glass-panel p-3 group transition-all hover:border-cyan-500/40 border border-cyan-500/20">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-navy-200 flex items-center font-mono">
                  <MoveHorizontal className="h-3 w-3 mr-1 text-cyan-400" />
                  MOTOR YIELD 
                </Label>
                <span className="text-[10px] text-cyan-400 font-mono">°/100ft</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="motorYield"
                  value={formData.motorYield}
                  onChange={handleInputChange}
                  className="font-mono glow-text-green text-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
            <div className="glass-panel p-3 group transition-all hover:border-cyan-500/40 border border-cyan-500/20">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-navy-200 flex items-center font-mono">
                  <ArrowLeftRight className="h-3 w-3 mr-1 text-cyan-400" />
                  DOG LEG NEEDED
                </Label>
                <span className="text-[10px] text-cyan-400 font-mono">°/100ft</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="dogLegNeeded"
                  value={formData.dogLegNeeded}
                  onChange={handleInputChange}
                  className="font-mono glow-text-green text-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="glass-panel p-3 group transition-all hover:border-cyan-500/40 border border-cyan-500/20">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-navy-200 flex items-center font-mono">
                  <ArrowLeftRight className="h-3 w-3 mr-1 text-cyan-400" />
                  PROJECTED INC
                </Label>
                <span className="text-[10px] text-cyan-400 font-mono">°</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="projectedInc"
                  value={formData.projectedInc}
                  onChange={handleInputChange}
                  className="font-mono glow-text text-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
            <div className="glass-panel p-3 group transition-all hover:border-cyan-500/40 border border-cyan-500/20">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-navy-200 flex items-center font-mono">
                  <Compass className="h-3 w-3 mr-1 text-cyan-400" />
                  PROJECTED AZ
                </Label>
                <span className="text-[10px] text-cyan-400 font-mono">°</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="projectedAz"
                  value={formData.projectedAz}
                  onChange={handleInputChange}
                  className="font-mono glow-text text-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="glass-panel p-3 group transition-all hover:border-cyan-500/40 border border-cyan-500/20">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-navy-200 flex items-center font-mono">
                  <Ruler className="h-3 w-3 mr-1 text-cyan-400" />
                  SLIDE SEEN
                </Label>
                <span className="text-[10px] text-cyan-400 font-mono">ft</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="slideSeen"
                  value={formData.slideSeen}
                  onChange={handleInputChange}
                  className="font-mono glow-text-orange text-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
            <div className="glass-panel p-3 group transition-all hover:border-cyan-500/40 border border-cyan-500/20">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs text-navy-200 flex items-center font-mono">
                  <Ruler className="h-3 w-3 mr-1 text-cyan-400" />
                  SLIDE AHEAD
                </Label>
                <span className="text-[10px] text-cyan-400 font-mono">ft</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  step="0.01"
                  name="slideAhead"
                  value={formData.slideAhead}
                  onChange={handleInputChange}
                  className="font-mono glow-text-orange text-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button 
            type="submit" 
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 hover:text-cyan-300 transition-all px-5 py-2 rounded-md text-xs font-mono flex items-center shadow-lg hover:shadow-cyan-900/20"
          >
            <Save className="h-4 w-4 mr-2" />
            SAVE CHANGES
          </Button>
        </div>
      </form>

      <div className="p-2 border-t border-cyan-500/20 flex justify-between items-center bg-navy-950/60 text-xs font-mono">
        <div className="flex items-center">
          <Waypoints className="h-4 w-4 text-cyan-400 mr-2" />
          <span className="text-navy-200">DIRECTIONAL DATA</span>
        </div>
        <div className="text-cyan-400/70">
          LAST UPDATE: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
