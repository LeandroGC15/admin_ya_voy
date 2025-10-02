'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useCreateCity, useStates, useState } from '../../hooks/use-geography';
import { createCitySchema } from '../../schemas/geography.schemas';
import type { CreateCityInput } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface CitiesCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultStateId?: number;
}

export function CitiesCreateModal({ isOpen, onClose, onSuccess, defaultStateId }: CitiesCreateModalProps) {
  const form = useForm<CreateCityInput>({
    resolver: zodResolver(createCitySchema),
    defaultValues: {
      name: '',
      stateId: defaultStateId || 0,
      latitude: 0,
      longitude: 0,
      timezone: '',
      isActive: true,
      pricingMultiplier: undefined,
      serviceFee: undefined,
      serviceRadius: undefined,
      population: undefined,
      areaKm2: undefined,
      elevation: undefined,
      postalCodes: [],
      restrictedAreas: [],
      premiumZones: [],
      boundaries: undefined,
    },
  });

  const createCityMutation = useCreateCity();
  const { data: statesData } = useStates({ limit: 100, isActive: true });
  const { data: defaultState } = useState(defaultStateId || 0);

  // Auto-fill form when defaultStateId changes
  useEffect(() => {
    if (defaultStateId && defaultState) {
      form.setValue('stateId', defaultStateId);
      // Optionally set timezone and coordinates from state
      if (defaultState.timezone) {
        form.setValue('timezone', defaultState.timezone);
      }
      if (defaultState.latitude) {
        form.setValue('latitude', defaultState.latitude);
      }
      if (defaultState.longitude) {
        form.setValue('longitude', defaultState.longitude);
      }
    }
  }, [defaultStateId, defaultState, form]);

  const handleSubmit = (data: CreateCityInput) => {
    createCityMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onClose();
        invalidateQueries(['geography']);
        onSuccess?.();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nueva Ciudad"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={createCityMutation.isPending}
          >
            {createCityMutation.isPending ? 'Creando...' : 'Crear Ciudad'}
          </Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Nombre de la Ciudad *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Ej: Bogotá"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="stateId">Estado *</Label>
            {defaultStateId ? (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                <span className="text-sm font-medium">{defaultState?.name}</span>
                <span className="text-xs text-gray-500">({defaultState?.code})</span>
              </div>
            ) : (
              <Select
                value={form.watch('stateId')?.toString()}
                onValueChange={(value) => form.setValue('stateId', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statesData?.states?.map((state) => (
                    <SelectItem key={state.id} value={state.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{state.name}</span>
                        <span className="text-xs text-gray-500">({state.code}) - {state.country?.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.stateId && (
              <p className="text-sm text-red-500">{form.formState.errors.stateId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="latitude">Latitud *</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              {...form.register('latitude', { valueAsNumber: true })}
              placeholder="Ej: 4.7110"
            />
            {form.formState.errors.latitude && (
              <p className="text-sm text-red-500">{form.formState.errors.latitude.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="longitude">Longitud *</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              {...form.register('longitude', { valueAsNumber: true })}
              placeholder="Ej: -74.0721"
            />
            {form.formState.errors.longitude && (
              <p className="text-sm text-red-500">{form.formState.errors.longitude.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="timezone">Zona Horaria</Label>
            <Input
              id="timezone"
              {...form.register('timezone')}
              placeholder="Ej: America/Bogota"
            />
            {form.formState.errors.timezone && (
              <p className="text-sm text-red-500">{form.formState.errors.timezone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="elevation">Elevación (m)</Label>
            <Input
              id="elevation"
              type="number"
              {...form.register('elevation', { valueAsNumber: true })}
              placeholder="Ej: 2640"
            />
            {form.formState.errors.elevation && (
              <p className="text-sm text-red-500">{form.formState.errors.elevation.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="population">Población</Label>
            <Input
              id="population"
              type="number"
              {...form.register('population', { valueAsNumber: true })}
              placeholder="Ej: 7181000"
            />
            {form.formState.errors.population && (
              <p className="text-sm text-red-500">{form.formState.errors.population.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="areaKm2">Área (km²)</Label>
            <Input
              id="areaKm2"
              type="number"
              {...form.register('areaKm2', { valueAsNumber: true })}
              placeholder="Ej: 1775"
            />
            {form.formState.errors.areaKm2 && (
              <p className="text-sm text-red-500">{form.formState.errors.areaKm2.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pricingMultiplier">Multiplicador de Precios</Label>
            <Input
              id="pricingMultiplier"
              type="number"
              step="0.01"
              {...form.register('pricingMultiplier', { valueAsNumber: true })}
              placeholder="Ej: 1.1"
            />
            {form.formState.errors.pricingMultiplier && (
              <p className="text-sm text-red-500">{form.formState.errors.pricingMultiplier.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="serviceFee">Tarifa de Servicio</Label>
            <Input
              id="serviceFee"
              type="number"
              step="0.01"
              {...form.register('serviceFee', { valueAsNumber: true })}
              placeholder="Ej: 2.50"
            />
            {form.formState.errors.serviceFee && (
              <p className="text-sm text-red-500">{form.formState.errors.serviceFee.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="serviceRadius">Radio de Servicio (km)</Label>
            <Input
              id="serviceRadius"
              type="number"
              step="0.01"
              {...form.register('serviceRadius', { valueAsNumber: true })}
              placeholder="Ej: 50.0"
            />
            {form.formState.errors.serviceRadius && (
              <p className="text-sm text-red-500">{form.formState.errors.serviceRadius.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="postalCodes">Códigos Postales (separados por coma)</Label>
            <Input
              id="postalCodes"
              {...form.register('postalCodes')}
              placeholder="Ej: 110111, 110211"
              onChange={(e) => {
                const value = e.target.value;
                form.setValue('postalCodes', value ? value.split(',').map(s => s.trim()) : []);
              }}
            />
            {form.formState.errors.postalCodes && (
              <p className="text-sm text-red-500">{form.formState.errors.postalCodes.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="restrictedAreas">Áreas Restringidas (separadas por coma)</Label>
            <Textarea
              id="restrictedAreas"
              {...form.register('restrictedAreas')}
              placeholder="Ej: zona_militar, aeropuerto"
              rows={2}
              onChange={(e) => {
                const value = e.target.value;
                form.setValue('restrictedAreas', value ? value.split(',').map(s => s.trim()) : []);
              }}
            />
            {form.formState.errors.restrictedAreas && (
              <p className="text-sm text-red-500">{form.formState.errors.restrictedAreas.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="premiumZones">Zonas Premium (separadas por coma)</Label>
            <Textarea
              id="premiumZones"
              {...form.register('premiumZones')}
              placeholder="Ej: zona_financiera, aeropuerto"
              rows={2}
              onChange={(e) => {
                const value = e.target.value;
                form.setValue('premiumZones', value ? value.split(',').map(s => s.trim()) : []);
              }}
            />
            {form.formState.errors.premiumZones && (
              <p className="text-sm text-red-500">{form.formState.errors.premiumZones.message}</p>
            )}
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', !!checked)}
            />
            <Label htmlFor="isActive">Ciudad activa</Label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CitiesCreateModal;
