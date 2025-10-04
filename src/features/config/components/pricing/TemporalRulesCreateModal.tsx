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
  const [selectedRuleType, setSelectedRuleType] = useState<string>('');

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
      priority: 1,
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

  const watchedCountryId = form.watch('countryId');
  const watchedStateId = form.watch('stateId');
  const watchedRuleType = form.watch('ruleType');

  const handleRuleTypeSelect = (ruleType: string) => {
    setSelectedRuleType(ruleType);
    form.setValue('ruleType', ruleType as any);

    // Reset conditional fields when changing rule type
    form.setValue('startTime', '');
    form.setValue('endTime', '');
    form.setValue('daysOfWeek', []);
    form.setValue('specificDates', []);
    form.setValue('dateRanges', []);
  };

  const handleSubmit = (data: CreateTemporalPricingRuleInput) => {
    createTemporalRuleMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        setSelectedRuleType('');
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
                min="1.0"
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
          <h3 className="text-lg font-semibold">Tipo de Regla</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ruleTypeOptions.map((type) => {
              const Icon = type.icon;
              const isSelected = watchedRuleType === type.value;
              return (
                <Card
                  key={type.value}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleRuleTypeSelect(type.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-6 w-6 mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <h4 className="font-medium">{type.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        <p className="text-xs text-gray-500 mt-2 italic">Ej: {type.example}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {form.formState.errors.ruleType && (
            <p className="text-sm text-red-600">{form.formState.errors.ruleType.message}</p>
          )}
        </div>

        {/* Rule Configuration */}
        {watchedRuleType && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {selectedRuleTypeData?.icon && <selectedRuleTypeData.icon className="h-5 w-5" />}
              Configuración de {selectedRuleTypeData?.label}
            </h3>

            {/* Time Range Configuration */}
            {watchedRuleType === 'time_range' && (
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
            )}

            {/* Day of Week Configuration */}
            {watchedRuleType === 'day_of_week' && (
              <div className="space-y-4">
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
            {watchedRuleType === 'date_specific' && (
              <div className="space-y-2">
                <Label htmlFor="specificDates">Fechas Específicas *</Label>
                <Input
                  id="specificDates"
                  type="text"
                {...form.register('specificDates', {
                  setValueAs: (value: string) => {
                    if (!value) return [];
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
            )}

            {/* Seasonal Configuration */}
            {watchedRuleType === 'seasonal' && (
              <div className="space-y-4">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoneId">Zona</Label>
              <Input
                id="zoneId"
                type="number"
                {...form.register('zoneId', { valueAsNumber: true })}
                placeholder="ID de zona"
              />
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
