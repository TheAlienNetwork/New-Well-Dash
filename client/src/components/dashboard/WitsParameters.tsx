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

const ParameterCard: React.FC<ParameterCardProps> = ({ name, value, unit, bgClass = "bg-neutral-background", icon }) => (
  <div className={`${bgClass} rounded-lg p-4 shadow-glow`}>
    <div className="flex items-center mb-2">
      <h3 className="text-sm font-medium text-gray-300">{name}</h3>
      {icon && <div className="ml-auto">{icon}</div>}
    </div>
    <div className="flex items-end">
      <span className="text-2xl font-heading font-bold">{value.toFixed(1)}</span>
      <span className="text-xs text-gray-400 ml-1 mb-1">{unit}</span>
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
    <div className="bg-neutral-surface rounded-lg overflow-hidden futuristic-border">
      <div className="p-4 bg-primary-dark flex justify-between items-center">
        <h2 className="font-heading text-lg font-semibold flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Real-Time Drilling Parameters
        </h2>
        <div className="bg-neutral-background text-xs px-2 py-1 rounded flex items-center">
          <div className="h-2 w-2 rounded-full bg-secondary-teal pulse mr-1"></div>
          Live WITS Data
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ParameterCard 
            name="Weight on Bit" 
            value={wob ? Number(wob.value) : 0} 
            unit="klbs" 
            bgClass="bg-primary/10"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
              </svg>
            }
          />
          <ParameterCard 
            name="RPM" 
            value={rpm ? Number(rpm.value) : 0} 
            unit="rpm" 
            bgClass="bg-secondary-purple/10"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-purple" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            }
          />
          <ParameterCard 
            name="Flow Rate" 
            value={flow ? Number(flow.value) : 0} 
            unit="gpm" 
            bgClass="bg-secondary-teal/10"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-teal" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 3a1 1 0 00-1 1v4a1 1 0 01-1 1H5a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1h-3zm-1 7a1 1 0 00-1 1v2a1 1 0 002 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            }
          />
          <ParameterCard 
            name="Standpipe Pressure" 
            value={pressure ? Number(pressure.value) : 0} 
            unit="psi" 
            bgClass="bg-accent-red/10"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-red" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            }
          />
          <ParameterCard 
            name="Torque" 
            value={torque ? Number(torque.value) : 0} 
            unit="ft-lbs" 
            bgClass="bg-accent-orange/10"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-orange" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            }
          />
          <ParameterCard 
            name="Rate of Penetration" 
            value={rop ? Number(rop.value) : 0} 
            unit="ft/hr" 
            bgClass="bg-accent-green/10"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-green" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* Current Depth Section */}
        <div className="mt-6 bg-neutral-background rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Current Depth</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400">Bit Depth</p>
              <p className="text-xl font-heading font-bold">{witsData?.bitDepth.toFixed(2) || '0.00'}<span className="text-xs text-gray-400 ml-1">ft</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Inclination</p>
              <p className="text-xl font-heading font-bold">{witsData?.inc.toFixed(2) || '0.00'}<span className="text-xs text-gray-400 ml-1">°</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Azimuth</p>
              <p className="text-xl font-heading font-bold">{witsData?.azi.toFixed(2) || '0.00'}<span className="text-xs text-gray-400 ml-1">°</span></p>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-4 text-right text-xs text-gray-400">
          Last Updated: {witsData ? new Date(witsData.timestamp).toLocaleTimeString() : 'N/A'}
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
        .shadow-glow {
          box-shadow: 0 0 15px rgba(52, 152, 219, 0.1);
          transition: box-shadow 0.3s ease;
        }
        .shadow-glow:hover {
          box-shadow: 0 0 15px rgba(52, 152, 219, 0.3);
        }
      `}</style>
    </div>
  );
}
