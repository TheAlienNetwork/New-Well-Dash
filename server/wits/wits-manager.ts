
import { WitsClient } from './wits-client';
import { WitsmlClient } from './witsml-client';
import { storage } from '../storage';
import { broadcastMessage } from '../routes';

export class WitsManager {
  private witsClient: WitsClient;
  private witsmlClient: WitsmlClient | null = null;
  private readonly standardMappings: Record<number, string> = {
    1: 'bitDepth',
    2: 'hookLoad',
    3: 'blockPosition',
    4: 'ropAvg',
    5: 'ropInst',
    6: 'wob',
    7: 'surfaceTorque',
    8: 'surfaceRpm',
    9: 'standpipePressure',
    10: 'flowRateIn',
    11: 'totalGas',
    12: 'temperature',
    13: 'mudDensityIn',
    14: 'mudDensityOut'
  };

  constructor() {
    this.witsClient = new WitsClient();
    this.setupWitsListeners();
  }

  private setupWitsListeners() {
    this.witsClient.on('witsData', async (data) => {
      try {
        // Store raw WITS data
        await this.storeRawWitsData(data);

        // Map and store drilling parameters
        if (this.standardMappings[data.channelId]) {
          const param = {
            name: this.standardMappings[data.channelId],
            value: data.value,
            unit: this.getUnitForChannel(data.channelId),
            witsId: data.channelId,
            wellId: 1 // Replace with actual well ID
          };
          const storedParam = await storage.createDrillingParam(param);
          broadcastMessage({
            type: 'drilling_param_update',
            data: storedParam
          });
        }

        // Broadcast raw WITS data
        broadcastMessage({
          type: 'raw_wits_data',
          data
        });
      } catch (error) {
        console.error('Error processing WITS data:', error);
      }
    });
  }

  private async storeRawWitsData(data: any) {
    // Store in memory or database
    console.log('Raw WITS Data:', data);
  }

  private getUnitForChannel(channelId: number): string {
    const unitMap: Record<number, string> = {
      1: 'ft',
      2: 'klbs',
      3: 'ft',
      4: 'ft/hr',
      5: 'ft/hr',
      6: 'klbs',
      7: 'ft-lbs',
      8: 'rpm',
      9: 'psi',
      10: 'gpm',
      11: '%',
      12: '°F',
      13: 'ppg',
      14: 'ppg'
    };
    return unitMap[channelId] || '';
  }

  connectWits(host: string, port: number) {
    this.witsClient.connect(host, port);
  }

  connectWitsml(url: string, username: string, password: string) {
    this.witsmlClient = new WitsmlClient(url, username, password);
    this.witsmlClient.connect();
  }

  disconnect() {
    this.witsClient.disconnect();
    if (this.witsmlClient) {
      this.witsmlClient.disconnect();
    }
  }
}

export const witsManager = new WitsManager();
