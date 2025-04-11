import React, { useRef, useEffect } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { useWellContext } from '@/context/WellContext';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';

// Create a Plotly React component
const Plot = createPlotlyComponent(Plotly);

const WellboreTrajectory = () => {
  const { surveys } = useSurveyContext();
  const { wellInfo } = useWellContext();
  const plotRef = useRef<HTMLDivElement>(null);

  // Process survey data for 3D trajectory
  const preparePlotData = () => {
    if (!surveys || surveys.length === 0) return null;

    // Extract TVD, North/South, and East/West values from surveys
    const tvdData: number[] = [];
    const nsData: number[] = [];
    const ewData: number[] = [];
    const mdData: number[] = [];
    const textLabels: string[] = [];

    // Sort surveys by measured depth
    const sortedSurveys = [...surveys].sort((a, b) => {
      const mdA = typeof a.md === 'string' ? parseFloat(a.md) : Number(a.md || 0);
      const mdB = typeof b.md === 'string' ? parseFloat(b.md) : Number(b.md || 0);
      return mdA - mdB;
    });

    sortedSurveys.forEach(survey => {
      const md = typeof survey.md === 'string' ? parseFloat(survey.md) : Number(survey.md || 0);
      const tvd = typeof survey.tvd === 'string' ? parseFloat(survey.tvd) : Number(survey.tvd || 0);
      const northSouth = typeof survey.northSouth === 'string' ? parseFloat(survey.northSouth) : Number(survey.northSouth || 0);
      const eastWest = typeof survey.eastWest === 'string' ? parseFloat(survey.eastWest) : Number(survey.eastWest || 0);
      const inc = typeof survey.inc === 'string' ? parseFloat(survey.inc) : Number(survey.inc || 0);
      const azi = typeof survey.azi === 'string' ? parseFloat(survey.azi) : Number(survey.azi || 0);
      const isNorth = Boolean(survey.isNorth);
      const isEast = Boolean(survey.isEast);

      // Apply direction (North/South, East/West)
      const nsValue = isNorth ? northSouth : -northSouth;
      const ewValue = isEast ? eastWest : -eastWest;

      tvdData.push(tvd);
      nsData.push(nsValue);
      ewData.push(ewValue);
      mdData.push(md);
      textLabels.push(`MD: ${md.toFixed(2)}ft<br>TVD: ${tvd.toFixed(2)}ft<br>Inc: ${inc.toFixed(2)}°<br>Az: ${azi.toFixed(2)}°`);
    });

    return {
      tvdData,
      nsData,
      ewData,
      mdData,
      textLabels
    };
  };

  // Create the 3D plot
  useEffect(() => {
    const data = preparePlotData();
    if (!data || !plotRef.current) return;

    // Main wellbore trajectory
    const mainTrace = {
      type: 'scatter3d',
      mode: 'lines',
      x: data.nsData,
      y: data.ewData,
      z: data.tvdData,
      line: {
        color: 'rgb(0, 179, 255)',
        width: 6,
      },
      name: 'Wellbore Path'
    };

    // Survey points
    const surveyPointsTrace = {
      type: 'scatter3d',
      mode: 'markers',
      x: data.nsData,
      y: data.ewData,
      z: data.tvdData,
      text: data.textLabels,
      hoverinfo: 'text',
      marker: {
        size: 5,
        color: 'rgb(255, 180, 0)',
        opacity: 0.8,
        symbol: 'circle',
      },
      name: 'Survey Points'
    };

    // Plot layout
    const layout = {
      title: {
        text: `${wellInfo?.wellName || 'Well'} - 3D Trajectory`,
        font: {
          color: 'white',
          size: 16
        }
      },
      paper_bgcolor: 'rgba(20, 24, 38, 0.7)',
      plot_bgcolor: 'rgba(20, 24, 38, 0)',
      autosize: true,
      margin: {
        l: 0,
        r: 0,
        t: 40,
        b: 0,
        pad: 0
      },
      scene: {
        xaxis: {
          title: {
            text: 'North/South',
            font: { color: 'white' }
          },
          showgrid: true,
          zeroline: true,
          gridcolor: 'rgba(255, 255, 255, 0.1)',
          zerolinecolor: 'rgba(255, 255, 255, 0.2)',
          tickfont: { color: 'rgba(255, 255, 255, 0.7)' }
        },
        yaxis: {
          title: {
            text: 'East/West',
            font: { color: 'white' }
          },
          showgrid: true,
          zeroline: true,
          gridcolor: 'rgba(255, 255, 255, 0.1)',
          zerolinecolor: 'rgba(255, 255, 255, 0.2)',
          tickfont: { color: 'rgba(255, 255, 255, 0.7)' }
        },
        zaxis: {
          title: {
            text: 'TVD',
            font: { color: 'white' }
          },
          showgrid: true,
          zeroline: false,
          gridcolor: 'rgba(255, 255, 255, 0.1)',
          tickfont: { color: 'rgba(255, 255, 255, 0.7)' },
          autorange: 'reversed',
        },
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1 },
          center: { x: 0, y: 0, z: 0 }
        },
        aspectratio: { x: 1, y: 1, z: 1 },
        bgcolor: 'rgba(20, 24, 38, 0.3)'
      },
      showlegend: true,
      legend: {
        x: 0,
        y: 1,
        bgcolor: 'rgba(0, 0, 0, 0.3)',
        bordercolor: 'rgba(255, 255, 255, 0.2)',
        borderwidth: 1,
        font: { color: 'white' }
      }
    };

    const plotData = [mainTrace, surveyPointsTrace];
    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['select2d', 'lasso2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: `${wellInfo?.wellName || 'well'}_trajectory`
      }
    };

    Plotly.newPlot(plotRef.current, plotData, layout, config);

    // Clean up
    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [surveys, wellInfo]);

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 flex justify-between items-center border-b border-gray-700/30">
        <h2 className="font-heading text-lg font-semibold flex items-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-cyan-400">
            <path d="M12 3a9 9 0 0 0-9 9v10.5L9 18l3 4.5L15 18l6 4.5V12a9 9 0 0 0-9-9Z" />
          </svg>
          3D Wellbore Trajectory
        </h2>
      </div>
      <div className="p-4 glass-panel h-[500px] border border-gray-700/30">
        <div ref={plotRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default WellboreTrajectory;