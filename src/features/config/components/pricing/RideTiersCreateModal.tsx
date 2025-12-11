'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useCreateRideTier, useVehicleTypes } from '../../hooks';
import { createRideTierSchema } from '../../schemas/pricing.schemas';
import type { CreateRideTierInput } from '../../schemas/pricing.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { invalidateQueries } from '@/lib/api/react-query-client';
import { PriceExamples } from './PriceExamples';
import { TierImageUpload } from './TierImageUpload';

interface RideTiersCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RideTiersCreateModal({ isOpen, onClose, onSuccess }: RideTiersCreateModalProps) {
  const form = useForm<CreateRideTierInput>({
    resolver: zodResolver(createRideTierSchema),
    defaultValues: {
      name: '',
      baseFare: 0, // USD (se convierte a centavos) - puede ser 0
      minimunFare: 0, // USD (se convierte a centavos)
      perMinuteRate: 0, // USD (se convierte a centavos) - puede ser 0
      perKmRate: 0.50, // USD (se convierte a centavos) - ejemplo
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

  const createRideTierMutation = useCreateRideTier();

  // Vehicle types data
  const { data: vehicleTypesData } = useVehicleTypes();

  const handleSubmit = (data: CreateRideTierInput) => {
    createRideTierMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onClose();
        invalidateQueries(['pricing']);
        onSuccess?.();
      },
    });
  };

  const formatCurrencyInput = (value: number) => {
    return (value / 100).toFixed(2);
  };

  const parseCurrencyInput = (value: string) => {
    return Math.round(parseFloat(value) * 100);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Nivel de Tarifa"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={createRideTierMutation.isPending}
          >
            {createRideTierMutation.isPending ? 'Creando...' : 'Crear Nivel'}
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
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              {...form.register('description')}
              placeholder="Descripción del tier que se mostrará en la app (opcional)"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
              maxLength={500}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {form.watch('description')?.length || 0}/500 caracteres
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              {...form.register('isActive')}
              defaultChecked={true}
            />
            <Label htmlFor="isActive">Activo</Label>
          </div>
        </div>

        {/* Tier Image Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Imagen del Tier</h3>
          <TierImageUpload
            currentImageUrl={form.watch('imageUrl')}
            onImageUploaded={(imageUrl) => {
              form.setValue('imageUrl', imageUrl);
            }}
            onImageRemoved={() => {
              form.setValue('imageUrl', '');
            }}
          />
          <p className="text-sm text-gray-500">
            Nota: Debes guardar el tier primero antes de poder subir una imagen.
          </p>
        </div>

        {/* Pricing Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración de Precios</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseFare">Tarifa Base (USD) *</Label>
              <Input
                id="baseFare"
                type="number"
                step="0.01"
                min="0"
                {...form.register('baseFare', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : 0
                })}
                placeholder="0.00 o 2.50"
              />
              {form.formState.errors.baseFare && (
                <p className="text-sm text-red-600">{form.formState.errors.baseFare.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perMinuteRate">Por Minuto (USD) *</Label>
              <Input
                id="perMinuteRate"
                type="number"
                step="0.01"
                min="0"
                {...form.register('perMinuteRate', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : 0
                })}
                placeholder="0.00 o 0.15"
              />
              {form.formState.errors.perMinuteRate && (
                <p className="text-sm text-red-600">{form.formState.errors.perMinuteRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="perKmRate">Por Kilómetro (USD) *</Label>
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
              <Label htmlFor="minimunFare">Tarifa Mínima (USD) *</Label>
              <Input
                id="minimunFare"
                type="number"
                step="0.01"
                min="0"
                {...form.register('minimunFare', {
                  setValueAs: (value) => value ? parseCurrencyInput(value) : 0
                })}
                placeholder="0.00 o 2.00"
              />
              {form.formState.errors.minimunFare && (
                <p className="text-sm text-red-600">{form.formState.errors.minimunFare.message}</p>
              )}
              <p className="text-sm text-gray-500">
                La tarifa mínima garantizada. Si la tarifa base es 0, puede ser cualquier valor ≥ 0. Si la tarifa base es mayor a 0, debe ser ≤ tarifa base.
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
          minimumFare={form.watch('minimunFare') || 0}
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
                {vehicleTypesData.data.map((vehicleType) => (
                  <div key={vehicleType.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vehicleType-${vehicleType.id}`}
                      value={vehicleType.id}
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
                ))}
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

export default RideTiersCreateModal;
