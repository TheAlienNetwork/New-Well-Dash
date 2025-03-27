import React from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import TargetPosition from '@/components/dashboard/TargetPosition';

export default function SurveysPage() {
  const { projections } = useSurveyContext();
  
  return (
    <div className="space-y-6">
      <TargetPosition projections={projections} />
      
      {/* Existing surveys content */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-100 p-2 rounded">
          <div className="text-sm font-semibold mb-2">Direction Status</div>
          <div className="flex gap-2 flex-wrap">
            {projections?.isAbove && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Above</span>}
            {projections?.isBelow && <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Below</span>}
            {projections?.isLeft && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Left</span>}
            {projections?.isRight && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">Right</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyComponent;