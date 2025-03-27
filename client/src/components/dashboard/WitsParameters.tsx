import React from 'react';
import { useWitsContext } from '@/context/WitsContext';
import { Activity } from 'lucide-react';

interface ParameterCardProps {
  name: string;
  value: number;
  unit: string;
  bgClass?: string;
  icon?: React.ReactNode;
}

const ParameterCard: React.FC<ParameterCardProps> = ({ name, value, unit, bgClass = "bg-navy-900/50", icon }) => (
  <div className={`${bgClass} rounded-lg p-4 border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:z-10`}>
    <div className="flex items-center mb-2">
      <h3 className="text-sm font-medium text-cyan-200 font-mono uppercase tracking-wider">{name}</h3>
      {icon && <div className="ml-auto p-1 rounded-full bg-navy-850/70">{icon}</div>}
    </div>
    <div className="flex items-end">
      <span className="text-2xl font-mono font-bold glow-text">{value.toFixed(1)}</span>
      <span className="text-xs text-cyan-400/70 ml-1 mb-1 font-mono">{unit}</span>
    </div>
  </div>
);

export default function WitsParameters() {
  const { drillingParams, witsData } = useWitsContext();

  // Find specific parameters by name
  const getParamByName = (name: string) => {
    return drillingParams.find(param => param.name === name);
  };

  const wob = getParamByName('Weight on Bit');
  const rpm = getParamByName('RPM');
  const flow = getParamByName('Flow Rate');
  const pressure = getParamByName('Standpipe Pressure');
  const torque = getParamByName('Torque');
  const rop = getParamByName('ROP');

  return (
    <div className="glass-panel rounded-lg overflow-hidden futuristic-border">
      <div className="p-4 bg-gradient-to-r from-navy-900 to-navy-950 flex justify-between items-center border-b border-cyan-500/30">
        <h2 className="font-heading text-lg font-semibold flex items-center text-cyan-100">
          <Activity className="h-5 w-5 mr-2 text-cyan-400" />
          Real-Time Drilling Parameters
        </h2>
        <div className="bg-navy-950/70 text-xs px-3 py-1.5 rounded-md flex items-center border border-emerald-500/30 shadow-inner">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
          <span className="text-emerald-400 font-mono tracking-wider">LIVE WITS</span>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ParameterCard 
            name="Weight on Bit" 
            value={wob ? Number(wob.value) : 0} 
            unit="klbs" 
            bgClass="bg-navy-900/50 border-cyan-500/30"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
              </svg>
            }
          />
          <ParameterCard 
            name="RPM" 
            value={rpm ? Number(rpm.value) : 0} 
            unit="rpm" 
            bgClass="bg-navy-900/50 border-purple-500/30"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            }
          />
          <ParameterCard 
            name="Flow Rate" 
            value={flow ? Number(flow.value) : 0} 
            unit="gpm" 
            bgClass="bg-navy-900/50 border-teal-500/30"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 3a1 1 0 00-1 1v4a1 1 0 01-1 1H5a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1h-3zm-1 7a1 1 0 00-1 1v2a1 1 0 002 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            }
          />
          <ParameterCard 
            name="Standpipe Pressure" 
            value={pressure ? Number(pressure.value) : 0} 
            unit="psi" 
            bgClass="bg-navy-900/50 border-red-500/30"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            }
          />
          <ParameterCard 
            name="Torque" 
            value={torque ? Number(torque.value) : 0} 
            unit="ft-lbs" 
            bgClass="bg-navy-900/50 border-orange-500/30"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            }
          />
          <ParameterCard 
            name="Rate of Penetration" 
            value={rop ? Number(rop.value) : 0} 
            unit="ft/hr" 
            bgClass="bg-navy-900/50 border-green-500/30"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* Current Depth Section */}
        <div className="mt-6 bg-navy-900/50 rounded-lg p-4 border border-cyan-500/30 shadow-inner">
          <div className="flex items-center mb-3">
            <h3 className="text-sm font-medium text-cyan-200 font-mono uppercase tracking-wider">CURRENT DEPTH</h3>
            <div className="ml-auto px-2 py-1 bg-navy-950/70 rounded-md border border-cyan-500/20 text-xs text-cyan-300/70 font-mono flex items-center">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 mr-1.5 animate-pulse"></div>
              LIVE MWD
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-navy-850/50 rounded-lg border border-cyan-600/20 hover:border-cyan-500/30 transition-all">
              <p className="text-xs text-navy-200 font-mono uppercase tracking-wider">BIT DEPTH</p>
              <p className="text-xl font-mono font-bold glow-text">{witsData?.bitDepth.toFixed(2) || '0.00'}<span className="text-xs text-cyan-400/70 ml-1">ft</span></p>
            </div>
            <div className="p-3 bg-navy-850/50 rounded-lg border border-cyan-600/20 hover:border-cyan-500/30 transition-all">
              <p className="text-xs text-navy-200 font-mono uppercase tracking-wider">INCLINATION</p>
              <p className="text-xl font-mono font-bold glow-text">{witsData?.inc.toFixed(2) || '0.00'}<span className="text-xs text-cyan-400/70 ml-1">°</span></p>
            </div>
            <div className="p-3 bg-navy-850/50 rounded-lg border border-cyan-600/20 hover:border-cyan-500/30 transition-all">
              <p className="text-xs text-navy-200 font-mono uppercase tracking-wider">AZIMUTH</p>
              <p className="text-xl font-mono font-bold glow-text">{witsData?.azi.toFixed(2) || '0.00'}<span className="text-xs text-cyan-400/70 ml-1">°</span></p>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-4 flex justify-end">
          <div className="bg-navy-950/70 px-3 py-1.5 rounded-md border border-cyan-500/20 text-xs text-cyan-400/90 font-mono flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            LAST UPDATED: {witsData ? new Date(witsData.timestamp).toLocaleTimeString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* CSS for futuristic border is now defined in index.css */}
    </div>
  );
}
