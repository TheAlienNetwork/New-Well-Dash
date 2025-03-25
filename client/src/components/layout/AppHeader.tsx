import React from 'react';
import { useWellContext } from '@/context/WellContext';
import { useWitsContext } from '@/context/WitsContext';
import { Settings } from 'lucide-react';

export default function AppHeader() {
  const { wellInfo } = useWellContext();
  const { witsStatus } = useWitsContext();

  return (
    <header className="bg-primary-dark p-4 text-white shadow-md">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-heading font-bold flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 mr-2 text-primary" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-MWD Dashboard
          </h1>
          <div className="hidden md:flex border-l border-gray-600 pl-4 items-center">
            <div className="mr-6">
              <span className="text-xs text-gray-400">Well Name</span>
              <h2 className="font-heading text-lg">{wellInfo?.wellName || 'Loading...'}</h2>
            </div>
            <div>
              <span className="text-xs text-gray-400">Rig Name</span>
              <h2 className="font-heading text-lg">{wellInfo?.rigName || 'Loading...'}</h2>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-neutral-surface rounded-md px-3 py-1 flex items-center">
            <div className="flex items-center mr-3">
              <div className={`h-2 w-2 rounded-full ${witsStatus.connected ? 'bg-accent-green' : 'bg-accent-red'} pulse mr-2`}></div>
              <span className="text-xs">
                {witsStatus.connected ? 'WITS Connected' : 'WITS Disconnected'}
              </span>
            </div>
            <div className="text-xs text-gray-400 hidden md:block">
              {witsStatus.address || 'Not connected'}
            </div>
          </div>
          <button className="bg-primary p-2 rounded-full hover:shadow-glow transition-shadow">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
