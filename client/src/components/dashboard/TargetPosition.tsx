
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowLeftRight, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSurveyContext } from '@/context/SurveyContext';
import { useWellContext } from '@/context/WellContext';

interface TargetPositionProps {
  projections: {
    isAbove?: boolean;
    isBelow?: boolean;
    isLeft?: boolean;
    isRight?: boolean;
    projectedInc?: number;
    projectedAz?: number;
    buildRate?: number;
    turnRate?: number;
    verticalPosition?: number;
    horizontalPosition?: number;
  } | null;
  verticalPosition?: number;
  horizontalPosition?: number;
}

export default function TargetPosition({ projections, verticalPosition: initialVertical, horizontalPosition: initialHorizontal }: TargetPositionProps) {
  const { curveData, updateCurveData, latestSurvey, surveys } = useSurveyContext();
  const { wellInfo } = useWellContext();
  
  const [includeInEmail, setIncludeInEmail] = useState(curveData?.includeTargetPosition || false);
  const [verticalInput, setVerticalInput] = useState("");
  const [horizontalInput, setHorizontalInput] = useState("");
  const [verticalPosition, setVerticalPosition] = useState<number | undefined>(initialVertical);
  const [horizontalPosition, setHorizontalPosition] = useState<number | undefined>(initialHorizontal);
  const [isAbove, setIsAbove] = useState(projections?.isAbove || false);
  const [isBelow, setIsBelow] = useState(projections?.isBelow || false);
  const [isLeft, setIsLeft] = useState(projections?.isLeft || false);
  const [isRight, setIsRight] = useState(projections?.isRight || false);
  const [hasCalculated, setHasCalculated] = useState(false);
  
  // Calculate the position based on latest survey and target
  const calculatePositions = () => {
    if (!latestSurvey || !wellInfo) return;
    
    // Convert input values
    const targetVertical = verticalInput !== "" ? parseFloat(verticalInput) : 0;
    const targetHorizontal = horizontalInput !== "" ? parseFloat(horizontalInput) : 0;
    
    // Get current position from latest survey
    const northSouth = typeof latestSurvey.northSouth === 'string' ? parseFloat(latestSurvey.northSouth) : latestSurvey.northSouth || 0;
    const eastWest = typeof latestSurvey.eastWest === 'string' ? parseFloat(latestSurvey.eastWest) : latestSurvey.eastWest || 0;
    const isNorth = Boolean(latestSurvey.isNorth);
    const isEast = Boolean(latestSurvey.isEast);
    
    // Get proposed direction
    const proposedDirection = Number(wellInfo.proposedDirection || 0);
    
    // Calculate current vertical position (VS)
    // VS is the perpendicular distance to the proposed azimuth line
    const dirRad = proposedDirection * Math.PI / 180;
    const currentVS = Math.abs(northSouth * Math.sin(dirRad) + eastWest * Math.cos(dirRad));
    
    // Calculate the sign for current vertical position
    const vsSign = Math.sign(northSouth * Math.sin(dirRad) + eastWest * Math.cos(dirRad));
    
    // Calculate vertical offset
    const verticalOffset = targetVertical - (vsSign * currentVS);
    
    // Determine if above or below target
    setIsAbove(verticalOffset < 0);
    setIsBelow(verticalOffset > 0);
    setVerticalPosition(Math.abs(verticalOffset));
    
    // Calculate horizontal position (perpendicular to VS)
    const currentHS = Math.abs(northSouth * Math.cos(dirRad) - eastWest * Math.sin(dirRad));
    
    // Calculate the sign for current horizontal position
    const hsSign = Math.sign(northSouth * Math.cos(dirRad) - eastWest * Math.sin(dirRad));
    
    // Calculate horizontal offset
    const horizontalOffset = targetHorizontal - (hsSign * currentHS);
    
    // Determine if left or right of target
    setIsLeft(horizontalOffset < 0);
    setIsRight(horizontalOffset > 0);
    setHorizontalPosition(Math.abs(horizontalOffset));
    
    // Save calculated values to curve data
    if (updateCurveData && curveData) {
      updateCurveData({
        id: curveData.id,
        wellId: curveData.wellId,
        aboveTarget: verticalOffset < 0,
        belowTarget: verticalOffset > 0,
        leftTarget: horizontalOffset < 0,
        rightTarget: horizontalOffset > 0
      });
    }
    
    setHasCalculated(true);
  };
  
  useEffect(() => {
    if (curveData) {
      setIncludeInEmail(curveData.includeTargetPosition || false);
    }
  }, [curveData]);
  
  useEffect(() => {
    // Update from projections if available
    if (projections) {
      setIsAbove(projections.isAbove || false);
      setIsBelow(projections.isBelow || false);
      setIsLeft(projections.isLeft || false);
      setIsRight(projections.isRight || false);
      
      if (projections.verticalPosition !== undefined) {
        setVerticalPosition(projections.verticalPosition);
      }
      
      if (projections.horizontalPosition !== undefined) {
        setHorizontalPosition(projections.horizontalPosition);
      }
    }
  }, [projections]);
  
  const handleSwitchChange = (checked: boolean) => {
    setIncludeInEmail(checked);
    
    if (updateCurveData && curveData) {
      updateCurveData({
        id: curveData.id,
        wellId: curveData.wellId,
        includeTargetPosition: checked
      });
    }
  };
  
  return (
    <div className="premium-card overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 flex justify-between items-center border-b border-gray-700/30">
        <h2 className="font-heading text-lg font-semibold flex items-center text-white">
          <ArrowUpDown className="h-5 w-5 mr-2 text-cyan-400" />
          Target Position
        </h2>
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <Label htmlFor="include-target-email" className="text-xs text-gray-300">Include in Email</Label>
          <Switch
            id="include-target-email"
            checked={includeInEmail}
            onCheckedChange={handleSwitchChange}
            className="data-[state=checked]:bg-cyan-600"
          />
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Input section */}
        <div className="glass-panel p-3 rounded border border-gray-700/30">
          <div className="flex items-center mb-3 pb-2 border-b border-gray-700/20">
            <div className="h-7 w-7 flex items-center justify-center bg-blue-900/30 rounded-full text-blue-400 mr-2">
              <ArrowUpDown className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-medium text-gray-200">Target Coordinates</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="verticalTarget" className="text-xs text-gray-400">Vertical Target (ft)</Label>
              <Input
                id="verticalTarget"
                type="number"
                step="0.01"
                value={verticalInput}
                onChange={(e) => setVerticalInput(e.target.value)}
                className="h-8 bg-gray-800/40 border-gray-700/50 text-sm font-mono"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="horizontalTarget" className="text-xs text-gray-400">Horizontal Target (ft)</Label>
              <Input
                id="horizontalTarget"
                type="number"
                step="0.01"
                value={horizontalInput}
                onChange={(e) => setHorizontalInput(e.target.value)}
                className="h-8 bg-gray-800/40 border-gray-700/50 text-sm font-mono"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-700/20 flex justify-end">
            <Button
              onClick={calculatePositions}
              variant="outline"
              size="sm"
              className="text-xs bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-cyan-400 hover:text-cyan-300"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Calculate Offset
            </Button>
          </div>
        </div>
        
        {/* Result section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-3 rounded border border-gray-700/30">
            <div className="flex items-center mb-2">
              <ArrowUpDown className="h-4 w-4 text-cyan-400 mr-1.5" />
              <Label className="text-xs text-gray-300 font-semibold">VERTICAL POSITION</Label>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-mono text-cyan-400">
                {(verticalPosition !== undefined) ? verticalPosition.toFixed(2) : "0.00"}<span className="text-xs text-gray-400 ml-1">ft</span>
              </div>
              <div className="flex items-center">
                {isAbove && (
                  <span className="text-emerald-400 text-xs font-mono flex items-center">
                    <ArrowUpDown className="h-3 w-3 mr-1.5" /> ABOVE TARGET
                  </span>
                )}
                {isBelow && (
                  <span className="text-rose-400 text-xs font-mono flex items-center">
                    <ArrowUpDown className="h-3 w-3 mr-1.5" /> BELOW TARGET
                  </span>
                )}
                {!isAbove && !isBelow && (
                  <span className="text-cyan-400 text-xs font-mono flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1.5" /> ON TARGET
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-3 rounded border border-gray-700/30">
            <div className="flex items-center mb-2">
              <ArrowLeftRight className="h-4 w-4 text-purple-400 mr-1.5" />
              <Label className="text-xs text-gray-300 font-semibold">HORIZONTAL POSITION</Label>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-mono text-purple-400">
                {(horizontalPosition !== undefined) ? horizontalPosition.toFixed(2) : "0.00"}<span className="text-xs text-gray-400 ml-1">ft</span>
              </div>
              <div className="flex items-center">
                {isLeft && (
                  <span className="text-blue-400 text-xs font-mono flex items-center">
                    <ArrowLeftRight className="h-3 w-3 mr-1.5" /> LEFT OF TARGET
                  </span>
                )}
                {isRight && (
                  <span className="text-amber-400 text-xs font-mono flex items-center">
                    <ArrowLeftRight className="h-3 w-3 mr-1.5" /> RIGHT OF TARGET
                  </span>
                )}
                {!isLeft && !isRight && (
                  <span className="text-cyan-400 text-xs font-mono flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1.5" /> ON TARGET
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {hasCalculated && (
          <div className="glass-panel p-3 rounded border border-green-700/30 bg-green-900/10">
            <div className="text-xs text-gray-300 flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-400 mr-2" />
              Target position calculated and saved successfully
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
