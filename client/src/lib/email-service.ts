import { Survey } from '@shared/schema';
import html2canvas from 'html2canvas';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  attachments?: File[];
  imageDataUrl?: string; // Added for screenshot functionality
}

// Define the GammaDataPoint interface to avoid TypeScript errors
interface GammaDataPoint {
  depth: number | string;
  value: number | string;
}

// Extend Window interface to add gammaData
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
    try {
      // Create a canvas element with a professional look
      const canvas = document.createElement('canvas');
      canvas.width = 900; // Wider canvas for better detail
      canvas.height = 450;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        return '';
      }
      
      // Set background with gradient for more professional look
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#111827');
      bgGradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle grid pattern
      ctx.strokeStyle = 'rgba(55, 65, 81, 0.3)';
      ctx.lineWidth = 0.5;
      
      // Vertical grid lines
      const gridSpacingX = 50;
      for (let x = 50; x < canvas.width; x += gridSpacingX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      const gridSpacingY = 50;
      for (let y = 50; y < canvas.height; y += gridSpacingY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Get gamma data from the window object
      const gammaData = window.gammaData || [];
      
      if (gammaData.length === 0) {
        // Draw "No data available" text with modern styling
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#10b981'; // Modern green
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText('No gamma data available', canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;
        
        // Add a subtle note
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
        ctx.fillText('Import LAS file or connect to WITS to view gamma data', canvas.width / 2, canvas.height / 2 + 30);
        
        return canvas.toDataURL('image/png', 1.0);
      }
      
      // Calculate min and max values
      const depths = gammaData.map((d: GammaDataPoint) => Number(d.depth));
      const values = gammaData.map((d: GammaDataPoint) => Number(d.value));
      
      // Find the highest depth to focus on the last 100ft
      const maxDepth = Math.max(...depths);
      const minDepth = Math.max(maxDepth - 100, Math.min(...depths)); // Last 100ft or all data if less
      
      // Filter data to only show the last 100ft
      const filteredData = gammaData
        .filter((d: GammaDataPoint) => Number(d.depth) >= minDepth)
        .sort((a: GammaDataPoint, b: GammaDataPoint) => Number(a.depth) - Number(b.depth));
      
      // Recalculate values for the filtered data
      const filteredValues = filteredData.map((d: GammaDataPoint) => Number(d.value));
      const maxValue = Math.max(120, ...filteredValues); // At least 120 as max for better scaling
      
      // Padding for chart area
      const padding = { top: 50, right: 50, bottom: 70, left: 70 };
      const chartWidth = canvas.width - padding.left - padding.right;
      const chartHeight = canvas.height - padding.top - padding.bottom;
      
      // Add title and subtitle
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#f9fafb';
      ctx.textAlign = 'left';
      ctx.fillText('Gamma Ray Plot', padding.left, 25);
      
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`Showing Last 100ft (${minDepth.toFixed(0)}ft - ${maxDepth.toFixed(0)}ft)`, padding.left, 45);
      
      // Draw "LIVE" indicator
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.textAlign = 'right';
      
      // Draw pulsing dot
      const currentTime = Date.now() / 1000;
      const pulseSize = 4 + Math.sin(currentTime * 5) * 2; // Simulates animation
      
      ctx.beginPath();
      ctx.arc(canvas.width - padding.right - 60, 30, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      
      ctx.fillText('LIVE DATA', canvas.width - padding.right - 40, 33);
      
      // Add a frosted glass background for chart area
      ctx.save();
      ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.shadowColor = 'rgba(148, 163, 184, 0.1)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;
      ctx.beginPath();
      ctx.roundRect(padding.left - 30, padding.top - 30, chartWidth + 60, chartHeight + 60, 10);
      ctx.fill();
      ctx.restore();

      // Draw subtle inner border for chart area
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.roundRect(padding.left - 25, padding.top - 25, chartWidth + 50, chartHeight + 50, 8);
      ctx.stroke();
      
      // Draw axes with better styling
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.7)';
      ctx.lineWidth = 1.5;
      
      // X-axis
      ctx.beginPath();
      ctx.moveTo(padding.left, canvas.height - padding.bottom);
      ctx.lineTo(padding.left + chartWidth, canvas.height - padding.bottom);
      ctx.stroke();
      
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, canvas.height - padding.bottom);
      ctx.stroke();
      
      // Draw X-axis labels (Depth) with improved styling
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      
      const numLabelsX = 6;
      for (let i = 0; i <= numLabelsX; i++) {
        const x = padding.left + (chartWidth * i) / numLabelsX;
        const depth = minDepth + ((maxDepth - minDepth) * i) / numLabelsX;
        
        // Tick marks
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - padding.bottom);
        ctx.lineTo(x, canvas.height - padding.bottom + 5);
        ctx.stroke();
        
        // Labels
        ctx.fillText(depth.toFixed(0), x, canvas.height - padding.bottom + 20);
      }
      
      // Draw Y-axis labels (Gamma) with improved styling
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      const numLabelsY = 6;
      for (let i = 0; i <= numLabelsY; i++) {
        const y = canvas.height - padding.bottom - (chartHeight * i) / numLabelsY;
        const value = (maxValue * i) / numLabelsY;
        
        // Tick marks
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left - 5, y);
        ctx.stroke();
        
        // Labels
        ctx.fillText(value.toFixed(0), padding.left - 10, y);
      }
      
      // Draw axis titles with better styling
      ctx.fillStyle = '#d1d5db';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Measured Depth (ft)', canvas.width / 2, canvas.height - 20);
      
      ctx.save();
      ctx.translate(20, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Gamma Ray (gAPI)', 0, 0);
      ctx.restore();
      
      // Draw threshold line for typical sandstone-shale boundary
      ctx.beginPath();
      const thresholdY = canvas.height - padding.bottom - (60 / maxValue) * chartHeight;
      ctx.moveTo(padding.left, thresholdY);
      ctx.lineTo(padding.left + chartWidth, thresholdY);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Label for threshold line
      ctx.font = 'italic 11px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.textAlign = 'right';
      ctx.fillText('Typical Sandstone-Shale Boundary (60 gAPI)', padding.left + chartWidth - 10, thresholdY - 5);
      
      // Simulate a live data animation by adding a "pulse" to the newest point
      const animationProgress = (Date.now() % 3000) / 3000; // Cycles every 3 seconds
      
      // Draw data points and lines
      if (filteredData.length > 0) {
        // Draw area under the line with gradient
        ctx.beginPath();
        filteredData.forEach((point: GammaDataPoint, i: number) => {
          const x = padding.left + ((Number(point.depth) - minDepth) / (maxDepth - minDepth)) * chartWidth;
          const y = canvas.height - padding.bottom - (Number(point.value) / maxValue) * chartHeight;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        // Complete the area
        ctx.lineTo(padding.left + chartWidth, canvas.height - padding.bottom);
        ctx.lineTo(padding.left, canvas.height - padding.bottom);
        ctx.closePath();
        
        // Create smooth gradient for area
        const areaGradient = ctx.createLinearGradient(0, padding.top, 0, canvas.height - padding.bottom);
        areaGradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
        areaGradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.05)');
        areaGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        
        ctx.fillStyle = areaGradient;
        ctx.fill();
        
        // Draw line with improved styling
        ctx.beginPath();
        filteredData.forEach((point: GammaDataPoint, i: number) => {
          const x = padding.left + ((Number(point.depth) - minDepth) / (maxDepth - minDepth)) * chartWidth;
          const y = canvas.height - padding.bottom - (Number(point.value) / maxValue) * chartHeight;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        // Line style
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw data points with animation effect
        filteredData.forEach((point: GammaDataPoint, i: number) => {
          const x = padding.left + ((Number(point.depth) - minDepth) / (maxDepth - minDepth)) * chartWidth;
          const y = canvas.height - padding.bottom - (Number(point.value) / maxValue) * chartHeight;
          
          const isNewestPoint = i === filteredData.length - 1;
          
          // For the newest point, add a pulsing effect
          if (isNewestPoint) {
            // Outer glow - pulsing effect
            const pulseSize = 8 + Math.sin(animationProgress * Math.PI * 2) * 4;
            
            ctx.beginPath();
            ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.fill();
            
            // Animate opacity for newest point
            ctx.globalAlpha = 0.7 + Math.sin(animationProgress * Math.PI * 2) * 0.3;
          }
          
          // Draw point
          ctx.beginPath();
          ctx.arc(x, y, isNewestPoint ? 5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.fill();
          
          // Add white border to points
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // Reset opacity
          ctx.globalAlpha = 1;
        });
        
        // Add "Updating..." text near the newest point if there's data
        if (filteredData.length > 0) {
          const lastPoint = filteredData[filteredData.length - 1];
          const lastX = padding.left + ((Number(lastPoint.depth) - minDepth) / (maxDepth - minDepth)) * chartWidth;
          const lastY = canvas.height - padding.bottom - (Number(lastPoint.value) / maxValue) * chartHeight;
          
          ctx.font = 'italic 11px sans-serif';
          ctx.fillStyle = '#10b981';
          ctx.textAlign = 'left';
          ctx.fillText('Updating...', lastX + 10, lastY - 10);
        }
      }
      
      // Add timestamp and data point count
      ctx.textAlign = 'right';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`Data Points: ${filteredData.length}  |  Last Updated: ${new Date().toLocaleTimeString()}`, canvas.width - padding.right, canvas.height - 10);
      
      // Convert to data URL (PNG for better quality)
      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Error generating gamma plot image:', error);
      return '';
    }
  }
  
  // Generate an animated GIF of the gamma plot for emails
  // Capture screenshot of an element
  async captureElementScreenshot(element: HTMLElement): Promise<string> {
    try {
      const canvas = await html2canvas(element, {
        scale: 1.5, // Increase quality
        useCORS: true, // Enable CORS to capture external images
        allowTaint: true, // Allow tainted canvas for cross-origin images
        backgroundColor: null, // Preserve transparency
        logging: false // Disable logging
      });
      
      // Convert canvas to data URL (JPG format)
      return canvas.toDataURL('image/jpeg', 0.95);
    } catch (error) {
      console.error('Error capturing element screenshot:', error);
      return '';
    }
  }
  
  async generateAnimatedGammaPlotGif(): Promise<string> {
    try {
      // We'll create multiple frames to simulate animation
      const numFrames = 10;
      const frames: string[] = [];
      
      // Create frames with different animation states
      for (let frameIndex = 0; frameIndex < numFrames; frameIndex++) {
        // Create a fresh canvas for each frame
        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('Could not get canvas context');
          return '';
        }
        
        // Set background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#111827');
        bgGradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grid pattern
        ctx.strokeStyle = 'rgba(55, 65, 81, 0.3)';
        ctx.lineWidth = 0.5;
        
        // Vertical and horizontal grid lines
        const gridSpacingX = 50;
        for (let x = 50; x < canvas.width; x += gridSpacingX) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        
        const gridSpacingY = 50;
        for (let y = 50; y < canvas.height; y += gridSpacingY) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        
        // Get gamma data
        const gammaData = window.gammaData || [];
        
        if (gammaData.length === 0) {
          ctx.font = 'bold 20px sans-serif';
          ctx.fillStyle = '#10b981';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
          ctx.shadowBlur = 10;
          ctx.fillText('No gamma data available', canvas.width / 2, canvas.height / 2);
          ctx.shadowBlur = 0;
          
          ctx.font = '14px sans-serif';
          ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
          ctx.fillText('Import LAS file or connect to WITS to view gamma data', canvas.width / 2, canvas.height / 2 + 30);
          
          // Return static image if no data
          return canvas.toDataURL('image/png', 1.0);
        }
        
        // Calculate values similar to the static version
        const depths = gammaData.map((d: GammaDataPoint) => Number(d.depth));
        const maxDepth = Math.max(...depths);
        const minDepth = Math.max(maxDepth - 100, Math.min(...depths));
        
        const filteredData = gammaData
          .filter((d: GammaDataPoint) => Number(d.depth) >= minDepth)
          .sort((a: GammaDataPoint, b: GammaDataPoint) => Number(a.depth) - Number(b.depth));
        
        const filteredValues = filteredData.map((d: GammaDataPoint) => Number(d.value));
        const maxValue = Math.max(120, ...filteredValues);
        
        // Padding for chart area
        const padding = { top: 50, right: 50, bottom: 70, left: 70 };
        const chartWidth = canvas.width - padding.left - padding.right;
        const chartHeight = canvas.height - padding.top - padding.bottom;
        
        // Add title and subtitle
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#f9fafb';
        ctx.textAlign = 'left';
        ctx.fillText('Gamma Ray Plot', padding.left, 25);
        
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(`Showing Last 100ft (${minDepth.toFixed(0)}ft - ${maxDepth.toFixed(0)}ft)`, padding.left, 45);
        
        // Draw "LIVE" indicator with animation
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'right';
        
        // Animated pulsing dot for each frame
        const pulseProgress = frameIndex / numFrames;
        const pulseSize = 4 + Math.sin(pulseProgress * Math.PI * 2) * 2;
        
        ctx.beginPath();
        ctx.arc(canvas.width - padding.right - 60, 30, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        
        ctx.fillText('LIVE DATA', canvas.width - padding.right - 40, 33);
        
        // Add a frosted glass background for chart area
        ctx.save();
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.shadowColor = 'rgba(148, 163, 184, 0.1)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        ctx.beginPath();
        ctx.roundRect(padding.left - 30, padding.top - 30, chartWidth + 60, chartHeight + 60, 10);
        ctx.fill();
        ctx.restore();

        // Draw subtle inner border for chart area
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(padding.left - 25, padding.top - 25, chartWidth + 50, chartHeight + 50, 8);
        ctx.stroke();
        
        // Draw axes
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.7)';
        ctx.lineWidth = 1.5;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding.left, canvas.height - padding.bottom);
        ctx.lineTo(padding.left + chartWidth, canvas.height - padding.bottom);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, canvas.height - padding.bottom);
        ctx.stroke();
        
        // Draw X-axis labels
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        
        const numLabelsX = 6;
        for (let i = 0; i <= numLabelsX; i++) {
          const x = padding.left + (chartWidth * i) / numLabelsX;
          const depth = minDepth + ((maxDepth - minDepth) * i) / numLabelsX;
          
          ctx.beginPath();
          ctx.moveTo(x, canvas.height - padding.bottom);
          ctx.lineTo(x, canvas.height - padding.bottom + 5);
          ctx.stroke();
          
          ctx.fillText(depth.toFixed(0), x, canvas.height - padding.bottom + 20);
        }
        
        // Draw Y-axis labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        const numLabelsY = 6;
        for (let i = 0; i <= numLabelsY; i++) {
          const y = canvas.height - padding.bottom - (chartHeight * i) / numLabelsY;
          const value = (maxValue * i) / numLabelsY;
          
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(padding.left - 5, y);
          ctx.stroke();
          
          ctx.fillText(value.toFixed(0), padding.left - 10, y);
        }
        
        // Draw axis titles
        ctx.fillStyle = '#d1d5db';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Measured Depth (ft)', canvas.width / 2, canvas.height - 20);
        
        ctx.save();
        ctx.translate(20, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Gamma Ray (gAPI)', 0, 0);
        ctx.restore();
        
        // Draw threshold line
        ctx.beginPath();
        const thresholdY = canvas.height - padding.bottom - (60 / maxValue) * chartHeight;
        ctx.moveTo(padding.left, thresholdY);
        ctx.lineTo(padding.left + chartWidth, thresholdY);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.font = 'italic 11px sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'right';
        ctx.fillText('Typical Sandstone-Shale Boundary (60 gAPI)', padding.left + chartWidth - 10, thresholdY - 5);
        
        // Animation progress for this frame
        const animationProgress = frameIndex / numFrames;
        
        // Draw data with animation
        if (filteredData.length > 0) {
          // Draw area under the line with gradient
          ctx.beginPath();
          filteredData.forEach((point: GammaDataPoint, i: number) => {
            const x = padding.left + ((Number(point.depth) - minDepth) / (maxDepth - minDepth)) * chartWidth;
            const y = canvas.height - padding.bottom - (Number(point.value) / maxValue) * chartHeight;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          
          // Complete the area
          ctx.lineTo(padding.left + chartWidth, canvas.height - padding.bottom);
          ctx.lineTo(padding.left, canvas.height - padding.bottom);
          ctx.closePath();
          
          // Create gradient for area
          const areaGradient = ctx.createLinearGradient(0, padding.top, 0, canvas.height - padding.bottom);
          areaGradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
          areaGradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.05)');
          areaGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          
          ctx.fillStyle = areaGradient;
          ctx.fill();
          
          // Draw line
          ctx.beginPath();
          filteredData.forEach((point: GammaDataPoint, i: number) => {
            const x = padding.left + ((Number(point.depth) - minDepth) / (maxDepth - minDepth)) * chartWidth;
            const y = canvas.height - padding.bottom - (Number(point.value) / maxValue) * chartHeight;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Draw data points with frame-specific animation
          filteredData.forEach((point: GammaDataPoint, i: number) => {
            const x = padding.left + ((Number(point.depth) - minDepth) / (maxDepth - minDepth)) * chartWidth;
            const y = canvas.height - padding.bottom - (Number(point.value) / maxValue) * chartHeight;
            
            const isNewestPoint = i === filteredData.length - 1;
            
            // Animated pulsing effect for the newest point
            if (isNewestPoint) {
              const pulseSize = 8 + Math.sin(animationProgress * Math.PI * 2) * 4;
              
              ctx.beginPath();
              ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
              ctx.fill();
              
              ctx.globalAlpha = 0.7 + Math.sin(animationProgress * Math.PI * 2) * 0.3;
            }
            
            // Draw point
            ctx.beginPath();
            ctx.arc(x, y, isNewestPoint ? 5 : 3, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.fill();
            
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.globalAlpha = 1;
          });
          
          // Animated "Updating..." text
          if (filteredData.length > 0) {
            const lastPoint = filteredData[filteredData.length - 1];
            const lastX = padding.left + ((Number(lastPoint.depth) - minDepth) / (maxDepth - minDepth)) * chartWidth;
            const lastY = canvas.height - padding.bottom - (Number(lastPoint.value) / maxValue) * chartHeight;
            
            ctx.font = 'italic 11px sans-serif';
            ctx.fillStyle = '#10b981';
            ctx.textAlign = 'left';
            
            // Show/hide "Updating..." text based on animation frame
            if (frameIndex % 2 === 0) {
              ctx.fillText('Updating...', lastX + 10, lastY - 10);
            }
          }
        }
        
        // Add timestamp that changes with each frame
        ctx.textAlign = 'right';
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#9ca3af';
        const fakeTime = new Date();
        fakeTime.setSeconds(fakeTime.getSeconds() + frameIndex); // Increment time for each frame
        ctx.fillText(`Data Points: ${filteredData.length}  |  Last Updated: ${fakeTime.toLocaleTimeString()}`, canvas.width - padding.right, canvas.height - 10);
        
        // Convert frame to image data URL
        frames.push(canvas.toDataURL('image/png', 0.8));
      }
      
      // For a real implementation, we would use a GIF encoder library
      // But for this demo, we'll just return the first frame
      // In a real implementation, the frames would be combined into an animated GIF using a library like gif.js
      
      console.log(`Generated ${frames.length} frames for animated gamma plot`);
      
      // For demonstration, we'll indicate this is an animated version with a special marker
      return frames[0] + '#animated'; // This would be replaced with actual GIF encoding in production
    } catch (error) {
      console.error('Error generating animated gamma plot:', error);
      return '';
    }
  }

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

  openEmailClient(options: EmailOptions): void {
    try {
      const { to, subject, body, attachments, imageDataUrl } = options;
      
      // Check if we have a screenshot image
      if (imageDataUrl) {
        // If we have a screenshot image, we'll use that instead of the HTML content
        
        // Create a mailto link that will open Outlook if it's the default client
        const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}`;
        
        // Copy the image to clipboard (this works with modern browsers)
        this.copyImageToClipboard(imageDataUrl);
        
        // Open the email client
        window.location.href = mailtoLink;
        
        // Show a more Outlook-focused helper message
        setTimeout(() => {
          const message = [
            "Email draft opened in Outlook",
            "",
            "1. The email preview image is copied to your clipboard",
            "2. Use Ctrl+V (or Cmd+V) to paste the image into the email body",
            attachments?.length ? `3. Add the ${attachments.length} selected attachment${attachments.length > 1 ? 's' : ''}:` : '',
            ...(attachments?.map(file => `   • ${file.name}`) || [])
          ].join('\n');
          
          window.alert(message);
        }, 1500); // Slightly longer delay to ensure Outlook opens first
        
        return;
      }
      
      // If no image data URL, proceed with the original HTML approach
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

        // Create a mailto link that will open Outlook if it's the default client
        const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}`;
        
        // Open the email client
        window.location.href = mailtoLink; // Use location.href instead of window.open() for better Outlook integration
        
        // Show a more Outlook-focused helper message
        setTimeout(() => {
          const message = [
            "Email draft opened in Outlook",
            "",
            "1. The formatted content is copied to your clipboard",
            "2. Use Ctrl+V (or Cmd+V) to paste the content into the email body",
            attachments?.length ? `3. Add the ${attachments.length} selected attachment${attachments.length > 1 ? 's' : ''}:` : '',
            ...(attachments?.map(file => `   • ${file.name}`) || [])
          ].join('\n');
          
          window.alert(message);
        }, 1500); // Slightly longer delay to ensure Outlook opens first
      } else {
        // For plain text emails, include the body directly
        const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
      }
    } catch (error) {
      console.error('Error opening email client:', error);
      throw new Error('Failed to open email client');
    }
  }
  
  // Helper function to copy an image to clipboard
  async copyImageToClipboard(imageDataUrl: string): Promise<void> {
    try {
      // Create a temporary image element
      const img = new Image();
      img.src = imageDataUrl;
      
      // Wait for the image to load
      await new Promise(resolve => {
        img.onload = resolve;
      });
      
      // Create a canvas and draw the image onto it
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Convert the canvas to a Blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to create blob from canvas');
        }
        
        try {
          // Use the modern Clipboard API if available
          if (navigator.clipboard && navigator.clipboard.write) {
            const clipboardItem = new ClipboardItem({
              [blob.type]: blob
            });
            await navigator.clipboard.write([clipboardItem]);
            console.log('Image copied to clipboard using Clipboard API');
          } else {
            // Fallback for browsers that don't support the Clipboard API
            // Create a temporary image element and try to copy it
            const tempImg = document.createElement('img');
            tempImg.src = imageDataUrl;
            tempImg.style.position = 'fixed';
            tempImg.style.left = '-9999px';
            document.body.appendChild(tempImg);
            
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              const range = document.createRange();
              range.selectNode(tempImg);
              selection.addRange(range);
              document.execCommand('copy');
              selection.removeAllRanges();
            }
            
            document.body.removeChild(tempImg);
            console.log('Image copied to clipboard using fallback method');
          }
        } catch (err) {
          console.error('Failed to copy image to clipboard:', err);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error preparing image for clipboard:', error);
    }
  }

  sendSurveyEmail(emailAddresses: string, data: SurveyEmailData): void {
    // Create a more modern, branded subject line
    const formattedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
    
    const subject = `[NWT] Survey Report #${data.survey.index} | ${data.wellName} | ${Number(data.survey.md).toFixed(2)}ft | ${formattedDate}`;
    const body = data.emailBody || this.generateHtmlBody(data);

    // Handle attachments - add footer info only for plain text emails
    // For HTML emails, attachment info is already included in the alert from openEmailClient
    let attachmentsInfo = '';
    if (!body.trim().startsWith('<') && data.attachments && data.attachments.length > 0) {
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
      attachments: data.attachments,
      // Pass the image URL if it's included in the data
      imageDataUrl: data.gammaImageUrl
    });
    
    // No need for additional alert about attachments since it's already handled in openEmailClient
  }
}

export const emailService = new EmailService();