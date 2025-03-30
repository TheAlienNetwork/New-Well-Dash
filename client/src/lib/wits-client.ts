export interface WitsData {
  timestamp: string;
  bitDepth: number;
  gamma: number;
  inc: number;
  azi: number;
  drillingParams: {
    wob: number;
    rpm: number;
    flowRate: number;
    pressure: number;
    torque: number;
    rop: number;
  };
}

export interface WitsStatus {
  connected: boolean;
  address: string;
  lastData?: Date | null;
}

export interface WitsConfig {
  host: string;
  port: number;
}

export type MessageHandler = (data: any) => void;

export class WitsClient {
  private socket: WebSocket | null = null;
  private messageHandlers: Record<string, MessageHandler[]> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private witsStatus: WitsStatus = {
    connected: false,
    address: ''
  };

  constructor() {
    this.initMessageHandlers();
  }

  private initMessageHandlers() {
    this.messageHandlers = {
      'wits_data': [],
      'wits_status': [],
      'well_info': [],
      'surveys': [],
      'survey_update': [],
      'curve_data': [],
      'gamma_data': [],
      'gamma_data_update': [],
      'drilling_params': [],
      'drilling_param_update': [],
      'show_survey_modal': []
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // If already connected and socket is open, just resolve
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          resolve();
          return;
        }
        
        // If socket exists but is in connecting state, wait for it
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
          this.socket.addEventListener('open', () => resolve());
          this.socket.addEventListener('error', reject);
          return;
        }

        // If socket is closing or closed, wait for it to close before making a new connection
        if (this.socket) {
          this.disconnect();
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.witsStatus.connected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onclose = (event) => {
          // Only attempt to reconnect if this wasn't an intentional close
          if (!event.wasClean && this.socket) {
            console.log('WebSocket connection closed unexpectedly', event);
            this.witsStatus = {
              connected: false,
              address: ''
            };
            this.notifyHandlers('wits_status', this.witsStatus);
            
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectTimeout = setTimeout(() => {
                this.reconnectAttempts++;
                this.connect().catch(console.error);
              }, 2000 * Math.pow(2, this.reconnectAttempts));
            }
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);
            
            if (message.type && this.messageHandlers[message.type]) {
              if (message.type === 'wits_status') {
                this.witsStatus = message.data || { connected: message.connected, address: message.address };
              }
              
              // For well_info type, ensure we have a valid object
              if (message.type === 'well_info') {
                const wellData = message.data || {};
                console.log('Processing well info update:', wellData);
                
                // Ensure numeric string fields are properly handled
                if (wellData.sensorOffset) {
                  wellData.sensorOffset = String(wellData.sensorOffset);
                }
                if (wellData.proposedDirection) {
                  wellData.proposedDirection = String(wellData.proposedDirection);
                }
                
                this.notifyHandlers(message.type, wellData);
              } else {
                // For all other message types
                this.notifyHandlers(message.type, message.data || message);
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            console.error('Raw message:', event.data);
          }
        };
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(type: string, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      console.error('Cannot send message, WebSocket is not connected');
    }
  }

  configureWits(config: WitsConfig) {
    this.sendMessage('wits_config', { config });
  }

  onWitsData(handler: (data: WitsData) => void) {
    this.addHandler('wits_data', handler);
  }

  onWitsStatus(handler: (status: WitsStatus) => void) {
    this.addHandler('wits_status', handler);
    // Immediately notify with current status
    handler(this.witsStatus);
  }

  onWellInfo(handler: MessageHandler) {
    this.addHandler('well_info', handler);
  }

  onSurveys(handler: MessageHandler) {
    this.addHandler('surveys', handler);
  }

  onSurveyUpdate(handler: MessageHandler) {
    this.addHandler('survey_update', handler);
  }

  onCurveData(handler: MessageHandler) {
    this.addHandler('curve_data', handler);
  }

  onGammaData(handler: MessageHandler) {
    this.addHandler('gamma_data', handler);
  }

  onGammaDataUpdate(handler: MessageHandler) {
    this.addHandler('gamma_data_update', handler);
  }

  onDrillingParams(handler: MessageHandler) {
    this.addHandler('drilling_params', handler);
  }

  onDrillingParamUpdate(handler: MessageHandler) {
    this.addHandler('drilling_param_update', handler);
  }

  onShowSurveyModal(handler: MessageHandler) {
    this.addHandler('show_survey_modal', handler);
  }

  private addHandler(type: string, handler: MessageHandler) {
    if (!this.messageHandlers[type]) {
      this.messageHandlers[type] = [];
    }
    this.messageHandlers[type].push(handler);
  }

  private notifyHandlers(type: string, data: any) {
    if (this.messageHandlers[type]) {
      this.messageHandlers[type].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${type} handler:`, error);
        }
      });
    }
  }

  getStatus(): WitsStatus {
    return this.witsStatus;
  }
}

// Create singleton instance
export const witsClient = new WitsClient();
