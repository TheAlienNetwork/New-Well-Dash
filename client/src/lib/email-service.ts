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
  /**
   * Generate a survey data HTML email body
   */
  generateSurveyEmailBody(data: SurveyEmailData): string {
    const { survey, wellName, rigName, gammaImageUrl, aiAnalysis, curveData } = data;

    const northSouthDir = survey.isNorth ? 'N' : 'S';
    const eastWestDir = survey.isEast ? 'E' : 'W';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            background: #ffffff;
          }
          .header {
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 25px;
          }
          .data-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .data-section h3 {
            color: #2563eb;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }
          th {
            background-color: #f1f5f9;
            font-weight: 600;
          }
          img {
            max-width: 100%;
            border-radius: 4px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MWD Survey Data Report</h1>
            <p>${wellName} | ${rigName} | ${new Date(survey.createdAt).toLocaleString()}</p>
          </div>
          <div class="data-section">
            <h3>Survey #${survey.index} - MD: ${survey.md.toFixed(2)} ft</h3>
            <table>
              <tr>
                <th>Measured Depth (ft)</th>
                <td>${survey.md.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Inclination (°)</th >
                <td>${survey.inc.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Azimuth (°)</th >
                <td>${survey.azi.toFixed(2)}</td>
              </tr>
              <tr>
                <th>TVD (ft)</th>
                <td>${survey.tvd.toFixed(2)}</td>
              </tr>
              <tr>
                <th>N/S</th>
                <td>${survey.northSouth.toFixed(2)} ${northSouthDir}</td>
              </tr>
              <tr>
                <th>E/W</th>
                <td>${survey.eastWest.toFixed(2)} ${eastWestDir}</td>
              </tr>
              <tr>
                <th>Vertical Section (ft)</th>
                <td>${survey.vs.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Dogleg Severity (°/100ft)</th>
                <td>${survey.dls.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Bit Depth (ft)</th>
                <td>${survey.bitDepth.toFixed(2)}</td>
              </tr>
            </table>
            ${aiAnalysis ? `
            <div>
              <h3>AI Survey Analysis <span style="background-color: ${aiAnalysis.status === 'Passed' ? '#D5F5E3' : aiAnalysis.status === 'Warning' ? '#FCF3CF' : '#FADBD8'}; padding: 3px 8px; font-size: 12px; font-weight: bold; border-radius: 12px; color: ${aiAnalysis.status === 'Passed' ? '#27AE60' : aiAnalysis.status === 'Warning' ? '#F39C12' : '#E74C3C'};">${aiAnalysis.status}</span></h3>
              <p><strong>Dogleg Severity:</strong> ${aiAnalysis.doglegs}</p>
              <p><strong>Survey Trend:</strong> ${aiAnalysis.trend}</p>
              <p><strong>Recommendation:</strong> ${aiAnalysis.recommendation}</p>
            </div>
            ` : ''}

            ${curveData ? `
            <div>
              <h3>Curve Data</h3>
              <table>
                <tr>
                  <th>Motor Yield (°/100ft)</th>
                  <td>${curveData.motorYield.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Dog Leg Needed (°/100ft)</th>
                  <td>${curveData.dogLegNeeded.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Projected Inc (°)</th >
                  <td>${curveData.projectedInc.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Projected Az (°)</th >
                  <td>${curveData.projectedAz.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Slide Seen (ft)</th>
                  <td>${curveData.slideSeen.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Slide Ahead (ft)</th>
                  <td>${curveData.slideAhead.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            ` : ''}
          </div>

          ${gammaImageUrl ? `
          <div>
            <h3>Gamma Plot</h3>
            <img src="${gammaImageUrl}" alt="Gamma Plot" />
          </div>
          ` : ''}

          <div class="footer">
            <p>This report was automatically generated by AI-MWD Dashboard on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Create and open an email in the user's default email client
   */
  openEmailClient(options: EmailOptions): void {
    try {
      const { to, subject, body } = options;

      // Convert to proper mailto format
      const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Open the link in a new window
      window.open(mailtoLink);
    } catch (error) {
      console.error('Error opening email client:', error);
      throw new Error('Failed to open email client');
    }
  }

  /**
   * Prepare and open survey email
   */
  sendSurveyEmail(emailAddresses: string, data: SurveyEmailData): void {
    const subject = `MWD Survey #${data.survey.index} - ${data.wellName} - MD ${data.survey.md.toFixed(2)}ft`;
    const body = this.generateSurveyEmailBody(data);

    this.openEmailClient({
      to: emailAddresses,
      subject,
      body
    });
  }
}

export const emailService = new EmailService();