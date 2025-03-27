import React, { useState } from 'react';
import { useSurveyContext } from '@/context/SurveyContext';
import { DataTable } from '@/components/ui/data-table';
import { Survey } from '@shared/schema';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, Plus } from 'lucide-react';
import { 
  BarChart4 
} from 'lucide-react';

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

  const columns: ColumnDef<Survey>[] = [
    {
      accessorKey: 'index',
      header: 'Index',
      cell: ({ row }) => <div>{row.getValue('index')}</div>
    },
    {
      accessorKey: 'md',
      header: 'MD (ft)',
      cell: ({ row }) => {
        const value = row.getValue('md');
        return <div className="font-mono">{value ? Number(value).toFixed(2) : ''}</div>
      }
    },
    {
      accessorKey: 'inc',
      header: 'Inc (°)',
      cell: ({ row }) => <div className="font-mono">{Number(row.getValue('inc')).toFixed(2)}</div>
    },
    {
      accessorKey: 'azi',
      header: 'Azi (°)',
      cell: ({ row }) => <div className="font-mono">{Number(row.getValue('azi')).toFixed(2)}</div>
    },
    {
      accessorKey: 'tvd',
      header: 'TVD (ft)',
      cell: ({ row }) => <div className="font-mono">{Number(row.getValue('tvd')).toFixed(2)}</div>
    },
    {
      accessorKey: 'northSouth',
      header: 'N/S',
      cell: ({ row }) => {
        const value = Number(row.getValue('northSouth')).toFixed(2);
        const isNorth = row.original.isNorth;
        return <div className="font-mono">{value} {isNorth ? 'N' : 'S'}</div>
      }
    },
    {
      accessorKey: 'eastWest',
      header: 'E/W',
      cell: ({ row }) => {
        const value = Number(row.getValue('eastWest')).toFixed(2);
        const isEast = row.original.isEast;
        return <div className="font-mono">{value} {isEast ? 'E' : 'W'}</div>
      }
    },
    {
      accessorKey: 'vs',
      header: 'VS (ft)',
      cell: ({ row }) => <div className="font-mono">{Number(row.getValue('vs')).toFixed(2)}</div>
    },
    {
      accessorKey: 'dls',
      header: 'DLS (°/100ft)',
      cell: ({ row }) => <div className="font-mono">{Number(row.getValue('dls')).toFixed(2)}</div>
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <button 
              className="text-primary hover:text-white transition-colors"
              onClick={() => onEditSurvey(row.original)}
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button 
              className="text-accent-red hover:text-white transition-colors"
              onClick={() => handleDeleteSurvey(row.original.id)}
            >
              <Trash className="h-5 w-5" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="bg-neutral-surface rounded-lg overflow-hidden futuristic-border">
      <div className="p-4 bg-primary-dark flex justify-between items-center">
        <h2 className="font-heading text-lg font-semibold flex items-center">
          <BarChart4 className="h-5 w-5 mr-2" />
          MWD Survey Data
        </h2>
        <div className="flex space-x-2">
          <Button 
            onClick={onAddSurvey}
            className="bg-primary hover:bg-primary-dark transition-colors px-3 py-1 rounded text-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Survey
          </Button>
          <Button 
            variant="outline"
            className="bg-neutral-surface hover:bg-neutral-border transition-colors px-3 py-1 rounded text-sm"
          >
            Export
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <DataTable 
          columns={columns} 
          data={surveys} 
        />
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
      `}</style>
    </div>
  );
}
