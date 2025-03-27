import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BarChart, CheckCircle2, TrendingUp, AlertCircle, Settings, Activity, LineChart, BarChart3, Braces, GanttChart, Compass, BarChartHorizontal } from 'lucide-react';
import { useAIPrediction } from '@/context/AIPredictionContext';
import { useSurveyContext } from '@/context/SurveyContext';
import { LithologyData } from '@/lib/ai-prediction-models';

export default function AIOptimization() {
  const { 
    predictionResults, 
    targetFormation, 
    targetTVD, 
    targetInclination, 
    targetAzimuth,
    isLoading, 
    isAdvancedModel,
    lithologyData,
    mudType,
    bitType,
    setTargetFormation,
    setTargetTVD,
    setTargetInclination,
    setTargetAzimuth,
    setIsAdvancedModel,
    setLithologyData,
    setMudType,
    setBitType,
    runPredictionModel
  } = useAIPrediction();
  
  const { surveys, curveData } = useSurveyContext();
  
  // Local state for lithology editor
  const [newLithology, setNewLithology] = useState<Partial<LithologyData>>({
    depth: 0,
    formation: '',
    description: '',
    hardness: 5
  });
  
  // Handle running prediction model
  const handleRunPrediction = () => {
    runPredictionModel();
  };
  
  // Handle adding lithology data
  const handleAddLithology = () => {
    if (
      newLithology.depth !== undefined && 
      newLithology.formation && 
      newLithology.description && 
      newLithology.hardness !== undefined
    ) {
      const lithologyItem: LithologyData = {
        depth: newLithology.depth,
        formation: newLithology.formation,
        description: newLithology.description,
        hardness: newLithology.hardness
      };
      
      setLithologyData([...lithologyData, lithologyItem]);
      
      // Reset the form
      setNewLithology({
        depth: 0,
        formation: '',
        description: '',
        hardness: 5
      });
    }
  };
  
  // Handle deleting lithology data
  const handleDeleteLithology = (index: number) => {
    const updatedLithology = [...lithologyData];
    updatedLithology.splice(index, 1);
    setLithologyData(updatedLithology);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading mb-1">AI Drilling Optimization</h1>
          <p className="text-muted-foreground">Advanced predictive models for optimal drilling parameters</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="advanced-mode">Advanced AI Model</Label>
            <Switch 
              id="advanced-mode" 
              checked={isAdvancedModel} 
              onCheckedChange={setIsAdvancedModel}
            />
          </div>
          <Button 
            onClick={handleRunPrediction} 
            disabled={isLoading || surveys.length === 0}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          >
            {isLoading ? 'Processing...' : 'Run AI Prediction'}
          </Button>
        </div>
      </div>
      
      {isLoading && (
        <Card className="p-6 animate-pulse">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Processing AI Prediction Model</h3>
            <Progress value={isAdvancedModel ? 50 : 75} className="h-2" />
            <p className="text-center text-muted-foreground">
              {isAdvancedModel 
                ? 'Running advanced AI model with machine learning analysis...' 
                : 'Calculating basic optimization recommendations...'}
            </p>
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Inputs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                Target Parameters
              </CardTitle>
              <CardDescription>Set target parameters for well trajectory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-formation">Target Formation</Label>
                <Input 
                  id="target-formation" 
                  value={targetFormation}
                  onChange={(e) => setTargetFormation(e.target.value)}
                  placeholder="Target Formation"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-tvd">Target TVD (ft)</Label>
                <Input 
                  id="target-tvd" 
                  type="number"
                  value={targetTVD || ''}
                  onChange={(e) => setTargetTVD(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Target True Vertical Depth"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-inc">Target Inclination (°)</Label>
                <Input 
                  id="target-inc" 
                  type="number"
                  value={targetInclination || ''}
                  onChange={(e) => setTargetInclination(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Target Inclination"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-azimuth">Target Azimuth (°)</Label>
                <Input 
                  id="target-azimuth" 
                  type="number"
                  value={targetAzimuth || ''}
                  onChange={(e) => setTargetAzimuth(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Target Azimuth"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Formation & Equipment
              </CardTitle>
              <CardDescription>Drilling system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mud-type">Mud Type</Label>
                <select 
                  id="mud-type"
                  value={mudType}
                  onChange={(e) => setMudType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="Water-Based Mud">Water-Based Mud</option>
                  <option value="Oil-Based Mud">Oil-Based Mud</option>
                  <option value="Synthetic-Based Mud">Synthetic-Based Mud</option>
                  <option value="KCl Polymer Mud">KCl Polymer Mud</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bit-type">Bit Type</Label>
                <select 
                  id="bit-type"
                  value={bitType}
                  onChange={(e) => setBitType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="PDC Bit">PDC Bit</option>
                  <option value="Tricone Bit">Tricone Bit</option>
                  <option value="Diamond Bit">Diamond Bit</option>
                  <option value="Hybrid Bit">Hybrid Bit</option>
                </select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Braces className="h-5 w-5 mr-2 text-primary" />
                Lithology Data
              </CardTitle>
              <CardDescription>Add formation data for better predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lith-depth">Depth (ft)</Label>
                  <Input 
                    id="lith-depth" 
                    type="number"
                    value={newLithology.depth || ''}
                    onChange={(e) => setNewLithology({...newLithology, depth: Number(e.target.value)})}
                    placeholder="Formation Depth"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lith-formation">Formation</Label>
                  <Input 
                    id="lith-formation" 
                    value={newLithology.formation || ''}
                    onChange={(e) => setNewLithology({...newLithology, formation: e.target.value})}
                    placeholder="Formation Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lith-description">Description</Label>
                  <Input 
                    id="lith-description" 
                    value={newLithology.description || ''}
                    onChange={(e) => setNewLithology({...newLithology, description: e.target.value})}
                    placeholder="Formation Description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lith-hardness">Hardness (1-10)</Label>
                  <Input 
                    id="lith-hardness" 
                    type="number"
                    min={1}
                    max={10}
                    value={newLithology.hardness || ''}
                    onChange={(e) => setNewLithology({...newLithology, hardness: Number(e.target.value)})}
                    placeholder="Formation Hardness"
                  />
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleAddLithology}
                  disabled={!newLithology.formation || !newLithology.description}
                >
                  Add Lithology Data
                </Button>
                
                {lithologyData.length > 0 && (
                  <div className="mt-4 border rounded-md">
                    <div className="p-2 bg-muted rounded-t-md font-medium">
                      Lithology Entries ({lithologyData.length})
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {lithologyData.map((item, index) => (
                        <div key={index} className="p-2 border-t flex justify-between items-center">
                          <div>
                            <div className="font-medium">{item.formation} at {item.depth}ft</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleDeleteLithology(index)}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column: Results */}
        <div className="col-span-2 space-y-6">
          {!predictionResults && !isLoading && (
            <Card className="h-[400px] flex flex-col items-center justify-center">
              <BarChart className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Prediction Results</h3>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Configure your target parameters and click "Run AI Prediction" to generate drilling optimization recommendations.
              </p>
            </Card>
          )}
          
          {predictionResults && (
            <Tabs defaultValue="drilling" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="drilling">Drilling</TabsTrigger>
                <TabsTrigger value="vibration">Vibration</TabsTrigger>
                <TabsTrigger value="wellbore">Wellbore</TabsTrigger>
                <TabsTrigger value="trajectory">Trajectory</TabsTrigger>
              </TabsList>
              
              {/* Drilling Recommendations Tab */}
              <TabsContent value="drilling" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                      Drilling Recommendations
                    </CardTitle>
                    <CardDescription>
                      Optimization model: <span className="font-medium">{predictionResults.drillingRecommendations.optimizationType}</span>
                      {' '} | Confidence: <span className="font-medium">{Math.round(predictionResults.drillingRecommendations.confidenceScore * 100)}%</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Recommended ROP</div>
                        <div className="text-xl font-medium">{predictionResults.drillingRecommendations.recommendedROP.toFixed(1)} ft/hr</div>
                      </div>
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Recommended WOB</div>
                        <div className="text-xl font-medium">{predictionResults.drillingRecommendations.recommendedWOB.toFixed(1)} klbs</div>
                      </div>
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Recommended RPM</div>
                        <div className="text-xl font-medium">{predictionResults.drillingRecommendations.recommendedRPM.toFixed(1)} rpm</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Slide/Rotate Ratio</div>
                        <div className="text-xl font-medium">
                          {(predictionResults.drillingRecommendations.slideRotateRatio * 100).toFixed(0)}%
                          /{(100 - predictionResults.drillingRecommendations.slideRotateRatio * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Slide: {predictionResults.drillingRecommendations.slidingLength.toFixed(1)} ft | 
                          Rotate: {predictionResults.drillingRecommendations.rotatingLength.toFixed(1)} ft
                        </div>
                      </div>
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Recommended Toolface</div>
                        <div className="text-xl font-medium">{predictionResults.drillingRecommendations.toolface.toFixed(1)}°</div>
                        <div className="flex items-center mt-1">
                          <Compass className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {
                              (predictionResults.drillingRecommendations.toolface >= 337.5 || predictionResults.drillingRecommendations.toolface < 22.5) ? 'High Side' :
                              (predictionResults.drillingRecommendations.toolface >= 22.5 && predictionResults.drillingRecommendations.toolface < 67.5) ? 'High Right' :
                              (predictionResults.drillingRecommendations.toolface >= 67.5 && predictionResults.drillingRecommendations.toolface < 112.5) ? 'Right' :
                              (predictionResults.drillingRecommendations.toolface >= 112.5 && predictionResults.drillingRecommendations.toolface < 157.5) ? 'Low Right' :
                              (predictionResults.drillingRecommendations.toolface >= 157.5 && predictionResults.drillingRecommendations.toolface < 202.5) ? 'Low Side' :
                              (predictionResults.drillingRecommendations.toolface >= 202.5 && predictionResults.drillingRecommendations.toolface < 247.5) ? 'Low Left' :
                              (predictionResults.drillingRecommendations.toolface >= 247.5 && predictionResults.drillingRecommendations.toolface < 292.5) ? 'Left' :
                              'High Left'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Dogleg Severity</div>
                        <div className="text-xl font-medium">{predictionResults.drillingRecommendations.doglegSeverity.toFixed(2)}°/100ft</div>
                      </div>
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Expected Torque</div>
                        <div className="text-xl font-medium">{(predictionResults.drillingRecommendations.expectedTorque / 1000).toFixed(1)} kft-lbs</div>
                      </div>
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Expected Drag</div>
                        <div className="text-xl font-medium">{(predictionResults.drillingRecommendations.expectedDrag / 1000).toFixed(1)} klbs</div>
                      </div>
                    </div>
                    
                    {predictionResults.drillingRecommendations.warningFlags.length > 0 && (
                      <div className="bg-muted rounded-md p-3 space-y-1 mb-4">
                        <div className="font-medium flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1 text-yellow-500" />
                          Warnings
                        </div>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {predictionResults.drillingRecommendations.warningFlags.map((flag, i) => (
                            <li key={i}>{flag.replace(/_/g, ' ')}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="bg-card border rounded-md p-3">
                      <div className="text-sm font-medium">Explanation</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {predictionResults.drillingRecommendations.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Vibration Prediction Tab */}
              <TabsContent value="vibration" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-primary" />
                      Vibration Predictions
                    </CardTitle>
                    <CardDescription>
                      Predicted vibration risks and mitigation strategies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Axial Vibration Risk</div>
                        <div className="flex items-center">
                          <div 
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold mr-2
                              ${predictionResults.vibrationPredictions.axialVibrationRisk > 0.6 
                                ? 'bg-red-500' 
                                : predictionResults.vibrationPredictions.axialVibrationRisk > 0.3 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'}`}
                          >
                            {Math.round(predictionResults.vibrationPredictions.axialVibrationRisk * 100)}%
                          </div>
                          <div>
                            <div className="font-medium">
                              {predictionResults.vibrationPredictions.axialVibrationRisk > 0.6 
                                ? 'High' 
                                : predictionResults.vibrationPredictions.axialVibrationRisk > 0.3 
                                  ? 'Moderate' 
                                  : 'Low'}
                            </div>
                            <div className="text-xs text-muted-foreground">Bit bounce risk</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Lateral Vibration Risk</div>
                        <div className="flex items-center">
                          <div 
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold mr-2
                              ${predictionResults.vibrationPredictions.lateralVibrationRisk > 0.6 
                                ? 'bg-red-500' 
                                : predictionResults.vibrationPredictions.lateralVibrationRisk > 0.3 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'}`}
                          >
                            {Math.round(predictionResults.vibrationPredictions.lateralVibrationRisk * 100)}%
                          </div>
                          <div>
                            <div className="font-medium">
                              {predictionResults.vibrationPredictions.lateralVibrationRisk > 0.6 
                                ? 'High' 
                                : predictionResults.vibrationPredictions.lateralVibrationRisk > 0.3 
                                  ? 'Moderate' 
                                  : 'Low'}
                            </div>
                            <div className="text-xs text-muted-foreground">BHA whirl risk</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Torsional Vibration Risk</div>
                        <div className="flex items-center">
                          <div 
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold mr-2
                              ${predictionResults.vibrationPredictions.torsionalVibrationRisk > 0.6 
                                ? 'bg-red-500' 
                                : predictionResults.vibrationPredictions.torsionalVibrationRisk > 0.3 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'}`}
                          >
                            {Math.round(predictionResults.vibrationPredictions.torsionalVibrationRisk * 100)}%
                          </div>
                          <div>
                            <div className="font-medium">
                              {predictionResults.vibrationPredictions.torsionalVibrationRisk > 0.6 
                                ? 'High' 
                                : predictionResults.vibrationPredictions.torsionalVibrationRisk > 0.3 
                                  ? 'Moderate' 
                                  : 'Low'}
                            </div>
                            <div className="text-xs text-muted-foreground">Stick-slip risk</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div className="bg-card border rounded-md p-3">
                        <div className="font-medium">Recommended Mitigations</div>
                        <ul className="mt-2 space-y-1">
                          {predictionResults.vibrationPredictions.recommendedMitigations.map((mitigation, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                              <span className="text-sm">{mitigation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-card border rounded-md p-3">
                        <div className="font-medium">Detailed Explanation</div>
                        <div className="space-y-2 mt-2">
                          <div className="text-sm">
                            <span className="font-medium">Axial: </span>
                            <span className="text-muted-foreground">{predictionResults.vibrationPredictions.explanations.axial}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Lateral: </span>
                            <span className="text-muted-foreground">{predictionResults.vibrationPredictions.explanations.lateral}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Torsional: </span>
                            <span className="text-muted-foreground">{predictionResults.vibrationPredictions.explanations.torsional}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Wellbore Stability Tab */}
              <TabsContent value="wellbore" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-primary" />
                      Wellbore Stability Analysis
                    </CardTitle>
                    <CardDescription>
                      Stability risks and recommended mud weight
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="col-span-1 bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Stability Risk</div>
                        <div className="flex items-center">
                          <div 
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold mr-2
                              ${predictionResults.wellboreStabilityPredictions.stabilityRisk > 0.6 
                                ? 'bg-red-500' 
                                : predictionResults.wellboreStabilityPredictions.stabilityRisk > 0.3 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'}`}
                          >
                            {Math.round(predictionResults.wellboreStabilityPredictions.stabilityRisk * 100)}%
                          </div>
                          <div>
                            <div className="font-medium">
                              {predictionResults.wellboreStabilityPredictions.stabilityRisk > 0.6 
                                ? 'High' 
                                : predictionResults.wellboreStabilityPredictions.stabilityRisk > 0.3 
                                  ? 'Moderate' 
                                  : 'Low'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-3 bg-card border rounded-md p-3">
                        <div className="text-sm text-muted-foreground">Mud Weight Recommendation</div>
                        <div className="flex items-center justify-between space-x-4">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Minimum</div>
                            <div className="text-xl font-medium">{predictionResults.wellboreStabilityPredictions.mudWeightRecommendation.min.toFixed(1)} ppg</div>
                          </div>
                          <Separator orientation="vertical" className="h-10" />
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Optimal</div>
                            <div className="text-xl font-medium text-primary">{predictionResults.wellboreStabilityPredictions.mudWeightRecommendation.optimal.toFixed(1)} ppg</div>
                          </div>
                          <Separator orientation="vertical" className="h-10" />
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Maximum</div>
                            <div className="text-xl font-medium">{predictionResults.wellboreStabilityPredictions.mudWeightRecommendation.max.toFixed(1)} ppg</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-card border rounded-md p-3">
                        <div className="font-medium">Potential Issues</div>
                        <ul className="mt-2 space-y-1">
                          {predictionResults.wellboreStabilityPredictions.potentialIssues.map((issue, index) => (
                            <li key={index} className="flex items-start">
                              <AlertCircle className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />
                              <span className="text-sm">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-card border rounded-md p-3">
                        <div className="font-medium">Mitigation Strategies</div>
                        <ul className="mt-2 space-y-1">
                          {predictionResults.wellboreStabilityPredictions.mitigationStrategies.map((strategy, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                              <span className="text-sm">{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Trajectory Correction Tab */}
              <TabsContent value="trajectory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GanttChart className="h-5 w-5 mr-2 text-primary" />
                      Trajectory Correction Analysis
                    </CardTitle>
                    <CardDescription>
                      {predictionResults.trajectoryCorrectionNeeded 
                        ? "Trajectory correction recommended" 
                        : "Trajectory is tracking to plan"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-card border rounded-md p-4 mb-4">
                      <div className="flex items-center">
                        {predictionResults.trajectoryCorrectionNeeded ? (
                          <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center mr-4">
                            <AlertCircle className="h-6 w-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mr-4">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium">
                            {predictionResults.trajectoryCorrectionNeeded 
                              ? "Trajectory Correction Needed" 
                              : "Trajectory On Target"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {predictionResults.trajectoryCorrectionNeeded
                              ? "The current trajectory requires correction to reach the target."
                              : "The current trajectory is on track to reach the target."}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-card border rounded-md p-3 mb-4">
                      <div className="font-medium mb-2">Recommendations</div>
                      <ul className="space-y-2">
                        {predictionResults.trajectoryCorrectionRecommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            {index === 0 ? (
                              <Compass className="h-4 w-4 mr-2 text-primary mt-0.5" />
                            ) : (
                              <BarChartHorizontal className="h-4 w-4 mr-2 text-primary mt-0.5" />
                            )}
                            <span className="text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {predictionResults.formationTopPredictions && (
                      <div className="bg-card border rounded-md p-3">
                        <div className="font-medium mb-2">Formation Top Predictions</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 font-medium">Formation</th>
                                <th className="text-left py-2 font-medium">Predicted Depth</th>
                                <th className="text-left py-2 font-medium">Confidence</th>
                              </tr>
                            </thead>
                            <tbody>
                              {predictionResults.formationTopPredictions.map((formation, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2">{formation.formation}</td>
                                  <td className="py-2">{formation.predictedDepth.toFixed(1)} ft</td>
                                  <td className="py-2">
                                    <div className="flex items-center">
                                      <div 
                                        className="w-16 bg-gray-200 rounded-full h-2.5 mr-2"
                                        style={{
                                          backgroundImage: `linear-gradient(to right, #10b981 ${formation.confidence * 100}%, transparent ${formation.confidence * 100}%)`
                                        }}
                                      ></div>
                                      {Math.round(formation.confidence * 100)}%
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          
          {predictionResults && (
            <div className="bg-neutral-surface/50 border border-neutral-border rounded-md p-4">
              <h3 className="text-sm font-medium mb-1 flex items-center">
                <Settings className="h-4 w-4 mr-1 text-muted-foreground" />
                Prediction Model Details
              </h3>
              <p className="text-xs text-muted-foreground">
                {isAdvancedModel
                  ? "Advanced AI model using machine learning analysis of offset well data and real-time parameters. Predictions incorporate historical drilling data, formation characteristics, and equipment specifications."
                  : "Basic prediction model using physics-based calculations and rule-based analysis of current survey and drilling parameters."}
                {' '}Model analyzed {surveys.length} survey points to generate these recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}