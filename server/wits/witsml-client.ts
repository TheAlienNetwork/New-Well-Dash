
import axios from 'axios';
import { EventEmitter } from 'events';

export class WitsmlClient extends EventEmitter {
  private url: string;
  private username: string;
  private password: string;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(url: string, username: string, password: string) {
    super();
    this.url = url;
    this.username = username;
    this.password = password;
  }

  async connect() {
    try {
      await this.getVersion();
      this.startPolling();
      this.emit('connected');
    } catch (error) {
      this.emit('error', error);
    }
  }

  private async getVersion(): Promise<string> {
    const response = await axios.post(
      this.url,
      this.createVersionQuery(),
      this.getRequestConfig()
    );
    return response.data;
  }

  private startPolling() {
    if (!this.pollInterval) {
      this.pollInterval = setInterval(async () => {
        try {
          const data = await this.fetchLatestData();
          this.emit('witsmlData', data);
        } catch (error) {
          console.error('Error polling WITSML data:', error);
        }
      }, 5000);
    }
  }

  private async fetchLatestData() {
    const response = await axios.post(
      this.url,
      this.createDataQuery(),
      this.getRequestConfig()
    );
    return response.data;
  }

  private createVersionQuery(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <WMLS_GetVersion xmlns="http://www.witsml.org/message/120"/>`;
  }

  private createDataQuery(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <WMLS_GetFromStore xmlns="http://www.witsml.org/message/120">
        <WMLtypeIn>log</WMLtypeIn>
        <QueryIn><!-- Add your WITSML query here --></QueryIn>
        <OptionsIn>returnElements=all</OptionsIn>
      </WMLS_GetFromStore>`;
  }

  private getRequestConfig() {
    return {
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': 'Basic ' + Buffer.from(this.username + ':' + this.password).toString('base64')
      }
    };
  }

  disconnect() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
