import React, { createContext, useContext, useState, useEffect } from 'react';
import { witsClient, WitsData, WitsStatus } from '@/lib/wits-client';
import { DrillingParam } from '@shared/schema';

interface WitsContextType {
  witsData: WitsData | null;
  witsStatus: WitsStatus;
  drillingParams: DrillingParam[];
  configureWits: (host: string, port: number) => void;
}

const defaultWitsStatus: WitsStatus = {
  connected: false,
  address: ''
};

const WitsContext = createContext<WitsContextType>({
  witsData: null,
  witsStatus: defaultWitsStatus,
  drillingParams: [],
  configureWits: () => {}
});

export const useWitsContext = () => useContext(WitsContext);

export const WitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [witsData, setWitsData] = useState<WitsData | null>(null);
  const [witsStatus, setWitsStatus] = useState<WitsStatus>(defaultWitsStatus);
  const [drillingParams, setDrillingParams] = useState<DrillingParam[]>([]);

  useEffect(() => {
    // Listen for WITS data updates
    witsClient.onWitsData((data) => {
      setWitsData(data);
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
  }, []);

  const configureWits = (host: string, port: number) => {
    witsClient.configureWits({
      host,
      port
    });
  };

  return (
    <WitsContext.Provider value={{ witsData, witsStatus, drillingParams, configureWits }}>
      {children}
    </WitsContext.Provider>
  );
};
