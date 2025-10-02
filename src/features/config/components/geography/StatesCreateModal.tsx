'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useCreateState, useCountries, useCountry } from '../../hooks/use-geography';
import { createStateSchema } from '../../schemas/geography.schemas';
import type { CreateStateInput } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface StatesCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCountryId?: number;
}

export function StatesCreateModal({ isOpen, onClose, onSuccess, defaultCountryId }: StatesCreateModalProps) {
  const form = useForm<CreateStateInput>({
    resolver: zodResolver(createStateSchema),
    defaultValues: {
      name: '',
      code: '',
      countryId: defaultCountryId || 0,
      latitude: undefined,
      longitude: undefined,
      timezone: '',
      isActive: true,
      pricingMultiplier: undefined,
      serviceFee: undefined,
      capital: '',
      population: undefined,
      areaKm2: undefined,
    },
  });

  const createStateMutation = useCreateState();
  const { data: countriesData } = useCountries({ limit: 100, isActive: true });
  const { data: defaultCountry } = useCountry(defaultCountryId || 0);

  // Auto-fill form when defaultCountryId changes
  useEffect(() => {
    if (defaultCountryId && defaultCountry) {
      form.setValue('countryId', defaultCountryId);
      // Optionally set timezone from country
      if (defaultCountry.timezone) {
        form.setValue('timezone', defaultCountry.timezone);
      }
    }
  }, [defaultCountryId, defaultCountry, form]);

  const handleSubmit = (data: CreateStateInput) => {
    createStateMutation.mutate(data, {
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
      title="Crear Nuevo Estado"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={createStateMutation.isPending}
          >
            {createStateMutation.isPending ? 'Creando...' : 'Crear Estado'}
          </Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Nombre del Estado *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Ej: Cundinamarca"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="code">Código del Estado *</Label>
            <Input
              id="code"
              {...form.register('code')}
              placeholder="Ej: CUN"
              maxLength={10}
              className="uppercase"
            />
            {form.formState.errors.code && (
              <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="countryId">País *</Label>
            <Select
              value={form.watch('countryId')?.toString()}
              onValueChange={(value) => form.setValue('countryId', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>
              <SelectContent>
                {countriesData?.countries?.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    <div className="flex items-center gap-2">
                      {country.flag && <span>{country.flag}</span>}
                      <span>{country.name}</span>
                      <span className="text-xs text-gray-500">({country.isoCode2})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.countryId && (
              <p className="text-sm text-red-500">{form.formState.errors.countryId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="capital">Capital</Label>
            <Input
              id="capital"
              {...form.register('capital')}
              placeholder="Ej: Bogotá"
            />
            {form.formState.errors.capital && (
              <p className="text-sm text-red-500">{form.formState.errors.capital.message}</p>
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
            <Label htmlFor="population">Población</Label>
            <Input
              id="population"
              type="number"
              {...form.register('population', { valueAsNumber: true })}
              placeholder="Ej: 2800000"
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
              placeholder="Ej: 24117"
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
              placeholder="Ej: 1.2"
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
              placeholder="Ej: 5.00"
            />
            {form.formState.errors.serviceFee && (
              <p className="text-sm text-red-500">{form.formState.errors.serviceFee.message}</p>
            )}
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', !!checked)}
            />
            <Label htmlFor="isActive">Estado activo</Label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default StatesCreateModal;
