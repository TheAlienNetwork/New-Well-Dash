import React, { useState, useEffect } from 'react';
import { useWellContext } from '@/context/WellContext';
import { useWitsContext } from '@/context/WitsContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { WitsMapping as WitsMappingType } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  RotateCw,
  FileDown,
  FileUp,
  Router
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function WitsMappingPage() {
  const { wellInfo } = useWellContext();
  const { witsStatus } = useWitsContext();
  const { toast } = useToast();
  
  const [mappings, setMappings] = useState<WitsMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [currentMapping, setCurrentMapping] = useState<WitsMapping | null>(null);
  const [mappingMode, setMappingMode] = useState<'new' | 'edit'>('new');
  const [formData, setFormData] = useState({
    witsId: 0,
    description: '',
    mappedTo: ''
  });
  
  // Filter options for mapped to values
  const mappedToOptions = [
    { value: 'bitDepth', label: 'Bit Depth' },
    { value: 'inc', label: 'Inclination' },
    { value: 'azi', label: 'Azimuth' },
    { value: 'gamma', label: 'Gamma Ray' },
    { value: 'rop', label: 'Rate of Penetration' },
    { value: 'wob', label: 'Weight on Bit' },
    { value: 'rpm', label: 'RPM' },
    { value: 'flow', label: 'Flow Rate' },
    { value: 'pressure', label: 'Standpipe Pressure' },
    { value: 'torque', label: 'Torque' }
  ];

  // Sample WITS channel list to display
  const sampleWitsChannels = [
    { id: 1, name: 'Bit Depth', unit: 'ft', value: '1559.92' },
    { id: 2, name: 'Inclination', unit: 'deg', value: '3.85' },
    { id: 3, name: 'Azimuth', unit: 'deg', value: '177.42' },
    { id: 4, name: 'Gamma Ray', unit: 'gAPI', value: '74.28' },
    { id: 5, name: 'ROP', unit: 'ft/hr', value: '54.2' },
    { id: 10, name: 'Weight on Bit', unit: 'klbs', value: '25.4' },
    { id: 11, name: 'RPM', unit: 'rpm', value: '120' },
    { id: 12, name: 'Flow Rate', unit: 'gpm', value: '650' },
    { id: 13, name: 'Standpipe Pressure', unit: 'psi', value: '2750' },
    { id: 14, name: 'Torque', unit: 'ft-lbs', value: '8500' }
  ];
  
  // Load mappings
  useEffect(() => {
    if (wellInfo?.id) {
      fetchMappings(wellInfo.id);
    }
  }, [wellInfo]);

  // Fetch mappings
  const fetchMappings = async (wellId: number) => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', `/api/wits-mappings/${wellId}`, undefined);
      const data = await response.json();
      setMappings(data);
    } catch (error) {
      console.error('Error fetching WITS mappings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load WITS mappings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'witsId' ? parseInt(value) || 0 : value
    }));
  };

  // Open mapping dialog for creating/editing
  const openMappingDialog = (mapping?: WitsMapping) => {
    if (mapping) {
      setFormData({
        witsId: mapping.witsId,
        description: mapping.description,
        mappedTo: mapping.mappedTo
      });
      setCurrentMapping(mapping);
      setMappingMode('edit');
    } else {
      setFormData({
        witsId: 0,
        description: '',
        mappedTo: ''
      });
      setCurrentMapping(null);
      setMappingMode('new');
    }
    setShowMappingDialog(true);
  };

  // Save mapping
  const saveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wellInfo) return;

    try {
      if (mappingMode === 'new') {
        const response = await apiRequest('POST', '/api/wits-mappings', {
          ...formData,
          wellId: wellInfo.id
        });
        const newMapping = await response.json();
        setMappings(prev => [...prev, newMapping]);
        
        toast({
          title: 'Success',
          description: 'WITS mapping created successfully'
        });
      } else if (mappingMode === 'edit' && currentMapping) {
        const response = await apiRequest('PATCH', `/api/wits-mappings/${currentMapping.id}`, formData);
        const updatedMapping = await response.json();
        
        setMappings(prev => 
          prev.map(m => m.id === updatedMapping.id ? updatedMapping : m)
        );
        
        toast({
          title: 'Success',
          description: 'WITS mapping updated successfully'
        });
      }
      
      setShowMappingDialog(false);
    } catch (error) {
      console.error('Error saving WITS mapping:', error);
      toast({
        title: 'Error',
        description: 'Failed to save WITS mapping',
        variant: 'destructive'
      });
    }
  };

  // Delete mapping
  const deleteMapping = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/wits-mappings/${id}`, undefined);
      setMappings(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: 'Success',
        description: 'WITS mapping deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting WITS mapping:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete WITS mapping',
        variant: 'destructive'
      });
    }
  };

  // Quick add mapped channel
  const quickAddChannel = async (channel: { id: number, name: string }) => {
    if (!wellInfo) return;
    
    // Determine appropriate mapping based on name
    let mappedTo = '';
    if (channel.name.toLowerCase().includes('bit depth')) mappedTo = 'bitDepth';
    else if (channel.name.toLowerCase().includes('inclination')) mappedTo = 'inc';
    else if (channel.name.toLowerCase().includes('azimuth')) mappedTo = 'azi';
    else if (channel.name.toLowerCase().includes('gamma')) mappedTo = 'gamma';
    else if (channel.name.toLowerCase().includes('rop')) mappedTo = 'rop';
    else if (channel.name.toLowerCase().includes('weight')) mappedTo = 'wob';
    else if (channel.name.toLowerCase().includes('rpm')) mappedTo = 'rpm';
    else if (channel.name.toLowerCase().includes('flow')) mappedTo = 'flow';
    else if (channel.name.toLowerCase().includes('pressure')) mappedTo = 'pressure';
    else if (channel.name.toLowerCase().includes('torque')) mappedTo = 'torque';
    
    if (!mappedTo) {
      toast({
        title: 'Error',
        description: 'Could not determine appropriate mapping for this channel',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const response = await apiRequest('POST', '/api/wits-mappings', {
        witsId: channel.id,
        description: channel.name,
        mappedTo,
        wellId: wellInfo.id
      });
      
      const newMapping = await response.json();
      setMappings(prev => [...prev, newMapping]);
      
      toast({
        title: 'Success',
        description: `Mapped ${channel.name} to ${mappedTo}`
      });
    } catch (error) {
      console.error('Error quick adding WITS mapping:', error);
      toast({
        title: 'Error',
        description: 'Failed to add WITS mapping',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-neutral-surface border-neutral-border">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center font-heading text-lg">
                <Router className="mr-2 h-5 w-5 text-primary" />
                WITS Connection Status
              </CardTitle>
              <CardDescription>
                Configure WITS channels and connection settings
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Badge className={`${witsStatus.connected ? 'bg-accent-green' : 'bg-accent-red'} text-white`}>
                {witsStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}
              </Badge>
              <Button variant="outline" className="bg-neutral-background hover:bg-neutral-border">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-background rounded-md p-3 flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-400">Connection</div>
                <div className="text-sm font-medium">{witsStatus.address || 'Not connected'}</div>
              </div>
              <div className={`h-2 w-2 rounded-full ${witsStatus.connected ? 'bg-accent-green' : 'bg-accent-red'} pulse`}></div>
            </div>
            
            <div className="bg-neutral-background rounded-md p-3">
              <div className="text-xs text-gray-400">Protocol</div>
              <div className="text-sm font-medium">WITS Level 0</div>
            </div>
            
            <div className="bg-neutral-background rounded-md p-3">
              <div className="text-xs text-gray-400">Last Data Received</div>
              <div className="text-sm font-medium">{witsStatus.connected ? new Date().toLocaleTimeString() : 'N/A'}</div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" className="bg-neutral-background hover:bg-neutral-border">
              <FileUp className="h-4 w-4 mr-2" />
              Import Mappings
            </Button>
            <Button variant="outline" className="bg-neutral-background hover:bg-neutral-border">
              <FileDown className="h-4 w-4 mr-2" />
              Export Mappings
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* WITS Mappings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapped Channels */}
        <Card className="bg-neutral-surface border-neutral-border">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center font-heading text-lg">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                WITS Mappings
              </CardTitle>
              <Button
                onClick={() => openMappingDialog()}
                className="bg-primary hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Mapping
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading WITS mappings...</div>
            ) : mappings.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center rounded-full bg-neutral-background p-3 mb-4">
                  <Settings className="h-8 w-8 text-primary/50" />
                </div>
                <h3 className="text-lg font-medium text-gray-400 mb-2">No WITS Mappings</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Create mappings to connect WITS channels with application fields.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-neutral-background">
                  <TableRow className="hover:bg-transparent border-neutral-border">
                    <TableHead>WITS ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Mapped To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id} className="border-neutral-border">
                      <TableCell className="font-mono">{mapping.witsId}</TableCell>
                      <TableCell>{mapping.description}</TableCell>
                      <TableCell className="font-mono text-primary">{mapping.mappedTo}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openMappingDialog(mapping)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMapping(mapping.id)}
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
        
        {/* Available WITS Channels */}
        <Card className="bg-neutral-surface border-neutral-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center font-heading text-lg">
              <Router className="mr-2 h-5 w-5 text-primary" />
              Available WITS Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Input
                  placeholder="Search channels..."
                  className="bg-neutral-background border-neutral-border pl-9"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="border border-neutral-border rounded-md">
              <Table>
                <TableHeader className="bg-neutral-background">
                  <TableRow className="hover:bg-transparent border-neutral-border">
                    <TableHead>ID</TableHead>
                    <TableHead>Channel Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleWitsChannels.map((channel) => {
                    const isMapped = mappings.some(m => m.witsId === channel.id);
                    
                    return (
                      <TableRow key={channel.id} className="border-neutral-border">
                        <TableCell className="font-mono">{channel.id}</TableCell>
                        <TableCell>{channel.name}</TableCell>
                        <TableCell>{channel.unit}</TableCell>
                        <TableCell className="font-mono">{channel.value}</TableCell>
                        <TableCell className="text-right">
                          {isMapped ? (
                            <Badge className="bg-secondary-purple/20 text-secondary-purple">
                              Mapped
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 bg-neutral-background border-neutral-border"
                              onClick={() => quickAddChannel(channel)}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Map
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 text-xs text-gray-400 flex justify-between items-center">
              <span>Showing 10 of 48 channels</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="h-7 bg-neutral-background border-neutral-border">
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="h-7 bg-neutral-background border-neutral-border">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Mapping Dialog */}
      <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
        <DialogContent className="bg-neutral-surface border-neutral-border">
          <DialogHeader>
            <DialogTitle>
              {mappingMode === 'new' ? 'Add WITS Mapping' : 'Edit WITS Mapping'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveMapping} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="witsId">WITS Channel ID</Label>
              <Input
                id="witsId"
                name="witsId"
                type="number"
                value={formData.witsId}
                onChange={handleFormChange}
                placeholder="e.g. 1001"
                className="bg-neutral-background border-neutral-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="e.g. Bit Depth"
                className="bg-neutral-background border-neutral-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mappedTo">Map To Field</Label>
              <select
                id="mappedTo"
                name="mappedTo"
                value={formData.mappedTo}
                onChange={handleFormChange}
                className="flex h-10 w-full rounded-md border border-neutral-border bg-neutral-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select field...</option>
                {mappedToOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowMappingDialog(false)}
                className="border-neutral-border"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {mappingMode === 'new' ? 'Create Mapping' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
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
