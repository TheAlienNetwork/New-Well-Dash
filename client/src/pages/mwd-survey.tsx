import React, { useState, useEffect } from 'react';
import SurveyTable from '@/components/dashboard/SurveyTable';
import CurveData from '@/components/dashboard/CurveData';
import GammaPlot from '@/components/dashboard/GammaPlot';
import AIAnalytics from '@/components/dashboard/AIAnalytics';
import SurveyModal from '@/components/dashboard/SurveyModal';
import { useSurveyContext } from '@/context/SurveyContext';
import { Survey } from '@shared/schema';
import TargetPosition from '@/components/dashboard/TargetPosition';
import Plot from 'react-plotly.js'; // Added import for Plotly


export default function MwdSurvey() {
  const { 
    showSurveyModal, 
    setShowSurveyModal, 
    modalSurvey, 
    setModalSurvey 
  } = useSurveyContext();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [surveys, setSurveys] = useState<Survey[]>([]); // Added state for surveys
  const [curveData, setCurveData] = useState<any>(null); // Added state for curve data

  const [incDiffPlot, setIncDiffPlot] = useState<any[]>([]);
  const [azDiffPlot, setAzDiffPlot] = useState<any[]>([]);
  const [totalPlot, setTotalPlot] = useState<any[]>([]);

  useEffect(() => {
    // Fetch surveys and curveData - Replace with actual data fetching logic
    // For example: fetch('/api/surveys').then(res => res.json()).then(data => setSurveys(data));
    const mockSurveys = [
      { md: 100, inc: 10, azi: 20, gTotal: 100, bTotal: 100, dipAngle: 5 },
      { md: 200, inc: 15, azi: 25, gTotal: 200, bTotal: 200, dipAngle: 10 },
      { md: 300, inc: 20, azi: 30, gTotal: 300, bTotal: 300, dipAngle: 15 }
    ];
    setSurveys(mockSurveys);
    setCurveData({aboveTarget: 5, belowTarget: 2, leftTarget: 10, rightTarget: 5});

  }, []);

  useEffect(() => {
    if (surveys.length > 0) {
      // Calculate differences for plots
      const incDiffs = surveys.map((s, i) => ({
        x: s.md,
        y: i > 0 ? Math.abs(s.inc - surveys[i-1].inc) : 0
      }));
      setIncDiffPlot(incDiffs);

      const azDiffs = surveys.map((s, i) => ({
        x: s.md,
        y: i > 0 ? Math.abs(s.azi - surveys[i-1].azi) : 0
      }));
      setAzDiffPlot(azDiffs);

      const totals = surveys.map(s => ({
        x: s.md,
        gTotal: s.gTotal,
        bTotal: s.bTotal,
        dip: s.dipAngle
      }));
      setTotalPlot(totals);
    }
  }, [surveys]);

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

  // Assuming 'projections' data is available from context or props.  Needs to be added to component.
  const projections = {}; // Placeholder - needs actual data source

  return (
    <div className="flex flex-col gap-4">
      {/* Survey Table Section */}
      <div className="w-full">
        <SurveyTable
          onAddSurvey={handleAddSurvey}
          onEditSurvey={handleEditSurvey}
          surveys={surveys} // Pass surveys to the table
          setSurveys={setSurveys} // Allow table to update surveys
        />
      </div>

      {/* Data Display Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Target Position */}
        <TargetPosition projections={projections} curveData={curveData}/> {/* Added TargetPosition component */}

        {/* Curve Data Container */}
        <div className="xl:col-span-2">
          <CurveData />
        </div>

        {/* Gamma Plot Container */}
        <div className="xl:col-span-1">
          <GammaPlot />
        </div>
      </div>

      {/* Target Position Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-lg">
          <h3 className="font-heading text-lg mb-2">Vertical Position</h3>
          <div className="text-2xl font-mono">
            {curveData?.aboveTarget && `${curveData.aboveTarget}ft Above`}
            {curveData?.belowTarget && `${curveData.belowTarget}ft Below`}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-lg">
          <h3 className="font-heading text-lg mb-2">Horizontal Position</h3>
          <div className="text-2xl font-mono">
            {curveData?.leftTarget && `${curveData.leftTarget}ft Left`}
            {curveData?.rightTarget && `${curveData.rightTarget}ft Right`}
          </div>
        </div>
      </div>

      {/* New Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-4 rounded-lg">
          <h3 className="font-heading text-lg mb-2">Inclination Differences</h3>
          <Plot
            data={[{
              x: incDiffPlot.map(p => p.x),
              y: incDiffPlot.map(p => p.y),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Inc Diff'
            }]}
            layout={{
              height: 300,
              margin: { t: 20, r: 20, b: 40, l: 50 },
              yaxis: { title: 'Difference (°)' },
              xaxis: { title: 'MD (ft)' }
            }}
          />
        </div>

        <div className="glass-panel p-4 rounded-lg">
          <h3 className="font-heading text-lg mb-2">Azimuth Differences</h3>
          <Plot
            data={[{
              x: azDiffPlot.map(p => p.x),
              y: azDiffPlot.map(p => p.y),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Az Diff'
            }]}
            layout={{
              height: 300,
              margin: { t: 20, r: 20, b: 40, l: 50 },
              yaxis: { title: 'Difference (°)' },
              xaxis: { title: 'MD (ft)' }
            }}
          />
        </div>

        <div className="glass-panel p-4 rounded-lg col-span-2">
          <h3 className="font-heading text-lg mb-2">Field Totals & Dip</h3>
          <Plot
            data={[
              {
                x: totalPlot.map(p => p.x),
                y: totalPlot.map(p => p.gTotal),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'G Total'
              },
              {
                x: totalPlot.map(p => p.x),
                y: totalPlot.map(p => p.bTotal),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'B Total'
              },
              {
                x: totalPlot.map(p => p.x),
                y: totalPlot.map(p => p.dip),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Dip Angle'
              }
            ]}
            layout={{
              height: 300,
              margin: { t: 20, r: 20, b: 40, l: 50 },
              yaxis: { title: 'Value' },
              xaxis: { title: 'MD (ft)' }
            }}
          />
        </div>
      </div>

      {/* AI Analytics */}
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