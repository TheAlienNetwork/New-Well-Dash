import { useWitsContext } from '@/context/WitsContext';
import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Power, 
  Play, 
  Pause, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Database,
  Terminal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { witsStatus, witsMode, witsRawData, toggleWitsMode, configureWits } = useWitsContext();
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('8080');
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Auto-refresh the last updated timestamp every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleConnect = async () => {
    if (!host || !port) {
      toast({
        title: "Missing Information",
        description: "Please enter both host and port",
        variant: "destructive"
      });
      return;
    }
    
    setIsConnecting(true);
    try {
      await configureWits(host, parseInt(port, 10));
      toast({
        title: "Connection Attempt",
        description: `Attempting to connect to WITS server at ${host}:${port}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to WITS server",
        variant: "destructive"
      });
      console.error("WITS connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const getTimeAgo = (timestamp: Date | null) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const timeMs = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(timeMs / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-navy-900 border-cyan-800/30 shadow-lg shadow-cyan-900/10">
        <CardHeader className="border-b border-cyan-800/30">
          <CardTitle className="text-xl font-mono flex items-center text-cyan-100">
            <Server className="mr-2 h-5 w-5 text-cyan-400" />
            WITS Connection Configuration
          </CardTitle>
          <CardDescription className="text-slate-400">
            Connect to real-time WITS data servers or use simulated data
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-md bg-navy-800 border border-navy-700">
              <div>
                <h3 className="text-sm font-medium text-slate-200">WITS Mode</h3>
                <p className="text-sm text-slate-400">
                  {witsMode === 'real' ? 'Using real WITS data connection' : 'Using simulated data for testing'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Simulated</span>
                <Switch 
                  checked={witsMode === 'real'}
                  onCheckedChange={() => toggleWitsMode(witsMode === 'real' ? 'simulated' : 'real')}
                  className="data-[state=checked]:bg-cyan-600"
                />
                <span className="text-xs text-slate-300 font-medium">Real</span>
              </div>
            </div>
            
            {/* Connection Form */}
            {witsMode === 'real' && (
              <div className="p-4 rounded-md bg-navy-800 border border-navy-700">
                <h3 className="text-sm font-medium text-slate-200 mb-3">Server Connection</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="host" className="text-xs text-slate-400 block mb-1">Host / IP Address</label>
                    <Input
                      id="host"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="e.g. 192.168.1.100"
                      className="bg-navy-950 border-navy-600 text-slate-200 placeholder:text-slate-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="port" className="text-xs text-slate-400 block mb-1">Port</label>
                    <Input
                      id="port"
                      value={port}
                      onChange={(e) => setPort(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 8080"
                      className="bg-navy-950 border-navy-600 text-slate-200 placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className={`${witsStatus.connected ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : witsStatus.connected ? (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <Wifi className="mr-2 h-4 w-4" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Connection Status */}
            <div className="p-4 rounded-md bg-navy-800 border border-navy-700">
              <h3 className="text-sm font-medium text-slate-200 mb-3">Connection Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Status:</span>
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full mr-2 ${witsStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className={`text-sm font-medium ${witsStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                      {witsStatus.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Server:</span>
                  <span className="text-sm text-slate-300 font-mono">
                    {witsStatus.address || 'None'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Last data received:</span>
                  <div className="text-right">
                    <span className="text-sm text-slate-300 block">
                      {formatTimestamp(witsStatus.lastData || null)}
                    </span>
                    {witsStatus.lastData && (
                      <span className="text-xs text-slate-500">
                        {getTimeAgo(witsStatus.lastData)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Mode:</span>
                  <span className={`text-sm font-medium ${witsMode === 'real' ? 'text-cyan-400' : 'text-yellow-400'}`}>
                    {witsMode === 'real' ? 'Real-time Data' : 'Simulated Data'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Live Data Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-200">Live WITS Feed</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {witsRawData.length} records • Last updated: {getTimeAgo(lastUpdated)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-cyan-400"
                    onClick={() => setLastUpdated(new Date())}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-navy-950 border border-navy-800 rounded-md p-4 font-mono text-xs h-64 overflow-auto">
                {witsRawData.length > 0 ? (
                  <div className="space-y-2">
                    {witsRawData.map((entry, i) => (
                      <div key={i} className="border-b border-navy-800 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Terminal className="h-3 w-3 text-cyan-500" />
                          <span className="text-slate-500">{new Date(entry.recordTime).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-cyan-300 ml-5 break-all">
                          {JSON.stringify(entry.data)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <Database className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>No WITS data received</p>
                      <p className="text-xs mt-1 text-slate-600">
                        {witsMode === 'real' ? 'Connect to a WITS server to see live data' : 'Enable simulation mode to see test data'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-navy-800/50 justify-between p-4 border-t border-navy-700">
          <div className="text-xs text-slate-500">
            <span className="text-cyan-400 font-medium">WITS</span> - Wellsite Information Transfer Specification
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-cyan-800 text-cyan-400 hover:bg-cyan-950"
            onClick={() => toggleWitsMode(witsMode === 'real' ? 'simulated' : 'real')}
          >
            {witsMode === 'real' ? (
              <>
                <Play className="mr-1 h-3 w-3" /> 
                Switch to Simulation
              </>
            ) : (
              <>
                <WifiOff className="mr-1 h-3 w-3" /> 
                Switch to Real-time
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}