import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface CurveDataProps {
  data: {
    inc: number;
    az: number;
    md: number;
    dls: number;
  };
  onChange: (data: any) => void;
}

export const CurveData: React.FC<CurveDataProps> = ({ data, onChange }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Inclination</label>
              <Input
                type="number"
                value={data.inc}
                onChange={(e) => onChange({ ...data, inc: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Azimuth</label>
              <Input
                type="number"
                value={data.az}
                onChange={(e) => onChange({ ...data, az: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Measured Depth</label>
              <Input
                type="number"
                value={data.md}
                onChange={(e) => onChange({ ...data, md: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Dog Leg Severity</label>
              <Input
                type="number"
                value={data.dls}
                onChange={(e) => onChange({ ...data, dls: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};