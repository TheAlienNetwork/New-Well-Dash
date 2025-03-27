
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Survey } from '@shared/schema';

interface SurveyTableProps {
  surveys: Survey[];
  onAddSurvey?: () => void;
  onEditSurvey?: (survey: Survey) => void;
}

export const SurveyTable: React.FC<SurveyTableProps> = ({ surveys, onAddSurvey, onEditSurvey }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>MD</TableHead>
          <TableHead>Inc</TableHead>
          <TableHead>Az</TableHead>
          <TableHead>TVD</TableHead>
          <TableHead>NS</TableHead>
          <TableHead>EW</TableHead>
          <TableHead>VS</TableHead>
          <TableHead>DLS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {surveys.map((survey, index) => (
          <TableRow key={index} onClick={() => onEditSurvey?.(survey)} className="cursor-pointer">
            <TableCell>{survey.md?.toFixed(2)}</TableCell>
            <TableCell>{survey.inc?.toFixed(2)}</TableCell>
            <TableCell>{survey.azi?.toFixed(2)}</TableCell>
            <TableCell>{survey.tvd?.toFixed(2)}</TableCell>
            <TableCell>{survey.ns?.toFixed(2)}</TableCell>
            <TableCell>{survey.ew?.toFixed(2)}</TableCell>
            <TableCell>{survey.vsec?.toFixed(2)}</TableCell>
            <TableCell>{survey.dls?.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
