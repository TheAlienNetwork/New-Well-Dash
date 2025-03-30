import React, { useState, useEffect } from 'react';
import { useWellContext } from '@/context/WellContext';
import { WellInfo as WellInfoType } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Save, 
  Droplet, 
  Compass, 
  Map, 
  PenTool, 
  ArrowUpRight
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';

export default function WellInfo() {
  const { wellInfo, updateWellInfo, loading } = useWellContext();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<WellInfoType>>({
    wellName: '',
    rigName: '',
    sensorOffset: '0',
    proposedDirection: '0'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refresh form data when wellInfo changes
  useEffect(() => {
    if (wellInfo) {
      setFormData({
        wellName: wellInfo.wellName,
        rigName: wellInfo.rigName,
        sensorOffset: wellInfo.sensorOffset,
        proposedDirection: wellInfo.proposedDirection
      });
    }
  }, [wellInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value // Store all values as strings
    }));
  };

  const refreshWellInfo = async () => {
    try {
      const response = await apiRequest('GET', '/api/well-info', undefined);
      const data = await response.json();
      console.log('Refreshed well info:', data);
      // The WellContext will handle updates through the WebSocket
    } catch (err) {
      console.error('Error refreshing well info:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Make sure all numeric values are handled as strings
      const dataToSubmit = {
        ...formData,
        sensorOffset: String(formData.sensorOffset),
        proposedDirection: formData.proposedDirection !== undefined 
          ? String(formData.proposedDirection) 
          : null
      };
      
      console.log('Submitting well info update:', dataToSubmit);
      
      // Directly use the API to ensure the request goes through
      if (wellInfo) {
        const response = await apiRequest('PATCH', `/api/well-info/${wellInfo.id}`, dataToSubmit);
        const updatedData = await response.json();
        console.log('Well info update response:', updatedData);
        
        // Force a refresh of data
        await refreshWellInfo();
      }
      
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Well information updated successfully'
      });
    } catch (error) {
      console.error('Error updating well info:', error);
      toast({
        title: 'Error',
        description: 'Failed to update well information',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-surface border-neutral-border">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center font-heading text-lg">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Well Information
              </CardTitle>
              <CardDescription>
                View and edit well details
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "destructive" : "default"}
            >
              {isEditing ? "Cancel" : "Edit Info"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="mt-2">
            <TabsList className="bg-neutral-background mb-6">
              <TabsTrigger value="details">Well Details</TabsTrigger>
              <TabsTrigger value="parameters">Survey Parameters</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="bg-neutral-background rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Droplet className="h-5 w-5 text-primary mr-2" />
                        <Label htmlFor="wellName" className="text-sm font-medium">Well Name</Label>
                      </div>
                      {isEditing ? (
                        <Input
                          id="wellName"
                          name="wellName"
                          value={formData.wellName}
                          onChange={handleInputChange}
                          placeholder="e.g. DEEP HORIZON #42"
                          className="bg-neutral-surface border-neutral-border"
                        />
                      ) : (
                        <div className="text-xl font-heading">{wellInfo?.wellName || 'Not specified'}</div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        The official designation for the well
                      </p>
                    </div>
                    
                    <div className="bg-neutral-background rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Map className="h-5 w-5 text-primary mr-2" />
                        <Label htmlFor="rigName" className="text-sm font-medium">Rig Name</Label>
                      </div>
                      {isEditing ? (
                        <Input
                          id="rigName"
                          name="rigName"
                          value={formData.rigName}
                          onChange={handleInputChange}
                          placeholder="e.g. PLATFORM ALPHA"
                          className="bg-neutral-surface border-neutral-border"
                        />
                      ) : (
                        <div className="text-xl font-heading">{wellInfo?.rigName || 'Not specified'}</div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        The drilling rig name or identifier
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-neutral-background rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">Well Status</h3>
                        <span className="text-xs bg-accent-green/20 text-accent-green px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Current Depth:</span>
                          <span className="font-mono">
                            {wellInfo && (' 1459.92 ft')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Last Survey:</span>
                          <span className="font-mono">
                            {wellInfo && ('May 18, 2023 14:32')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Phase:</span>
                          <span>Build Section</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-background rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <PenTool className="h-5 w-5 text-secondary-purple mr-2" />
                        <h3 className="text-sm font-medium">Well Notes</h3>
                      </div>
                      <div className="text-sm">
                        <p>Currently drilling build section. Target inclination is 85° at 2350ft MD.</p>
                        <p className="mt-2">Challenging formation expected between 1750-1850ft.</p>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-background rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <ArrowUpRight className="h-5 w-5 text-accent-orange mr-2" />
                        <h3 className="text-sm font-medium">Drilling Metrics</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-400">Avg. ROP</div>
                          <div className="text-lg font-mono">54.2 <span className="text-xs">ft/hr</span></div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Avg. WOB</div>
                          <div className="text-lg font-mono">25.4 <span className="text-xs">klbs</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving} className="relative">
                      {isSaving ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="parameters">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="bg-neutral-background rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <ArrowUpRight className="h-5 w-5 text-primary mr-2" />
                        <Label htmlFor="sensorOffset" className="text-sm font-medium">MWD Sensor Offset (ft)</Label>
                      </div>
                      {isEditing ? (
                        <Input
                          id="sensorOffset"
                          name="sensorOffset"
                          type="number"
                          step="0.01"
                          value={String(formData.sensorOffset)}
                          onChange={handleInputChange}
                          placeholder="e.g. 100"
                          className="bg-neutral-surface border-neutral-border"
                        />
                      ) : (
                        <div className="text-xl font-mono">{wellInfo?.sensorOffset ? Number(wellInfo.sensorOffset).toFixed(2) : 'Not specified'}</div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Distance from bit to MWD sensors, used to calculate survey depth from bit depth
                      </p>
                      
                      <div className="mt-4 bg-neutral-surface p-3 border border-neutral-border rounded-md">
                        <div className="text-xs text-gray-400 mb-1">Example Calculation:</div>
                        <div className="text-sm">
                          Bit Depth (1559.92 ft) - Sensor Offset ({wellInfo?.sensorOffset ? Number(wellInfo.sensorOffset).toFixed(2) : '100.00'} ft) = 
                          <span className="font-mono ml-1">1459.92 ft</span> Survey Depth
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-neutral-background rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Compass className="h-5 w-5 text-primary mr-2" />
                        <Label htmlFor="proposedDirection" className="text-sm font-medium">Proposed Direction (°)</Label>
                      </div>
                      {isEditing ? (
                        <Input
                          id="proposedDirection"
                          name="proposedDirection"
                          type="number"
                          step="0.01"
                          value={String(formData.proposedDirection)}
                          onChange={handleInputChange}
                          placeholder="e.g. 175"
                          className="bg-neutral-surface border-neutral-border"
                        />
                      ) : (
                        <div className="text-xl font-mono">{wellInfo?.proposedDirection ? Number(wellInfo.proposedDirection).toFixed(2) : 'Not specified'}</div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Target azimuth for the well, used to calculate vertical section
                      </p>
                      
                      <div className="mt-4 p-3 border border-neutral-border rounded-md bg-primary/5">
                        <div className="flex items-center mb-1">
                          <Compass className="h-4 w-4 text-primary mr-1" />
                          <div className="text-xs font-medium">Direction Reference</div>
                        </div>
                        <div className="text-xs">
                          <div>0° = North</div>
                          <div>90° = East</div>
                          <div>180° = South</div>
                          <div>270° = West</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving} className="relative">
                      {isSaving ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Parameters
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        `
      }}></style>
    </div>
  );
}
