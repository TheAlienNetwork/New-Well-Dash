import React, { useState } from 'react';
import SurveyTable from '@/components/dashboard/SurveyTable';
import CurveData from '@/components/dashboard/CurveData';
import GammaPlot from '@/components/dashboard/GammaPlot';
import AIAnalytics from '@/components/dashboard/AIAnalytics';
import SurveyModal from '@/components/dashboard/SurveyModal';
import { useSurveyContext } from '@/context/SurveyContext';
import { Survey } from '@shared/schema';

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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
      {/* Left column (Survey table) */}
      <div className="xl:col-span-8">
        {/* MWD Survey Table */}
        <SurveyTable
          onAddSurvey={handleAddSurvey}
          onEditSurvey={handleEditSurvey}
        />
      </div>

      {/* Right column (Gamma plot) */}
      <div className="xl:col-span-4">
        {/* Gamma Plot */}
        <GammaPlot />
      </div>

      {/* Full width Curve Data */}
      <div className="xl:col-span-12">
        <CurveData />
      </div>

        {/* AI Analytics */}
        <AIAnalytics />
      </div>

      {/* Survey Modal */}
      <SurveyModal
        open={showSurveyModal}
        onOpenChange={setShowSurveyModal}
        survey={modalSurvey}
        mode={modalMode}
      />
    </div>
  );
}
