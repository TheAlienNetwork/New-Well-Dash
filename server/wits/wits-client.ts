
import { EventEmitter } from 'events';
import * as net from 'net';

export class WitsClient extends EventEmitter {
  private socket: net.Socket | null = null;
  private buffer: string = '';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly reconnectInterval: number = 5000;
  private isConnected: boolean = false;
  private host: string = '';
  private port: number = 0;

  async connect(host: string, port: number): Promise<void> {
    this.host = host;
    this.port = port;

    if (this.socket) {
      this.socket.destroy();
    }

    return new Promise((resolve, reject) => {
      console.log(`Connecting to WITS server at ${host}:${port}`);
      this.socket = new net.Socket();

      this.socket.on('connect', () => {
        console.log('Connected to WITS server');
        this.isConnected = true;
        this.emit('connected', { host, port });
        if (this.reconnectTimer) {
          clearInterval(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        resolve();
      });

      this.socket.on('data', (data) => {
        this.buffer += data.toString();
        this.processBuffer();
      });

      this.socket.on('error', (error) => {
        console.error('WITS connection error:', error);
        this.isConnected = false;
        this.emit('error', error);
        this.setupReconnect();
        reject(error);
      });

      this.socket.on('close', () => {
        console.log('WITS connection closed');
        this.isConnected = false;
        this.emit('disconnected');
        this.setupReconnect();
      });

      this.socket.connect(port, host);
    });
  }

  private processBuffer() {
    // Split on record separator and process each complete record
    const records = this.buffer.split('||');
    // Keep the last incomplete record in the buffer
    this.buffer = records.pop() || '';

    records.forEach(record => {
      if (record.startsWith('&&')) {
        this.processWitsRecord(record + '||');
      }
    });
  }

  private processWitsRecord(record: string) {
    try {
      // Example WITS record format: &&<record_id>,<channel_id>,<value>||
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

  private setupReconnect() {
    if (!this.reconnectTimer && this.host && this.port) {
      console.log('Setting up reconnection timer...');
      this.reconnectTimer = setInterval(() => {
        if (!this.isConnected) {
          console.log('Attempting to reconnect to WITS server...');
          this.connect(this.host, this.port).catch(() => {
            console.log('Reconnection attempt failed');
          });
        }
      }, this.reconnectInterval);
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      address: this.isConnected ? `${this.host}:${this.port}` : ''
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.isConnected = false;
    this.host = '';
    this.port = 0;
  }
}
