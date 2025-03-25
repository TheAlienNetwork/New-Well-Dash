import React from 'react';
import { useWellContext } from '@/context/WellContext';
import { useWitsContext } from '@/context/WitsContext';
import { Settings, Activity, Drill } from 'lucide-react';

export default function AppHeader() {
  const { wellInfo } = useWellContext();
  const { witsStatus } = useWitsContext();

  return (
    <header className="bg-navy-950 border-b border-cyan-500/20 p-4 text-white shadow-lg">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-heading font-bold flex items-center">
            <Drill 
              className="h-8 w-8 mr-2 text-cyan-400" 
              strokeWidth={1.5}
            />
            <span className="glow-text">NEW WELL TECHNOLOGIES</span>
          </h1>
          <div className="hidden md:flex border-l border-cyan-500/30 pl-4 items-center">
            <div className="mr-6 futuristic-container px-3 py-1">
              <span className="text-xs text-navy-200">WELL NAME</span>
              <h2 className="font-mono text-lg glow-text">{wellInfo?.wellName || 'Loading...'}</h2>
            </div>
            <div className="futuristic-container px-3 py-1">
              <span className="text-xs text-navy-200">RIG NAME</span>
              <h2 className="font-mono text-lg glow-text">{wellInfo?.rigName || 'Loading...'}</h2>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="futuristic-container rounded px-3 py-1 flex items-center">
            <div className="flex items-center mr-3">
              <div className={`h-2 w-2 rounded-full ${witsStatus.connected ? 'bg-emerald-400' : 'bg-rose-500'} pulse-effect mr-2`}></div>
              <span className="text-xs font-mono">
                {witsStatus.connected ? 'WITS CONNECTED' : 'WITS DISCONNECTED'}
              </span>
            </div>
            <div className="text-xs text-cyan-400/70 hidden md:block font-mono">
              {witsStatus.address || 'Not connected'}
            </div>
          </div>
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-cyan-400 mr-2 pulse-effect" />
            <div className="text-xs text-navy-200 font-mono">
              SYSTEM ACTIVE
            </div>
          </div>
          <button className="bg-cyan-500/20 p-2 rounded-full hover:shadow-glow transition-all duration-300 glow-border">
            <Settings className="h-5 w-5 text-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
