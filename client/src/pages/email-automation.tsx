import React, { useState, useEffect } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { useWellContext } from '@/context/WellContext';
import { emailService } from '@/lib/email-service';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Edit2, 
  Users, 
  Send, 
  PenTool,
  MailCheck,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { EmailDistribution, Survey } from '@shared/schema';

export default function EmailAutomation() {
  const { surveys, latestSurvey, curveData, gammaData, aiAnalysis, projections } = useSurveyContext();
  const { wellInfo } = useWellContext();
  const { toast } = useToast();
  
  const [distributions, setDistributions] = useState<EmailDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDistroDialog, setShowDistroDialog] = useState(false);
  const [showEmailPreviewDialog, setShowEmailPreviewDialog] = useState(false);
  const [currentDistro, setCurrentDistro] = useState<EmailDistribution | null>(null);
  const [emailMode, setEmailMode] = useState<'new' | 'edit'>('new');
  const [formData, setFormData] = useState({
    name: '',
    emails: ''
  });
  
  const [emailSettings, setEmailSettings] = useState({
    selectedDistro: 0,
    subject: '',
    includeCurveData: true,
    includeGammaPlot: true,
    includeAiAnalysis: true,
    additionalNote: ''
  });

  // Load distributions
  useEffect(() => {
    if (wellInfo?.id) {
      fetchDistributions(wellInfo.id);
    }
  }, [wellInfo]);

  // Set default subject when latest survey changes
  useEffect(() => {
    if (latestSurvey && wellInfo) {
      setEmailSettings(prev => ({
        ...prev,
        subject: `MWD Survey #${latestSurvey.index} - ${wellInfo.wellName} - MD ${Number(latestSurvey.md).toFixed(2)}ft`
      }));
    }
  }, [latestSurvey, wellInfo]);

  // Fetch email distributions
  const fetchDistributions = async (wellId: number) => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', `/api/email-distributions/${wellId}`, undefined);
      const data = await response.json();
      setDistributions(data);
      
      // Set the first distribution as selected if available
      if (data.length > 0) {
        setEmailSettings(prev => ({
          ...prev,
          selectedDistro: data[0].id
        }));
      }
    } catch (error) {
      console.error('Error fetching distributions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email distributions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle email settings change
  const handleEmailSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setEmailSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Open the distribution dialog for creating/editing
  const openDistroDialog = (distro?: EmailDistribution) => {
    if (distro) {
      setFormData({
        name: distro.name,
        emails: distro.emails
      });
      setCurrentDistro(distro);
      setEmailMode('edit');
    } else {
      setFormData({
        name: '',
        emails: ''
      });
      setCurrentDistro(null);
      setEmailMode('new');
    }
    setShowDistroDialog(true);
  };

  // Save distribution
  const saveDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wellInfo) return;

    try {
      if (emailMode === 'new') {
        const response = await apiRequest('POST', '/api/email-distributions', {
          ...formData,
          wellId: wellInfo.id
        });
        const newDistro = await response.json();
        setDistributions(prev => [...prev, newDistro]);
        
        toast({
          title: 'Success',
          description: 'Distribution list created successfully'
        });
      } else if (emailMode === 'edit' && currentDistro) {
        const response = await apiRequest('PATCH', `/api/email-distributions/${currentDistro.id}`, formData);
        const updatedDistro = await response.json();
        
        setDistributions(prev => 
          prev.map(d => d.id === updatedDistro.id ? updatedDistro : d)
        );
        
        toast({
          title: 'Success',
          description: 'Distribution list updated successfully'
        });
      }
      
      setShowDistroDialog(false);
    } catch (error) {
      console.error('Error saving distribution:', error);
      toast({
        title: 'Error',
        description: 'Failed to save distribution list',
        variant: 'destructive'
      });
    }
  };

  // Delete distribution
  const deleteDistribution = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/email-distributions/${id}`, undefined);
      setDistributions(prev => prev.filter(d => d.id !== id));
      
      toast({
        title: 'Success',
        description: 'Distribution list deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting distribution:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete distribution list',
        variant: 'destructive'
      });
    }
  };

  // Send email
  const sendEmail = () => {
    if (!latestSurvey || !wellInfo) {
      toast({
        title: 'Error',
        description: 'No survey data available to send',
        variant: 'destructive'
      });
      return;
    }
    
    // Find the selected distribution
    const selectedDistro = distributions.find(d => d.id === emailSettings.selectedDistro);
    
    if (!selectedDistro) {
      toast({
        title: 'Error',
        description: 'Please select a distribution list',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Create dummy gamma URL for the demo (in a real app, this would be a data URL or server path)
      const gammaImageUrl = emailSettings.includeGammaPlot ? 
        "data:image/png;base64,..." : undefined;
      
      // Prepare email data
      emailService.sendSurveyEmail(
        selectedDistro.emails,
        {
          survey: latestSurvey,
          wellName: wellInfo.wellName,
          rigName: wellInfo.rigName,
          gammaImageUrl,
          aiAnalysis: emailSettings.includeAiAnalysis ? {
            status: aiAnalysis?.status || 'Passed',
            doglegs: aiAnalysis?.doglegs || `${Number(latestSurvey.dls).toFixed(2)}°/100ft (Within limits)`,
            trend: aiAnalysis?.trend || 'Consistent with build plan',
            recommendation: aiAnalysis?.recommendation || 'Continue as planned'
          } : undefined,
          curveData: emailSettings.includeCurveData && curveData ? {
            motorYield: Number(curveData.motorYield),
            dogLegNeeded: Number(curveData.dogLegNeeded),
            projectedInc: Number(curveData.projectedInc),
            projectedAz: Number(curveData.projectedAz),
            slideSeen: Number(curveData.slideSeen),
            slideAhead: Number(curveData.slideAhead)
          } : undefined
        }
      );
      
      toast({
        title: 'Success',
        description: 'Email drafted and ready to send'
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'Failed to prepare email',
        variant: 'destructive'
      });
    }
  };

  // Show email preview
  const previewEmail = () => {
    setShowEmailPreviewDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Email Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-neutral-surface border-neutral-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center font-heading text-lg">
                <Mail className="mr-2 h-5 w-5 text-primary" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure and send survey data via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Distribution Selection */}
              <div>
                <Label htmlFor="selectedDistro" className="text-sm">Select Distribution List</Label>
                <div className="flex gap-2 mt-1">
                  <select
                    id="selectedDistro"
                    name="selectedDistro"
                    className="flex h-10 w-full rounded-md border border-neutral-border bg-neutral-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={emailSettings.selectedDistro}
                    onChange={(e) => handleEmailSettingsChange({
                      ...e,
                      target: {
                        ...e.target,
                        name: e.target.name,
                        value: parseInt(e.target.value)
                      }
                    })}
                  >
                    {distributions.map(distro => (
                      <option key={distro.id} value={distro.id}>{distro.name}</option>
                    ))}
                    {distributions.length === 0 && (
                      <option value={0}>No distributions available</option>
                    )}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openDistroDialog()}
                    className="bg-neutral-background hover:bg-neutral-border"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Subject Line */}
              <div>
                <Label htmlFor="subject" className="text-sm">Email Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={emailSettings.subject}
                  onChange={handleEmailSettingsChange}
                  className="bg-neutral-background border-neutral-border"
                />
              </div>
              
              {/* Inclusion Options */}
              <div className="space-y-3 border border-neutral-border rounded-md p-3">
                <h3 className="text-sm font-medium mb-2">Include in Email:</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCurveData" 
                    checked={emailSettings.includeCurveData}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('includeCurveData', checked as boolean)
                    }
                  />
                  <Label htmlFor="includeCurveData" className="cursor-pointer">
                    Curve Data
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeGammaPlot" 
                    checked={emailSettings.includeGammaPlot}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('includeGammaPlot', checked as boolean)
                    }
                  />
                  <Label htmlFor="includeGammaPlot" className="cursor-pointer">
                    Gamma Plot
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeAiAnalysis" 
                    checked={emailSettings.includeAiAnalysis}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('includeAiAnalysis', checked as boolean)
                    }
                  />
                  <Label htmlFor="includeAiAnalysis" className="cursor-pointer">
                    AI Analysis
                  </Label>
                </div>
              </div>
              
              {/* Additional Notes */}
              <div>
                <Label htmlFor="additionalNote" className="text-sm">Additional Notes</Label>
                <Textarea
                  id="additionalNote"
                  name="additionalNote"
                  value={emailSettings.additionalNote}
                  onChange={handleEmailSettingsChange}
                  placeholder="Add any additional information to include in the email..."
                  className="h-24 bg-neutral-background border-neutral-border"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t border-neutral-border pt-4">
              <Button 
                variant="outline" 
                onClick={previewEmail}
                className="bg-neutral-background hover:bg-neutral-border"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Preview Email
              </Button>
              <Button 
                onClick={sendEmail}
                disabled={!latestSurvey || distributions.length === 0}
                className="bg-primary hover:bg-blue-600"
              >
                <Send className="h-4 w-4 mr-2" />
                Prepare Email
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="bg-neutral-surface border-neutral-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center font-heading text-lg">
                <PenTool className="mr-2 h-5 w-5 text-primary" />
                Survey Information
              </CardTitle>
              <CardDescription>
                Latest survey data to be sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latestSurvey ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-neutral-background rounded-md">
                    <span className="text-sm text-gray-400">Survey #</span>
                    <span className="text-lg font-mono font-medium">{latestSurvey.index}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-background rounded-md">
                    <span className="text-sm text-gray-400">Measured Depth</span>
                    <span className="text-lg font-mono font-medium">{Number(latestSurvey.md).toFixed(2)} ft</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-background rounded-md">
                    <span className="text-sm text-gray-400">Inclination</span>
                    <span className="text-lg font-mono font-medium">{Number(latestSurvey.inc).toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-background rounded-md">
                    <span className="text-sm text-gray-400">Azimuth</span>
                    <span className="text-lg font-mono font-medium">{Number(latestSurvey.azi).toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-background rounded-md">
                    <span className="text-sm text-gray-400">Target Position</span>
                    <div className="text-right">
                      <div className="text-sm font-mono mb-1">
                        <span className="text-gray-400">Vertical: </span>
                        {projections?.isAbove && <span className="text-accent-green">Above Target</span>}
                        {projections?.isBelow && <span className="text-accent-red">Below Target</span>}
                      </div>
                      <div className="text-sm font-mono">
                        <span className="text-gray-400">Horizontal: </span>
                        {projections?.isLeft && <span className="text-accent-blue">Left of Target</span>}
                        {projections?.isRight && <span className="text-accent-orange">Right of Target</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-background rounded-md">
                    <span className="text-sm text-gray-400">Timestamp</span>
                    <span className="text-sm font-mono">
                      {new Date(latestSurvey.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  {aiAnalysis && (
                    <div className="p-3 bg-neutral-background/60 rounded-md flex items-center">
                      <div className={`h-3 w-3 rounded-full ${aiAnalysis.status === 'Passed' ? 'bg-accent-green' : aiAnalysis.status === 'Warning' ? 'bg-accent-orange' : 'bg-accent-red'} mr-2`}></div>
                      <span className="text-sm">{aiAnalysis.status} - {aiAnalysis.trend}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-neutral-background p-3 mb-4">
                    <MailCheck className="h-8 w-8 text-primary/50" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No Survey Data</h3>
                  <p className="text-sm text-gray-500">
                    No survey data is available to send. Add a survey first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribution Lists Section */}
      <Card className="bg-neutral-surface border-neutral-border">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center font-heading text-lg">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Distribution Lists
            </CardTitle>
            <Button
              onClick={() => openDistroDialog()}
              className="bg-primary hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading distribution lists...</div>
          ) : distributions.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center rounded-full bg-neutral-background p-3 mb-4">
                <Users className="h-8 w-8 text-primary/50" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">No Distribution Lists</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create distribution lists to send survey data via email.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-neutral-background">
                <TableRow className="hover:bg-transparent border-neutral-border">
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Email Recipients</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributions.map((distro) => (
                  <TableRow key={distro.id} className="border-neutral-border">
                    <TableCell className="font-medium">{distro.name}</TableCell>
                    <TableCell className="font-mono text-sm">{distro.emails}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDistroDialog(distro)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDistribution(distro.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-accent-red" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Distribution Dialog */}
      <Dialog open={showDistroDialog} onOpenChange={setShowDistroDialog}>
        <DialogContent className="bg-neutral-surface border-neutral-border">
          <DialogHeader>
            <DialogTitle>
              {emailMode === 'new' ? 'Create Distribution List' : 'Edit Distribution List'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveDistribution} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Operations Team"
                className="bg-neutral-background border-neutral-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emails">Email Addresses</Label>
              <Textarea
                id="emails"
                name="emails"
                value={formData.emails}
                onChange={handleFormChange}
                placeholder="ops@example.com, manager@example.com, driller@example.com"
                className="min-h-[100px] bg-neutral-background border-neutral-border"
                required
              />
              <p className="text-xs text-gray-400">
                Separate multiple email addresses with commas
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDistroDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {emailMode === 'new' ? 'Create List' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={showEmailPreviewDialog} onOpenChange={setShowEmailPreviewDialog}>
        <DialogContent className="bg-neutral-surface border-neutral-border max-w-4xl">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="border border-neutral-border rounded-md p-4 space-y-3">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Subject:</div>
                <div className="text-md font-medium">{emailSettings.subject}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-400">To:</div>
                <div className="text-sm font-mono">
                  {distributions.find(d => d.id === emailSettings.selectedDistro)?.emails || 'No distribution selected'}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Email Body:</div>
                <div className="bg-white text-gray-800 rounded-md border border-gray-300 p-3 max-h-[500px] overflow-y-auto">
                  <div className="p-4 bg-blue-800 text-white rounded-t-md">
                    <h1 className="text-xl font-bold">MWD Survey Data Report</h1>
                    <p className="text-sm">
                      {wellInfo?.wellName || 'Well Name'} | {wellInfo?.rigName || 'Rig Name'} | {new Date().toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="p-4">
                    {latestSurvey ? (
                      <>
                        <div className="mb-4">
                          <h2 className="text-lg font-bold text-blue-800 mb-2">Survey #{latestSurvey.index} - MD: {Number(latestSurvey.md).toFixed(2)} ft</h2>
                          
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-gray-100 p-2 rounded">
                              <div className="text-xs text-gray-500">Measured Depth (ft)</div>
                              <div className="font-bold">{Number(latestSurvey.md).toFixed(2)}</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded">
                              <div className="text-xs text-gray-500">Inclination (°)</div>
                              <div className="font-bold">{Number(latestSurvey.inc).toFixed(2)}</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded">
                              <div className="text-xs text-gray-500">Azimuth (°)</div>
                              <div className="font-bold">{Number(latestSurvey.azi).toFixed(2)}</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded">
                              <div className="text-xs text-gray-500">TVD (ft)</div>
                              <div className="font-bold">{Number(latestSurvey.tvd).toFixed(2)}</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded">
                              <div className="text-xs text-gray-500">N/S</div>
                              <div className="font-bold">
                                {Number(latestSurvey.northSouth).toFixed(2)} {latestSurvey.isNorth ? 'N' : 'S'}
                              </div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded">
                              <div className="text-xs text-gray-500">E/W</div>
                              <div className="font-bold">
                                {Number(latestSurvey.eastWest).toFixed(2)} {latestSurvey.isEast ? 'E' : 'W'}
                              </div>
                            </div>
                          </div>
                          
                          {emailSettings.includeAiAnalysis && (
                            <div className="bg-blue-50 p-3 rounded-md mb-4">
                              <h3 className="font-bold text-blue-800 mb-1">AI Survey Analysis</h3>
                              <div className="text-sm">
                                <div><strong>Dogleg Severity:</strong> {aiAnalysis?.doglegs || `${Number(latestSurvey.dls).toFixed(2)}°/100ft`}</div>
                                <div><strong>Survey Trend:</strong> {aiAnalysis?.trend || 'Consistent with build plan'}</div>
                                <div><strong>Recommendation:</strong> {aiAnalysis?.recommendation || 'Continue as planned'}</div>
                              </div>
                            </div>
                          )}
                          
                          {emailSettings.includeCurveData && curveData && (
                            <div className="bg-gray-50 p-3 rounded-md mb-4">
                              <h3 className="font-bold text-blue-800 mb-1">Curve Data</h3>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <div className="text-xs text-gray-500">Motor Yield (°/100ft)</div>
                                  <div className="font-medium">{Number(curveData.motorYield).toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Dog Leg Needed (°/100ft)</div>
                                  <div className="font-medium">{Number(curveData.dogLegNeeded).toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Projected Inc (°)</div>
                                  <div className="font-medium">{Number(curveData.projectedInc).toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Projected Az (°)</div>
                                  <div className="font-medium">{Number(curveData.projectedAz).toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Slide Seen (ft)</div>
                                  <div className="font-medium">{Number(curveData.slideSeen).toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Slide Ahead (ft)</div>
                                  <div className="font-medium">{Number(curveData.slideAhead).toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {emailSettings.includeGammaPlot && (
                            <div className="mb-4">
                              <h3 className="font-bold text-blue-800 mb-1">Gamma Plot</h3>
                              <div className="bg-gray-100 p-4 rounded-md text-center">
                                [Gamma plot image would appear here in the actual email]
                              </div>
                            </div>
                          )}
                          
                          {emailSettings.additionalNote && (
                            <div className="mb-4">
                              <h3 className="font-bold text-blue-800 mb-1">Additional Notes</h3>
                              <p className="text-sm">{emailSettings.additionalNote}</p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-red-500">No survey data available</p>
                      </div>
                    )}
                    
                    <div className="text-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                      This report was automatically generated by AI-MWD Dashboard on {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowEmailPreviewDialog(false)}>
              Close Preview
            </Button>
            <Button type="button" onClick={sendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Open in Email Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx>{`
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
