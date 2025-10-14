'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useUpdateRideTier, useRideTier, useVehicleTypes } from '../../hooks';
import { updateRideTierSchema } from '../../schemas/pricing.schemas';
import type { UpdateRideTierInput, RideTier } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { PriceExamples } from './PriceExamples';

interface RideTiersEditModalProps {
  tierId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RideTiersEditModal({ tierId, isOpen, onClose, onSuccess }: RideTiersEditModalProps) {
  const form = useForm<UpdateRideTierInput>({
    resolver: zodResolver(updateRideTierSchema),
    defaultValues: {
      name: '',
      baseFare: 200, // 2.00 USD in cents (within limits)
      minimumFare: 150, // 1.50 USD in cents (within limits)
      perMinuteRate: 10, // 0.10 USD in cents (within limits)
      perKmRate: 50, // 0.50 USD in cents (within limits)
      imageUrl: '', // Empty string instead of undefined for URL validation
      tierMultiplier: 1.0,
      surgeMultiplier: 1.0,
      demandMultiplier: 1.0,
      luxuryMultiplier: 1.0,
      comfortMultiplier: 1.0,
      minPassengers: 1,
      maxPassengers: 4,
      isActive: true,
      priority: 5,
      vehicleTypeIds: [],
    },
  });

  const updateRideTierMutation = useUpdateRideTier();

  // Fetch tier data
  const { data: tierData, isLoading: isLoadingTier } = useRideTier(tierId || 0);

  // Vehicle types data
  const { data: vehicleTypesData } = useVehicleTypes();

  // Populate form when tier data is loaded
  useEffect(() => {
    if (tierData && isOpen) {
      form.reset({
        name: tierData.name,
        baseFare: tierData.baseFare,
        minimumFare: tierData.minimumFare,
        perMinuteRate: tierData.perMinuteRate,
        perKmRate: tierData.perKmRate,
        imageUrl: (tierData as any).imageUrl || '',
        tierMultiplier: tierData.tierMultiplier,
        surgeMultiplier: tierData.surgeMultiplier,
        demandMultiplier: tierData.demandMultiplier,
        luxuryMultiplier: tierData.luxuryMultiplier,
        comfortMultiplier: tierData.comfortMultiplier,
        minPassengers: tierData.minPassengers,
        maxPassengers: tierData.maxPassengers,
        isActive: tierData.isActive,
        priority: tierData.priority,
        vehicleTypeIds: (tierData as any).vehicleTypeIds || (tierData as any).vehicleTypes?.map((vt: any) => vt.id) || [],
      });
    }
  }, [tierData, isOpen, form]);


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

  const formatCurrencyInput = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  const parseCurrencyInput = (value: string) => {
    return Math.round(parseFloat(value) * 100);
  };

  if (isLoadingTier && tierId) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Nivel de Tarifa" size="xl">
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
      size="xl"
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
                step="1"
                {...form.register('priority', { valueAsNumber: true })}
                placeholder="1"
              />
              {form.formState.errors.priority && (
                <p className="text-sm text-red-600">{form.formState.errors.priority.message}</p>
              )}
            </div>
          </div>


          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de Imagen</Label>
            <Input
              id="imageUrl"
              type="url"
              {...form.register('imageUrl')}
              placeholder="https://example.com/tier-image.png"
            />
            {form.formState.errors.imageUrl && (
              <p className="text-sm text-red-600">{form.formState.errors.imageUrl.message}</p>
            )}
            <p className="text-sm text-gray-500">
              URL opcional para mostrar una imagen representativa del nivel de tarifa
            </p>
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
              <Label htmlFor="perKmRate">Por Kilómetro (USD)</Label>
              <Input
                id="perKmRate"
                type="number"
                step="0.01"
                min="0"
                {...form.register('perKmRate', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : 0
                })}
                placeholder="0.80"
              />
              {form.formState.errors.perKmRate && (
                <p className="text-sm text-red-600">{form.formState.errors.perKmRate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumFare">Tarifa Mínima (USD) *</Label>
              <Input
                id="minimumFare"
                type="number"
                step="0.01"
                min="0"
                {...form.register('minimumFare', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : 0
                })}
                placeholder="2.00"
              />
              {form.formState.errors.minimumFare && (
                <p className="text-sm text-red-600">{form.formState.errors.minimumFare.message}</p>
              )}
              <p className="text-sm text-gray-500">
                La tarifa mínima garantizada (debe ser ≤ tarifa base)
              </p>
            </div>


          </div>
        </div>

        {/* Price Examples */}
        <PriceExamples
          baseFare={form.watch('baseFare') || 0}
          perKmRate={form.watch('perKmRate') || 0}
          perMinuteRate={form.watch('perMinuteRate') || 0}
          tierMultiplier={form.watch('tierMultiplier') || 1.0}
          surgeMultiplier={form.watch('surgeMultiplier') || 1.0}
          demandMultiplier={form.watch('demandMultiplier') || 1.0}
          minimumFare={form.watch('minimumFare') || 0}
        />

        {/* Multipliers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Multiplicadores</h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tierMultiplier">Multiplicador Base</Label>
              <Input
                id="tierMultiplier"
                type="number"
                step="0.1"
                min="0.1"
                max="10.0"
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
                min="0.1"
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
                min="0.1"
                max="10.0"
                {...form.register('demandMultiplier', { valueAsNumber: true })}
                placeholder="1.0"
              />
              {form.formState.errors.demandMultiplier && (
                <p className="text-sm text-red-600">{form.formState.errors.demandMultiplier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="luxuryMultiplier">Multiplicador de Lujo (opcional)</Label>
              <Input
                id="luxuryMultiplier"
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                {...form.register('luxuryMultiplier', { valueAsNumber: true })}
                placeholder="1.0"
              />
              {form.formState.errors.luxuryMultiplier && (
                <p className="text-sm text-red-600">{form.formState.errors.luxuryMultiplier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comfortMultiplier">Multiplicador de Confort (opcional)</Label>
              <Input
                id="comfortMultiplier"
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                {...form.register('comfortMultiplier', { valueAsNumber: true })}
                placeholder="1.0"
              />
              {form.formState.errors.comfortMultiplier && (
                <p className="text-sm text-red-600">{form.formState.errors.comfortMultiplier.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tipos de Vehículo</h3>
          <div className="space-y-2">
            <Label>Selecciona los tipos de vehículo aplicables para este nivel (opcional)</Label>
            {vehicleTypesData?.data ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vehicleTypesData.data.map((vehicleType) => {
                  const currentValue = form.watch('vehicleTypeIds') || [];
                  const isChecked = currentValue.includes(vehicleType.id);
                  return (
                    <div key={vehicleType.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`vehicleType-${vehicleType.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentValue = form.getValues('vehicleTypeIds') || [];
                          if (checked) {
                            form.setValue('vehicleTypeIds', [...currentValue, vehicleType.id]);
                          } else {
                            form.setValue('vehicleTypeIds', currentValue.filter(id => id !== vehicleType.id));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`vehicleType-${vehicleType.id}`}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <span className="text-lg">{vehicleType.icon}</span>
                        <span>{vehicleType.displayName}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Cargando tipos de vehículo...</div>
            )}
            {form.formState.errors.vehicleTypeIds && (
              <p className="text-sm text-red-600">{form.formState.errors.vehicleTypeIds.message}</p>
            )}
          </div>
        </div>

        {/* Passengers Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración de Pasajeros</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPassengers">Mínimo de Pasajeros</Label>
              <Input
                id="minPassengers"
                type="number"
                min="1"
                max="8"
                step="1"
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
                step="1"
                {...form.register('maxPassengers', { valueAsNumber: true })}
                placeholder="4"
              />
              {form.formState.errors.maxPassengers && (
                <p className="text-sm text-red-600">{form.formState.errors.maxPassengers.message}</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default RideTiersEditModal;
