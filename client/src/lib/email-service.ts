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
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MWD Survey Data - ${wellName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #2C3E50;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #2C3E50, #3498DB);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0 0;
            opacity: 0.8;
          }
          .content {
            background-color: white;
            padding: 20px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .section:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .section h2 {
            color: #3498DB;
            font-size: 20px;
            margin-top: 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
          }
          .data-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .data-item {
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            border-left: 3px solid #3498DB;
          }
          .data-item .label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .data-item .value {
            font-size: 16px;
            font-weight: bold;
            color: #2C3E50;
          }
          .chart-container {
            margin-top: 20px;
            text-align: center;
          }
          .chart-container img {
            max-width: 100%;
            border-radius: 6px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          .ai-analysis {
            background-color: #EBF5FB;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
          }
          .ai-analysis h3 {
            color: #3498DB;
            margin-top: 0;
            font-size: 16px;
          }
          .status {
            display: inline-block;
            padding: 3px 8px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 12px;
            margin-left: 5px;
          }
          .status-passed {
            background-color: #D5F5E3;
            color: #27AE60;
          }
          .status-warning {
            background-color: #FCF3CF;
            color: #F39C12;
          }
          .status-failed {
            background-color: #FADBD8;
            color: #E74C3C;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
          }
          .curve-data {
            margin-top: 20px;
            background-color: #F5F5F5;
            padding: 15px;
            border-radius: 6px;
          }
          .curve-data h3 {
            color: #3498DB;
            margin-top: 0;
            font-size: 16px;
          }
          .curve-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .curve-item {
            background-color: white;
            padding: 10px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }
          .curve-item .label {
            font-size: 11px;
            color: #666;
          }
          .curve-item .value {
            font-size: 14px;
            font-weight: bold;
            color: #2C3E50;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MWD Survey Data Report</h1>
            <p>${wellName} | ${rigName} | ${new Date(survey.createdAt).toLocaleString()}</p>
          </div>
          <div class="content">
            <div class="section">
              <h2>Survey #${survey.index} - MD: ${survey.md.toFixed(2)} ft</h2>
              <div class="data-grid">
                <div class="data-item">
                  <div class="label">Measured Depth (ft)</div>
                  <div class="value">${survey.md.toFixed(2)}</div>
                </div>
                <div class="data-item">
                  <div class="label">Inclination (°)</div>
                  <div class="value">${survey.inc.toFixed(2)}</div>
                </div>
                <div class="data-item">
                  <div class="label">Azimuth (°)</div>
                  <div class="value">${survey.azi.toFixed(2)}</div>
                </div>
                <div class="data-item">
                  <div class="label">TVD (ft)</div>
                  <div class="value">${survey.tvd.toFixed(2)}</div>
                </div>
                <div class="data-item">
                  <div class="label">N/S</div>
                  <div class="value">${survey.northSouth.toFixed(2)} ${northSouthDir}</div>
                </div>
                <div class="data-item">
                  <div class="label">E/W</div>
                  <div class="value">${survey.eastWest.toFixed(2)} ${eastWestDir}</div>
                </div>
                <div class="data-item">
                  <div class="label">Vertical Section (ft)</div>
                  <div class="value">${survey.vs.toFixed(2)}</div>
                </div>
                <div class="data-item">
                  <div class="label">Dogleg Severity (°/100ft)</div>
                  <div class="value">${survey.dls.toFixed(2)}</div>
                </div>
                <div class="data-item">
                  <div class="label">Bit Depth (ft)</div>
                  <div class="value">${survey.bitDepth.toFixed(2)}</div>
                </div>
              </div>
              
              ${aiAnalysis ? `
              <div class="ai-analysis">
                <h3>AI Survey Analysis <span class="status status-${aiAnalysis.status.toLowerCase()}">${aiAnalysis.status}</span></h3>
                <div style="margin-top: 10px;">
                  <div><strong>Dogleg Severity:</strong> ${aiAnalysis.doglegs}</div>
                  <div><strong>Survey Trend:</strong> ${aiAnalysis.trend}</div>
                  <div><strong>Recommendation:</strong> ${aiAnalysis.recommendation}</div>
                </div>
              </div>
              ` : ''}
              
              ${curveData ? `
              <div class="curve-data">
                <h3>Curve Data</h3>
                <div class="curve-grid">
                  <div class="curve-item">
                    <div class="label">Motor Yield (°/100ft)</div>
                    <div class="value">${curveData.motorYield.toFixed(2)}</div>
                  </div>
                  <div class="curve-item">
                    <div class="label">Dog Leg Needed (°/100ft)</div>
                    <div class="value">${curveData.dogLegNeeded.toFixed(2)}</div>
                  </div>
                  <div class="curve-item">
                    <div class="label">Projected Inc (°)</div>
                    <div class="value">${curveData.projectedInc.toFixed(2)}</div>
                  </div>
                  <div class="curve-item">
                    <div class="label">Projected Az (°)</div>
                    <div class="value">${curveData.projectedAz.toFixed(2)}</div>
                  </div>
                  <div class="curve-item">
                    <div class="label">Slide Seen (ft)</div>
                    <div class="value">${curveData.slideSeen.toFixed(2)}</div>
                  </div>
                  <div class="curve-item">
                    <div class="label">Slide Ahead (ft)</div>
                    <div class="value">${curveData.slideAhead.toFixed(2)}</div>
                  </div>
                </div>
              </div>
              ` : ''}
            </div>
            
            ${gammaImageUrl ? `
            <div class="section">
              <h2>Gamma Plot</h2>
              <div class="chart-container">
                <img src="${gammaImageUrl}" alt="Gamma Plot" width="600" />
              </div>
            </div>
            ` : ''}
            
            <div class="footer">
              <p>This report was automatically generated by AI-MWD Dashboard on ${new Date().toLocaleString()}</p>
            </div>
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
