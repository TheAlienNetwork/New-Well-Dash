import React, { useState, useEffect } from 'react';
import SurveyTable from '@/components/dashboard/SurveyTable';
import DirectionalCurveData from '@/components/dashboard/DirectionalCurveData';
import TargetPosition from '@/components/dashboard/TargetPosition';
import WellboreTrajectory from '@/components/dashboard/WellboreTrajectory';
import DirectionalAnalytics from '@/components/dashboard/DirectionalAnalytics';
import { useSurveyContext } from '@/context/SurveyContext';
import { useWellContext } from '@/context/WellContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateSlideRequirements, projectValues } from '@/lib/survey-calculations';
import { Survey } from '@shared/schema';
import { Share2, Save, Calculator, Compass, ArrowRight } from 'lucide-react';
import SurveyModal from '@/components/dashboard/SurveyModal';

export default function DirectionalDrilling() {
  const { 
    surveys, 
    curveData, 
    latestSurvey, 
    showSurveyModal, 
    setShowSurveyModal,
    modalSurvey, 
    setModalSurvey,
    updateCurveData,
    projections
  } = useSurveyContext();
  
  const { wellInfo } = useWellContext();
  
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState({
    motorYield: 0,
    dogLegNeeded: 0,
    projectedInc: 0,
    projectedAz: 0,
    slideSeen: 0,
    slideAhead: 0,
    includeInEmail: true
  });
  
  const [nudgeData, setNudgeData] = useState({
    targetInc: 0,
    targetAz: 0,
    distanceToNext: 100,
    toolface: 0
  });
  
  const [nudgeResults, setNudgeResults] = useState<any>(null);

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
      
      if (latestSurvey) {
        setNudgeData(prev => ({
          ...prev,
          targetInc: Number(latestSurvey.inc) + 1, // Default to current inc + 1
          targetAz: Number(latestSurvey.azi),
          toolface: Number(latestSurvey.toolFace || 0)
        }));
      }
    }
  }, [curveData, latestSurvey]);
  
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
  
  const handleNudgeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNudgeData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
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
  
  const calculateNudge = () => {
    if (!latestSurvey) return;
    
    const results = calculateSlideRequirements(
      Number(latestSurvey.inc),
      nudgeData.targetInc,
      Number(latestSurvey.azi),
      nudgeData.targetAz,
      formData.motorYield,
      nudgeData.distanceToNext
    );
    
    setNudgeResults(results);
    
    // Update curve data with new dogleg needed and slide ahead
    if (curveData) {
      updateCurveData({
        id: curveData.id,
        dogLegNeeded: String(results.dogLegNeeded),
        slideAhead: String(results.slideAhead)
      });
    }
  };

  const handleAddSurvey = () => {
    setModalSurvey(null);
    setModalMode('add');
    setShowSurveyModal(true);
  };

  const handleEditSurvey = (survey: Survey) => {
    setModalSurvey(survey);
    setModalMode('edit');
    setShowSurveyModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Target Position, Curve Data, and Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Target Position */}
        <div>
          <TargetPosition 
            projections={projections} 
            verticalPosition={projections?.verticalPosition} 
            horizontalPosition={projections?.horizontalPosition} 
          />
        </div>
        
        {/* Directional Curve Data */}
        <div className="md:col-span-2">
          <DirectionalCurveData />
        </div>
      </div>
      
      {/* Middle Row: Wellbore Trajectory & Directional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3D Wellbore Trajectory */}
        <div>
          <WellboreTrajectory />
        </div>
        
        {/* AI Directional Analytics */}
        <div>
          <DirectionalAnalytics />
        </div>
      </div>
      
      {/* Directional Driller Controls */}
      <div className="premium-card overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 flex justify-between items-center border-b border-gray-700/30">
          <h2 className="font-heading text-lg font-semibold flex items-center text-white">
            <Compass className="h-5 w-5 mr-2 text-cyan-400" />
            Directional Driller Controls
          </h2>
          <div>
            <Badge variant="outline" className="bg-gray-800/50 text-cyan-300 border-cyan-500/30 flex items-center">
              <div className="h-2 w-2 rounded-full bg-cyan-400 pulse-effect mr-2"></div>
              <span>Directional Mode</span>
            </Badge>
          </div>
        </div>
        
        <Tabs defaultValue="curve" className="p-4">
          <TabsList className="bg-neutral-background mb-4">
            <TabsTrigger value="curve">Curve Data</TabsTrigger>
            <TabsTrigger value="nudge">Nudge Projection</TabsTrigger>
          </TabsList>
          
          {/* Curve Data Tab */}
          <TabsContent value="curve">
            <DirectionalCurveData />
          </TabsContent>
          
          {/* Nudge Projection Tab */}
          <TabsContent value="nudge">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Form */}
              <div className="space-y-4">
                <Card className="bg-neutral-background border-neutral-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Calculator className="h-4 w-4 mr-2 text-primary" />
                      Nudge Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-400">Current Inc (°)</Label>
                          <div className="bg-neutral-surface border-neutral-border px-3 py-2 rounded text-sm font-mono">
                            {latestSurvey ? Number(latestSurvey.inc).toFixed(2) : '0.00'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Current Az (°)</Label>
                          <div className="bg-neutral-surface border-neutral-border px-3 py-2 rounded text-sm font-mono">
                            {latestSurvey ? Number(latestSurvey.azi).toFixed(2) : '0.00'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-400">Target Inc (°)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            name="targetInc"
                            value={nudgeData.targetInc}
                            onChange={handleNudgeInputChange}
                            className="bg-neutral-surface border-neutral-border"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Target Az (°)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            name="targetAz"
                            value={nudgeData.targetAz}
                            onChange={handleNudgeInputChange}
                            className="bg-neutral-surface border-neutral-border"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-400">Distance to Next Survey (ft)</Label>
                          <Input 
                            type="number" 
                            step="1"
                            name="distanceToNext"
                            value={nudgeData.distanceToNext}
                            onChange={handleNudgeInputChange}
                            className="bg-neutral-surface border-neutral-border"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Motor Yield (°/100ft)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={formData.motorYield}
                            disabled
                            className="bg-neutral-surface/50 border-neutral-border"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="button" 
                          onClick={calculateNudge}
                          className="w-full bg-secondary-purple hover:bg-secondary-purple/80"
                        >
                          Calculate Nudge Requirements
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Results Display */}
              <div>
                <Card className="bg-neutral-background border-neutral-border h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Nudge Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {nudgeResults ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-neutral-surface p-3 rounded-md">
                            <div className="text-xs text-gray-400 mb-1">Dogleg Severity Required</div>
                            <div className="text-xl font-heading font-bold text-primary">
                              {nudgeResults.dogLegNeeded.toFixed(2)}<span className="text-xs text-gray-400 ml-1">°/100ft</span>
                            </div>
                          </div>
                          <div className="bg-neutral-surface p-3 rounded-md">
                            <div className="text-xs text-gray-400 mb-1">Toolface Orientation</div>
                            <div className="text-xl font-heading font-bold text-primary">
                              {nudgeResults.toolFace.toFixed(1)}<span className="text-xs text-gray-400 ml-1">°</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-neutral-surface p-3 rounded-md">
                          <div className="text-xs text-gray-400 mb-1">Slide Distance Required</div>
                          <div className="text-2xl font-heading font-bold text-secondary-purple">
                            {nudgeResults.slideAhead.toFixed(1)}<span className="text-xs text-gray-400 ml-1">ft</span>
                          </div>
                          <div className="mt-1 text-xs">
                            {nudgeResults.slideAhead > 40 ? (
                              <span className="text-accent-orange">Long slide required - consider intermediate survey</span>
                            ) : nudgeResults.slideAhead < 10 ? (
                              <span className="text-accent-green">Short slide - high precision required</span>
                            ) : (
                              <span className="text-accent-green">Optimal slide length</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-primary/10 p-3 rounded-md">
                          <div className="flex items-center">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                              <Compass className="h-3 w-3 text-primary" />
                            </div>
                            <div className="text-sm font-medium">Directional Instructions</div>
                          </div>
                          <div className="mt-2 text-sm">
                            <p>
                              Drill ahead in rotary mode for {(nudgeData.distanceToNext - nudgeResults.slideAhead).toFixed(1)} ft, 
                              then slide for {nudgeResults.slideAhead.toFixed(1)} ft with toolface at {nudgeResults.toolFace.toFixed(1)}°.
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => {
                            // Update curve data with calculated values
                            if (curveData) {
                              updateCurveData({
                                id: curveData.id,
                                dogLegNeeded: String(nudgeResults.dogLegNeeded),
                                slideAhead: String(nudgeResults.slideAhead),
                                projectedInc: String(nudgeData.targetInc),
                                projectedAz: String(nudgeData.targetAz)
                              });
                            }
                          }}
                          className="w-full"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save to Curve Data
                        </Button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-70">
                        <Calculator className="h-12 w-12 text-primary/50 mb-3" />
                        <h3 className="text-gray-400 mb-1">No Calculations Yet</h3>
                        <p className="text-xs text-gray-500">
                          Enter target parameters and calculate to see nudge requirements
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Survey Table Section */}
      <SurveyTable
        onAddSurvey={handleAddSurvey}
        onEditSurvey={handleEditSurvey}
      />
      
      {/* Survey Modal */}
      <SurveyModal
        open={showSurveyModal}
        onOpenChange={setShowSurveyModal}
        survey={modalSurvey}
        mode={modalMode}
      />

      <style>{`
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
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}


