import React, { useState, useEffect } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { useWellContext } from '@/context/WellContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Share2, Save } from 'lucide-react';
import { Survey, InsertSurvey } from '@shared/schema';
import { calculateSurveyValues, generateSurveyAnalysis } from '@/lib/survey-calculations';

interface SurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey: Survey | null;
  mode: 'add' | 'edit';
}

export default function SurveyModal({ open, onOpenChange, survey, mode }: SurveyModalProps) {
  const { addSurvey, updateSurvey, surveys } = useSurveyContext();
  const { wellInfo } = useWellContext();

  if (!open) return null;
  
  const [formData, setFormData] = useState({
    bitDepth: 0,
    inc: 0,
    azi: 0,
    toolFace: 0,
    gTotal: 0.999,
    bTotal: 1.002,
    dipAngle: 67.52,
    md: 0,
    tvd: 0,
    northSouth: 0,
    isNorth: true,
    eastWest: 0,
    isEast: true,
    vs: 0,
    dls: 0
  });
  
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  useEffect(() => {
    if (survey && mode === 'edit') {
      setFormData({
        bitDepth: Number(survey.bitDepth),
        inc: Number(survey.inc),
        azi: Number(survey.azi),
        toolFace: Number(survey.toolFace || 0),
        gTotal: Number(survey.gTotal || 0.999),
        bTotal: Number(survey.bTotal || 1.002),
        dipAngle: Number(survey.dipAngle || 67.52),
        md: Number(survey.md),
        tvd: Number(survey.tvd),
        northSouth: Number(survey.northSouth),
        isNorth: survey.isNorth,
        eastWest: Number(survey.eastWest),
        isEast: survey.isEast,
        vs: Number(survey.vs),
        dls: Number(survey.dls)
      });
      
      // Calculate AI analysis for this survey
      const analysis = generateSurveyAnalysis(survey, surveys.filter(s => s.id !== survey.id));
      setAiAnalysis(analysis);
    } else {
      // For add mode, set default values
      const lastSurvey = surveys.length > 0 ? surveys[surveys.length - 1] : null;
      
      const defaultMd = lastSurvey ? Number(lastSurvey.md) + 100 : 1000;
      const defaultBitDepth = defaultMd + (wellInfo?.sensorOffset || 100);
      
      setFormData({
        bitDepth: defaultBitDepth,
        inc: lastSurvey ? Number(lastSurvey.inc) : 0,
        azi: lastSurvey ? Number(lastSurvey.azi) : 0,
        toolFace: lastSurvey ? Number(lastSurvey.toolFace || 0) : 0,
        gTotal: 0.999,
        bTotal: 1.002,
        dipAngle: 67.52,
        md: defaultMd,
        tvd: lastSurvey ? Number(lastSurvey.tvd) : defaultMd,
        northSouth: lastSurvey ? Number(lastSurvey.northSouth) : 0,
        isNorth: lastSurvey ? lastSurvey.isNorth : true,
        eastWest: lastSurvey ? Number(lastSurvey.eastWest) : 0,
        isEast: lastSurvey ? lastSurvey.isEast : true,
        vs: lastSurvey ? Number(lastSurvey.vs) : 0,
        dls: 0
      });
      
      setAiAnalysis(null);
    }
  }, [survey, mode, surveys, wellInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const numValue = type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
    
    // Update MD based on bit depth and sensor offset
    if (name === 'bitDepth' && wellInfo) {
      const sensorOffset = wellInfo.sensorOffset || 100;
      const newMd = parseFloat(value) - sensorOffset;
      
      setFormData(prev => ({
        ...prev,
        md: newMd
      }));
      
      // If we have a previous survey, we can calculate the rest
      const lastSurvey = surveys.length > 0 ? surveys[surveys.length - 1] : null;
      
      if (lastSurvey) {
        const calculated = calculateSurveyValues(
          {
            md: newMd,
            inc: prev.inc,
            azi: prev.azi
          },
          {
            md: Number(lastSurvey.md),
            inc: Number(lastSurvey.inc),
            azi: Number(lastSurvey.azi),
            tvd: Number(lastSurvey.tvd),
            northSouth: Number(lastSurvey.northSouth),
            isNorth: lastSurvey.isNorth,
            eastWest: Number(lastSurvey.eastWest),
            isEast: lastSurvey.isEast
          },
          Number(wellInfo.proposedDirection || 0)
        );
        
        setFormData(prev => ({
          ...prev,
          ...calculated
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wellInfo) return;
    
    const surveyData: InsertSurvey = {
      md: formData.md,
      inc: formData.inc,
      azi: formData.azi,
      tvd: formData.tvd,
      northSouth: formData.northSouth,
      isNorth: formData.isNorth,
      eastWest: formData.eastWest,
      isEast: formData.isEast,
      vs: formData.vs,
      dls: formData.dls,
      bitDepth: formData.bitDepth,
      gTotal: formData.gTotal,
      bTotal: formData.bTotal,
      dipAngle: formData.dipAngle,
      toolFace: formData.toolFace,
      wellId: wellInfo.id
    };
    
    if (mode === 'add') {
      await addSurvey(surveyData);
    } else if (mode === 'edit' && survey) {
      await updateSurvey(survey.id, surveyData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-surface rounded-lg max-w-3xl mx-4 futuristic-border">
        <DialogHeader className="p-4 bg-primary-dark">
          <div className="flex justify-between items-center">
            <DialogTitle className="font-heading text-lg font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              {mode === 'add' ? 'New Survey Data' : 'Edit Survey Data'}
            </DialogTitle>
            <button 
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Survey Values */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Editable Survey Values</h3>
              <div className="space-y-4">
                <div className="bg-neutral-background rounded-md p-3">
                  <Label className="block text-xs text-gray-400 mb-2">Bit Depth (ft)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    name="bitDepth"
                    value={formData.bitDepth}
                    onChange={handleInputChange}
                    className="bg-neutral-surface border border-neutral-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono"
                  />
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Sensor offset: {wellInfo?.sensorOffset?.toFixed(2) || '0.00'} ft
                  </div>
                </div>
                <div className="bg-neutral-background rounded-md p-3">
                  <Label className="block text-xs text-gray-400 mb-2">Inclination (°)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    name="inc"
                    value={formData.inc}
                    onChange={handleInputChange}
                    className="bg-neutral-surface border border-neutral-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono"
                  />
                </div>
                <div className="bg-neutral-background rounded-md p-3">
                  <Label className="block text-xs text-gray-400 mb-2">Azimuth (°)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    name="azi"
                    value={formData.azi}
                    onChange={handleInputChange}
                    className="bg-neutral-surface border border-neutral-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-background rounded-md p-3">
                    <Label className="block text-xs text-gray-400 mb-2">MD (ft)</Label>
                    <div className="font-mono bg-neutral-surface/50 px-3 py-2 rounded border border-neutral-border">
                      {formData.md.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-neutral-background rounded-md p-3">
                    <Label className="block text-xs text-gray-400 mb-2">Survey Tool Face (°)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      name="toolFace"
                      value={formData.toolFace}
                      onChange={handleInputChange}
                      className="bg-neutral-surface border border-neutral-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated & AI Values */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Calculated & AI Verified Values</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-neutral-background rounded-md p-3">
                    <Label className="block text-xs text-gray-400 mb-2">G Total</Label>
                    <div className="font-mono bg-neutral-surface/50 px-3 py-2 rounded border border-neutral-border">
                      {formData.gTotal.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-neutral-background rounded-md p-3">
                    <Label className="block text-xs text-gray-400 mb-2">B Total</Label>
                    <div className="font-mono bg-neutral-surface/50 px-3 py-2 rounded border border-neutral-border">
                      {formData.bTotal.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-neutral-background rounded-md p-3">
                    <Label className="block text-xs text-gray-400 mb-2">Dip Angle (°)</Label>
                    <div className="font-mono bg-neutral-surface/50 px-3 py-2 rounded border border-neutral-border">
                      {formData.dipAngle.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-background rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-6 w-6 flex items-center justify-center bg-secondary-purple/20 rounded-full text-secondary-purple mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M13 3a1 1 0 00-1 1v8a1 1 0 00.4.8l3 2a1 1 0 001.2-1.6L14 12.187V4a1 1 0 00-1-1z" />
                        <path d="M10 10a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" />
                        <path fillRule="evenodd" d="M5.33 4.233A1 1 0 104.07 5.54L5.906 18.44a1 1 0 00.866.856l2 .35a1 1 0 00.77-.262l5-4.5a1 1 0 00-1.334-1.49L9 17.118V10.75L5.33 4.233z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-medium">AI Survey Analysis</h4>
                    <div className="ml-auto">
                      {aiAnalysis && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-status-${aiAnalysis.status.toLowerCase()} text-white`}>
                          {aiAnalysis.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">QC Status:</span>
                      <span className="font-medium">{aiAnalysis?.status || 'Analyzing...'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dogleg Severity:</span>
                      <span className="font-medium">{aiAnalysis?.doglegs || formData.dls.toFixed(2) + '°/100ft'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Survey Trend:</span>
                      <span className="font-medium">{aiAnalysis?.trend || 'Analyzing...'}</span>
                    </div>
                    <div className="flex justify-between text-status-info">
                      <span>Recommendation:</span>
                      <span>{aiAnalysis?.recommendation || 'Continue as planned'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-background rounded-md p-3">
                    <Label className="block text-xs text-gray-400 mb-2">Calculated TVD (ft)</Label>
                    <div className="font-mono bg-neutral-surface/50 px-3 py-2 rounded border border-neutral-border">
                      {formData.tvd.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-neutral-background rounded-md p-3">
                    <Label className="block text-xs text-gray-400 mb-2">VS (ft)</Label>
                    <div className="font-mono bg-neutral-surface/50 px-3 py-2 rounded border border-neutral-border">
                      {formData.vs.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-neutral-background hover:bg-neutral-border transition-colors"
            >
              Cancel
            </Button>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="bg-primary-dark hover:bg-primary-dark/80 border border-primary transition-colors flex items-center"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share Survey
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-blue-600 transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Survey
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

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
    </Dialog>
  );
}
