
import { EventEmitter } from 'events';
import * as net from 'net';

export class WitsClient extends EventEmitter {
  private socket: net.Socket | null = null;
  private buffer: string = '';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly reconnectInterval: number = 5000;
  private isConnected: boolean = false;

  async connect(host: string, port: number): Promise<void> {
    if (this.socket) {
      this.socket.destroy();
    }

    return new Promise((resolve, reject) => {
      this.socket = new net.Socket();

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.emit('connected', { host, port });
        resolve();
      });

      this.socket.on('data', (data) => {
        this.buffer += data.toString();
        this.processBuffer();
      });

      this.socket.on('error', (error) => {
        this.isConnected = false;
        this.emit('error', error);
        this.setupReconnect(host, port);
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

  private processBuffer() {
    const records = this.buffer.split('||');
    this.buffer = records.pop() || '';

    records.forEach(record => {
      if (record.startsWith('&&')) {
        this.processWitsRecord(record + '||');
      }
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
          timestamp: new Date()
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
