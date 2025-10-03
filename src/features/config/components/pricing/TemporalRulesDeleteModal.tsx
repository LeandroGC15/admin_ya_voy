'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useDeleteTemporalRule } from '../../hooks';
import { TemporalPricingRule } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Trash2, Clock, Percent } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface TemporalRulesDeleteModalProps {
  rule: TemporalPricingRule | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TemporalRulesDeleteModal({ rule, isOpen, onClose, onSuccess }: TemporalRulesDeleteModalProps) {
  const deleteTemporalRuleMutation = useDeleteTemporalRule();

  const handleDelete = () => {
    if (!rule) return;

    deleteTemporalRuleMutation.mutate(rule.id, {
      onSuccess: () => {
        onClose();
        invalidateQueries(['pricing']);
        onSuccess?.();
      },
    });
  };

  if (!rule) return null;

  const getRuleTypeLabel = (ruleType: string) => {
    const labels: Record<string, string> = {
      time_range: 'Rango Horario',
      day_of_week: 'Día de la Semana',
      date_specific: 'Fechas Específicas',
      seasonal: 'Temporada',
    };
    return labels[ruleType] || ruleType;
  };

  const formatMultiplier = (multiplier: number) => {
    const percentage = ((multiplier - 1) * 100);
    return percentage > 0 ? `+${percentage.toFixed(0)}%` : `${percentage.toFixed(0)}%`;
  };

  const formatTimeRange = () => {
    if (rule.ruleType === 'time_range' && rule.startTime && rule.endTime) {
      return `${rule.startTime} - ${rule.endTime}`;
    }
    return null;
  };

  const formatDaysOfWeek = () => {
    if (rule.ruleType === 'day_of_week' && rule.daysOfWeek) {
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return rule.daysOfWeek.map(day => dayNames[day]).join(', ');
    }
    return null;
  };

  const formatSpecificDates = () => {
    if (rule.ruleType === 'date_specific' && rule.specificDates) {
      if (rule.specificDates.length === 1) return rule.specificDates[0];
      return `${rule.specificDates[0]} ... (+${rule.specificDates.length - 1} más)`;
    }
    return null;
  };

  const getRuleConfiguration = () => {
    switch (rule.ruleType) {
      case 'time_range':
        return formatTimeRange();
      case 'day_of_week':
        return formatDaysOfWeek();
      case 'date_specific':
        return formatSpecificDates();
      case 'seasonal':
        return 'Rango de fechas definido';
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Regla Temporal"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTemporalRuleMutation.isPending}
          >
            {deleteTemporalRuleMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta acción no se puede deshacer. Eliminará permanentemente la regla temporal
            y puede afectar a los cálculos de precios existentes.
          </AlertDescription>
        </Alert>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Detalles de la regla a eliminar:
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Nombre:</span>
              <span className="font-semibold">{rule.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Tipo:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {getRuleTypeLabel(rule.ruleType)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Multiplicador:</span>
              <span className={`font-semibold flex items-center gap-1 ${
                rule.multiplier > 1 ? 'text-red-600' : rule.multiplier < 1 ? 'text-green-600' : 'text-gray-600'
              }`}>
                <Percent className="h-3 w-3" />
                {formatMultiplier(rule.multiplier)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Prioridad:</span>
              <span>{rule.priority}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Estado:</span>
              <span className={rule.isActive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {rule.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {getRuleConfiguration() && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Configuración:</span>
                <span className="text-sm text-gray-600 max-w-xs truncate">
                  {getRuleConfiguration()}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-medium">Alcance:</span>
              <span className="text-sm">
                {rule.countryId ? `País: ${rule.countryId}` :
                 rule.stateId ? `Estado: ${rule.stateId}` :
                 rule.cityId ? `Ciudad: ${rule.cityId}` :
                 rule.zoneId ? `Zona: ${rule.zoneId}` : 'Global'}
              </span>
            </div>
          </div>
        </div>

        {rule.description && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Descripción:</strong> {rule.description}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              ¿Está seguro de que desea eliminar esta regla temporal?
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Los viajes existentes no se verán afectados, pero los nuevos cálculos de precios
              ya no considerarán esta regla. Esta acción puede impactar significativamente
              los precios calculados en el futuro.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default TemporalRulesDeleteModal;
