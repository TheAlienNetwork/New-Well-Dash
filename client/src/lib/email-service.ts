import { Survey } from '@shared/schema';
import html2canvas from 'html2canvas';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  attachments?: File[];
  imageDataUrl?: string;
}

interface GammaDataPoint {
  depth: number | string;
  value: number | string;
}

declare global {
  interface Window {
    gammaData?: GammaDataPoint[];
  }
}

export interface SurveyEmailData {
  survey: Survey;
  wellName: string;
  rigName: string;
  gammaImageUrl?: string;
  attachments?: File[];
  additionalNote?: string;
  aiAnalysis?: {
    status: string;
    doglegs: string;
    trend: string;
    recommendation: string;
  };
  curveData?: {
    motorYield: number;
    dogLegNeeded: number;
    projectedInc: number;
    projectedAz: number;
    slideSeen: number;
    slideAhead: number;
    includeInEmail: boolean;
    includeTargetPosition: boolean;
    includeGammaPlot: boolean;
  };
  targetPosition?: {
    verticalPosition: number;
    horizontalPosition: number;
    isAbove?: boolean;
    isBelow?: boolean;
    isLeft?: boolean;
    isRight?: boolean;
  };
}

class EmailService {
  // Generate HTML body content
  generateHtmlBody(data: SurveyEmailData): string {
    const { survey, wellName, rigName, gammaImageUrl, aiAnalysis, curveData, targetPosition, additionalNote, projections } = data;
    const northSouthDir = survey.isNorth ? 'N' : 'S';
    const eastWestDir = survey.isEast ? 'E' : 'W';

    // Check if certain sections should be included
    const includeCurveData = curveData && curveData.includeInEmail;
    const includeTargetPosition = curveData?.includeTargetPosition && (targetPosition || projections);
    const includeGammaPlot = curveData?.includeGammaPlot && gammaImageUrl;

    // Status indicators
    const getStatusBadge = (status: string) => {
      const colors: Record<string, string> = {
        'Passed': 'background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);',
        'Warning': 'background-color: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);',
        'Alert': 'background-color: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);'
      };
      return `<span style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; ${colors[status] || colors['Passed']}">
                ${status}
              </span>`;
    };

    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 25px; background-color: #1a1f2e; color: #e2e8f0; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);">
        <!-- Header with Logo -->
        <div style="display: flex; align-items: center; margin-bottom: 25px; border-bottom: 2px solid rgba(59, 130, 246, 0.3); padding-bottom: 15px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; margin-right: 15px; font-size: 18px;">NWT</div>
          <div>
            <h1 style="margin: 0; color: white; font-size: 24px; line-height: 1.2;">NEW WELL TECHNOLOGIES</h1>
            <p style="margin: 2px 0 0; color: #93c5fd; font-size: 14px;">Advanced Measurement While Drilling</p>
          </div>
        </div>

        <!-- Report Header -->
        <div style="background: linear-gradient(to right, rgba(30, 41, 59, 0.7), rgba(30, 41, 59, 0.9)); padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3b82f6; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div>
              <h2 style="margin: 0 0 5px; color: white; font-size: 20px;">MWD Survey Report #${survey.index}</h2>
              <p style="margin: 0; color: #93c5fd; font-size: 13px;">Measured Depth: <span style="color: #60a5fa; font-weight: 600;">${Number(survey.md).toFixed(2)} ft</span></p>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 6px; text-align: right; border: 1px solid rgba(59, 130, 246, 0.2);">
              <div style="font-size: 13px; color: #93c5fd;">Report Date</div>
              <div style="font-size: 15px; color: white; font-weight: 500;">${new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <!-- Well Information with modern card style -->
        <div style="background-color: rgba(30, 41, 59, 0.7); padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border: 1px solid rgba(59, 130, 246, 0.15);">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 24px; height: 24px; background-color: rgba(59, 130, 246, 0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 22h20"></path><path d="M12 2v6.5l2-2 2 2V2"></path><path d="M17 22V11l-5-1-5 1v11"></path>
              </svg>
            </div>
            <h3 style="color: white; margin: 0; font-size: 16px;">Well Information</h3>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 12px; color: #93c5fd; margin-bottom: 3px;">Well Name</div>
              <div style="font-size: 15px; color: white; font-weight: 500;">${wellName}</div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 12px; color: #93c5fd; margin-bottom: 3px;">Rig Name</div>
              <div style="font-size: 15px; color: white; font-weight: 500;">${rigName}</div>
            </div>
          </div>
        </div>

        <!-- Survey Details with modern grid layout -->
        <div style="background-color: rgba(30, 41, 59, 0.7); padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border: 1px solid rgba(59, 130, 246, 0.15);">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 24px; height: 24px; background-color: rgba(59, 130, 246, 0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3m18 0v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8m18 0H3"></path>
              </svg>
            </div>
            <h3 style="color: white; margin: 0; font-size: 16px;">Survey Details</h3>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 15px;">
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 11px; color: #93c5fd; margin-bottom: 3px;">Measured Depth</div>
              <div style="font-size: 16px; color: #60a5fa; font-weight: 600;">${Number(survey.md).toFixed(2)} <span style="font-size: 11px; color: #93c5fd;">ft</span></div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 11px; color: #93c5fd; margin-bottom: 3px;">Inclination</div>
              <div style="font-size: 16px; color: #10b981; font-weight: 600;">${Number(survey.inc).toFixed(2)} <span style="font-size: 11px; color: #93c5fd;">°</span></div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 11px; color: #93c5fd; margin-bottom: 3px;">Azimuth</div>
              <div style="font-size: 16px; color: #8b5cf6; font-weight: 600;">${Number(survey.azi).toFixed(2)} <span style="font-size: 11px; color: #93c5fd;">°</span></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 11px; color: #93c5fd; margin-bottom: 3px;">TVD</div>
              <div style="font-size: 14px; color: white; font-weight: 500;">${Number(survey.tvd).toFixed(2)} <span style="font-size: 11px; color: #93c5fd;">ft</span></div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 11px; color: #93c5fd; margin-bottom: 3px;">Vertical Section</div>
              <div style="font-size: 14px; color: white; font-weight: 500;">${Number(survey.vs).toFixed(2)} <span style="font-size: 11px; color: #93c5fd;">ft</span></div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 11px; color: #93c5fd; margin-bottom: 3px;">DLS</div>
              <div style="font-size: 14px; color: white; font-weight: 500;">${Number(survey.dls).toFixed(2)} <span style="font-size: 11px; color: #93c5fd;">°/100ft</span></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px;">
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 11px; color: #93c5fd; margin-bottom: 3px;">N/S</div>
              <div style="font-size: 14px; color: white; font-weight: 500;">${Number(survey.northSouth).toFixed(2)} <span style="font-size: 11px; color: #93c5fd;">ft ${northSouthDir}</span></div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 11px; color: #93c5fd; margin-bottom: 3px;">E/W</div>
              <div style="font-size: 14px; color: white; font-weight: 500;">${Number(survey.eastWest).toFixed(2)} <span style="font-size: 11px; color: #93c5fd;">ft ${eastWestDir}</span></div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.5); padding: 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.1);">
              <div style="font-size: 11px; color: #93c5fd; margin-bottom: 3px;">Tool Face</div>
              <div style="font-size: 14px; color: white; font-weight: 500;">${Number(survey.toolFace || 0).toFixed(2)} <span style="font-size: 11px; color: #93c5fd;">°</span></div>
            </div>
          </div>
        </div>

        ${aiAnalysis ? `
        <!-- AI Analysis with frosted glass styling -->
        <div style="background-color: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 20px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border: 1px solid rgba(124, 58, 237, 0.2);">
          <div style="display: flex; align-items: center; margin-bottom: 15px; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <div style="width: 28px; height: 28px; background-color: rgba(124, 58, 237, 0.2); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M21.17 8H12V2.83c2 .92 3.72 2.5 4.76 4.5.23.44.62.59 1.17.42.55-.17.93-.55.93-1 0-.67-.5-1.33-1.17-1.5-.43-.18-.82-.07-1.17.42A10.04 10.04 0 0 0 12 2.83V12h9.17A10.05 10.05 0 0 0 17.5 7.23c-.18-.43-.07-.82.42-1.17.5-.34.83-.83.83-1.33 0-.5-.33-1-.83-1.33-.5-.34-1-.34-1.5 0-.49.33-.58.73-.42 1.17A10.04 10.04 0 0 0 21.17 8z"></path>
                </svg>
              </div>
              <h3 style="color: white; margin: 0; font-size: 18px;">AI Analysis</h3>
            </div>
            <div>
              ${getStatusBadge(aiAnalysis.status)}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 14px;">
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 14px; border-radius: 8px; border: 1px solid rgba(124, 58, 237, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #c4b5fd; margin-bottom: 4px;">Dogleg Severity Analysis</div>
              <div style="font-size: 16px; color: white; font-weight: 500;">${aiAnalysis.doglegs}</div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 14px; border-radius: 8px; border: 1px solid rgba(124, 58, 237, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #c4b5fd; margin-bottom: 4px;">Survey Trend</div>
              <div style="font-size: 16px; color: white; font-weight: 500;">${aiAnalysis.trend}</div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 14px; border-radius: 8px; border-left: 3px solid #8b5cf6; border-top: 1px solid rgba(124, 58, 237, 0.2); border-right: 1px solid rgba(124, 58, 237, 0.2); border-bottom: 1px solid rgba(124, 58, 237, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #c4b5fd; margin-bottom: 4px;">AI Recommendation</div>
              <div style="font-size: 16px; color: white; font-weight: 500; line-height: 1.5;">${aiAnalysis.recommendation}</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${includeCurveData ? `
        <!-- Curve Data with frosted glass styling -->
        <div style="background-color: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 20px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border: 1px solid rgba(59, 130, 246, 0.2);">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 28px; height: 28px; background-color: rgba(16, 185, 129, 0.2); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"></path><path d="M3 15s2-2 5-2 5 2 8-2 5-2 5-2"></path>
              </svg>
            </div>
            <h3 style="color: white; margin: 0; font-size: 18px;">Curve Data Analysis</h3>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px;">
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 14px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #6ee7b7; margin-bottom: 4px;">Motor Yield</div>
              <div style="font-size: 18px; color: #10b981; font-weight: 600;">${Number(curveData.motorYield || 0).toFixed(2)} <span style="font-size: 12px; color: #6ee7b7;">°/100ft</span></div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 14px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #6ee7b7; margin-bottom: 4px;">Dog Leg Needed</div>
              <div style="font-size: 18px; color: #10b981; font-weight: 600;">${Number(curveData.dogLegNeeded || 0).toFixed(2)} <span style="font-size: 12px; color: #6ee7b7;">°/100ft</span></div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 14px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #6ee7b7; margin-bottom: 4px;">Projected Inc</div>
              <div style="font-size: 18px; color: #10b981; font-weight: 600;">${Number(curveData.projectedInc || 0).toFixed(2)} <span style="font-size: 12px; color: #6ee7b7;">°</span></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 14px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #6ee7b7; margin-bottom: 4px;">Projected Az</div>
              <div style="font-size: 18px; color: white; font-weight: 500;">${Number(curveData.projectedAz || 0).toFixed(2)} <span style="font-size: 12px; color: #6ee7b7;">°</span></div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 14px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #6ee7b7; margin-bottom: 4px;">Slide Seen</div>
              <div style="font-size: 18px; color: white; font-weight: 500;">${Number(curveData.slideSeen || 0).toFixed(2)} <span style="font-size: 12px; color: #6ee7b7;">ft</span></div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 14px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #6ee7b7; margin-bottom: 4px;">Slide Ahead</div>
              <div style="font-size: 18px; color: white; font-weight: 500;">${Number(curveData.slideAhead || 0).toFixed(2)} <span style="font-size: 12px; color: #6ee7b7;">ft</span></div>
</div>
          </div>
        </div>
        ` : ''}

        ${includeTargetPosition ? `
        <!-- Target Position with frosted glass styling -->
        <div style="background-color: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 20px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border: 1px solid rgba(245, 158, 11, 0.2);">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 28px; height: 28px; background-color: rgba(245, 158, 11, 0.2); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <h3 style="color: white; margin: 0; font-size: 18px;">Target Position</h3>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 16px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #fcd34d; margin-bottom: 6px;">Vertical Position</div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 18px; color: white; font-weight: 600;">${Number(targetPosition?.verticalPosition || projections?.verticalPosition || 0).toFixed(2)}°</div>
                <div>
                  ${targetPosition?.isAbove || projections?.isAbove ? 
                    '<span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; background-color: rgba(16, 185, 129, 0.15); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">ABOVE TARGET</span>' : 
                    targetPosition?.isBelow || projections?.isBelow ? 
                    '<span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; background-color: rgba(239, 68, 68, 0.15); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">BELOW TARGET</span>' : 
                    '<span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; background-color: rgba(6, 182, 212, 0.15); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.3); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">ON TARGET</span>'}
                </div>
              </div>
            </div>
            <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 16px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 13px; color: #fcd34d; margin-bottom: 6px;">Horizontal Position</div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 18px; color: white; font-weight: 600;">${Number(targetPosition?.horizontalPosition || projections?.horizontalPosition || 0).toFixed(2)}°</div>
                <div>
                  ${targetPosition?.isLeft || projections?.isLeft ? 
                    '<span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; background-color: rgba(59, 130, 246, 0.15); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">LEFT OF TARGET</span>' : 
                    targetPosition?.isRight || projections?.isRight ? 
                    '<span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; background-color: rgba(245, 158, 11, 0.15); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">RIGHT OF TARGET</span>' : 
                    '<span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; background-color: rgba(6, 182, 212, 0.15); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.3); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">ON TARGET</span>'}
                </div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
        ${includeGammaPlot && gammaImageUrl ? `
        <!-- Gamma Plot with frosted glass styling -->
        <div style="background-color: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 20px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border: 1px solid rgba(59, 130, 246, 0.2);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 28px; height: 28px; background-color: rgba(16, 185, 129, 0.2); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 style="color: white; margin: 0; font-size: 18px;">Gamma Data Plot (Last 100ft)</h3>
            </div>
            <div style="background: rgba(16, 185, 129, 0.15); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); color: #10b981; padding: 4px 10px; font-size: 12px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3); display: flex; align-items: center; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
              <span style="display: inline-block; width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; margin-right: 6px;"></span>
              <span>Live Data</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 15px; background-color: rgba(15, 22, 41, 0.8); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 20px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
            <!-- Using GIF format for the gamma plot to simulate real-time updates - Now larger -->
            <img src="${gammaImageUrl}" alt="Gamma Plot" style="width: 100%; max-width: 850px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);" />
            <div style="margin-top: 12px; font-size: 12px; color: #93c5fd; text-align: left; padding: 0 10px;">
              <div style="display: flex; align-items: center; margin-bottom: 5px;">
                <div style="width: 10px; height: 10px; background-color: #10b981; border-radius: 50%; margin-right: 8px;"></div>
                <span>Gamma Reading (gAPI)</span>
              </div>
              <div style="color: #cbd5e1; font-size: 11px;">Last 100ft of data shown - This visualization updates in real time with new data</div>
            </div>
          </div>
        </div>
        ` : ''}
        ${additionalNote ? `
        <!-- Additional Notes with frosted glass styling -->
        <div style="background-color: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 20px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); border: 1px solid rgba(59, 130, 246, 0.2);">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 28px; height: 28px; background-color: rgba(59, 130, 246, 0.2); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <h3 style="color: white; margin: 0; font-size: 18px;">Additional Notes</h3>
          </div>

          <div style="background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 18px; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2); box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            <div style="color: white; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${additionalNote}</div>
          </div>
        </div>
        ` : ''}

        <!-- Footer with frosted glass styling -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding: 15px; border-top: 1px solid rgba(59, 130, 246, 0.2); font-size: 13px; color: #64748b; background-color: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-radius: 0px 0px 10px 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <div style="display: flex; align-items: center;">
            <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: bold; margin-right: 10px; font-size: 12px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);">NWT</div>
            <div>Generated by New Well Technologies<br>Advanced MWD Platform</div>
          </div>
          <div style="text-align: right; background-color: rgba(30, 41, 59, 0.4); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
            <div>${new Date().toLocaleDateString()}</div>
            <div>${new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Copy content to clipboard
  async copyToClipboard(content: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy content:', err);
      // Fallback method
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  // Open email client with content
  async openEmailClient(options: EmailOptions): Promise<void> {
    const { to, subject, body, imageDataUrl } = options;

    // Copy formatted content to clipboard
    if (imageDataUrl) {
      try {
        await this.copyImageToClipboard(imageDataUrl);
      } catch (err) {
        console.error('Failed to copy image:', err);
      }
    } else {
      await this.copyToClipboard(body);
    }

    // Create mailto URL
    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}`;

    // Open default email client
    window.location.href = mailtoUrl;

    // Show instructions dialog
    this.showInstructions(options);
  }

  // Show instructions dialog
  private showInstructions(options: EmailOptions): void {
    const instructions = document.createElement('div');
    instructions.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                  max-width: 400px; z-index: 10000;">
        <h3 style="margin-top: 0; color: #2563eb;">Email Ready</h3>
        <p>Your email client has been opened. Please:</p>
        <ol style="margin-bottom: 15px;">
          <li>Click in the email body</li>
          <li>Press Ctrl+V (or ⌘+V on Mac) to paste the content</li>
          ${options.attachments?.length ? `
          <li>Add the following attachments:
            <ul style="margin-top: 5px;">
              ${options.attachments.map(file => `<li>${file.name}</li>`).join('')}
            </ul>
          </li>` : ''}
        </ol>
        <button onclick="this.parentElement.remove()" 
                style="background: #2563eb; color: white; border: none; padding: 8px 16px; 
                       border-radius: 4px; cursor: pointer;">
          Got it
        </button>
      </div>
    `;
    document.body.appendChild(instructions);

    // Auto-remove after 12 seconds
    setTimeout(() => {
      if (document.body.contains(instructions)) {
        document.body.removeChild(instructions);
      }
    }, 12000);
  }

  // Helper function to copy image to clipboard
  private async copyImageToClipboard(imageDataUrl: string): Promise<void> {
    try {
      const img = await fetch(imageDataUrl);
      const blob = await img.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      throw err;
    }
  }

  sendSurveyEmail(emailAddresses: string, data: SurveyEmailData): void {
    const formattedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });

    const subject = `[NWT] Survey Report #${data.survey.index} | ${data.wellName} | ${Number(data.survey.md).toFixed(2)}ft | ${formattedDate}`;
    const body = data.emailBody || this.generateHtmlBody(data);

    this.openEmailClient({
      to: emailAddresses,
      subject,
      body,
      attachments: data.attachments,
      imageDataUrl: data.gammaImageUrl
    });
  }
}

export const emailService = new EmailService();