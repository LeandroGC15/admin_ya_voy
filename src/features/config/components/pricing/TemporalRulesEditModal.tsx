'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useUpdateTemporalRule, useTemporalRule, useCountries, useStatesByCountry, useCitiesByState } from '../../hooks';
import { updateTemporalPricingRuleSchema } from '../../schemas/pricing.schemas';
import type { UpdateTemporalPricingRuleInput, TemporalPricingRule } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { prepareUpdateTemporalRuleData } from './utils';
import { toast } from 'sonner';
import { Clock, Calendar } from 'lucide-react';

const ruleTypeOptions = [
  {
    value: 'time_range',
    label: 'Rango Horario',
    description: 'Aplicar multiplicador en un rango de horas específico',
    icon: Clock,
    example: 'De 7:00 a 9:00 (hora pico matutina)'
  },
  {
    value: 'day_of_week',
    label: 'Día de la Semana',
    description: 'Aplicar multiplicador en días específicos de la semana',
    icon: Calendar,
    example: 'Viernes, sábados y domingos'
  },
  {
    value: 'date_specific',
    label: 'Fechas Específicas',
    description: 'Aplicar multiplicador en fechas concretas',
    icon: Calendar,
    example: 'Navidad, Año Nuevo, feriados especiales'
  },
  {
    value: 'seasonal',
    label: 'Temporada',
    description: 'Aplicar multiplicador durante un período prolongado',
    icon: Calendar,
    example: 'Verano, invierno, temporada turística'
  },
];

interface TemporalRulesEditModalProps {
  ruleId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const dayOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

// Helper function to validate ruleType
const validateRuleType = (ruleType: string): 'time_range' | 'day_of_week' | 'date_specific' | 'seasonal' => {
  const validTypes = ['time_range', 'day_of_week', 'date_specific', 'seasonal'] as const;
  return validTypes.includes(ruleType as any) ? ruleType as any : 'time_range';
};

export function TemporalRulesEditModal({ ruleId, isOpen, onClose, onSuccess }: TemporalRulesEditModalProps) {
  const [selectedRuleTypes, setSelectedRuleTypes] = React.useState<string[]>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const form = useForm<UpdateTemporalPricingRuleInput>({
    resolver: zodResolver(updateTemporalPricingRuleSchema),
  });

  const updateTemporalRuleMutation = useUpdateTemporalRule();

  // Fetch rule data
  const { data: ruleData, isLoading: isLoadingRule } = useTemporalRule(ruleId || 0);

  // Geographic data for selects
  const { data: countries } = useCountries({ limit: 100, isActive: true });

  // Watch form values for geographic queries (declared before use)
  const watchedCountryId = form.watch('countryId');
  const watchedStateId = form.watch('stateId');
  const watchedCityId = form.watch('cityId');

  const { data: states } = useStatesByCountry(watchedCountryId || 0, !!watchedCountryId);
  const { data: cities } = useCitiesByState(watchedStateId || 0, !!watchedStateId);

  // Populate form when rule data is loaded
  useEffect(() => {
    if (ruleData && isOpen) {
      // Determine which rule types are active based on the data
      const activeTypes: string[] = [];

      if (ruleData.startTime && ruleData.endTime) {
        activeTypes.push('time_range');
      }
      if (ruleData.daysOfWeek && ruleData.daysOfWeek.length > 0) {
        activeTypes.push('day_of_week');
      }
      if (ruleData.specificDates && ruleData.specificDates.length > 0) {
        activeTypes.push('date_specific');
      }
      if (ruleData.dateRanges && ruleData.dateRanges.length > 0) {
        activeTypes.push('seasonal');
      }

      // If no specific conditions are set, default to the ruleType
      if (activeTypes.length === 0) {
        activeTypes.push(ruleData.ruleType);
      }

      setSelectedRuleTypes(activeTypes);

      const formValues = {
        name: ruleData.name,
        description: ruleData.description ?? '',
        ruleType: validateRuleType(activeTypes.length > 0 ? activeTypes[0] : ruleData.ruleType),
        multiplier: ruleData.multiplier,
        startTime: ruleData.startTime ?? '',
        endTime: ruleData.endTime ?? '',
        daysOfWeek: ruleData.daysOfWeek ?? [],
        specificDates: ruleData.specificDates ?? [],
        dateRanges: ruleData.dateRanges ?? [],
        isActive: ruleData.isActive,
        priority: ruleData.priority,
        countryId: ruleData.countryId ?? undefined,
        stateId: ruleData.stateId ?? undefined,
        cityId: ruleData.cityId ?? undefined,
        zoneId: ruleData.zoneId ?? undefined,
      };

      form.reset(formValues);
      setIsDataLoaded(true);
    } else if (!isOpen) {
      // Reset form when modal closes
      setIsDataLoaded(false);
      setSelectedRuleTypes([]);
      form.reset();
    }
  }, [ruleData, isOpen]);

  // Additional effect to handle countries loading
  useEffect(() => {
    if (ruleData && countries && isOpen) {
      // Ensure countries are available for proper display
      setIsDataLoaded(true);
    }
  }, [ruleData, countries, isOpen]);

  const watchedRuleType = form.watch('ruleType');

  // Ensure geographic values are properly set when ruleData changes
  useEffect(() => {
    if (ruleData && isOpen) {
      // Force update of geographic form values
      form.setValue('countryId', ruleData.countryId ?? undefined);
      form.setValue('stateId', ruleData.stateId ?? undefined);
      form.setValue('cityId', ruleData.cityId ?? undefined);
      form.setValue('zoneId', ruleData.zoneId ?? undefined);
    }
  }, [ruleData, isOpen]);

  const handleSubmit = (data: UpdateTemporalPricingRuleInput) => {
    if (!ruleId) {
      console.error('No ruleId provided for update');
      return;
    }

    updateTemporalRuleMutation.mutate(
      { id: ruleId, data },
      {
        onSuccess: () => {
          onClose();
          invalidateQueries(['pricing']);
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(`Error al actualizar la regla: ${error?.message || 'Error desconocido'}`);
        },
      }
    );
  };

  if (isLoadingRule && ruleId) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Regla Temporal">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </Modal>
    );
  }


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Regla Temporal"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit((data) => {
              if (!ruleId) {
                toast.error('No hay ruleId');
                return;
              }

              // Preparar datos usando la función utilitaria
              const updateData = prepareUpdateTemporalRuleData(data, ruleData!.ruleType);

              updateTemporalRuleMutation.mutate(
                { id: ruleId, data: updateData },
                {
                  onSuccess: () => {
                    toast.success('¡Actualización exitosa!');
                    onClose();
                    invalidateQueries(['pricing']);
                    onSuccess?.();
                  },
                  onError: (error) => {
                    toast.error(`Error: ${error?.message || 'Error desconocido'}`);
                  },
                }
              );
            })}
            disabled={updateTemporalRuleMutation.isPending}
          >
            {updateTemporalRuleMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Información Básica</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Ej: Hora Pico Matutina, Fin de Semana"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="multiplier">Multiplicador</Label>
              <Input
                id="multiplier"
                type="number"
                step="0.1"
                min="0.1"
                max="10.0"
                {...form.register('multiplier', { valueAsNumber: true })}
                placeholder="1.5"
              />
              {form.formState.errors.multiplier && (
                <p className="text-sm text-red-600">{form.formState.errors.multiplier.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="100"
                {...form.register('priority', { valueAsNumber: true })}
                placeholder="1"
              />
              {form.formState.errors.priority && (
                <p className="text-sm text-red-600">{form.formState.errors.priority.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="isActive"
                {...form.register('isActive')}
              />
              <Label htmlFor="isActive">Activo</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Descripción de cuándo y por qué se aplica esta regla"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Rule Conditions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Condiciones de la Regla</h3>
          <p className="text-sm text-gray-600">
            Selecciona o deselecciona las condiciones para esta regla:
          </p>

          <div className="space-y-3">
            {ruleTypeOptions.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedRuleTypes.includes(type.value);
              return (
                <div key={type.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={`rule-type-${type.value}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const newSelectedTypes = checked
                        ? [...selectedRuleTypes, type.value]
                        : selectedRuleTypes.filter(t => t !== type.value);

                      setSelectedRuleTypes(newSelectedTypes);

                      // Update primary ruleType based on selection
                      const primaryRuleType = newSelectedTypes.length > 0 ? newSelectedTypes[0] : 'time_range';
                      form.setValue('ruleType', validateRuleType(primaryRuleType));

                      // Clear fields when deselecting
                      if (!checked) {
                        switch (type.value) {
                          case 'time_range':
                            form.setValue('startTime', '');
                            form.setValue('endTime', '');
                            break;
                          case 'day_of_week':
                            form.setValue('daysOfWeek', []);
                            break;
                          case 'date_specific':
                            form.setValue('specificDates', []);
                            break;
                          case 'seasonal':
                            form.setValue('dateRanges', []);
                            break;
                        }
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <Label htmlFor={`rule-type-${type.value}`} className="font-medium cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    <p className="text-xs text-gray-500 mt-1 italic">Ej: {type.example}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedRuleTypes.length === 0 && (
            <p className="text-sm text-red-600">Debes seleccionar al menos una condición</p>
          )}
        </div>

        {/* Rule Configuration */}
        {selectedRuleTypes.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Configuración de Condiciones</h3>

            {/* Time Range Configuration */}
            {selectedRuleTypes.includes('time_range') && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Configuración de Rango Horario
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Hora de Inicio</Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...form.register('startTime')}
                    />
                    {form.formState.errors.startTime && (
                      <p className="text-sm text-red-600">{form.formState.errors.startTime.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora de Fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      {...form.register('endTime')}
                    />
                    {form.formState.errors.endTime && (
                      <p className="text-sm text-red-600">{form.formState.errors.endTime.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Day of Week Configuration */}
            {selectedRuleTypes.includes('day_of_week') && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Configuración de Días de la Semana
                </h4>
                <Label>Días de la Semana</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {dayOptions.map((day) => {
                    const currentDays = form.watch('daysOfWeek') || [];
                    const isChecked = currentDays.includes(day.value);

                    return (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const newDays = checked
                              ? [...currentDays, day.value]
                              : currentDays.filter(d => d !== day.value);
                            form.setValue('daysOfWeek', newDays);
                          }}
                        />
                        <Label htmlFor={`day-${day.value}`} className="text-sm">
                          {day.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                {form.formState.errors.daysOfWeek && (
                  <p className="text-sm text-red-600">{form.formState.errors.daysOfWeek.message}</p>
                )}
              </div>
            )}

            {/* Date Specific Configuration */}
            {selectedRuleTypes.includes('date_specific') && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Configuración de Fechas Específicas
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="specificDates">Fechas Específicas</Label>
                  <Input
                    id="specificDates"
                    type="text"
                    {...form.register('specificDates', {
                      setValueAs: (value: any) => {
                        // Handle array values (from form initialization)
                        if (Array.isArray(value)) return value;

                        // Handle string values (from user input)
                        if (!value || typeof value !== 'string') return [];
                        return value.split(',')
                          .map((date: string) => date.trim())
                          .filter((date: string) => date.length > 0);
                      }
                    })}
                    placeholder="2024-12-25, 2025-01-01, 2025-05-01"
                  />
                  <p className="text-xs text-gray-500">
                    Separar fechas con comas (formato: YYYY-MM-DD)
                  </p>
                  {form.formState.errors.specificDates && (
                    <p className="text-sm text-red-600">{form.formState.errors.specificDates.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Seasonal Configuration */}
            {selectedRuleTypes.includes('seasonal') && (
              <div className="space-y-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  Configuración de Temporada
                </h4>
                <Label>Rangos de Fechas</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="date"
                      placeholder="Fecha inicio"
                      defaultValue={ruleData?.dateRanges?.[0]?.start || ''}
                      onChange={(e) => {
                        const currentRanges = form.getValues('dateRanges') || [];
                        if (currentRanges.length === 0) {
                          form.setValue('dateRanges', [{ start: e.target.value, end: '' }]);
                        } else {
                          form.setValue('dateRanges', currentRanges.map((range, index) =>
                            index === 0 ? { ...range, start: e.target.value } : range
                          ));
                        }
                      }}
                    />
                    <Input
                      type="date"
                      placeholder="Fecha fin"
                      defaultValue={ruleData?.dateRanges?.[0]?.end || ''}
                      onChange={(e) => {
                        const currentRanges = form.getValues('dateRanges') || [];
                        if (currentRanges.length === 0) {
                          form.setValue('dateRanges', [{ start: '', end: e.target.value }]);
                        } else {
                          form.setValue('dateRanges', currentRanges.map((range, index) =>
                            index === 0 ? { ...range, end: e.target.value } : range
                          ));
                        }
                      }}
                    />
                  </div>
                </div>
                {form.formState.errors.dateRanges && (
                  <p className="text-sm text-red-600">{form.formState.errors.dateRanges.message}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Geographic Scope */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alcance Geográfico</h3>
          <p className="text-sm text-gray-600">
            Define el alcance geográfico de esta regla. Si no se especifica, la regla aplicará globalmente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="countryId">País</Label>
              <Select
                value={form.watch('countryId')?.toString() || undefined}
                onValueChange={(value) => {
                  const countryId = value ? parseInt(value) : undefined;
                  form.setValue('countryId', countryId);
                  form.setValue('stateId', undefined);
                  form.setValue('cityId', undefined);
                  form.setValue('zoneId', undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Global" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.countryId && (
                <p className="text-sm text-red-600">{form.formState.errors.countryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stateId">Estado</Label>
              <Select
                value={form.watch('stateId')?.toString() || undefined}
                onValueChange={(value) => {
                  const stateId = value ? parseInt(value) : undefined;
                  form.setValue('stateId', stateId);
                  form.setValue('cityId', undefined);
                  form.setValue('zoneId', undefined);
                }}
                disabled={!watchedCountryId || !states?.states.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  {states?.states.map((state) => (
                    <SelectItem key={state.id} value={state.id.toString()}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.stateId && (
                <p className="text-sm text-red-600">{form.formState.errors.stateId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cityId">Ciudad</Label>
              <Select
                value={form.watch('cityId')?.toString() || undefined}
                onValueChange={(value) => {
                  const cityId = value ? parseInt(value) : undefined;
                  form.setValue('cityId', cityId);
                  form.setValue('zoneId', undefined);
                }}
                disabled={!watchedStateId || !cities?.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ciudades" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.cityId && (
                <p className="text-sm text-red-600">{form.formState.errors.cityId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoneId">Zona</Label>
              <Input
                id="zoneId"
                type="number"
                {...form.register('zoneId', {
                  setValueAs: (value: string) => {
                    // Convert to number only if value is not empty
                    return value === '' ? undefined : parseInt(value, 10);
                  }
                })}
                placeholder="ID de zona"
              />
              {form.formState.errors.zoneId && (
                <p className="text-sm text-red-600">{form.formState.errors.zoneId.message}</p>
              )}
            </div>
          </div>
        </div>

      </form>
    </Modal>
  );
}

export default TemporalRulesEditModal;
