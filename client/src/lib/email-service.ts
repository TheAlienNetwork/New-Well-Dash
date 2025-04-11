import { Survey } from '@shared/schema';
import html2canvas from 'html2canvas';

export interface SurveyEmailData {
  survey: any;
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
    isAbove: boolean;
    isBelow: boolean;
    isLeft: boolean;
    isRight: boolean;
  };
  projections?: {
    projectedInc: number;
    projectedAz: number;
    buildRate: number;
    turnRate: number;
  };
}

class EmailService {
  generateGammaPlotImage(): string {
    // Generate a base64 image of the gamma plot
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Mock gamma plot for now
    canvas.width = 800;
    canvas.height = 400;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return canvas.toDataURL();
  }

  async generateAnimatedGammaPlotGif(): Promise<string> {
    // For now return static image, implement GIF generation later
    return this.generateGammaPlotImage();
  }

  async captureElementScreenshot(element: HTMLElement): Promise<string> {
    try {
      const canvas = await html2canvas(element);
      return canvas.toDataURL();
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return '';
    }
  }

  openEmailClient({ to, subject, body, attachments, imageDataUrl }: {
    to: string;
    subject: string;
    body: string;
    attachments?: File[];
    imageDataUrl?: string;
  }) {
    // Create temporary div to hold HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = body;
    document.body.appendChild(tempDiv);

    // Select and copy the content
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand('copy');
    selection?.removeAllRanges();
    document.body.removeChild(tempDiv);

    // Create and open mailto link
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}`;
    window.location.href = mailtoUrl;

    // Show instructions dialog
    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                  background: #1a1b26; padding: 20px; border-radius: 8px; 
                  box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 10000;
                  border: 1px solid #2d2e3b; color: #c5c6c7; max-width: 400px;">
        <h3 style="margin-top: 0; color: #3b82f6;">Email Draft Ready</h3>
        <p>Your email client has been opened. To complete the email:</p>
        <ol style="margin-bottom: 15px; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Click in the email body</li>
          <li style="margin-bottom: 8px;">Press Ctrl+V (or ⌘+V on Mac) to paste the content</li>
          ${imageDataUrl ? '<li style="margin-bottom: 8px;">The screenshot has been copied to your clipboard</li>' : ''}
          ${attachments?.length ? `
          <li>Add these attachments:
            <ul style="margin-top: 5px; color: #9ca3af; font-size: 0.9em;">
              ${attachments.map(file => `<li>${file.name}</li>`).join('')}
            </ul>
          </li>` : ''}
        </ol>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #3b82f6; color: white; border: none; 
                       padding: 8px 16px; border-radius: 4px; cursor: pointer;
                       font-size: 14px;">
          Got it
        </button>
      </div>
    `;
    document.body.appendChild(dialog);

    // Auto-remove dialog after 15 seconds
    setTimeout(() => {
      if (document.body.contains(dialog)) {
        document.body.removeChild(dialog);
      }
    }, 15000);
  }

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

    // Email template
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af; margin-bottom: 10px;">Survey Report - ${wellName}</h2>
        <p style="color: #64748b; margin-bottom: 20px;">Rig: ${rigName}</p>

        <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #e2e8f0; margin-bottom: 15px;">Survey Data</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #0f172a; padding: 12px; border-radius: 6px;">
              <span style="color: #94a3b8; font-size: 0.875rem;">Measured Depth</span>
              <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 500;">${Number(survey.md).toFixed(2)} ft</div>
            </div>
            <div style="background: #0f172a; padding: 12px; border-radius: 6px;">
              <span style="color: #94a3b8; font-size: 0.875rem;">True Vertical Depth</span>
              <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 500;">${Number(survey.tvd).toFixed(2)} ft</div>
            </div>
            <div style="background: #0f172a; padding: 12px; border-radius: 6px;">
              <span style="color: #94a3b8; font-size: 0.875rem;">Inclination</span>
              <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 500;">${Number(survey.inc).toFixed(2)}°</div>
            </div>
            <div style="background: #0f172a; padding: 12px; border-radius: 6px;">
              <span style="color: #94a3b8; font-size: 0.875rem;">Azimuth</span>
              <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 500;">${Number(survey.azi).toFixed(2)}°</div>
            </div>
          </div>
        </div>

        ${includeCurveData ? `
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #e2e8f0; margin-bottom: 15px;">Curve Data</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div style="background: #0f172a; padding: 12px; border-radius: 6px;">
                <span style="color: #94a3b8; font-size: 0.875rem;">Motor Yield</span>
                <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 500;">${Number(curveData.motorYield).toFixed(2)}°/100ft</div>
              </div>
              <div style="background: #0f172a; padding: 12px; border-radius: 6px;">
                <span style="color: #94a3b8; font-size: 0.875rem;">Dogleg Needed</span>
                <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 500;">${Number(curveData.dogLegNeeded).toFixed(2)}°/100ft</div>
              </div>
              <div style="background: #0f172a; padding: 12px; border-radius: 6px;">
                <span style="color: #94a3b8; font-size: 0.875rem;">Slide Seen</span>
                <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 500;">${Number(curveData.slideSeen).toFixed(2)}%</div>
              </div>
              <div style="background: #0f172a; padding: 12px; border-radius: 6px;">
                <span style="color: #94a3b8; font-size: 0.875rem;">Slide Ahead</span>
                <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 500;">${Number(curveData.slideAhead).toFixed(2)}%</div>
              </div>
            </div>
          </div>
        ` : ''}

        ${includeTargetPosition ? `
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #e2e8f0; margin-bottom: 15px;">Target Position</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div style="background: #0f172a; padding: 12px; border-radius: 6px;">
                <span style="color: #94a3b8; font-size: 0.875rem;">Vertical Position</span>
                <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 500;">
                  ${targetPosition.isAbove ? 'Above Target' : targetPosition.isBelow ? 'Below Target' : 'On Target'}
                  (${Math.abs(targetPosition.verticalPosition).toFixed(2)}ft)
                </div>
              </div>
              <div style="background: #0f172a; padding: 12px; border-radius: 6px;">
                <span style="color: #94a3b8; font-size: 0.875rem;">Horizontal Position</span>
                <div style="color: #e2e8f0; font-size: 1.25rem; font-weight: 500;">
                  ${targetPosition.isLeft ? 'Left of Target' : targetPosition.isRight ? 'Right of Target' : 'On Target'}
                  (${Math.abs(targetPosition.horizontalPosition).toFixed(2)}ft)
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        ${aiAnalysis ? `
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <h3 style="color: #e2e8f0; margin: 0; margin-right: 10px;">Analysis</h3>
              ${getStatusBadge(aiAnalysis.status)}
            </div>
            <div style="background: #0f172a; padding: 16px; border-radius: 6px; margin-bottom: 12px;">
              <div style="color: #94a3b8; margin-bottom: 4px;">Doglegs</div>
              <div style="color: #e2e8f0;">${aiAnalysis.doglegs}</div>
            </div>
            <div style="background: #0f172a; padding: 16px; border-radius: 6px; margin-bottom: 12px;">
              <div style="color: #94a3b8; margin-bottom: 4px;">Trend Analysis</div>
              <div style="color: #e2e8f0;">${aiAnalysis.trend}</div>
            </div>
            <div style="background: #0f172a; padding: 16px; border-radius: 6px;">
              <div style="color: #94a3b8; margin-bottom: 4px;">Recommendation</div>
              <div style="color: #e2e8f0;">${aiAnalysis.recommendation}</div>
            </div>
          </div>
        ` : ''}

        ${additionalNote ? `
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #e2e8f0; margin-bottom: 15px;">Additional Notes</h3>
            <div style="background: #0f172a; padding: 16px; border-radius: 6px;">
              <div style="color: #e2e8f0; white-space: pre-wrap;">${additionalNote}</div>
            </div>
          </div>
        ` : ''}

        ${includeGammaPlot ? `
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #e2e8f0; margin-bottom: 15px;">Gamma Plot</h3>
            <img src="${gammaImageUrl}" alt="Gamma Plot" style="max-width: 100%; border-radius: 6px;" />
          </div>
        ` : ''}
      </div>
    `;
  }

  // Send survey email
  sendSurveyEmail(to: string, data: SurveyEmailData) {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const subject = `[NWT] Survey Report #${data.survey.index} | ${data.wellName} | ${Number(data.survey.md).toFixed(2)}ft | ${formattedDate}`;
    const body = this.generateHtmlBody(data);

    this.openEmailClient({
      to,
      subject,
      body,
      attachments: data.attachments,
    });
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
}

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  attachments?: File[];
  imageDataUrl?: string;
}

export const emailService = new EmailService();