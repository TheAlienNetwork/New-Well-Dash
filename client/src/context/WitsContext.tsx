import React, { createContext, useContext, useState, useEffect } from 'react';
import { witsClient, WitsData, WitsStatus } from '@/lib/wits-client';
import { DrillingParam } from '@shared/schema';

interface WitsContextType {
  witsData: WitsData | null;
  witsStatus: WitsStatus;
  drillingParams: DrillingParam[];
  configureWits: (host: string, port: number) => void;
  toggleWitsMode: (mode: 'real' | 'simulated') => void;
  witsMode: 'real' | 'simulated';
  witsRawData: any[];
}

const defaultWitsStatus: WitsStatus = {
  connected: false,
  address: '',
  lastData: null
};

// Store raw WITS data for display
const MAX_RAW_DATA_ITEMS = 100;

const WitsContext = createContext<WitsContextType>({
  witsData: null,
  witsStatus: defaultWitsStatus,
  drillingParams: [],
  configureWits: () => {},
  toggleWitsMode: () => {},
  witsMode: 'simulated',
  witsRawData: []
});

export const useWitsContext = () => useContext(WitsContext);

export const WitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [witsData, setWitsData] = useState<WitsData | null>(null);
  const [witsStatus, setWitsStatus] = useState<WitsStatus>(defaultWitsStatus);
  const [drillingParams, setDrillingParams] = useState<DrillingParam[]>([]);
  const [witsMode, setWitsMode] = useState<'real' | 'simulated'>('simulated');
  const [witsRawData, setWitsRawData] = useState<any[]>([]);

  useEffect(() => {
    // Connect to websocket on initial load
    witsClient.connect().catch(console.error);

    // Listen for WITS data updates
    witsClient.onWitsData((data) => {
      setWitsData(data);
      // Add raw data to the list with timestamp
      setWitsRawData(prev => {
        const newData = [
          {
            recordTime: new Date().toISOString(),
            data
          },
          ...prev
        ];
        // Keep only the most recent items to avoid memory issues
        return newData.slice(0, MAX_RAW_DATA_ITEMS);
      });
    });

    // Listen for WITS connection status
    witsClient.onWitsStatus((status) => {
      setWitsStatus(status);
    });

    // Listen for drilling parameters
    witsClient.onDrillingParams((params) => {
      setDrillingParams(params);
    });

    // Listen for individual drilling parameter updates
    witsClient.onDrillingParamUpdate((param) => {
      setDrillingParams(prevParams => {
        const index = prevParams.findIndex(p => p.id === param.id);
        if (index >= 0) {
          const updatedParams = [...prevParams];
          updatedParams[index] = param;
          return updatedParams;
        } else {
          return [...prevParams, param];
        }
      });
    });

    // Cleanup
    return () => {
      witsClient.disconnect();
    };
  }, []);

  const configureWits = (host: string, port: number) => {
    witsClient.configureWits({
      host,
      port
    });
  };

  const toggleWitsMode = (mode: 'real' | 'simulated') => {
    setWitsMode(mode);
    witsClient.sendMessage('wits_simulation_toggle', { 
      isSimulated: mode === 'simulated' 
    });
  };

  return (
    <WitsContext.Provider 
      value={{ 
        witsData, 
        witsStatus, 
        drillingParams, 
        configureWits, 
        toggleWitsMode, 
        witsMode,
        witsRawData
      }}
    >
      {children}
    </WitsContext.Provider>
  );
};