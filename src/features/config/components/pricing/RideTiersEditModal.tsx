'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useUpdateRideTier, useRideTier, useCountries, useStatesByCountry, useCitiesByState } from '../../hooks';
import { updateRideTierSchema } from '../../schemas/pricing.schemas';
import type { UpdateRideTierInput, RideTier } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface RideTiersEditModalProps {
  tierId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RideTiersEditModal({ tierId, isOpen, onClose, onSuccess }: RideTiersEditModalProps) {
  const form = useForm<UpdateRideTierInput>({
    resolver: zodResolver(updateRideTierSchema),
  });

  const updateRideTierMutation = useUpdateRideTier();

  // Fetch tier data
  const { data: tierData, isLoading: isLoadingTier } = useRideTier(tierId || 0);

  // Geographic data for selects
  const { data: countries } = useCountries({ limit: 100, isActive: true });
  const { data: states } = useStatesByCountry(form.watch('countryId') || 0, true);
  const { data: cities } = useCitiesByState(form.watch('stateId') || 0, true);

  // Populate form when tier data is loaded
  useEffect(() => {
    if (tierData && isOpen) {
      form.reset({
        name: tierData.name,
        description: tierData.description ?? '',
        baseFare: tierData.baseFare,
        perMinuteRate: tierData.perMinuteRate,
        perMileRate: tierData.perMileRate,
        minimumFare: tierData.minimumFare ?? undefined,
        maximumFare: tierData.maximumFare ?? undefined,
        bookingFee: tierData.bookingFee ?? undefined,
        tierMultiplier: tierData.tierMultiplier,
        surgeMultiplier: tierData.surgeMultiplier,
        demandMultiplier: tierData.demandMultiplier,
        luxuryMultiplier: tierData.luxuryMultiplier ?? undefined,
        comfortMultiplier: tierData.comfortMultiplier ?? undefined,
        minPassengers: tierData.minPassengers,
        maxPassengers: tierData.maxPassengers,
        isActive: tierData.isActive,
        priority: tierData.priority,
        countryId: tierData.countryId ?? undefined,
        stateId: tierData.stateId ?? undefined,
        cityId: tierData.cityId ?? undefined,
        serviceZoneId: tierData.serviceZoneId ?? undefined,
        features: tierData.features ?? [],
        restrictions: tierData.restrictions ?? [],
      });
    }
  }, [tierData, isOpen, form]);

  const watchedCountryId = form.watch('countryId');
  const watchedStateId = form.watch('stateId');

  const handleSubmit = (data: UpdateRideTierInput) => {
    if (!tierId) return;

    updateRideTierMutation.mutate(
      { id: tierId, data },
      {
        onSuccess: () => {
          onClose();
          invalidateQueries(['pricing']);
          onSuccess?.();
        },
      }
    );
  };

  const formatCurrencyInput = (value: number) => {
    return (value / 100).toFixed(2);
  };

  const parseCurrencyInput = (value: string) => {
    return Math.round(parseFloat(value) * 100);
  };

  if (isLoadingTier && tierId) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Nivel de Tarifa">
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
      title="Editar Nivel de Tarifa"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={updateRideTierMutation.isPending}
          >
            {updateRideTierMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
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
                placeholder="Ej: Uber X, Uber Black"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Descripción del nivel de tarifa"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              {...form.register('isActive')}
            />
            <Label htmlFor="isActive">Activo</Label>
          </div>
        </div>

        {/* Pricing Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración de Precios</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseFare">Tarifa Base (USD)</Label>
              <Input
                id="baseFare"
                type="number"
                step="0.01"
                min="0"
                {...form.register('baseFare', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : 0
                })}
                placeholder="2.50"
              />
              {form.formState.errors.baseFare && (
                <p className="text-sm text-red-600">{form.formState.errors.baseFare.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perMinuteRate">Por Minuto (USD)</Label>
              <Input
                id="perMinuteRate"
                type="number"
                step="0.01"
                min="0"
                {...form.register('perMinuteRate', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : 0
                })}
                placeholder="0.15"
              />
              {form.formState.errors.perMinuteRate && (
                <p className="text-sm text-red-600">{form.formState.errors.perMinuteRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perMileRate">Por Milla (USD)</Label>
              <Input
                id="perMileRate"
                type="number"
                step="0.01"
                min="0"
                {...form.register('perMileRate', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : 0
                })}
                placeholder="0.80"
              />
              {form.formState.errors.perMileRate && (
                <p className="text-sm text-red-600">{form.formState.errors.perMileRate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumFare">Tarifa Mínima (USD)</Label>
              <Input
                id="minimumFare"
                type="number"
                step="0.01"
                min="0"
                {...form.register('minimumFare', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : undefined
                })}
                placeholder="5.00"
              />
              {form.formState.errors.minimumFare && (
                <p className="text-sm text-red-600">{form.formState.errors.minimumFare.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximumFare">Tarifa Máxima (USD)</Label>
              <Input
                id="maximumFare"
                type="number"
                step="0.01"
                min="0"
                {...form.register('maximumFare', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : undefined
                })}
                placeholder="100.00"
              />
              {form.formState.errors.maximumFare && (
                <p className="text-sm text-red-600">{form.formState.errors.maximumFare.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingFee">Tarifa de Reserva (USD)</Label>
              <Input
                id="bookingFee"
                type="number"
                step="0.01"
                min="0"
                {...form.register('bookingFee', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : undefined
                })}
                placeholder="1.00"
              />
              {form.formState.errors.bookingFee && (
                <p className="text-sm text-red-600">{form.formState.errors.bookingFee.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Multipliers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Multiplicadores</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tierMultiplier">Multiplicador Base</Label>
              <Input
                id="tierMultiplier"
                type="number"
                step="0.1"
                min="0.5"
                max="5.0"
                {...form.register('tierMultiplier', { valueAsNumber: true })}
                placeholder="1.0"
              />
              {form.formState.errors.tierMultiplier && (
                <p className="text-sm text-red-600">{form.formState.errors.tierMultiplier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surgeMultiplier">Multiplicador de Demanda</Label>
              <Input
                id="surgeMultiplier"
                type="number"
                step="0.1"
                min="1.0"
                max="10.0"
                {...form.register('surgeMultiplier', { valueAsNumber: true })}
                placeholder="1.0"
              />
              {form.formState.errors.surgeMultiplier && (
                <p className="text-sm text-red-600">{form.formState.errors.surgeMultiplier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="demandMultiplier">Multiplicador de Pico</Label>
              <Input
                id="demandMultiplier"
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                {...form.register('demandMultiplier', { valueAsNumber: true })}
                placeholder="1.0"
              />
              {form.formState.errors.demandMultiplier && (
                <p className="text-sm text-red-600">{form.formState.errors.demandMultiplier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="luxuryMultiplier">Multiplicador de Lujo</Label>
              <Input
                id="luxuryMultiplier"
                type="number"
                step="0.1"
                min="1.0"
                max="3.0"
                {...form.register('luxuryMultiplier', { valueAsNumber: true })}
                placeholder="1.0"
              />
              {form.formState.errors.luxuryMultiplier && (
                <p className="text-sm text-red-600">{form.formState.errors.luxuryMultiplier.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Passengers and Geographic Scope */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración de Pasajeros y Alcance</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPassengers">Mínimo de Pasajeros</Label>
              <Input
                id="minPassengers"
                type="number"
                min="1"
                max="8"
                {...form.register('minPassengers', { valueAsNumber: true })}
                placeholder="1"
              />
              {form.formState.errors.minPassengers && (
                <p className="text-sm text-red-600">{form.formState.errors.minPassengers.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPassengers">Máximo de Pasajeros</Label>
              <Input
                id="maxPassengers"
                type="number"
                min="1"
                max="8"
                {...form.register('maxPassengers', { valueAsNumber: true })}
                placeholder="4"
              />
              {form.formState.errors.maxPassengers && (
                <p className="text-sm text-red-600">{form.formState.errors.maxPassengers.message}</p>
              )}
            </div>
          </div>

          {/* Geographic Scope */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="countryId">País</Label>
              <Select
                value={watchedCountryId?.toString() || ''}
                onValueChange={(value) => {
                  const countryId = value ? parseInt(value) : undefined;
                  form.setValue('countryId', countryId);
                  form.setValue('stateId', undefined);
                  form.setValue('cityId', undefined);
                  form.setValue('serviceZoneId', undefined);
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
                  form.setValue('serviceZoneId', undefined);
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
                  form.setValue('serviceZoneId', undefined);
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
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default RideTiersEditModal;
