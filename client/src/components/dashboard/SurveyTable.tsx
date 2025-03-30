import React, { useState } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { DataTable } from '@/components/ui/data-table';
import { Survey } from '@shared/schema';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash, Plus, Upload, FileSpreadsheet, Activity, ArrowDown, LayoutGrid, Table2, Download } from 'lucide-react';
import { BarChart4 } from 'lucide-react';
import { SurveyFileImporter, GammaFileImporter } from '@/components/dashboard/FileImporters';

interface SurveyTableProps {
  onAddSurvey: () => void;
  onEditSurvey: (survey: Survey) => void;
}

export default function SurveyTable({ onAddSurvey, onEditSurvey }: SurveyTableProps) {
  const { surveys, deleteSurvey, loading } = useSurveyContext();

  const handleDeleteSurvey = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      await deleteSurvey(id);
    }
  };

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  const columns: ColumnDef<Survey>[] = [
    {
      accessorKey: 'index',
      header: 'Index',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Badge variant="outline" className="bg-gray-800/50 text-gray-300">
            {row.getValue('index')}
          </Badge>
        </div>
      )
    },
    {
      accessorKey: 'md',
      header: 'MD (ft)',
      cell: ({ row }) => {
        const value = row.getValue('md');
        return (
          <div className="font-mono text-sm text-white font-medium">
            {value ? Number(value).toFixed(2) : ''}
          </div>
        );
      }
    },
    {
      accessorKey: 'inc',
      header: 'Inc (°)',
      cell: ({ row }) => (
        <div className="font-mono text-sm value-blue">{Number(row.getValue('inc')).toFixed(2)}°</div>
      )
    },
    {
      accessorKey: 'azi',
      header: 'Azi (°)',
      cell: ({ row }) => (
        <div className="font-mono text-sm value-amber">{Number(row.getValue('azi')).toFixed(2)}°</div>
      )
    },
    {
      accessorKey: 'tvd',
      header: 'TVD (ft)',
      cell: ({ row }) => (
        <div className="font-mono text-sm value-green">{Number(row.getValue('tvd')).toFixed(2)}</div>
      )
    },
    {
      accessorKey: 'northSouth',
      header: 'N/S',
      cell: ({ row }) => {
        const value = Number(row.getValue('northSouth')).toFixed(2);
        const isNorth = row.original.isNorth;
        return (
          <div className="font-mono text-sm flex items-center">
            <span className={isNorth ? "text-blue-400" : "text-red-400"}>{value}</span>
            <Badge 
              variant="outline" 
              className={`ml-2 ${isNorth ? "border-blue-500/30 text-blue-400" : "border-red-500/30 text-red-400"}`}
            >
              {isNorth ? 'N' : 'S'}
            </Badge>
          </div>
        );
      }
    },
    {
      accessorKey: 'eastWest',
      header: 'E/W',
      cell: ({ row }) => {
        const value = Number(row.getValue('eastWest')).toFixed(2);
        const isEast = row.original.isEast;
        return (
          <div className="font-mono text-sm flex items-center">
            <span className={isEast ? "text-green-400" : "text-orange-400"}>{value}</span>
            <Badge 
              variant="outline" 
              className={`ml-2 ${isEast ? "border-green-500/30 text-green-400" : "border-orange-500/30 text-orange-400"}`}
            >
              {isEast ? 'E' : 'W'}
            </Badge>
          </div>
        );
      }
    },
    {
      accessorKey: 'vs',
      header: 'VS (ft)',
      cell: ({ row }) => (
        <div className="font-mono text-sm value-purple">{Number(row.getValue('vs')).toFixed(2)}</div>
      )
    },
    {
      accessorKey: 'dls',
      header: 'DLS (°/100ft)',
      cell: ({ row }) => {
        const value = Number(row.getValue('dls')).toFixed(2);
        const severity = Number(value) < 1.5 ? 'low' : Number(value) < 3 ? 'medium' : 'high';
        return (
          <div className="font-mono text-sm flex items-center gap-2">
            <span>{value}</span>
            <Badge className={
              severity === 'low' 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : severity === 'medium' 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
            }>
              {severity}
            </Badge>
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <button 
              className="glass-button p-1.5 text-blue-400 hover:text-blue-300"
              onClick={() => onEditSurvey(row.original)}
              title="Edit Survey"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button 
              className="glass-button p-1.5 text-red-400 hover:text-red-300"
              onClick={() => handleDeleteSurvey(row.original.id)}
              title="Delete Survey"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 flex justify-between items-center border-b border-gray-700/30">
        <h2 className="font-heading text-lg font-semibold flex items-center text-white">
          <BarChart4 className="h-5 w-5 mr-2 text-blue-400" />
          MWD Survey Data
        </h2>
        <div className="flex items-center space-x-3">
          <div className="flex p-0.5 glass-card mr-2">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-l-md flex items-center transition-all ${viewMode === 'table' ? 'bg-blue-900/40 text-blue-300' : 'text-gray-400 hover:text-gray-300'}`}
              title="Table View"
            >
              <Table2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-r-md flex items-center transition-all ${viewMode === 'grid' ? 'bg-blue-900/40 text-blue-300' : 'text-gray-400 hover:text-gray-300'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          
          <Button 
            onClick={onAddSurvey}
            className="glass-button-blue px-3 py-1.5 rounded text-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Survey
          </Button>
          <SurveyFileImporter />
          <GammaFileImporter />
          <Button 
            variant="outline"
            className="glass-button-outline px-3 py-1.5 rounded text-sm flex items-center"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
        </div>
      </div>
      
      {viewMode === 'table' ? (
        <div className="overflow-x-auto custom-scrollbar" style={{ maxHeight: 'calc(2.5rem * 11 + 3rem)' }}>
          <DataTable 
            columns={columns} 
            data={surveys} 
            className="premium-table"
            pageSize={10}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {surveys.map(survey => (
            <div key={survey.id} className="glass-card p-4 animate-slide-in">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="outline" className="bg-gray-800/50 text-gray-300">
                  #{survey.index}
                </Badge>
                <div className="flex space-x-1">
                  <button 
                    className="glass-button p-1 text-blue-400 hover:text-blue-300"
                    onClick={() => onEditSurvey(survey)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    className="glass-button p-1 text-red-400 hover:text-red-300"
                    onClick={() => handleDeleteSurvey(survey.id)}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="neumorph-card p-2">
                  <div className="text-xs text-gray-400">MD</div>
                  <div className="font-mono text-white">{Number(survey.md).toFixed(2)} ft</div>
                </div>
                <div className="neumorph-card p-2">
                  <div className="text-xs text-gray-400">TVD</div>
                  <div className="font-mono value-green">{Number(survey.tvd).toFixed(2)} ft</div>
                </div>
                <div className="neumorph-card p-2">
                  <div className="text-xs text-gray-400">Inc</div>
                  <div className="font-mono value-blue">{Number(survey.inc).toFixed(2)}°</div>
                </div>
                <div className="neumorph-card p-2">
                  <div className="text-xs text-gray-400">Azi</div>
                  <div className="font-mono value-amber">{Number(survey.azi).toFixed(2)}°</div>
                </div>
                
                <div className="neumorph-card p-2 col-span-2 flex justify-between">
                  <div>
                    <div className="text-xs text-gray-400">N/S</div>
                    <div className="font-mono flex items-center">
                      <span className={survey.isNorth ? "text-blue-400" : "text-red-400"}>
                        {Number(survey.northSouth).toFixed(2)}
                      </span>
                      <span className={`ml-1 ${survey.isNorth ? "text-blue-400" : "text-red-400"}`}>
                        {survey.isNorth ? 'N' : 'S'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">E/W</div>
                    <div className="font-mono flex items-center">
                      <span className={survey.isEast ? "text-green-400" : "text-orange-400"}>
                        {Number(survey.eastWest).toFixed(2)}
                      </span>
                      <span className={`ml-1 ${survey.isEast ? "text-green-400" : "text-orange-400"}`}>
                        {survey.isEast ? 'E' : 'W'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-400">VS</div>
                  <div className="font-mono value-purple">{Number(survey.vs).toFixed(2)} ft</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">DLS</div>
                  <div className="font-mono flex items-center">
                    {Number(survey.dls).toFixed(2)} °/100ft
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .premium-table {
          border: none !important;
        }
        
        .premium-table th {
          color: rgba(209, 213, 219, 0.8) !important;
          font-weight: 600 !important;
          letter-spacing: 0.05em !important;
          font-size: 0.7rem !important;
          padding-top: 1rem !important;
          padding-bottom: 1rem !important;
          background: rgba(15, 23, 42, 0.6) !important;
          backdrop-filter: blur(10px) !important;
          border-bottom: 1px solid rgba(75, 85, 99, 0.2) !important;
        }
        
        .premium-table td {
          padding: 0.75rem 1rem !important;
          border-bottom: 1px solid rgba(75, 85, 99, 0.1) !important;
        }
        
        .premium-table tr:nth-child(even) {
          background: rgba(30, 41, 59, 0.3) !important;
        }
        
        .premium-table tr:hover {
          background: rgba(59, 130, 246, 0.1) !important;
          backdrop-filter: blur(4px) !important;
        }
        
        .glass-button {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 0.375rem;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(100, 116, 139, 0.1);
          transition: all 0.2s ease;
        }
        
        .glass-button:hover {
          background: rgba(30, 41, 59, 0.5);
        }
        
        .glass-button-blue {
          background: rgba(37, 99, 235, 0.2);
          border-radius: 0.375rem;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
          color: rgb(147, 197, 253);
        }
        
        .glass-button-blue:hover {
          background: rgba(37, 99, 235, 0.3);
          border: 1px solid rgba(59, 130, 246, 0.4);
        }
        
        .glass-button-outline {
          background: transparent;
          border-radius: 0.375rem;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(100, 116, 139, 0.2);
          color: rgb(209, 213, 219);
          transition: all 0.2s ease;
        }
        
        .glass-button-outline:hover {
          background: rgba(30, 41, 59, 0.3);
          border: 1px solid rgba(100, 116, 139, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
