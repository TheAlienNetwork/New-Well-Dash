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
  };
}

export class EmailService {
  generateHtmlBody(data: SurveyEmailData): string {
    const { survey, wellName, rigName, gammaImageUrl, aiAnalysis, curveData } = data;
    const northSouthDir = survey.isNorth ? 'N' : 'S';
    const eastWestDir = survey.isEast ? 'E' : 'W';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Survey Data Report</h2>

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e40af; margin-top: 0;">Well Information</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div><strong>Well Name:</strong> ${wellName}</div>
            <div><strong>Rig Name:</strong> ${rigName}</div>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e40af; margin-top: 0;">Survey Details</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div><strong>Survey Index:</strong> ${survey.index}</div>
            <div><strong>MD:</strong> ${survey.md.toFixed(2)}ft</div>
            <div><strong>Inc:</strong> ${survey.inc.toFixed(2)}°</div>
            <div><strong>Azi:</strong> ${survey.azi.toFixed(2)}°</div>
            <div><strong>TVD:</strong> ${survey.tvd.toFixed(2)}ft</div>
            <div><strong>VS:</strong> ${survey.vs.toFixed(2)}ft</div>
            <div><strong>N/S:</strong> ${survey.northSouth.toFixed(2)}ft ${northSouthDir}</div>
            <div><strong>E/W:</strong> ${survey.eastWest.toFixed(2)}ft ${eastWestDir}</div>
            <div><strong>DLS:</strong> ${survey.dls.toFixed(2)}°/100ft</div>
            <div><strong>Build Rate:</strong> ${(survey.dls * Math.cos(survey.toolFace * Math.PI / 180)).toFixed(2)}°/100ft</div>
            <div><strong>Turn Rate:</strong> ${(survey.dls * Math.sin(survey.toolFace * Math.PI / 180)).toFixed(2)}°/100ft</div>
            <div><strong>Tool Face:</strong> ${survey.toolFace.toFixed(2)}°</div>
          </div>
        </div>

        ${aiAnalysis ? `
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e40af; margin-top: 0;">AI Analysis</h3>
          <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
            <div><strong>Status:</strong> ${aiAnalysis.status}</div>
            <div><strong>Dogleg Severity:</strong> ${aiAnalysis.doglegs}</div>
            <div><strong>Survey Trend:</strong> ${aiAnalysis.trend}</div>
            <div><strong>Recommendation:</strong> ${aiAnalysis.recommendation}</div>
          </div>
        </div>
        ` : ''}

        ${curveData ? `
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e40af; margin-top: 0;">Curve Data</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div><strong>Motor Yield:</strong> ${curveData.motorYield.toFixed(2)}°/100ft</div>
            <div><strong>Dog Leg Needed:</strong> ${curveData.dogLegNeeded.toFixed(2)}°/100ft</div>
            <div><strong>Projected Inc:</strong> ${curveData.projectedInc.toFixed(2)}°</div>
            <div><strong>Projected Az:</strong> ${curveData.projectedAz.toFixed(2)}°</div>
            <div><strong>Slide Seen:</strong> ${curveData.slideSeen.toFixed(2)} ft</div>
            <div><strong>Slide Ahead:</strong> ${curveData.slideAhead.toFixed(2)} ft</div>
            <div><strong>Target Position:</strong> ${curveData.isAbove ? curveData.aboveTarget.toFixed(2) + 'ft Above' : curveData.belowTarget.toFixed(2) + 'ft Below'}, ${curveData.isRight ? curveData.rightTarget.toFixed(2) + 'ft Right' : curveData.leftTarget.toFixed(2) + 'ft Left'}</div>
          </div>
        </div>
        ` : ''}

        <div style="color: #64748b; font-size: 12px; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
          Generated by AI-MWD Dashboard on ${new Date().toLocaleString()}
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
    const subject = `MWD Survey #${data.survey.index} - ${data.wellName} - MD ${data.survey.md.toFixed(2)}ft`;
    const body = this.generateHtmlBody(data);

    this.openEmailClient({
      to: emailAddresses,
      subject,
      body
    });
  }
}

export const emailService = new EmailService();