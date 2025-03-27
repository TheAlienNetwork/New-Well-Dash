import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSurveyContext } from '@/context/SurveyContext';
import { Settings2, Mail } from 'lucide-react';

export default function CurveData() {
  const { curveData, updateCurveData } = useSurveyContext();
  const [formData, setFormData] = useState({
    motorYield: curveData?.motorYield || 0,
    dogLegNeeded: curveData?.dogLegNeeded || 0,
    projectedInc: curveData?.projectedInc || 0,
    projectedAz: curveData?.projectedAz || 0,
    slideSeen: curveData?.slideSeen || 0,
    slideAhead: curveData?.slideAhead || 0,
    includeInEmail: curveData?.includeInEmail || false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    const newFormData = {
      ...formData,
      includeInEmail: checked
    };
    setFormData(newFormData);
    
    if (updateCurveData) {
      updateCurveData({
        id: curveData?.id || 1,
        wellId: curveData?.wellId || 1,
        motorYield: String(newFormData.motorYield),
        dogLegNeeded: String(newFormData.dogLegNeeded),
        projectedInc: String(newFormData.projectedInc),
        projectedAz: String(newFormData.projectedAz),
        slideSeen: String(newFormData.slideSeen),
        slideAhead: String(newFormData.slideAhead),
        includeInEmail: newFormData.includeInEmail
      });
    }
  };

  const handleBlur = () => {
    if (updateCurveData) {
      updateCurveData({
        id: curveData?.id || 1,
        wellId: curveData?.wellId || 1,
        motorYield: String(formData.motorYield),
        dogLegNeeded: String(formData.dogLegNeeded),
        projectedInc: String(formData.projectedInc),
        projectedAz: String(formData.projectedAz),
        slideSeen: String(formData.slideSeen),
        slideAhead: String(formData.slideAhead),
        includeInEmail: formData.includeInEmail
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
          
          {/* Include in Email Toggle */}
          <div className="flex items-center space-x-2 mt-4 bg-neutral-background p-3 rounded-md border border-primary/20">
            <Mail className="h-4 w-4 text-primary" />
            <Label htmlFor="include-in-email" className="flex-1">Include curve data in emails</Label>
            <Switch
              id="include-in-email"
              checked={formData.includeInEmail}
              onCheckedChange={handleSwitchChange}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}