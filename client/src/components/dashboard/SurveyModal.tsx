import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSurveyContext } from '@/context/SurveyContext';
import { useWellContext } from '@/context/WellContext'; // Added import for useWellContext
import { Survey } from '@shared/schema';
import { Activity, Ruler, Compass, ArrowUpCircle, Crosshair, Save, XCircle } from 'lucide-react';

interface SurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey: Survey | null;
  mode: 'add' | 'edit';
}

export default function SurveyModal({ open, onOpenChange, survey, mode }: SurveyModalProps) {
  const { surveys, addSurvey, updateSurvey } = useSurveyContext();
  const { wellInfo } = useWellContext(); // Added to access wellInfo

  const [formData, setFormData] = useState({
    md: '',
    inc: '',
    azi: '',
    bitDepth: '',
    gTotal: '',
    bTotal: '',
    dipAngle: '',
    toolFace: ''
  });

  useEffect(() => {
    if (survey && mode === 'edit') {
      setFormData({
        md: survey.md?.toString() || '',
        inc: survey.inc?.toString() || '',
        azi: survey.azi?.toString() || '',
        bitDepth: survey.bitDepth?.toString() || '',
        gTotal: survey.gTotal?.toString() || '',
        bTotal: survey.bTotal?.toString() || '',
        dipAngle: survey.dipAngle?.toString() || '',
        toolFace: survey.toolFace?.toString() || ''
      });
    } else {
      setFormData({
        md: '',
        inc: '',
        azi: '',
        bitDepth: '',
        gTotal: '',
        bTotal: '',
        dipAngle: '',
        toolFace: ''
      });
    }
  }, [survey, mode]);

  useEffect(() => {
    // Calculate survey depth when bit depth changes
    if (formData.bitDepth && wellInfo?.sensorOffset) {
      const calculatedDepth = Number(formData.bitDepth) - Number(wellInfo.sensorOffset);
      setFormData(prev => ({
        ...prev,
        md: calculatedDepth.toFixed(2)
      }));
    }
  }, [formData.bitDepth, wellInfo?.sensorOffset]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get values needed for calculations
    const md = Number(formData.md);
    const inc = Number(formData.inc);
    const azi = Number(formData.azi);

    // Get the last survey for calculations
    const prevSurvey = surveys[surveys.length - 1];

    let surveyData: any = {
      ...formData,
      wellId: wellInfo?.id || 1,
      md: md.toString(),
      inc: inc.toString(),
      azi: azi.toString()
    };

    if (prevSurvey) {
      // Calculate all values using the previous survey as reference
      const prevMd = Number(prevSurvey.md);
      const prevInc = Number(prevSurvey.inc);
      const prevAzi = Number(prevSurvey.azi);
      const prevTvd = Number(prevSurvey.tvd);
      const prevNS = Number(prevSurvey.northSouth);
      const prevEW = Number(prevSurvey.eastWest);

      const proposedDirection = Number(wellInfo?.proposedDirection || 0);

      // Calculate new values
      const tvd = calculateTVD(md, inc, prevMd, prevTvd);
      const { northSouth, isNorth } = calculateNorthSouth(md, inc, azi, prevMd, prevNS, prevSurvey.isNorth);
      const { eastWest, isEast } = calculateEastWest(md, inc, azi, prevMd, prevEW, prevSurvey.isEast);
      const vs = calculateVS(northSouth, eastWest, proposedDirection);
      const dls = calculateDLS(inc, azi, prevInc, prevAzi, md, prevMd);

      // Add calculated values to survey data
      surveyData = {
        ...surveyData,
        tvd: tvd.toFixed(2),
        northSouth: northSouth.toFixed(2),
        isNorth,
        eastWest: eastWest.toFixed(2),
        isEast,
        vs: vs.toFixed(2),
        dls: dls.toFixed(2)
      };
    } else {
      // First survey - calculate initial values
      const tvd = md * Math.cos(inc * Math.PI / 180);
      const northSouth = md * Math.sin(inc * Math.PI / 180) * Math.cos(azi * Math.PI / 180);
      const eastWest = md * Math.sin(inc * Math.PI / 180) * Math.sin(azi * Math.PI / 180);
      const vs = calculateVS(Math.abs(northSouth), Math.abs(eastWest), Number(wellInfo?.proposedDirection || 0));

      surveyData = {
        ...surveyData,
        tvd: tvd.toFixed(2),
        northSouth: Math.abs(northSouth).toFixed(2),
        isNorth: northSouth >= 0,
        eastWest: Math.abs(eastWest).toFixed(2),
        isEast: eastWest >= 0,
        vs: vs.toFixed(2),
        dls: "0.00"
      };
    }

    try {
      if (mode === 'edit' && survey) {
        await updateSurvey(survey.id!, surveyData);
      } else {
        await addSurvey(surveyData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving survey:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-neutral-surface border-neutral-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-heading">
            <Activity className="h-5 w-5 text-primary" />
            {mode === 'add' ? 'Add New Survey' : 'Edit Survey'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-4 rounded-lg border border-neutral-border/30">
            <div className="text-sm font-medium text-primary/80 mb-3 flex items-center">
              <Ruler className="h-4 w-4 mr-2" />
              Depth Measurements
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bitDepth" className="text-xs text-gray-400">Bit Depth (ft)</Label>
                <Input
                  id="bitDepth"
                  value={formData.bitDepth}
                  onChange={(e) => setFormData(prev => ({ ...prev, bitDepth: e.target.value }))}
                  className="bg-neutral-background border-neutral-border"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="md" className="text-xs text-gray-400">Measured Depth (ft)</Label>
                <Input
                  id="md"
                  value={formData.md}
                  onChange={(e) => setFormData(prev => ({ ...prev, md: e.target.value }))}
                  className="bg-neutral-background border-neutral-border"
                  placeholder="0.00"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">
                  Calculated from Bit Depth - Sensor Offset ({wellInfo?.sensorOffset || 0} ft)
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg border border-neutral-border/30">
            <div className="text-sm font-medium text-secondary-purple/80 mb-3 flex items-center">
              <Compass className="h-4 w-4 mr-2" />
              Directional Data
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inc" className="text-xs text-gray-400">Inclination (°)</Label>
                <Input
                  id="inc"
                  value={formData.inc}
                  onChange={(e) => setFormData(prev => ({ ...prev, inc: e.target.value }))}
                  className="bg-neutral-background border-neutral-border"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="azi" className="text-xs text-gray-400">Azimuth (°)</Label>
                <Input
                  id="azi"
                  value={formData.azi}
                  onChange={(e) => setFormData(prev => ({ ...prev, azi: e.target.value }))}
                  className="bg-neutral-background border-neutral-border"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg border border-neutral-border/30">
            <div className="text-sm font-medium text-accent-green/80 mb-3 flex items-center">
              <Crosshair className="h-4 w-4 mr-2" />
              Tool Face & Angles
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="toolFace" className="text-xs text-gray-400">Tool Face (°)</Label>
                <Input
                  id="toolFace"
                  value={formData.toolFace}
                  onChange={(e) => setFormData(prev => ({ ...prev, toolFace: e.target.value }))}
                  className="bg-neutral-background border-neutral-border"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dipAngle" className="text-xs text-gray-400">Dip Angle (°)</Label>
                <Input
                  id="dipAngle"
                  value={formData.dipAngle}
                  onChange={(e) => setFormData(prev => ({ ...prev, dipAngle: e.target.value }))}
                  className="bg-neutral-background border-neutral-border"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg border border-neutral-border/30">
            <div className="text-sm font-medium text-accent-orange/80 mb-3 flex items-center">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Quality Control
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gTotal" className="text-xs text-gray-400">G Total</Label>
                <Input
                  id="gTotal"
                  value={formData.gTotal}
                  onChange={(e) => setFormData(prev => ({ ...prev, gTotal: e.target.value }))}
                  className="bg-neutral-background border-neutral-border"
                  placeholder="0.000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bTotal" className="text-xs text-gray-400">B Total</Label>
                <Input
                  id="bTotal"
                  value={formData.bTotal}
                  onChange={(e) => setFormData(prev => ({ ...prev, bTotal: e.target.value }))}
                  className="bg-neutral-background border-neutral-border"
                  placeholder="0.000"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="glass-button-outline"
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>
            <Button 
              type="submit"
              className="glass-button-blue"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {mode === 'add' ? 'Add Survey' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function calculateTVD(md: number, inc: number, prevMd: number, prevTvd: number): number {
  const deltaDepth = md - prevMd;
  const avgInc = inc * Math.PI / 180;
  const deltaTvd = deltaDepth * Math.cos(avgInc);
  return prevTvd + deltaTvd;
}

function calculateNorthSouth(md: number, inc: number, azi: number, prevMd: number, prevNS: number, prevIsNorth: boolean): { northSouth: number; isNorth: boolean } {
  const deltaDepth = md - prevMd;
  const avgInc = inc * Math.PI / 180;
  const avgAzi = azi * Math.PI / 180;
  const deltaNS = deltaDepth * Math.sin(avgInc) * Math.cos(avgAzi);
  const newNS = prevNS + (prevIsNorth ? deltaNS : -deltaNS);
  return { northSouth: Math.abs(newNS), isNorth: newNS >= 0 };
}

function calculateEastWest(md: number, inc: number, azi: number, prevMd: number, prevEW: number, prevIsEast: boolean): { eastWest: number; isEast: boolean } {
  const deltaDepth = md - prevMd;
  const avgInc = inc * Math.PI / 180;
  const avgAzi = azi * Math.PI / 180;
  const deltaEW = deltaDepth * Math.sin(avgInc) * Math.sin(avgAzi);
  const newEW = prevEW + (prevIsEast ? deltaEW : -deltaEW);
  return { eastWest: Math.abs(newEW), isEast: newEW >= 0 };
}

function calculateVS(northSouth: number, eastWest: number, proposedDirection: number): number {
  const angle = proposedDirection * Math.PI / 180;
  return Math.abs(northSouth * Math.cos(angle) + eastWest * Math.sin(angle));
}

function calculateDLS(inc: number, azi: number, prevInc: number, prevAzi: number, md: number, prevMd: number): number {
  const deltaDepth = md - prevMd;
  if (deltaDepth === 0) return 0;
  
  const incRad1 = prevInc * Math.PI / 180;
  const incRad2 = inc * Math.PI / 180;
  const aziRad1 = prevAzi * Math.PI / 180;
  const aziRad2 = azi * Math.PI / 180;
  
  const dogleg = Math.acos(
    Math.cos(incRad1) * Math.cos(incRad2) +
    Math.sin(incRad1) * Math.sin(incRad2) * Math.cos(aziRad2 - aziRad1)
  );
  
  return (dogleg * 180 / Math.PI) / (deltaDepth / 100);
}