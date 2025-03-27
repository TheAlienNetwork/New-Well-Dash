
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowUpDown, ArrowLeftRight } from 'lucide-react';

interface TargetPositionProps {
  projections: {
    isAbove?: boolean;
    isBelow?: boolean;
    isLeft?: boolean;
    isRight?: boolean;
  };
  verticalPosition?: number;
  horizontalPosition?: number;
}

export default function TargetPosition({ projections, verticalPosition, horizontalPosition }: TargetPositionProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-cyan-500/20 bg-navy-950/50">
      <div className="p-3 bg-navy-900 flex justify-between items-center border-b border-cyan-500/20">
        <h2 className="text-lg font-semibold flex items-center text-cyan-100 font-mono">
          <ArrowUpDown className="h-5 w-5 mr-2 text-cyan-400" />
          TARGET POSITION
        </h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-navy-900/70 border border-cyan-500/10 rounded-md p-3">
            <Label className="text-xs text-cyan-400 flex items-center mb-2 font-mono">
              <ArrowUpDown className="h-3 w-3 mr-1 text-cyan-400" />
              VERTICAL POSITION
            </Label>
            <div className="text-sm flex flex-col">
              <span className="glow-text text-lg font-mono">{verticalPosition?.toFixed(2)}°</span>
              <div className="mt-2">
                {projections?.isAbove && <span className="text-emerald-400 text-xs">ABOVE TARGET</span>}
                {projections?.isBelow && <span className="text-rose-400 text-xs">BELOW TARGET</span>}
                {!projections?.isAbove && !projections?.isBelow && <span className="text-cyan-400 text-xs">ON TARGET</span>}
              </div>
            </div>
          </div>
          
          <div className="bg-navy-900/70 border border-cyan-500/10 rounded-md p-3">
            <Label className="text-xs text-cyan-400 flex items-center mb-2 font-mono">
              <ArrowLeftRight className="h-3 w-3 mr-1 text-cyan-400" />
              HORIZONTAL POSITION
            </Label>
            <div className="text-sm flex flex-col">
              <span className="glow-text text-lg font-mono">{horizontalPosition?.toFixed(2)}°</span>
              <div className="mt-2">
                {projections?.isLeft && <span className="text-blue-400 text-xs">LEFT OF TARGET</span>}
                {projections?.isRight && <span className="text-amber-400 text-xs">RIGHT OF TARGET</span>}
                {!projections?.isLeft && !projections?.isRight && <span className="text-cyan-400 text-xs">ON TARGET</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
