
import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, 
  Box, 
  Sliders, 
  Mail, 
  User, 
  Settings,
  BrainCircuit
} from 'lucide-react';

export default function AppNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const NavItem = ({ path, icon, label }: { path: string, icon: React.ReactNode, label: string }) => (
    <Link href={path}>
      <div className={`nav-link px-6 py-4 transition-all flex items-center cursor-pointer backdrop-blur-md
        ${isActive(path) 
          ? 'active bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400 shadow-[0_4px_15px_-1px_rgba(34,211,238,0.3)]' 
          : 'text-slate-300 hover:bg-cyan-500/5 hover:text-cyan-300'}`}>
        <div className="flex items-center space-x-2">
          {React.cloneElement(icon as React.ReactElement, {
            className: `h-5 w-5 ${isActive(path) ? 'text-cyan-400' : 'text-slate-400'}`
          })}
          <span className="font-mono text-sm tracking-wide">{label}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <nav className="bg-navy-950/80 border-b border-cyan-500/20 backdrop-blur-lg shadow-lg">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto custom-scrollbar">
          <NavItem 
            path="/" 
            icon={<BarChart3 />} 
            label="MWD SURVEY" 
          />

          <NavItem 
            path="/wits-parameters" 
            icon={<Box />} 
            label="WITS PARAMETERS" 
          />

          <NavItem 
            path="/directional-drilling" 
            icon={<Sliders />} 
            label="DIRECTIONAL DRILLING" 
          />

          <NavItem 
            path="/email-automation" 
            icon={<Mail />} 
            label="EMAIL AUTOMATION" 
          />

          <NavItem 
            path="/well-info" 
            icon={<User />} 
            label="WELL INFO" 
          />

          <NavItem 
            path="/wits-mapping" 
            icon={<Settings />} 
            label="WITS MAPPING" 
          />
          
          <NavItem 
            path="/ai-optimization" 
            icon={<BrainCircuit />} 
            label="AI OPTIMIZATION" 
          />
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.5);
        }
        .nav-link.active {
          position: relative;
        }
        .nav-link.active::before {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #22d3ee, transparent);
        }
      `}</style>
    </nav>
  );
}
