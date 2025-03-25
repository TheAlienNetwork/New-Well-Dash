import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, 
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

  const NavItem = ({ path, icon, label }: { path: string, icon: React.ReactNode, label: string }) => (
    <Link href={path}>
      <div className={`nav-link px-6 py-4 transition-all flex items-center cursor-pointer ${isActive(path) ? 'active text-cyan-400 font-medium border-b-2 border-cyan-400' : 'text-navy-200 hover:text-cyan-300'}`}>
        {icon}
        <span className="font-mono text-sm">{label}</span>
      </div>
    </Link>
  );

  return (
    <nav className="bg-navy-950 border-b border-cyan-500/20">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto custom-scrollbar">
          <NavItem 
            path="/" 
            icon={<BarChart3 className="h-5 w-5 mr-2" />} 
            label="MWD SURVEY" 
          />

          <NavItem 
            path="/wits-parameters" 
            icon={<Box className="h-5 w-5 mr-2" />} 
            label="WITS PARAMETERS" 
          />

          <NavItem 
            path="/directional-drilling" 
            icon={<Sliders className="h-5 w-5 mr-2" />} 
            label="DIRECTIONAL DRILLING" 
          />

          <NavItem 
            path="/email-automation" 
            icon={<Mail className="h-5 w-5 mr-2" />} 
            label="EMAIL AUTOMATION" 
          />

          <NavItem 
            path="/well-info" 
            icon={<User className="h-5 w-5 mr-2" />} 
            label="WELL INFO" 
          />

          <NavItem 
            path="/wits-mapping" 
            icon={<Settings className="h-5 w-5 mr-2" />} 
            label="WITS MAPPING" 
          />
        </div>
      </div>

      <style jsx={1}>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #061024;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #06b6d4;
            border-radius: 4px;
          }
          .nav-link.active {
            border-bottom: 2px solid #06b6d4;
            box-shadow: 0 2px 5px rgba(6, 182, 212, 0.5);
          }
          .pulse {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        `}
      </style>
    </nav>
  );
}