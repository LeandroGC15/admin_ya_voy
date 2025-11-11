'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import type { StageProgress } from '../interfaces/verifications';

interface OnboardingProgressBarProps {
  overallProgress: number;
  stages: {
    personalData: StageProgress;
    documents: StageProgress;
    vehicles: StageProgress;
    programaYavoy: StageProgress;
  };
}

const OnboardingProgressBar: React.FC<OnboardingProgressBarProps> = ({
  overallProgress,
  stages,
}) => {
  const getStageIcon = (completed: boolean, progress: number) => {
    if (completed) return '✅';
    if (progress > 0) return '⚠️';
    return '⏳';
  };

  const getStageColor = (completed: boolean, progress: number) => {
    if (completed) return 'bg-green-500';
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const stageLabels = {
    personalData: 'Datos Personales',
    documents: 'Documentos',
    vehicles: 'Vehículos',
    programaYavoy: 'Programa Yavoy',
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Progreso General */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Progreso General</h3>
            <span className="text-sm font-bold">{overallProgress}%</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Etapas Individuales */}
        <div className="space-y-3">
          {Object.entries(stages).map(([key, stage]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getStageIcon(stage.completed, stage.progress)}
                  </span>
                  <span className="text-sm font-medium">
                    {stageLabels[key as keyof typeof stageLabels]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {stage.completedSteps}/{stage.totalSteps} pasos
                  </span>
                  <span className="text-sm font-semibold">{stage.progress}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getStageColor(
                    stage.completed,
                    stage.progress
                  )}`}
                  style={{ width: `${stage.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default OnboardingProgressBar;


