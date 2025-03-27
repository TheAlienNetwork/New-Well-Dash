import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSurveyContext } from '@/context/SurveyContext';
import { Settings2 } from 'lucide-react';

export default function CurveData() {
  const { curveData, updateCurveData } = useSurveyContext();
  const [formData, setFormData] = useState({
    motorYield: curveData?.motorYield || 0,
    dogLegNeeded: curveData?.dogLegNeeded || 0,
    projectedInc: curveData?.projectedInc || 0,
    projectedAz: curveData?.projectedAz || 0,
    slideSeen: curveData?.slideSeen || 0,
    slideAhead: curveData?.slideAhead || 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleBlur = () => {
    if (updateCurveData) {
      updateCurveData({
        id: curveData?.id || 1,
        wellId: curveData?.wellId || 1,
        ...formData
      });
    }
  };

  return (
    <Card className="bg-neutral-surface border-neutral-border">
      <CardHeader>
        <CardTitle className="flex items-center font-heading text-lg">
          <Settings2 className="mr-2 h-5 w-5 text-primary" />
          Curve Data
        </CardTitle>
        <CardDescription>
          Input parameters for calculating directional requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="motorYield">Motor Yield</Label>
              <Input
                id="motorYield"  
                name="motorYield"
                type="number"
                value={formData.motorYield}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="bg-neutral-background border-neutral-border"
              />
            </div>
            <div>
              <Label htmlFor="dogLegNeeded">Dog Leg Needed</Label>
              <Input
                id="dogLegNeeded"
                name="dogLegNeeded" 
                type="number"
                value={formData.dogLegNeeded}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="bg-neutral-background border-neutral-border"
              />
            </div>
            <div>
              <Label htmlFor="projectedInc">Projected Inc</Label>
              <Input
                id="projectedInc"
                name="projectedInc"
                type="number"
                value={formData.projectedInc}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="bg-neutral-background border-neutral-border"
              />
            </div>
            <div>
              <Label htmlFor="projectedAz">Projected Az</Label>
              <Input
                id="projectedAz"
                name="projectedAz"
                type="number"
                value={formData.projectedAz}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="bg-neutral-background border-neutral-border"
              />
            </div>
            <div>
              <Label htmlFor="slideSeen">Slide Seen</Label>
              <Input
                id="slideSeen"
                name="slideSeen"
                type="number"
                value={formData.slideSeen}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="bg-neutral-background border-neutral-border"
              />
            </div>
            <div>
              <Label htmlFor="slideAhead">Slide Ahead</Label>
              <Input
                id="slideAhead"
                name="slideAhead"
                type="number"
                value={formData.slideAhead}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="bg-neutral-background border-neutral-border"
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}