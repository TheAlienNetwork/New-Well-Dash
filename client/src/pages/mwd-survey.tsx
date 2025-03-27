import React, { useState } from 'react';
import SurveyTable from '@/components/dashboard/SurveyTable';
import CurveData from '@/components/dashboard/CurveData';
import GammaPlot from '@/components/dashboard/GammaPlot';
import AIAnalytics from '@/components/dashboard/AIAnalytics';
import SurveyModal from '@/components/dashboard/SurveyModal';
import { useSurveyContext } from '@/context/SurveyContext';
import { Survey } from '@shared/schema';
import TargetPosition from '@/components/dashboard/TargetPosition'; // Added import

export default function MwdSurvey() {
  const { 
    showSurveyModal, 
    setShowSurveyModal, 
    modalSurvey, 
    setModalSurvey 
  } = useSurveyContext();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const handleAddSurvey = () => {
    setModalSurvey(null);
    setModalMode('add');
    setShowSurveyModal(true);
  };

  const handleEditSurvey = (survey: Survey) => {
    setModalSurvey(survey);
    setModalMode('edit');
    setShowSurveyModal(true);
  };

  // Assuming 'projections' data is available from context or props.  Needs to be added to component.
  const projections = {}; // Placeholder - needs actual data source

  return (
    <div className="flex flex-col gap-4">
      {/* Survey Table Section */}
      <div className="w-full">
        <SurveyTable
          onAddSurvey={handleAddSurvey}
          onEditSurvey={handleEditSurvey}
        />
      </div>

      {/* Data Display Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Target Position */}
        <TargetPosition projections={projections} /> {/* Added TargetPosition component */}

        {/* Curve Data Container */}
        <div className="xl:col-span-2">
          <CurveData />
        </div>

        {/* Gamma Plot Container */}
        <div className="xl:col-span-1">
          <GammaPlot />
        </div>
      </div>

        {/* AI Analytics */}
        <AIAnalytics />
        <SurveyModal
          open={showSurveyModal}
          onOpenChange={setShowSurveyModal}
          survey={modalSurvey}
          mode={modalMode}
        />
    </div>
  );
}