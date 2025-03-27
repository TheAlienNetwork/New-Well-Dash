import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Card } from '@/components/ui/card';
import { AIAnalyticsContainer } from '@/components/dashboard/AIAnalytics';
import { SurveyTable } from '@/components/dashboard/SurveyTable';
import { CurveData } from '@/components/dashboard/CurveData';
import { TargetPosition } from '@/components/dashboard/TargetPosition';
import { useWellContext } from '@/context/WellContext';
import { useWitsContext } from '@/context/WitsContext';
import { useSurveyContext } from '@/context/SurveyContext';
import { Survey } from '@shared/schema';


export default function MwdSurvey() {
  const { currentWell } = useWellContext();
  const { witsData, gammaData } = useWitsContext();
  const {showSurveyModal, setShowSurveyModal, modalSurvey, setModalSurvey} = useSurveyContext();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [surveys, setSurveys] = useState<Survey[]>([]); 
  const [curveData, setCurveData] = useState<any>(null); 


  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Target Position</h2>
          <TargetPosition />
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Gamma Plot</h2>
          <Plot
            data={[
              {
                x: gammaData?.map(d => d.timestamp) || [],
                y: gammaData?.map(d => d.value) || [],
                type: 'scatter',
                mode: 'lines',
                name: 'Gamma'
              }
            ]}
            layout={{
              autosize: true,
              margin: { t: 20, r: 20, b: 30, l: 40 },
              showlegend: true,
              xaxis: { title: 'Time' },
              yaxis: { title: 'Gamma (API)' }
            }}
            style={{ width: '100%', height: '300px' }}
            useResizeHandler={true}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">AI Analytics</h2>
          <AIAnalyticsContainer />
        </Card>

        <Card className="p-4">
          <SurveyTable onAddSurvey={()=>{}} onEditSurvey={()=>{}} surveys={surveys} setSurveys={setSurveys}/>
        </Card>

        <Card className="p-4">
          <CurveData />
        </Card>
      </div>
    </div>
  );
}