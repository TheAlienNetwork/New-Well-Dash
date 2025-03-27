
import { WitsClient } from './wits-client';
import { storage } from '../storage';
import { broadcastMessage } from '../routes';

export class WitsManager {
  private witsClient: WitsClient;
  private isSimulated: boolean = false;
  private customChannelMappings: Map<number, string> = new Map();
  private witsStatus = {
    connected: false,
    address: '',
    lastData: null as Date | null,
    isSimulated: false,
    lastRawData: ''
  };

  constructor() {
    this.witsClient = new WitsClient();
    this.setupWitsListeners();
  }

  private setupWitsListeners() {
    this.witsClient.on('connected', ({host, port}) => {
      this.witsStatus.connected = true;
      this.witsStatus.address = `${host}:${port}`;
      this.witsStatus.isSimulated = false;
      this.broadcastStatus();
    });

    this.witsClient.on('disconnected', () => {
      this.witsStatus.connected = false;
      this.broadcastStatus();
    });

    this.witsClient.on('witsData', async (data) => {
      this.witsStatus.lastData = new Date();
      this.witsStatus.lastRawData = data.raw;
      
      // Process and store data
      await this.processWitsData(data);
      
      // Update status
      this.broadcastStatus();
    });
  }

  private async processWitsData(data: any) {
    try {
      // Process gamma data if it's the gamma channel
      if (data.channelId === this.getChannelByName('gamma')) {
        await this.processGammaData(data);
      }

      // Process drilling parameters
      const param = await this.processDrillingParam(data);
      if (param) {
        broadcastMessage({
          type: 'drilling_param_update',
          data: param
        });
      }

      // Broadcast raw data
      broadcastMessage({
        type: 'wits_data',
        data: {
          ...data,
          mappedName: this.customChannelMappings.get(data.channelId)
        }
      });
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
    broadcastMessage({
      type: 'gamma_data_update',
      data: stored
    });
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

  private broadcastStatus() {
    broadcastMessage({
      type: 'wits_status',
      data: this.witsStatus
    });
  }

  async connectWits(host: string, port: number) {
    this.isSimulated = false;
    return this.witsClient.connect(host, port);
  }

  disconnect() {
    this.witsClient.disconnect();
  }

  private getChannelByName(name: string): number {
    // Default channels
    if (name === 'gamma') return 11;
    if (name === 'rop') return 2;
    if (name === 'wob') return 3;
    if (name === 'flow') return 4;
    if (name === 'spp') return 5;
    return -1;
  }

  private getUnitForChannel(channelId: number): string {
    const unitMap: Record<number, string> = {
      1: 'ft',  // Depth
      2: 'ft/hr', // ROP 
      3: 'klbs', // WOB
      4: 'gpm',  // Flow
      5: 'psi',  // SPP
      11: 'API'  // Gamma
    };
    return unitMap[channelId] || '';
  }
}

export const witsManager = new WitsManager();
