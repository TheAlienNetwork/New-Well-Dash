import React, { useState } from 'react';
import SurveyTable from '@/components/dashboard/SurveyTable';
import CurveData from '@/components/dashboard/CurveData';
import GammaPlot from '@/components/dashboard/GammaPlot';
import AIAnalytics from '@/components/dashboard/AIAnalytics';
import SurveyModal from '@/components/dashboard/SurveyModal';
import { useSurveyContext } from '@/context/SurveyContext';
import { Survey } from '@shared/schema';
import { ArrowUpDown, ArrowLeft } from 'react-icons/md';
import { Switch, Input } from '@nextui-org/react'; // Assumed import, adjust as needed
import { Label } from '@/components/ui/Label'; // Assumed import, adjust as needed


export default function MwdSurvey() {
  const { 
    showSurveyModal, 
    setShowSurveyModal, 
    modalSurvey, 
    setModalSurvey 
  } = useSurveyContext();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const { curveData, updateCurveData } = useSurveyContext(); // Assuming curveData and updateCurveData are available in context

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
        
        <div>
          {/* Target Position */}
          <div className="card rounded-lg overflow-hidden mt-6">
          <div className="p-3 bg-indigo-900/30 flex justify-between items-center border-b border-indigo-500/20">
            <h2 className="font-heading text-lg font-semibold flex items-center text-indigo-100">
              <ArrowUpDown className="h-5 w-5 mr-2 text-indigo-400" />
              Target Position
            </h2>
          </div>
          <div className="p-4 glass-container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel rounded-md p-3">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-indigo-300 flex items-center">
                    <ArrowUpDown className="h-3 w-3 mr-1 text-indigo-400" />
                    VERTICAL OFFSET
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={curveData?.isAbove}
                      onCheckedChange={(checked) => {
                        if (curveData) {
                          updateCurveData({
                            ...curveData,
                            isAbove: checked,
                            aboveTarget: checked ? Math.abs(curveData.belowTarget || 0) : 0,
                            belowTarget: !checked ? Math.abs(curveData.aboveTarget || 0) : 0
                          });
                        }
                      }}
                    />
                    <span className="text-xs">{curveData?.isAbove ? 'Above' : 'Below'}</span>
                  </div>
                </div>
                <Input
                  type="number"
                  value={curveData?.isAbove ? curveData.aboveTarget : curveData?.belowTarget}
                  onChange={(e) => {
                    if (curveData) {
                      updateCurveData({
                        ...curveData,
                        aboveTarget: curveData.isAbove ? Number(e.target.value) : 0,
                        belowTarget: !curveData.isAbove ? Number(e.target.value) : 0
                      });
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <div className="glass-panel rounded-md p-3">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-indigo-300 flex items-center">
                    <ArrowLeft className="h-3 w-3 mr-1 text-indigo-400" />
                    HORIZONTAL OFFSET
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={curveData?.isRight}
                      onCheckedChange={(checked) => {
                        if (curveData) {
                          updateCurveData({
                            ...curveData,
                            isRight: checked,
                            leftTarget: !checked ? Math.abs(curveData.rightTarget || 0) : 0,
                            rightTarget: checked ? Math.abs(curveData.leftTarget || 0) : 0
                          });
                        }
                      }}
                    />
                    <span className="text-xs">{curveData?.isRight ? 'Right' : 'Left'}</span>
                  </div>
                </div>
                <Input
                  type="number"
                  value={curveData?.isRight ? curveData.rightTarget : curveData?.leftTarget}
                  onChange={(e) => {
                    if (curveData) {
                      updateCurveData({
                        ...curveData,
                        rightTarget: curveData.isRight ? Number(e.target.value) : 0,
                        leftTarget: !curveData.isRight ? Number(e.target.value) : 0
                      });
                    }
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SurveyModal
          open={showSurveyModal}
          onOpenChange={setShowSurveyModal}
          survey={modalSurvey}
          mode={modalMode}
        />
    </div>
  );
}