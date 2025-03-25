import React, { useState, useEffect } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Download } from 'lucide-react';
import { 
  Info 
} from 'lucide-react';

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
        ...formData,
        id: curveData.id,
        wellId: curveData.wellId
      });
    }
  };

  return (
    <div className="bg-neutral-surface rounded-lg overflow-hidden futuristic-border">
      <div className="p-4 bg-primary-dark flex justify-between items-center">
        <h2 className="font-heading text-lg font-semibold flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Curve Data
        </h2>
        <div className="flex items-center">
          <span className="text-sm mr-2">Include in Email</span>
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
      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="bg-neutral-background rounded-md p-3">
              <Label className="block text-xs text-gray-400 mb-1">Motor Yield (°/100ft)</Label>
              <Input 
                type="number" 
                step="0.01"
                name="motorYield"
                value={formData.motorYield}
                onChange={handleInputChange}
                className="bg-neutral-surface border border-neutral-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono"
              />
            </div>
            <div className="bg-neutral-background rounded-md p-3">
              <Label className="block text-xs text-gray-400 mb-1">Dog Leg Needed (°/100ft)</Label>
              <Input 
                type="number" 
                step="0.01"
                name="dogLegNeeded"
                value={formData.dogLegNeeded}
                onChange={handleInputChange}
                className="bg-neutral-surface border border-neutral-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="bg-neutral-background rounded-md p-3">
              <Label className="block text-xs text-gray-400 mb-1">Projected Inc (°)</Label>
              <Input 
                type="number" 
                step="0.01"
                name="projectedInc"
                value={formData.projectedInc}
                onChange={handleInputChange}
                className="bg-neutral-surface border border-neutral-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono"
              />
            </div>
            <div className="bg-neutral-background rounded-md p-3">
              <Label className="block text-xs text-gray-400 mb-1">Projected Az (°)</Label>
              <Input 
                type="number" 
                step="0.01"
                name="projectedAz"
                value={formData.projectedAz}
                onChange={handleInputChange}
                className="bg-neutral-surface border border-neutral-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="bg-neutral-background rounded-md p-3">
              <Label className="block text-xs text-gray-400 mb-1">Slide Seen (ft)</Label>
              <Input 
                type="number" 
                step="0.01"
                name="slideSeen"
                value={formData.slideSeen}
                onChange={handleInputChange}
                className="bg-neutral-surface border border-neutral-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono"
              />
            </div>
            <div className="bg-neutral-background rounded-md p-3">
              <Label className="block text-xs text-gray-400 mb-1">Slide Ahead (ft)</Label>
              <Input 
                type="number" 
                step="0.01"
                name="slideAhead"
                value={formData.slideAhead}
                onChange={handleInputChange}
                className="bg-neutral-surface border border-neutral-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button 
            type="submit" 
            className="bg-primary hover:bg-blue-600 transition-colors px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </form>

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
      `}</style>
    </div>
  );
}
