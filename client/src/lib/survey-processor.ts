
import { InsertSurvey, Survey } from '@shared/schema';
import { calculateTVD, calculateNorthSouth, calculateEastWest, calculateVS, calculateDLS } from './survey-calculations';

export function processSurveyData(
  survey: Partial<InsertSurvey>, 
  prevSurvey: Survey | null,
  proposedDirection: number
): Record<string, any> {
  const processedSurvey: Record<string, any> = {};
  
  // Parse incoming values
  const md = typeof survey.md === 'string' ? parseFloat(survey.md) : Number(survey.md || 0);
  const inc = typeof survey.inc === 'string' ? parseFloat(survey.inc) : Number(survey.inc || 0);
  const azi = typeof survey.azi === 'string' ? parseFloat(survey.azi) : Number(survey.azi || 0);

  if (prevSurvey) {
    // Get previous values
    const prevMd = typeof prevSurvey.md === 'string' ? parseFloat(prevSurvey.md) : Number(prevSurvey.md);
    const prevInc = typeof prevSurvey.inc === 'string' ? parseFloat(prevSurvey.inc) : Number(prevSurvey.inc);
    const prevAzi = typeof prevSurvey.azi === 'string' ? parseFloat(prevSurvey.azi) : Number(prevSurvey.azi);
    const prevTvd = typeof prevSurvey.tvd === 'string' ? parseFloat(prevSurvey.tvd) : Number(prevSurvey.tvd || 0);
    const prevNS = typeof prevSurvey.northSouth === 'string' ? parseFloat(prevSurvey.northSouth) : Number(prevSurvey.northSouth || 0);
    const prevEW = typeof prevSurvey.eastWest === 'string' ? parseFloat(prevSurvey.eastWest) : Number(prevSurvey.eastWest || 0);

    // Calculate values
    const tvd = calculateTVD(md, inc, prevMd, prevTvd);
    const { northSouth, isNorth } = calculateNorthSouth(md, inc, azi, prevMd, prevNS, prevSurvey.isNorth);
    const { eastWest, isEast } = calculateEastWest(md, inc, azi, prevMd, prevEW, prevSurvey.isEast);
    const vs = calculateVS(northSouth, eastWest, proposedDirection);
    const dls = calculateDLS(inc, azi, prevInc, prevAzi, md, prevMd);

    Object.assign(processedSurvey, {
      tvd: tvd.toFixed(2),
      northSouth: northSouth.toFixed(2),
      isNorth,
      eastWest: eastWest.toFixed(2),
      isEast,
      vs: vs.toFixed(2),
      dls: dls.toFixed(2)
    });
  } else {
    // First survey calculations
    const tvd = md * Math.cos((inc * Math.PI) / 180);
    const ns = md * Math.sin((inc * Math.PI) / 180) * Math.cos((azi * Math.PI) / 180);
    const ew = md * Math.sin((inc * Math.PI) / 180) * Math.sin((azi * Math.PI) / 180);
    const vs = calculateVS(Math.abs(ns), Math.abs(ew), proposedDirection);

    Object.assign(processedSurvey, {
      tvd: tvd.toFixed(2),
      northSouth: Math.abs(ns).toFixed(2),
      isNorth: ns >= 0,
      eastWest: Math.abs(ew).toFixed(2),
      isEast: ew >= 0,
      vs: vs.toFixed(2),
      dls: "0.00"
    });
  }

  return processedSurvey;
}
