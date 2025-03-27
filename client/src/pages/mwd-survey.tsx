import React, { useState } from 'react';
import SurveyTable from '@/components/dashboard/SurveyTable';
import CurveData from '@/components/dashboard/CurveData';
import GammaPlot from '@/components/dashboard/GammaPlot';
import AIAnalytics from '@/components/dashboard/AIAnalytics';
import SurveyModal from '@/components/dashboard/SurveyModal';
import { useSurveyContext } from '@/context/SurveyContext';
import { Survey } from '@shared/schema';
import TargetPosition from '@/components/dashboard/TargetPosition';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MwdSurvey() {
  const { 
    showSurveyModal, 
    setShowSurveyModal, 
    modalSurvey, 
    setModalSurvey,
    surveys // Assuming surveys data is available from context
  } = useSurveyContext();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const handleAddSurvey = () => {
    setModalSurvey(null);
    setModalMode('add');
    setShowSurveyModal(true);
  };

  const handleEditSurvey = (survey: Survey) => {
    setModalSurvey(survey);
    setModalMode('edit');
    setShowSurveyModal(true);
  };

  // Placeholder - needs actual data source and proper integration with WITS data
  const projections = {};


  return (
    <div className="flex flex-col gap-4">
      <div className="w-full">
        <SurveyTable
          onAddSurvey={handleAddSurvey}
          onEditSurvey={handleEditSurvey}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <TargetPosition projections={projections} /> 

        <div className="xl:col-span-2">
          <CurveData />
        </div>

        <div className="xl:col-span-1">
          <GammaPlot />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Added plots section */}
        <Card>
          <CardHeader>
            <CardTitle>Inclination Differences</CardTitle>
          </CardHeader>
          <CardContent>
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.inc),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Inclination'
              }]}
              layout={{
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                xaxis: { title: 'MD (ft)' },
                yaxis: { title: 'Inclination (°)' }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Azimuth Differences</CardTitle>
          </CardHeader>
          <CardContent>
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.azi),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Azimuth'
              }]}
              layout={{
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                xaxis: { title: 'MD (ft)' },
                yaxis: { title: 'Azimuth (°)' }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Magnetometer</CardTitle>
          </CardHeader>
          <CardContent>
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.gTotal),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'G Total'
              }]}
              layout={{
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                xaxis: { title: 'MD (ft)' },
                yaxis: { title: 'G Total' }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Accelerometer</CardTitle>
          </CardHeader>
          <CardContent>
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.bTotal),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'B Total'
              }]}
              layout={{
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                xaxis: { title: 'MD (ft)' },
                yaxis: { title: 'B Total' }
              }}
            />
          </CardContent>
        </Card>
      </div>

      <AIAnalytics />
      <SurveyModal
        open={showSurveyModal}
        onOpenChange={setShowSurveyModal}
        survey={modalSurvey}
        mode={modalMode}
      />
    </div>
  );
}