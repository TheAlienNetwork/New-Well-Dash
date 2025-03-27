
import { WitsClient } from './wits-client';
import { storage } from '../storage';

// Define a message broadcast type
type MessageBroadcaster = (message: any) => void;

export class WitsManager {
  private broadcastFunction: MessageBroadcaster | null = null;
  private witsClient: WitsClient;
  private customChannelMappings: Map<number, string> = new Map();
  private witsStatus = {
    connected: false,
    address: '',
    lastData: null as Date | null
  };

  constructor() {
    this.witsClient = new WitsClient();
    this.setupWitsListeners();
  }

  private setupWitsListeners() {
    this.witsClient.on('connected', ({host, port}) => {
      this.witsStatus.connected = true;
      this.witsStatus.address = `${host}:${port}`;
      this.broadcastStatus();
    });

    this.witsClient.on('disconnected', () => {
      this.witsStatus.connected = false;
      this.broadcastStatus();
    });

    this.witsClient.on('witsData', async (data) => {
      this.witsStatus.lastData = new Date();
      
      // Store and broadcast raw data
      await this.processWitsData(data);
      
      // Update status
      this.broadcastStatus();
    });
  }

  private async processWitsData(data: any) {
    try {
      // Process gamma data
      if (data.channelId === this.getChannelByName('gamma')) {
        await this.processGammaData(data);
      }

      // Process drilling parameters
      const param = await this.processDrillingParam(data);
      if (param && this.broadcastFunction) {
        this.broadcastFunction({
          type: 'drilling_param_update',
          data: param
        });
      }

      // Broadcast raw data for custom channels
      if (this.broadcastFunction) {
        this.broadcastFunction({
          type: 'wits_data',
          data: {
            ...data,
            mappedName: this.customChannelMappings.get(data.channelId)
          }
        });
      }
    } catch (error) {
      console.error('Error processing WITS data:', error);
    }
  }

  private async processGammaData(data: any) {
    const gammaData = {
      depth: data.value,
      value: data.value,
      timestamp: new Date(),
      wellId: 1
    };
    const stored = await storage.createGammaData(gammaData);
    if (this.broadcastFunction) {
      this.broadcastFunction({
        type: 'gamma_data_update',
        data: stored
      });
    }
  }

  private async processDrillingParam(data: any) {
    const mappedName = this.customChannelMappings.get(data.channelId);
    if (mappedName) {
      const param = {
        name: mappedName,
        value: data.value,
        unit: this.getUnitForChannel(data.channelId),
        timestamp: new Date(),
        wellId: 1
      };
      return await storage.createDrillingParam(param);
    }
    return null;
  }

  addChannelMapping(channelId: number, name: string) {
    this.customChannelMappings.set(channelId, name);
  }

  removeChannelMapping(channelId: number) {
    this.customChannelMappings.delete(channelId);
  }

  getStatus() {
    return this.witsStatus;
  }

  // Set broadcast function from outside
  setBroadcastFunction(broadcaster: MessageBroadcaster) {
    this.broadcastFunction = broadcaster;
  }

  private broadcastStatus() {
    if (this.broadcastFunction) {
      this.broadcastFunction({
        type: 'wits_status',
        data: this.witsStatus
      });
    }
  }

  connectWits(host: string, port: number) {
    return this.witsClient.connect(host, port);
  }

  disconnect() {
    this.witsClient.disconnect();
  }

  private getChannelByName(name: string): number {
    // Default gamma channel
    if (name === 'gamma') return 11;
    return -1;
  }

  private getUnitForChannel(channelId: number): string {
    const unitMap: Record<number, string> = {
      1: 'ft',
      2: 'klbs',
      3: 'ft/hr',
      4: 'psi',
      5: 'gpm',
      11: 'API'
    };
    return unitMap[channelId] || '';
  }
}

export const witsManager = new WitsManager();
