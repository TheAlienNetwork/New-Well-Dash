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
  // Generate a sample gamma plot image as a data URL
  generateGammaPlotImage(): string {
    // In a real application, this would generate an actual image from gamma data
    // For this demo, we'll return a placeholder data URL that looks like a gamma plot
    return `data:image/png;base64,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`;
  }

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