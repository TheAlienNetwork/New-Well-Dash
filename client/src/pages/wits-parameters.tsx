import React from 'react';
import WitsParameters from '@/components/dashboard/WitsParameters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWitsContext } from '@/context/WitsContext';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CircuitBoard, Activity, Router, Clock } from 'lucide-react';

export default function WitsParametersPage() {
  const { witsStatus, configureWits, drillingParams } = useWitsContext();

  // Generate sample historical data for charts
  const generateTimeSeriesData = (baseValue: number, variance: number, points: number = 20) => {
    const data = [];
    let value = baseValue;
    const now = new Date();
    
    for (let i = points; i >= 0; i--) {
      value = baseValue + (Math.random() * variance * 2 - variance);
      const time = new Date(now.getTime() - i * 30000); // 30 second intervals
      
      data.push({
        time: time.toLocaleTimeString(),
        value
      });
    }
    
    return data;
  };

  // Get sample data for various parameters
  const getParamByName = (name: string) => {
    return drillingParams.find(param => param.name === name);
  };

  const wob = getParamByName('Weight on Bit');
  const rpm = getParamByName('RPM');
  const rop = getParamByName('ROP');

  const wobData = generateTimeSeriesData(wob ? Number(wob.value) : 25, 2);
  const rpmData = generateTimeSeriesData(rpm ? Number(rpm.value) : 120, 5);
  const ropData = generateTimeSeriesData(rop ? Number(rop.value) : 54, 3);

  const handleConfigureWits = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const host = formData.get('host') as string;
    const port = parseInt(formData.get('port') as string);
    
    if (host && port) {
      configureWits(host, port);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Parameters Summary */}
      <WitsParameters />
      
      {/* Connection Status & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-neutral-surface border-neutral-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-heading flex items-center">
              <Router className="mr-2 h-5 w-5 text-primary" />
              WITS Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${witsStatus.connected ? 'bg-accent-green' : 'bg-accent-red'} pulse`}></div>
                <div>
                  <Badge variant={witsStatus.connected ? "default" : "destructive"}>
                    {witsStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </Badge>
                </div>
              </div>
              
              {witsStatus.connected && (
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Address:</span>
                    <span>{witsStatus.address || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Ping:</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data Rate:</span>
                    <span>2.3 KB/s</span>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleConfigureWits} className="space-y-3 pt-2 border-t border-neutral-border">
                <div>
                  <Label htmlFor="host" className="text-xs text-gray-400">Host</Label>
                  <Input 
                    id="host" 
                    name="host" 
                    placeholder="192.168.1.105" 
                    defaultValue="192.168.1.105"
                    className="bg-neutral-background border-neutral-border"
                  />
                </div>
                <div>
                  <Label htmlFor="port" className="text-xs text-gray-400">Port</Label>
                  <Input 
                    id="port" 
                    name="port" 
                    placeholder="8080" 
                    defaultValue="8080"
                    className="bg-neutral-background border-neutral-border"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {witsStatus.connected ? 'Reconnect' : 'Connect'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-surface border-neutral-border col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-heading flex items-center">
              <CircuitBoard className="mr-2 h-5 w-5 text-primary" />
              WITS Diagnostic Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-neutral-background rounded-md p-3">
                <div className="text-xs text-gray-400 mb-1">Data Points Received</div>
                <div className="text-2xl font-heading font-medium">14,328</div>
              </div>
              <div className="bg-neutral-background rounded-md p-3">
                <div className="text-xs text-gray-400 mb-1">Connection Uptime</div>
                <div className="text-2xl font-heading font-medium">3h 42m</div>
              </div>
              <div className="bg-neutral-background rounded-md p-3">
                <div className="text-xs text-gray-400 mb-1">Data Quality</div>
                <div className="text-2xl font-heading font-medium">98.7%</div>
              </div>
            </div>
            
            <div className="bg-neutral-background rounded-md p-3">
              <div className="mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1 text-primary" />
                <span className="text-sm">Recent Activity</span>
              </div>
              <div className="text-xs space-y-1 text-gray-300">
                <div className="flex justify-between">
                  <span>New gamma measurement received</span>
                  <span className="text-gray-400">Just now</span>
                </div>
                <div className="flex justify-between">
                  <span>Bit depth updated</span>
                  <span className="text-gray-400">12 seconds ago</span>
                </div>
                <div className="flex justify-between">
                  <span>ROP calculation updated</span>
                  <span className="text-gray-400">24 seconds ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Survey parameters updated</span>
                  <span className="text-gray-400">57 seconds ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Parameter Trends */}
      <div className="bg-neutral-surface rounded-lg overflow-hidden futuristic-border">
        <div className="p-4 bg-primary-dark flex justify-between items-center">
          <h2 className="font-heading text-lg font-semibold flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Parameter Trends
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" className="bg-neutral-surface text-sm">
              Export
            </Button>
            <div className="bg-neutral-background text-xs px-2 py-1 rounded flex items-center">
              <div className="h-2 w-2 rounded-full bg-secondary-teal pulse mr-1"></div>
              Live
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <Card className="bg-neutral-background border-neutral-border">
            <CardHeader className="pb-0 pt-3">
              <CardTitle className="text-sm">Weight on Bit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wobData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10, fill: '#666' }}
                      tickFormatter={(value) => value.substring(0, 5)}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#666' }}
                      domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E1E1E', 
                        border: '1px solid #333',
                        color: '#E0E0E0'
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} klbs`, 'WOB']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3498DB" 
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-neutral-background border-neutral-border">
            <CardHeader className="pb-0 pt-3">
              <CardTitle className="text-sm">RPM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rpmData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10, fill: '#666' }}
                      tickFormatter={(value) => value.substring(0, 5)}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#666' }}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E1E1E', 
                        border: '1px solid #333',
                        color: '#E0E0E0'
                      }}
                      formatter={(value: number) => [`${value.toFixed(0)} rpm`, 'RPM']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#9B59B6" 
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-neutral-background border-neutral-border">
            <CardHeader className="pb-0 pt-3">
              <CardTitle className="text-sm">Rate of Penetration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ropData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10, fill: '#666' }}
                      tickFormatter={(value) => value.substring(0, 5)}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#666' }}
                      domain={['dataMin - 3', 'dataMax + 3']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E1E1E', 
                        border: '1px solid #333',
                        color: '#E0E0E0'
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} ft/hr`, 'ROP']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2ECC71" 
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .futuristic-border {
          border: 1px solid rgba(52, 152, 219, 0.3);
          position: relative;
        }
        .futuristic-border::before, .futuristic-border::after {
          content: '';
          position: absolute;
          width: 15px;
          height: 15px;
          border-color: #3498DB;
        }
        .futuristic-border::before {
          top: -1px;
          left: -1px;
          border-top: 2px solid;
          border-left: 2px solid;
        }
        .futuristic-border::after {
          bottom: -1px;
          right: -1px;
          border-bottom: 2px solid;
          border-right: 2px solid;
        }
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
