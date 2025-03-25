import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart, 
  Box, 
  Sliders, 
  Mail, 
  User, 
  Settings 
} from 'lucide-react';

export default function AppNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-neutral-surface border-b border-neutral-border">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto custom-scrollbar">
          <Link href="/">
            <a className={`nav-link px-6 py-4 transition-all flex items-center ${isActive('/') ? 'active text-primary font-medium border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>
              <BarChart className="h-5 w-5 mr-2" />
              MWD Survey
            </a>
          </Link>
          
          <Link href="/wits-parameters">
            <a className={`nav-link px-6 py-4 transition-all flex items-center ${isActive('/wits-parameters') ? 'active text-primary font-medium border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>
              <Box className="h-5 w-5 mr-2" />
              WITS Parameters
            </a>
          </Link>
          
          <Link href="/directional-drilling">
            <a className={`nav-link px-6 py-4 transition-all flex items-center ${isActive('/directional-drilling') ? 'active text-primary font-medium border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>
              <Sliders className="h-5 w-5 mr-2" />
              Directional Drilling
            </a>
          </Link>
          
          <Link href="/email-automation">
            <a className={`nav-link px-6 py-4 transition-all flex items-center ${isActive('/email-automation') ? 'active text-primary font-medium border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>
              <Mail className="h-5 w-5 mr-2" />
              Email Automation
            </a>
          </Link>
          
          <Link href="/well-info">
            <a className={`nav-link px-6 py-4 transition-all flex items-center ${isActive('/well-info') ? 'active text-primary font-medium border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>
              <User className="h-5 w-5 mr-2" />
              Well Info
            </a>
          </Link>
          
          <Link href="/wits-mapping">
            <a className={`nav-link px-6 py-4 transition-all flex items-center ${isActive('/wits-mapping') ? 'active text-primary font-medium border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}>
              <Settings className="h-5 w-5 mr-2" />
              WITS Mapping
            </a>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1E1E1E;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3498DB;
          border-radius: 4px;
        }
        .nav-link.active {
          border-bottom: 2px solid #3498DB;
          box-shadow: 0 2px 5px rgba(52, 152, 219, 0.5);
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
    </nav>
  );
}
