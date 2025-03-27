import { Survey } from '@shared/schema';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  attachments?: File[];
}

export interface SurveyEmailData {
  survey: Survey;
  wellName: string;
  rigName: string;
  gammaImageUrl?: string;
  gammaPlotPdfUrl?: string;
  attachmentPaths?: string[];
  attachments?: File[];
  emailBody?: string;
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
  projections?: {
    projectedInc: number;
    projectedAz: number;
    buildRate: number;
    turnRate: number;
    isAbove?: boolean;
    isBelow?: boolean;
    isLeft?: boolean;
    isRight?: boolean;
    verticalPosition?: number;
    horizontalPosition?: number;
  };
}

export class EmailService {
  generateHtmlBody(data: SurveyEmailData): string {
    const { survey, wellName, rigName, gammaImageUrl, aiAnalysis, curveData, targetPosition, additionalNote, projections } = data;
    const northSouthDir = survey.isNorth ? 'N' : 'S';
    const eastWestDir = survey.isEast ? 'E' : 'W';

    // Check if certain sections should be included
    const includeCurveData = curveData && curveData.includeInEmail;
    const includeTargetPosition = curveData?.includeTargetPosition && (targetPosition || projections);
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
            <div><strong style="color: #a5f3fc;">Motor Yield:</strong> <span style="color: #f0f9ff;">${Number(curveData.motorYield || 0).toFixed(2)}°/100ft</span></div>
            <div><strong style="color: #a5f3fc;">Dog Leg Needed:</strong> <span style="color: #f0f9ff;">${Number(curveData.dogLegNeeded || 0).toFixed(2)}°/100ft</span></div>
            <div><strong style="color: #a5f3fc;">Projected Inc:</strong> <span style="color: #f0f9ff;">${Number(curveData.projectedInc || 0).toFixed(2)}°</span></div>
            <div><strong style="color: #a5f3fc;">Projected Az:</strong> <span style="color: #f0f9ff;">${Number(curveData.projectedAz || 0).toFixed(2)}°</span></div>
            <div><strong style="color: #a5f3fc;">Slide Seen:</strong> <span style="color: #f0f9ff;">${Number(curveData.slideSeen || 0).toFixed(2)} ft</span></div>
            <div><strong style="color: #a5f3fc;">Slide Ahead:</strong> <span style="color: #f0f9ff;">${Number(curveData.slideAhead || 0).toFixed(2)} ft</span></div>
          </div>
        </div>
        ` : ''}

        ${includeTargetPosition ? `
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #0e7490;">
          <h3 style="color: #22d3ee; margin-top: 0; font-family: monospace;">TARGET POSITION</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-family: monospace;">
            <div>
              <strong style="color: #a5f3fc;">Vertical Position:</strong> 
              <span style="color: #f0f9ff;">${Number(targetPosition?.verticalPosition || projections?.verticalPosition || 0).toFixed(2)}°</span>
              ${targetPosition?.isAbove || projections?.isAbove ? '<span style="color: #10b981;"> ABOVE TARGET</span>' : 
               targetPosition?.isBelow || projections?.isBelow ? '<span style="color: #ef4444;"> BELOW TARGET</span>' : 
               '<span style="color: #06b6d4;"> ON TARGET</span>'}
            </div>
            <div>
              <strong style="color: #a5f3fc;">Horizontal Position:</strong> 
              <span style="color: #f0f9ff;">${Number(targetPosition?.horizontalPosition || projections?.horizontalPosition || 0).toFixed(2)}°</span>
              ${targetPosition?.isLeft || projections?.isLeft ? '<span style="color: #3b82f6;"> LEFT OF TARGET</span>' : 
               targetPosition?.isRight || projections?.isRight ? '<span style="color: #f59e0b;"> RIGHT OF TARGET</span>' : 
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
        
        ${additionalNote ? `
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #0e7490;">
          <h3 style="color: #22d3ee; margin-top: 0; font-family: monospace;">ADDITIONAL NOTES</h3>
          <div style="font-family: monospace; color: #f0f9ff; white-space: pre-wrap;">
            ${additionalNote}
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
      const { to, subject, body, attachments } = options;
      
      // Check if the body is HTML content
      const isHtmlContent = body.trim().startsWith('<') && body.includes('</');
      
      // Generate a blob URL for copying HTML to clipboard
      if (isHtmlContent) {
        // Create a temporarily hidden textarea with the HTML content
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-9999px';
        tempDiv.innerHTML = body;
        document.body.appendChild(tempDiv);
        
        // Create a selection and copy to clipboard
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const range = document.createRange();
          range.selectNodeContents(tempDiv);
          selection.addRange(range);
          
          // Copy the HTML content to clipboard
          document.execCommand('copy');
          selection.removeAllRanges();
        }
        
        document.body.removeChild(tempDiv);
        
        // Now open email client with only the subject and recipients
        const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}`;
        window.open(mailtoLink);
        
        // Show a help message
        setTimeout(() => {
          window.alert("HTML content has been copied to clipboard. Please paste it into your email client using Ctrl+V or Cmd+V.\n\nFor best results, paste as HTML in your email client or use the 'Paste and Match Style' option if available.");
        }, 1000);
      } else {
        // For plain text emails, use standard mailto
        const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
      }
    } catch (error) {
      console.error('Error opening email client:', error);
      throw new Error('Failed to open email client');
    }
  }

  sendSurveyEmail(emailAddresses: string, data: SurveyEmailData): void {
    // Create a more modern, branded subject line
    const formattedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
    
    const subject = `[NWT] Survey Report #${data.survey.index} | ${data.wellName} | ${Number(data.survey.md).toFixed(2)}ft | ${formattedDate}`;
    const body = data.emailBody || this.generateHtmlBody(data);

    // Handle attachments
    let attachmentsInfo = '';
    if (data.attachments && data.attachments.length > 0) {
      const fileList = data.attachments.map(file => `• ${file.name}`).join('\n');
      attachmentsInfo = `\n\n---------------------\nAttachments (${data.attachments.length}):\n${fileList}\n\nNOTE: Please add the files manually to this email after opening your email client.`;
    }

    // Add additionalNote to the body if provided and not already included in email body
    const additionalNoteText = !data.emailBody && data.additionalNote 
      ? `\n\nAdditional Notes:\n${data.additionalNote}` 
      : '';

    this.openEmailClient({
      to: emailAddresses,
      subject,
      body: body + additionalNoteText + attachmentsInfo,
      attachments: data.attachments
    });
    
    // Show a notification about attachments if they exist
    if (data.attachments && data.attachments.length > 0) {
      setTimeout(() => {
        window.alert(`Please remember to manually add the ${data.attachments?.length} attachments to your email.`);
      }, 1500);
    }
  }
}

export const emailService = new EmailService();