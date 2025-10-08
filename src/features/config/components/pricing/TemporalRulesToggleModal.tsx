'use client';

import React from 'react';
import { Modal } from '@/features/core/components';
import { useToggleTemporalRuleStatus } from '../../hooks/use-pricing';
import { TemporalPricingRule } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Power, PowerOff, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TemporalRulesToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: TemporalPricingRule | null;
  onSuccess?: () => void;
}

export function TemporalRulesToggleModal({ isOpen, onClose, rule, onSuccess }: TemporalRulesToggleModalProps) {
  const toggleRuleMutation = useToggleTemporalRuleStatus();

  const handleToggle = () => {
    if (!rule) return;

    toggleRuleMutation.mutate(
      { id: rule.id },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  if (!rule) return null;

  const isActive = rule.isActive;
  const newState = !isActive;

  const getRuleTypeLabel = (ruleType: string) => {
    switch (ruleType) {
      case 'time_range':
        return 'Rango de tiempo';
      case 'day_of_week':
        return 'Día de la semana';
      case 'date_specific':
        return 'Fecha específica';
      case 'seasonal':
        return 'Estacional';
      default:
        return ruleType;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isActive ? 'Desactivar' : 'Activar'} Regla Temporal`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={toggleRuleMutation.isPending}
          >
            {toggleRuleMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                {isActive ? 'Desactivando...' : 'Activando...'}
              </>
            ) : (
              <>
                {isActive ? <PowerOff className="h-4 w-4 mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                {isActive ? 'Desactivar' : 'Activar'}
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
            {isActive ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{rule.name}</h3>
            <p className="text-sm text-muted-foreground">
              Tipo: {getRuleTypeLabel(rule.ruleType)} • Estado actual:{' '}
              <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                {isActive ? 'Activa' : 'Inactiva'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">
                ¿Estás seguro de que quieres {isActive ? 'desactivar' : 'activar'} esta regla temporal?
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Al {isActive ? 'desactivar' : 'activar'} la regla &ldquo;{rule.name}&rdquo;, sucederá lo siguiente:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Los precios se {isActive ? 'dejarán de' : 'comenzarán a'} aplicar automáticamente</li>
                  <li>Los viajes en progreso no se verán afectados</li>
                  <li>El cambio tendrá efecto inmediato</li>
                  <li>Multiplicador: {rule.multiplier}x</li>
                  {rule.description && (
                    <li>Descripción: {rule.description}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">
                Nuevo estado: <span className={`font-bold ${newState ? 'text-green-600' : 'text-red-600'}`}>
                  {newState ? 'ACTIVA' : 'INACTIVA'}
                </span>
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {newState
                  ? `La regla aplicará automáticamente un multiplicador de ${rule.multiplier}x`
                  : 'La regla ya no aplicará cambios de precio automáticamente'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Mostrar información adicional de la regla */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Detalles de la Regla</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Tipo:</span>
              <span className="ml-2 text-gray-600">{getRuleTypeLabel(rule.ruleType)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Multiplicador:</span>
              <span className="ml-2 text-gray-600">{rule.multiplier}x</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Prioridad:</span>
              <span className="ml-2 text-gray-600">{rule.priority}</span>
            </div>
            {rule.startTime && (
              <div>
                <span className="font-medium text-gray-700">Horario:</span>
                <span className="ml-2 text-gray-600">
                  {rule.startTime} - {rule.endTime || 'Fin del día'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

