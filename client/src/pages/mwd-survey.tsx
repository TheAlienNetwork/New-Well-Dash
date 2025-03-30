import React, { useState, useEffect } from 'react';
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
    curveData, // Added curveData from context
    projections: contextProjections // Get projections from context instead of calculating locally
  } = useSurveyContext();
  
  // Create a local projections object that's derived from curve data if needed
  const [localProjections, setLocalProjections] = useState<any>({
    isAbove: false,
    isBelow: false,
    isLeft: false,
    isRight: false
  });
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [verticalPosition, setVerticalPosition] = useState<number>(0);
  const [horizontalPosition, setHorizontalPosition] = useState<number>(0);

  // Calculate vertical and horizontal positions from curve data
  useEffect(() => {
    if (curveData) {
      // If we have above target value, use it, otherwise use below target value (negative)
      const verticalOffset = Number(curveData.aboveTarget || 0) > 0 
        ? Number(curveData.aboveTarget) 
        : -Number(curveData.belowTarget || 0);
      
      // If we have right target value, use it, otherwise use left target value (negative)
      const horizontalOffset = Number(curveData.rightTarget || 0) > 0 
        ? Number(curveData.rightTarget) 
        : -Number(curveData.leftTarget || 0);
      
      // Update positions
      setVerticalPosition(verticalOffset);
      setHorizontalPosition(horizontalOffset);
      
      // Update local projections based on the value
      setLocalProjections({
        isAbove: Number(curveData.aboveTarget || 0) > 0,
        isBelow: Number(curveData.belowTarget || 0) > 0,
        isLeft: Number(curveData.leftTarget || 0) > 0,
        isRight: Number(curveData.rightTarget || 0) > 0,
        projectedInc: Number(curveData.projectedInc || 0),
        projectedAz: Number(curveData.projectedAz || 0)
      });
    }
  }, [curveData]);

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
          projections={localProjections}
          verticalPosition={verticalPosition}
          horizontalPosition={horizontalPosition}
        /> 

        <div className="xl:col-span-2">
          <CurveData />
        </div>

        <div className="xl:col-span-3">
          <GammaPlot />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="card border border-gray-700 bg-gray-900/50 overflow-hidden shadow-md">
          <div className="p-3 bg-gray-800 flex justify-between items-center border-b border-gray-700">
            <h2 className="text-lg font-semibold flex items-center text-white">Inclination Plot</h2>
          </div>
          <div className="p-4">
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.inc),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#3b82f6', width: 3 },
                marker: { color: '#60a5fa', size: 8 },
                name: 'Inclination'
              }]}
              layout={{
                height: 320,
                autosize: true,
                margin: { t: 20, r: 30, b: 50, l: 60 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'rgba(30, 41, 59, 0.4)',
                xaxis: { 
                  title: 'Measured Depth (ft)',
                  gridcolor: 'rgba(148, 163, 184, 0.15)',
                  zerolinecolor: 'rgba(148, 163, 184, 0.3)',
                  titlefont: { color: '#e2e8f0', size: 14 },
                  tickfont: { color: '#e2e8f0', size: 12 }
                },
                yaxis: { 
                  title: 'Inclination (°)',
                  gridcolor: 'rgba(148, 163, 184, 0.15)',
                  zerolinecolor: 'rgba(148, 163, 184, 0.3)',
                  titlefont: { color: '#e2e8f0', size: 14 },
                  tickfont: { color: '#e2e8f0', size: 12 }
                },
                font: { color: '#e2e8f0' }
              }}
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="card border border-gray-700 bg-gray-900/50 overflow-hidden shadow-md">
          <div className="p-3 bg-gray-800 flex justify-between items-center border-b border-gray-700">
            <h2 className="text-lg font-semibold flex items-center text-white">Azimuth Plot</h2>
          </div>
          <div className="p-4">
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.azi),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#0ea5e9', width: 3 },
                marker: { color: '#38bdf8', size: 8 },
                name: 'Azimuth'
              }]}
              layout={{
                height: 320,
                autosize: true,
                margin: { t: 20, r: 30, b: 50, l: 60 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'rgba(30, 41, 59, 0.4)',
                xaxis: { 
                  title: 'Measured Depth (ft)',
                  gridcolor: 'rgba(148, 163, 184, 0.15)',
                  zerolinecolor: 'rgba(148, 163, 184, 0.3)',
                  titlefont: { color: '#e2e8f0', size: 14 },
                  tickfont: { color: '#e2e8f0', size: 12 }
                },
                yaxis: { 
                  title: 'Azimuth (°)',
                  gridcolor: 'rgba(148, 163, 184, 0.15)',
                  zerolinecolor: 'rgba(148, 163, 184, 0.3)',
                  titlefont: { color: '#e2e8f0', size: 14 },
                  tickfont: { color: '#e2e8f0', size: 12 }
                },
                font: { color: '#e2e8f0' }
              }}
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="card border border-gray-700 bg-gray-900/50 overflow-hidden shadow-md">
          <div className="p-3 bg-gray-800 flex justify-between items-center border-b border-gray-700">
            <h2 className="text-lg font-semibold flex items-center text-white">Total Magnetometer</h2>
          </div>
          <div className="p-4">
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.gTotal),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#8b5cf6', width: 3 },
                marker: { color: '#a78bfa', size: 8 },
                name: 'G Total'
              }]}
              layout={{
                height: 320,
                autosize: true,
                margin: { t: 20, r: 30, b: 50, l: 60 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'rgba(30, 41, 59, 0.4)',
                xaxis: { 
                  title: 'Measured Depth (ft)',
                  gridcolor: 'rgba(148, 163, 184, 0.15)',
                  zerolinecolor: 'rgba(148, 163, 184, 0.3)',
                  titlefont: { color: '#e2e8f0', size: 14 },
                  tickfont: { color: '#e2e8f0', size: 12 }
                },
                yaxis: { 
                  title: 'G Total',
                  gridcolor: 'rgba(148, 163, 184, 0.15)',
                  zerolinecolor: 'rgba(148, 163, 184, 0.3)',
                  titlefont: { color: '#e2e8f0', size: 14 },
                  tickfont: { color: '#e2e8f0', size: 12 }
                },
                font: { color: '#e2e8f0' }
              }}
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="card border border-gray-700 bg-gray-900/50 overflow-hidden shadow-md">
          <div className="p-3 bg-gray-800 flex justify-between items-center border-b border-gray-700">
            <h2 className="text-lg font-semibold flex items-center text-white">Total Accelerometer</h2>
          </div>
          <div className="p-4">
            <Plot
              data={[{
                x: surveys.map(s => s.md),
                y: surveys.map(s => s.bTotal),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#ec4899', width: 3 },
                marker: { color: '#f472b6', size: 8 },
                name: 'B Total'
              }]}
              layout={{
                height: 320,
                autosize: true,
                margin: { t: 20, r: 30, b: 50, l: 60 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'rgba(30, 41, 59, 0.4)',
                xaxis: { 
                  title: 'Measured Depth (ft)',
                  gridcolor: 'rgba(148, 163, 184, 0.15)',
                  zerolinecolor: 'rgba(148, 163, 184, 0.3)',
                  titlefont: { color: '#e2e8f0', size: 14 },
                  tickfont: { color: '#e2e8f0', size: 12 }
                },
                yaxis: { 
                  title: 'B Total',
                  gridcolor: 'rgba(148, 163, 184, 0.15)',
                  zerolinecolor: 'rgba(148, 163, 184, 0.3)',
                  titlefont: { color: '#e2e8f0', size: 14 },
                  tickfont: { color: '#e2e8f0', size: 12 }
                },
                font: { color: '#e2e8f0' }
              }}
              config={{ responsive: true }}
              style={{ width: '100%' }}
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