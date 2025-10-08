'use client';

import React from 'react';
import { DataTable } from '@/features/core/components';
import { TemporalPricingRule, TemporalPricingRulesListResponse } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, AlertTriangle, CheckCircle, MapPin, Percent } from 'lucide-react';

interface TemporalRulesTableProps {
  data: TemporalPricingRulesListResponse | undefined;
  loading: boolean;
  onRuleSelect?: (rule: TemporalPricingRule) => void;
  onRuleEdit?: (rule: TemporalPricingRule) => void;
  onRuleDelete?: (rule: TemporalPricingRule) => void;
  onRuleToggle?: (rule: TemporalPricingRule) => void;
}

export function TemporalRulesTable({
  data,
  loading,
  onRuleSelect,
  onRuleEdit,
  onRuleDelete,
  onRuleToggle,
}: TemporalRulesTableProps) {
  const formatMultiplier = (multiplier: number) => {
    const percentage = ((multiplier - 1) * 100);
    return percentage > 0 ? `+${percentage.toFixed(0)}%` : `${percentage.toFixed(0)}%`;
  };

  const getRuleTypeLabel = (ruleType: string) => {
    const labels: Record<string, string> = {
      time_range: 'Rango Horario',
      day_of_week: 'Día de la Semana',
      date_specific: 'Fecha Específica',
      seasonal: 'Temporada',
    };
    return labels[ruleType] || ruleType;
  };

  const getRuleTypeColor = (ruleType: string) => {
    switch (ruleType) {
      case 'time_range':
        return 'bg-blue-100 text-blue-800';
      case 'day_of_week':
        return 'bg-green-100 text-green-800';
      case 'date_specific':
        return 'bg-purple-100 text-purple-800';
      case 'seasonal':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    }
    return 'Sin rango definido';
  };

  const formatDaysOfWeek = (days?: number[]) => {
    if (!days || days.length === 0) return 'Sin días definidos';

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days.map(day => dayNames[day]).join(', ');
  };

  const formatSpecificDates = (dates?: string[]) => {
    if (!dates || dates.length === 0) return 'Sin fechas definidas';
    if (dates.length === 1) return dates[0];
    return `${dates[0]} ... (+${dates.length - 1} más)`;
  };

  const columns = [
    {
      key: 'id' as keyof TemporalPricingRule,
      header: 'ID',
      render: (value: number) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'name' as keyof TemporalPricingRule,
      header: 'Nombre',
      render: (value: string, row: TemporalPricingRule) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
            {row.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {row.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'ruleType' as keyof TemporalPricingRule,
      header: 'Tipo',
      render: (value: string) => (
        <Badge className={getRuleTypeColor(value)}>
          {getRuleTypeLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'multiplier' as keyof TemporalPricingRule,
      header: 'Multiplicador',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Percent className="h-3 w-3 text-gray-400" />
          <span className={`font-medium ${
            value > 1 ? 'text-red-600' : value < 1 ? 'text-green-600' : 'text-gray-600'
          }`}>
            {formatMultiplier(value)}
          </span>
        </div>
      ),
    },
    {
      key: 'startTime' as keyof TemporalPricingRule,
      header: 'Configuración',
      render: (value: string | undefined, row: TemporalPricingRule) => (
        <div className="text-xs text-gray-600 max-w-xs">
          {row.ruleType === 'time_range' && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeRange(value ?? undefined, row.endTime ?? undefined)}
            </div>
          )}
          {row.ruleType === 'day_of_week' && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDaysOfWeek(row.daysOfWeek ?? undefined)}
            </div>
          )}
          {row.ruleType === 'date_specific' && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatSpecificDates(row.specificDates ?? undefined)}
            </div>
          )}
          {row.ruleType === 'seasonal' && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Rango de fechas
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'priority' as keyof TemporalPricingRule,
      header: 'Prioridad',
      render: (value: number) => (
        <Badge variant="outline">
          {value}
        </Badge>
      ),
    },
    {
      key: 'isActive' as keyof TemporalPricingRule,
      header: 'Estado',
      render: (value: boolean) => (
        <Badge variant={value ? "secondary" : "destructive"}>
          {value ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Activo
            </>
          ) : (
            <>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Inactivo
            </>
          )}
        </Badge>
      ),
    },
    {
      key: 'countryId' as keyof TemporalPricingRule,
      header: 'Alcance',
      render: (value: number | undefined, row: TemporalPricingRule) => (
        <div className="text-xs text-gray-500">
          {row.countryId || row.stateId || row.cityId || row.zoneId ? (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>
                {[
                  row.countryId && `País: ${row.countryId}`,
                  row.stateId && `Estado: ${row.stateId}`,
                  row.cityId && `Ciudad: ${row.cityId}`,
                  row.zoneId && `Zona: ${row.zoneId}`
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          ) : (
            <span>Global</span>
          )}
        </div>
      ),
    },
  ];

  const renderActions = (rule: TemporalPricingRule) => (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => onRuleSelect?.(rule)}
        className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white"
      >
        Gestionar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRuleEdit?.(rule)}
        className="h-8 px-3"
      >
        Editar
      </Button>
      <Button
        variant={rule.isActive ? "outline" : "default"}
        size="sm"
        onClick={() => onRuleToggle?.(rule)}
        className={`h-8 px-3 ${
          rule.isActive
            ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {rule.isActive ? 'Desactivar' : 'Activar'}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onRuleDelete?.(rule)}
        className="h-8 px-3"
      >
        Eliminar
      </Button>
    </div>
  );

  const pagination = data ? {
    currentPage: data.page,
    totalPages: data.totalPages,
    totalItems: data.total,
  } : undefined;

  return (
    <DataTable
      data={data?.rules || []}
      columns={columns}
      loading={loading}
      pagination={pagination ? {
        ...pagination,
        onPageChange: (page) => {
          // This will be handled by the parent component
          console.log('Page change:', page);
        },
      } : undefined}
      actions={renderActions}
      emptyMessage="No se encontraron reglas temporales"
    />
  );
}

export default TemporalRulesTable;
