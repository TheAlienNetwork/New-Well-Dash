
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWitsContext } from '@/context/WitsContext';
import { Badge } from '@/components/ui/badge';
import { Router, Activity } from 'lucide-react';

export default function Settings() {
  const { witsStatus, configureWits } = useWitsContext();
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (host && port) {
      configureWits(host, parseInt(port));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Router className="mr-2 h-5 w-5" />
            WITS Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${witsStatus.connected ? 'bg-accent-green' : 'bg-accent-red'} pulse`}></div>
              <Badge variant={witsStatus.connected ? "default" : "destructive"}>
                {witsStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}
              </Badge>
              {witsStatus.isSimulated && (
                <Badge variant="secondary">SIMULATION</Badge>
              )}
            </div>

            {witsStatus.connected && (
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Address:</span>
                  <span>{witsStatus.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Data:</span>
                  <span>{witsStatus.lastData?.toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleConnect} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                />
                <Input
                  placeholder="Port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Connect to WITS
              </Button>
            </form>

            {witsStatus.lastRawData && (
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <Activity className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Raw WITS Feed</span>
                </div>
                <pre className="bg-neutral-background p-2 rounded text-xs font-mono overflow-x-auto">
                  {witsStatus.lastRawData}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
