'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useCreateCountry } from '../../hooks/use-geography';
import { createCountrySchema } from '../../schemas/geography.schemas';
import type { CreateCountryInput } from '../../schemas/geography.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface CountriesCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const continentOptions = [
  { value: 'africa', label: 'África' },
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europa' },
  { value: 'north_america', label: 'América del Norte' },
  { value: 'south_america', label: 'América del Sur' },
  { value: 'oceania', label: 'Oceanía' },
  { value: 'antarctica', label: 'Antártida' },
];

const timezoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
];

export function CountriesCreateModal({ isOpen, onClose, onSuccess }: CountriesCreateModalProps) {
  const form = useForm<CreateCountryInput>({
    resolver: zodResolver(createCountrySchema),
    defaultValues: {
      name: '',
      isoCode2: '',
      isoCode3: '',
      numericCode: undefined,
      phoneCode: '',
      currencyCode: '',
      currencyName: '',
      currencySymbol: '',
      timezone: 'UTC',
      continent: 'africa',
      region: '',
      subregion: '',
      vatRate: undefined,
      corporateTaxRate: undefined,
      incomeTaxRate: undefined,
      isActive: true,
      requiresVerification: false,
      supportedLanguages: [],
      flag: '',
      capital: '',
      population: undefined,
      areaKm2: undefined,
    },
  });

  const createCountryMutation = useCreateCountry();

  const handleSubmit = (data: CreateCountryInput) => {
    createCountryMutation.mutate(data, {
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
      title="Crear Nuevo País"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={createCountryMutation.isPending}
          >
            {createCountryMutation.isPending ? 'Creando...' : 'Crear País'}
          </Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Nombre del País *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Ej: República de Colombia"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="isoCode2">Código ISO 2 *</Label>
            <Input
              id="isoCode2"
              {...form.register('isoCode2')}
              placeholder="Ej: CO"
              maxLength={2}
              className="uppercase"
            />
            {form.formState.errors.isoCode2 && (
              <p className="text-sm text-red-500">{form.formState.errors.isoCode2.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="isoCode3">Código ISO 3</Label>
            <Input
              id="isoCode3"
              {...form.register('isoCode3')}
              placeholder="Ej: COL"
              maxLength={3}
              className="uppercase"
            />
            {form.formState.errors.isoCode3 && (
              <p className="text-sm text-red-500">{form.formState.errors.isoCode3.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="numericCode">Código Numérico</Label>
            <Input
              id="numericCode"
              type="number"
              {...form.register('numericCode', { valueAsNumber: true })}
              placeholder="Ej: 170"
            />
            {form.formState.errors.numericCode && (
              <p className="text-sm text-red-500">{form.formState.errors.numericCode.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phoneCode">Código Telefónico</Label>
            <Input
              id="phoneCode"
              {...form.register('phoneCode')}
              placeholder="Ej: +57"
            />
            {form.formState.errors.phoneCode && (
              <p className="text-sm text-red-500">{form.formState.errors.phoneCode.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="continent">Continente *</Label>
            <Select
              value={form.watch('continent')}
              onValueChange={(value) => form.setValue('continent', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {continentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.continent && (
              <p className="text-sm text-red-500">{form.formState.errors.continent.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="region">Región</Label>
            <Input
              id="region"
              {...form.register('region')}
              placeholder="Ej: América Latina"
            />
            {form.formState.errors.region && (
              <p className="text-sm text-red-500">{form.formState.errors.region.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="subregion">Subregión</Label>
            <Input
              id="subregion"
              {...form.register('subregion')}
              placeholder="Ej: Norte de Sudamérica"
            />
            {form.formState.errors.subregion && (
              <p className="text-sm text-red-500">{form.formState.errors.subregion.message}</p>
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
            <Label htmlFor="timezone">Zona Horaria *</Label>
            <Select
              value={form.watch('timezone')}
              onValueChange={(value) => form.setValue('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.timezone && (
              <p className="text-sm text-red-500">{form.formState.errors.timezone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="currencyCode">Código de Moneda *</Label>
            <Input
              id="currencyCode"
              {...form.register('currencyCode')}
              placeholder="Ej: COP"
              maxLength={3}
              className="uppercase"
            />
            {form.formState.errors.currencyCode && (
              <p className="text-sm text-red-500">{form.formState.errors.currencyCode.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="currencyName">Nombre de Moneda</Label>
            <Input
              id="currencyName"
              {...form.register('currencyName')}
              placeholder="Ej: Peso Colombiano"
            />
            {form.formState.errors.currencyName && (
              <p className="text-sm text-red-500">{form.formState.errors.currencyName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="currencySymbol">Símbolo de Moneda</Label>
            <Input
              id="currencySymbol"
              {...form.register('currencySymbol')}
              placeholder="Ej: $"
            />
            {form.formState.errors.currencySymbol && (
              <p className="text-sm text-red-500">{form.formState.errors.currencySymbol.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="population">Población</Label>
            <Input
              id="population"
              type="number"
              {...form.register('population', { valueAsNumber: true })}
              placeholder="Ej: 50880000"
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
              placeholder="Ej: 1141748"
            />
            {form.formState.errors.areaKm2 && (
              <p className="text-sm text-red-500">{form.formState.errors.areaKm2.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="vatRate">Tasa IVA (%)</Label>
            <Input
              id="vatRate"
              type="number"
              step="0.01"
              {...form.register('vatRate', { valueAsNumber: true })}
              placeholder="Ej: 19.0"
            />
            {form.formState.errors.vatRate && (
              <p className="text-sm text-red-500">{form.formState.errors.vatRate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="corporateTaxRate">Tasa Impuesto Corporativo (%)</Label>
            <Input
              id="corporateTaxRate"
              type="number"
              step="0.01"
              {...form.register('corporateTaxRate', { valueAsNumber: true })}
              placeholder="Ej: 35.0"
            />
            {form.formState.errors.corporateTaxRate && (
              <p className="text-sm text-red-500">{form.formState.errors.corporateTaxRate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="incomeTaxRate">Tasa Impuesto Renta (%)</Label>
            <Input
              id="incomeTaxRate"
              type="number"
              step="0.01"
              {...form.register('incomeTaxRate', { valueAsNumber: true })}
              placeholder="Ej: 39.0"
            />
            {form.formState.errors.incomeTaxRate && (
              <p className="text-sm text-red-500">{form.formState.errors.incomeTaxRate.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="supportedLanguages">Idiomas Soportados (separados por coma)</Label>
            <Input
              id="supportedLanguages"
              {...form.register('supportedLanguages')}
              placeholder="Ej: es, en"
              onChange={(e) => {
                const value = e.target.value;
                form.setValue('supportedLanguages', value ? value.split(',').map(s => s.trim()) : []);
              }}
            />
            {form.formState.errors.supportedLanguages && (
              <p className="text-sm text-red-500">{form.formState.errors.supportedLanguages.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="flag">Bandera (Emoji)</Label>
            <Input
              id="flag"
              {...form.register('flag')}
              placeholder="Ej: 🇨🇴"
            />
            {form.formState.errors.flag && (
              <p className="text-sm text-red-500">{form.formState.errors.flag.message}</p>
            )}
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', !!checked)}
            />
            <Label htmlFor="isActive">País activo</Label>
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              id="requiresVerification"
              checked={form.watch('requiresVerification')}
              onCheckedChange={(checked) => form.setValue('requiresVerification', !!checked)}
            />
            <Label htmlFor="requiresVerification">Requiere verificación</Label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CountriesCreateModal;
