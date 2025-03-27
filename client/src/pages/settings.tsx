import { useWitsContext } from '@/context/WitsContext';
import Card from '@/components/Card';
import CardHeader from '@/components/CardHeader';
import CardTitle from '@/components/CardTitle';
import CardDescription from '@/components/CardDescription';
import CardContent from '@/components/CardContent';
import Switch from '@/components/Switch';


export default function Settings() {
  const { witsStatus, witsMode, witsData, toggleWitsMode } = useWitsContext();

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-surface border-neutral-border">
        <CardHeader>
          <CardTitle>WITS Connection</CardTitle>
          <CardDescription>Configure and monitor WITS data feed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">WITS Mode</h3>
                <p className="text-sm text-gray-500">Switch between simulated and real WITS data</p>
              </div>
              <Switch 
                checked={witsMode === 'real'}
                onCheckedChange={() => toggleWitsMode(witsMode === 'real' ? 'simulated' : 'real')}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Connection Status</h3>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${witsStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">{witsStatus ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Live WITS Feed</h3>
              <div className="bg-black/20 rounded-md p-3 font-mono text-xs h-32 overflow-auto">
                {witsData.map((data, i) => (
                  <div key={i} className="text-gray-400">{JSON.stringify(data)}</div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}