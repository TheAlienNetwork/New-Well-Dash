import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSurveyContext } from '@/context/SurveyContext';
import { useWellContext } from '@/context/WellContext';
import { Upload, FileSpreadsheet, Activity, FileType, AlertCircle } from 'lucide-react';
import { parseSurveyFile, parseGammaFile } from '@/lib/file-importers';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export function SurveyFileImporter() {
  const { wellInfo } = useWellContext();
  const { addSurvey } = useSurveyContext();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importStats, setImportStats] = useState<{ total: number; success: number; errors: number } | null>(null);
  
  // Set up a file change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setImportStats(null);
      setProgress(0);
    }
  };
  
  // Process the selected file
  const processFile = async () => {
    if (!selectedFile || !wellInfo?.id) {
      toast({
        title: "Import Error",
        description: "Please select a file and ensure a well is selected.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setProgress(10);
    setImportStats(null);
    
    try {
      // Parse file
      const surveys = await parseSurveyFile(selectedFile, wellInfo.id);
      setProgress(40);
      
      // Stats tracking
      let successCount = 0;
      let errorCount = 0;
      
      // Import survey data
      if (surveys.length > 0) {
        // Process in batches
        const batchSize = 5;
        const totalBatches = Math.ceil(surveys.length / batchSize);
        
        for (let i = 0; i < surveys.length; i += batchSize) {
          const batch = surveys.slice(i, i + batchSize);
          
          // Update progress
          setProgress(40 + Math.floor((i / surveys.length) * 50));
          
          // Process batch in parallel
          const results = await Promise.allSettled(
            batch.map(survey => addSurvey(survey))
          );
          
          // Count successes and failures
          results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
              successCount++;
            } else {
              errorCount++;
            }
          });
        }
        
        setImportStats({
          total: surveys.length,
          success: successCount,
          errors: errorCount
        });
        
        // Show success toast
        toast({
          title: "Survey Import Complete",
          description: `Successfully imported ${successCount} of ${surveys.length} surveys.`,
          variant: successCount > 0 ? "default" : "destructive"
        });
      } else {
        toast({
          title: "No Survey Data Found",
          description: "The file did not contain any recognizable survey data.",
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      console.error('Survey import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Import Failed",
        description: errorMessage || "Failed to import survey data.",
        variant: "destructive"
      });
    } finally {
      setProgress(100);
      setIsLoading(false);
    }
  };
  
  const allowedFileTypes = ".csv, .xlsx, .xls, .txt";
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-primary-dark/50 hover:bg-primary-dark border-primary-border flex gap-2 h-9 items-center">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Import Surveys</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-neutral-surface border-neutral-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import Survey Data
          </DialogTitle>
          <DialogDescription>
            Import survey data from Excel (XLSX/XLS), CSV, or text files.
            The system will automatically detect column headers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="survey-file">Select File</Label>
            <Input 
              id="survey-file" 
              type="file" 
              accept={allowedFileTypes}
              onChange={handleFileChange}
              disabled={isLoading}
              className="bg-neutral-background border-neutral-border cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: Excel, CSV, TXT
            </p>
          </div>
          
          {isLoading && (
            <div className="space-y-2">
              <Label>Processing File</Label>
              <Progress value={progress} className="h-2 bg-neutral-border" />
              <p className="text-xs text-muted-foreground">
                {progress < 40 ? "Parsing file..." : 
                 progress < 90 ? "Importing surveys..." : 
                 "Finishing up..."}
              </p>
            </div>
          )}
          
          {importStats && (
            <Alert className={importStats.errors > 0 ? "bg-red-900/20 border-red-800/50" : "bg-green-900/20 border-green-800/50"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Processed {importStats.total} surveys: {importStats.success} imported successfully, {importStats.errors} errors.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={processFile}
            disabled={!selectedFile || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Processing..." : "Import Surveys"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GammaFileImporter() {
  const { wellInfo } = useWellContext();
  const { toast } = useToast();
  const { gammaData } = useSurveyContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importStats, setImportStats] = useState<{ total: number; success: number; errors: number } | null>(null);
  
  // Set up a file change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setImportStats(null);
      setProgress(0);
    }
  };
  
  // Process the selected file
  const processFile = async () => {
    if (!selectedFile || !wellInfo?.id) {
      toast({
        title: "Import Error",
        description: "Please select a file and ensure a well is selected.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setProgress(10);
    setImportStats(null);
    
    try {
      // Parse file
      const gammaPoints = await parseGammaFile(selectedFile, wellInfo.id);
      setProgress(40);
      
      // Stats tracking
      let successCount = 0;
      let errorCount = 0;
      
      // Import gamma data
      if (gammaPoints.length > 0) {
        // Process in batches
        const batchSize = 20;
        const totalBatches = Math.ceil(gammaPoints.length / batchSize);
        
        // Create a single URL for bulk insert
        const response = await fetch('/api/gamma-data/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wellId: wellInfo.id,
            data: gammaPoints
          }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          successCount = result.inserted || 0;
          errorCount = gammaPoints.length - successCount;
          
          setImportStats({
            total: gammaPoints.length,
            success: successCount,
            errors: errorCount
          });
          
          // Show success toast
          toast({
            title: "Gamma Data Import Complete",
            description: `Successfully imported ${successCount} of ${gammaPoints.length} gamma points.`,
            variant: successCount > 0 ? "default" : "destructive"
          });
        } else {
          throw new Error(result.error || "Failed to import gamma data");
        }
      } else {
        toast({
          title: "No Gamma Data Found",
          description: "The file did not contain any recognizable gamma data.",
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      console.error('Gamma import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Import Failed",
        description: errorMessage || "Failed to import gamma data.",
        variant: "destructive"
      });
    } finally {
      setProgress(100);
      setIsLoading(false);
    }
  };
  
  const allowedFileTypes = ".csv, .xlsx, .xls, .txt, .las";
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-primary-dark/50 hover:bg-primary-dark border-primary-border flex gap-2 h-9 items-center">
          <Activity className="h-4 w-4" />
          <span>Import Gamma</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-neutral-surface border-neutral-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileType className="h-5 w-5 text-primary" />
            Import Gamma Data
          </DialogTitle>
          <DialogDescription>
            Import gamma ray data from LAS, Excel, CSV, or text files.
            The system will automatically detect column headers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gamma-file">Select File</Label>
            <Input 
              id="gamma-file" 
              type="file" 
              accept={allowedFileTypes}
              onChange={handleFileChange}
              disabled={isLoading}
              className="bg-neutral-background border-neutral-border cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: LAS, Excel, CSV, TXT
            </p>
          </div>
          
          {isLoading && (
            <div className="space-y-2">
              <Label>Processing File</Label>
              <Progress value={progress} className="h-2 bg-neutral-border" />
              <p className="text-xs text-muted-foreground">
                {progress < 40 ? "Parsing file..." : 
                 progress < 90 ? "Importing gamma data..." : 
                 "Finishing up..."}
              </p>
            </div>
          )}
          
          {importStats && (
            <Alert className={importStats.errors > 0 ? "bg-red-900/20 border-red-800/50" : "bg-green-900/20 border-green-800/50"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Processed {importStats.total} data points: {importStats.success} imported successfully, {importStats.errors} errors.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={processFile}
            disabled={!selectedFile || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Processing..." : "Import Gamma Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}