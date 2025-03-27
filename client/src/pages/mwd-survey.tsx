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
    surveys,
    curveData // Added curveData from context
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

  // Calculate projections based on curve data
  const projections = {
    isAbove: Number(curveData?.projectedInc || 0) > 2.5,
    isBelow: Number(curveData?.projectedInc || 0) < 1.5,
    isLeft: Number(curveData?.projectedAz || 0) < 175,
    isRight: Number(curveData?.projectedAz || 0) > 185
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full">
        <SurveyTable
          onAddSurvey={handleAddSurvey}
          onEditSurvey={handleEditSurvey}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <TargetPosition 
          projections={projections}
          verticalPosition={Number(curveData?.projectedInc || 0)}
          horizontalPosition={Number(curveData?.projectedAz || 0)}
        /> 

        <div className="xl:col-span-2">
          <CurveData />
        </div>

        <div className="xl:col-span-1">
          <GammaPlot />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg overflow-hidden border border-cyan-500/20 bg-navy-950/50">
          <div className="p-3 bg-navy-900 flex justify-between items-center border-b border-cyan-500/20">
            <h2 className="text-lg font-semibold flex items-center text-cyan-100 font-mono">INCLINATION DIFFERENCES</h2>
          </div>
          <div className="p-4">
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.inc),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#06b6d4', width: 2 },
                marker: { color: '#22d3ee', size: 6 },
                name: 'Inclination'
              }]}
              layout={{
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'rgba(3, 22, 56, 0.3)',
                xaxis: { 
                  title: 'MD (ft)',
                  gridcolor: 'rgba(6, 182, 212, 0.1)',
                  zerolinecolor: 'rgba(6, 182, 212, 0.2)',
                  titlefont: { color: '#94a3b8' },
                  tickfont: { color: '#94a3b8' }
                },
                yaxis: { 
                  title: 'Inclination (°)',
                  gridcolor: 'rgba(6, 182, 212, 0.1)',
                  zerolinecolor: 'rgba(6, 182, 212, 0.2)',
                  titlefont: { color: '#94a3b8' },
                  tickfont: { color: '#94a3b8' }
                },
                font: { color: '#94a3b8' }
              }}
              config={{ responsive: true }}
            />
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-cyan-500/20 bg-navy-950/50">
          <div className="p-3 bg-navy-900 flex justify-between items-center border-b border-cyan-500/20">
            <h2 className="text-lg font-semibold flex items-center text-cyan-100 font-mono">AZIMUTH DIFFERENCES</h2>
          </div>
          <div className="p-4">
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.azi),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#0ea5e9', width: 2 },
                marker: { color: '#38bdf8', size: 6 },
                name: 'Azimuth'
              }]}
              layout={{
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'rgba(3, 22, 56, 0.3)',
                xaxis: { 
                  title: 'MD (ft)',
                  gridcolor: 'rgba(6, 182, 212, 0.1)',
                  zerolinecolor: 'rgba(6, 182, 212, 0.2)',
                  titlefont: { color: '#94a3b8' },
                  tickfont: { color: '#94a3b8' }
                },
                yaxis: { 
                  title: 'Azimuth (°)',
                  gridcolor: 'rgba(6, 182, 212, 0.1)',
                  zerolinecolor: 'rgba(6, 182, 212, 0.2)',
                  titlefont: { color: '#94a3b8' },
                  tickfont: { color: '#94a3b8' }
                },
                font: { color: '#94a3b8' }
              }}
              config={{ responsive: true }}
            />
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-cyan-500/20 bg-navy-950/50">
          <div className="p-3 bg-navy-900 flex justify-between items-center border-b border-cyan-500/20">
            <h2 className="text-lg font-semibold flex items-center text-cyan-100 font-mono">TOTAL MAGNETOMETER</h2>
          </div>
          <div className="p-4">
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.gTotal),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#8b5cf6', width: 2 },
                marker: { color: '#a78bfa', size: 6 },
                name: 'G Total'
              }]}
              layout={{
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'rgba(3, 22, 56, 0.3)',
                xaxis: { 
                  title: 'MD (ft)',
                  gridcolor: 'rgba(6, 182, 212, 0.1)',
                  zerolinecolor: 'rgba(6, 182, 212, 0.2)',
                  titlefont: { color: '#94a3b8' },
                  tickfont: { color: '#94a3b8' }
                },
                yaxis: { 
                  title: 'G Total',
                  gridcolor: 'rgba(6, 182, 212, 0.1)',
                  zerolinecolor: 'rgba(6, 182, 212, 0.2)',
                  titlefont: { color: '#94a3b8' },
                  tickfont: { color: '#94a3b8' }
                },
                font: { color: '#94a3b8' }
              }}
              config={{ responsive: true }}
            />
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-cyan-500/20 bg-navy-950/50">
          <div className="p-3 bg-navy-900 flex justify-between items-center border-b border-cyan-500/20">
            <h2 className="text-lg font-semibold flex items-center text-cyan-100 font-mono">TOTAL ACCELEROMETER</h2>
          </div>
          <div className="p-4">
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.bTotal),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#ec4899', width: 2 },
                marker: { color: '#f472b6', size: 6 },
                name: 'B Total'
              }]}
              layout={{
                height: 300,
                margin: { t: 20, r: 20, b: 40, l: 40 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'rgba(3, 22, 56, 0.3)',
                xaxis: { 
                  title: 'MD (ft)',
                  gridcolor: 'rgba(6, 182, 212, 0.1)',
                  zerolinecolor: 'rgba(6, 182, 212, 0.2)',
                  titlefont: { color: '#94a3b8' },
                  tickfont: { color: '#94a3b8' }
                },
                yaxis: { 
                  title: 'B Total',
                  gridcolor: 'rgba(6, 182, 212, 0.1)',
                  zerolinecolor: 'rgba(6, 182, 212, 0.2)',
                  titlefont: { color: '#94a3b8' },
                  tickfont: { color: '#94a3b8' }
                },
                font: { color: '#94a3b8' }
              }}
              config={{ responsive: true }}
            />
          </div>
        </div>
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