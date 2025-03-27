
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
}

export default function TargetPosition({ projections }: TargetPositionProps) {
  return (
    <div className="card rounded-lg overflow-hidden">
      <div className="p-3 bg-indigo-900/30 flex justify-between items-center border-b border-indigo-500/20">
        <h2 className="font-heading text-lg font-semibold flex items-center text-indigo-100">
          <ArrowUpDown className="h-5 w-5 mr-2 text-indigo-400" />
          Target Position
        </h2>
      </div>
      <div className="p-4 glass-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel rounded-md p-3">
            <Label className="text-xs text-indigo-300 flex items-center mb-2">
              <ArrowUpDown className="h-3 w-3 mr-1 text-indigo-400" />
              VERTICAL POSITION
            </Label>
            <div className="text-sm">
              {projections?.isAbove && <span className="text-green-400">Above Target</span>}
              {projections?.isBelow && <span className="text-red-400">Below Target</span>}
            </div>
          </div>
          
          <div className="glass-panel rounded-md p-3">
            <Label className="text-xs text-indigo-300 flex items-center mb-2">
              <ArrowLeftRight className="h-3 w-3 mr-1 text-indigo-400" />
              HORIZONTAL POSITION
            </Label>
            <div className="text-sm">
              {projections?.isLeft && <span className="text-blue-400">Left of Target</span>}
              {projections?.isRight && <span className="text-orange-400">Right of Target</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
