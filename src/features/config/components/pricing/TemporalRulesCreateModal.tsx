'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useCreateTemporalRule, useCountries, useStatesByCountry, useCitiesByState } from '../../hooks';
import { createTemporalPricingRuleSchema } from '../../schemas/pricing.schemas';
import type { CreateTemporalPricingRuleInput } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, MapPin, Users, AlertCircle } from 'lucide-react';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { prepareCreateTemporalRuleData } from './utils';

interface TemporalRulesCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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

const dayOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

export function TemporalRulesCreateModal({ isOpen, onClose, onSuccess }: TemporalRulesCreateModalProps) {
  const [selectedRuleTypes, setSelectedRuleTypes] = useState<string[]>([]);

  const form = useForm<CreateTemporalPricingRuleInput>({
    resolver: zodResolver(createTemporalPricingRuleSchema),
    defaultValues: {
      name: '',
      description: '',
      ruleType: 'time_range',
      multiplier: 1.5,
      startTime: '',
      endTime: '',
      daysOfWeek: [],
      specificDates: [],
      dateRanges: [],
      isActive: true,
      priority: 10,
      countryId: undefined,
      stateId: undefined,
      cityId: undefined,
      zoneId: undefined,
    },
  });

  const createTemporalRuleMutation = useCreateTemporalRule();

  // Geographic data for selects
  const { data: countries } = useCountries({ limit: 100, isActive: true });
  const { data: states } = useStatesByCountry(form.watch('countryId') || 0, true);
  const { data: cities } = useCitiesByState(form.watch('stateId') || 0, true);

  const watchedRuleType = form.watch('ruleType');
  const watchedCountryId = form.watch('countryId');
  const watchedStateId = form.watch('stateId');

  const handleRuleTypeToggle = (ruleType: string, checked: boolean) => {
    const newSelectedTypes = checked
      ? [...selectedRuleTypes, ruleType]
      : selectedRuleTypes.filter(type => type !== ruleType);

    setSelectedRuleTypes(newSelectedTypes);

    // Set a default ruleType for the form (first selected or time_range)
    const primaryRuleType = newSelectedTypes.length > 0 ? newSelectedTypes[0] : 'time_range';
    form.setValue('ruleType', primaryRuleType as any);

    // Reset conditional fields only if unchecking the last type
    if (!checked && newSelectedTypes.length === 0) {
      form.setValue('startTime', '');
      form.setValue('endTime', '');
      form.setValue('daysOfWeek', []);
      form.setValue('specificDates', []);
      form.setValue('dateRanges', []);
    }
  };

  const handleSubmit = (data: CreateTemporalPricingRuleInput) => {
    // Preparar datos usando la función utilitaria
    const createData = prepareCreateTemporalRuleData(data);

    createTemporalRuleMutation.mutate(createData, {
      onSuccess: () => {
        form.reset({
          name: '',
          description: '',
          ruleType: 'time_range',
          multiplier: 1.5,
          startTime: '',
          endTime: '',
          daysOfWeek: [],
          specificDates: [],
          dateRanges: [],
          isActive: true,
          priority: 10,
          countryId: undefined,
          stateId: undefined,
          cityId: undefined,
          zoneId: undefined,
        });
        setSelectedRuleTypes([]);
        onClose();
        invalidateQueries(['pricing']);
        onSuccess?.();
      },
    });
  };

  const selectedRuleTypeData = ruleTypeOptions.find(type => type.value === watchedRuleType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nueva Regla Temporal"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={createTemporalRuleMutation.isPending}
          >
            {createTemporalRuleMutation.isPending ? 'Creando...' : 'Crear Regla'}
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
              <Label htmlFor="name">Nombre *</Label>
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
              <Label htmlFor="multiplier">Multiplicador *</Label>
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
                defaultChecked={true}
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

        {/* Rule Type Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Condiciones de la Regla</h3>
          <p className="text-sm text-gray-600">
            Selecciona una o más condiciones que deben cumplirse para aplicar esta regla de pricing.
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
                    onCheckedChange={(checked) => handleRuleTypeToggle(type.value, checked as boolean)}
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

          {form.formState.errors.ruleType && (
            <p className="text-sm text-red-600">{form.formState.errors.ruleType.message}</p>
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
                    <Label htmlFor="startTime">Hora de Inicio *</Label>
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
                    <Label htmlFor="endTime">Hora de Fin *</Label>
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
                <Label>Días de la Semana *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {dayOptions.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      {...form.register('daysOfWeek')}
                      value={day.value}
                    />
                      <Label htmlFor={`day-${day.value}`} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
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
                  <Label htmlFor="specificDates">Fechas Específicas *</Label>
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
                <Label>Rangos de Fechas *</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="date"
                      placeholder="Fecha inicio"
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
                value={watchedCountryId?.toString() || ''}
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
                value={watchedStateId?.toString() || ''}
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
                value={form.watch('cityId')?.toString() || ''}
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
                {...form.register('zoneId', { valueAsNumber: true })}
                placeholder="ID de zona"
              />
              {form.formState.errors.zoneId && (
                <p className="text-sm text-red-600">{form.formState.errors.zoneId.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        {watchedRuleType && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Vista Previa</h3>
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {form.watch('multiplier')}x
                  </Badge>
                  <span className="font-medium">{form.watch('name') || 'Sin nombre'}</span>
                  <Badge className={
                    watchedRuleType === 'time_range' ? 'bg-blue-100 text-blue-800' :
                    watchedRuleType === 'day_of_week' ? 'bg-green-100 text-green-800' :
                    watchedRuleType === 'date_specific' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }>
                    {selectedRuleTypeData?.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </form>
    </Modal>
  );
}

export default TemporalRulesCreateModal;
