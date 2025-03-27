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
            <div className={`p-4 rounded-md ${witsMode === 'real' ? 'bg-navy-800 border border-cyan-800/50' : 'bg-navy-800/50 border border-navy-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-sm font-medium ${witsMode === 'real' ? 'text-cyan-200' : 'text-slate-200'}`}>
                  WITS Server Connection
                </h3>
                <div className={`px-2 py-1 text-xs rounded-md font-mono ${witsMode === 'real' ? 'bg-cyan-950/70 border border-cyan-800/50 text-cyan-400' : 'bg-yellow-950/40 border border-yellow-800/30 text-yellow-500'}`}>
                  {witsMode === 'real' ? 'LIVE MODE' : 'SIMULATION MODE'}
                </div>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${witsMode !== 'real' ? 'opacity-50 pointer-events-none' : ''}`}>
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
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {witsMode !== 'real' && "Switch to real mode to connect to a WITS server"}
                  {witsMode === 'real' && witsStatus.connected && <span className="text-green-500">Connected to {witsStatus.address}</span>}
                </div>
                
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || witsMode !== 'real'}
                  className={`${witsStatus.connected && witsMode === 'real' ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white ${witsMode !== 'real' ? 'opacity-50' : ''}`}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : witsStatus.connected && witsMode === 'real' ? (
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
              
              <div className="bg-navy-950/90 border-2 border-navy-800/80 rounded-md p-4 font-mono text-xs h-64 overflow-auto shadow-inner futuristic-border-subtle">
                {witsRawData.length > 0 ? (
                  <div className="space-y-3">
                    {witsRawData.map((entry, i) => {
                      // Extract readable values from the data
                      const data = entry.data;
                      const formattedData = typeof data === 'object' ? data : { value: data };
                      
                      return (
                        <div key={i} className="border-b border-navy-800/70 pb-3 hover:bg-navy-900/30 transition-all p-2 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></div>
                            <Terminal className="h-3 w-3 text-cyan-500" />
                            <span className="text-slate-400 font-mono text-[10px]">{new Date(entry.recordTime).toLocaleTimeString()}</span>
                            {formattedData.channelId && (
                              <span className="ml-auto px-1.5 py-0.5 bg-navy-800 text-[10px] rounded text-cyan-400 border border-cyan-800/50">
                                CH {formattedData.channelId}
                              </span>
                            )}
                          </div>
                          
                          <div className="ml-5 grid gap-1">
                            {/* Format the data in a more readable way */}
                            {Object.entries(formattedData).map(([key, value]) => (
                              <div key={key} className="grid grid-cols-5 gap-2 items-center">
                                <span className="text-slate-500 col-span-2 truncate">{key}:</span>
                                <span className="text-cyan-300 col-span-3 break-all glow-text-subtle">
                                  {typeof value === 'number' 
                                    ? value.toFixed(2) 
                                    : typeof value === 'boolean'
                                      ? (value ? 'true' : 'false')
                                      : typeof value === 'object'
                                        ? JSON.stringify(value)
                                        : String(value)
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-navy-700 flex items-center justify-center">
                        <Database className="h-6 w-6 opacity-30 text-cyan-700" />
                      </div>
                      <p className="text-cyan-300/70">No WITS data received</p>
                      <p className="text-xs mt-2 text-slate-600 max-w-xs">
                        {witsMode === 'real' 
                          ? 'Connect to a WITS server to see live data transmission' 
                          : 'Enable simulation mode to generate test WITS data'
                        }
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