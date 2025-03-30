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
  const { addSurvey, updateSurvey } = useSurveyContext();
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
    const surveyData = {
      ...formData,
      wellId: 1 // This needs a proper wellId source.  The original used wellInfo.id.
    };

    if (mode === 'edit' && survey) {
      await updateSurvey(survey.id!, surveyData);
    } else {
      await addSurvey(surveyData);
    }
    onOpenChange(false);
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