import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SurveyTableProps {
  surveys: any[];
}

const SurveyTable: React.FC<SurveyTableProps> = ({ surveys }) => {
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
          <TableRow key={index}>
            <TableCell>{survey.md}</TableCell>
            <TableCell>{survey.inc}</TableCell>
            <TableCell>{survey.az}</TableCell>
            <TableCell>{survey.tvd}</TableCell>
            <TableCell>{survey.ns}</TableCell>
            <TableCell>{survey.ew}</TableCell>
            <TableCell>{survey.vs}</TableCell>
            <TableCell>{survey.dls}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SurveyTable;