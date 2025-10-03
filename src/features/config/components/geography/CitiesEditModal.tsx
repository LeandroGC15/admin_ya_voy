'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useUpdateCity } from '../../hooks/use-geography';
import { updateCitySchema } from '../../schemas/geography.schemas';
import type { UpdateCityInput, City } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface CitiesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: City | null;
  onSuccess?: () => void;
}

export function CitiesEditModal({ isOpen, onClose, city, onSuccess }: CitiesEditModalProps) {
  const form = useForm<UpdateCityInput>({
    resolver: zodResolver(updateCitySchema),
    defaultValues: {
      name: '',
      stateId: 0,
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

  const updateCityMutation = useUpdateCity();

  // Reset form when city changes
  useEffect(() => {
    if (city) {
      form.reset({
        name: city.name,
        stateId: city.stateId,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone,
        isActive: city.isActive,
        pricingMultiplier: city.pricingMultiplier,
        serviceFee: city.serviceFee,
        serviceRadius: city.serviceRadius,
        population: city.population,
        areaKm2: city.areaKm2,
        elevation: city.elevation,
        postalCodes: city.postalCodes,
        restrictedAreas: city.restrictedAreas,
        premiumZones: city.premiumZones,
        boundaries: city.boundaries,
      });
    }
  }, [city, form]);

  const handleSubmit = (data: UpdateCityInput) => {
    if (!city) return;

    updateCityMutation.mutate(
      { id: city.id, data },
      {
        onSuccess: () => {
          onClose();
          invalidateQueries(['geography']);
          onSuccess?.();
        },
      }
    );
  };

  if (!city) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Ciudad: ${city.name}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={updateCityMutation.isPending}
          >
            {updateCityMutation.isPending ? 'Actualizando...' : 'Actualizar Ciudad'}
          </Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Nombre de la Ciudad</Label>
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
            <Label htmlFor="stateId">Estado</Label>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
              <span className="text-sm font-medium">{city?.state?.name}</span>
              <span className="text-xs text-gray-500">({city?.state?.code})</span>
            </div>
            {form.formState.errors.stateId && (
              <p className="text-sm text-red-500">{form.formState.errors.stateId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="latitude">Latitud</Label>
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
            <Label htmlFor="longitude">Longitud</Label>
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
              value={form.watch('postalCodes')?.join(', ') || ''}
              onChange={(e) => {
                const value = e.target.value;
                form.setValue('postalCodes', value ? value.split(',').map(s => s.trim()) : []);
              }}
              placeholder="Ej: 110111, 110211"
            />
            {form.formState.errors.postalCodes && (
              <p className="text-sm text-red-500">{form.formState.errors.postalCodes.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="restrictedAreas">Áreas Restringidas (separadas por coma)</Label>
            <Textarea
              id="restrictedAreas"
              value={form.watch('restrictedAreas')?.join(', ') || ''}
              onChange={(e) => {
                const value = e.target.value;
                form.setValue('restrictedAreas', value ? value.split(',').map(s => s.trim()) : []);
              }}
              placeholder="Ej: zona_militar, aeropuerto"
              rows={2}
            />
            {form.formState.errors.restrictedAreas && (
              <p className="text-sm text-red-500">{form.formState.errors.restrictedAreas.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="premiumZones">Zonas Premium (separadas por coma)</Label>
            <Textarea
              id="premiumZones"
              value={form.watch('premiumZones')?.join(', ') || ''}
              onChange={(e) => {
                const value = e.target.value;
                form.setValue('premiumZones', value ? value.split(',').map(s => s.trim()) : []);
              }}
              placeholder="Ej: zona_financiera, aeropuerto"
              rows={2}
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

export default CitiesEditModal;
