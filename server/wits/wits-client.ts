
import { Socket } from 'net';
import { EventEmitter } from 'events';

export class WitsClient extends EventEmitter {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectInterval: number = 5000;
  private buffer: string = '';

  constructor() {
    super();
  }

  connect(host: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.destroy();
      }

      this.socket = new Socket();
      
      this.socket.on('connect', () => {
        this.isConnected = true;
        this.emit('connected', { host, port });
        resolve();
      });

      this.socket.on('data', (data) => {
        this.buffer += data.toString();
        
        // Process complete WITS records
        let endIndex;
        while ((endIndex = this.buffer.indexOf('||')) !== -1) {
          const record = this.buffer.substring(0, endIndex + 2);
          this.buffer = this.buffer.substring(endIndex + 2);
          this.processWitsRecord(record);
        }
      });

      this.socket.on('error', (error) => {
        console.error('WITS socket error:', error);
        this.emit('error', error);
        reject(error);
      });

      this.socket.on('close', () => {
        this.isConnected = false;
        this.emit('disconnected');
        this.setupReconnect(host, port);
      });

      this.socket.connect(port, host);
    });
  }

  private processWitsRecord(record: string) {
    try {
      const match = record.match(/&&(\d+),(\d+),([^|]+)\|\|/);
      if (match) {
        const [, recordId, channelId, value] = match;
        this.emit('witsData', {
          recordId: parseInt(recordId),
          channelId: parseInt(channelId),
          value: parseFloat(value),
          timestamp: new Date(),
          raw: record
        });
      }
    } catch (error) {
      console.error('Error processing WITS record:', error);
    }
  }

  private setupReconnect(host: string, port: number) {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setInterval(() => {
        if (!this.isConnected) {
          console.log('Attempting to reconnect to WITS server...');
          this.connect(host, port).catch(() => {});
        }
      }, this.reconnectInterval);
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      lastError: null
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.isConnected = false;
  }
}
