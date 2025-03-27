import React from 'react';
import { Card } from '@/components/ui/card';

export function TargetPosition({ projections }: { projections: any }) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Target Position</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div>Above: {projections?.isAbove ? 'Yes' : 'No'}</div>
          <div>Below: {projections?.isBelow ? 'Yes' : 'No'}</div>
        </div>
        <div>
          <div>Left: {projections?.isLeft ? 'Yes' : 'No'}</div>
          <div>Right: {projections?.isRight ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </Card>
  );
}