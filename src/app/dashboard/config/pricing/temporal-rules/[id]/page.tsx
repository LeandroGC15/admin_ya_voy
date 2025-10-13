'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTemporalRule, useToggleTemporalRuleStatus, useCountries, useStatesByCountry, useCitiesByState } from '@/features/config/hooks';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { TemporalRulesEditModal } from '@/features/config/components/pricing';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Clock, Calendar, Percent, MapPin, Edit, ToggleLeft, ToggleRight } from 'lucide-react';

export default function TemporalRuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ruleId = params.id as string;

  // Estados para controlar los modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Convertir string a number para el hook
  const ruleIdNumber = parseInt(ruleId, 10);

  const { data: ruleData, isLoading, error } = useTemporalRule(ruleIdNumber);
  const toggleRuleMutation = useToggleTemporalRuleStatus();

  // Geographic data for resolving names
  const { data: countriesData } = useCountries({ limit: 100, isActive: true });
  const { data: statesData } = useStatesByCountry(ruleData?.countryId || 0, !!ruleData?.countryId);
  const { data: citiesData } = useCitiesByState(ruleData?.stateId || 0, !!ruleData?.stateId);

  const handleBack = () => {
    router.push('/dashboard/config/pricing');
  };

  const handleToggleActive = () => {
    if (!ruleData) return;

    toggleRuleMutation.mutate(
      { id: ruleIdNumber },
      {
        onSuccess: () => {
          // El hook ya invalida las queries, pero podemos agregar lógica adicional aquí si es necesario
        },
        onError: (error: any) => {
          toast.error(`Error al actualizar el estado de la regla: ${error.message || 'Error desconocido'}`);
        }
      }
    );
  };

  const formatMultiplier = (multiplier: number) => {
    const percentage = ((multiplier - 1) * 100);
    return percentage > 0 ? `+${percentage.toFixed(0)}%` : `${percentage.toFixed(0)}%`;
  };

  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    }
    return 'Sin rango definido';
  };

  const formatDaysOfWeek = (days?: number[]) => {
    if (!days || days.length === 0) return 'Sin días definidos';

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days.map(day => dayNames[day]).join(', ');
  };

  const formatSpecificDates = (dates?: string[]) => {
    if (!dates || dates.length === 0) return 'Sin fechas definidas';
    if (dates.length === 1) return dates[0];
    return `${dates[0]} ... (+${dates.length - 1} más)`;
  };

  const formatDateRanges = (ranges?: { start: string; end: string }[]) => {
    if (!ranges || ranges.length === 0) return 'Sin rangos definidos';
    if (ranges.length === 1) {
      const range = ranges[0];
      return `${range.start} - ${range.end}`;
    }
    return `${ranges.length} rangos de fechas definidos`;
  };

  // Helper functions to resolve geographic names
  const getCountryName = (countryId: number) => {
    return countriesData?.countries.find(c => c.id === countryId)?.name || `País ${countryId}`;
  };

  const getStateName = (stateId: number) => {
    return statesData?.states.find(s => s.id === stateId)?.name || `Estado ${stateId}`;
  };

  const getCityName = (cityId: number) => {
    return citiesData?.find(c => c.id === cityId)?.name || `Ciudad ${cityId}`;
  };

  const formatGeographicScope = (rule: any) => {
    const parts = [];
    if (rule.countryId) parts.push(`País: ${getCountryName(rule.countryId)}`);
    if (rule.stateId) parts.push(`Estado: ${getStateName(rule.stateId)}`);
    if (rule.cityId) parts.push(`Ciudad: ${getCityName(rule.cityId)}`);
    if (rule.zoneId) parts.push(`Zona: ${rule.zoneId}`);
    return parts.length > 0 ? parts.join(', ') : 'Global';
  };

  // Determine active condition types dynamically based on actual data
  const getActiveConditionTypes = (rule: any) => {
    const activeTypes = [];
    if (rule.startTime && rule.endTime) {
      activeTypes.push('time_range');
    }
    if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
      activeTypes.push('day_of_week');
    }
    if (rule.specificDates && rule.specificDates.length > 0) {
      activeTypes.push('date_specific');
    }
    if (rule.dateRanges && rule.dateRanges.length > 0) {
      activeTypes.push('seasonal');
    }
    return activeTypes;
  };

  const activeConditionTypes = ruleData ? getActiveConditionTypes(ruleData) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando detalles de la regla temporal...</span>
        </div>
      </div>
    );
  }

  if (error || !ruleData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <h3 className="text-lg font-semibold mb-2">Error al cargar regla temporal</h3>
              <p>No se pudo cargar la información de la regla temporal. Puede que no exista o haya ocurrido un error.</p>
              {error && <p className="text-sm text-gray-600 mt-2">Error: {error.message}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Reglas Temporales
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-8 w-8" />
              Detalles de Regla Temporal
            </h1>
            <p className="text-muted-foreground">
              Información completa de {ruleData.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant={ruleData.isActive ? "destructive" : "default"}
            onClick={handleToggleActive}
            disabled={toggleRuleMutation.isPending}
          >
            {toggleRuleMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : ruleData.isActive ? (
              <>
                <ToggleRight className="h-4 w-4 mr-2" />
                Desactivar
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Activar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <p className="text-sm font-medium">{ruleData.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Regla</label>
              <Badge className={
                ruleData.ruleType === 'time_range' ? 'bg-blue-100 text-blue-800' :
                ruleData.ruleType === 'day_of_week' ? 'bg-green-100 text-green-800' :
                ruleData.ruleType === 'date_specific' ? 'bg-purple-100 text-purple-800' :
                'bg-orange-100 text-orange-800'
              }>
                {ruleData.ruleType === 'time_range' ? 'Rango Horario' :
                 ruleData.ruleType === 'day_of_week' ? 'Día de la Semana' :
                 ruleData.ruleType === 'date_specific' ? 'Fecha Específica' :
                 'Temporada'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={ruleData.isActive ? "default" : "secondary"}>
                  {ruleData.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
              <Badge className={
                ruleData.priority <= 3 ? 'bg-red-100 text-red-800' :
                ruleData.priority <= 6 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {ruleData.priority}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID</label>
              <p className="text-sm font-mono font-medium">{ruleData.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Alcance Geográfico</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <Badge variant="outline">
                  {formatGeographicScope(ruleData)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Creado</label>
              <p className="text-sm font-medium">
                {new Date(ruleData.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última actualización</label>
              <p className="text-sm font-medium">
                {new Date(ruleData.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {ruleData.description && (
              <div className="md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                <p className="text-sm font-medium mt-1 p-3 bg-gray-50 rounded-md">{ruleData.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rule Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Configuración de Multiplicador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Multiplicador</label>
              <p className="text-lg font-bold text-blue-600">{formatMultiplier(ruleData.multiplier)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Factor aplicado a los precios base
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valor Numérico</label>
              <p className="text-lg font-bold text-gray-900">{ruleData.multiplier}x</p>
              <p className="text-xs text-gray-500 mt-1">
                Multiplicador directo
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Prioridad de Aplicación</label>
              <Badge variant="secondary" className="mt-1">
                #{ruleData.priority}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                Orden de aplicación de reglas
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">Alcance Geográfico</label>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div className="flex flex-col gap-1">
                {(() => {
                  const scopeParts = [];
                  if (ruleData.countryId) scopeParts.push(`País: ${getCountryName(ruleData.countryId)}`);
                  if (ruleData.stateId) scopeParts.push(`Estado: ${getStateName(ruleData.stateId)}`);
                  if (ruleData.cityId) scopeParts.push(`Ciudad: ${getCityName(ruleData.cityId)}`);
                  if (ruleData.zoneId) scopeParts.push(`Zona: ${ruleData.zoneId}`);

                  return scopeParts.length > 0 ? (
                    scopeParts.map((part, index) => (
                      <Badge key={index} variant="outline" className="w-fit">
                        {part}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="w-fit">
                      Global
                    </Badge>
                  );
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rule Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Condiciones de Aplicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {activeConditionTypes.length > 1 ? 'Tipos de Condición' : 'Tipo de Condición'}
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeConditionTypes.length > 0 ? (
                activeConditionTypes.map((type) => (
                  <Badge key={type} className={
                    type === 'time_range' ? 'bg-blue-100 text-blue-800' :
                    type === 'day_of_week' ? 'bg-green-100 text-green-800' :
                    type === 'date_specific' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }>
                    {type === 'time_range' ? 'Rango Horario' :
                     type === 'day_of_week' ? 'Día de la Semana' :
                     type === 'date_specific' ? 'Fecha Específica' :
                     'Temporada'}
                  </Badge>
                ))
              ) : (
                <Badge className="bg-gray-100 text-gray-800">
                  Sin condiciones específicas
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeConditionTypes.includes('time_range') && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Rango Horario
                </label>
                <p className="text-lg font-medium mt-1">
                  {formatTimeRange(ruleData.startTime ?? undefined, ruleData.endTime ?? undefined)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  La regla se aplica dentro de este rango de tiempo
                </p>
              </div>
            )}

            {activeConditionTypes.includes('day_of_week') && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Días de la Semana
                </label>
                <p className="text-lg font-medium mt-1">
                  {formatDaysOfWeek(ruleData.daysOfWeek ?? undefined)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  La regla se aplica en estos días específicos
                </p>
              </div>
            )}

            {activeConditionTypes.includes('date_specific') && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fechas Específicas
                </label>
                <p className="text-lg font-medium mt-1">
                  {formatSpecificDates(ruleData.specificDates ?? undefined)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  La regla se aplica en estas fechas concretas
                </p>
              </div>
            )}

            {activeConditionTypes.includes('seasonal') && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Temporada
                </label>
                <p className="text-lg font-medium mt-1">
                  {formatDateRanges(ruleData.dateRanges ?? undefined)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  La regla se aplica durante estos períodos
                </p>
              </div>
            )}
          </div>

          {activeConditionTypes.includes('seasonal') && ruleData.dateRanges && ruleData.dateRanges.length > 0 && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="text-sm font-medium text-orange-800 mb-2">Detalle de Rangos de Temporada</h4>
              <div className="space-y-2">
                {ruleData.dateRanges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-orange-700">
                    <Calendar className="h-4 w-4" />
                    <span>Rango {index + 1}: {range.start} - {range.end}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {ruleData && (
        <TemporalRulesEditModal
          ruleId={ruleIdNumber}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            // El modal ya invalida las queries, pero podemos agregar lógica adicional aquí si es necesario
          }}
        />
      )}
    </div>
  );
}
