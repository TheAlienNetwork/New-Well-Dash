
import { EventEmitter } from 'events';
import net from 'net';

export class WitsClient extends EventEmitter {
  private socket: net.Socket | null = null;
  private buffer: string = '';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly reconnectInterval = 5000;

  constructor() {
    super();
  }

  connect(host: string, port: number) {
    if (this.socket) {
      this.socket.destroy();
    }

    this.socket = new net.Socket();

    this.socket.on('connect', () => {
      console.log('WITS connection established');
      this.emit('connected');
      if (this.reconnectTimer) {
        clearInterval(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    this.socket.on('data', (data) => {
      this.buffer += data.toString();
      this.processBuffer();
    });

    this.socket.on('error', (error) => {
      console.error('WITS connection error:', error);
      this.emit('error', error);
    });

    this.socket.on('close', () => {
      console.log('WITS connection closed');
      this.emit('disconnected');
      this.setupReconnect(host, port);
    });

    this.socket.connect(port, host);
  }

  private processBuffer() {
    const records = this.buffer.split('\n');
    this.buffer = records.pop() || '';

    for (const record of records) {
      if (record.trim()) {
        this.processWitsRecord(record.trim());
      }
    }
  }

  private processWitsRecord(record: string) {
    try {
      // Standard WITS record format: &&recordId,channelId,value||
      const match = record.match(/&&(\d+),(\d+),([^|]+)\|\|/);
      if (match) {
        const [, recordId, channelId, value] = match;
        this.emit('witsData', {
          recordId: parseInt(recordId),
          channelId: parseInt(channelId),
          value: parseFloat(value)
        });
      }
    } catch (error) {
      console.error('Error processing WITS record:', error);
    }
  }

  private setupReconnect(host: string, port: number) {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setInterval(() => {
        console.log('Attempting to reconnect to WITS server...');
        this.connect(host, port);
      }, this.reconnectInterval);
    }
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
  }
}
