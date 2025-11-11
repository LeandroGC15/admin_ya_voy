'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import type { OnboardingStatsResponse } from '../interfaces/verifications';

interface StatsCardsProps {
  stats: OnboardingStatsResponse | undefined;
  isLoading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: 'Pendiente',
      value: stats.pending,
      description: 'En espera de verificación',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '⏳',
    },
    {
      title: 'En Revisión',
      value: stats.pending, // Using pending as "en revisión" for now
      description: 'En proceso de revisión',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🔍',
    },
    {
      title: 'Aprobados',
      value: stats.verified,
      description: 'Conductores verificados',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '✅',
    },
    {
      title: 'Rechazados',
      value: stats.rejected,
      description: 'Conductores rechazados',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '❌',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={`p-6 border-2 ${card.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">{card.title}</p>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-xs mt-1 opacity-75">{card.description}</p>
            </div>
            <div className="text-4xl">{card.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;


