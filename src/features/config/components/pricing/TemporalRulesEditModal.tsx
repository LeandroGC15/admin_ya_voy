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
import { invalidateQueries } from '@/lib/api/react-query-client';

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

export function TemporalRulesEditModal({ ruleId, isOpen, onClose, onSuccess }: TemporalRulesEditModalProps) {
  const form = useForm<UpdateTemporalPricingRuleInput>({
    resolver: zodResolver(updateTemporalPricingRuleSchema),
  });

  const updateTemporalRuleMutation = useUpdateTemporalRule();

  // Fetch rule data
  const { data: ruleData, isLoading: isLoadingRule } = useTemporalRule(ruleId || 0);

  // Geographic data for selects
  const { data: countries } = useCountries({ limit: 100, isActive: true });
  const { data: states } = useStatesByCountry(form.watch('countryId') || 0, true);
  const { data: cities } = useCitiesByState(form.watch('stateId') || 0, true);

  // Populate form when rule data is loaded
  useEffect(() => {
    if (ruleData && isOpen) {
      form.reset({
        name: ruleData.name,
        description: ruleData.description ?? '',
        ruleType: ruleData.ruleType,
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
      });
    }
  }, [ruleData, isOpen, form]);

  const watchedRuleType = form.watch('ruleType');
  const watchedCountryId = form.watch('countryId');
  const watchedStateId = form.watch('stateId');

  const handleSubmit = (data: UpdateTemporalPricingRuleInput) => {
    if (!ruleId) return;

    updateTemporalRuleMutation.mutate(
      { id: ruleId, data },
      {
        onSuccess: () => {
          onClose();
          invalidateQueries(['pricing']);
          onSuccess?.();
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
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
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

        {/* Rule Type (read-only for edit) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tipo de Regla</h3>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Tipo actual: </span>
            <span className="text-sm text-gray-600">
              {watchedRuleType === 'time_range' && 'Rango Horario'}
              {watchedRuleType === 'day_of_week' && 'Día de la Semana'}
              {watchedRuleType === 'date_specific' && 'Fechas Específicas'}
              {watchedRuleType === 'seasonal' && 'Temporada'}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Nota: El tipo de regla no se puede cambiar después de crear la regla.
            </p>
          </div>
        </div>

        {/* Rule Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración de la Regla</h3>

          {/* Time Range Configuration */}
          {watchedRuleType === 'time_range' && (
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
          )}

          {/* Day of Week Configuration */}
          {watchedRuleType === 'day_of_week' && (
            <div className="space-y-4">
              <Label>Días de la Semana</Label>
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
              <Label htmlFor="specificDates">Fechas Específicas</Label>
              <Input
                id="specificDates"
                type="text"
                {...form.register('specificDates', {
                  setValueAs: (value: string) => value ? value.split(',').map((date: string) => date.trim()) : []
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
      </form>
    </Modal>
  );
}

export default TemporalRulesEditModal;
