import { Survey } from '@shared/schema';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

interface SurveyEmailData {
  survey: Survey;
  wellName: string;
  rigName: string;
  gammaImageUrl?: string;
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

export class EmailService {
  generateHtmlBody(data: SurveyEmailData): string {
    const { survey, wellName, rigName, gammaImageUrl, aiAnalysis, curveData, targetPosition } = data;
    const northSouthDir = survey.isNorth ? 'N' : 'S';
    const eastWestDir = survey.isEast ? 'E' : 'W';

    // Check if certain sections should be included
    const includeCurveData = curveData && curveData.includeInEmail;
    const includeTargetPosition = curveData?.includeTargetPosition && targetPosition;
    const includeGammaPlot = curveData?.includeGammaPlot && gammaImageUrl;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #e2e8f0; border-radius: 10px;">
        <h2 style="color: #06b6d4; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 10px; font-family: monospace;">NEW WELL TECHNOLOGIES</h2>
        <h3 style="color: #a5f3fc; margin-bottom: 20px;">Survey Data Report</h3>

        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #0e7490;">
          <h3 style="color: #22d3ee; margin-top: 0; font-family: monospace;">WELL INFORMATION</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div><strong style="color: #a5f3fc;">Well Name:</strong> ${wellName}</div>
            <div><strong style="color: #a5f3fc;">Rig Name:</strong> ${rigName}</div>
          </div>
        </div>

        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #0e7490;">
          <h3 style="color: #22d3ee; margin-top: 0; font-family: monospace;">SURVEY DETAILS</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-family: monospace;">
            <div><strong style="color: #a5f3fc;">Survey Index:</strong> <span style="color: #f0f9ff;">${survey.index}</span></div>
            <div><strong style="color: #a5f3fc;">MD:</strong> <span style="color: #f0f9ff;">${Number(survey.md).toFixed(2)} ft</span></div>
            <div><strong style="color: #a5f3fc;">Inc:</strong> <span style="color: #f0f9ff;">${Number(survey.inc).toFixed(2)}°</span></div>
            <div><strong style="color: #a5f3fc;">Azi:</strong> <span style="color: #f0f9ff;">${Number(survey.azi).toFixed(2)}°</span></div>
            <div><strong style="color: #a5f3fc;">TVD:</strong> <span style="color: #f0f9ff;">${Number(survey.tvd).toFixed(2)} ft</span></div>
            <div><strong style="color: #a5f3fc;">VS:</strong> <span style="color: #f0f9ff;">${Number(survey.vs).toFixed(2)} ft</span></div>
            <div><strong style="color: #a5f3fc;">N/S:</strong> <span style="color: #f0f9ff;">${Number(survey.northSouth).toFixed(2)} ft ${northSouthDir}</span></div>
            <div><strong style="color: #a5f3fc;">E/W:</strong> <span style="color: #f0f9ff;">${Number(survey.eastWest).toFixed(2)} ft ${eastWestDir}</span></div>
            <div><strong style="color: #a5f3fc;">DLS:</strong> <span style="color: #f0f9ff;">${Number(survey.dls).toFixed(2)}°/100ft</span></div>
            <div><strong style="color: #a5f3fc;">Build Rate:</strong> <span style="color: #f0f9ff;">${(Number(survey.dls) * Math.cos(Number(survey.toolFace || 0) * Math.PI / 180)).toFixed(2)}°/100ft</span></div>
            <div><strong style="color: #a5f3fc;">Turn Rate:</strong> <span style="color: #f0f9ff;">${(Number(survey.dls) * Math.sin(Number(survey.toolFace || 0) * Math.PI / 180)).toFixed(2)}°/100ft</span></div>
            <div><strong style="color: #a5f3fc;">Tool Face:</strong> <span style="color: #f0f9ff;">${Number(survey.toolFace || 0).toFixed(2)}°</span></div>
          </div>
        </div>

        ${aiAnalysis ? `
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #0e7490;">
          <h3 style="color: #22d3ee; margin-top: 0; font-family: monospace;">AI ANALYSIS</h3>
          <div style="display: grid; grid-template-columns: 1fr; gap: 10px; font-family: monospace;">
            <div><strong style="color: #a5f3fc;">Status:</strong> <span style="color: #f0f9ff;">${aiAnalysis.status}</span></div>
            <div><strong style="color: #a5f3fc;">Dogleg Severity:</strong> <span style="color: #f0f9ff;">${aiAnalysis.doglegs}</span></div>
            <div><strong style="color: #a5f3fc;">Survey Trend:</strong> <span style="color: #f0f9ff;">${aiAnalysis.trend}</span></div>
            <div><strong style="color: #a5f3fc;">Recommendation:</strong> <span style="color: #f0f9ff;">${aiAnalysis.recommendation}</span></div>
          </div>
        </div>
        ` : ''}

        ${includeCurveData ? `
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #0e7490;">
          <h3 style="color: #22d3ee; margin-top: 0; font-family: monospace;">CURVE DATA</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-family: monospace;">
            <div><strong style="color: #a5f3fc;">Motor Yield:</strong> <span style="color: #f0f9ff;">${Number(curveData.motorYield).toFixed(2)}°/100ft</span></div>
            <div><strong style="color: #a5f3fc;">Dog Leg Needed:</strong> <span style="color: #f0f9ff;">${Number(curveData.dogLegNeeded).toFixed(2)}°/100ft</span></div>
            <div><strong style="color: #a5f3fc;">Projected Inc:</strong> <span style="color: #f0f9ff;">${Number(curveData.projectedInc).toFixed(2)}°</span></div>
            <div><strong style="color: #a5f3fc;">Projected Az:</strong> <span style="color: #f0f9ff;">${Number(curveData.projectedAz).toFixed(2)}°</span></div>
            <div><strong style="color: #a5f3fc;">Slide Seen:</strong> <span style="color: #f0f9ff;">${Number(curveData.slideSeen).toFixed(2)} ft</span></div>
            <div><strong style="color: #a5f3fc;">Slide Ahead:</strong> <span style="color: #f0f9ff;">${Number(curveData.slideAhead).toFixed(2)} ft</span></div>
          </div>
        </div>
        ` : ''}

        ${includeTargetPosition ? `
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #0e7490;">
          <h3 style="color: #22d3ee; margin-top: 0; font-family: monospace;">TARGET POSITION</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-family: monospace;">
            <div>
              <strong style="color: #a5f3fc;">Vertical Position:</strong> 
              <span style="color: #f0f9ff;">${Number(targetPosition.verticalPosition).toFixed(2)}°</span>
              ${targetPosition.isAbove ? '<span style="color: #10b981;"> ABOVE TARGET</span>' : 
               targetPosition.isBelow ? '<span style="color: #ef4444;"> BELOW TARGET</span>' : 
               '<span style="color: #06b6d4;"> ON TARGET</span>'}
            </div>
            <div>
              <strong style="color: #a5f3fc;">Horizontal Position:</strong> 
              <span style="color: #f0f9ff;">${Number(targetPosition.horizontalPosition).toFixed(2)}°</span>
              ${targetPosition.isLeft ? '<span style="color: #3b82f6;"> LEFT OF TARGET</span>' : 
               targetPosition.isRight ? '<span style="color: #f59e0b;"> RIGHT OF TARGET</span>' : 
               '<span style="color: #06b6d4;"> ON TARGET</span>'}
            </div>
          </div>
        </div>
        ` : ''}

        ${includeGammaPlot && gammaImageUrl ? `
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #0e7490;">
          <h3 style="color: #22d3ee; margin-top: 0; font-family: monospace;">GAMMA PLOT</h3>
          <div style="text-align: center; margin-top: 10px;">
            <img src="${gammaImageUrl}" alt="Gamma Plot" style="max-width: 100%; border-radius: 4px; border: 1px solid #0e7490;" />
          </div>
        </div>
        ` : ''}

        <div style="color: #64748b; font-size: 12px; margin-top: 30px; padding-top: 10px; border-top: 1px solid #1e293b; font-family: monospace;">
          Generated by New Well Technologies AI-MWD Dashboard on ${new Date().toLocaleString()}
        </div>
      </div>
    `;
  }

  openEmailClient(options: EmailOptions): void {
    try {
      const { to, subject, body } = options;
      const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    } catch (error) {
      console.error('Error opening email client:', error);
      throw new Error('Failed to open email client');
    }
  }

  sendSurveyEmail(emailAddresses: string, data: SurveyEmailData): void {
    const subject = `MWD Survey #${data.survey.index} - ${data.wellName} - MD ${Number(data.survey.md).toFixed(2)}ft`;
    const body = this.generateHtmlBody(data);

    this.openEmailClient({
      to: emailAddresses,
      subject,
      body
    });
  }
}

export const emailService = new EmailService();